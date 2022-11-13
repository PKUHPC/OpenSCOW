import { Logger } from "ts-log";

export async function createUserInAuth(
  identityId: string, id: number, mail: string, name: string, password: string, authUrl:string, logger?: Logger, 
) {
  const rep = await fetch(authUrl + "/user", {
    method: "POST",
    body: JSON.stringify({
      identityId,
      id,
      mail,
      name,
      password,
    }),
    headers: {
      "content-type": "application/json",
    },
  });
  logger?.info("calling auth finish. %o", rep);
  return rep;
}

