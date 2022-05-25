import { Button, Col, Form, Modal, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { DesktopTableActions, openDesktop } from "src/pageComponents/desktop/DesktopTableActions";
import { Cluster, CLUSTERS, CLUSTERS_ID_MAP } from "src/utils/config";

interface Props {

}

export type DesktopItem = {
  desktopId: number,
  cluster: Cluster,
  addr: string,
}

export const DesktopTable: React.FC<Props> = () => {

  type ClusterInfo = {
    cluster: string,
  }

  //Is the modal visible
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [form] = Form.useForm<ClusterInfo>();

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

  const onClick = async (values) => {

    setIsModalVisible(false);

    //Create new desktop
    const resp = await api.createDesktop({ body: { cluster: values["cluster"].id } })
      .httpError(409, (e) => {
        const { code, message:serverMessage } = e;
        if (code === "RESOURCE_EXHAUSTED") {
          Modal.error({
            title: "新建桌面失败",
            content: `该集群桌面数目达到最大限制。已经创建了${serverMessage}个桌面，最多可创建${serverMessage}个桌面。`,
          });
        } else {
          throw e;
        }
      });

    openDesktop(resp.node, resp.port, resp.password);
    reload();
  };

  return (
    <div >
      <Button type="primary" onClick={() => { setIsModalVisible(true); }} style={{ marginBottom: "20px" }}>
        新建桌面
      </Button >
      <Modal
        title="新建桌面"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={onClick}
          style={{ margin:"10%" }} >
          <Form.Item
            label="集群"
            name="cluster"
            rules={[
              {
                required: true,
                message: "请选择一个集群!",
              },
            ]}>
            <SingleClusterSelector />
          </Form.Item>
          <Form.Item>
            <Row>
              <Col span={24} style={{ textAlign: "right" }}>
                <Button type="primary" htmlType="submit">
                  新建
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
      <Table dataSource={data} columns={columns} rowKey={(record) => record.desktopId} loading={isLoading} />
    </div>
  );
};

