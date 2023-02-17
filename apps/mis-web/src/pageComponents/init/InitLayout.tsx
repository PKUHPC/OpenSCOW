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

import { App, Button, Tabs, Typography } from "antd";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import React from "react";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { Head } from "src/utils/head";
import styled from "styled-components";

type DrawerProps = {
  children: React.ReactNode;
}

const Title = styled(Centered)`
  position: relative;
`;

const CompleteButtonContainer = styled.div`
  position: absolute;
  right: 0;
`;

const TabItems = [
  { label: "导入用户", href: "/init/importUsers" },
  { label: "用户账户管理", href: "/init/users" },
  { label: "创建初始管理员用户", href: "/init/createInitAdmin" },
  { label: "编辑作业价格表", href: "/init/jobPriceTable" },
];

const TabsContainer = styled.div`
  .ant-tabs-tab:not(.ant-tabs-tab-active) a {
    color: ${({ theme }) => theme.token.colorText};
  }
`;

export const InitTab: React.FC = () => {

  const router = useRouter();

  return (
    <TabsContainer>
      <Tabs
        centered
        items={TabItems.map(({ label, href }) => (
          { key: href, label: <Link href={href}>{label}</Link> }
        ))}
        activeKey={router.asPath}
      />
    </TabsContainer>
  );
};

export const InitDrawer: React.FC<DrawerProps> = ({ children }) => {

  const { modal } = App.useApp();

  const onOk = async () => {

    // check price item completeness
    const missingPriceItems = await api.getMissingDefaultPriceItems({});

    if (missingPriceItems.items.length > 0) {
      modal.error({
        title: "价格表不完整",
        content: "请对每个作业计费项确定价格后再完成初始化。",
      });
      return;
    }

    modal.confirm({
      title: "确认完成初始化",
      content: "一旦完成初始化，您将无法进入此页面重新初始化。",
      onOk: () => api.completeInit({}).then(() => {
        modal.success({
          title: "初始化完成！",
          content: "点击确认前往登录",
          closable: false,
          maskClosable: false,
          onOk: () => Router.push("/api/auth"),
        });
      }),
    });
  };

  return (
    <div>
      <Head title="系统初始化" />
      <Title>
        <span />
        <Typography.Title>系统初始化</Typography.Title>
        <CompleteButtonContainer>
          <Button
            type="primary"
            onClick={onOk}
          >
            完成初始化
          </Button>
        </CompleteButtonContainer>
      </Title>
      <InitTab />
      <div>{children}</div>
    </div>
  );
};

