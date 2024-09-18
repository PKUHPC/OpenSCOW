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
import { useUser } from "src/app/auth";
import { FileSelectModal } from "src/components/FileSelectModal";
import { Cluster } from "src/server/trpc/route/config";
import { DatasetVersionInterface } from "src/server/trpc/route/dataset/datasetVersion";
import { validateNoChinese } from "src/utils/form";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  onClose: () => void;
  datasetId: number;
  datasetName: string | undefined;
  datasetVersionId: number;
  data: DatasetVersionInterface;
  cluster?: Cluster;
}

interface FormFields {
  versionName: string,
  versionDescription?: string,
  targetPath: string,
  targetDatasetName: string;
}

export const CopyPublicDatasetModal: React.FC<Props> = (
  { open, onClose, data, datasetId, datasetName, cluster },
) => {

  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();
  const user = useUser();

  const copyMutation = trpc.dataset.copyPublicDatasetVersion.useMutation({
    onSuccess() {
      message.success("复制数据集成功");
      onClose();
      form.resetFields();
    },
    onError(err) {
      if (err.data?.code === "CONFLICT") {
        form.setFields([
          {
            name: "targetDatasetName",
            errors: ["目标数据集名称已存在"],
          },
        ]);
        return;
      }

      message.error(err.message);
    },
  });

  const onOk = async () => {
    const { targetPath, targetDatasetName, versionName, versionDescription } = await form.validateFields();
    copyMutation.mutate({
      datasetId,
      datasetName: targetDatasetName,
      path: targetPath,
      datasetVersionId: data.id,
      versionName,
      versionDescription: versionDescription ?? "",
    });
  };

  return (
    <Modal
      title={"复制数据集"}
      open={open}
      onOk={form.submit}
      confirmLoading={copyMutation.isLoading}
      onCancel={onClose}
      width={800}
    >
      <Form
        form={form}
        onFinish={onOk}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
        initialValues={data}
      >
        <Form.Item
          label="源数据集名称"
        >
          {datasetName}
        </Form.Item>
        <Form.Item
          label="目标数据集名称"
          name="targetDatasetName"
          rules={[
            { required: true },
            { validator: validateNoChinese },
          ]}
          initialValue={`${user.name}/${datasetName}`}
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
            { validator:validateNoChinese },
          ]}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item label="版本描述" name="versionDescription">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label="复制目标地址"
          name="targetPath"
          rules={[{ required: true }]}
        >
          <Input
            disabled={true}
            suffix={
              (
                <FileSelectModal
                  allowedFileType={["DIR"]}
                  onSubmit={(path: string) => {
                    form.setFields([{ name: "targetPath", value: path, touched: true }]);
                    form.validateFields(["targetPath"]);
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
