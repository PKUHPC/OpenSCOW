import { Logger } from "ts-log";
import { fetch } from "undici";

export interface UserInfo {
  identityId: string;
}

export async function validateToken(authUrl: string, token: string, logger?: Logger): Promise<UserInfo | undefined> {
  const resp = await fetch(authUrl + "/validateToken?token=" + token, {
    method: "GET",
  });

  const body = await resp.json() as UserInfo;

  if (resp.status !== 200) {
    logger?.warn("Validation token failed. Status code %s. body: %s", resp.status, body);
    return;
  }

  logger?.trace("Validate token successful. identityId %s", body.identityId);

  return body;
}
