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
import { Button, Input, Select, Tooltip } from "antd";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { UserStore } from "src/stores/UserStore";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * if true, the first tenant will be selected automatically when tenants are fetched
   */
  autoSelect?: boolean;

  /**
   * Called when tenants are fetched
   * @param tenants all tenants
   */
  onTenantsFetched?: (tenants: string[]) => void;
}

export const TenantSelector: React.FC<Props> = ({
  onChange, value, placeholder, disabled, autoSelect, onTenantsFetched,
}) => {

  const userStore = useStore(UserStore);

  const promiseFn = useCallback(async () => {
    return api.getTenants({ query: { } });
  }, [userStore.user]);

  const { data, isLoading, reload } = useAsync({
    promiseFn,
    onResolve(data) {
      onTenantsFetched?.(data.names);
      if (autoSelect && !value && data.names.length > 0) {
        onChange?.(data.names[0]);
      }
    },
  });

  return (
    <Input.Group compact>
      <Select
        showSearch
        loading={isLoading}
        options={data ? data.names.map((x) => ({ label: x, value: x })) : []}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        style={{ width: "calc(100% - 32px)", minWidth: "200px" }}
        onChange={(v) => onChange?.(v)}
      />
      <Tooltip title="刷新租户列表">
        <Button icon={<ReloadOutlined spin={isLoading} />} disabled={disabled} onClick={reload} loading={isLoading} />
      </Tooltip>
    </Input.Group>
  );
};

