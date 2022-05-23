import { Button, Col, Form, Modal, Row, Select, Table } from "antd";
import FormItem from "antd/lib/form/FormItem";
import React, { useEffect, useState } from "react";
import { api as realApi } from "src/apis/api";
import { DesktopTableActions } from "src/pageComponents/desktop/DesktopTableActions";
import { CLUSTERS, publicConfig } from "src/utils/config";

const { Option } = Select;

interface Props {

}

export const DesktopTable: React.FC<Props> = () => {

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  type DesktopItem = {
    desktop: string,
    node_addr: string,
  }

  type cluster_info = {
    cluster: string,
  }

  //Has the table changed
  const [ischange, setchange] = useState(false);

  //Table data
  const [data, setData] = useState<DesktopItem[]>();

  //Table loading
  const [tableloading, settableloading] = useState(false);

  //Is the table visible
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [form] = Form.useForm<cluster_info>();

  //Get table data
  useEffect(() => {
    const getdatas = async () => {
      //Table load when fetching data
      settableloading(true);

      //List all desktop
      const resp = await realApi.listDesktop({ body: { clusters: CLUSTERS.map((x) => x.id) } });

      const desktoplist: DesktopItem[] = [];

      //Splice data
      await asyncForEach(resp.listDesktopReply.ConnectionInfo, async (x) => {
        const cluster_name = x.cluster;
        await asyncForEach(x.displayId, async (y) => {
          desktoplist.push({ desktop: `${cluster_name}:${y}`, node_addr: `${x.nodeAddr}` });
        });
      });

      settableloading(false);
      setData(desktoplist);
    };
    getdatas();
  }, [ischange]);

  const columns = [
    {
      title: "桌面",
      dataIndex: "desktop",
      key: "desktop",
    },
    {
      title: "地址",
      dataIndex: "node_addr",
      key: "node_addr",
    },
    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <DesktopTableActions ischange={ischange} setchange={setchange} record={record} />
      ),
    },
  ];

  const onClick = async (values) => {

    setIsModalVisible(false);

    //Create new desktop
    const resp = await realApi.createDesktop({ body: { cluster: values["cluster"] } });

    if (resp.createSuccess === true) {
      const params = new URLSearchParams({
        path: `/vnc-server/${resp.node}/${resp.port}`,
        password: resp.password,
        autoconnect: "true",
        reconnect: "true",
      });
  
      window.open("/vnc/vnc.html?" + params.toString(), "_blank");

      setchange(!ischange);
    } else {

      Modal.error({
        title: "新建桌面失败",
        content: `桌面数目达到最大限制，已经创建了${resp.alreadyDisplay}个，最大可以创建${resp.maxDisplay}个。`,
      });

      setIsModalVisible(false);
    }
  };

  return (
    <div >
      <Button onClick={() => { setIsModalVisible(true); }} style={{ marginBottom: "20px" }}>
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
          
          <FormItem
            name={"cluster"}
            label="集群"
            rules={[
              {
                required: true,
                message: "请选择一个集群!",
              },
            ]}
          >
            <Select placeholder="选择集群"
              allowClear
              style={{ width:"50%" }}
            >
              {CLUSTERS.map((x) => {
                const key = x.id;
                return (
                  <Option value={key} >
                    {key}
                  </Option>
                );
              })}
            </Select>
          </FormItem>
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
      < Table dataSource={data} columns={columns} rowKey={(record) => record.desktop} loading={tableloading} />
    </div>
  );
};

