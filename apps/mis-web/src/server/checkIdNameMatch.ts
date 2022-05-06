import { jsonFetch } from "@ddadaal/next-typed-api-routes-runtime";
import { runtimeConfig } from "src/utils/config";

export type CheckNameMatchResult = "OK" | "NotMatch" | "NotFound";

// check in auth whether identity and name matches.
export async function checkNameMatch(identityId: string, name: string): Promise<CheckNameMatchResult> {
  return await jsonFetch({
    method: "GET",
    path: `${runtimeConfig.AUTH_INTERNAL_URL}/validateName`,
    query: { identityId, name },
  })
    .httpError(404, () => "NotFound")
    .then(({ result }) => result ? "OK" : "NotMatch")
    .catch((r) => {
      if (r === "NotFound") {
        return "NotFound";
      } else {
        throw r;
      }
    });
}
