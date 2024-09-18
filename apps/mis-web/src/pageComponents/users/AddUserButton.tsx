/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { CountdownText } from "src/components/CountdownText";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { CreateUserModal } from "src/pageComponents/users/CreateUserModal";
import { publicConfig } from "src/utils/config";
import { addUserToAccountParams, getUserIdRule, useBuiltinCreateUser } from "src/utils/createUser";


interface FormProps {
  identityId: string;
  name: string;
}

interface ModalProps {
  accountName: string;
  open: boolean;
  close: () => void;
  refresh: () => void;
  onAddUser: (identityId: string, name: string) => Promise<void>;
}
const p = prefix("pageComp.user.addUserButton.");
const pCommon = prefix("common.");

const NewUserModal: React.FC<ModalProps> = ({
  open, close, onAddUser: onAddingUser,
}) => {

  const t = useI18nTranslateToString();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();
  const languageId = useI18n().currentLanguage.id;
  const userIdRule = getUserIdRule(languageId);

  return (
    <Modal
      title={t(p("addUser"))}
      open={open}
      onCancel={close}
      onOk={async () => {
        const { identityId, name } = await form.validateFields();
        setLoading(true);
        onAddingUser(identityId, name.trim()).finally(() => setLoading(false));
      }}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item
          name="identityId"
          label={t(pCommon("userId"))}
          rules={[
            { required: true },
            ...userIdRule ? [userIdRule] : [],
          ]}
        >
          <Input placeholder={userIdRule?.message} />
        </Form.Item>
        <Form.Item name="name" required label={t(pCommon("userFullName"))}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  accountName: string;
  refresh: () => void;
  token: string;
  // 添加用户不存在时是否可以创建用户
  canCreateUserIfNotExist?: boolean;
}

export const AddUserButton: React.FC<Props> = ({ refresh, accountName, token, canCreateUserIfNotExist = true }) => {

  const t = useI18nTranslateToString();

  const { message } = App.useApp();

  const [modalShow, setModalShow] = useState(false);

  const [newUserInfo, setNewUserInfo] = useState<{ identityId: string; name: string } | undefined>(undefined);

  const onAddUser = async (identityId: string, name: string) => {
    await api.addUserToAccount({ body: { identityId, name, accountName } })
      .httpError(400, ({ code }) => {
        if (code === "ID_NAME_NOT_MATCH") {
          message.error(t(p("notMatch")));
        }
      })
      .httpError(404, ({ code }) => {
        if (code === "USER_ALREADY_EXIST_IN_OTHER_TENANT") {
          message.error(`${t(pCommon("user"))} ${name} ${t(p("alreadyBelonged"))}`);
        }
        else if (code === "ACCOUNT_OR_TENANT_NOT_FOUND") {
          message.error(t(p("notExist")));
        }
        else if (code === "USER_NOT_FOUND") {
          if (!canCreateUserIfNotExist) {
            message.error(t(p("createFirst")));
          } else if (useBuiltinCreateUser()) {
            setModalShow(false);
            setNewUserInfo({ identityId, name });
          } else if (publicConfig.CREATE_USER_CONFIG.misConfig.type === "external") {

            const TIMEOUT_SECONDS = 2;

            message.info((
              <>
                {t(p("will"))}
                <CountdownText seconds={TIMEOUT_SECONDS} />
                {t(p("createModal"))}
              </>
            ), TIMEOUT_SECONDS, () => {
              window.open(
                publicConfig.CREATE_USER_CONFIG.misConfig.external!.url + "?" + addUserToAccountParams(
                  accountName, identityId, name, token,
                ),
                "_blank",
              );
              setModalShow(false);
            });
          } else {
            message.error(t(p("createFirst")));
          }
        }
      })
      .httpError(409, (e) => {
        message.error(e.message);
      })
      .then(() => {
        message.success(t(p("addSuccess")));
        refresh();
        setModalShow(false);
        setNewUserInfo(undefined);
      });
  };

  return (
    <>
      <NewUserModal
        close={() => setModalShow(false)}
        open={modalShow}
        refresh={refresh}
        accountName={accountName}
        onAddUser={onAddUser}
      />
      <CreateUserModal
        accountName={accountName}
        open={!!newUserInfo}
        newUserInfo={newUserInfo}
        onCreated={({ identityId, name }) => {
          return onAddUser(identityId, name.trim());
        }}
        onClose={() => {
          setNewUserInfo(undefined);
        }}
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
        {t(p("addUser"))}
      </Button>
    </>
  );
};
