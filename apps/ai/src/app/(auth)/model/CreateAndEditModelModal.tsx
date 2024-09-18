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
import { App, Form, Input, Modal, Select } from "antd";
import React from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { AlgorithmTypeText, Framework } from "src/models/Algorithm";
import { Cluster } from "src/server/trpc/route/config";
import { validateNoChinese } from "src/utils/form";
import { trpc } from "src/utils/trpc";

interface EditProps {
  cluster?: Cluster;
  modelId: number;
  modelName: string;
  algorithmName?: string;
  algorithmFramework?: Framework;
  modalDescription?: string;
}
export interface Props {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
  editData?: EditProps;
}

interface FormFields {
  modelName: string,
  cluster: Cluster,
  algorithmName: string,
  algorithmFramework: Framework,
  modalDescription: string,
}

export const CreateAndEditModalModal: React.FC<Props> = (
  { open, onClose, refetch, editData },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const createModelMutation = trpc.model.createModel.useMutation({
    onSuccess() {
      message.success("添加模型成功");
      form.resetFields();
      refetch();
      onClose();
    },
    onError(e) {
      if (e.data?.code === "CONFLICT") {
        message.error("模型名称已存在");
        form.setFields([
          {
            name: "modelName",
            errors: ["模型名称已存在"],
          },
        ]);
        return;
      }
      message.error("添加模型失败");
    } });

  const updateModelMutation = trpc.model.updateModel.useMutation({
    onSuccess() {
      message.success("修改模型成功");
      refetch();
      onClose();
    },
    onError(e) {
      if (e.data?.code === "CONFLICT") {
        message.error("模型名称已存在");
        form.setFields([
          {
            name: "modelName",
            errors: ["模型名称已存在"],
          },
        ]);
      }
      else if (e.data?.code === "NOT_FOUND") {
        message.error("模型未找到");
      }
      else if (e.data?.code === "PRECONDITION_FAILED") {
        message.error("有正在分享或正在取消分享的数据存在，请稍后再试");
      }
      else {
        message.error("修改模型失败");

      }
    } });

  const onOk = async () => {
    const { modelName:formModalName, cluster, algorithmName:formAlgorithmName,
      algorithmFramework:formAlgorithmFramework, modalDescription:formModalDescription } =
    await form.validateFields();

    if (editData?.modelId) {
      updateModelMutation.mutate({
        id:editData.modelId,
        name:formModalName,
        algorithmName:formAlgorithmName,
        algorithmFramework:formAlgorithmFramework,
        description:formModalDescription,
      });
    } else {
      createModelMutation.mutate({
        name:formModalName,
        algorithmName:formAlgorithmName,
        algorithmFramework:formAlgorithmFramework,
        description:formModalDescription,
        clusterId:cluster.id,
      });
    }
  };

  return (
    <Modal
      title={editData?.modelName ? "修改模型" : "添加模型"}
      open={open}
      onOk={form.submit}
      confirmLoading={createModelMutation.isLoading}
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
          name="modelName"
          rules={[
            { required: true },
            { validator:validateNoChinese },
          ]}
          initialValue={editData?.modelName}
        >
          <Input />
        </Form.Item>
        {editData?.cluster ? (
          <Form.Item
            label="集群"
          >
            {getI18nConfigCurrentText(editData?.cluster?.name, undefined)}
          </Form.Item>
        ) : (
          <Form.Item
            label="集群"
            name="cluster"
            rules={[
              { required: true },
            ]}
          >
            <SingleClusterSelector />
          </Form.Item>
        )}
        <Form.Item
          label="算法名称"
          name="algorithmName"
          initialValue={editData?.algorithmName}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="算法框架"
          name="algorithmFramework"
          initialValue={editData?.algorithmFramework}
        >
          <Select
            style={{ minWidth: "120px" }}
            options={
              Object.entries(AlgorithmTypeText).map(([key, value]) => ({ label:value, value:key }))}
          >
          </Select>
        </Form.Item>
        <Form.Item
          label="模型描述"
          name="modalDescription"
          initialValue={editData?.modalDescription}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
