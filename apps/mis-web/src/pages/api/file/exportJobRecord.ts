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
import { asyncReplyStreamCall } from "@ddadaal/tsgrpc-client";
import { OperationType } from "@scow/lib-operation-log";
import { getCurrentLanguageId } from "@scow/lib-web/build/utils/systemLanguage";
import { JobInfo } from "@scow/protos/build/common/ended_job";
import { ExportServiceClient } from "@scow/protos/build/server/export";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getT, prefix } from "src/i18n";
import { Encoding } from "src/models/exportFile";
import { SearchType } from "src/models/job";
import { OperationResult } from "src/models/operationLog";
import {
  TenantRole,
} from "src/models/User";
import { MAX_EXPORT_COUNT } from "src/pageComponents/file/apis";
import { buildJobsRequestTarget } from "src/pages/api/job/jobInfo";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { getClusterName } from "src/utils/cluster";
import { publicConfig } from "src/utils/config";
import { createEncodingTransform, getContentTypeWithCharset, getCsvObjTransform,
  getCsvStringify } from "src/utils/file";
import { nullableMoneyToString } from "src/utils/money";
import { route } from "src/utils/route";
import { parseIp } from "src/utils/server";
import { pipeline } from "stream";


export const ExportJobRecordSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    columns: Type.Array(Type.String()),
    count: Type.Number(),
    jobEndTimeStart: Type.Optional(Type.String({ format: "date-time" })),
    jobEndTimeEnd: Type.Optional(Type.String({ format: "date-time" })),
    userId: Type.Optional(Type.String()),
    clusters: Type.Optional(Type.Array(Type.String())),
    accountName: Type.Optional(Type.String()),
    encoding: Type.Enum(Encoding),
    timeZone: Type.Optional(Type.String()),
    jobId: Type.Optional(Type.Number()),
    finalPriceText: Type.String(),
    searchType: Type.Enum(SearchType),
    publicConfigClusters: Type.String(),
  }),

  responses:{
    200: Type.Any(),

    409: Type.Object({ code: Type.Literal("TOO_MANY_DATA") }),
  },
});

export default route(ExportJobRecordSchema, async (req, res) => {
  // 和getJobInfo的auth保持一致
  const auth = authenticate((u) =>
    u.tenantRoles.includes(TenantRole.TENANT_ADMIN) || u.accountAffiliations.length > 0);

  const info = await auth(req, res);

  if (!info) {
    return;
  }

  const { query } = req;

  const { columns, jobEndTimeStart, jobEndTimeEnd, accountName, count,
    userId, encoding,timeZone, jobId, finalPriceText, searchType, publicConfigClusters } = query;
  let { clusters } = query;

  clusters = clusters ?? [];
  clusters = clusters.filter((i) => i !== "");
  const target = buildJobsRequestTarget(info.tenant, jobId, accountName, userId);

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.exportJobRecord,
    operationTypePayload:{
      target,
    },
  };

  if (count > MAX_EXPORT_COUNT) {
    await callLog(logInfo, OperationResult.FAIL);
    return { 409: { code: "TOO_MANY_DATA" } } as const;

  } else {
    const client = getClient(ExportServiceClient);

    const filename = `job_record-${new Date().toLocaleString("zh-CN", { timeZone: timeZone ?? "UTC" })}.csv`;
    const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);

    const contentTypeWithCharset = getContentTypeWithCharset(filename, encoding);

    res.writeHead(200, {
      "Content-Type":contentTypeWithCharset,
      "Content-Disposition": `attachment; ${dispositionParm}`,
    });

    const stream = asyncReplyStreamCall(client, "exportJobRecord", {
      count,
      jobEndTimeStart,
      jobEndTimeEnd,
      target,
      clusters,
    });

    const languageId = getCurrentLanguageId(req, publicConfig.SYSTEM_LANGUAGE_CONFIG);
    const t = await getT(languageId);
    const pCommon = prefix("common.");


    const formatJobRecord = (x: JobInfo) => {
      return {
        idJob: x.idJob,
        jobName: x.jobName,
        account: x.account,
        user: x.user,
        accountPrice: nullableMoneyToString(x.accountPrice),
        cluster: getClusterName(x.cluster, languageId, JSON.parse(publicConfigClusters)),
        partition: x.partition,
        qos: x.qos,
        timeSubmit: x.timeSubmit ? new Date(x.timeSubmit).
          toLocaleString("zh-CN", { timeZone: timeZone ?? "UTC" })
          : "",
        timeEnd: x.timeEnd ? new Date(x.timeEnd).
          toLocaleString("zh-CN", { timeZone: timeZone ?? "UTC" })
          : "",
        tenantPrice: nullableMoneyToString(x.tenantPrice),
      };
    };

    const finalPriceTextObj: { tenant?: string; account?: string } = JSON.parse(finalPriceText ? finalPriceText : "");

    const clusterColumnsName = searchType === SearchType.NORMAL ? t(pCommon("clusterName")) : t(pCommon("cluster"));

    const headerColumns = {
      idJob: t(pCommon("clusterWorkId")),
      jobName: t(pCommon("workName")),
      account: t(pCommon("account")),
      user: t(pCommon("user")),
      cluster: clusterColumnsName,
      partition: t(pCommon("partition")),
      qos: "QOS",
      timeSubmit: t(pCommon("timeSubmit")),
      timeEnd: t(pCommon("timeEnd")),
    };

    for (const price in finalPriceTextObj) {
      headerColumns[price + "Price"] = finalPriceTextObj[price];
    }

    const csvStringify = getCsvStringify(headerColumns, columns);
    const transform = getCsvObjTransform("jobRecords", formatJobRecord);
    const encodingTransform = createEncodingTransform(encoding); // 创建编码转换流

    pipeline(
      stream,
      transform,
      csvStringify,
      encodingTransform, // 添加编码转换流到管道
      res,
      async (err) => {
        if (err) {
          console.error("Pipeline failed", err);
          await callLog(logInfo, OperationResult.FAIL);
        } else {
          await callLog(logInfo, OperationResult.SUCCESS);
        }
      },
    );
  }
});




