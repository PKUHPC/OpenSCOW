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

import { AvailableWm } from "@scow/protos/build/portal/desktop";
import { App, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { Cluster, LoginNode } from "src/utils/config";
import { openDesktop } from "src/utils/vnc";

export interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: Cluster;
  loginNodes: LoginNode[];
  availableWms: AvailableWm[];
}

interface FormInfo {
  loginNode: string;
  wm: string;
  desktopName: string;
}

const p = prefix("pageComp.desktop.newDesktopModal.");

export const NewDesktopTableModal: React.FC<Props> = ({
  open,
  onClose,
  reload,
  cluster,
  loginNodes,
  availableWms = [],
}) => {

  const t = useI18nTranslateToString();

  const [form] = Form.useForm<FormInfo>();

  const { modal } = App.useApp();

  const [submitting, setSubmitting] = useState(false);

  const onOk = async () => {
    const values = await form.validateFields();
    setSubmitting(true);

    // Create new desktop
    await api.createDesktop({
      body:
        { cluster: cluster.id, loginNode: values.loginNode, wm: values.wm, desktopName: values.desktopName },
    }).httpError(409, (e) => {
      const { code } = e;
      if (code === "TOO_MANY_DESKTOPS") {
        modal.error({
          title: t(p("error.tooManyTitle")),
          content: t(p("error.tooManyContent")),
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

  useEffect(() => {
    form.setFieldsValue({ wm: availableWms[0]?.wm, loginNode: loginNodes[0]?.address });
  }, [loginNodes, availableWms]);

  useEffect(() => {
    if (open) {
      form.setFieldValue("desktopName", `desktop-${dayjs().format("YYYYMMDD-HHmmss")}`);
    }
  }, [open]);

  return (
    <Modal
      title={t(p("modal.createNewDesktop"))}
      open={open}
      onOk={form.submit}
      confirmLoading={submitting}
      onCancel={onClose}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onOk}
        wrapperCol={{ span: 20 }}
        labelCol={{ span:4, style: { whiteSpace:"normal", textAlign:"left", lineHeight:"16px" } }}

      >
        <Form.Item label={t(p("modal.loginNode"))} name="loginNode" rules={[{ required: true }]}>
          <Select
            options={loginNodes.map((loginNode) => ({
              label: loginNode.name, value: loginNode.address,
            }))}
          >
          </Select>
        </Form.Item>
        <Form.Item label={t(p("modal.wm"))} name="wm" required>
          <Select
            options={availableWms?.map(({ name, wm }) =>
              ({ label: name, value: wm }))}
          />
        </Form.Item>
        <Form.Item label={t(p("modal.desktopName"))} name="desktopName" required>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};


