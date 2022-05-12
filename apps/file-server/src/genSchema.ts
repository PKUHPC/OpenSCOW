import fs from "fs";
import { buildApp } from "src/app";

const FILE = "api.json";

async function main() {
  const server = await buildApp();

  await server.ready();

  const api = server.swagger();

  fs.writeFileSync(FILE, JSON.stringify(api));
}

main();
