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

import { Status } from "@grpc/grpc-js/build/src/constants";
import { ensureEnabled, getDesktopConfig } from "src/utils/desktop";

jest.mock("@scow/config/build/cluster", () => {
  return {
    getClusterConfigs: jest.fn().mockReturnValue({
      testCluster: {
        loginDesktop:{
          wms: ["wm1", "wm2"],
          enabled: false,
          maxDesktops: 5,
        },
      },
    }),
  };
});

jest.mock("@scow/config/build/portal", () => {
  return {
    getPortalConfig:
    jest.fn().mockReturnValue({
      loginDesktop: {
        wms: ["wm3", "wm4"],
        enabled: true,
        maxDesktops: 2,
      },
    }),
  };
});

it("return cluster wms when setting wms both in portal and cluster", async () => {
  expect(getDesktopConfig("testCluster").wms).toStrictEqual(["wm1", "wm2"]);
});

it("return cluster logindesktop enabled when setting enabled both in portal and cluster", async () => {
  try {
    ensureEnabled("testCluster");
    expect("").fail("not enabled");
  } catch (e: any) {
    expect(e.code).toBe(Status.UNAVAILABLE);
    expect(e.message).toContain("Login desktop is not enabled");
  }
});

it("return cluster maxDesktops when setting maxDesktops both in portal and cluster", async () => {
  expect(getDesktopConfig("testCluster").maxDesktops).toBe(5);
});
