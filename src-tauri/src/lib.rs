use lopdf::{decode_text_string, Document, Object, ObjectId};
use reqwest::{Client, Method, StatusCode};
use roxmltree::Document as XmlDocument;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::HashSet,
    fs::{self, File},
    io::{Read, Write},
    path::{Component, Path, PathBuf},
    time::UNIX_EPOCH,
};
use walkdir::WalkDir;
use zip::ZipArchive;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Book {
    id: String,
    path: String,
    title: String,
    authors: Vec<String>,
    series: Option<String>,
    series_index: Option<f64>,
    format: String,
    size_bytes: u64,
    modified: u64,
    cover_status: String,
    metadata_status: String,
    warnings: Vec<String>,
    eligible: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SyncItem {
    source: String,
    relative_path: String,
    book_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SyncReport {
    copied: usize,
    skipped: usize,
    total: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Highlight {
    id: String,
    book: String,
    quote: String,
    note: String,
    location: String,
    created: String,
}

#[tauri::command]
fn scan_library(root: String) -> Result<Vec<Book>, String> {
    let root_path = Path::new(&root);
    if !root_path.is_dir() {
        return Err("The selected library folder is unavailable. Reconnect the drive or choose another folder.".into());
    }
    let mut books = Vec::new();
    let mut canonical_paths = HashSet::new();
    for entry in WalkDir::new(root_path)
        .follow_links(false)
        .into_iter()
        .filter_map(Result::ok)
    {
        if !entry.file_type().is_file() {
            continue;
        }
        let path = entry.path();
        let extension = path
            .extension()
            .and_then(|value| value.to_str())
            .unwrap_or("")
            .to_ascii_lowercase();
        if extension != "epub" && extension != "pdf" {
            continue;
        }
        let canonical = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
        if !canonical_paths.insert(canonical.clone()) {
            continue;
        }
        books.push(inspect_book(&canonical, &extension));
    }
    books.sort_by(|left, right| {
        left.title
            .to_lowercase()
            .cmp(&right.title.to_lowercase())
            .then(left.path.cmp(&right.path))
    });
    Ok(books)
}

fn inspect_book(path: &Path, extension: &str) -> Book {
    let metadata = fs::metadata(path).ok();
    let size_bytes = metadata.as_ref().map(|value| value.len()).unwrap_or(0);
    let modified = metadata
        .and_then(|value| value.modified().ok())
        .and_then(|value| value.duration_since(UNIX_EPOCH).ok())
        .map(|value| value.as_millis() as u64)
        .unwrap_or(0);
    let fallback = path
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("Untitled")
        .replace(['_', '-'], " ")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    let id = hex::encode(Sha256::digest(path.to_string_lossy().as_bytes()));
    let (title, authors, series, series_index, cover_status, warnings, eligible) =
        if extension == "epub" {
            inspect_epub(path, &fallback).unwrap_or_else(|error| {
                (
                    fallback.clone(),
                    vec![],
                    None,
                    None,
                    "missing".into(),
                    vec![error],
                    false,
                )
            })
        } else {
            inspect_pdf(path, &fallback).unwrap_or_else(|error| {
                (
                    fallback.clone(),
                    vec![],
                    None,
                    None,
                    "not-applicable".into(),
                    vec![error],
                    false,
                )
            })
        };
    let metadata_status = if !eligible {
        "warning"
    } else if authors.is_empty() || title == fallback {
        "inferred"
    } else {
        "valid"
    };
    Book {
        id,
        path: path.to_string_lossy().into_owned(),
        title,
        authors,
        series,
        series_index,
        format: extension.to_uppercase(),
        size_bytes,
        modified,
        cover_status,
        metadata_status: metadata_status.into(),
        warnings,
        eligible,
    }
}

type Inspection = (
    String,
    Vec<String>,
    Option<String>,
    Option<f64>,
    String,
    Vec<String>,
    bool,
);

fn inspect_epub(path: &Path, fallback: &str) -> Result<Inspection, String> {
    let file = File::open(path).map_err(|_| "File could not be read".to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|_| "Invalid EPUB package".to_string())?;
    if let Ok(encryption) = read_zip_entry(&mut archive, "META-INF/encryption.xml") {
        let has_drm = XmlDocument::parse(&encryption)
            .map(|xml| {
                xml.descendants()
                    .filter(|node| node.tag_name().name() == "EncryptionMethod")
                    .filter_map(|node| node.attribute("Algorithm"))
                    .any(|algorithm| {
                        algorithm != "http://www.idpf.org/2008/embedding"
                            && algorithm != "http://ns.adobe.com/pdf/enc#RC"
                    })
            })
            .unwrap_or(true);
        if has_drm {
            return Ok((
                fallback.into(),
                vec![],
                None,
                None,
                "missing".into(),
                vec!["Encrypted resources detected; only DRM-free books can be transferred".into()],
                false,
            ));
        }
    }
    let container = read_zip_entry(&mut archive, "META-INF/container.xml")
        .map_err(|_| "EPUB container metadata is missing".to_string())?;
    let container_xml = XmlDocument::parse(&container)
        .map_err(|_| "EPUB container metadata is invalid".to_string())?;
    let opf_path = container_xml
        .descendants()
        .find(|node| node.tag_name().name() == "rootfile")
        .and_then(|node| node.attribute("full-path"))
        .ok_or("EPUB package document is missing")?
        .to_string();
    let opf = read_zip_entry(&mut archive, &opf_path)
        .map_err(|_| "EPUB package document could not be read".to_string())?;
    let document =
        XmlDocument::parse(&opf).map_err(|_| "EPUB package document is invalid".to_string())?;
    let text = |name: &str| {
        document
            .descendants()
            .find(|node| node.tag_name().name() == name)
            .and_then(|node| node.text())
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string)
    };
    let title = text("title").unwrap_or_else(|| fallback.into());
    let authors = document
        .descendants()
        .filter(|node| node.tag_name().name() == "creator")
        .filter_map(|node| node.text())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
        .collect::<Vec<_>>();
    let mut series = None;
    let mut series_index = None;
    for node in document
        .descendants()
        .filter(|node| node.tag_name().name() == "meta")
    {
        let property = node.attribute("property").unwrap_or("");
        let name = node.attribute("name").unwrap_or("");
        if property.ends_with("belongs-to-collection")
            || name.eq_ignore_ascii_case("calibre:series")
        {
            series = node
                .text()
                .or_else(|| node.attribute("content"))
                .map(str::to_string);
        }
        if property.ends_with("group-position") || name.eq_ignore_ascii_case("calibre:series_index")
        {
            series_index = node
                .text()
                .or_else(|| node.attribute("content"))
                .and_then(|value| value.parse().ok());
        }
    }
    let cover_found = archive.file_names().any(|name| {
        let lower = name.to_ascii_lowercase();
        lower.contains("cover")
            && (lower.ends_with(".jpg")
                || lower.ends_with(".jpeg")
                || lower.ends_with(".png")
                || lower.ends_with(".webp"))
    });
    let mut warnings = Vec::new();
    if title == fallback {
        warnings.push("Title inferred from filename".into());
    }
    if authors.is_empty() {
        warnings.push("Author metadata is missing".into());
    }
    if !cover_found {
        warnings.push("Cover image is missing or not labelled".into());
    }
    Ok((
        title,
        authors,
        series,
        series_index,
        if cover_found { "found" } else { "missing" }.into(),
        warnings,
        true,
    ))
}

fn read_zip_entry(archive: &mut ZipArchive<File>, name: &str) -> Result<String, std::io::Error> {
    let mut value = String::new();
    archive.by_name(name)?.read_to_string(&mut value)?;
    Ok(value)
}

fn inspect_pdf(path: &Path, fallback: &str) -> Result<Inspection, String> {
    let document = Document::load(path).map_err(|_| "Invalid or unreadable PDF".to_string())?;
    if document.is_encrypted() {
        return Ok((
            fallback.into(),
            vec![],
            None,
            None,
            "not-applicable".into(),
            vec!["Password-protected PDF excluded; only DRM-free files can be transferred".into()],
            false,
        ));
    }
    let mut title = None;
    let mut author = None;
    if let Ok(info_ref) = document.trailer.get(b"Info").and_then(Object::as_reference) {
        if let Ok(info) = document.get_object(info_ref).and_then(Object::as_dict) {
            title = info.get(b"Title").ok().and_then(object_text);
            author = info.get(b"Author").ok().and_then(object_text);
        }
    }
    let inferred = title.as_deref().unwrap_or(fallback) == fallback;
    let mut warnings = Vec::new();
    if inferred {
        warnings.push("Title inferred from filename".into());
    }
    if author.is_none() {
        warnings.push("Author metadata is missing".into());
    }
    Ok((
        title.unwrap_or_else(|| fallback.into()),
        author.into_iter().collect(),
        None,
        None,
        "not-applicable".into(),
        warnings,
        true,
    ))
}

fn object_text(object: &Object) -> Option<String> {
    decode_text_string(object)
        .ok()
        .map(|text| text.trim_matches(['\0', '\u{feff}']).trim().to_string())
        .filter(|text| !text.is_empty())
}

fn validate_relative(path: &str) -> Result<PathBuf, String> {
    let value = Path::new(path);
    if value.is_absolute()
        || value
            .components()
            .any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err(
            "A planned device path was unsafe; transfer was stopped before copying.".into(),
        );
    }
    Ok(value.to_path_buf())
}

#[tauri::command]
fn sync_usb(destination: String, items: Vec<SyncItem>) -> Result<SyncReport, String> {
    let root = Path::new(&destination);
    if !root.is_dir() {
        return Err("The reader folder is unavailable. Reconnect the device and retry; completed files are safe.".into());
    }
    let mut copied = 0;
    let mut skipped = 0;
    let mut manifest = Vec::new();
    for item in &items {
        let source = Path::new(&item.source);
        if !source.is_file() {
            return Err(format!(
                "Source file disappeared before transfer: {}. Re-scan the library and retry.",
                item.source
            ));
        }
        let relative = validate_relative(&item.relative_path)?;
        let target = root.join(&relative);
        if target.exists() && same_file(source, &target).unwrap_or(false) {
            skipped += 1;
        } else {
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent).map_err(|_| "The reader disconnected while creating a collection folder. Reconnect and retry.".to_string())?;
            }
            let temporary = target.with_extension(format!(
                "{}.rsl-part",
                target
                    .extension()
                    .and_then(|value| value.to_str())
                    .unwrap_or("book")
            ));
            fs::copy(source, &temporary).map_err(|_| "The reader disconnected during a copy. The incomplete staging file will not replace a book; reconnect and retry.".to_string())?;
            if !same_file(source, &temporary).unwrap_or(false) {
                let _ = fs::remove_file(&temporary);
                return Err("A copied file failed verification. The incomplete copy was removed; retry with another cable or port.".into());
            }
            fs::rename(&temporary, &target).map_err(|_| {
                "The reader disconnected before a file could be finalized. Reconnect and retry."
                    .to_string()
            })?;
            copied += 1;
        }
        manifest.push(serde_json::json!({ "bookId": item.book_id, "path": item.relative_path, "sha256": hash_file(source).unwrap_or_default() }));
    }
    let manifest_dir = root.join(".reader-sideload-library");
    fs::create_dir_all(&manifest_dir)
        .map_err(|_| "Books copied, but the transfer manifest could not be created.".to_string())?;
    fs::write(
        manifest_dir.join("manifest.json"),
        serde_json::to_vec_pretty(&manifest).unwrap(),
    )
    .map_err(|_| "Books copied, but the transfer manifest could not be saved.".to_string())?;
    Ok(SyncReport {
        copied,
        skipped,
        total: items.len(),
    })
}

