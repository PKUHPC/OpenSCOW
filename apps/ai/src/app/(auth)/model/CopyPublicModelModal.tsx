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

import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { App, Form, Input, Modal } from "antd";
import React from "react";
import { FileSelectModal } from "src/components/FileSelectModal";
import { ModelVersionInterface } from "src/models/Model";
import { Cluster } from "src/server/trpc/route/config";
import { validateNoChinese } from "src/utils/form";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  modelId: number;
  modelVersionId: number;
  cluster?: Cluster;
  modelName?: string;
  data: ModelVersionInterface;
  onClose: () => void;
}

interface FormFields {
  targetModalName: string
  versionName: string,
  versionDescription?: string,
  path: string,
}

export const CopyPublicModelModal: React.FC<Props> = (
  { open, onClose, modelId, modelVersionId, cluster, modelName, data },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const copyMutation = trpc.model.copyPublicModelVersion.useMutation({
    onSuccess() {
      message.success("复制模型成功");
      onClose();
      form.resetFields();
    },
    onError(err) {
      if (err.data?.code === "CONFLICT") {
        form.setFields([
          {
            name: "targetDatasetName",
            errors: ["目标模型名称已存在"],
          },
        ]);
        return;
      }

      message.error(err.message);
    },
  });




  const onOk = async () => {
    const { targetModalName, versionName, versionDescription, path } = await form.validateFields();
    copyMutation.mutate({
      modelId,
      versionId: modelVersionId,
      modelName: targetModalName,
      versionName,
      versionDescription: versionDescription ?? "",
      path,
    });
  };

  return (
    <Modal
      title={"复制模型"}
      open={open}
      onOk={form.submit}
      confirmLoading={copyMutation.isLoading}
      onCancel={onClose}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onOk}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
      >
        <Form.Item
          label="源模型名称"
        >
          {modelName}
        </Form.Item>
        <Form.Item
          label="目标模型名称"
          name="targetModalName"
          rules={[
            { required: true },
            { validator: validateNoChinese },
          ]}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item
          label="集群"
        >
          {getI18nConfigCurrentText(cluster?.name, undefined)}
        </Form.Item>
        <Form.Item
          label="版本名称"
          name="versionName"
          rules={[
            { required: true },
            { validator: validateNoChinese },
          ]}
          initialValue={data?.versionName}
        >
          <Input />
        </Form.Item>
        <Form.Item label="版本描述" name="versionDescription" initialValue={data.versionDescription}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="算法版本" name="algorithmVersion">
          {data.algorithmVersion}
        </Form.Item>
        <Form.Item
          label="目标复制地址"
          name="path"
          rules={[{ required: true }]}
        >
          <Input
            disabled={true}
            suffix={
              (
                <FileSelectModal
                  allowedFileType={["DIR"]}
                  onSubmit={(path: string) => {
                    form.setFields([{ name: "path", value: path, touched: true }]);
                    form.validateFields(["path"]);
                  }}
                  clusterId={cluster?.id ?? ""}
                />
              )
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
