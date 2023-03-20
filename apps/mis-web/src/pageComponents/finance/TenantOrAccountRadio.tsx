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
import type { AdminAccountInfo } from "src/pages/api/tenant/getAccounts";

import { AccountSelector } from "./AccountSelector";

type Props = {
  value?: string | undefined; // 如果选择租户，那么默认传undefined
  onChange?: (value: string | undefined) => void;
}

export const TenantOrAccountRadio: React.FC<Props> = ({ value, onChange }) => {

  // 临时保存所有账户，用于切换到账户时选择默认账户
  const allAccountsRef = useRef<AdminAccountInfo[]>([]);

  const isTenant = !value;

  return (
    <Radio.Group
      onChange={(e) => {
        onChange?.(e.target.value ? undefined : allAccountsRef.current[0].accountName);
      }}
      value={isTenant}
    >
      <Radio value={true}>租户</Radio>
      {/* TenantSelector如果放在Radio里将会无法点击 */}
      <Space size="small">
        <Radio value={false}>账户</Radio>
        <AccountSelector
          onAccountsFetched={(tenants) => { allAccountsRef.current = tenants; }}
          disabled={isTenant}
          value={value ?? undefined}
          onChange={(tenant) => {
            onChange?.(tenant);
          }}
        />
      </Space>
    </Radio.Group>
  );
};