fn same_file(left: &Path, right: &Path) -> std::io::Result<bool> {
    if fs::metadata(left)?.len() != fs::metadata(right)?.len() {
        return Ok(false);
    }
    Ok(hash_file(left)? == hash_file(right)?)
}

fn hash_file(path: &Path) -> std::io::Result<String> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 64 * 1024];
    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }
    Ok(hex::encode(hasher.finalize()))
}

#[tauri::command]
async fn sync_webdav(
    endpoint: String,
    username: String,
    password: String,
    items: Vec<SyncItem>,
) -> Result<SyncReport, String> {
    if !endpoint.starts_with("https://")
        && !endpoint.starts_with("http://localhost")
        && !endpoint.starts_with("http://127.0.0.1")
    {
        return Err(
            "Use an HTTPS WebDAV address. Insecure HTTP is accepted only for a local server."
                .into(),
        );
    }
    let client = Client::new();
    let base = endpoint.trim_end_matches('/');
    let mut created = HashSet::new();
    for item in &items {
        let relative = validate_relative(&item.relative_path)?;
        if let Some(parent) = relative.parent() {
            let mut accumulated = String::new();
            for component in parent.components() {
                if !accumulated.is_empty() {
                    accumulated.push('/');
                }
                accumulated.push_str(&urlencoding::encode(
                    &component.as_os_str().to_string_lossy(),
                ));
                if created.insert(accumulated.clone()) {
                    let request = client.request(
                        Method::from_bytes(b"MKCOL").unwrap(),
                        format!("{base}/{accumulated}"),
                    );
                    let request = if username.is_empty() {
                        request
                    } else {
                        request.basic_auth(&username, Some(&password))
                    };
                    let status = request
                        .send()
                        .await
                        .map_err(|_| {
                            "Could not reach the WebDAV server. Check the address and connection."
                                .to_string()
                        })?
                        .status();
                    if !status.is_success() && status != StatusCode::METHOD_NOT_ALLOWED {
                        return Err(format!("WebDAV refused collection creation with status {status}. Check folder permissions."));
                    }
                }
            }
        }
        let bytes = fs::read(&item.source)
            .map_err(|_| format!("Source file could not be read: {}", item.source))?;
        let encoded = relative
            .components()
            .map(|component| {
                urlencoding::encode(&component.as_os_str().to_string_lossy()).into_owned()
            })
            .collect::<Vec<_>>()
            .join("/");
        let request = client
            .put(format!("{base}/{encoded}"))
            .header(
                "Content-Type",
                if item.source.to_lowercase().ends_with(".pdf") {
                    "application/pdf"
                } else {
                    "application/epub+zip"
                },
            )
            .body(bytes);
        let request = if username.is_empty() {
            request
        } else {
            request.basic_auth(&username, Some(&password))
        };
        let status = request.send().await.map_err(|_| "The WebDAV connection stopped during upload. Completed files are safe; retry to continue.".to_string())?.status();
        if !status.is_success() {
            return Err(format!(
                "WebDAV refused {} with status {status}. Check credentials and available space.",
                item.relative_path
            ));
        }
    }
    Ok(SyncReport {
        copied: items.len(),
        skipped: 0,
        total: items.len(),
    })
}

