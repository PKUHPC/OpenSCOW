import { Logger } from "ts-log";

export const applicationJsonHeaders = { "content-type": "application/json" };

export const logHttpErrorAndThrow = async (resp: Response, logger?: Logger) => {
  logger?.error("Change password failed. Status code %s, body: %s", resp.status, await resp.text());
  throw resp;
};
