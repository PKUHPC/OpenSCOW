import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { CreateUserModal } from "src/pageComponents/users/CreateUserModal";
import { publicConfig } from "src/utils/config";


interface FormProps {
  identityId: string;
  name: string;
}

interface ModalProps {
  accountName: string;
  visible: boolean;
  close: () => void;
  refresh: () => void;
  onUserNotFound: () => void;
}

const NewUserModal: React.FC<ModalProps> = ({
  visible, close, refresh, accountName, onUserNotFound,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();

  const onOk = async () => {
    setLoading(true);
    const { identityId, name } = await form.validateFields();

    await api.addUserToAccount({ body: { identityId, name, accountName } })
      .httpError(400, ({ code }) => {
        if (code === "ID_NAME_NOT_MATCH") {
          message.error("您输入的用户ID和姓名不匹配。");
        }
      })
      .httpError(404, ({ code }) => {
        if (code === "ACCOUNT_NOT_FOUND") {
          message.error("账户不存在");
        } else if (code === "USER_NOT_FOUND") {
          onUserNotFound();
        }
      })
      .httpError(409, () => {
        message.error("用户已经存在于此账户中！");
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
      title="添加用户"
      visible={visible}
      onCancel={close}
      onOk={onOk}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item name="identityId" required label="用户ID">
          <Input />
        </Form.Item>
        <Form.Item name="name" required label="用户姓名">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  accountName: string;
  refresh: () => void;
}

export const AddUserButton: React.FC<Props> = ({ refresh, accountName }) => {

  const [modalShow, setModalShow] = useState(false);

  const [createUserShow, setCreateUserShown] = useState(false);

  return (
    <>
      <NewUserModal
        close={() => setModalShow(false)} visible={modalShow} refresh={refresh} accountName={accountName}
        onUserNotFound={() => {
          if (publicConfig.ENABLE_CREATE_USER) {
            setModalShow(false);
            setCreateUserShown(true);
          } else {
            message.error("用户不存在！");
          }
        }}
      />
      <CreateUserModal onClose={() => {
        setCreateUserShown(false);
        setModalShow(true);
      }} visible={createUserShow}
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
      添加用户
      </Button>
    </>
  );
};
