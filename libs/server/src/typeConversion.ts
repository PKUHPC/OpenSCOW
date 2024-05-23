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

import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { I18nStringType } from "@scow/config/build/i18n";
import { LoginNodesType } from "@scow/config/build/type";
import { ClusterConfigSchemaProto, clusterConfigSchemaProto_K8sRuntimeFromJSON,
  ClusterConfigSchemaProto_LoginNodeConfigSchemaProto,
  ClusterConfigSchemaProto_LoginNodesProtoType } from "@scow/protos/build/common/config";
import { I18nStringProtoType } from "@scow/protos/build/common/i18n";

export function isStringArray(arr: any[]): arr is string[] {
  return arr.every((item) => typeof item === "string");
}

export function isObjectArray(arr: any[]): arr is object[] {
  return arr.every((item) => typeof item === "object" && item !== null);
}


export const getI18nSeverTypeFormat = (i18nConfig: I18nStringType): I18nStringProtoType | undefined => {

  if (!i18nConfig) return undefined;

  if (typeof i18nConfig === "string") {
    return { value: { $case: "directString", directString: i18nConfig } };
  } else {
    return { value: { $case: "i18nObject", i18nObject: {
      i18n: {
        default: i18nConfig.i18n.default,
        en: i18nConfig.i18n.en,
        zhCn: i18nConfig.i18n.zh_cn,
      },
    } } };
  }
};

export const getLoginNodesSeverTypeFormat = (loginNodes: LoginNodesType):
ClusterConfigSchemaProto_LoginNodesProtoType | undefined => {

  if (!loginNodes) return undefined;

  if (loginNodes instanceof Array && loginNodes.every((node) => typeof node === "string")) {
    return { value: { $case: "loginNodeAddresses",
      loginNodeAddresses: { loginNodeAddressesValue: loginNodes as string[] } } };
  } else {
    return { value: { $case: "loginNodeConfigs",
      loginNodeConfigs: { loginNodeConfigsValue: loginNodes.map((node) => ({
        name: getI18nSeverTypeFormat(node.name) as I18nStringProtoType,
        address: node.address,
      })) as ClusterConfigSchemaProto_LoginNodeConfigSchemaProto[] },
    } };
  }
};


export const convertClusterConfigsToServerProtoType = (
  clusterConfigs: Record<string, ClusterConfigSchema>,
): Record<string, ClusterConfigSchemaProto> => {

  const clusterConfigsProto: Record<string, ClusterConfigSchemaProto> = {};

  for (const key in clusterConfigs) {
    const item = clusterConfigs[key];

    const protoItem: ClusterConfigSchemaProto = {
      displayName: getI18nSeverTypeFormat(item.displayName) as I18nStringProtoType,
      adapterUrl: item.adapterUrl,
      priority: item.priority ?? Number.MAX_SAFE_INTEGER,
      proxyGateway: item.proxyGateway ?
        {
          url: item.proxyGateway.url || "",
          autoSetupNginx: item.proxyGateway.autoSetupNginx || false,
        } : undefined,
      loginNodes: getLoginNodesSeverTypeFormat(item.loginNodes) as ClusterConfigSchemaProto_LoginNodesProtoType,
      loginDesktop: item.loginDesktop ?
        {
          enabled: item.loginDesktop.enabled,
          wms: item.loginDesktop.wms.map((wm) => ({ name: wm.name, wm: wm.wm })),
          maxDesktops: item.loginDesktop.maxDesktops,
          desktopsDir: item.loginDesktop.desktopsDir,
        } : undefined,
      turboVncPath: item.turboVNCPath ?? undefined,
      crossClusterFileTransfer: item.crossClusterFileTransfer ?
        {
          enabled: item.crossClusterFileTransfer?.enabled ?? false,
          transferNode: item.crossClusterFileTransfer?.transferNode ?? undefined,
        } : undefined,
      hpc: item.hpc && Object.keys(item.hpc).length > 0 ? { enabled: item.hpc.enabled } : { enabled: true },
      ai: item.ai && Object.keys(item.ai).length > 0 ? { enabled: item.ai.enabled } : { enabled: false },
      k8s: item.k8s ?
        {
          runtime: clusterConfigSchemaProto_K8sRuntimeFromJSON(item.k8s.runtime) ?? "containerd",
          kubeconfig: { path: item.k8s.kubeconfig.path },
        } : undefined,
    };

    clusterConfigsProto[key] = protoItem;
  }

  return clusterConfigsProto;
};
