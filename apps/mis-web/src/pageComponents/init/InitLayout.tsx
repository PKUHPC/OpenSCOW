import { Button, Modal, Tabs } from "antd";
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
  { label: <Link href="/init/importUsers">导入用户</Link>, key: "/init/importUsers" },
  { label: <Link href="/init/users">用户账户管理</Link>, key: "/init/users" },
  { label: <Link href="/init/createInitAdmin">创建初始管理员用户</Link>, key: "/init/createInitAdmin" },
  { label: <Link href="/init/jobPriceTable">编辑作业价格表</Link>, key: "/init/jobPriceTable" },
];

const TabsContainer = styled.div`
  .ant-tabs-tab:not(.ant-tabs-tab-active) a {
    color: initial;
  }
`;

export const InitTab: React.FC = () => {
  return (
    <TabsContainer>
      <Tabs centered items={TabItems} activeKey={useRouter().asPath}/>
    </TabsContainer>
  );
};

export const InitDrawer: React.FC<DrawerProps> = (props) => {
  const { children } = props;
  return (
    <div>
      <Head title="系统初始化"/>
      <Title>
        <span />
        <h1>系统初始化</h1>
        <CompleteButtonContainer>
          <Button type="primary" onClick={() => {
            Modal.confirm({
              title: "确认完成初始化",
              content: "一旦完成初始化，您将无法进入此页面重新初始化。",
              onOk: () => api.completeInit({}).then(() => {
                Modal.success({
                  title: "初始化完成！",
                  content: "点击确认前往登录",
                  closable: false,
                  maskClosable: false,
                  onOk: () => Router.push("/api/auth"),
                });
              }),
            });
          }}
          >
          完成初始化
          </Button>
        </CompleteButtonContainer>
      </Title>
      <InitTab/>
      <div>{children}</div>
    </div>
  );
};

