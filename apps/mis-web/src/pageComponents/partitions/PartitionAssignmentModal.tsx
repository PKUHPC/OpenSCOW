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

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { App, Form, Modal, Space, Table } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { ModalLink } from "src/components/ModalLink";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { AssignablePartition, AssignmentState, AssignmentType, PartitionOperationType } from "src/models/cluster";

interface Props {
  operationType: PartitionOperationType
  accountName: string | undefined;
  tenantName: string | undefined;
  assignablePartitions: AssignablePartition[];
  onClose: () => void;
  reload: () => void;
  open: boolean;
}

interface FormFields {
  blockThresholdAmount: number;
}


export const PartitionAssignmentModal: React.FC<Props> = ({
  operationType, accountName, tenantName, assignablePartitions,
  onClose, reload, open,
}) => {

  const t = useI18nTranslateToString();

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const { message, modal } = App.useApp();


  const assinPartition = async (
    operationType: PartitionOperationType,
    accountName: string | undefined,
    tenantName: string | undefined,
    assignMentType: AssignmentType,
  ) => {
    setLoading(true);

    // 授权分区
    if (assignMentType === AssignmentType.ASSIGN) {

      // 根据 OperationType 进行对租户/账户的授权

    // 取消授权分区
    } else {

      // 根据 OperationType 进行对租户/账户的取消授权

    }
    // await api .setBlockThreshold({ body: { accountName, blockThresholdAmount } })
    //   .then((res) => {
    //     if (res.executed) {
    //       message.success(t(p("setSuccess")));
    //       reload();
    //       onClose();
    //     } else {
    //       message.error(res.reason || t(p("setFail")));
    //     }
    //   })
    //   .finally(() => setLoading(false));
  };

  return (
    <Modal
      title="配置可用分区"
      open={open}
      onCancel={onClose}
      confirmLoading={loading}
      footer={null}
    >
      <Form
        form={form}
        initialValues={assignablePartitions}
      >
        {
          operationType === PartitionOperationType.TENANT_OPERATION ? (
            <Form.Item label="租户">
              <strong>{tenantName}</strong>
            </Form.Item>
          ) : (
            <Form.Item label="账户">
              <strong>{accountName}</strong>
            </Form.Item>
          )
        }
      </Form>

      <Table
        tableLayout="fixed"
        dataSource={assignablePartitions}
        loading={loading}
        pagination={false}
        rowKey="partition"
        scroll={{ y : 500 }}
      >
        <Table.Column<AssignablePartition>
          dataIndex="clusterId"
          title="集群"
          // sorter={(a, b) => a.id.localeCompare(b.id)}
          // sortDirections={["ascend", "descend"]}
          // sortOrder={currentSortInfo.field === "id" ? currentSortInfo.order : null}
        />
        <Table.Column<AssignablePartition>
          dataIndex="partition"
          title="分区"
          // sorter={(a, b) => a.name.localeCompare(b.name)}
          // sortDirections={["ascend", "descend"]}
          // sortOrder={currentSortInfo.field === "name" ? currentSortInfo.order : null}
        />
        <Table.Column<AssignablePartition>
          dataIndex="assignmentState"
          title="操作"
          width="15%"
          fixed="right"
          render={(_, r) => (
            <Space>
              {
                r.assignmentState === AssignmentState.ASSIGNED && (
                  <a onClick={() => {
                    const contentTexts = operationType === PartitionOperationType.TENANT_OPERATION
                      ? `确定要在分区${r.partition}下取消对租户${tenantName}的分区授权吗？取消授权后，该租户下所有账户将无法使用此分区`
                      : `确定要在分区${r.partition}下取消对账户${accountName}的分区授权吗？取消授权后，该账户将无法使用此分区`;
                    modal.confirm({
                      title: "取消授权",
                      icon: <ExclamationCircleOutlined />,
                      content: contentTexts,
                      onOk: async () => {

                        // 对租户/账户取消授权
                        // await unAssignablePartitions()
                      },
                    });

                  }}
                  >
                    取消授权
                  </a>
                )}
              {
                r.assignmentState === AssignmentState.UNASSIGNED && (
                  <a onClick={() => {
                    const operationTarget = operationType === PartitionOperationType.TENANT_OPERATION
                      ? `租户${tenantName}` : `账户${accountName}`;
                    modal.confirm({
                      title: "授权",
                      icon: <ExclamationCircleOutlined />,
                      content: `确定在分区${r.partition}下对${operationTarget}进行授权吗？`,
                      onOk: async () => {

                        // 对租户/账户授权
                        // await unAssignablePartitions()
                      },
                    });
                  }}
                  >
                    授权
                  </a>
                )}
            </Space>
          )}
        />
      </Table>

    </Modal>

  );
};


