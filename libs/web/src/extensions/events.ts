/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { z } from "zod";

export const extensionEvents = z.discriminatedUnion("type", [
  z.object({ type: z.literal("scow.extensionPageHeightChanged"), payload: z.object({ height: z.number() }) }),
  z.object({ type: z.literal("scow.extensionPageTitleChanged"), payload: z.object({ title: z.string() }) }),
  z.object({ type: z.literal("scow.reloadNavbarLink"), payload: z.object({}) }),
  z.object({ type: z.literal("scow.reloadNavigations"), payload: z.object({}) }),
]);


