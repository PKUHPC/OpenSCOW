import { MikroORM } from "@mikro-orm/core";

export async function clearAndClose(orm: MikroORM) {
  await orm.getSchemaGenerator().dropDatabase(orm.config.get("dbName"));
  await orm.close();
}
