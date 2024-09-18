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
import React, { useEffect } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { DatasetType, DatasetTypeText, SceneType, SceneTypeText } from "src/models/Dateset";
import { Cluster } from "src/server/trpc/route/config";
import { DatasetInterface } from "src/server/trpc/route/dataset/dataset";
import { validateNoChinese } from "src/utils/form";
import { trpc } from "src/utils/trpc";

import { defaultClusterContext } from "../defaultClusterContext";

export interface Props {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
  isEdit: boolean;
  editData?: DatasetInterface;
  clusters: Cluster[];
}

interface FormFields {
  id?: number | undefined,
  name: string,
  cluster: Cluster,
  type: string,
  scene: string,
  description?: string,
}

export const CreateEditDatasetModal: React.FC<Props> = (
  { open, onClose, refetch, isEdit, editData, clusters },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const { defaultCluster } = defaultClusterContext(clusters);

  useEffect(() => {
    resetForm();
  }, []);

  const resetForm = () => {
    if (isEdit && editData) {
      form.setFieldsValue({
        type: editData.type,
        scene: editData.scene,
      });
    } else {
      form.setFieldsValue({
        type: DatasetType.IMAGE,
        scene: SceneType.CWS,
      });
    }
  };

  const createMutation = trpc.dataset.createDataset.useMutation({
    onSuccess() {
      message.success("添加数据集成功");
      onClose();
      form.resetFields();
      resetForm();
      refetch();
    },
    onError(e) {
      if (e.data?.code === "CONFLICT") {
        message.error("数据集名称已存在");
        form.setFields([
          {
            name: "name",
            errors: ["数据集名称已存在"],
          },
        ]);
        return;
      }

      message.error("添加数据集失败");
    },
  });

  const editMutation = trpc.dataset.updateDataset.useMutation({
    onSuccess() {
      message.success("编辑数据集成功");
      onClose();
      refetch();
    },
    onError(e) {
      if (e.data?.code === "CONFLICT") {
        message.error("数据集名称已存在");
        form.setFields([
          {
            name: "name",
            errors: ["数据集名称已存在"],
          },
        ]);
      }
      else if (e.data?.code === "NOT_FOUND") {
        message.error("无法找到数据集");
      }
      else if (e.data?.code === "PRECONDITION_FAILED") {
        message.error("有正在分享或正在取消分享的数据存在，请稍后再试");
      }
      else {
        message.error("编辑数据集失败");
      }
    },
  });

  const onOk = async () => {
    const { name, type, description, scene, cluster } = await form.validateFields();
    if (isEdit && editData) {

      editMutation.mutate({
        id: editData.id,
        name,
        type,
        scene,
        description,
      });
    } else {
      createMutation.mutate({
        name,
        clusterId: cluster.id,
        type,
        description,
        scene,
      });
    }
  };

  return (
    <Modal
      title={isEdit ? "编辑数据集" : "添加数据集"}
      open={open}
      onOk={form.submit}
      confirmLoading={isEdit ? editMutation.isLoading : createMutation.isLoading}
      onCancel={onClose}
      width={800}
    >
      <Form
        form={form}
        onFinish={onOk}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
        initialValues={isEdit && editData ? editData : { cluster: defaultCluster }}
      >
        <Form.Item
          label="数据集名称"
          name="name"
          rules={[
            { required: true },
            { validator:validateNoChinese },
          ]}
        >
          <Input allowClear />
        </Form.Item>
        {isEdit && editData ? (
          <Form.Item
            label="集群"
          >
            {getI18nConfigCurrentText(
              clusters.find((x) => (x.id === editData.clusterId))?.name, undefined)
                      ?? editData.clusterId }
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
        )
        }
        <Form.Item label="数据类型" name="type" required={true}>
          <Select
            style={{ minWidth: "100px" }}
            options={
              Object.entries(DatasetTypeText).map(([key, value]) => ({ label:value, value:key }))}
          />
        </Form.Item>
        <Form.Item label="应用场景" name="scene" required={true}>
          <Select
            style={{ minWidth: "100px" }}
            options={
              Object.entries(SceneTypeText).map(([key, value]) => ({ label:value, value:key }))}
          />
        </Form.Item>
        <Form.Item label="数据集描述" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
