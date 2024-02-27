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
import { prefix, useI18nTranslateToString } from "src/i18n";

interface FormProps {
  accountName: string;
  comment: string;
}

interface ModalProps {
  open: boolean;
  close: () => void;
  refresh: () => void;
}

const p = prefix("pageComp.tenant.addWhitelistedAccountButton.");
const pCommon = prefix("common.");

const NewAccountModal: React.FC<ModalProps> = ({
  open, close, refresh,
}) => {

  const t = useI18nTranslateToString();

  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();

  const onOk = async () => {
    const { accountName, comment } = await form.validateFields();
    setLoading(true);

    await api.whitelistAccount({ body: { accountName: accountName.trim(), comment } })
      .httpError(404, () => {
        message.error(t(p("notExist")));
      })
      .then(() => {
        message.success(t(p("addSuccess")));
        refresh();
        close();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title={t(p("addWhiteList"))}
      open={open}
      onCancel={close}
      onOk={onOk}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item name="accountName" rules={[{ required: true }]} label={t(pCommon("accountName"))}>
          <Input />
        </Form.Item>
        <Form.Item name="comment" rules={[{ required: true }]} label={t(pCommon("comment"))}>
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  refresh: () => void;
}

export const AddWhitelistedAccountButton: React.FC<Props> = ({ refresh }) => {

  const [modalShow, setModalShow] = useState(false);

  const t = useI18nTranslateToString();

  return (
    <>
      <NewAccountModal close={() => setModalShow(false)} open={modalShow} refresh={refresh} />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
        {t(p("addWhiteList"))}
      </Button>
    </>
  );
};
