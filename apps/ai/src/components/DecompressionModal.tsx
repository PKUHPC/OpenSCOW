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

"use client";

import { App, Form, Modal } from "antd";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { trpc } from "src/utils/trpc";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: (() => void) | ((dirName: string) => Promise<void>);
  clusterId: string;
  path: string;
}

interface FormProps {
  newDirName: string;
}

export const CompressionModal: React.FC<Props> = ({ open, onClose, path, reload, clusterId }) => {
  const t = useI18nTranslateToString();
  const p = prefix("component.decompressionModal.");

  const { message } = App.useApp();
  const [form] = Form.useForm<FormProps>();

  const mutation = trpc.file.decompression.useMutation({
    onSuccess: () => {
      message.success(t(p("success")));
      reload(form.getFieldValue("newDirName"));
      onClose();
      form.resetFields();
    },
    onError: (e) => {
      message.error(e.message);
    },
  });

  const onSubmit = async () => {

    const pathParts = path.split("/");
    pathParts.pop(); // 移除文件名
    const decompressionPath = pathParts.join("/");

    mutation.mutate({
      clusterId,
      filePath: path,
      decompressionPath,
    });
  };

  return (
    <Modal
      open={open}
      title={t(p("decompress"))}
      okText={t("button.confirmButton")}
      cancelText={t("button.cancelButton")}
      onCancel={onClose}
      confirmLoading={mutation.isLoading}
      destroyOnClose
      onOk={onSubmit}
    >
      {`${t(p("confirmText"))} ${path}`}
    </Modal>
  );
};
