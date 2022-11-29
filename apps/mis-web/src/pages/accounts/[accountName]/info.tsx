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

import { moneyToNumber } from "@scow/lib-decimal";
import { Descriptions, Tag } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { USE_MOCK } from "src/apis/useMock";
import { ssrAuthenticate, SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { PageTitle } from "src/components/PageTitle";
import { UserRole } from "src/models/User";
import { getAccounts } from "src/pages/api/tenant/getAccounts";
import { Head } from "src/utils/head";
import { queryToString } from "src/utils/querystring";

type Props = SSRProps<{
  accountName: string;
  ownerName: string;
  ownerId: string;
  balance: number;
  blocked: boolean;
}, 404>

export const AccountInfoPage: NextPage<Props> = (props) => {

  if ("error" in props) {
    return <UnifiedErrorPage code={props.error} />;
  }

  const { accountName, balance, ownerId, ownerName, blocked } = props;
  const title = "账户信息";

  return (
    <div>
      <Head title={title} />
      <PageTitle titleText={title} />
      <Descriptions bordered column={1}>
        <Descriptions.Item label="账户名">
          {accountName}
        </Descriptions.Item>
        <Descriptions.Item label="账户拥有者">
          {ownerName}（ID：{ownerId}）
        </Descriptions.Item>
        <Descriptions.Item label="账户状态">
          {blocked ? <Tag color="red">封锁</Tag> : <Tag color="green">正常</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="账户余额">
          {balance.toFixed(3)} 元
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {


  const accountName = queryToString(ctx.query.accountName);

  if (USE_MOCK) {
    return { props: {
      accountName,
      balance: 10.23,
      ownerId: "ownerId",
      ownerName: "123",
      blocked: true,
    } };
  }

  const auth = ssrAuthenticate((i) => i.accountAffiliations.some((x) =>
    x.accountName === accountName && x.role !== UserRole.USER));

  const info = await auth(ctx.req);

  if (typeof info === "number") {
    return { props: { error: info } };
  }

  const accounts = await getAccounts({ accountName, tenantName: info.tenant });

  if (accounts.length === 0) {
    return { props: { error: 404 } };
  }

  const account = accounts[0];

  return { props: {
    balance: moneyToNumber(account.balance),
    accountName,
    ownerId: account.ownerId,
    ownerName: account.ownerName,
    blocked: account.blocked,
  } };


};

export default AccountInfoPage;
