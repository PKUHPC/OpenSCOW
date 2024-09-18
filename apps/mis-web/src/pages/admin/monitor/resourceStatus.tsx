/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { joinWithUrl } from "@scow/utils";
import { Typography } from "antd";
import { NextPage } from "next";
import path from "path";
import { requireAuth } from "src/auth/requireAuth";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { PlatformRole } from "src/models/User";
import { antdBreakpoints } from "src/styles/constants";
import { publicConfig } from "src/utils/config";
import { DEFAULT_GRAFANA_URL } from "src/utils/constants";
import { Head } from "src/utils/head";
import { styled } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
`;

const FrameContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const IFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const TitleText = styled(Typography.Title)`
&& {
  width: 100vw;
  font-weight: 700;
  font-size: 24px;
  padding: 0 0 10px 20px;
  margin-left: -25px;
  border-bottom: 1px solid #ccc;
  @media (min-width: ${antdBreakpoints.md}px) {
    padding: 0 0 20px 30px;
  }
}
`;

const p = prefix("page.admin.monitor.resourceStatus.");

export const ResourceStatusPage: NextPage = requireAuth(
  (u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(() => {

  const t = useI18nTranslateToString();

  const normalGrafanaUrl = joinWithUrl(publicConfig.CLUSTER_MONITOR.grafanaUrl ?? DEFAULT_GRAFANA_URL,
    `/d/${publicConfig.CLUSTER_MONITOR.resourceStatus.dashboardUid}`);
  const proxyGrafanaUrl = path.join(publicConfig.BASE_PATH, "/api/admin/monitor/getResourceStatus",
    `/d/${publicConfig.CLUSTER_MONITOR.resourceStatus.dashboardUid}`);

  return (
    <>
      <Container>
        <Head title={t(p("resourceStatus"))} />
        <TitleText>{t(p("resourceStatus"))}</TitleText>
        { publicConfig.CLUSTER_MONITOR.resourceStatus.proxy
          ? <FrameContainer><IFrame src={proxyGrafanaUrl}></IFrame></FrameContainer>
          : <FrameContainer><IFrame src={normalGrafanaUrl}></IFrame></FrameContainer>
        }
      </Container>
    </>

  );
});

export default ResourceStatusPage;
