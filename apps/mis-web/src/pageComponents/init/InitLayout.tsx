import { Button, Tabs, Typography } from "antd";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import React from "react";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { useModal } from "src/layouts/prompts";
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

export const InitDrawer: React.FC<DrawerProps> = (props) => {

  const modal = useModal();

  const { children } = props;
  return (
    <div>
      <Head title="系统初始化" />
      <Title>
        <span />
        <Typography.Title>系统初始化</Typography.Title>
        <CompleteButtonContainer>
          <Button
            type="primary"
            onClick={() => {
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
            }}
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

