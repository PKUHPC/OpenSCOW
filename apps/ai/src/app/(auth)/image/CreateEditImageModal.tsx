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
import { TRPCClientError } from "@trpc/client";
import { App, Form, Input, Modal, Select } from "antd";
import React, { useEffect } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FileSelectModal } from "src/components/FileSelectModal";
import { ImageInterface, Source, SourceText } from "src/models/Image";
import { Cluster } from "src/server/trpc/route/config";
import { AppRouter } from "src/server/trpc/router";
import { imageNameValidation, imageTagValidation } from "src/utils/form";
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
  tag: string,
  description?: string,
  source: Source,
  sourcePath: string,
}

export const CreateEditImageModal: React.FC<Props> = ({
  open, onClose, refetch, isEdit, editData, clusters,
}: Props) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const { defaultCluster } = defaultClusterContext(clusters);

  useEffect(() => {
    resetForm();
  }, []);

  const resetForm = () => {
    if (isEdit && editData) {
      form.setFieldsValue({
        source: editData.source,
      });
    } else {
      form.setFieldsValue({
        source: Source.INTERNAL,
      });
    }
  };

  const cluster = Form.useWatch("cluster", form);
  const source = Form.useWatch("source", form);

  const createMutation = trpc.image.createImage.useMutation({
    onSuccess() {
      message.success("添加镜像任务已提交");
      onClose();
      form.resetFields();
      resetForm();
      refetch();
    },
    onError(err) {
      if (err.data?.code === "UNPROCESSABLE_CONTENT") {
        message.error("镜像文件不是 tar 文件");
        form.setFields([
          {
            name: "sourcePath",
            errors: ["请选择 tar 文件作为镜像"],
          },
        ]);
        return;
      }
      message.error(`添加镜像失败, ${err.message}`);
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
        message.error(`编辑镜像失败,${e.message}`);
      }
    },
  });

  const onOk = async () => {
    form.validateFields();
    const { name, cluster, tag, description, source, sourcePath } = await form.validateFields();
    if (isEdit && editData) {
      editMutation.mutate({
        id: editData.id,
        description,
      });
    } else {
      createMutation.mutate({
        name,
        clusterId: source === Source.INTERNAL ? cluster?.id : undefined,
        tag,
        description,
        source,
        sourcePath,
      });
    };
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
        { (isEdit && editData) ? (
          <>
            <Form.Item
              label="镜像名称"
              name="name"
            >
              {editData.name}
            </Form.Item>
            <Form.Item
              label="镜像标签"
              name="tag"
            >
              {editData.tag}
            </Form.Item>
            <Form.Item
              label="镜像来源"
            >
              {SourceText[editData.source]}
            </Form.Item>
            { editData.source === Source.INTERNAL && (
              <>
                <Form.Item
                  label="集群"
                >
                  {getI18nConfigCurrentText(
                    clusters.find((x) => (x.id === editData.clusterId))?.name, undefined)
                      ?? editData.clusterId }
                </Form.Item>
              </>

            )}

          </>

        ) : (
          <>
            <Form.Item
              label="镜像名称"
              name="name"
              rules={[
                { required: true },
                { validator: imageNameValidation },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              label="镜像标签"
              name="tag"
              rules={[
                { required: true },
                { validator: imageTagValidation },
              ]}
            >
              <Input />
            </Form.Item>
            {
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
            }


          </>
        )
        }
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
              label={source === Source.INTERNAL ? "选择镜像" : "镜像地址" }
              name="sourcePath"
              rules={[{ required: true }]}
            >
              <Input
                disabled={source === Source.INTERNAL}
                suffix={ source === Source.INTERNAL ?
                  (
                    <FileSelectModal
                      allowedFileType={["FILE"]}
                      onSubmit={(path: string) => {
                        form.setFields([{ name: "sourcePath", value: path, touched: true }]);
                        form.validateFields(["sourcePath"]);
                      }}
                      clusterId={cluster?.id ?? defaultCluster.id}
                    />
                  ) : undefined
                }
                placeholder={source === Source.INTERNAL ? "请选择镜像文件" : "请输入远程镜像地址"}
              />
            </Form.Item>
          </>
        ) }

      </Form>
    </Modal>
  );
};
