import { MikroORM } from "@mikro-orm/core";

jest.mock("@scow/lib-auth", () => ({
  getCapabilities: jest.fn(async () => ({
    createUser: true,
    changePassword: true,
    validateName: true,
  })),
}));

export async function dropDatabase(orm: MikroORM) {
  await orm.getSchemaGenerator().dropDatabase(orm.config.get("dbName"));
}

export async function clearAndClose(orm: MikroORM) {
  await dropDatabase(orm);
  await orm.close();
}
