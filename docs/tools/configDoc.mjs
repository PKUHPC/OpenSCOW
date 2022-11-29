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

import { jsonschema2md } from "@adobe/jsonschema2md";
import { AppConfigSchema } from "@scow/config/build/appConfig/app.js";
import { ClusterConfigSchema } from "@scow/config/build/appConfig/cluster.js";
import { ClusterTextsConfigSchema } from "@scow/config/build/appConfig/clusterTexts.js";
import { MisConfigSchema } from "@scow/config/build/appConfig/mis.js";
import { PortalConfigSchema } from "@scow/config/build/appConfig/portal.js";
import { UiConfigSchema } from "@scow/config/build/appConfig/ui.js";
import { Type } from "@sinclair/typebox";
import fs from "fs";
import path from "path";

const schemas = [
  { schema: ClusterConfigSchema, name: "cluster" },
  { schema: ClusterTextsConfigSchema, name: "clusterTexts" },
  { schema: MisConfigSchema, name: "mis" },
  { schema: PortalConfigSchema, name: "portal" },
  { schema: UiConfigSchema, name: "ui" },
  { schema: AppConfigSchema, name: "app" },
];

const basePath = "docs/refs/config";

fs.mkdirSync(basePath, { recursive: true });

schemas.forEach(({ schema, name }) => {
  const output = jsonschema2md(Type.Strict(schema), { includeReadme: true, exampleFormat: "yaml", header: false });

  const configPath = path.join(basePath, name);

  if (fs.existsSync(configPath)) {
    fs.rmSync(configPath, { recursive: true });
  }
  fs.mkdirSync(configPath, { recursive: true });

  // remove the fixed definition- prefix
  output.markdown.forEach((x) => {
    const filename = x.fileName;
    fs.writeFileSync(path.join(configPath, filename), x.content);
  });

  if (output.readme) {

    // insert title frontmatter to readme content
    const content = output.readme.content =
      `---
title: ${name}
---

${output.readme.content}
`;

    fs.writeFileSync(path.join(configPath, "index.md"), content);
  }
});


