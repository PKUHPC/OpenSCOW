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

import { App, Select } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { TenantRole, TenantRoleTexts } from "src/models/User";
import { User } from "src/stores/UserStore";

interface Props {
  roles: TenantRole[];
  userId: string;
  reload: () => void;
  currentUser?: User;
}

export const TenantRoleSelector: React.FC<Props> = ({ roles, userId, reload, currentUser }) => {

  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);

  return (
    <Select
      disabled={loading}
      value={roles}
      style={{ width: "100%" }}
      options={Object.values(TenantRole).map((x) => ({ label: TenantRoleTexts[x], value: x }))}
      onSelect={
        async (value) => {
          setLoading(true);
          await api.setTenantRole({ body:{
            userId: userId,
            roleType: value,
          } })
            .httpError(200, () => { message.error("用户已经是该角色"); })
            .httpError(404, () => { message.error("用户不存在"); })
            .httpError(403, () => { message.error("用户没有权限"); })
            .then(() => {
              message.success("设置成功");
              setLoading(false);
              reload();
            });
        }
      }
      onDeselect={
        async (value) => {
          if (currentUser && value === TenantRole.TENANT_ADMIN && currentUser.identityId === userId) {
            message.error("不能取消自己的租户管理员角色");
            return;
          }

          setLoading(true);
          await api.unsetTenantRole({ body:{
            userId: userId,
            roleType: value,
          } })
            .httpError(200, () => { message.error("用户已经不是该角色"); })
            .httpError(404, () => { message.error("用户不存在"); })
            .httpError(403, () => { message.error("用户没有权限"); })
            .then(() => {
              message.success("设置成功");
              setLoading(false);
              reload();
            });
        }
      }
      mode="multiple"
      placeholder="选择角色"
    />
  );
};