#[tauri::command]
fn import_highlights(path: String) -> Result<Vec<Highlight>, String> {
    let source = Path::new(&path);
    if !source.is_file() {
        return Err("The selected highlights file is unavailable.".into());
    }
    let extension = source
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    let fallback = source
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("Imported notes");
    if extension == "pdf" {
        return import_pdf_highlights(source, fallback);
    }
    let text = fs::read_to_string(source)
        .map_err(|_| "The highlights file is not readable text.".to_string())?;
    if extension == "json" {
        if let Ok(items) = serde_json::from_str::<Vec<Highlight>>(&text) {
            return Ok(items);
        }
        if let Ok(value) = serde_json::from_str::<serde_json::Value>(&text) {
            if let Some(items) = value.get("highlights").and_then(|value| value.as_array()) {
                return Ok(items
                    .iter()
                    .filter_map(|item| {
                        item.get("quote")
                            .and_then(|value| value.as_str())
                            .map(|quote| {
                                make_highlight(
                                    item.get("book")
                                        .and_then(|value| value.as_str())
                                        .unwrap_or(fallback),
                                    quote,
                                    item.get("note")
                                        .and_then(|value| value.as_str())
                                        .unwrap_or(""),
                                    item.get("location")
                                        .and_then(|value| value.as_str())
                                        .unwrap_or("Imported"),
                                    "",
                                )
                            })
                    })
                    .collect());
            }
        }
    }
    let parsed = parse_text_highlights(&text, fallback);
    if parsed.is_empty() {
        return Err(
            "No quoted highlights were found. Markdown quotes should start with “> ”.".into(),
        );
    }
    Ok(parsed)
}

