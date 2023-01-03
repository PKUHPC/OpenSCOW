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
import { App, Button, Form, Input, Modal } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";


interface FormProps {
  name: string;
}

interface ModalProps {
  open: boolean;
  close: () => void;
  refresh: () => void;
}

const NewTenantModal: React.FC<ModalProps> = ({
  open, close, refresh,
}) => {


  const { message } = App.useApp();


  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();

  const onOk = async () => {
    setLoading(true);
    const { name } = await form.validateFields();

    await api.createTenant({ body: { name } })
      .httpError(409, () => {
        message.error("租户名称不能重复！");
      })
      .then(() => {
        message.success("添加成功！");
        refresh();
        close();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title="添加租户"
      open={open}
      onCancel={close}
      onOk={onOk}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item name="name" required label="租户名称">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  refresh: () => void;
}

export const AddTenantButton: React.FC<Props> = ({ refresh }) => {

  const [modalShow, setModalShow] = useState(false);

  return (
    <>
      <NewTenantModal
        close={() => setModalShow(false)}
        open={modalShow}
        refresh={refresh}
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
      添加租户
      </Button>
    </>
  );
};
