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
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { AlgorithmTypeText } from "src/models/Algorithm";
import { Cluster } from "src/utils/config";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
  clusterId?: string;
  algorithmName?: string;
  algorithmFramework?: string;
  algorithmDescription?: string;

}
type AlgorithmType = keyof typeof AlgorithmTypeText;

interface FormFields {
  name: string,
  type: AlgorithmType,
  cluster: Cluster,
  description?: string,
}

export const CreateAndEditAlgorithmModal: React.FC<Props> = (
  { open, onClose, refetch, clusterId, algorithmName, algorithmFramework, algorithmDescription },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const createAlgorithmMutation = trpc.algorithm.createAlgorithm.useMutation({
    onSuccess() {
      message.success("添加算法成功");
      form.resetFields();
      refetch && refetch();
      onClose();
    },
    onError(e) {
      console.log(e);
      message.error("添加算法失败");
      // if (e.data?.code === "USER_NOT_FOUND") {
      //   message.error("用户未找到");
    } });

  const updateAlgorithmMutation = trpc.algorithm.updateAlgorithm.useMutation({
    onSuccess() {
      message.success("修改算法成功");
      refetch && refetch();
      onClose();
    },
    onError(e) {
      console.log(e);
      message.error("修改算法失败");
      // if (e.data?.code === "USER_NOT_FOUND") {
      //   message.error("用户未找到");
    } });

  const onOk = async () => {
    const { name, type, description, cluster } = await form.validateFields();

    if (algorithmName) {
      updateAlgorithmMutation.mutate({
        name:algorithmName, framework:type, description,
      });
    } else {
      createAlgorithmMutation.mutate({
        name, framework:type, description, clusterId:cluster.id,
      });
    }

  };


  return (
    <Modal
      title="添加算法"
      open={open}
      onOk={form.submit}
      confirmLoading={createAlgorithmMutation.isLoading}
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
            { required: !clusterId },
          ]}
        >
          {algorithmName ?? <Input allowClear />}
        </Form.Item>
        {clusterId ? undefined : (
          <Form.Item
            label="集群"
            name="cluster"
            rules={[
              { required: true },
            ]}
            {...clusterId ? { initialValue:clusterId } : undefined}
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