fn parse_text_highlights(text: &str, fallback: &str) -> Vec<Highlight> {
    let mut book = fallback.to_string();
    let mut quote = Vec::new();
    let mut note = String::new();
    let mut output = Vec::new();
    let flush =
        |output: &mut Vec<Highlight>, quote: &mut Vec<String>, note: &mut String, book: &str| {
            if !quote.is_empty() {
                output.push(make_highlight(
                    book,
                    &quote.join("\n"),
                    note,
                    "Imported",
                    "",
                ));
                quote.clear();
                note.clear();
            }
        };
    for line in text.lines() {
        if let Some(value) = line.strip_prefix("## ") {
            flush(&mut output, &mut quote, &mut note, &book);
            book = value.trim().to_string();
        } else if let Some(value) = line.strip_prefix("> ") {
            quote.push(value.to_string());
        } else if let Some(value) = line.strip_prefix("**Note:**") {
            note = value.trim().to_string();
        } else if line.trim() == "---" {
            flush(&mut output, &mut quote, &mut note, &book);
        } else if line.contains("text = ") {
            if let Some(value) = lua_string_value(line) {
                quote.push(value);
            }
        } else if line.contains("note = ") {
            if let Some(value) = lua_string_value(line) {
                note = value;
            }
        }
    }
    flush(&mut output, &mut quote, &mut note, &book);
    output
}

