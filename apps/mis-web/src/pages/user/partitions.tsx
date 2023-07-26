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

import type { ClusterTextsConfigSchema } from "@scow/config/build/clusterTexts";
import { Divider, Typography } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { checkCookie } from "src/auth/server";
import { JobBillingTable, JobBillingTableItem } from "src/components/JobBillingTable";
import { PageTitle } from "src/components/PageTitle";
import { getAvailableBillingTableItems } from "src/pages/api/job/getBillingTable";
import { runtimeConfig } from "src/utils/config";
import { Head } from "src/utils/head";
import styled from "styled-components";

type ValueOf<T> = T[keyof T];

interface Props {
  items: JobBillingTableItem[];
  text: ValueOf<ClusterTextsConfigSchema> | undefined;
}

const ClusterCommentTitle = styled(Typography.Title)`
  padding-top: 8px;
  font-weight: 600;
  font-size: 16px;
`;

const ContentContainer = styled(Typography.Paragraph)`
  white-space: pre-line;
`;

export const PartitionsPage: NextPage<Props> = ({ items, text }) => {

  return (
    <div>
      <Head title="分区信息" />
      <PageTitle titleText="分区信息" />
      <JobBillingTable data={items} />
      {
        text?.clusterComment ? (
          <div>
            <ClusterCommentTitle level={2}>说明</ClusterCommentTitle>
            <ContentContainer>{text.clusterComment}</ContentContainer>
          </div>
        ) : undefined
      }
      {
        text?.extras?.map(({ title, content }, i) => (
          <div key={i}>
            <Divider />
            <PageTitle titleText={title} />
            <ContentContainer>{content}</ContentContainer>
          </div>
        ))
      }
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {

  const user = await checkCookie(() => true, ctx.req);

  // 显示用户可见的分区信息
  const items = await getAvailableBillingTableItems(typeof user === "number" ? undefined : user);

  const clusterTexts = runtimeConfig.CLUSTER_TEXTS_CONFIG;

  // find the applicable text
  const applicableTexts = clusterTexts ? (
    typeof user === "number"
      ? clusterTexts
      : (clusterTexts[user.tenant] ?? clusterTexts.default)
  ) : undefined;

  return { props: { items, text: applicableTexts } };
};

export default PartitionsPage;
