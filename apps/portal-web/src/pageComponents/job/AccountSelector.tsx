import { ReloadOutlined } from "@ant-design/icons";
import { Button, Input, Select, Tooltip } from "antd";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { UserStore } from "src/stores/UserStore";

interface Props {
  cluster: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const AccountSelector: React.FC<Props> = ({ cluster, onChange, value }) => {
  const userStore = useStore(UserStore);

  const promiseFn = useCallback(async () => {
    return api.getAccounts({ query: { cluster } });
  }, [cluster, userStore.user]);

  const { data, isLoading, reload } = useAsync({ promiseFn, watch: userStore.user });

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

