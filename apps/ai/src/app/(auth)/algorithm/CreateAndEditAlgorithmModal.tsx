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
  algorithmName: string;
  algorithmId: number;
  algorithmFramework: Framework;
  algorithmDescription?: string;
}
export interface Props {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
  editData?: EditProps;
}
type AlgorithmType = keyof typeof AlgorithmTypeText;

interface FormFields {
  name: string,
  type: AlgorithmType,
  cluster: Cluster,
  description?: string,
}

export const CreateAndEditAlgorithmModal: React.FC<Props> = (
  { open, onClose, refetch, editData },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const createAlgorithmMutation = trpc.algorithm.createAlgorithm.useMutation({
    onSuccess() {
      message.success("添加算法成功");
      form.resetFields();
      refetch();
      onClose();
    },
    onError(e) {
      if (e.data?.code === "CONFLICT") {
        message.error("算法名称已存在");
        form.setFields([
          {
            name: "name",
            errors: ["算法名称已存在"],
          },
        ]);
      } else {
        message.error("添加算法失败，请联系管理员");
      }
    } });

  const updateAlgorithmMutation = trpc.algorithm.updateAlgorithm.useMutation({
    onSuccess() {
      message.success("修改算法成功");
      refetch();
      onClose();
    },
    onError(e) {
      if (e.data?.code === "CONFLICT") {
        message.error("算法名称已存在");
        form.setFields([
          {
            name: "name",
            errors: ["算法名称已存在"],
          },
        ]);
      } else if (e.data?.code === "NOT_FOUND") {
        message.error("算法未找到");
      } else if (e.data?.code === "PRECONDITION_FAILED") {
        message.error("有正在分享或正在取消分享的数据存在，请稍后再试");
      } else {
        message.error("修改算法失败");
      }
    } });

  const onOk = async () => {
    const { name, type, description, cluster } = await form.validateFields();

    if (editData?.algorithmName) {
      updateAlgorithmMutation.mutate({
        id:editData.algorithmId, name, framework:type, description,
      });
    } else {
      createAlgorithmMutation.mutate({
        name, framework:type, description, clusterId:cluster.id,
      });
    }
  };

  return (
    <Modal
      title={editData?.algorithmName ? "修改算法" : "添加算法"}
      open={open}
      onOk={form.submit}
      confirmLoading={createAlgorithmMutation.isLoading || updateAlgorithmMutation.isLoading}
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
            { validator:validateNoChinese },
          ]}
          initialValue={editData?.algorithmName}
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
          label="算法框架"
          name="type"
          rules={[
            { required: true },
          ]}
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
          label="算法描述"
          name="description"
          initialValue={editData?.algorithmDescription}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
