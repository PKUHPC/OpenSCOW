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

import { Button } from "antd";
import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

export const ShellIndexPage: NextPage = requireAuth(() => true)(() => {
  return (
    <div>
      <Head title="终端" />
      <h1>
        启动以下集群的终端：
      </h1>
      {publicConfig.CLUSTERS.map(({ id, name }) => (
        <a key={id} href={`/shell/${id}`} target="__blank">
          <Button>
            {name}
          </Button>
        </a>
      ))}
    </div>
  );
});

export default ShellIndexPage;
