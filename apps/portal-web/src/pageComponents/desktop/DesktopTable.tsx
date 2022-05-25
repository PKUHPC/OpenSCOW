import { PlusOutlined } from "@ant-design/icons";
import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ModalButton } from "src/components/ModalLink";
import { PageTitle } from "src/components/PageTitle";
import { DesktopTableActions } from "src/pageComponents/desktop/DesktopTableActions";
import { NewDesktopTableModal } from "src/pageComponents/desktop/NewDesktopTableModal";
import { Cluster, CLUSTERS, CLUSTERS_ID_MAP } from "src/utils/config";

const NewDesktopTableModalButton = ModalButton(NewDesktopTableModal, { type: "primary", icon: <PlusOutlined /> });

interface Props {

}

export type DesktopItem = {
  desktopId: number,
  cluster: Cluster,
  addr: string,
}

export const DesktopTable: React.FC<Props> = () => {


  const { data, isLoading, reload } = useAsync({
    promiseFn: useCallback(async () => {
      //List all desktop
      const { result } = await api.listDesktops({ body: { clusters: CLUSTERS.map((x) => x.id) } });

      const desktopList: DesktopItem[] = [];

      //Splice data
      result.connections.forEach((x)=>{
        x.displayId.forEach((displayId) => {
          desktopList.push({ desktopId: displayId, cluster: CLUSTERS_ID_MAP[x.cluster], addr: x.node });
        });
      });

      return desktopList;

    }, []),
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
      title: "集群",
      dataIndex: "cluster",
      width: "20%",
      render: (_, record) => (
        record.cluster.name
      ),
    },
    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <DesktopTableActions reload={reload} record={record} />
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

