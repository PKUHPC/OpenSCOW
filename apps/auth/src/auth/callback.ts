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

import { createError } from "@fastify/error";
import { FastifyReply, FastifyRequest } from "fastify";
import { authConfig } from "src/config/auth";
import { config } from "src/config/env";

const allowedCallbackHostnames = new Set<string>([
  ...authConfig.allowedCallbackHostnames,
  ...config.EXTRA_ALLOWED_CALLBACK_HOSTNAMES.split(","),
]);

export const CallbackHostnameNotAllowedError = createError(
  "CALLBACK_DOMAIN_NOT_ALLOWED",
  "Provided callback url is not in the allowed callback hostname list.",
  400,
);
export const CallbackUrlNotValidError = createError(
  "CALLBACK_URL_INVALID",
  "Provided callback url is not a valid url.",
  400,
);

export async function validateCallbackHostname(callbackUrl: string, req: FastifyRequest) {

  const incomingDomain = req.hostname;

  try {
    const domain = new URL(callbackUrl).hostname;

    if (domain === incomingDomain) {
      return;
    }

    if (!allowedCallbackHostnames.has(domain)) {
      throw new CallbackHostnameNotAllowedError();

    }
  } catch (e) {
    if (e instanceof TypeError && (e as any).code === "ERR_INVALID_URL") {
      throw new CallbackUrlNotValidError();
    } else {
      throw e;
    }
  }
}

export async function redirectToWeb(callbackUrl: string, token: string, rep: FastifyReply) {

  const searchParams = new URLSearchParams({ token });

  await rep.redirect(302, `${callbackUrl}?${searchParams.toString()}`);
}

