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

import { App, Form, Input, Modal, Select } from "antd";
import React from "react";
import { AlgorithmTypeText } from "src/models/Algorithm";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  onClose: () => void;
  algorithmName?: string;
  algorithmFramework?: string;
  algorithmDescription?: string;

}
type AlgorithmType = keyof typeof AlgorithmTypeText;

interface FormFields {
  name: string,
  type: AlgorithmType,
  description?: string,
}

export const CreateAndEditAlgorithmModal: React.FC<Props> = (
  { open, onClose, algorithmName, algorithmFramework, algorithmDescription },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const mutation = trpc.dataset.createDataset.useMutation({
    onSuccess() {
      message.success("添加数据集成功");
      onClose();
    },
    onError(e) {
      console.log(e);
      message.error("添加数据集失败");
      // if (e.data?.code === "USER_NOT_FOUND") {
      //   message.error("用户未找到");
      // } else if (e.data?.code === "ACCOUNT_NOT_FOUND") {
      //   message.error("账户未找到");
      // } else if (e.data?.code === "UNPROCESSABLE_CONTENT") {
      //   message.error("该用户已经在账户内，无法重复添加");
      // } else {
      //   message.error(e.message);
      // }
    },
  });

  const onOk = async () => {
    form.validateFields();
    const { name, type, description } = await form.validateFields();
    // mutation.mutate({
    //   name,
    //   type,
    //   description,
    //   scene,
    // });
  };


  return (
    <Modal
      title="添加算法"
      open={open}
      onOk={form.submit}
      confirmLoading={mutation.isLoading}
      onCancel={onClose}
    >
      <Form
        form={form}
        onFinish={onOk}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[
            { required: true },
          ]}
        >
          {algorithmName ?? <Input allowClear />}
        </Form.Item>
        <Form.Item
          label="算法框架"
          name="type"
          rules={[
            { required: true },
          ]}
          {...algorithmFramework ? { initialValue:algorithmFramework } : undefined}
        >
          <Select
            style={{ minWidth: "120px" }}
            options={
              Object.entries(AlgorithmTypeText).map(([key, value]) => ({ label:value, value:key }))}
          >
          </Select>
        </Form.Item>
        <Form.Item
          label="算法描述"
          name="description"
          {...algorithmDescription ? { initialValue:algorithmDescription } : undefined}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
