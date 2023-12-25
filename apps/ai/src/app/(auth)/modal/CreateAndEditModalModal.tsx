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
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { Cluster } from "src/utils/config";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
  clusterId?: string;
  modalName?: string;
  algorithmName?: string;
  algorithmFramework?: string;
  modalDescription?: string;
}

interface FormFields {
  modalName: string,
  cluster: Cluster,
  algorithmName: string,
  algorithmFramework: string,
  modalDescription: string,
}

export const CreateAndEditModalModal: React.FC<Props> = (
  { open, onClose, refetch, clusterId, algorithmName, algorithmFramework, modalDescription },
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
    const { modalName, cluster, algorithmName, algorithmFramework, modalDescription } = await form.validateFields();

    // if (algorithmName) {
    //   updateAlgorithmMutation.mutate({
    //     name:algorithmName, framework:type, description,
    //   });
    // } else {
    //   createAlgorithmMutation.mutate({
    //     name, framework:type, description, clusterId:cluster.id,
    //   });
    // }

  };


  return (
    <Modal
      title="添加模型"
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
          name="modalName"
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
          label="算法名称"
          name="algorithmName"
          {...algorithmName ? { initialValue:algorithmName } : undefined}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="算法框架"
          name="algorithmFramework"
          {...algorithmFramework ? { initialValue:algorithmFramework } : undefined}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="模型描述"
          name="modalDescription"
          {...modalDescription ? { initialValue:modalDescription } : undefined}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
