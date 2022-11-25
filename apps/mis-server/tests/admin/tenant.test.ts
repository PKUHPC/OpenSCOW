import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { decimalToMoney } from "@scow/lib-decimal";
import { createServer } from "src/app";
import { Tenant } from "src/entities/Tenant";
import { TenantServiceClient } from "src/generated/server/tenant";
import { insertInitialData } from "tests/data/data";
import { dropDatabase } from "tests/data/helpers";

jest.mock("@scow/lib-auth", () => ({
  getCapabilities: jest.fn(async () => ({
    createUser: true,
    changePassword: true,
    validateName: true,
  })),
}));

let server: Server;
let client: TenantServiceClient;

let tenant: Tenant;

beforeEach(async () => {
  server = await createServer();
  await server.start();
  await server.ext.orm.em.fork().persistAndFlush(tenant);

  client = new TenantServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("get all tenants", async () => {
  const data = await insertInitialData(server.ext.orm.em.fork());
  const tenants = await asyncClientCall(client, "getAllTenants", {});

  expect(tenants.totalCount).toEqual(2);
  expect(tenants.platformTenants.map((x) => ({ 
    tenantId: x.tenantId, 
    name: x.tenantName, 
    userCount: x.userCount,
    accountCount:x.accountCount,
    balance: x.balance,  
  }))).toIncludeSameMembers([
    {
      tenantId: data.tenant.id, 
      name: data.tenant.name, 
      userCount: 2,
      accountCount:2,
      balance: decimalToMoney(data.tenant.balance),
    },
    {
      tenantId: data.anotherTenant.id, 
      name: data.anotherTenant.name, 
      userCount: 1,
      accountCount:1,
      balance: decimalToMoney(data.anotherTenant.balance),
    }, 
      
  ]);
    
});

it("cannot create a tenant if the name exists", async () => {
  const tenant = new Tenant({ name: "tenant" });
  await server.ext.orm.em.fork().persistAndFlush(tenant);

  const reply = await asyncClientCall(client, "createTenant", { name: "tenant" }).catch((e) => e);
  console.log(reply);
  expect(reply.code).toBe(Status.ALREADY_EXISTS);
});

it("create a new tenant", async () => {
  await asyncClientCall(client, "createTenant", { name: "tenantTest" });
  const em = server.ext.orm.em.fork();
  const tenant = await em.findOneOrFail(Tenant, { name: "tenantTest" });
  expect(tenant.name).toBe("tenantTest");
});