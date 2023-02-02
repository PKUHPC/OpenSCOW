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
import React, { useRef } from "react";

import { TenantSelector } from "../tenant/TenantSelector";

type Props = {
  value?: string | null; // value will be null when selecting platform
  onChange?: (value: string | null) => void;
}

export const PlatformOrTenantRadio: React.FC<Props> = ({ value, onChange }) => {

  // 临时保存所有租户，用于切换到租户时选择默认租户
  const allTenantsRef = useRef<string[]>([]);

  const isPlatform = !value;

  return (
    <Radio.Group
      onChange={(e) => {
        onChange?.(e.target.value ? null : allTenantsRef.current[0]);
      }}
      value={isPlatform}
    >
      <Radio value={true}>{"平台"}</Radio>
      {/* TenantSelector如果放在Radio里将会无法点击 */}
      <Space size="small">
        <Radio value={false}>租户</Radio>
        <TenantSelector
          onTenantsFetched={(tenants) => { allTenantsRef.current = tenants; }}
          disabled={isPlatform}
          value={value ?? undefined}
          onChange={(tenant) => {
            onChange?.(tenant);
          }}
        />
      </Space>
    </Radio.Group>
  );
};