// interface PartitionsTableProps {
//   data: any;
//   isLoading: boolean;
//   reload: () => void;
//   target: "account" | "tenant";
// }

// // const p = prefix("component.others.");
// // const pCommon = prefix("common.");

// export const PartitionsTable: React.FC<PartitionsTableProps> = ({ data, isLoading, reload, target }) => {

//   // const t = useI18nTranslateToString();
//   // const languageId = useI18n().currentLanguage.id;

//   const columns: ColumnsType<JobBillingTableItem> = [
//     ...(isUserPartitionsPage ? [] : [
//       { dataIndex: "cluster", title: t(pCommon("cluster")), key: "index", render: (_, r) => ({
//         children: getI18nConfigCurrentText(publicConfig.CLUSTERS[r.cluster]?.name, languageId) ?? r.cluster,
//         props: { rowSpan: r.clusterItemIndex === 0 && clusterTotalQosCounts ? clusterTotalQosCounts[r.cluster] : 0 },
//       }) },
//     ])
//     ,
//     { dataIndex: "partition", title: t(p("partitionFullName")), key: "index", render: (_, r) => ({
//       children: r.partition,
//       props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
//     }) },
//     { dataIndex: "nodes", title: t(p("nodes")), key: "index", render: (_, r) => ({
//       children: r.nodes,
//       props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
//     }) },
//     { dataIndex: "cores", title: t(p("cores")), key: "index", render: (_, r) => ({
//       children: r.cores / r.nodes,
//       props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
//     }) },
//     { dataIndex: "gpus", title: t(p("gpus")), key: "index", render: (_, r) => ({
//       children: r.gpus / r.nodes,
//       props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
//     }) },
//     { dataIndex: "mem", title: t(p("mem")), key: "index", render: (_, r) => ({
//       children: r.mem / r.nodes,
//       props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
//     }) },
//     { dataIndex: "qos", title: "QOS", key: "index", render: (_, r) => ({
//       children: r.qos,
//     }) },
//     { dataIndex: "price", title: t(p("price")), key: "index", render: (_, r) => ({
//       children: r.priceItem?.price ?? t(p("notDefined")),
//     }) },
//     {
//       dataIndex: "amount",
//       title: (
//         <AmountStrategyDescriptionsItem isColTitle={true} />
//       ),
//       key: "index",
//       render: (_, r) => ({
//         children: (
//           r.priceItem?.amount ? (
//             <AmountStrategyDescriptionsItem isColContent={true} amount={r.priceItem?.amount} />
//           ) : t(p("notDefined"))
//         ),
//       }),
//     },
//     { dataIndex: "comment", title: t(p("description")), key: "index", render: (_, r) => ({
//       children: r.comment,
//       props: { rowSpan: r.partitionItemIndex === 0 ? r.qosCount : 0 },
//     }) },
//   ];

//   return (
//     <Table
//       dataSource={data}
//       columns={columns}
//       scroll={{ x: 800, y: 500 }}
//       size="middle"
//       bordered
//       pagination={false}
//       loading={loading}
//     />
//   );
// };



export const PartitionAssignmentLink = ModalLink(PartitionAssignmentModal);
