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

import { PlusOutlined } from "@ant-design/icons";
import { queryToString } from "@scow/lib-web/build/utils/querystring";
import { Button, Form, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { DesktopTableActions } from "src/pageComponents/desktop/DesktopTableActions";
import { NewDesktopTableModal } from "src/pageComponents/desktop/NewDesktopTableModal";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster, publicConfig } from "src/utils/config";

const NewDesktopTableModalButton = ModalButton(NewDesktopTableModal, { type: "primary", icon: <PlusOutlined /> });

interface Props {
  loginDesktopEnabledClusters: Cluster[]
}

export type DesktopItem = {
  desktopId: number,
  addr: string,
}

export const DesktopTable: React.FC<Props> = ({ loginDesktopEnabledClusters }) => {

  const router = useRouter();

  const defaultClusterStore = useStore(DefaultClusterStore);

  const clusterQuery = queryToString(router.query.cluster);

  // 如果默认集群没开启登录节点桌面功能，则取开启此功能的某一集群为默认集群。
  const defaultCluster = loginDesktopEnabledClusters.includes(defaultClusterStore.cluster)
    ? defaultClusterStore.cluster
    : loginDesktopEnabledClusters[0];
  const cluster = publicConfig.CLUSTERS.find((x) => x.id === clusterQuery) ?? defaultCluster;
  
  const { data, isLoading, reload } = useAsync({
    promiseFn: useCallback(async () => {
      // List all desktop
      const result = await api.listDesktops({ query: { cluster: cluster.id } });

      return result.displayId.map((x) => ({ desktopId: x, addr: result.host }));

    }, [cluster]),
  });

  console.log("loginDesktopEnabledClusters: ", loginDesktopEnabledClusters);

  const columns: ColumnsType<DesktopItem> = [
    {
      title: "桌面ID",
      dataIndex: "desktopId",
      key: "desktopId",
      width: "30%",
    },
    {
      title: "地址",
      dataIndex: "addr",
      key: "addr",
      width: "30%",
    },
    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <DesktopTableActions cluster={cluster} reload={reload} record={record} />
      ),
    },
  ];

  return (
    <div>
      <FilterFormContainer>
        <Form layout="inline">
          <Form.Item label="集群">
            <SingleClusterSelector
              value={cluster}
              onChange={(x) => {
                router.push({ query: { cluster: x.id } });
              }}
              clusters={loginDesktopEnabledClusters}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={reload} loading={isLoading}>
              刷新
            </Button>
          </Form.Item>
          <Form.Item>
            <NewDesktopTableModalButton reload={reload} cluster={cluster}>
              新建桌面
            </NewDesktopTableModalButton>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(record) => record.desktopId}
        loading={isLoading}
        pagination={false}
      />
    </div>
  );
};

