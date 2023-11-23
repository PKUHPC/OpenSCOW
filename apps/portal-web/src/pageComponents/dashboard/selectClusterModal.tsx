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

import { Form, Modal, Select } from "antd";
import React, { useMemo, useState } from "react";
import { useStore } from "simstate";
import { LoginNodeStore } from "src/stores/LoginNodeStore";
import { Cluster } from "src/utils/config";

import { EntryProps } from "./AddEntryModal";

export interface Props {
  open: boolean;
  onClose: () => void;
  needLoginNode: boolean;
  clusters: Cluster[];
  addItem: (item: EntryProps) => void;
  entryInfo: EntryProps;
  closeAddEntryModal: () => void;
}

interface FormInfo {
  cluster: string;
  loginNode?: string;
}

export const SelectClusterModal: React.FC<Props> = ({
  open,
  onClose,
  needLoginNode,
  clusters,
  addItem,
  entryInfo,
  closeAddEntryModal,
}) => {
  const [form] = Form.useForm<FormInfo>();

  const clustersOptions = clusters.map((x) => ({ value:x.id, label:x.name }));
  const { loginNodes } = useStore(LoginNodeStore);
  const [loginNodesOptions, setLoginNodesOptions] = useState<{}[]>([]);

  const handelClusterChange = (cluster: string) => {
    const nodes = loginNodes[cluster].map((x) => ({ value:x.address, label:x.name }));
    setLoginNodesOptions(nodes);
  };

  const onFinish = async () => {
    const { cluster, loginNode } = await form.validateFields();

    addItem({ ...entryInfo, cluster:clusters.find((x) => x.id === cluster), loginNode });
    form.resetFields();
    onClose();
    closeAddEntryModal();
  };
  return (
    <Modal
      title="选择集群"
      open={open}
      onOk={onFinish}
      width={400}
      centered
      onCancel={onClose}
      destroyOnClose
    >

      <Form
        form={form}
        wrapperCol={{ span: 18 }}
        labelCol={{ span:6, style:{ textAlign:"left" } }}
      >
        <Form.Item
          rules={[{ required: true }]}
          label={"集群"}
          name="cluster"
        >
          <Select
            onChange={handelClusterChange}
            options={clustersOptions}
          />

        </Form.Item>
        {needLoginNode ? (
          <Form.Item
            rules={[{ required: true }]}
            label={"登录节点"}
            name="loginNodes"
          >
            <Select
            // onChange={handleChange}
              options={loginNodesOptions}
            />
          </Form.Item>
        ) : undefined}
      </Form>
    </Modal>
  );
};


