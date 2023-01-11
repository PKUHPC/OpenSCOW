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

import { joinWithUrl } from "@scow/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";

export const redirectToAuthLogin = (req: NextApiRequest, res: NextApiResponse, authExternalUrl: string) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);

  const callbackUrl = url.origin + join(process.env.NEXT_PUBLIC_BASE_PATH || "/", "/api/auth/callback");

  const target = joinWithUrl(authExternalUrl, `public/auth?callbackUrl=${encodeURIComponent(callbackUrl)}`);

  res.redirect(target);
};

