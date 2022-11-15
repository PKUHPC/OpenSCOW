import { Form, Input, Modal } from "antd";
import { useState } from "react";
import { ModalLink } from "src/components/ModalLink";
import { confirmPasswordFormItemProps, passwordRule } from "src/utils/form";

interface Props {
    name: string;
    userId: string;
    reload: () => void;
    onClose: () => void;
    onComplete: (oldPassword:string, newPassword:string) => Promise<void>;
    visible: boolean;
}

interface FormProps {
    oldPassword: string;
    newPassword: string;
    confirm: string;
}

const ChangePasswordModal: React.FC<Props> = ({ name, userId, reload, onClose, onComplete, visible }) => {
  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onOK = async () => {
    const { oldPassword, newPassword } = await form.validateFields();
    setLoading(true);
    await onComplete(oldPassword, newPassword)
      .then(() => { 
        form.setFieldsValue({ oldPassword: "", newPassword: "", confirm: "" });
        reload();
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      title={`确认要修改用户${name}（ID：${userId}）的密码？`}
      visible={visible}
      width={"70%"}
      onOk={onOK}
      confirmLoading={loading}
      onCancel={onClose}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={undefined}
        preserve={false}
      >
        <Form.Item
          rules={[{ required: true, message: "请输入原密码" }]}
          label="原密码"
          name="oldPassword"
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "请输入新密码" }, passwordRule]}
          label="新密码"
          name="newPassword"
        >
          <Input.Password placeholder={passwordRule.message} />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="确认密码"
          hasFeedback
          {...confirmPasswordFormItemProps(form, "newPassword")}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export const ChangePasswordModalLink = ModalLink(ChangePasswordModal);