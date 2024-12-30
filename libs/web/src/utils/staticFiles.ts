import { languageMap } from "src/utils/languageMap";
import { nonEditableExtensions } from "src/utils/nonEditableExtensions";


export function basename(path: string) {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1];
}

export function getExtension(filename: string) {
  const parts = filename.split(".");
  const extension = parts.pop();
  return extension ? extension.toLowerCase() : "";
}

export function isImage(filename: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "svg", "webp"];
  const extension = getExtension(filename);
  return imageExtensions.includes(extension);
}

export function getLanguage(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return languageMap[ext] || "plaintext";
}

export function canPreviewWithEditor(filename: string): boolean {
  const extension = `.${filename.split(".").pop()}`;
  return !nonEditableExtensions.has(extension.toLowerCase());
}


