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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { Static, Type } from "@sinclair/typebox";
import { join } from "path";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { publicConfig } from "src/utils/config";
import { DEFAULT_GRAFANA_URL } from "src/utils/constants";
import { route } from "src/utils/route";

const GetAlarmDbIdResponse = Type.Object({
  id: Type.Number(),
  uid: Type.String(),
  name: Type.String(),
  type: Type.String(),
});

type GetAlarmDbIdResponse = Static<typeof GetAlarmDbIdResponse>;

export const GetAlarmDbIdSchema = typeboxRouteSchema({
  method: "GET",

  responses: {
    200: Type.Object({
      id: Type.Number(),
      uid: Type.String(),
      name: Type.String(),
      type: Type.String(),
    }),
    /** 未找到对应的 datasource name */
    404: Type.Null(),
    /** 调用 grafana 出错 */
    500: Type.Null(),
  },
});

const GRAFANA_MYSQL_DATASOURCE_NAME = "AlarmDB-MySQL";

const auth = authenticate((info) =>
  info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default /* #__PURE__*/route(GetAlarmDbIdSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  return await fetch(join(publicConfig.CLUSTER_MONITOR.grafanaUrl ?? DEFAULT_GRAFANA_URL, "/api/datasources"), {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result: GetAlarmDbIdResponse[]) => {
      const datasourceInfo = result.find((datasourceInfo) => {
        return datasourceInfo.name === GRAFANA_MYSQL_DATASOURCE_NAME;
      });

      if (!datasourceInfo?.id) {
        return { 404: null };
      }

      return { 200: {
        id: datasourceInfo.id,
        uid: datasourceInfo.uid,
        name: datasourceInfo.name,
        type: datasourceInfo.type,
      } };
    })
    .catch(() => ({ 500: null }));
});
