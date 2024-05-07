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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { ClusterActivationStatus as ClusterActivationStatusProto,
  ConfigServiceClient } from "@scow/protos/build/server/config";
import { createServer } from "src/app";
import { Cluster, ClusterActivationStatus } from "src/entities/Cluster";
import { dropDatabase } from "tests/data/helpers";

let server: Server;
let client: ConfigServiceClient;
let clusterItem: Cluster;

beforeEach(async () => {
  server = await createServer();
  await server.start();

  clusterItem = new Cluster({
    clusterId: "hpcTest",
    activationStatus: ClusterActivationStatus.DEACTIVATED,
    lastActivationOperation: { "operatorId": "userA", "deactivationComment": "Deactivation Comment" },
  });
  const hpc00 = await server.ext.orm.em.fork().findOneOrFail(Cluster, {
    clusterId: "hpc00",
  });
  hpc00.activationStatus = ClusterActivationStatus.DEACTIVATED;
  hpc00.lastActivationOperation = {
    "operatorId": "userB",
    "deactivationComment": "new deactivation message for upgrade",
  };

  await server.ext.orm.em.fork().persistAndFlush([clusterItem, hpc00]);

  client = new ConfigServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("get clusters initial database info", async () => {

  const clustersFromDb = await asyncClientCall(client, "getClustersDatabaseInfo", {});

  expect(clustersFromDb.results.length).toEqual(4);
  expect(clustersFromDb.results.map((x) => ({
    clusterId: x.clusterId,
    activationStatus: x.activationStatus,
    lastActivationOperation: x.lastActivationOperation,
  }))).toIncludeSameMembers([
    {
      clusterId: "hpc00",
      activationStatus: ClusterActivationStatusProto.DEACTIVATED,
      lastActivationOperation: {
        "operatorId": "userB",
        "deactivationComment": "new deactivation message for upgrade",
      },
    },
    {
      clusterId: "hpc01",
      activationStatus: ClusterActivationStatusProto.ACTIVATED,
      lastActivationOperation: undefined,
    },
    {
      clusterId: "hpc02",
      activationStatus: ClusterActivationStatusProto.ACTIVATED,
      lastActivationOperation: undefined,
    },
    {
      clusterId: "hpcTest",
      activationStatus: ClusterActivationStatusProto.DEACTIVATED,
      lastActivationOperation:  { "operatorId": "userA", "deactivationComment": "Deactivation Comment" },
    },
  ]);

});

it("cannot activate a cluster if the schedular adapter is not reachable", async () => {

  const reply = await asyncClientCall(client, "activateCluster", {
    clusterId: "hpcTest",
    operatorId: "userB",
  }).catch((e) => e);
  expect(reply.code).toBe(Status.FAILED_PRECONDITION);

});

it("cannot write to db when activated a cluster has already been activated", async () => {

  const reply = await asyncClientCall(client, "activateCluster", {
    clusterId: "hpc01",
    operatorId: "userB",
  });

  expect(reply.executed).toBe(false);

  const activatedCluster = await server.ext.orm.em.fork().findOneOrFail(Cluster, {
    clusterId: "hpc01",
  });

  expect(activatedCluster.lastActivationOperation).toBeUndefined;
});

it("activate a cluster", async () => {

  const reply = await asyncClientCall(client, "activateCluster", {
    clusterId: "hpc00",
    operatorId: "userC",
  });
  expect(reply.executed).toBe(true);

  const updatedCluster = await server.ext.orm.em.fork().findOneOrFail(Cluster, {
    clusterId: "hpc00",
  });
  expect(updatedCluster.activationStatus).toBe(ClusterActivationStatus.ACTIVATED);
  expect(updatedCluster.lastActivationOperation).toStrictEqual({
    "operatorId": "userC",
  });

});


it("cannot deactivate a cluster if not found", async () => {

  const reply = await asyncClientCall(client, "deactivateCluster", {
    clusterId: "hpc123",
    operatorId: "userA",
    deactivationComment: "deactivation for upgrade",
  }).catch((e) => e);
  expect(reply.code).toBe(Status.NOT_FOUND);

});

it("cannot write to db when deactivated a cluster has already been deactivated", async () => {

  const reply = await asyncClientCall(client, "deactivateCluster", {
    clusterId: "hpcTest",
    operatorId: "userB",
    deactivationComment: "deactivation for upgrade",
  });

  expect(reply.executed).toBe(false);

  const deactivatedCluster = await server.ext.orm.em.fork().findOneOrFail(Cluster, {
    clusterId: "hpcTest",
  });
  expect(deactivatedCluster.activationStatus).toBe(ClusterActivationStatus.DEACTIVATED);
  expect(deactivatedCluster.lastActivationOperation).toStrictEqual({
    "operatorId": "userA",
    "deactivationComment": "Deactivation Comment",
  });
});

it("deactivate a cluster", async () => {

  const reply = await asyncClientCall(client, "deactivateCluster", {
    clusterId: "hpc01",
    operatorId: "userB",
    deactivationComment: "deactivation message for upgrade",
  });
  expect(reply.executed).toBe(true);

  const deactivatedCluster = await server.ext.orm.em.fork().findOneOrFail(Cluster, {
    clusterId: "hpc01",
  });
  expect(deactivatedCluster.activationStatus).toBe(ClusterActivationStatus.DEACTIVATED);
  expect(deactivatedCluster.lastActivationOperation).toStrictEqual({
    "operatorId": "userB",
    "deactivationComment": "deactivation message for upgrade",
  });

});
