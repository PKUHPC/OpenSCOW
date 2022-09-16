import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Form, InputNumber, message, Modal, Space } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { ModalLink } from "src/components/ModalLink";
import type { Money } from "src/generated/common/money";
import { moneyToString } from "src/utils/money";

interface Props {
  username: string;
  userId: string;
  accountName: string;
  currentLimit?: Money;
  currentUsed?: Money;
  visible: boolean;
  onClose: () => void;
  reload: () => void;
}

interface FormFields {
  limit: number;
}

export const JobChargeLimitModal: React.FC<Props> = ({
  accountName, onClose, reload, userId, visible, username, currentLimit, currentUsed,
}) => {
  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

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
      visible={visible}
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
                  Modal.confirm({
                    title: "取消作业费用限额",
                    icon: <ExclamationCircleOutlined />,
                    content: "确认要取消此用户在此账户中的限额吗？",
                    onOk: async () => {
                      await api.cancelJobChargeLimit({ body: { accountName, userId } })
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
