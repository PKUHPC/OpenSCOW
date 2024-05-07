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
import { ClusterActivationStatus } from "@scow/config/build/type";
import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { App, Button, Form, Space, Table, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { useStore } from "simstate";
import { api } from "src/apis";
import { ClusterSelector } from "src/components/ClusterSelector";
import { DeactivateClusterModalLink } from "src/components/DeactivateClusterModal";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { prefix, useI18n, useI18nTranslate } from "src/i18n";
import { ClusterConnectionStatus } from "src/models/cluster";
import { CombinedClusterInfo } from "src/pages/admin/resource/clusterManagement";
import { ActivatedClustersStore } from "src/stores/ActivatedClustersStore";
import { getSortedClusterValues } from "src/utils/cluster";
import { Cluster, publicConfig } from "src/utils/config";

interface Props {
  data?: Record<string, CombinedClusterInfo>;
  isLoading: boolean;
  reload: () => void;
}


interface FilterForm {
  clusters: Cluster[];
}

const p = prefix("page.admin.resourceManagement.clusterManagement.");
const pCommon = prefix("common.");

export const ClusterManagementTable: React.FC<Props> = ({
  data, isLoading, reload,
}) => {

  const { setActivatedClusters } = useStore(ActivatedClustersStore);

  const { message, modal } = App.useApp();
  const [form] = Form.useForm<FilterForm>();

  const tArgs = useI18nTranslate();
  const languageId = useI18n().currentLanguage.id;

  const [query, setQuery] = useState<FilterForm>(() => {

    return {
      clusters: getSortedClusterValues(),
    };
  });

  const filteredData = useMemo(() => {

    if (!data) return undefined;

    if (!query.clusters || query.clusters.length === 0) {
      return Object.values(data);
    }

    const filteredValues = Object.entries(data)
      .filter(([clusterId]) => query.clusters.some((c) => c.id === clusterId))
      .map(([_, value]) => value);

    return filteredValues;

  }, [data, query]);


  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            setQuery(await form.validateFields());
          }}
        >
          <Form.Item label={tArgs(p("clusterFilter"))} name="clusters" style={{ minWidth: "200px" }}>
            <ClusterSelector isUsingAllConfigClusters={true} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{tArgs(pCommon("search"))}</Button>
            </Space>
          </Form.Item>
        </Form>
      </FilterFormContainer>

      <Table
        tableLayout="fixed"
        dataSource={filteredData}
        loading={isLoading}
        pagination={false}
        rowKey="clusterId"
      >
        <Table.Column<CombinedClusterInfo>
          dataIndex="clusterId"
          title={tArgs(p("table.clusterName"))}
          render={(_, r) => {
            return getI18nConfigCurrentText(r.clusterId, languageId);
          }}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="partitions"
          title={tArgs(p("table.nodesCount"))}
          render={(_, r) => r.partitions?.reduce((sum, p) => sum + p.nodes, 0) || 0}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="partitions"
          title={tArgs(p("table.cpusCount"))}
          render={(_, r) => r.partitions?.reduce((sum, p) => sum + p.cores, 0) || 0}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="partitions"
          title={tArgs(p("table.gpusCount"))}
          render={(_, r) => r.partitions?.reduce((sum, p) => sum + p.gpus, 0) || 0}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="partitions"
          title={tArgs(p("table.totalMemMb"))}
          width="10%"
          render={(_, r) => {
            const totalMemMb = r.partitions?.reduce((sum, p) => sum + p.memMb, 0) || 0;
            return `${totalMemMb} MB`;
          }}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="connectionStatus"
          title={tArgs(p("table.clusterState"))}
          render={(_, r) => (
            r.connectionStatus === ClusterConnectionStatus.ERROR ? (
              <Tag color="red">{tArgs(p("table.errorState"))}</Tag>
            ) : (
              r.activationStatus === ClusterActivationStatus.DEACTIVATED ?
                <Tag color="red">{tArgs(p("table.deactivatedState"))}</Tag> :
                <Tag color="green">{tArgs(p("table.normalState"))}</Tag>
            )
          )}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="operatorId"
          title={tArgs(p("table.operator"))}
          width="20%"
          render={(_, r) => {
            return r.operatorId ? `${r.operatorName}（ID: ${r.operatorId}）` : "";
          }}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="updateTime"
          title={tArgs(p("table.operatedTime"))}
          width="15%"
          render={(_, r) => formatDateTime(r.updateTime)}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="deactivationComment"
          ellipsis
          title={tArgs(p("table.comment"))}
        />
        <Table.Column<CombinedClusterInfo>
          title={tArgs(p("table.operation"))}
          fixed="right"
          width="10%"
          render={(_, r) => {
            const clusterName
            = getI18nConfigCurrentText(publicConfig.CLUSTERS[r.clusterId].name, languageId);
            return (
              <>
                {
                  r.activationStatus === ClusterActivationStatus.DEACTIVATED
                && r.connectionStatus === ClusterConnectionStatus.AVAILABLE
                  && (
                    <>
                      <a onClick={() => {

                        modal.confirm({
                          title: tArgs(p("activateModal.title")),
                          icon: <ExclamationCircleOutlined />,
                          content: (
                            <>
                              <p>
                                {tArgs(p("activateModal.content"), [
                                  <strong key="clusterName">{clusterName}</strong>,
                                  <strong key="clusterId">{r.clusterId}</strong>,
                                ])},
                              </p>
                              <p style={{ color: "red" }}>{tArgs(p("activateModal.contentAttention"))}</p>
                            </>
                          ),
                          onOk: async () => {
                            await api.activateCluster({
                              body: {
                                clusterId: r.clusterId,
                              },
                            })
                              .then((res) => {
                                if (res.executed) {
                                  const webActivatedClusters = res.currentActivatedClusters?.reduce((acc, curr) => {
                                    acc[curr.clusterId] =
                                    { id: curr.clusterId, name: publicConfig.CLUSTERS[curr.clusterId].name };
                                    return acc;
                                  }, {} as {[clusterId: string]: Cluster});
                                  setActivatedClusters(webActivatedClusters ?? {});
                                  message.success(tArgs(p("activateModal.successMessage")));
                                  reload();
                                } else {
                                  message.error(res.reason || tArgs(p("activateModal.failureMessage")));
                                  reload();
                                }
                              });
                          },
                        });

                      }}
                      >
                        {tArgs(p("table.activate"))}
                      </a>
                    </>
                  )
                }
                { r.activationStatus === ClusterActivationStatus.ACTIVATED && (
                  <>
                    <DeactivateClusterModalLink
                      clusterId={r.clusterId}
                      clusterName={clusterName}
                      onComplete={async (confirmedClusterId, deactivationComment) => {

                        return await api.deactivateCluster({ body:{
                          clusterId: confirmedClusterId,
                          deactivationComment,
                        } }).then((res) => {
                          if (res.executed) {
                            message.success(tArgs(p("deactivateModal.successMessage")));
                            reload();
                            const webActivatedClusters = res.currentActivatedClusters?.reduce((acc, curr) => {
                              acc[curr.clusterId] =
                              { id: curr.clusterId, name: publicConfig.CLUSTERS[curr.clusterId].name };
                              return acc;
                            }, {} as {[clusterId: string]: Cluster});
                            setActivatedClusters(webActivatedClusters ?? {});
                          } else {
                            message.error(tArgs(p("deactivateModal.failureMessage")));
                            reload();
                          }
                        });

                      }}
                    >
                      {tArgs(p("table.deactivate"))}
                    </DeactivateClusterModalLink>
                  </>
                )
                }
              </>
            ); }}
        />
      </Table>
    </div>
  );
};
