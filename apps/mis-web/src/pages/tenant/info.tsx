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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { moneyToNumber, numberToMoney } from "@scow/lib-decimal";
import type { GetTenantInfoResponse } from "@scow/protos/build/server/tenant";
import { TenantServiceClient } from "@scow/protos/build/server/tenant";
import { Descriptions, Tag } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { USE_MOCK } from "src/apis/useMock";
import { ssrAuthenticate, SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";
import { Head } from "src/utils/head";
import { handlegRPCError } from "src/utils/server";

type Info = GetTenantInfoResponse & { tenantName: string };

type Props = SSRProps<Info, 404>

export const TenantInfoPage: NextPage<Props> = (props) => {

  if ("error" in props) {
    return <UnifiedErrorPage code={props.error} />;
  }

  const { balance, accountCount, admins, 
    userCount, tenantName, financialStaff } = ensureNotUndefined(props, ["balance"]);
    
  return (
    <div>
      <Head title="租户信息" />
      <PageTitle titleText={"租户信息"} />
      <Descriptions bordered column={1}>
        <Descriptions.Item label="租户名">
          {tenantName}
        </Descriptions.Item>
        <Descriptions.Item label="管理员">
          {
            admins.map(({ userId, userName }) => (
              <Tag key={userId}>
                {userName} (ID: {userId})
              </Tag>
            ))
          }
        </Descriptions.Item>
        <Descriptions.Item label="租户财务人员">
          {
            financialStaff.map(({ userId, userName }) => (
              <Tag key={userId}>
                {userName} (ID: {userId})
              </Tag>
            ))
          }
        </Descriptions.Item>
        <Descriptions.Item label="账户数量">
          {accountCount}
        </Descriptions.Item>
        <Descriptions.Item label="用户数量">
          {userCount}
        </Descriptions.Item>
        <Descriptions.Item label="租户余额">
          {moneyToNumber(balance).toFixed(3)} 元
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {

  const auth = ssrAuthenticate((i) => i.tenantRoles.includes(TenantRole.TENANT_ADMIN));

  const info = await auth(ctx.req);

  if (typeof info === "number") {
    return { props: { error: info } };
  }

  if (USE_MOCK) {
    return {
      props: {
        accountCount: 10,
        admins: [{ userId: "123", userName: "1234" }, { userId: "1234", userName: "12345" }],
        financialStaff: [{ userId: "123", userName: "1234" }, { userId: "1234", userName: "12345" }],
        userCount: 100,
        balance: numberToMoney(100),
        tenantName: info.tenant,
      },
    };
  }

  const client = getClient(TenantServiceClient);
  return await asyncClientCall(client, "getTenantInfo", { tenantName: info.tenant })
    .then((r) => ({ props: { ...r, tenantName: info.tenant } }),
    )
    .catch(handlegRPCError({ [status.NOT_FOUND]: () => ({ props: { error: 404 as const } }) }));
};

export default TenantInfoPage;
