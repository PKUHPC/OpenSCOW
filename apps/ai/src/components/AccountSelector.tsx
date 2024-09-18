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

"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, Select, Space, Tooltip } from "antd";
import { useEffect } from "react";
import { trpc } from "src/utils/trpc";

interface Props {
  cluster?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const AccountSelector: React.FC<Props> = ({ cluster, onChange, value }) => {

  const { data, isLoading, refetch } = trpc.account.listAccounts.useQuery({ clusterId: cluster });

  useEffect(() => {

    if (data?.accounts.length) {
      if (!value || !data.accounts.includes(value)) {
        onChange?.(data.accounts[0]);
      }
    }
  }, [data, value]);

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Select
        loading={isLoading}
        options={data ? data.accounts.map((x) => ({ label: x, value: x })) : []}
        placeholder="请选择账户"
        value={value}
        style={{ width: "calc(100% - 32px)" }}
        onChange={(v) => onChange?.(v)}
      />
      <Tooltip title="刷新账户列表">
        <Button icon={<ReloadOutlined spin={isLoading} />} onClick={() => { refetch(); }} loading={isLoading} />
      </Tooltip>
    </Space.Compact>
  );
};

