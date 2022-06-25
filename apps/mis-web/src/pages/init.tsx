import { Button, Modal, Result, Tabs } from "antd";
import { GetServerSideProps, NextPage } from "next";
import Router from "next/router";
import { api } from "src/apis";
import { SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { Centered } from "src/components/layouts";
import { InitImportUsersForm } from "src/pageComponents/init/InitImportUsersForm";
import { PlatformAdminUserForm } from "src/pageComponents/init/PlatformAdminUserForm";
import { Head } from "src/utils/head";
import { queryIfInitialized } from "src/utils/init";
import styled from "styled-components";

type Props = SSRProps<{}>;

const Title = styled(Centered)`
  position: relative;
`;

const CompleteButtonContainer = styled.div`
  position: absolute;
  right: 0;
`;

export const InitSystemPage: NextPage<Props> = (props) => {

  if ("error" in props) {
    return (
      <UnifiedErrorPage code={props.error}
        customComponents={{
          409: (
            <Result
              status="error"
              title="系统已初始化"
              subTitle="系统已经初始化完成，无法重新初始化！"
            />
          ),
        }}
      />
    );
  }

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
      <Tabs centered defaultActiveKey="1">
        <Tabs.TabPane tab="创建平台管理员用户" key="1">
          <PlatformAdminUserForm />
        </Tabs.TabPane>
        <Tabs.TabPane tab="导入用户" key="2">
          <InitImportUsersForm />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );

};

export const getServerSideProps: GetServerSideProps<Props> = async () => {

  const result = await queryIfInitialized();

  if (result) { return { props: { error: 409 } }; }

  return { props: {} };

};

export default InitSystemPage;
