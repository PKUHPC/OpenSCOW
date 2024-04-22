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

import { validateDataConsistency } from "@scow/lib-web/build/utils/form";
import { Divider, Form, Input, Modal } from "antd";
import { useState } from "react";
import { ModalLink } from "src/components/ModalLink";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";

interface Props {
    clusterId: string;
    clusterName: string;
    onClose: () => void;
    onComplete: (confirmedClusterId: string, comment: string) => Promise<void>;
    open: boolean;
}

interface FormProps {
  confirmedClusterId: string;
  confirmedClusterName: string;
  comment: string;
}
const p = prefix("component.others.");

const DeactivateClusterModal: React.FC<Props> = ({ clusterId, clusterName, onClose, onComplete, open }) => {

  const t = useI18nTranslateToString();

  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onOK = async () => {
    const { confirmedClusterId, comment } = await form.validateFields();
    setLoading(true);
    await onComplete(confirmedClusterId, comment)
      .then(() => {
        form.resetFields();
        onClose();
      })
      .finally(() => setLoading(false));
  };

  const languageId = useI18n().currentLanguage.id;

  return (
    <Modal
      title="停用集群"
      open={open}
      onOk={onOK}
      confirmLoading={loading}
      onCancel={onClose}
    >
      <Divider type="vertical" />
      <p> 请确认是否停用集群名称是 <strong>{clusterName}</strong>， 集群ID是 <strong>{clusterId}</strong> 的集群？ </p>
      <p> 如果确认停用集群，请在下面重复输入上述集群名称和集群ID </p>
      <p style={{ color: "red" }}> 注意：停用后集群将不可用，集群所有数据不再更新! </p>

      <Form
        form={form}
        layout="vertical"
        initialValues={undefined}
        preserve={false}
      >
        <Form.Item
          name="confirmedClusterId"
          label="集群ID"
          hasFeedback
          {...validateDataConsistency("confirmedClusterId", clusterId, languageId)}
        >
          <Input onPaste={(e) => e.preventDefault()} />
        </Form.Item>
        <Form.Item
          name="confirmedClusterName"
          label="集群名称"
          hasFeedback
          {...validateDataConsistency("confirmedClusterName", clusterName, languageId)}
        >
          <Input onPaste={(e) => e.preventDefault()} />
        </Form.Item>
        <Form.Item
          name="comment"
          label="停用备注"
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export const DeactivateClusterModalLink = ModalLink(DeactivateClusterModal);
