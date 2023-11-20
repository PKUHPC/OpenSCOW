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
import { Server } from "@ddadaal/tsgrpc-server";
import { credentials } from "@grpc/grpc-js";
import { I18nStringType } from "@scow/config/build/i18n";
import { appCustomAttribute_AttributeTypeToJSON, AppServiceClient } from "@scow/protos/build/portal/app";
import { createServer } from "src/app";
import { getI18nTypeFormat } from "tests/file/utils";

export interface SelectOption {
    value: string;
    label: I18nStringType;
}

interface AppCustomAttribute {
    type: "NUMBER" | "SELECT" | "TEXT";
    label: I18nStringType;
    name: string;
    required: boolean;
    placeholder?: I18nStringType | undefined;
    default?: string | number | undefined;
    select: SelectOption[];
  }

// import { actualPath, cluster, connectToTestServer,
//   createTestItems, expectGrpcThrow, resetTestServer, TestSshServer, userId } from "./utils";

let server: Server;
let client: AppServiceClient;

beforeEach(async () => {

  server = await createServer();

  await server.start();

  client = new AppServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await server.close();
});

it("get app metadata", async () => {
  const appId = "vscode";
  const cluster = "hpc01";

  const reply = await asyncUnaryCall(client, "getAppMetadata", { appId, cluster });

  const attributes: AppCustomAttribute[] = reply.attributes.map((item) => ({
    type: appCustomAttribute_AttributeTypeToJSON(item.type) as AppCustomAttribute["type"],
    label: getI18nTypeFormat(item.label),
    name: item.name,
    select: item.options?.map((option) => {
      return {
        value: option.value,
        label: getI18nTypeFormat(option.label),
        requireGpu: option.requireGpu,
      };
    }),
    required: item.required,
    default: item.defaultInput
      ? (item.defaultInput?.$case === "text" ? item.defaultInput.text : item.defaultInput.number)
      : undefined,
    placeholder: getI18nTypeFormat(item.placeholder),
  }));

  expect(attributes).toEqual([
    {
      type: "TEXT",
      label: "版本",
      name: "version",
      select: [],
      required: false,
      default: "a version",
      placeholder: "aaa",
    },
    {
      type: "TEXT",
      label: "版本",
      name: "version2",
      select: [],
      required: false,
      default: 123,
      placeholder: "",
    },
    {
      type: "NUMBER",
      label: "版本",
      name: "version3",
      select: [],
      required: false,
      default: 456,
      placeholder: "",
    },
    {
      type: "NUMBER",
      label: "版本",
      name: "version4",
      select: [],
      required: false,
      default: undefined,
      placeholder: "",
    },
    {
      type: "SELECT",
      label: "版本",
      name: "version5",
      select: [{
        label: "version 4.8.0",
        value: "code-server/4.8.0",
      }, {
        label: "version 4.9.0",
        value: "code-server/4.9.0",
      }],
      required: true,
      default: undefined,
      placeholder: "",
    },
  ]);

});
