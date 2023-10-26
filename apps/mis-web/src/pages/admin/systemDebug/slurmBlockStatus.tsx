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
import { prefix, useI18nTranslateToString } from "src/i18n";
import { PlatformRole } from "src/models/User";
import { Head } from "src/utils/head";

const { Panel } = Collapse;

const p = prefix("page.admin.systemDebug.slurmBlockStatus.");

export const SlurmBlockStatusPage: NextPage = requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {

    const t = useI18nTranslateToString();

    const isLoading = false;
    const reload = () => {};
    const data = { lastRun: new Date().toISOString() };

    const { message } = App.useApp();

    const [running, setRunning] = useState(false);

    return (
      <div>
        <Head title={t(p("syncUserAccountBlockingStatus"))} />
        <PageTitle titleText={t(p("syncUserAccountBlockingStatus"))} isLoading={isLoading} reload={reload} />

        <Alert
          type="info"
          style={{ marginBottom: "4px" }}
          showIcon
          message={(
            <div>
              {t(p("alertInfo"))}
            </div>
          )}
        />

        <Collapse defaultActiveKey={["1"]}>
          <Panel header={t(p("slurmScheduler"))} key="1">
            <p>
              {t(p("slurmSchedulerMessage1"))}<br />
              {t(p("slurmSchedulerMessage2"))}<br />
              {t(p("slurmSchedulerMessage3"))}
            </p>
          </Panel>
          <Panel header={t(p("otherScheduler"))} key="2">
            <p>
              {t(p("otherSchedulerMessage"))}
            </p>
          </Panel>

        </Collapse>

        <Spin spinning={isLoading}>
          {
            data ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label={t(p("lastRunTime"))}>
                  <Space>
                    <span>
                      {data.lastRun ? formatDateTime(data.lastRun) : t(p("notBlocked"))}
                    </span>
                    <DisabledA
                      onClick={async () => {
                        setRunning(true);
                        await api.updateBlockStatus({})
                          .then(() => {
                            message.success(t(p("refreshSuccess")));
                          })
                          .finally(() => setRunning(false));
                        setRunning(false);
                      }}
                      disabled={running}
                    >
                      {t(p("refreshSchedulerUserBlockingStatus"))}
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

