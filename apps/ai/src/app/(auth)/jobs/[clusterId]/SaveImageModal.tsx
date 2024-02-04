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

import { App, Form, Input, Modal } from "antd";
import React from "react";
import { AppSession } from "src/server/trpc/route/jobs/apps";
import { imageNameValidation, imageTagValidation } from "src/utils/form";
import { trpc } from "src/utils/trpc";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  appSession: AppSession
  clusterId: string
}

interface FormFields {
  name: string,
  tag: string,
  description?: string,
}

export const SaveImageModal: React.FC<Props> = (
  { open, onClose, reload, appSession, clusterId },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const saveImageMutation = trpc.jobs.saveImage.useMutation({
    onSuccess() {
      message.success("保存镜像成功");
      onClose();
      form.resetFields();
      reload();
    },
    onError() {
      message.error("保存镜像失败");
    },
  });

  const handleFinish = async () => {

    const { name, tag, description } = await form.validateFields();

    await saveImageMutation.mutateAsync({
      jobId: appSession.jobId,
      clusterId,
      imageName: name,
      imageTag: tag,
      imageDesc: description?.trim(),
    });

  };

  return (
    <Modal
      title={"保存镜像"}
      open={open}
      onOk={form.submit}
      confirmLoading={saveImageMutation.isLoading}
      onCancel={onClose}
      width={800}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
      >
        <Form.Item label="原镜像名称">
          {appSession.image.name}
        </Form.Item>
        <Form.Item label="原镜像标签">
          {appSession.image.tag || ""}
        </Form.Item>
        <Form.Item
          label="镜像名称"
          name="name"
          rules={[
            { required: true },
            { validator: imageNameValidation },
          ]}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item
          label="镜像标签"
          name="tag"
          rules={[
            { required: true },
            { validator: imageTagValidation },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="镜像描述" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
