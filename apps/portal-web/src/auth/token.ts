import { validateToken as valToken } from "@scow/lib-auth"; 
import { USE_MOCK } from "src/apis/useMock";
import { UserInfo } from "src/models/User";
import { runtimeConfig } from "src/utils/config";

export async function validateToken(token: string | undefined): Promise<UserInfo | undefined> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    if (!runtimeConfig.MOCK_USER_ID) {
      throw new Error("Using mock user id but runtimeConfig.MOCK_USER_ID is not set");
    }
    return { identityId: runtimeConfig.MOCK_USER_ID };
  }

  if (!token) { return undefined; }

  const resp = await valToken(runtimeConfig.AUTH_INTERNAL_URL, token).catch(() => undefined);

  if (!resp) {
    return undefined;
  }

  return {
    identityId: resp.identityId,
  };

}

