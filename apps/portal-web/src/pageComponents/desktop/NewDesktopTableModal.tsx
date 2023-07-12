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

import { App, Form, Modal, Select } from "antd";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Cluster } from "src/utils/config";
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

  const [form] = Form.useForm<FormInfo>();


  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => api.listAvailableWms({ query: { cluster: cluster.id } }), [cluster.id]),
    onResolve({ wms }) {
      if (wms.length > 0) {
        form.setFieldValue("wm", wms[0].wm);
      }
    },
  });

  const { modal } = App.useApp();

  const [submitting, setSubmitting] = useState(false);

  const onOk = async () => {

    const values = await form.validateFields();

    setSubmitting(true);

    // Create new desktop
    await api.createDesktop({ body: { cluster: cluster.id, wm: values.wm } })
      .httpError(409, (e) => {
        const { code } = e;
        if (code === "TOO_MANY_DESKTOPS") {
          modal.error({
            title: "新建桌面失败",
            content: "该集群桌面数目达到最大限制",
          });
        } else {
          throw e;
        }
      })
      .then((resp) => {
        openDesktop(cluster.id, resp.host, resp.port, resp.password);
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
      <Form form={form} onFinish={onOk}>
        <Form.Item label="桌面" name="wm" required>
          <Select
            loading={isLoading}
            options={data?.wms.map(({ name, wm }) =>
              ({ label: name, value: wm }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};


