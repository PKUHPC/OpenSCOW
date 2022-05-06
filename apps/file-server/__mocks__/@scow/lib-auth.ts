import { userInfo } from "os";

export const TOKEN = "1717e1ee-ed23-4aff-b49d-b649083a60c5";
export const TEST_USER = userInfo().username;

export function validateToken(url: string, token: string) {
  if (token === TOKEN) {
    return { identityId: TEST_USER };
  } else {
    return undefined;
  }
}
