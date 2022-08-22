import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { publicConfig } from "src/utils/config";

export interface JobBillingTableItem {
  index: number;

  cluster: string;
  clusterItemIndex: number;

  priceItem?: {
    itemId: string;
    price: string;
    amount: string;
  }

  partition: string;
  partitionCount: number;

  partitionItemIndex: number;

  qos: string;
  qosCount: number;
  nodes: number
  mem: number;
  cores: number;
  gpus: number;
  path: string;
  comment?: string;

}

const columns: ColumnsType<JobBillingTableItem> = [
  { dataIndex: "cluster", title: "集群", key: "index", render: (_, r) => ({
    children: publicConfig.CLUSTERS[r.cluster]?.name ?? r.cluster,
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
    children: r.priceItem?.price ?? "未定义",
  }) },
  { dataIndex: "amount", title: "计量方式", key: "index", render: (_, r) => ({
    children: r.priceItem?.amount ?? "未定义",
  }) },
  { dataIndex: "comment", title: "说明", key: "index", render: (_, r) => ({
    children: r.comment,
    props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
  }) },
];

interface Props {
  data: JobBillingTableItem[] | undefined;
  loading?: boolean;
}

export const JobBillingTable: React.FC<Props> = ({ data, loading }) => {
  return (
    <Table
      dataSource={data} columns={columns}
      scroll={{ x: 800 }} size="middle"
      bordered pagination={false}
      loading={loading}
    />
  );
};
