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
import { App, Button, DatePicker, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { prefix, useI18nTranslateToString } from "src/i18n";

interface FormProps {
  accountName: string;
  comment: string;
  expirationTime: dayjs.Dayjs
}

interface ModalProps {
  open: boolean;
  close: () => void;
  refresh: () => void;
}

const p = prefix("pageComp.tenant.addWhitelistedAccountButton.");
const pCommon = prefix("common.");

const NewPartitionModal: React.FC<ModalProps> = ({
  open, close, refresh,
}) => {

  const t = useI18nTranslateToString();

  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();


  const onOk = async () => {
    // 添加分区至可用分区集
    // const { accountName, expirationTime, comment } = await form.validateFields();
    // await api.whitelistAccount({ body: { accountName: accountName.trim(), comment,
    //   expirationTime:expirationTime.toISOString() } })
    //   .httpError(404, () => {
    //     message.error(t(p("notExist")));
    //   })
    //   .then(() => {
    //     message.success(t(p("addSuccess")));
    //     refresh();
    //     close();
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  };

  return (
    <Modal
      title="添加可用分区"
      open={open}
      onCancel={close}
      onOk={onOk}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item name="cluster" rules={[{ required: true }]} label="集群">
          <SingleClusterSelector />
        </Form.Item>
        {/* 合并977，替换Selector */}
        <Form.Item name="partition" rules={[{ required: true }]} label="分区">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  refresh: () => void;
}



export const AddToPartitionCollectionButton: React.FC<Props> = ({ refresh }) => {

  const [modalShow, setModalShow] = useState(false);

  const t = useI18nTranslateToString();



  return (
    <>
      <NewPartitionModal close={() => setModalShow(false)} open={modalShow} refresh={refresh} />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
        添加
      </Button>
    </>
  );
};
