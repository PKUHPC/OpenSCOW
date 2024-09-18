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

import { RequestContext } from "@mikro-orm/core";
import { middleware } from "src/server/trpc/def";
import { getORM } from "src/server/utils/getOrm";

/**
 * Add RequestContext for MikroORM to isolate Identity Map per request.
 */
export const withOrmContext = middleware(async ({ ctx, next }) => {
  const orm = await getORM();

  return RequestContext.create(orm.em, () => next({ ctx: { ...ctx, orm } }));
});

export default withOrmContext;
