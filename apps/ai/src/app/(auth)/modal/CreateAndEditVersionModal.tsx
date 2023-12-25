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
import { FileSelectModal } from "src/components/FileSelectModal";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  onClose: () => void;
  algorithmId: number;
  algorithmName: string | undefined;
  versionName?: string;
  versionId?: number;
  versionDescription?: string;
  refetch: () => void;
}

interface FormFields {
  versionName: string,
  versionDescription?: string,
  path: string,
}

export const CreateAndEditVersionModal: React.FC<Props> = (
  { open, onClose, algorithmId, algorithmName, versionName:versionNameProp, versionId, versionDescription, refetch },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const createAlgorithmVersionMutation = trpc.algorithm.createAlgorithmVersion.useMutation({
    onSuccess() {
      message.success("创建新版本成功");
      onClose();
      refetch();
    },
    onError(e) {
      console.log(e);
      message.error("创建新版本失败");
      // if (e.data?.code === "USER_NOT_FOUND") {
      //   message.error("用户未找到");
    },
  });


  const updateAlgorithmVersionMutation = trpc.algorithm.updateAlgorithmVersion.useMutation({
    onSuccess() {
      message.success("修改版本成功");
      onClose();
      refetch();
    },
    onError(e) {
      console.log(e);
      message.error("修改版本失败");
      // if (e.data?.code === "USER_NOT_FOUND") {
      //   message.error("用户未找到");
    },
  });

  const onOk = async () => {
    form.validateFields();
    const { versionName, versionDescription, path } = await form.validateFields();
    if (versionNameProp && versionId) {
      updateAlgorithmVersionMutation.mutate({
        versionId,
        versionName,
        versionDescription,
        path:"123",
        algorithmId,
      });
    }
    else {
      createAlgorithmVersionMutation.mutate({
        versionName,
        versionDescription,
        path:"123",
        algorithmId,
      });
    }

  };

  return (
    <Modal
      title={versionNameProp ? "编辑版本" : "创建新版本"}
      open={open}
      onOk={form.submit}
      confirmLoading={createAlgorithmVersionMutation.isLoading}
      onCancel={onClose}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onOk}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
      >
        <Form.Item
          label="算法名称"
        >
          {algorithmName}
        </Form.Item>
        <Form.Item
          label="版本名称"
          name="versionName"
          rules={[
            { required: true },
          ]}
          initialValue={versionNameProp}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item label="版本描述" name="versionDescription" initialValue={versionDescription}>
          <Input.TextArea />
        </Form.Item>
        {
          !versionNameProp ? (
            <Form.Item
              label="上传文件"
              name="path"
              // rules={[{ required: true }]}
            >
              <Input
                suffix={
                  (
                    <FileSelectModal
                      onSubmit={(path: string) => {
                        form.setFields([{ name: "path", value: path, touched: true }]);
                        form.validateFields(["path"]);
                      }}
                      cluster={{ id: "A", name: "a" }}
                    />
                  )
                }
              />
            </Form.Item>
          ) : undefined
        }

      </Form>
    </Modal>
  );
};
