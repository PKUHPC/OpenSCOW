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
import type { GetAdminInfoResponse } from "@scow/protos/build/server/admin";
import { AdminServiceClient } from "@scow/protos/build/server/admin";
import { Descriptions, Tag } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { USE_MOCK } from "src/apis/useMock";
import { requireAuth } from "src/auth/requireAuth";
import { ssrAuthenticate, SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { PageTitle } from "src/components/PageTitle";
import { useI18nTranslateToString } from "src/i18n";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { Head } from "src/utils/head";

type Info = GetAdminInfoResponse;

type Props = SSRProps<Info, 500>;

export const PlatformInfoPage: NextPage<Props> = requireAuth(
  (u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN),
)((props: Props) => {

  const t = useI18nTranslateToString();

  if ("error" in props) {
    return <UnifiedErrorPage code={props.error} />;
  }

  const { platformAdmins, tenantCount, accountCount, userCount, platformFinancialStaff } = props;


  return (
    <div>
      <Head title={t("common.platformInfo")} />
      <PageTitle titleText={t("common.platformInfo")} />
      <Descriptions bordered column={1}>
        <Descriptions.Item label={t("common.platformAdmin")}>
          {
            platformAdmins.map(({ userId, userName }) => (
              <Tag key={userId}>
                {userName} (ID: {userId})
              </Tag>
            ))
          }
        </Descriptions.Item>
        <Descriptions.Item label={t("common.platformFinancialStaff")}>
          {
            platformFinancialStaff.map(({ userId, userName }) => (
              <Tag key={userId}>
                {userName} (ID: {userId})
              </Tag>
            ))
          }
        </Descriptions.Item>
        <Descriptions.Item label={t("common.tenantCount")}>
          {tenantCount}
        </Descriptions.Item>
        <Descriptions.Item label={t("common.accountCount")}>
          {accountCount}
        </Descriptions.Item>
        <Descriptions.Item label={t("common.userCount")}>
          {userCount}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
});

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const auth = ssrAuthenticate(
    (i) => i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE)
      || i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN),
  );

  const info = await auth(ctx.req);
  if (typeof info === "number") {
    return { props: { error: info } };
  }

  if (USE_MOCK) {
    return {
      props: {
        platformAdmins: [{ userId: "demo_admin", userName: "demo_admin" }],
        platformFinancialStaff: [{ userId: "demo_admin", userName: "demo_admin" }],
        tenantCount: 10,
        accountCount: 20,
        userCount: 100,
      },
    };
  }

  const client = getClient(AdminServiceClient);
  return await asyncClientCall(client, "getAdminInfo", {})
    .then((response) => ({ props: response }))
    .catch(() => ({ props: { error: 500 as const } }));
};

export default PlatformInfoPage;
