import { getDocFromSpec } from "@scow/config";
import dotenv from "dotenv";
import fs from "fs";
import path, { join, resolve } from "path";

process.env.NODE_ENV = "development";

export function genConfigTable(pack: string, configFile = "src/config") {
  const appPath = resolve(join("../apps", pack));
  dotenv.config({ path: join(appPath, "env/.env.dev" ) });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { config } = require(join(appPath, configFile));

  const docs = getDocFromSpec(config._specs);

  return docs;
}

interface EnvConfig {
  app: string;
  configFile?: string;
  md: string;
}

const config = [
  { app: "auth", md: "common/refs/auth.md" },
  { app: "clusterops-slurm", md: "mis/refs/clusterops-slurm.md" },
  { app: "mis-server", md: "mis/refs/mis-server.md" },
  { app: "mis-web", configFile: "config", md: "mis/refs/mis-web.md" },
  { app: "file-server", md: "portal/refs/file-server.md" },
  { app: "portal-web", configFile: "config", md: "portal/refs/portal-web.md" },
  { app: "shell-server", md: "portal/refs/shell-server.md" },
  { app: "vnc-server", md: "portal/refs/vnc-server.md" },
] as EnvConfig[];

const TABLE_START = "<!-- ENV TABLE START -->";
const TABLE_END = "<!-- ENV TABLE END -->";

for (const { app, configFile, md } of config) {

  const mdPath =path.join("docs", md);

  console.log(`Writing ${app} env config to ${mdPath}`);

  const docs = genConfigTable(app, configFile);

  const content = fs.readFileSync(mdPath, "utf-8");

  const beginning = content.substring(0, content.indexOf(TABLE_START)-1);

  const ending = content.substring(content.indexOf(TABLE_END) + TABLE_END.length+1);

  const newContent = [
    beginning,
    TABLE_START,
    docs,
    TABLE_END,
    ending,
  ].join("\n");


  fs.writeFileSync(mdPath, newContent, { encoding: "utf8" });
}
