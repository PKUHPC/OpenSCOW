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
import { App, Badge, Descriptions, Space, Spin } from "antd";
import { NextPage } from "next";
import { useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { DisabledA } from "src/components/DisabledA";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { Head } from "src/utils/head";



const promiseFn = async () => api.getFetchJobInfo({});

export const FetchJobsInfoPage: NextPage = requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {
    const { isLoading, data, reload } = useAsync({
      promiseFn,
    });

    const { message } = App.useApp();

    const [fetching, setFetching] = useState(false);
    const [changingState, setChangingState] = useState(false);

    return (
      <div>
        <Head title="作业信息同步" />
        <PageTitle titleText={"作业信息同步"} isLoading={isLoading} reload={reload} />
        <Spin spinning={isLoading}>
          {
            data ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="周期性同步作业信息">
                  <Space>
                    {data.fetchStarted
                      ? <Badge status="success" text="已开启" />
                      : <Badge status="error" text="已暂停" />
                    }
                    <DisabledA
                      onClick={() => {
                        setChangingState(true);
                        api.setFetchState({ query: { started: !data.fetchStarted } })
                          .then(() => reload())
                          .finally(() => setChangingState(false));
                      }}
                      disabled={changingState}
                    >
                      {data.fetchStarted ? "停止同步" : "开始同步"}
                    </DisabledA>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="作业同步周期">
                  {data.schedule}
                </Descriptions.Item>
                <Descriptions.Item label="上次同步时间">
                  <Space>
                    <span>
                      {data.lastFetchTime ? formatDateTime(data.lastFetchTime) : "未同步过"}
                    </span>
                    <DisabledA
                      onClick={() => {
                        setFetching(true);
                        api.fetchJobs({})
                          .then(({ newJobsCount }) => {
                            message.success(`作业同步完成，同步到${newJobsCount}条新纪录。`);
                            reload();
                          })
                          .finally(() => setFetching(false));
                      }}
                      disabled={fetching}
                    >
                    立刻同步作业
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

export default FetchJobsInfoPage;

