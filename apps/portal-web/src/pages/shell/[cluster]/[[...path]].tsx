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

import "xterm/css/xterm.css";

import { Button, Collapse, Space } from "antd";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";
import styled from "styled-components";

const { Panel } = Collapse;

const Container = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 2000;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  background-color: #333;

  h2 { color: white; margin: 0px; }
  .command { background-color: #ffffff; }
  .refresh { height: 46px; }
`;




const TerminalContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
`;

const Black = styled.div`
  height: 100%;
  background-color: black;
`;

const DynamicShellComponent = dynamic(
  () => import("src/pageComponents/shell/Shell").then((x) => x.Shell), {
    ssr: false,
    loading: Black,
  });


export const ShellPage: NextPage = requireAuth(() => true)(({ userStore }) => {

  if (!publicConfig.ENABLE_SHELL) {
    return <NotFoundPage />;
  }

  const router = useRouter();

  const cluster = router.query.cluster as string;
  const paths = router.query.path as (string[] | undefined);

  return (
    <Container>
      <Head title={`${cluster}的终端`} />
      <Header>
        <h2>
        以ID: {userStore.user.identityId} 连接到集群 {cluster}
        </h2>
        <Space wrap>
          <Button className="refresh" onClick={() => Router.reload()}>
          刷新并重新连接
          </Button>
          <Collapse className="command">
            <Panel header="命令" key="1">
            跳转到文件系统：scow-goto-file
            </Panel>
          </Collapse>
        </Space>


      </Header>
      <TerminalContainer>
        <DynamicShellComponent
          path={paths ? ("/" + paths.join("/")) : ""}
          user={userStore.user}
          cluster={cluster}
        />
      </TerminalContainer>
    </Container>
  );
});

export default ShellPage;
