import { applicationJsonHeaders, logHttpErrorAndThrow } from "src/utils";
import { Logger } from "ts-log";

export async function changePassword(
  authUrl: string,
  params: { identityId: string, oldPassword: string, newPassword: string },
  logger?: Logger,
) {
  const resp = await fetch(authUrl + "/password", {
    method: "PATCH",
    body: JSON.stringify(params),
    headers: applicationJsonHeaders,
  });

  if (resp.status !== 204) {
    await logHttpErrorAndThrow(resp, logger);
  }
}
