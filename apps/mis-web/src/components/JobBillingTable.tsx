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

import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { publicConfig } from "src/utils/config";

import { AmountStrategyDescriptionsItem } from "./AmonutStrategyDescriptionsItem";

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

interface Props {
  data: JobBillingTableItem[] | undefined;
  loading?: boolean;
  isUserPartitionsPage?: boolean;
}

const p = prefix("component.others.");
const pCommon = prefix("common.");

export const JobBillingTable: React.FC<Props> = ({ data, loading, isUserPartitionsPage }) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const clusterTotalQosCounts = data && data.length ?
    data.reduce((totalQosCounts: { [cluster: string]: number }, item) => {
      const { cluster } = item;
      if (!totalQosCounts[cluster]) {
        totalQosCounts[cluster] = 1;
      } else {
        totalQosCounts[cluster]++;
      }
      return totalQosCounts;
    }, {}) : {};

  const columns: ColumnsType<JobBillingTableItem> = [
    ...(isUserPartitionsPage ? [] : [
      { dataIndex: "cluster", title: t(pCommon("cluster")), key: "index", render: (_, r) => ({
        children: getI18nConfigCurrentText(publicConfig.CLUSTERS[r.cluster]?.name, languageId) ?? r.cluster,
        props: { rowSpan: r.clusterItemIndex === 0 && clusterTotalQosCounts ? clusterTotalQosCounts[r.cluster] : 0 },
      }) },
    ])
    ,
    { dataIndex: "partition", title: t(p("partitionFullName")), key: "index", render: (_, r) => ({
      children: r.partition,
      props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
    }) },
    { dataIndex: "nodes", title: t(p("nodes")), key: "index", render: (_, r) => ({
      children: r.nodes,
      props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
    }) },
    { dataIndex: "cores", title: t(p("cores")), key: "index", render: (_, r) => ({
      children: r.cores / r.nodes,
      props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
    }) },
    { dataIndex: "gpus", title: t(p("gpus")), key: "index", render: (_, r) => ({
      children: r.gpus / r.nodes,
      props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
    }) },
    { dataIndex: "mem", title: t(p("mem")), key: "index", render: (_, r) => ({
      children: r.mem / r.nodes,
      props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
    }) },
    { dataIndex: "qos", title: "QOS", key: "index", render: (_, r) => ({
      children: r.qos,
    }) },
    { dataIndex: "price", title: t(p("price")), key: "index", render: (_, r) => ({
      children: r.priceItem?.price ?? t(p("notDefined")),
    }) },
    {
      dataIndex: "amount",
      title: (
        <AmountStrategyDescriptionsItem isColTitle={true} />
      ),
      key: "index",
      render: (_, r) => ({
        children: (
          r.priceItem?.amount ? (
            <AmountStrategyDescriptionsItem isColContent={true} amount={r.priceItem?.amount} />
          ) : t(p("notDefined"))
        ),
      }),
    },
    { dataIndex: "comment", title: t(p("description")), key: "index", render: (_, r) => ({
      children: r.comment,
      props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
    }) },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      scroll={{ x: 800, y: 500 }}
      size="middle"
      bordered
      pagination={false}
      loading={loading}
    />
  );
};
