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

import { enterDb } from "src/cmd/db";
import { down } from "src/cmd/down";
import { extractConfig } from "src/cmd/extractConfig";
import { extractInstallConfig } from "src/cmd/extractInstall";
import { generateDockerComposeYml } from "src/cmd/generate";
import { logs } from "src/cmd/logs";
import { migrateFromScowDeployment } from "src/cmd/migrate";
import { pull } from "src/cmd/pull";
import { up } from "src/cmd/up";
import { viewInstall } from "src/cmd/viewInstall";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

yargs(hideBin(process.argv))
  .options({
    configPath: {
      alias: "c",
      type: "string",
      description: "Path to installation config",
      default: "./installation.yaml",
    },
  })
  .command("view-install", "Extract installation config", (yargs) => {
    return yargs.options({
      format: {
        alias: "f",
        type: "string",
        choices: ["yaml", "json"],
        description: "输出格式",
        default: "yaml",
      },
    });
  }, (argv) => {
    viewInstall(argv);
  })
  .command("extract-install", "Extract sample installation.yaml config", (yargs) => {
    return yargs.options({
      outputPath: {
        alias: "o",
        type: "string",
        description: "output installation.yaml path",
        default: "./installation.yaml",
      },
    });
  }, (argv) => {
    extractInstallConfig(argv);
  })
  .command("extract-config", "Extract sample SCOW config files", (yargs) => {
    return yargs
      .options({
        outputPath: {
          alias: "o",
          type: "string",
          description: "output dir",
          default: "./config",
        },
      });
  }, async (argv) => {
    await extractConfig(argv);
  })
  .command("generate", "Generate docker-compose.yml", (yargs) => {
    return yargs
      .options({
        outputPath: {
          alias: "o",
          type: "string",
          description: "输出路径",
          default: "./docker-compose.yml",
        },
        format: {
          alias: "f",
          type: "string",
          choices: ["yaml", "json"],
          description: "输出格式",
          default: "yaml",
        },
      });
  }, (argv) => {
    generateDockerComposeYml(argv);
  })
  .command("db", "Enter mis db", (y) => y, (argv) => {
    enterDb(argv);
  })
  .command("up", "Start SCOW services", (y) => {
    return y.options({
      detach: {
        alias: "d",
        type: "boolean",
        description: "Detached mode: Run containers in the background",
        default: false,
      },
    });
  }, (argv) => {
    up(argv);
  })
  .command("down", "Stop SCOW services", (y) => {
    return y.options({
    });
  }, (argv) => {
    down(argv);
  })
  .command("pull", "Pull images to update SCOW", (y) => {
    return y.options({
      scowOnly: {
        alias: "s",
        type: "boolean",
        description: "Only pull SCOW image",
        default: false,
      },
    });
  }, (argv) => {
    pull(argv);
  })
  .command("migrate", "Migrate from scow-deployment", (y) => {
    return y.options({
      configPyPath: {
        type: "string",
        description: "scow-deployment config.py file path",
        default: "./config.py",
      },
    });
  }, (argv) => {
    migrateFromScowDeployment(argv);
  })
  .command("logs <service>", "View logs", (y) => {
    return y
      .positional("service", {
        type: "string",
        description: "Service name",
      })
      .demandOption("service")
      .options({
        follow: {
          alias: "f",
          type: "boolean",
          description: "Follow log output.",
          default: false,
        },
      });
  }, (argv) => {
    logs(argv);
  })
  .completion()
  .strict()
  .scriptName("scow-cli")
  .demandCommand()
  .help()
  .argv;