fn lua_string_value(line: &str) -> Option<String> {
    let start = line.find('"')? + 1;
    let end = line.rfind('"')?;
    (end >= start).then(|| line[start..end].replace("\\n", "\n").replace("\\\"", "\""))
}

fn import_pdf_highlights(path: &Path, fallback: &str) -> Result<Vec<Highlight>, String> {
    let document = Document::load(path).map_err(|_| "The PDF could not be read.".to_string())?;
    if document.is_encrypted() {
        return Err("Password-protected PDF annotations cannot be imported.".into());
    }
    let mut output = Vec::new();
    for (page_number, page_id) in document.get_pages() {
        let page = match document.get_object(page_id).and_then(Object::as_dict) {
            Ok(page) => page,
            Err(_) => continue,
        };
        let annotations = match page.get(b"Annots") {
            Ok(Object::Array(values)) => values.clone(),
            Ok(Object::Reference(id)) => {
                match document.get_object(*id).and_then(Object::as_array) {
                    Ok(values) => values.clone(),
                    Err(_) => continue,
                }
            }
            _ => continue,
        };
        for annotation in annotations {
            let id: ObjectId = match annotation.as_reference() {
                Ok(id) => id,
                Err(_) => continue,
            };
            let dictionary = match document.get_object(id).and_then(Object::as_dict) {
                Ok(value) => value,
                Err(_) => continue,
            };
            let subtype = dictionary
                .get(b"Subtype")
                .ok()
                .and_then(|value| value.as_name().ok());
            if subtype != Some(b"Highlight") && subtype != Some(b"Underline") {
                continue;
            }
            let quote = dictionary
                .get(b"Contents")
                .ok()
                .and_then(object_text)
                .or_else(|| dictionary.get(b"RC").ok().and_then(object_text))
                .unwrap_or_else(|| "Highlighted passage (text not embedded in annotation)".into());
            let note = dictionary
                .get(b"T")
                .ok()
                .and_then(object_text)
                .unwrap_or_default();
            let created = dictionary
                .get(b"M")
                .ok()
                .and_then(object_text)
                .unwrap_or_default();
            output.push(make_highlight(
                fallback,
                &quote,
                &note,
                &format!("Page {page_number}"),
                &created,
            ));
        }
    }
    if output.is_empty() {
        return Err("No embedded PDF highlight annotations were found. Some readers keep notes in a separate sidecar file; import that Markdown, JSON, or KOReader file instead.".into());
    }
    Ok(output)
}

fn make_highlight(book: &str, quote: &str, note: &str, location: &str, created: &str) -> Highlight {
    let id = hex::encode(Sha256::digest(
        format!("{book}\0{quote}\0{location}\0{created}").as_bytes(),
    ));
    Highlight {
        id,
        book: book.into(),
        quote: quote.into(),
        note: note.into(),
        location: location.into(),
        created: created.into(),
    }
}

