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

import { useMutation, useQuery } from "@connectrpc/connect-query";
import { TargetType } from "@scow/notification-protos/build/common_pb";
import { adminSendMessage } from "@scow/notification-protos/build/message-MessageService_connectquery";
import { listNoticeTypes } from "@scow/notification-protos/build/notice_type-NoticeTypeService_connectquery";
import { Button, Checkbox, Form, Input, message } from "antd";
import React from "react";
import { I18nDicType } from "src/models/i18n";
import { AdminMessageType } from "src/models/message-type";
import { NoticeType, noticeTypeNameMap } from "src/models/notice-type";

interface FormValues {
  title: string;
  content: string;
  noticeTypes: NoticeType[];
}

interface Props {
  lang: I18nDicType;
}

export const MessageForm: React.FC<Props> = ({ lang }) => {

  const compLang = lang.sendMessage.messageForm;
  const [form] = Form.useForm<FormValues>();
  const { data } = useQuery(listNoticeTypes);
  const { mutateAsync, isPending } = useMutation(adminSendMessage, {
    onError: () => {
      message.error(compLang.sendErrorInfo);
    },
    onSuccess: () => {
      message.success(compLang.sendSuccessInfo);
    },
  });

  const onFinish = async (values: FormValues) => {
    const { title, content, noticeTypes } = values;
    mutateAsync({
      title, content, noticeTypes,
      messageType: AdminMessageType.SystemNotification,
      targetType: TargetType.FULL_SITE,
    });
  };

  const validateCheckboxGroup = (_, value) => {
    if (value && value.length > 0) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(compLang.checkboxSelectInfo));
  };

  return (
    <Form
      form={form}
      name="messageForm"
      onFinish={onFinish}
      // labelCol={{ span: 4 }}
      // wrapperCol={{ span: 14 }}
      initialValues={{ noticeTypes: [NoticeType.SITE_MESSAGE]}}
    >
      <Form.Item
        label={lang.common.title}
        name="title"
        rules={[{
          required: true,
          message: compLang.inputTitle,
        }, {
          type: "string",
          max: 20,
          message: compLang.titleLengthTip,
        }]}
      >
        <Input style={{ maxWidth: "700px" }} />
      </Form.Item>

      <Form.Item
        label={compLang.content}
        name="content"
        rules={[{
          required: true,
          message: compLang.inputContent,
        }, {
          type: "string",
          max: 150,
          message: compLang.contentLengthTip,
        }]}
      >
        <Input.TextArea style={{ maxWidth: "700px" }} rows={4} />
      </Form.Item>

      <Form.Item
        label={compLang.sendType}
        name="noticeTypes"
        rules={[{ required: true, validator: validateCheckboxGroup, message: compLang.selectSentType }]}
      >
        <Checkbox.Group>
          {
            data?.noticeTypes.map((noticeType) => (
              <Checkbox
                key={noticeType}
                value={noticeType}
              >
                {noticeTypeNameMap.get(noticeType)}
              </Checkbox>
            ))
          }
        </Checkbox.Group>
      </Form.Item>
      <Form.Item style={{ marginTop: "48px" }} wrapperCol={{ span: 14 }}>
        <Button loading={isPending} type="primary" htmlType="submit">
          {compLang.sendMsg}
        </Button>
      </Form.Item>
    </Form>
  );
};
