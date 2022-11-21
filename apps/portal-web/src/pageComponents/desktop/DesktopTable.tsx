import { PlusOutlined } from "@ant-design/icons";
import { Form, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { PageTitle } from "src/components/PageTitle";
import { DesktopTableActions } from "src/pageComponents/desktop/DesktopTableActions";
import { NewDesktopTableModal } from "src/pageComponents/desktop/NewDesktopTableModal";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { publicConfig } from "src/utils/config";
import { queryToString } from "src/utils/querystring";

const NewDesktopTableModalButton = ModalButton(NewDesktopTableModal, { type: "primary", icon: <PlusOutlined /> });

interface Props {

}

export type DesktopItem = {
  desktopId: number,
  addr: string,
}

export const DesktopTable: React.FC<Props> = () => {

  const router = useRouter();

  const defaultClusterStore = useStore(DefaultClusterStore);

  const clusterQuery = queryToString(router.query.cluster);
  const cluster = publicConfig.CLUSTERS.find((x) => x.id === clusterQuery) ?? defaultClusterStore.cluster;

  const { data, isLoading, reload } = useAsync({
    promiseFn: useCallback(async () => {
      // List all desktop
      const result = await api.listDesktops({ query: { cluster: cluster.id } });

      return result.displayId.map((x) => ({ desktopId: x, addr: result.node }));

    }, [cluster]),
  });

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
      <PageTitle titleText="登录节点上的桌面">
        <NewDesktopTableModalButton reload={reload}>
        新建桌面
        </NewDesktopTableModalButton>
      </PageTitle>
      <FilterFormContainer>
        <Form layout="inline">
          <Form.Item label="集群">
            <SingleClusterSelector
              value={cluster}
              onChange={(x) => {
                router.push({ query: { cluster: x.id } });
              }}
            />
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