#[tauri::command]
fn write_text_file(path: String, contents: String) -> Result<(), String> {
    let target = Path::new(&path);
    if target
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.eq_ignore_ascii_case("md"))
        != Some(true)
    {
        return Err("Highlights export must use a .md filename.".into());
    }
    let mut file = File::create(target)
        .map_err(|_| "The Markdown destination could not be created.".to_string())?;
    file.write_all(contents.as_bytes())
        .map_err(|_| "The Markdown export could not be written.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_library,
            sync_usb,
            sync_webdav,
            import_highlights,
            write_text_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running Reader Sideload Library");
}

#[cfg(test)]
mod tests {
    use super::*;
    use lopdf::{dictionary, StringFormat};
    use tempfile::tempdir;

    #[test]
    fn rejects_parent_and_absolute_device_paths() {
        assert!(validate_relative("../escape.epub").is_err());
        assert!(validate_relative("/escape.epub").is_err());
        assert!(validate_relative("01 - Queue/001 - Book.epub").is_ok());
    }

    #[test]
    fn parses_markdown_and_koreader_style_notes() {
        let markdown = "## A Book\n\n> A quote\n\n**Note:** Keep it\n\n---";
        let parsed = parse_text_highlights(markdown, "Fallback");
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].book, "A Book");
        assert_eq!(parsed[0].note, "Keep it");
    }

    // @claim:verified-usb-copy
    #[test]
    fn claim_verified_usb_copy_is_idempotent() {
        let source_dir = tempdir().unwrap();
        let device_dir = tempdir().unwrap();
        let source = source_dir.path().join("book.epub");
        fs::write(&source, b"owned book bytes").unwrap();
        let make_items = || {
            vec![SyncItem {
                source: source.to_string_lossy().into_owned(),
                relative_path: "01 - Queue/001 - Book.epub".into(),
                book_id: "book-1".into(),
            }]
        };
        let first = sync_usb(
            device_dir.path().to_string_lossy().into_owned(),
            make_items(),
        )
        .unwrap();
        assert_eq!((first.copied, first.skipped), (1, 0));
        let second = sync_usb(
            device_dir.path().to_string_lossy().into_owned(),
            make_items(),
        )
        .unwrap();
        assert_eq!((second.copied, second.skipped), (0, 1));
        assert_eq!(
            fs::read(device_dir.path().join("01 - Queue/001 - Book.epub")).unwrap(),
            b"owned book bytes"
        );
        assert_eq!(fs::read(&source).unwrap(), b"owned book bytes");
        assert!(device_dir
            .path()
            .join(".reader-sideload-library/manifest.json")
            .is_file());
    }

    #[test]
    fn pdf_metadata_decodes_utf16_and_pdfdocencoding() {
        let utf16 = lopdf::text_string("Field Notes 03 — 秋");
        assert_eq!(object_text(&utf16).as_deref(), Some("Field Notes 03 — 秋"));

        let pdfdoc = Object::String(b"Field Notes \x8B".to_vec(), StringFormat::Literal);
        assert_eq!(object_text(&pdfdoc).as_deref(), Some("Field Notes ‰"));
    }

    // @claim:pdf-metadata
    #[test]
    fn claim_pdf_metadata_survives_scan() {
        let library = tempdir().unwrap();
        let path = library.path().join("field-notes.pdf");
        let mut document = Document::with_version("1.7");
        let info_id = document.add_object(dictionary! {
            "Title" => lopdf::text_string("Field Notes 03 — 秋"),
            "Author" => lopdf::text_string("Zoë Reader"),
        });
        document.trailer.set("Info", info_id);
        document.save(&path).unwrap();

        let book = inspect_book(&path, "pdf");
        assert_eq!(book.title, "Field Notes 03 — 秋");
        assert_eq!(book.authors, vec!["Zoë Reader"]);
        assert!(book.eligible);
        assert!(!book.title.contains('\u{fffd}'));
    }

    // @claim:source-preserved
    #[test]
    fn claim_source_scan_preserves_file_bytes() {
        let library = tempdir().unwrap();
        let path = library.path().join("owned.pdf");
        let source = b"%PDF-1.4\n% owned fixture bytes\n";
        fs::write(&path, source).unwrap();
        let _ = inspect_book(&path, "pdf");
        assert_eq!(fs::read(&path).unwrap(), source);
    }
}
