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

import { MoneyCollectOutlined, PlayCircleOutlined, ProjectOutlined,
  TeamOutlined, UserOutlined, WalletOutlined } from "@ant-design/icons";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { defaultPresets } from "@scow/lib-web/build/utils/datetime";
import type { GetAdminInfoResponse } from "@scow/protos/build/server/admin";
import { AdminServiceClient } from "@scow/protos/build/server/admin";
import { Card, Col, DatePicker, Row, Space } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { USE_MOCK } from "src/apis/useMock";
import { requireAuth } from "src/auth/requireAuth";
import { ssrAuthenticate, SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { PageTitle } from "src/components/PageTitle";
import { useI18nTranslateToString } from "src/i18n";
import { PlatformRole } from "src/models/User";
import { DataBarChart } from "src/pageComponents/admin/DataBarChart";
import { DataLineChart } from "src/pageComponents/admin/DataLineChart";
import StatisticCard from "src/pageComponents/admin/StatisticCard";
import { getClient } from "src/utils/client";
import { Head } from "src/utils/head";
import { styled } from "styled-components";

const data = [
  {
    "x": "a_admin",
    "y": 102,
  },
  {
    "x": "b_admin",
    "y": 32,
  },
  {
    "x": "c_admin",
    "y": 401,
  },
  {
    "x": "d_admin",
    "y": 678,
  },
  {
    "x": "e_admin",
    "y": 190,
  },
  {
    "x": "f_admin",
    "y": 12,
  },
  {
    "x": "g_admin",
    "y": 8,
  },
];

const TitleText = styled.span`
  font-size: 24px;
  font-weight: bold;
`;

type Info = GetAdminInfoResponse

type Props = SSRProps<Info, 500>

export const PlatformInfoPage: NextPage<Props> =
requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))
((props: Props) => {

  const t = useI18nTranslateToString();

  if ("error" in props) {
    return <UnifiedErrorPage code={props.error} />;
  }

  const { tenantCount, accountCount, userCount } = props;


  return (
    <>
      <Head title="平台信息" />
      <PageTitle titleText={"数据总览"} />
      <Row gutter={[16, 16]}>
        <Col span={24} style={{ textAlign: "right" }}>
          <span>日期筛选：</span>
          <DatePicker.RangePicker allowClear={false} presets={defaultPresets} />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="用户"
            newAddValue={99}
            totalValue={userCount}
            icon={UserOutlined}
            iconColor="red"
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="账户"
            newAddValue={99}
            totalValue={accountCount}
            icon={WalletOutlined}
            iconColor="blue"
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="租户"
            newAddValue={99}
            totalValue={tenantCount}
            icon={TeamOutlined}
            iconColor="green"
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="作业"
            newAddValue={99}
            totalValue={999}
            icon={ProjectOutlined}
            iconColor="greyBlue"
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="消费"
            newAddValue={99}
            totalValue={999}
            icon={MoneyCollectOutlined}
            iconColor="yellow"
          />
        </Col>
        <Col span={24}>
          <Card
            title={(
              <Space>
                <UserOutlined style={{ fontSize: "24px", color: "red" }} />
                <TitleText>用户数量</TitleText>
              </Space>
            )}
            bordered={false}
            bodyStyle={{ display: "flex", flexDirection: "row" }}
          >
            <DataLineChart data={data} title="新增用户数"></DataLineChart>
            <DataLineChart data={data} title="活跃用户数"></DataLineChart>
          </Card>
        </Col>
        <Col span={24}>
          <Card
            title={(
              <Space>
                <MoneyCollectOutlined style={{ fontSize: "24px", color: "yellow" }} />
                <TitleText>消费/充值金额</TitleText>
              </Space>
            )}
            bordered={false}
            bodyStyle={{ display: "flex", flexDirection: "row" }}
          >
            <DataBarChart data={data} title="消费账户TOP10"></DataBarChart>
            <DataLineChart data={data} title="消费金额"></DataLineChart>
          </Card>
        </Col>
        <Col span={24}>
          <Card
            title={(
              <Space>
                <ProjectOutlined style={{ fontSize: "24px", color: "blue" }} />
                <TitleText>作业</TitleText>
              </Space>
            )}
            bordered={false}
            bodyStyle={{ display: "flex", flexDirection: "row" }}
          >
            <DataBarChart data={data} title="作业提交用户TOP10"></DataBarChart>
            <DataLineChart data={data} title="新增作业数量"></DataLineChart>
          </Card>
        </Col>
        <Col span={24}>
          <Card
            title={(
              <Space>
                <PlayCircleOutlined style={{ fontSize: "24px", color: "black" }} />
                <TitleText>系统功能使用统计</TitleText>
              </Space>
            )}
            bordered={false}
            bodyStyle={{ display: "flex", flexDirection: "row" }}
          >
            <DataBarChart data={data} title="门户系统使用功能次数"></DataBarChart>
            <DataBarChart data={data} title="管理系统使用功能次数"></DataBarChart>
          </Card>
        </Col>
      </Row>
    </>
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
