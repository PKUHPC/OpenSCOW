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

import { getTurboVNCBinPath, getTurboVNCPath } from "src/utils/turbovnc";

jest.mock("@scow/config/build/cluster", () => {
  return {
    getClusterConfigs: jest.fn().mockReturnValue({ testCluster: { turboVNCPath: "/opt1/TurboVNC" } }),
  };
});

jest.mock("@scow/config/build/portal", () => {
  return {
    getPortalConfig: jest.fn().mockReturnValue({ turboVNCPath: "/opt2/TurboVNC" }),
  };
});

it("should return cluster TurboVNCPath when setting turboVNCPath both in portal and cluster", async () => {
  expect(getTurboVNCPath("testCluster")).toBe("/opt1/TurboVNC");
});


it.each([
  ["testCluster", "vncserver"],
  ["testCluster", "vncpasswd"],
])("should return right VNCCMDPath", async (cluster: string, cmd: string) => {
  if (cmd === "vncserver") {
    expect(getTurboVNCBinPath(cluster, cmd)).toBe("/opt1/TurboVNC/bin/vncserver");
  } else {
    expect(getTurboVNCBinPath(cluster, cmd)).toBe("/opt1/TurboVNC/bin/vncpasswd");
  }
});
