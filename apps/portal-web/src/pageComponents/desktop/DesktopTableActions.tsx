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

import { Popconfirm, Space } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import type { DesktopItem } from "src/pageComponents/desktop/DesktopTable";
import { Cluster } from "src/utils/config";
import { openDesktop } from "src/utils/vnc";

interface Props {
  reload: () => void;
  cluster: Cluster;
  record: DesktopItem;
}

export const DesktopTableActions: React.FC<Props> = ({ cluster, reload, record }) => {

  // Is the popconfirm visible
  const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
  return (
    <div>
      <Space size="middle">
        <a
          onClick={async () => {

            // launch desktop
            const resp = await api.launchDesktop({
              body: {
                cluster: cluster.id,
                displayId: record.desktopId,
              },
            });

            openDesktop(resp.node, resp.port, resp.password);
          }}
        >
          启动
        </a>

        <Popconfirm
          title="删除后不可恢复，你确定要删除吗?"
          open={isPopconfirmVisible}
          onConfirm={async () => {
            setIsPopconfirmVisible(false);

            // kill desktop
            await api.killDesktop({
              body: {
                cluster: cluster.id,
                displayId: record.desktopId,
              },
            });

            reload();

          }}
          onCancel={() => {
            setIsPopconfirmVisible(false);
          }}
        >

          <a
            onClick={() => {
              setIsPopconfirmVisible(true);
            }}
          >
            删除
          </a>
        </Popconfirm>
      </Space>
    </div>
  );

};

