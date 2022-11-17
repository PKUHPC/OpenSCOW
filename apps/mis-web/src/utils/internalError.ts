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