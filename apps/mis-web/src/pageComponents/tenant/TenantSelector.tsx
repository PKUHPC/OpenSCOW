import { ReloadOutlined } from "@ant-design/icons";
import { Button, Input, Select, Tooltip } from "antd";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { UserStore } from "src/stores/UserStore";

type Props = (
  | { allowUndefined: false; value?: string; onChange: (value: string) => void; }
  | { allowUndefined: true; value?: string | undefined; onChange?: (value: string | undefined) => void; }
) & {
  placeholder?: string;
}


export const TenantSelector: React.FC<Props> = ({ onChange, value, allowUndefined, placeholder }) => {
  const userStore = useStore(UserStore);

  const promiseFn = useCallback(async () => {
    return api.getTenants({ query: { } });
  }, [userStore.user]);

  const { data, isLoading, reload } = useAsync({
    promiseFn,
    onResolve: ({ names }) => {
      // validate selection
      if (allowUndefined) {
        if (value && !names.includes(value)) {
          onChange?.(undefined);
        }
      } else {
        if ((!value || !names.includes(value)) && names.length > 0) {
          onChange?.(names[0]);
        }
      }
    },
  });

  return (
    <Input.Group compact>
      <Select
        loading={isLoading}
        options={data ? data.names.map((x) => ({ label: x, value: x })) : []}
        placeholder={placeholder}
        value={value}
        style={{ width: "calc(100% - 32px)", minWidth: "200px" }}
        allowClear={allowUndefined}
        onChange={(v) => onChange?.(v)}
      />
      <Tooltip title="刷新租户列表">
        <Button icon={<ReloadOutlined spin={isLoading} />} onClick={reload} loading={isLoading} />
      </Tooltip>
    </Input.Group>
  );
};

