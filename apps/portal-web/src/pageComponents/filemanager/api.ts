import { fromApi, GeneralSchema,
  HttpError, JsonFetchResultPromiseLike } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { message } from "antd";
import path, { basename } from "path";
import { USE_MOCK } from "src/apis/useMock";
import { range } from "src/utils/array";
import { publicConfig } from "src/utils/config";
import { delay } from "src/utils/delay";

const BASE_URL = "/file-server";

const getApiUrl = (cluster: string, endpoint: string) => {
  if (!publicConfig.FILE_SERVERS.includes(cluster)) {
    throw new Error(`Unknown cluster ${cluster}`);
  }

  return path.join(BASE_URL, cluster, endpoint);
};

export interface ListSchema {
  query: { path: string },
  responses: { 200: { items: FileInfo[] } }
}

export type FileType = "file" | "dir";

export type FileInfo = {
  name: string;
  type: "error";
} | {
  name: string;
  type: FileType;
  mtime: string;
  mode: number;
  size: number;
}

const handleError = <T extends GeneralSchema>(promise: JsonFetchResultPromiseLike<T>) => {
  return promise.httpError(403, () => {
    message.error("文件/目录不存在，或者您无权操作此文件项");
  });
};

const mockFileList = (times: number, date: string) => {
  const base = [
    { name: "file", type: "file", mode: 33188, mtime: date, size: 100 },
    { name: "dir", type: "dir", mode: 33188, mtime: date, size: 10000 },
    { name: ".gvfs", type: "error" },
  ] as FileInfo[];

  return range(0, times).map((x) => {
    const item =base[x%3];
    return { ...item, name: item.name + x };
  });
};

let fileList = mockFileList(5, new Date().toISOString());

export const list = async (props: {
  cluster: string;
  path: string;
}, signal?: AbortSignal) => {

  if (USE_MOCK) {

    if (props.path === "/home/test/dir") {
      throw new HttpError(403, {});
    }

    await delay(500);

    return { items: fileList };
  }

  const url = getApiUrl(props.cluster, "dir");

  return handleError(fromApi<ListSchema>("GET", url)({ query: { path: props.path } }, signal));

};

export interface DeleteItemSchema {
  query: { path: string }
  responses: { 204: null }
}

export const deleteItem = async (props: {
  cluster: string,
  path: string
}, signal?: AbortSignal) => {
  if (USE_MOCK) {
    fileList = fileList.filter((x) => x.name !== basename(props.path));
    return;
  }

  const url = getApiUrl(props.cluster, "item");

  return handleError(fromApi<DeleteItemSchema>("DELETE", url)({ query: { path: props.path } }, signal));
};

export interface MoveSchema {
  body: { from: string; to: string; }
  responses: { 204: null }
}

export const moveItem = async (props: {
  cluster: string;
  fromPath: string;
  toPath: string;
}, signal?: AbortSignal) => {
  if (USE_MOCK) {
    const file = fileList.find((x) => x.name === basename(props.fromPath));
    if (file) {
      file.name = basename(props.toPath);
    }
    console.log(`Move ${props.fromPath} to ${props.toPath}`);
    return;
  }

  const url = getApiUrl(props.cluster, "item");

  return handleError(fromApi<MoveSchema>("PATCH", url)({ body: {
    from: props.fromPath,
    to: props.toPath,
  } }, signal));
};

export interface CopyItemSchema {
  body: { from: string; to: string; }
  responses: { 204: null }
}

export const copyItem = async (props: {
  cluster: string;
  fromPath: string;
  toPath: string;
}, signal?: AbortSignal) => {
  if (USE_MOCK) {
    console.log(`Copy ${props.fromPath} to ${props.toPath}`);
    return;
  }

  const url = getApiUrl(props.cluster, "item");

  return handleError(fromApi<MoveSchema>("PUT", url)({ body: {
    from: props.fromPath,
    to: props.toPath,
  } }, signal));
};


export interface GetHomeSchema {
  responses: { 200: { path: string } }
}

export const getHome = async (props: {
  cluster: string;
}, signal?: AbortSignal) => {
  if (USE_MOCK) { return { path: "/home/test" }; }

  const url = getApiUrl(props.cluster, "home");

  return await fromApi<GetHomeSchema>("GET", url)({ }, signal);
};

export interface MkdirSchema {
  body: { path: string }
  responses: { 204: null; 409: null }
}

export const mkdir = async (props: {
  cluster: string,
  path: string
}, signal?: AbortSignal) => {
  if (USE_MOCK) {
    fileList.push({
      name: basename(props.path), mode: 30493, mtime: new Date().toISOString(), size: 10, type: "dir",
    });
    return;
  }

  const url = getApiUrl(props.cluster, "dir");

  return await fromApi<MkdirSchema>("POST", url)({ body: { path: props.path } }, signal)
    .httpError(409, () => {
      message.error("同名目录或者文件已经存在");
    });
};

export interface CreateFileSchema {
  body: { path: string }
  responses: { 204: null; 409: null }
}

export const createFile = async (props: {
  cluster: string,
  path: string
}, signal?: AbortSignal) => {
  if (USE_MOCK) {
    fileList.push({
      name: basename(props.path), mode: 30493, mtime: new Date().toISOString(), size: 10, type: "file",
    });
    return;
  }

  const url = getApiUrl(props.cluster, "file");

  return await fromApi<CreateFileSchema>("POST", url)({ body: { path: props.path } }, signal)
    .httpError(409, () => {
      message.error("同名目录或者文件已经存在");
    });
};

export const urlToDownload = (cluster: string, path: string, download: boolean): string => {

  const url = getApiUrl(cluster, "file");

  return `${url}?path=${encodeURIComponent(path)}&download=${download}`;
};

export const urlToUpload = (cluster: string, path: string): string => {
  const url = getApiUrl(cluster, "upload");

  return `${url}?path=${encodeURIComponent(path)}`;
};
