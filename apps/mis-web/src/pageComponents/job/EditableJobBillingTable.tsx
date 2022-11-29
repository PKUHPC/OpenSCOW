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

import { numberToMoney } from "@scow/lib-decimal";
import { Form, Input, InputNumber, Modal, Select, Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { api } from "src/apis";
import { JobBillingTableItem } from "src/components/JobBillingTable";
import { CommonModalProps, ModalLink } from "src/components/ModalLink";
import { useMessage } from "src/layouts/prompts";
import { AmountStrategy } from "src/models/job";
import { publicConfig } from "src/utils/config";

const columns: ColumnsType<JobBillingTableItem> = [
  { dataIndex: "cluster", title: "集群", key: "index", render: (_, r) => ({
    children: publicConfig.CLUSTERS[r.cluster]?.name ?? r.cluster,
    props: { rowSpan: r.clusterItemIndex === 0 ? r.partitionCount * r.qosCount : 0 },
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
  { dataIndex: "priceItem", title: "当前计费项", key: "index", render: (_, r) => ({
    children: r.priceItem
      ? `${r.priceItem.itemId} (${r.priceItem.price}, ${r.priceItem.amount})`
      : "未设置",
  }) },
];

const EditPriceModal: React.FC<CommonModalProps & {
  current: JobBillingTableItem["priceItem"]; path: string; tenant?: string; reload: () => void
}> = ({
  current, onClose, path, open, tenant, reload,
}) => {


  const message = useMessage();

  const [form] = Form.useForm<{ price: number; itemId: string; amount: string; description: string }>();
  const [loading, setLoading] = useState(false);

  const onOk = async () => {
    const { amount, description, itemId, price } = await form.validateFields();

    setLoading(true);

    await api.addBillingItem({ body: {
      amount, itemId, path, price: numberToMoney(price), description, tenant,
    } })
      .httpError(409, () => { message.error("此ID已经被使用！"); })
      .then(() => {
        message.success("添加成功！");
        reload();
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal title="编辑作业价格项" open={open} onCancel={onClose} onOk={onOk} destroyOnClose confirmLoading={loading}>
      <Form
        form={form}
        initialValues={{
          itemId: current?.itemId,
          amount: current?.amount ?? AmountStrategy.CPUS_ALLOC,
          price: current?.price ?? 0,
          description: "",
        }}
      >
        <Form.Item label="租户">
          <strong>{tenant ?? "默认价格项"}</strong>
        </Form.Item>
        <Form.Item label="计费路径">
          <strong>{path}</strong>
        </Form.Item>
        <Form.Item label="计费项ID" name="itemId" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="计费策略" name="amount" rules={[{ required: true }]}>
          <Select options={Object.values(AmountStrategy).map((x) => ({ label: x, value: x }))} />
        </Form.Item>
        <Form.Item label="价格（元）" name="price" rules={[{ required: true }]}>
          <InputNumber precision={3} min={0} />
        </Form.Item>
        <Form.Item label="备注" name="description">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EditPriceModalLink = ModalLink(EditPriceModal);

interface Props {
  data?: JobBillingTableItem[]
  loading?: boolean;
  tenant?: string;
  reload: () => void;
}

export const EditableJobBillingTable: React.FC<Props> = ({ data, loading, tenant, reload }) => {
  return (
    <Table
      dataSource={data}
      columns={[
        ...columns,
        { dataIndex: "price", title: "设置", key: "index", render: (_, r) => {
          return {
            children: (
              <Space>
                <EditPriceModalLink current={r.priceItem} path={r.path} reload={reload} tenant={tenant}>
                设置
                </EditPriceModalLink>
              </Space>
            ),
          };
        } },
      ]}
      scroll={{ x: 800 }}
      size="middle"
      bordered
      pagination={false}
      loading={loading}
    />
  );
};

