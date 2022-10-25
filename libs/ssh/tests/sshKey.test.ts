import { NodeSSH } from "node-ssh";
import { join } from "path";
import pino from "pino";
import { insertKey } from "src/key";
import { sftpExists, sftpReadFile, sftpStat, sshRmrf } from "src/sftp";

import { connectToTestServerAsRoot, createTestItems, resetTestServerAsRoot, rootKeyPair, TestSshServer } from "./utils";

const target = "localhost:22222";
let serverSsh: TestSshServer;
const randomPostfix = String(Math.ceil(Math.random() * 1000 + 1));
const testUser = "testNewUser" + randomPostfix;
const home = join("/testNewUserHome", testUser);
const sshDir = join(home, ".ssh");
const keyFile = join(sshDir, "authorized_keys");

beforeEach(async () => {
  serverSsh = await connectToTestServerAsRoot();
  await createTestItems(serverSsh);
  // creat user
  await serverSsh.ssh.execCommand(`adduser -D -h ${home} ${testUser}`);
  await serverSsh.ssh.execCommand(`echo ${testUser}:12345678|chpasswd`);

  await insertKey(testUser, target, rootKeyPair, pino());

});

afterEach(async () => {
  // delete the new user we created, and delete the home directory
  await serverSsh.ssh.execCommand(`deluser ${testUser}`);
  await sshRmrf(serverSsh.ssh, home);

  await resetTestServerAsRoot(serverSsh);
});

it("insert key", async () => {

  expect(await sftpExists(serverSsh.sftp, home)).toBeTrue();

  expect(await sftpExists(serverSsh.sftp, sshDir)).toBeTrue();
  expect(await sftpExists(serverSsh.sftp, keyFile)).toBeTrue();

});

it("user ssh login", async () => {
  const [host, port] = target.split(":");
  const ssh = new NodeSSH();

  try {
    await ssh.connect({ host, port: +port, username: testUser, privateKey: rootKeyPair.privateKey });
  } finally {
    ssh.dispose();
  }
});

it("check ssh key info", async () => {
  const keyContent = (await sftpReadFile(serverSsh.sftp)(keyFile)).toString();
  expect(keyContent).toMatch(rootKeyPair.publicKey);
});

it("check ssh key permission and owner", async () => {
  const userID = await serverSsh.ssh.execCommand(`id -u ${testUser}`);
  const userGID = await serverSsh.ssh.execCommand(`id -g ${testUser}`);

  const keyStats = await sftpStat(serverSsh.sftp)(keyFile);
  const keyPermission = (keyStats.mode & parseInt("777", 8)).toString(8);
  expect(keyPermission).toEqual("644");

  const sshStats = await sftpStat(serverSsh.sftp)(sshDir);
  const sshPermission = (sshStats.mode & parseInt("777", 8)).toString(8);
  expect(sshPermission).toEqual("700");

  expect(sshStats.uid).toBe(Number(userID.stdout.trim()));
  expect(sshStats.gid).toBe(Number(userGID.stdout.trim()));

  expect(keyStats.uid).toBe(Number(userID.stdout.trim()));
  expect(keyStats.gid).toBe(Number(userGID.stdout.trim()));
});
