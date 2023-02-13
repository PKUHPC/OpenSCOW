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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { appCustomAttribute_AttributeTypeToJSON, AppServiceClient } from "@scow/protos/build/portal/app";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface SelectOption {
  value: string;
  label: string;
}

export interface AppCustomAttribute {
  type: "NUMBER" | "SELECT" | "TEXT";
  label: string;
  name: string;
  required: boolean;
  placeholder?: string | undefined;
  default?: string | number | undefined;
  select: SelectOption[];
}

export interface GetAppMetadataSchema {
  method: "GET";

  query: {
    appId: string;
  }

  responses: {
    200: {
      appName: string;
      appCustomFormAttributes: AppCustomAttribute[];
    };

    // appId not exists
    404: { code: "APP_NOT_FOUND" };
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<GetAppMetadataSchema>("GetAppMetadataSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { appId } = req.query;

  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "getAppMetadata", { appId }).then((reply) => {
    const attributes: AppCustomAttribute[] = reply.attributes.map((item) => ({
      type: appCustomAttribute_AttributeTypeToJSON(item.type) as AppCustomAttribute["type"],
      label: item.label,
      name: item.name,
      select: item.options,
      required: item.required,
      default: item.defaultInput 
        ? (item.defaultInput?.$case === "text" ? item.defaultInput.text : item.defaultInput.number) 
        : undefined,
      placeholder: item.placeholder,
    }));
    return { 200: { appName: reply.appName, appCustomFormAttributes: attributes } };
  }, handlegRPCError({
    [status.NOT_FOUND]: () => ({ 404: { code: "APP_NOT_FOUND" } } as const),
  }));

});
