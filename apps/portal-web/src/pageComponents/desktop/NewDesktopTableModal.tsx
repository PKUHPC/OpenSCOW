import { Form, Modal, Select } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { Cluster, publicConfig } from "src/utils/config";
import { openDesktop } from "src/utils/vnc";

export interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: Cluster;
}

interface FormInfo {
  wm: string;
}


export const NewDesktopTableModal: React.FC<Props> = ({ open, onClose, reload, cluster }) => {
  const defaultWm = publicConfig.LOGIN_DESKTOP_WMS[0];

  const [form] = Form.useForm<FormInfo>();
  const [submitting, setSubmitting] = useState(false);

  const onOk = async () => {

    const values = await form.validateFields();

    setSubmitting(true);

    // Create new desktop
    await api.createDesktop({ body: { cluster: cluster.id, wm: values.wm } })
      .httpError(409, (e) => {
        const { code } = e;
        if (code === "TOO_MANY_DESKTOPS") {
          Modal.error({
            title: "新建桌面失败",
            content: "该集群桌面数目达到最大限制",
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
      .finally(() => { setSubmitting(false); });
  };


  return (
    <Modal
      title="新建桌面"
      open={open}
      onOk={form.submit}
      confirmLoading={submitting}
      onCancel={onClose}
    >
      <Form form={form} initialValues={{ wm: defaultWm.wm }} onFinish={onOk}>
        <Form.Item label="桌面" name="wm" required>
          <Select
            options={publicConfig.LOGIN_DESKTOP_WMS.map(({ name, wm }) =>
              ({ label: name, value: wm }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};


