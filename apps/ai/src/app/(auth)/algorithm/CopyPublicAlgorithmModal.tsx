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
import { AlgorithmVersionInterface } from "src/models/Algorithm";
import { Cluster } from "src/server/trpc/route/config";
import { validateNoChinese } from "src/utils/form";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  data: AlgorithmVersionInterface;
  algorithmId: number;
  algorithmVersionId: number;
  algorithmName: string | undefined;
  cluster?: Cluster;
  onClose: () => void;
}

interface FormFields {
  targetAlgorithmName: string;
  versionName: string,
  versionDescription?: string,
  path: string,
}

export const CopyPublicAlgorithmModal: React.FC<Props> = (
  { open, onClose, algorithmId, algorithmVersionId, algorithmName, cluster, data },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const copyMutation = trpc.algorithm.copyPublicAlgorithmVersion.useMutation({
    onSuccess() {
      message.success("复制算法成功");
      onClose();
    },
    onError(err) {
      const errCode = err.data?.code;
      if (errCode === "CONFLICT") {
        message.error("目标算法名称已存在");
        form.setFields([
          {
            name: "targetDatasetName",
            errors: ["目标算法名称已存在"],
          },
        ]);
        return;
      }

      message.error(err.message);

    },
  });

  const onOk = async () => {
    const { targetAlgorithmName, versionName, versionDescription, path } = await form.validateFields();
    copyMutation.mutate({
      algorithmId,
      algorithmVersionId,
      algorithmName: targetAlgorithmName,
      versionName,
      versionDescription: versionDescription ?? "",
      path,
    });
  };

  return (
    <Modal
      title={"复制算法"}
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
          label="源算法名称"
        >
          {algorithmName}
        </Form.Item>
        <Form.Item
          label="目标算法名称"
          name="targetAlgorithmName"
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
          <Input allowClear />
        </Form.Item>
        <Form.Item label="版本描述" name="versionDescription" initialValue={data?.versionDescription}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label="复制目标地址"
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
