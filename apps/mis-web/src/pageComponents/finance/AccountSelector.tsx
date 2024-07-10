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

import { ReloadOutlined } from "@ant-design/icons";
import { Button, Select, Space, Tooltip } from "antd";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import type { AdminAccountInfo } from "src/pages/api/tenant/getAccounts";
import { UserStore } from "src/stores/UserStore";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * 如果为真，则在获取帐户数据时将自动选择第一个账户
   */
  autoSelect?: boolean;

  /**
   * 获取帐户时调用
   * @param accounts all accounts
   */
  onAccountsFetched?: (accounts: AdminAccountInfo[]) => void;

  /**
   * 如果为真，则从所有租户下获取账户
   */
  fromAllTenants?: boolean;
};

const p = prefix("pageComp.finance.AccountSelector.");

export const AccountSelector: React.FC<Props> = ({
  onChange, value, placeholder, disabled, autoSelect, onAccountsFetched, fromAllTenants,
}) => {

  const t = useI18nTranslateToString();

  const userStore = useStore(UserStore);

  const promiseFn = useCallback(async () => {
    return fromAllTenants ? api.getAllAccounts({ query: {} }) : api.getAccounts({ query: {} });
  }, [userStore.user]);

  const { data, isLoading, reload } = useAsync({
    promiseFn,
    onResolve(data) {
      onAccountsFetched?.(data.results);
      if (autoSelect && !value && data.results.length > 0) {
        onChange?.(data.results[0].accountName);
      }
    },
  });
  return (
    <Space.Compact style={{ width: "100%" }}>
      <Select
        showSearch
        loading={isLoading}
        options={data ? data.results.map((i) => ({ label: i.accountName, value: i.accountName })) : []}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        style={{ width: "calc(100% - 32px)", minWidth: "200px" }}
        onChange={(v) => onChange?.(v)}
        allowClear
      />
      <Tooltip title={t(p("freshList"))}>
        <Button icon={<ReloadOutlined spin={isLoading} />} disabled={disabled} onClick={reload} loading={isLoading} />
      </Tooltip>
    </Space.Compact>
  );
};
