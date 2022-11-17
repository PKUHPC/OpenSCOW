import { ServiceError } from "@grpc/grpc-js";
import { Modal } from "antd";
import { publicConfig } from "src/utils/config";


export interface internalErrorInfo {
  code: string;
  info: string;
}

export const handlegRPCInternalError = (e: ServiceError) => {
  if (e.message === "Execution on clusters failed.") {
    return { 500: { code: "CLUSTEROPS_FAILED", info: e.details } };
  }
};

export const handleInternalError = (e: internalErrorInfo) => {
  if (e.code === "CLUSTEROPS_FAILED") {
    Modal.error({
      title: "操作失败",
      content: `多集群操作出现错误, 部分集群未同步修改(${e.info.split(",").map((x) => publicConfig.CLUSTERS[x].name)}), 请联系管理员!`,
    });
  }
};