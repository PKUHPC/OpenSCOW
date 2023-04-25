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

import { Button, Popover, Space, Typography } from "antd";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import { useRef } from "react";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";
import styled from "styled-components";

const { Text } = Typography;

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

  .ant-popover-content p {
    margin: 0;
  }
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

  const headerRef = useRef<HTMLDivElement>(null);

  const clusterName = publicConfig.CLUSTERS.find((x) => x.id === cluster)?.name || cluster;

  return (
    <Container>
      <Head title={`${cluster}的终端`} />
      <Header ref={headerRef}>
        <h2>
          以ID: {userStore.user.identityId} 连接到集群 {clusterName}
        </h2>
        <Space wrap>
          <Button onClick={() => Router.reload()}>
          刷新并重新连接
          </Button>
          <Popover
            title="命令"
            trigger="hover"
            placement="bottom"
            zIndex={2000}
            getPopupContainer={() => headerRef.current || document.body}
            content={() => (
              <div>
                <p><b>跳转到文件系统</b>：<Text code>sopen</Text>，输入该命令后会跳转到文件系统，您可以进行文件的上传和下载</p>
                <p><b>文件下载</b>：<Text code>sdown [文件名]</Text>，输入<Text code>sdown [文件名]</Text>，
                您当前路径下的该文件会被下载到本地，目前不支持输入相对路径，<br />
                如果需要下载其他目录下的文件请使用<Text code>sopen</Text>命令跳转到文件系统。<br />
                使用示例：<Text code>sdown hello.txt</Text></p>

              </div>
            )}
          >
            <Button>命令</Button>
          </Popover>
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
