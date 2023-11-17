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

import { Modal } from "antd";
import React, { useState } from "react";
import { styled } from "styled-components";

import { EntryItem } from "./EntryItem";

export interface Props {
  open: boolean;
  onClose: () => void;
}

const staticEntry = [
  {
    name:"未结束的作业",
    icon:"BookOutlined",
  },
  {
    name:"所有作业",
    icon:"BookOutlined",
  },
  {
    name:"提交作业",
    icon:"PlusCircleOutlined",
  },
  {
    name:"作业模板",
    icon:"SaveOutlined",
  },
];
const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
export const AddEntryModal: React.FC<Props> = ({
  open,
  onClose,
}) => {

  return (
    <Modal
      title="添加快捷方式"
      open={open}
      // onOk={form.submit}
      // confirmLoading={loading}
      width={600}
      onCancel={onClose}
      destroyOnClose
    >
      <ItemsContainer>
        {
          staticEntry.map((item, idx) => (
            <div key={idx} onClick={() => {}}>
              <EntryItem
                name={item.name}
                icon={item.icon}
                style={{ padding:"10px" }}
              />
            </div>
          ),
          )
        }
      </ItemsContainer>
    </Modal>
  );
};


