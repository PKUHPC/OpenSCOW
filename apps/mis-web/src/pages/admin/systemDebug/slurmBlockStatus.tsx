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
import { Alert, App, Collapse, Descriptions, Space, Spin } from "antd";
import { NextPage } from "next";
import { useState } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { DisabledA } from "src/components/DisabledA";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { Head } from "src/utils/head";

const { Panel } = Collapse;

export const SlurmBlockStatusPage: NextPage = requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {

    const isLoading = false;
    const reload = () => {};
    const data = { lastRun: new Date().toISOString() };

    const { message } = App.useApp();

    const [running, setRunning] = useState(false);

    return (
      <div>
        <Head title="用户封锁状态同步" />
        <PageTitle titleText={"用户封锁状态同步"} isLoading={isLoading} reload={reload} />

        <Alert
          type="info"
          style={{ marginBottom: "4px" }}
          showIcon
          message={(
            <div>
                在调度器重新启动后，集群与SCOW中用户的封锁状态可能出现不同步的情况，您可以点击刷新手动刷新同步所有用户状态。
            </div>
          )}
        />

        <Collapse defaultActiveKey={["1"]}>
          <Panel header="slurm调度器" key="1">
            <p>
              如果您使用的是slurm调度器，由于技术限制，当您运行slurm.sh节点和slurm管理节点并非同一节点时，已封锁的用户、账户和用户账户将会在slurm集群重启后被解封。<br />
              SCOW在启动时将会自动刷新一次slurm封锁状态，但是slurm集群可能在SCOW运行时重启，SCOW暂时不能对这种情况做出反应。<br />
              所以，如果您运行slurm.sh节点和slurm管理节点并非同一节点时，您需要在slurm集群重启后手动执行一下本页面的刷新调度器用户封锁状态的功能。
              如果slurm.sh节点和slurm管理节点为同一节点，您可以忽略本功能。
            </p>
          </Panel>
          <Panel header="其他调度器" key="2">
            <p>
              如果您使用的是slurm之外的调度器，在调度器和SCOW间用户封锁状态不同步时，可以手动执行一下本页面的刷新调度器用户封锁状态的功能。
            </p>
          </Panel>

        </Collapse>

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
                        await api.updateBlockStatus({})
                          .then(() => {
                            message.success("刷新成功");
                          })
                          .finally(() => setRunning(false));
                        setRunning(false);
                      }}
                      disabled={running}
                    >
                    刷新调度器用户封锁状态
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

