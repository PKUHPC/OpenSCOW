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

import { executeAsUser, getUserHomedir, sshRmrf } from "@scow/lib-ssh";
import { dirname, join } from "path";
import { portalConfig } from "src/config/portal";
import {
  addDesktopToFile,
  DesktopInfo,
  getUserDesktopsFilePath,
  listDesktopsFromHost,
  readDesktopsFile,
  removeDesktopFromFile,
} from "src/utils/desktops";
import {
  anotherHostDesktopInfo,
  connectToTestServerAsRoot,
  createDesktopsFile,
  desktopTestsFolder,
  resetTestServerAsRoot,
  rootUserId,
  target,
  testDesktopInfo,
  testDesktopsFilePath,
  TestSshServer,
  userId,
} from "tests/file/utils";



let testServer: TestSshServer;

const listOutput = `
TurboVNC sessions:

X DISPLAY #     PROCESS ID      NOVNC PROCESS ID
:1\t\t21468
`;
const mockExecuteAsUserReturn = {
  code: 0,
  signal: null,
  stdout: listOutput,
  stderr: "",
};

const addedDesktopInfo: DesktopInfo = {
  host: target,
  desktopName: "new-desktop",
  displayId: 2,
  wm: "xfce",
};

jest.mock("@scow/lib-ssh", () => {
  const originalModule = jest.requireActual("@scow/lib-ssh");

  return {
    __esModule: true,
    ...originalModule,
    executeAsUser: jest.fn(),
    getUserHomedir:jest.fn(),
  };
});


beforeEach(async () => {
  testServer = await connectToTestServerAsRoot();
  await createDesktopsFile(testServer);
});

afterEach(async () => {
  await resetTestServerAsRoot(testServer);
});


it.each([
  [rootUserId, join("/root", portalConfig.desktopsDir, "desktops.json")],
  [userId, join("/home/test", portalConfig.desktopsDir, "desktops.json")],
])("should return the correct desktops file path of user %p to %p", async (user, expected) => {
  const userHomeDir = user === rootUserId ? "/root" : "/home/test";
  (getUserHomedir as jest.Mock).mockImplementation(() => {
    return Promise.resolve(userHomeDir);
  });
  expect(await getUserDesktopsFilePath(testServer.ssh, user, console)).toBe(expected);

  // clear dir of /scow/desktops
  await sshRmrf(testServer.ssh, dirname(join(userHomeDir, portalConfig.desktopsDir)));
});

it("should return correct desktops if desktop.json exist", async () => {

  const desktops = await readDesktopsFile(testServer.ssh, testDesktopsFilePath);
  expect(desktops).toStrictEqual([
    testDesktopInfo,
    anotherHostDesktopInfo,
  ]);
});

it("should return an empty array if desktop.json does not exist", async () => {

  const testDesktopsFilePath = "/path/to/nonexistent/desktops.json";

  const desktops = await readDesktopsFile(testServer.ssh, testDesktopsFilePath);

  expect(desktops).toEqual([]);
});


// test listDesktopsFromHost
it("should return an array of desktops from host", async () => {

  (executeAsUser as jest.Mock).mockReturnValue(mockExecuteAsUserReturn);
  (getUserHomedir as jest.Mock).mockReturnValue(join("/home/test", desktopTestsFolder()));

  const desktops = await listDesktopsFromHost(target, userId, console);
  expect(executeAsUser).toHaveBeenCalledOnce();

  expect(desktops).toEqual(
    {
      host: target,
      desktops: [{
        displayId: testDesktopInfo.displayId,
        desktopName: testDesktopInfo.desktopName,
        wm: testDesktopInfo.wm,
        createTime: undefined }],
    },
  );
});

// test addDesktopToFile
it("should add a correct desktop to desktops.json", async () => {

  (getUserHomedir as jest.Mock).mockReturnValue(join("/home/test", desktopTestsFolder()));
  await addDesktopToFile(testServer.ssh, userId, addedDesktopInfo, console);

  const desktops = await readDesktopsFile(testServer.ssh, testDesktopsFilePath);
  expect(desktops).toStrictEqual([
    testDesktopInfo,
    anotherHostDesktopInfo,
    addedDesktopInfo,
  ]);
},
);

// test removeDesktopFromFile
it("should remove a corrrect desktop from desktops.json", async () => {

  (getUserHomedir as jest.Mock).mockReturnValue(join("/home/test", desktopTestsFolder()));
  await removeDesktopFromFile(testServer.ssh, userId, target, addedDesktopInfo.displayId, console);

  const desktops = await readDesktopsFile(testServer.ssh, testDesktopsFilePath);
  expect(desktops).toStrictEqual([
    testDesktopInfo,
    anotherHostDesktopInfo,
  ]);
});

