/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { Alert, App, Badge, Descriptions, Space, Spin } from "antd";
import { NextPage } from "next";
import { useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { DisabledA } from "src/components/DisabledA";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { PlatformRole } from "src/models/User";
import { Head } from "src/utils/head";

const promiseFn = async () => api.getSyncBlockStatusJobInfo({});
const p = prefix("page.admin.systemDebug.slurmBlockStatus.");

export const SlurmBlockStatusPage: NextPage = requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {

    const t = useI18nTranslateToString();

    const { isLoading, data, reload } = useAsync({
      promiseFn,
    });

    const { message } = App.useApp();

    const [fetching, setFetching] = useState(false);
    const [changingState, setChangingState] = useState(false);

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

        <Spin spinning={isLoading}>
          {
            data ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label={t(p("periodicSyncUserAccountBlockStatusInfo"))}>
                  <Space>
                    {data.syncStarted
                      ? <Badge status="success" text={t(p("turnedOn"))} />
                      : <Badge status="error" text={t(p("paused"))} />
                    }
                    <DisabledA
                      onClick={() => {
                        setChangingState(true);
                        api.setSyncBlockStatusState({ query: { started: !data.syncStarted } })
                          .then(() => reload())
                          .finally(() => setChangingState(false));
                      }}
                      disabled={changingState}
                    >
                      {data.syncStarted ? t(p("stopSync")) : t(p("startSync"))}
                    </DisabledA>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t(p("jobSyncCycle"))}>
                  {data.schedule}
                </Descriptions.Item>
                <Descriptions.Item label={t(p("lastSyncTime"))}>
                  <Space>
                    <span>
                      {data.lastSyncTime ? formatDateTime(data.lastSyncTime) : t(p("notSynced"))}
                    </span>
                    <DisabledA
                      onClick={() => {
                        setFetching(true);
                        api.syncBlockStatus({})
                          .httpError(409, () => {
                            message.error(t(p("syncAlreadyStarted")));
                          })
                          .then(({ blockedFailedAccounts, unblockedFailedAccounts, blockedFailedUserAccounts }) => {
                            if (!(blockedFailedAccounts.length || unblockedFailedAccounts.length
                              || blockedFailedUserAccounts.length)) {
                              message.success(t(p("syncSuccess")));
                            } else {
                              let errorMessage = t(p("partialSyncSuccess"));
                              if (blockedFailedAccounts.length) {
                                errorMessage += t(p("syncBlockedFailedAccount")) + blockedFailedAccounts.join(",");
                              }
                              if (unblockedFailedAccounts.length) {
                                errorMessage += t(p("syncBlockedFailedAccount")) + unblockedFailedAccounts.join(",");
                              }
                              if (blockedFailedUserAccounts.length) {
                                errorMessage += t(p("syncBlockedFailedAccount"))
                                + JSON.stringify(blockedFailedUserAccounts);
                              }
                              message.error(errorMessage);
                            }
                            reload();
                          })
                          .finally(() => setFetching(false));
                      }}
                      disabled={fetching}
                    >
                      {t(p("syncSchedulerBlockingStatusNow"))}
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

