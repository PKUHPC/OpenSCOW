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

import { Modal, Typography } from "antd";
import React from "react";
import { RenderContent } from "src/utils/rendering-message";

const { Text } = Typography;

export interface Props {
  open: boolean;
  onClose: () => void;
  data: RenderContent | undefined;
}

export const MessageContentModal: React.FC<Props> = ({ open, onClose, data }) => {

  const handleOk = () => {
    onClose();
  };

  return (
    <Modal
      title={data?.title}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      footer={(_, { OkBtn }) => (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary">{data?.createdAt}</Text>
          <OkBtn />
        </div>
      )}
    >
      {data?.content}
    </Modal>
  );
};
