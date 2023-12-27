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

import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { TRPCClientError } from "@trpc/client";
import { App, Form, Input, Modal } from "antd";
import React from "react";
import { FileSelectModal } from "src/components/FileSelectModal";
import { DatasetVersionInterface } from "src/models/Dateset";
import { AppRouter } from "src/server/trpc/router";
import { Cluster } from "src/utils/config";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  onClose: () => void;
  datasetId: number;
  datasetName: string;
  isEdit?: boolean;
  editData?: DatasetVersionInterface;
  cluster?: Cluster;
  refetch: () => void;
}

interface FormFields {
  versionName: string,
  versionDescription?: string,
  path: string,
}

export const CreateEditDVersionModal: React.FC<Props> = (
  { open, onClose, datasetId, datasetName, isEdit, editData, cluster, refetch },
) => {

  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const createMutation = trpc.dataset.createDatasetVersion.useMutation({
    onSuccess() {
      message.success("创建新版本成功");
      onClose();
      form.resetFields();
      refetch();
    },
    onError() {
      message.error("创建新版本失败");
    },
  });

  const editMutation = trpc.dataset.updateDatasetVersion.useMutation({
    onSuccess() {
      message.success("编辑版本成功");
      onClose();
      refetch();
    },
    onError(e) {
      const { data } = e as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("编辑版本失败");
      }
    },
  });

  const onOk = async () => {
    form.validateFields();
    const { versionName, versionDescription, path } = await form.validateFields();
    isEdit && editData ? editMutation.mutate({
      id: editData.id,
      versionName,
      versionDescription,
      datasetId: editData.datasetId,
    })
      : createMutation.mutate({
        versionName,
        versionDescription,
        path,
        datasetId,
      });
  };

  return (
    <Modal
      title={isEdit ? "编辑版本" : "创建新版本"}
      open={open}
      onOk={form.submit}
      confirmLoading={createMutation.isLoading || editMutation.isLoading}
      onCancel={onClose}
      width={800}
    >
      <Form
        form={form}
        onFinish={onOk}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
        initialValues={editData}
      >
        <Form.Item
          label="数据集名称"
        >
          {datasetName}
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
          ]}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item label="版本描述" name="versionDescription">
          <Input.TextArea />
        </Form.Item>
        {
          !isEdit && (
            <>
              <Form.Item
                label="数据文件夹"
                name="path"
                rules={[{ required: true }]}
              >
                <Input
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
            </>
          )
        }

      </Form>
    </Modal>
  );
};
