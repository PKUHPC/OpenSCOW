import type { ClusterTextsConfigSchema } from "@scow/config/build/clusterTexts";
import { Divider, Typography } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { checkCookie } from "src/auth/server";
import { JobBillingTable, JobBillingTableItem } from "src/components/JobBillingTable";
import { PageTitle } from "src/components/PageTitle";
import { getBillingTableItems } from "src/pages/api/job/getBillingTable";
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

  const items = await getBillingTableItems(typeof user === "number" ? undefined : user.tenant);

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
