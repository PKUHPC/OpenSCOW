import { join } from "path";
import { logHttpErrorAndThrow } from "src/utils";
import { Logger } from "ts-log";

export interface AuthUserInfo {
  identityId: string;
}

/**
 * Get user info
 * @param authUrl the url for auth service
 * @returns auth capabilities
 */
export async function getUser(
  authUrl: string,
  params: { identityId: string },
  logger?: Logger,
): Promise<AuthUserInfo | undefined> {

  const query = new URLSearchParams([["identityId", params.identityId]]);
  const url = join(authUrl, "/user") + query.toString();
  const resp = await fetch(url);

  if (resp.status === 200) {
    return await resp.json();
  } else if (resp.status === 404) {
    return resp.json().then(({ code }) => {
      if (code === "USER_NOT_FOUND") {
        return undefined;
      } else {
        throw new Error("Unexpected code");
      }
    }).catch(() => logHttpErrorAndThrow(resp, logger));
  } else {
    logHttpErrorAndThrow(resp, logger);
  }
}
