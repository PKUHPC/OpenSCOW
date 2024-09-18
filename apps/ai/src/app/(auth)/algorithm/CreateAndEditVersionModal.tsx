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
import { validateNoChinese } from "src/utils/form";
import { trpc } from "src/utils/trpc";

interface EditProps {
  versionName?: string;
  versionId?: number;
  versionDescription?: string;
}
export interface Props {
  open: boolean;
  onClose: () => void;
  algorithmId: number;
  algorithmName: string | undefined;
  cluster?: Cluster;
  refetch: () => void;
  editData?: EditProps;
}

interface FormFields {
  versionName: string,
  versionDescription?: string,
  path: string,
}

export const CreateAndEditVersionModal: React.FC<Props> = (
  { open, onClose, algorithmId, algorithmName, refetch, cluster, editData },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const createAlgorithmVersionMutation = trpc.algorithm.createAlgorithmVersion.useMutation({
    onSuccess() {
      message.success("创建新版本成功");
      form.resetFields();
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
        return;
      } else if (e.data?.code === "BAD_REQUEST") {
        message.error("所选文件夹路径不存在");
        form.setFields([
          {
            name: "name",
            errors: ["所选文件夹路径不存在"],
          },
        ]);
      } else {
        message.error(e.message);
      }
    },
  });


  const updateAlgorithmVersionMutation = trpc.algorithm.updateAlgorithmVersion.useMutation({
    onSuccess() {
      message.success("修改版本成功");
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
      }
      else if (e.data?.code === "NOT_FOUND") {
        message.error("算法或算法版本未找到");
      }
      else if (e.data?.code === "PRECONDITION_FAILED") {
        message.error("有正在分享或正在取消分享的数据存在，请稍后再试");
      }
      else {
        message.error("修改版本失败");
      }
    },
  });

  const onOk = async () => {
    form.validateFields();
    const { versionName, versionDescription, path } = await form.validateFields();
    if (editData?.versionName && editData.versionId) {
      updateAlgorithmVersionMutation.mutate({
        algorithmVersionId:editData.versionId,
        versionName,
        versionDescription,
        algorithmId,
      });
    }
    else {
      createAlgorithmVersionMutation.mutate({
        versionName,
        versionDescription,
        path,
        algorithmId,
      });
    }
  };

  return (
    <Modal
      title={editData?.versionName ? "编辑版本" : "创建新版本"}
      open={open}
      onOk={form.submit}
      confirmLoading={createAlgorithmVersionMutation.isLoading || updateAlgorithmVersionMutation.isLoading}
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
          initialValue={editData?.versionName}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item label="版本描述" name="versionDescription" initialValue={editData?.versionDescription}>
          <Input.TextArea />
        </Form.Item>
        {
          !editData?.versionName ? (
            <Form.Item
              label="选择算法"
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
          ) : undefined
        }
      </Form>
    </Modal>
  );
};
