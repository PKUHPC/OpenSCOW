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
import { Cluster } from "src/server/trpc/route/config";
import { DatasetVersionInterface } from "src/server/trpc/route/dataset/datasetVersion";
import { validateNoChinese } from "src/utils/form";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  onClose: () => void;
  datasetId: number;
  datasetName: string | undefined;
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

export const CreateEditDSVersionModal: React.FC<Props> = (
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
    onError(e) {
      if (e.data?.code === "CONFLICT") {
        message.error("版本名称已存在");
        form.setFields([
          {
            name: "versionName",
            errors: ["版本名称已存在"],
          },
        ]);
      } else if (e.data?.code === "BAD_REQUEST") {
        message.error("所选文件夹路径不存在");
        form.setFields([
          {
            name: "path",
            errors: ["所选文件夹路径不存在"],
          },
        ]);
      } else {
        message.error(e.message);
      }
    },
  });

  const editMutation = trpc.dataset.updateDatasetVersion.useMutation({
    onSuccess() {
      message.success("编辑版本成功");
      onClose();
      refetch();
    },
    onError(e) {
      if (e.data?.code === "CONFLICT") {
        message.error("版本名称已存在");
        form.setFields([
          {
            name: "versionName",
            errors: ["版本名称已存在"],
          },
        ]);
      } else if (e.data?.code === "NOT_FOUND") {
        message.error("无法找到数据集或数据集版本");
      } else if (e.data?.code === "PRECONDITION_FAILED") {
        message.error("有正在分享或正在取消分享的数据存在，请稍后再试");
      } else {
        message.success("编辑版本失败");
      }
    },
  });

  const onOk = async () => {
    form.validateFields();
    const { versionName, versionDescription, path } = await form.validateFields();

    if (isEdit && editData) {
      editMutation.mutate({
        datasetVersionId: editData.id,
        versionName,
        versionDescription,
        datasetId: editData.datasetId,
      });
    } else {
      createMutation.mutate({
        versionName,
        versionDescription,
        path,
        datasetId,
      });
    }
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
            { validator:validateNoChinese },
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
                label="选择数据集"
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
            </>
          )
        }
      </Form>
    </Modal>
  );
};
