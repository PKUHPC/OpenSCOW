import { Logger } from "ts-log";

export const applicationJsonHeaders = { "content-type": "application/json" };

export class HttpError extends Error {
  constructor(public status: number, public text: string) {
    super("Error occurred when calling auth HTTP API");
  }
}

export const logHttpErrorAndThrow = async (resp: Response, logger?: Logger) => {
  const text = await resp.text();

  logger?.error("Change password failed. Status code %s, body: %s", resp.status, text);

  throw new HttpError(resp.status, text);
};


