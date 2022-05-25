import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { ClusterTexts } from "@scow/config/build/appConfig/clusterTexts";
import { numberToMoney } from "@scow/lib-decimal";
import { Divider, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import fs from "fs";
import { GetServerSideProps, NextPage } from "next";
import { USE_MOCK } from "src/apis/useMock";
import { checkCookie } from "src/auth/server";
import { PageTitle } from "src/components/PageTitle";
import { GetBillingItemsReply, JobServiceClient } from "src/generated/server/job";
import { getClient } from "src/utils/client";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { Head } from "src/utils/head";
import { moneyToString } from "src/utils/money";
import styled from "styled-components";

interface Item {
  index: number;

  cluster: string;
  clusterItemIndex: number;

  partition: string;
  partitionCount: number;

  partitionItemIndex: number;

  qos: string;
  qosCount: number;
  nodes: number
  mem: number;
  cores: number;
  gpus: number;
  price: string;
  comment?: string;

}

const columns: ColumnsType<Item> = [
  { dataIndex: "cluster", title: "集群", key: "index", render: (_, r) => ({
    children: publicConfig.CLUSTERS[r.cluster] ?? r.cluster,
    props: { rowSpan: r.clusterItemIndex === 0 ? r.partitionCount * r.qosCount : 0  },
  }) },
  { dataIndex: "partition", title: "分区全名", key: "index", render: (_, r) => ({
    children: r.partition,
    props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
  }) },
  { dataIndex: "nodes", title: "分区节点数", key: "index", render: (_, r) => ({
    children: r.nodes,
    props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
  }) },
  { dataIndex: "cores", title: "单节点核心数", key: "index", render: (_, r) => ({
    children: r.cores,
    props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
  }) },
  { dataIndex: "gpus", title: "单节点GPU数", key: "index", render: (_, r) => ({
    children: r.gpus,
    props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
  }) },
  { dataIndex: "mem", title: "单节点内存（MB）", key: "index", render: (_, r) => ({
    children: r.mem,
    props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
  }) },
  { dataIndex: "qos", title: "QOS", key: "index", render: (_, r) => ({
    children: r.qos,
  }) },
  { dataIndex: "price", title: "单价（元）", key: "index", render: (_, r) => ({
    children: r.price,
  }) },
  { dataIndex: "comment", title: "说明", key: "index", render: (_, r) => ({
    children: r.comment,
    props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
  }) },
];

type ValueOf<T> = T[keyof T];

interface Props {
  items: Item[];
  text: ValueOf<ClusterTexts> | undefined;
}

const ClusterCommentTitle = styled.h2`
  padding-top: 8px;
  font-weight: 600;
  font-size: 16px;
`;

const ContentContainer = styled.p`
  white-space: pre-line;
`;

export const PartitionsPage: NextPage<Props> = ({ items, text }) => {

  return (
    <div>
      <Head title="分区信息" />
      <PageTitle titleText="分区信息" />
      <Table
        dataSource={items} columns={columns}
        scroll={{ x: 800 }} size="middle"
        bordered pagination={false}
      />
      {
        text?.clusterComment ? (
          <div>
            <ClusterCommentTitle>说明</ClusterCommentTitle>
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

async function mockReply(): Promise<GetBillingItemsReply> {

  const data = JSON.parse(await fs.promises.readFile("config/mockPricePaths.json", { encoding: "utf-8" }));

  for (const k in data) {
    data[k] = numberToMoney(data[k]);
  }

  return { items: data };
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const items = [] as Item[];

  const user = await checkCookie(() => true, ctx.req);

  const client = getClient(JobServiceClient);

  const reply: GetBillingItemsReply = USE_MOCK
    ? await mockReply()
    : await asyncClientCall(client, "getBillingItems", {
      tenantName: typeof user === "number" ? undefined : user.tenant,
    });

  let count = 0;

  const clusters = runtimeConfig.CLUSTERS_CONFIG;

  for (const [cluster, { partitions }] of Object.entries(clusters)) {
    const partitionCount = Object.keys(partitions).length;
    let clusterItemIndex = 0;
    for (const [partition, partitionInfo] of Object.entries(partitions)) {
      const qosCount = partitionInfo.qos?.length ?? 1;
      let partitionItemIndex = 0;
      for (const qos of partitionInfo.qos ?? [""]) {

        const path = [cluster, partition, qos].filter((x) => x).join(".");

        items.push({
          index: count++,
          clusterItemIndex: clusterItemIndex++,
          partitionItemIndex: partitionItemIndex++,
          cluster: publicConfig.CLUSTERS[cluster] ?? cluster,
          cores: partitionInfo.cores,
          gpus: partitionInfo.gpus,
          mem: partitionInfo.mem,
          nodes: partitionInfo.nodes,
          partition,
          partitionCount,
          qosCount,
          qos,
          price: moneyToString(reply.items[path]),
          comment: partitionInfo.comment,
        });
      }
    }
  }

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
