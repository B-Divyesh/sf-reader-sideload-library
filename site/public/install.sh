#!/bin/sh
set -eu

manifest_url="https://github.com/B-Divyesh/sf-reader-sideload-library/releases/latest/download/latest.json"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT INT TERM

curl -fsSL "$manifest_url" -o "$tmp_dir/latest.json"
os="$(uname -s)"
arch="$(uname -m)"
case "$os:$arch" in
  Darwin:arm64) key="macos_arm64" ;;
  Darwin:x86_64) key="macos_x64" ;;
  Linux:aarch64|Linux:arm64) key="linux_arm64" ;;
  Linux:x86_64|Linux:amd64) key="linux_x64" ;;
  *) echo "Reader Sideload Library does not yet publish an installer for $os $arch." >&2; exit 1 ;;
esac

entry="$(tr -d '\n' < "$tmp_dir/latest.json" | sed -n "s/.*\"$key\":{\([^}]*\)}.*/\1/p")"
url="$(printf '%s' "$entry" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')"
expected="$(printf '%s' "$entry" | sed -n 's/.*"sha256":"\([a-fA-F0-9]*\)".*/\1/p')"
if [ -z "$url" ] || [ -z "$expected" ]; then echo "The latest release has no $key asset." >&2; exit 1; fi

asset="$tmp_dir/$(basename "$url")"
echo "Downloading Reader Sideload Library for $os $arch…"
curl -fL "$url" -o "$asset"
if command -v sha256sum >/dev/null 2>&1; then actual="$(sha256sum "$asset" | awk '{print $1}')"; else actual="$(shasum -a 256 "$asset" | awk '{print $1}')"; fi
if [ "$actual" != "$expected" ]; then echo "Checksum mismatch; nothing was installed." >&2; exit 1; fi

if [ "$os" = "Darwin" ]; then
  mount_output="$(hdiutil attach "$asset" -nobrowse)"
  mount_path="$(printf '%s\n' "$mount_output" | awk -F '\t' '/\/Volumes\// {print $NF; exit}')"
  app_path="$(find "$mount_path" -maxdepth 1 -name '*.app' -print -quit)"
  mkdir -p "$HOME/Applications"
  cp -R "$app_path" "$HOME/Applications/"
  hdiutil detach "$mount_path" >/dev/null
  echo "Installed Reader Sideload Library in $HOME/Applications. It is unsigned: right-click it and choose Open the first time."
else
  install_dir="$HOME/.local/bin"
  mkdir -p "$install_dir"
  cp "$asset" "$install_dir/reader-sideload-library"
  chmod 755 "$install_dir/reader-sideload-library"
  echo "Installed verified AppImage at $install_dir/reader-sideload-library."
  case ":$PATH:" in *":$install_dir:"*) ;; *) echo "Add $install_dir to PATH to launch it by name." ;; esac
fi
