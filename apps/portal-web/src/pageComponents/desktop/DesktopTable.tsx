import { Button, Col, Form, Modal, Row, Table } from "antd";
import React, { useEffect, useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import type { ListDesktopReply_Connection } from "src/generated/portal/vnc";
import { DesktopTableActions, openDesktop } from "src/pageComponents/desktop/DesktopTableActions";
import { CLUSTERS } from "src/utils/config";

interface Props {

}

export type DesktopItem = {
  desktop: string,
  clusterId: string,
  node: string,
}

export const DesktopTable: React.FC<Props> = () => {

  type ClusterInfo = {
    cluster: string,
  }

  //Has the table changed
  const [isChange, setChange] = useState(false);

  //Table data
  const [data, setData] = useState<DesktopItem[]>();

  //Table loading
  const [tableLoading, setTableLoading] = useState(false);

  //Is the table visible
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [form] = Form.useForm<ClusterInfo>();

  //Get table data
  useEffect(() => {
    const getdatas = async () => {
      //Table load when fetching data
      setTableLoading(true);

      //List all desktop
      const { result } = await api.listDesktop({ body: { clusters: CLUSTERS.map((x) => x.id) } });

      const desktopList: DesktopItem[] = [];
      const connectList: ListDesktopReply_Connection[] = result.connection;

      //Splice data
      connectList.forEach((x)=>{
        x.displayId.forEach((y) => {
          desktopList.push({ desktop: `${x.clusterName}:${y}`,clusterId:`${x.clusterId}`, node: `${x.node}` });
        });
      });

      setTableLoading(false);
      setData(desktopList);
    };
    getdatas();
  }, [isChange]);

  const columns = [
    {
      title: "桌面",
      dataIndex: "desktop",
      key: "desktop",
      width: "30%",
    },
    {
      title: "地址",
      dataIndex: "node",
      key: "node",
      width: "30%",
    },
    {
      title: "集群ID",
      dataIndex: "clusterId",
      key: "clusterId",
      width: "20%",
    },
    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record:DesktopItem) => (
        <DesktopTableActions isChange={isChange} setChange={setChange} record={record} />
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
    setChange(!isChange);
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
      < Table dataSource={data} columns={columns} rowKey={(record) => record.desktop} loading={tableLoading} />
    </div>
  );
};

