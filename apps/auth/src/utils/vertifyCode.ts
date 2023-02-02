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

import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";


export function verifyCode(f: FastifyInstance) {
  const bodySchema = Type.Object({
    sid: Type.String(),
    vertifyCode: Type.String(),
  });

  let vertifyPass = true;
  f.post<{ Body: Static<typeof bodySchema> }>("/public/auth", {
    schema: { body: bodySchema },
  }, async (req) => {
    const { sid, vertifyCode } = req.body;

    const result = await f.redis.get(sid);

    if (result?.toLowerCase() !== vertifyCode.toLowerCase()) {
      vertifyPass = false;
    }

  });

  return vertifyPass;
}
