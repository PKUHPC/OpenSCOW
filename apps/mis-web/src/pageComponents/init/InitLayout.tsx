import { Button, Modal } from "antd";
import Router from "next/router";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { Head } from "src/utils/head";
import styled from "styled-components";

const Title = styled(Centered)`
  position: relative;
`;

const CompleteButtonContainer = styled.div`
  position: absolute;
  right: 0;
`;

export const InitDrawer: React.FC = () => {
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
    </div>
  );
};