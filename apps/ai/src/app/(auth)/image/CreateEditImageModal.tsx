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
import { App, Form, Input, Modal, Select } from "antd";
import React, { useEffect } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FileSelectModal } from "src/components/FileSelectModal";
import { ImageInterface, Source, SourceText } from "src/models/Image";
import { AppRouter } from "src/server/trpc/router";
import { Cluster } from "src/utils/config";
import { validateNoChinese } from "src/utils/form";
import { trpc } from "src/utils/trpc";

import { defaultClusterContext } from "../defaultClusterContext";

export interface Props {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
  isEdit: boolean;
  editData?: ImageInterface;
  clusters: Cluster[];
}

interface FormFields {
  id?: number | undefined,
  cluster: Cluster | undefined,
  name: string,
  tags: string,
  description?: string,
  source: Source,
  sourcePath: string,
}

export const CreateEditImageModal: React.FC<Props> = (
  { open, onClose, refetch, isEdit, editData, clusters },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const { defaultCluster } = defaultClusterContext(clusters);

  useEffect(() => {
    resetForm();
  }, []);

  const resetForm = () => {
    isEdit && editData ?
      form.setFieldsValue({
        source: editData.source,
      }) : form.setFieldsValue({
        source: Source.INTERNAL,
      });
  };

  const cluster = Form.useWatch("cluster", form);
  const source = Form.useWatch("source", form);

  const createMutation = trpc.image.createImage.useMutation({
    onSuccess() {
      message.success("添加镜像成功");
      onClose();
      form.resetFields();
      resetForm();
      refetch();
    },
    onError() {
      message.error("添加镜像失败");
    },
  });

  const editMutation = trpc.image.updateImage.useMutation({
    onSuccess() {
      message.success("编辑镜像成功");
      onClose();
      refetch();
    },
    onError(e) {
      const { data } = e as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("镜像不存在");
      } else {
        message.error("编辑镜像失败");
      }
    },
  });

  const onOk = async () => {
    form.validateFields();
    const { name, cluster, tags, description, source, sourcePath } = await form.validateFields();
    isEdit && editData ? editMutation.mutate({
      id: editData.id,
      name,
      tags,
      description,
    })
      : createMutation.mutate({
        name,
        clusterId: source === Source.INTERNAL ? cluster?.id : undefined,
        tags,
        description,
        source,
        sourcePath,
      });
  };

  return (
    <Modal
      title={isEdit ? "编辑镜像" : "添加镜像"}
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
          label="镜像名称"
          name="name"
          rules={[
            { required: true },
            { validator:validateNoChinese },
          ]}
        >
          <Input allowClear />
        </Form.Item>
        { (isEdit && editData) ? (
          editData.source === Source.INTERNAL && (
            <>
              <Form.Item
                label="镜像来源"
              >
                {SourceText[editData.source]}
              </Form.Item>
              <Form.Item
                label="集群"
              >
                {getI18nConfigCurrentText(
                  clusters.find((x) => (x.id === editData.clusterId))?.name, undefined)
                    ?? editData.clusterId }
              </Form.Item>
            </>
          )

        ) : (
          source === Source.INTERNAL && (
            <>
              <Form.Item
                label="集群"
                name="cluster"
                rules={[
                  { required: true },
                ]}
              >
                <SingleClusterSelector />
              </Form.Item>
            </>
          )
        )
        }
        <Form.Item
          label="镜像标签"
          name="tags"
          rules={[
            { required: true },
            { validator:validateNoChinese },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="镜像描述" name="description">
          <Input.TextArea />
        </Form.Item>

        { !isEdit && (
          <>
            <Form.Item
              label="镜像来源"
              name="source"
              rules={[
                { required: true },
              ]}
            >
              <Select
                style={{ minWidth: "100px" }}
                options={
                  Object.entries(SourceText).map(([key, value]) => ({ label:value, value:key }))}
              />
            </Form.Item>
            <Form.Item
              label="上传镜像"
              name="sourcePath"
              rules={[{ required: true }]}
            >
              <Input
                suffix={ source === Source.INTERNAL ?
                  (
                    <FileSelectModal
                      allowedFileType={["FILE"]}
                      onSubmit={(path: string) => {
                        form.setFields([{ name: "sourcePath", value: path, touched: true }]);
                        form.validateFields(["sourcePath"]);
                      }}
                      clusterId={cluster?.id ?? ""}
                    />
                  ) : undefined
                }
                placeholder={source === Source.INTERNAL ? "请选择路径" : "请输入远程镜像地址"}
              />
            </Form.Item>
          </>
        ) }

      </Form>
    </Modal>
  );
};
