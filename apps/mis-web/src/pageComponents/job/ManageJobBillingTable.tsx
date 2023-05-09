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

import { MinusCircleOutlined, PlusCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { numberToMoney } from "@scow/lib-decimal";
import { Money } from "@scow/protos/build/common/money";
import { App, Form, Input, InputNumber, Modal, Popover, Select, Space, Table, Tooltip } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { CommonModalProps, ModalLink } from "src/components/ModalLink";
import { AmountStrategy, AmountStrategyAlgorithmDescriptions,
  AmountStrategyDescription,
  AmountStrategyDescriptions, AmountStrategyText } from "src/models/job";
import { moneyToString } from "src/utils/money";

interface Props {
  data?: {
    activeItems: BillingItemType[],
    historyItems: BillingItemType[],
    nextId: string,
  };
  loading?: boolean;
  tenant?: string;
  reload: () => void;
}

export interface BillingItemType {
  cluster: string;
  partition: string;
  qos: string;
  tenantName?: string;

  priceItem?: {
    itemId: string;
    price: Money;
    amountStrategy: string,
  }
}

export const ManageJobBillingTable: React.FC<Props> = ({ data, loading, tenant, reload }) => {

  return (
    <Table
      dataSource={data?.activeItems}
      bordered
      loading={loading}
      rowKey={(record) => [record.cluster, record.partition, record.qos].join(".")}
      expandable={{ expandedRowRender: (record) => {
        return (
          <Table
            dataSource={
              data?.historyItems
                .filter((x) => x.cluster === record.cluster && x.partition === record.partition && x.qos === record.qos)
                .reverse()
            }
            pagination={{ hideOnSinglePage: true }}
          >
            <Table.Column title="计费价格编号" dataIndex={["priceItem", "itemId"]} />
            <Table.Column
              title={AmountStrategyText}
              dataIndex={["priceItem", "amountStrategy"]}
              render={(value) => {
                return (
                  <Space>
                    {AmountStrategyDescriptions[value]}
                    <Popover title={`${AmountStrategyAlgorithmDescriptions[value]}`}>
                      <QuestionCircleOutlined />
                    </Popover>
                  </Space>
                );
              }}
            />
            <Table.Column title="单价（元）" dataIndex={["priceItem", "price"]} render={(value) => moneyToString(value)} />
            <Table.Column title="状态" render={(_) => "已作废"} />
          </Table>
        );
      },
      showExpandColumn:true,
      expandIcon: ({ expanded, onExpand, record }) =>
        expanded ? (
          <Tooltip title="收起历史计费项">
            <MinusCircleOutlined onClick={(e) => onExpand(record, e)} />
          </Tooltip>
        ) : (
          <Tooltip title="展开历史计费项">
            <PlusCircleOutlined onClick={(e) => onExpand(record, e)} />
          </Tooltip>
        ),
      }}
    >
      <Table.ColumnGroup title={(
        <Space>
          {"计费项"}
          <Popover title="集群, 分区, QOS共同组成一个计费项。对计费项可以设定计费方式和单价">
            <QuestionCircleOutlined />
          </Popover>
        </Space>
      )}
      >
        <Table.Column title="集群" dataIndex={"cluster"} />
        <Table.Column title="分区" dataIndex={"partition"} />
        <Table.Column title="QOS" dataIndex={"qos"} />
      </Table.ColumnGroup>
      <Table.Column title="计费价格编号" dataIndex={["priceItem", "itemId"]} />
      <Table.Column
        title={(
          <Space>
            {AmountStrategyText}
            <Popover
              title={AmountStrategyDescription}
              content={(
                <div>
                  <p>
                    {Object.entries(AmountStrategyDescriptions)
                      .map((value) => <p key={value[0]}>{`${value[1]}(${value[0]})`}</p>)}
                  </p>
                  <a href="https://pkuhpc.github.io/SCOW/docs/info/mis/business/billing">{"细节请查阅文档"}</a>
                </div>
              )}
            >
              <QuestionCircleOutlined />
            </Popover>
          </Space>
        )}
        dataIndex={["priceItem", "amountStrategy"]}
        render={(value) => {
          return (
            value ?
              (
                <Space>
                  {AmountStrategyDescriptions[value]}
                  <Popover title={`${AmountStrategyAlgorithmDescriptions[value]}`}>
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              ) : undefined
          );
        }}
      />
      <Table.Column
        title="单价（元）"
        dataIndex={["priceItem", "price"]}
        render={(value) => value ? moneyToString(value) : undefined}
      />
      <Table.Column title="状态" render={(record) => record.priceItem ? "执行中" : "未设置"} />
      <Table.Column<BillingItemType>
        title="设置"
        render={(_, r) => {
          return {
            children: (
              <Space>
                <EditPriceModalLink
                  nextId={data!.nextId}
                  cluster={r.cluster}
                  partition={r.partition}
                  qos={r.qos}
                  reload={reload}
                  tenant={tenant}
                >
                  设置
                </EditPriceModalLink>
              </Space>
            ),
          };
        }}
      />
    </Table>


  );
};

const EditPriceModal: React.FC<CommonModalProps & {
  nextId: string; cluster: string; partition: string; qos: string; tenant?: string; reload: () => void
}> = ({
  onClose, nextId, cluster, partition, qos, open, tenant, reload,
}) => {

  const { message } = App.useApp();

  const [form] = Form.useForm<{ price: number; amount: string; description: string }>();
  const [loading, setLoading] = useState(false);

  const onOk = async () => {
    const { amount, description, price } = await form.validateFields();

    setLoading(true);

    await api.addBillingItem({ body: {
      amount, itemId: nextId, path: [cluster, partition, qos].join("."),
      price: numberToMoney(price), description, tenant,
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
    <Modal title="设置计费价格" open={open} onCancel={onClose} onOk={onOk} destroyOnClose confirmLoading={loading}>
      <Form
        form={form}
      >
        <Form.Item label="对象">
          <strong>{tenant ? ("租户" + tenant) : "平台"}</strong>
        </Form.Item>
        <Form.Item label="计费项">
          集群 <strong>{cluster}</strong>，分区 <strong>{partition}</strong>，QOS <strong>{qos}</strong>
        </Form.Item>
        <Form.Item label="新计费价格编号">
          <strong>{nextId}</strong>
        </Form.Item>
        <Form.Item
          label={(
            <Space>
              {AmountStrategyText}
              <Popover
                title={AmountStrategyDescription}
                content={(
                  <div>
                    {Object.entries(AmountStrategyAlgorithmDescriptions)
                      .map((value) => <p key={value[0]}>{`${value[0]}: ${value[1]}`}</p>)}
                  </div>
                )}
              >
                <QuestionCircleOutlined />
              </Popover>
            </Space>
          )}
          name="amount"
          rules={[{ required: true }]}
        >
          <Select
            options={
              Object.values(AmountStrategy)
                .map((x) => ({ label: AmountStrategyDescriptions[x], value: x }))}
            dropdownMatchSelectWidth={false}

          />
        </Form.Item>
        <Form.Item label="价格（元）" name="price" initialValue={0} rules={[{ required: true }]}>
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
