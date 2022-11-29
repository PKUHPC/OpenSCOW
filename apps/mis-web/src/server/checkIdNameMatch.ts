/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
