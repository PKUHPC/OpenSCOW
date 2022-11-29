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

import { ServiceError } from "@grpc/grpc-js";
import { Modal } from "antd";
import { publicConfig } from "src/utils/config";


export interface InternalErrorInfo {
  code: string;
  info: string;
}

export const handleGrpcClusteropsError = (e: ServiceError) => {
  if (e.details) {
    return { 500: { code: "CLUSTEROPS_FAILED", info: e.details } };
  }
};

export const handleClusteropsErrorInUi = (e: InternalErrorInfo) => {
  if (e.code === "CLUSTEROPS_FAILED") {
    Modal.error({
      title: "操作失败",
      content: `多集群操作出现错误, 部分集群未同步修改(${e.info.split(",").map((x) => publicConfig.CLUSTERS[x].name)}), 请联系管理员!`,
    });
  }
};