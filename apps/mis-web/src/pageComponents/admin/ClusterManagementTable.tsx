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
import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { App, Button, Form, Space, Table, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { useStore } from "simstate";
import { api } from "src/apis";
import { ClusterSelector } from "src/components/ClusterSelector";
import { DeactivateClusterModalLink } from "src/components/DeactivateClusterModal";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterConnectionStatus, ClusterOnlineStatus } from "src/models/cluster";
import { CombinedClusterInfo } from "src/pages/admin/resource/clusterManagement";
import { OnlineClustersStore } from "src/stores/OnlineClustersStore";
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

// const p = prefix("page.admin.systemDebug.clusterManagement");
const pCommon = prefix("common.");

export const ClusterManagementTable: React.FC<Props> = ({
  data, isLoading, reload,
}) => {

  const { setOnlineClusters } = useStore(OnlineClustersStore);

  const { message, modal } = App.useApp();
  const [form] = Form.useForm<FilterForm>();

  const t = useI18nTranslateToString();
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
          <Form.Item label="集群" name="clusters" style={{ minWidth: "200px" }}>
            <ClusterSelector isUsingAllConfigClusters={true} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{t(pCommon("search"))}</Button>
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
        // scroll={{ x: filteredData?.length ? 1200 : true }}
        // onChange={handleTableChange}
      >
        <Table.Column<CombinedClusterInfo>
          dataIndex="clusterId"
          title="集群名称"
          render={(_, r) => {
            // const clusterName = publicConfig.CLUSTERS[r.clusterId].name ?? r.clusterId;
            return getI18nConfigCurrentText(r.clusterId, languageId);
          }}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="partitions"
          title="节点总数"
          render={(_, r) => r.partitions?.reduce((sum, p) => sum + p.nodes, 0) || 0}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="partitions"
          title="CPU总核数"
          render={(_, r) => r.partitions?.reduce((sum, p) => sum + p.cores, 0) || 0}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="partitions"
          title="GPU总卡数"
          render={(_, r) => r.partitions?.reduce((sum, p) => sum + p.gpus, 0) || 0}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="partitions"
          title="内存总容量"
          width="10%"
          render={(_, r) => {
            const totalMemMb = r.partitions?.reduce((sum, p) => sum + p.memMb, 0) || 0;
            return `${totalMemMb} MB`;
          }}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="connectionStatus"
          title="集群状态"
          render={(_, r) => (
            r.connectionStatus === ClusterConnectionStatus.ERROR ? (
              <Tag color="red">异常</Tag>
            ) : (
              r.onlineStatus === ClusterOnlineStatus.OFFLINE ?
                <Tag color="red">停用</Tag> :
                <Tag color="green">正常</Tag>
            )
          )}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="operatorId"
          title="操作员"
          width="20%"
          render={(_, r) => {
            return r.operatorId ? `${r.operatorName}（ID: ${r.operatorId}）` : "";
          }}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="updateTime"
          title="操作时间"
          width="15%"
          render={(_, r) => formatDateTime(r.updateTime)}
        />
        <Table.Column<CombinedClusterInfo>
          dataIndex="comment"
          ellipsis
          title="备注"
        />
        <Table.Column<CombinedClusterInfo>
          title="操作"
          fixed="right"
          width="10%"
          render={(_, r) => {
            const clusterName
            = getI18nConfigCurrentText(publicConfig.CLUSTERS[r.clusterId].name, languageId);
            return (
              <>
                {
                  r.onlineStatus === ClusterOnlineStatus.OFFLINE
                && r.connectionStatus === ClusterConnectionStatus.AVAILABLE
                  && (
                    <>
                      <a onClick={() => {

                        modal.confirm({
                          title: "启用集群",
                          icon: <ExclamationCircleOutlined />,
                          content: (
                            <>
                              <p>
                                请确认是否启用集群名称是 <strong>{clusterName}</strong>，集群ID是 <strong>{r.clusterId}</strong> 的集群？
                              </p>
                              <p style={{ color: "red" }}>注意：启用后请手动同步平台数据。</p>
                            </>
                          ),
                          onOk: async () => {
                            await api.activateCluster({
                              body: {
                                clusterId: r.clusterId,
                                comment: "",
                              },
                            })
                              .then((res) => {
                                if (res.executed) {
                                  const webOnlineClusters = res.currentOnlineClusters?.reduce((acc, curr) => {
                                    acc[curr.clusterId] =
                                    { id: curr.clusterId, name: publicConfig.CLUSTERS[curr.clusterId].name };
                                    return acc;
                                  }, {} as {[clusterId: string]: Cluster});
                                  // setOnlineClusters((prev) => ({
                                  //   ...prev,
                                  //   [r.clusterId]: publicConfig.CLUSTERS[r.clusterId],
                                  // }));
                                  setOnlineClusters(webOnlineClusters ?? {});
                                  message.success("集群已启用");
                                  reload();
                                } else {
                                  message.error(res.reason || "集群启用失败");
                                  reload();
                                }
                              });
                          },
                        });

                      }}
                      >
                      启用
                      </a>
                    </>
                  )
                }
                { r.onlineStatus === ClusterOnlineStatus.ONLINE && (
                  <>
                    <DeactivateClusterModalLink
                      clusterId={r.clusterId}
                      clusterName={clusterName}
                      onComplete={async (confirmedClusterId, comment) => {

                        return await api.deactivateCluster({ body:{
                          clusterId: confirmedClusterId,
                          comment,
                        } }).then((res) => {
                          if (res.executed) {
                            message.success("集群已停用");
                            reload();
                            const webOnlineClusters = res.currentOnlineClusters?.reduce((acc, curr) => {
                              acc[curr.clusterId] =
                              { id: curr.clusterId, name: publicConfig.CLUSTERS[curr.clusterId].name };
                              return acc;
                            }, {} as {[clusterId: string]: Cluster});
                            setOnlineClusters(webOnlineClusters ?? {});
                            // setOnlineClusters((prev) => {
                            //   delete prev[r.clusterId];
                            //   return prev;
                            // });
                          } else {
                            message.error(res.reason || "集群停用失败");
                          }
                        });

                      }}
                    >
                      停用
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
