import { Form, Modal, Select } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { Cluster, CLUSTERS, publicConfig } from "src/utils/config";
import { openDesktop } from "src/utils/vnc";

export interface Props {
  visible: boolean;
  onClose: () => void;
  reload: () => void;
}

interface ClusterInfo {
  cluster: Cluster;
  wm: string;
}

const defaultWm = Object.keys(publicConfig.LOGIN_DESKTOP_WMS)[0];

export const NewDesktopTableModal: React.FC<Props> = ({ visible, onClose, reload }) => {

  const [form] = Form.useForm<ClusterInfo>();
  const [submitting, setSubmitting] = useState(false);

  const onOk = async () => {

    const values = await form.validateFields();

    setSubmitting(true);

    // Create new desktop
    await api.createDesktop({ body: { cluster: values.cluster.id, wm: values.wm } })
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
      })
      .then((resp) => {
        openDesktop(resp.node, resp.port, resp.password);
        onClose();
        reload();
      })
      .finally(() => { setSubmitting(false);});
  };


  return (
    <Modal
      title="新建桌面"
      visible={visible}
      onOk={form.submit}
      confirmLoading={submitting}
      onCancel={onClose}
    >
      <Form form={form} initialValues={{ cluster: CLUSTERS[0], wm: defaultWm }} onFinish={onOk}>
        <Form.Item
          label="集群"
          name="cluster"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <SingleClusterSelector />
        </Form.Item>
        <Form.Item label="桌面" name="wm" required>
          <Select
            options={Object.keys(publicConfig.LOGIN_DESKTOP_WMS).map((name) =>
              ({ label: name, value: name }))}
          />

        </Form.Item>
      </Form>
    </Modal>
  );
};


