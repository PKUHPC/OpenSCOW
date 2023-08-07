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

import { App, Divider, Spin, Typography } from "antd";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { JobBillingTable } from "src/components/JobBillingTable";
import { PageTitle } from "src/components/PageTitle";
import { Head } from "src/utils/head";
import styled from "styled-components";

const ClusterCommentTitle = styled(Typography.Title)`
  padding-top: 8px;
  font-weight: 600;
  font-size: 16px;
`;

const ContentContainer = styled(Typography.Paragraph)`
  white-space: pre-line;
`;

export const PartitionsPage: NextPage = requireAuth(
  () => true,
)(
  ({ userStore }) => {

    const user = userStore.user;
    const { message } = App.useApp();

    const { data, isLoading } = useAsync({ promiseFn: useCallback(async () => {
      return await api.getBillingTable({ query: { tenant: user.tenant, userId: user.identityId } })
        .httpError(500, () => { message.error("集群和分区信息获取失败，请联系管理员。"); });
    }, [userStore.user]) });

    return (
      <div>
        <Head title="分区信息" />
        <PageTitle titleText="分区信息" />
        <Spin spinning={isLoading}>
          <JobBillingTable data={data?.items} />
          {
            data?.text?.clusterComment ? (
              <div>
                <ClusterCommentTitle level={2}>说明</ClusterCommentTitle>
                <ContentContainer>
                  {data?.text?.clusterComment}
                </ContentContainer>
              </div>
            ) : undefined
          }
          {
            data?.text?.extras?.map(({ title, content }, i) => (
              <div key={i}>
                <Divider />
                <PageTitle titleText={title} />
                <ContentContainer>{content}</ContentContainer>
              </div>
            ))
          }
        </Spin>
      </div>
    );
  });

export default PartitionsPage;
