import { Logger } from "ts-log";


export async function changePassword(
  authUrl: string, identityId: string, oldPassword: string, newPassword: string, logger?: Logger): Promise<Response> {
  const resp = await fetch(authUrl + "/password", {
    method: "PATCH",
    body: JSON.stringify({
      identityId,
      newPassword,
      oldPassword,
    }),
  });

  if (resp.status !== 204) {
    logger?.warn("Change password failed. Status code %s", resp.status);
    if (resp.status === 412) {
      throw new Error("Password is incorrect");
    }
    else if (resp.status === 501) {
      throw new Error("This feature is not available in the current configuration.");
    }
  }
  logger?.trace("Change password successful");

  return resp;
}