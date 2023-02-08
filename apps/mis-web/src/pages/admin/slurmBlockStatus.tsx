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

import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
// import { Alert, App, Badge, Descriptions, Space, Spin, Typography } from "antd"
import { Alert, App, Descriptions, Space, Spin } from "antd";
import { NextPage } from "next";
import { useState } from "react";
// import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { DisabledA } from "src/components/DisabledA";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { Head } from "src/utils/head";


export const SlurmBlockStatusPage: NextPage = requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {

    // TODO
    const isLoading = false;
    const reload = () => {};
    const data = { lastRun: new Date().toISOString() };

    const { message } = App.useApp();

    const [running, setRunning] = useState(false);

    return (
      <div>
        <Head title="刷新slurm用户封锁状态" />
        <PageTitle titleText={"刷新slurm用户封锁状态"} isLoading={isLoading} reload={reload} />

        <Alert
          type="info"
          style={{ marginBottom: "4px" }}
          showIcon
          message={(
            <div>
                由于技术限制，用户/账户/用户账户的封锁状态将会在slurm集群重启后恢复为正常。<br />
                SCOW在启动时将会自动刷新一次slurm封锁状态，但是slurm集群可能在SCOW运行时重启，SCOW暂时不能对这种情况做出反应。 <br />
                所以，当前您需要在slurm集群重启后手动执行一下本页面的刷新slurm封锁状态的功能。
            </div>
          )}
        />

        <Spin spinning={isLoading}>
          {
            data ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="上次运行时间">
                  <Space>
                    <span>
                      {data.lastRun ? formatDateTime(data.lastRun) : "未封锁过"}
                    </span>
                    <DisabledA
                      onClick={async () => {
                        setRunning(true);
                        await api.updateBlockStatus({});
                        message.success("刷新成功");
                        setRunning(false);
                      }}
                      disabled={running}
                    >
                    刷新slurm封锁状态
                    </DisabledA>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            ) : undefined
          }
        </Spin>
      </div>
    );
  });

export default SlurmBlockStatusPage;

