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

import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import React from "react";
import { NoticeType } from "src/models/notice-type";
import { noticeTypeNameMap } from "src/models/notice-type";

export interface SelectAllProps {
  e: CheckboxChangeEvent;
  checkedNoticeType: NoticeType
}

interface Props {
  type: NoticeType;
  handleCheckAll: (props: SelectAllProps) => void;
  disabled?: boolean;
  checked: boolean;
}

export const CheckAllSpecifiedNoticeType: React.FC<Props> = ({ type, disabled, checked, handleCheckAll }) => {

  return (
    <>
      <Checkbox
        disabled={disabled}
        checked={checked}
        onChange={(e) => handleCheckAll({ e, checkedNoticeType: type })}
      >
        {noticeTypeNameMap.get(type)}
      </Checkbox>
    </>
  );
};
