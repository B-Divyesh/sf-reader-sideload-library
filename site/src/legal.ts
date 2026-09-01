import "@fontsource/archivo-black/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "./style.css";

window.requestAnimationFrame(() => {
  const title = document.querySelector<HTMLElement>("h1");
  const status = document.querySelector<HTMLElement>("#route-status");
  title?.focus({ preventScroll: true });
  if (status && title) status.textContent = `${document.title}. ${title.textContent || ""}`;
});
