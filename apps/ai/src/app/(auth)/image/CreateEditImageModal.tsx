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
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { getImageTexts, ImageInterface, Source } from "src/models/Image";
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
  currentClusterIds: string[];
}

interface FormFields {
  id?: number | undefined,
  cluster: Cluster,
  name: string,
  tag: string,
  description?: string,
  source: Source,
  sourcePath: string,
}

export const CreateEditImageModal: React.FC<Props> = ({
  open, onClose, refetch, isEdit, editData, clusters, currentClusterIds,
}: Props) => {
  const t = useI18nTranslateToString();
  const p = prefix("app.image.createEditImageModal.");
  const languageId = useI18n().currentLanguage.id;

  const sourceText = {
    INTERNAL: getImageTexts(t).INTERNAL,
    EXTERNAL: getImageTexts(t).EXTERNAL,
  };

  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  const { defaultCluster } = defaultClusterContext(clusters, currentClusterIds);

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
      message.success(t(p("alreadySubmit")));
      onClose();
      form.resetFields();
      resetForm();
      refetch();
    },
    onError(err) {
      if (err.data?.code === "UNPROCESSABLE_CONTENT") {
        message.error(t(p("notTar")));
        form.setFields([
          {
            name: "sourcePath",
            errors: [t(p("selectTar"))],
          },
        ]);
        return;
      }
      message.error(`${t(p("addFailed"))}, ${err.message}`);
    },
  });

  const editMutation = trpc.image.updateImage.useMutation({
    onSuccess() {
      message.success(t(p("editSuccess")));
      onClose();
      refetch();
    },
    onError(e) {
      const { data } = e as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error(t(p("notExisted")));
      } else {
        message.error(`${t(p("editFailed"))},${e.message}`);
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
        clusterId: cluster.id,
        tag,
        description,
        source,
        sourcePath,
      });
    };
  };

  return (
    <Modal
      title={isEdit ? t(p("editImage")) : t(p("addImage"))}
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
              label={t(p("imageName"))}
              name="name"
            >
              {editData.name}
            </Form.Item>
            <Form.Item
              label={t(p("imageTag"))}
              name="tag"
            >
              {editData.tag}
            </Form.Item>
            <Form.Item
              label={t(p("source"))}
            >
              {sourceText[editData.source]}
            </Form.Item>
            <Form.Item
              label={t(p("cluster"))}
            >
              {getI18nConfigCurrentText(
                clusters.find((x) => (x.id === editData.clusterId))?.name, languageId)
                      ?? editData.clusterId }
            </Form.Item>
          </>

        ) : (
          <>
            <Form.Item
              label={t(p("imageName"))}
              name="name"
              rules={[
                { required: true },
                { validator: imageNameValidation },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              label={t(p("imageTag"))}
              name="tag"
              rules={[
                { required: true },
                { validator: imageTagValidation },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t(p("cluster"))}
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
        <Form.Item label={t(p("description"))} name="description">
          <Input.TextArea />
        </Form.Item>

        { !isEdit && (
          <>
            <Form.Item
              label={t(p("source"))}
              name="source"
              rules={[
                { required: true },
              ]}
            >
              <Select
                style={{ minWidth: "100px" }}
                options={
                  Object.entries(sourceText).map(([key, value]) => ({ label:value, value:key }))}
              />
            </Form.Item>
            <Form.Item
              label={source === Source.INTERNAL ? t(p("selectImage")) : t(p("imageAddress")) }
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
                placeholder={source === Source.INTERNAL ?
                  t(p("selectImagePlaceHolder")) : t(p("inputImagePlaceHolder"))}
              />
            </Form.Item>
          </>
        ) }

      </Form>
    </Modal>
  );
};
