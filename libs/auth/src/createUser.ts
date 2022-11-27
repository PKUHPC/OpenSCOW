import { join } from "path";
import { applicationJsonHeaders, logHttpErrorAndThrow } from "src/utils";
import { Logger } from "ts-log";

export async function createUser(
  authUrl: string,
  params: { identityId: string, id: number, mail: string, name: string, password: string },
  logger?: Logger,
) {
  const resp = await fetch(authUrl + "/user", {
    method: "POST",
    body: JSON.stringify(params),
    headers: applicationJsonHeaders,
  });

  if (resp.status !== 204) {
    logHttpErrorAndThrow(resp, logger);
  }

}

export interface AuthUserInfo {
  identityId: string;
}

/**
 * Get user info
 * @param authUrl the url for auth service
 * @param params the API parameters
 * @returns the user info. undefined if user do not exist
 */
export async function getUser(
  authUrl: string,
  params: { identityId: string },
  logger?: Logger,
): Promise<AuthUserInfo | undefined> {

  const query = new URLSearchParams([["identityId", params.identityId]]);
  const url = join(authUrl, "/user") + "?" + query.toString();
  const resp = await fetch(url, {
    headers: applicationJsonHeaders,
  });

  if (resp.status === 200) {
    return await resp.json();
  } else if (resp.status === 404) {
    const json = await resp.json().catch(() => undefined);

    if (json?.code === "USER_NOT_FOUND") {
      return undefined;
    } else {
      logHttpErrorAndThrow(resp, logger);
    }
  } else {
    logHttpErrorAndThrow(resp, logger);
  }
}
