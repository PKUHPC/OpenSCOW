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

import { Typography } from "antd";
import { NextPage } from "next";
import path from "path";
import { requireAuth } from "src/auth/requireAuth";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { PlatformRole } from "src/models/User";
import { antdBreakpoints } from "src/styles/constants";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";
import { styled } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  height: 100%;
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

  const grafanaUrl = path.join(publicConfig.BASE_PATH,
    "/api/admin/monitor/getResourceStatus", "/d/shZOtO4Sk/job-scheduler?orgId=1");

  return (
    <>
      <Container>
        <Head title={t(p("resourceStatus"))} />
        <TitleText>{t(p("resourceStatus"))}</TitleText>
        <iframe width="100%" height="760px" src={grafanaUrl}></iframe>
      </Container>
    </>

  );
});

export default ResourceStatusPage;
