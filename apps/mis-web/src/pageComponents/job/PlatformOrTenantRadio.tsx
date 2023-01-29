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

import { Radio, Space } from "antd";
import React, { useState } from "react";

import { TenantSelector } from "../tenant/TenantSelector";

type Props = {
  value: string | undefined;
  onChange: (value: string) => void;
}

export const PlatformOrTenantRadio: React.FC<Props> = ({ value, onChange }) => {
  const [select, setSelect] = useState(value);

  const [tenant, setTenant] = useState(value || "");

  return (
    <Radio.Group
      onChange={(e) => {
        setSelect(e.target.value);
        onChange(e.target.value);
      }}
      value={select}
      buttonStyle={"outline"}
    >
      <Radio value={undefined}>{"平台"}</Radio>
      <Space>
        <Radio value={tenant}>{"租户:"}</Radio>
        <TenantSelector 
          allowUndefined={false} 
          value={value}
          onChange={(tenant) => {
            focus();
            setSelect(tenant);
            setTenant(tenant);
            onChange(tenant);
          }}
        />
      </Space>
      
    </Radio.Group>
  );
};