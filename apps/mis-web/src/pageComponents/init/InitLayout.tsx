import { Button, Modal, Tabs } from "antd";
import Link from "next/link";
import Router from "next/router";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { Head } from "src/utils/head";
import styled from "styled-components";


type Props = React.PropsWithChildren;

const Title = styled(Centered)`
  position: relative;
`;

const CompleteButtonContainer = styled.div`
  position: absolute;
  right: 0;
`;

export const InitDrawer: React.FC<Props> = ({
  children,
}) => {
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
      <Tabs centered>
        <Tabs.TabPane tab="导入用户" key="1">
          {/* <Link href="/pages/init/importUsers"/> */}
        </Tabs.TabPane>
        <Tabs.TabPane tab="用户账户管理" key="2">
          {/* <Link href="/pages/init/users"/> */}
        </Tabs.TabPane>
        <Tabs.TabPane tab="创建初始管理员用户" key="3">
          {/* <Link href="/pages/init/createInitAdmin"/> */}
        </Tabs.TabPane>
        <Tabs.TabPane tab="编辑作业价格表" key="4">
          {/* <Link href="/pages/init/jobPriceTable"/> */}
        </Tabs.TabPane>
      </Tabs>
      <div>{children}</div>
    </div>
  );
};
