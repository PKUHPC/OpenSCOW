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

import { ExclamationCircleOutlined } from "@ant-design/icons";
import type { Money } from "@scow/protos/build/common/money";
import { App, Form, InputNumber, Modal, Space } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { ModalLink } from "src/components/ModalLink";
import { moneyToString } from "src/utils/money";

interface Props {
  username: string;
  userId: string;
  accountName: string;
  currentLimit?: Money;
  currentUsed?: Money;
  open: boolean;
  onClose: () => void;
  reload: () => void;
}

interface FormFields {
  limit: number;
}

export const JobChargeLimitModal: React.FC<Props> = ({
  accountName, onClose, reload, userId, open, username, currentLimit, currentUsed,
}) => {
  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const { message, modal } = App.useApp();

  const onOk = async () => {
    const { limit } = await form.validateFields();
    setLoading(true);
    await api.setJobChargeLimit({ body: { userId, accountName, limit } })
      .then(() => {
        message.success("设置成功");
        reload();
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      title={`${currentLimit === undefined ? "设置" : "修改"}用户作业费用限额`}
      open={open}
      onCancel={onClose}
      confirmLoading={loading}
      onOk={onOk}
    >
      <Form
        form={form}
        initialValues={{ limit: 0 }}
      >
        <Form.Item label="用户">
          <strong>{username} (ID: {userId})</strong>
        </Form.Item>
        <Form.Item label="账户名">
          <strong>{accountName}</strong>
        </Form.Item>
        <Form.Item label="当前已使用/总限额">
          {currentLimit && currentUsed
            ? (
              <Space>
                <span>
                  <strong>
                    {moneyToString(currentUsed)} / {moneyToString(currentLimit)}
                  </strong>
                </span>
                <a onClick={() => {
                  modal.confirm({
                    title: "取消作业费用限额",
                    icon: <ExclamationCircleOutlined />,
                    content: "确认要取消此用户在此账户中的限额吗？",
                    onOk: async () => {
                      await api.cancelJobChargeLimit({ query: { accountName, userId } })
                        .then(() => {
                          message.success("取消成功！");
                          onClose();
                          reload();
                        });
                    },
                  });
                }}
                >
                  取消限额
                </a>
              </Space>
            )
            : "未设置" }
        </Form.Item>
        <Form.Item name="limit" label={currentLimit ? "修改限额至" : "设置限额"} required>
          <InputNumber precision={2} />
        </Form.Item>
      </Form>

    </Modal>

  );
};

export const SetJobChargeLimitLink = ModalLink(JobChargeLimitModal);
