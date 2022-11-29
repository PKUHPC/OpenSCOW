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

interface Props {
  cluster?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const AccountSelector: React.FC<Props> = ({ cluster, onChange, value }) => {
  const userStore = useStore(UserStore);

  const promiseFn = useCallback(async () => {
    return cluster ? api.getAccounts({ query: { cluster } }) : { accounts: [] as string[] };
  }, [cluster, userStore.user]);

  const { data, isLoading, reload } = useAsync({
    promiseFn,
    watch: userStore.user,
    onResolve: ({ accounts }) => {
      if (!value || !accounts.includes(value)) {
        onChange?.(accounts[0]);
      }
    },
  });

  return (
    <Input.Group compact>
      <Select
        loading={isLoading}
        options={data ? data.accounts.map((x) => ({ label: x, value: x })) : []}
        placeholder={"请选择账户"}
        value={value}
        style={{ width: "calc(100% - 32px)" }}
        onChange={(v) => onChange?.(v)}
      />
      <Tooltip title="刷新账户列表">
        <Button icon={<ReloadOutlined spin={isLoading} />} onClick={reload} loading={isLoading} />
      </Tooltip>
    </Input.Group>
  );
};

