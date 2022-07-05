import { join } from "path";

export const urlToDownload = (cluster: string, path: string, download: boolean): string => {

  return join(process.env.NEXT_PUBLIC_BASE_PATH || "/", "/api/file/download")
  + `?path=${encodeURIComponent(path)}&cluster=${cluster}&download=${download}`;
};
export const urlToUpload = (cluster: string, path: string): string => {

  return join(process.env.NEXT_PUBLIC_BASE_PATH || "/", "/api/file/upload")
  + `?path=${encodeURIComponent(path)}&cluster=${cluster}`;
};

