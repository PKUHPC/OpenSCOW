/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { ReloadOutlined } from "@ant-design/icons";
import { App, Button, Select, Space, Tooltip } from "antd";
import { useCallback, useEffect } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { UserStore } from "src/stores/UserStore";

interface Props {
  cluster?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const AccountSelector: React.FC<Props> = ({ cluster, onChange, value }) => {
  const userStore = useStore(UserStore);
  const { message } = App.useApp();

  const promiseFn = useCallback(async () => {
    return cluster ?
      api.getAccounts({ query: { cluster } })
        .httpError(404, (error) => { message.error(error.message); })
      : { accounts: [] as string[] };
  }, [cluster, userStore.user]);

  const { data, isLoading, reload } = useAsync({
    promiseFn,
    watch: userStore.user,
  });

  useEffect(() => {

    if (data?.accounts.length) {
      if (!value || !data.accounts.includes(value)) {
        onChange?.(data.accounts[0]);
      }
    }
  }, [data, value]);

  const t = useI18nTranslateToString();
  const p = prefix("pageComp.job.accountSelector.");

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Select
        loading={isLoading}
        options={data ? data.accounts.map((x) => ({ label: x, value: x })) : []}
        placeholder={t(p("selectAccountPlaceholder"))}
        value={value}
        style={{ width: "calc(100% - 32px)" }}
        onChange={(v) => onChange?.(v)}
      />
      <Tooltip title={t(p("refreshAccountList"))}>
        <Button icon={<ReloadOutlined spin={isLoading} />} onClick={reload} loading={isLoading} />
      </Tooltip>
    </Space.Compact>
  );
};
