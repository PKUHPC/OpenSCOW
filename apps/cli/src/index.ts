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

import { extractConfig } from "src/cmd/config/extract";
import { viewInstallationConfig } from "src/cmd/config/installation";
import { generateDockerComposeYml } from "src/cmd/generate";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

yargs(hideBin(process.argv))
  .options({
    configPath: {
      alias: "c",
      type: "string",
      description: "Path to installation config",
      default: "./installation.yml",
    },
  })
  .command("config", "Configurations functionalities", (yargs) => {
    return yargs
      .command("installation", "View installation config", (yargs) => {
        return yargs;
      }, (argv) => {
        viewInstallationConfig(argv);
      })
      .command("extract", "Extract sample configurations file", (yargs) => {
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
      .demandCommand().help();
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
      });
  }, (argv) => {
    generateDockerComposeYml(argv);
  })
  .completion()
  .strict()
  .scriptName("scow-cli")
  .demandCommand()
  .help()
  .argv;
