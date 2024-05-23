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

import { I18nStringType } from "@scow/config/build/i18n";
import { LoginNodesType } from "@scow/config/build/type";
import { ClusterConfigSchemaProto_LoginNodesProtoType } from "@scow/protos/build/common/config";
import { I18nStringProtoType } from "@scow/protos/build/common/i18n";

// protobuf中定义的grpc返回值的类型映射到前端I18nStringType
export const getI18nTypeFormat = (i18nProtoType: I18nStringProtoType | undefined): I18nStringType => {

  if (!i18nProtoType?.value) return "";

  if (i18nProtoType.value.$case === "directString") {
    return i18nProtoType.value.directString;
  } else {
    const i18nObj = i18nProtoType.value.i18nObject.i18n;
    if (!i18nObj) return "";
    return {
      i18n: {
        default: i18nObj.default,
        en: i18nObj.en,
        zh_cn: i18nObj.zhCn,
      },
    };
  }

};

// protobuf中定义的grpc返回值的loginNodes类型映射到前端loginNode
export const getLoginNodesTypeFormat = (
  protoType: ClusterConfigSchemaProto_LoginNodesProtoType | undefined): LoginNodesType => {

  if (!protoType?.value) return [];
  if (protoType.value.$case === "loginNodeAddresses") {
    return protoType.value.loginNodeAddresses.loginNodeAddressesValue;
  } else {
    const loginNodeConfigs = protoType.value.loginNodeConfigs;
    return loginNodeConfigs.loginNodeConfigsValue.map((x) => ({
      name: getI18nTypeFormat(x.name),
      address: x.address,
    }));
  }

};
