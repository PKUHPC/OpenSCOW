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

import { runCompose } from "src/cmd/compose";
import { enterDb } from "src/cmd/db";
import { extractConfig } from "src/cmd/extractConfig";
import { extractInstallConfig } from "src/cmd/extractInstall";
import { generateDockerComposeYml } from "src/cmd/generate";
import { migrateFromScowDeployment } from "src/cmd/migrate";
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
  .command("compose", "Run compose commands", (y) => {
    return y.parserConfiguration({ "unknown-options-as-args": true });
  }, (argv) => {
    runCompose(argv);
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
  .completion()
  .strict()
  .scriptName("scow-cli")
  .demandCommand()
  .help()
  .argv;
