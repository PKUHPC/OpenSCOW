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

import { Card, Typography } from "antd";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { styled } from "styled-components";

const { Text } = Typography;

interface Props {
  runningJobs: string;
  pendingJobs: string;
  loading: boolean;
  display: boolean;
}

const JobInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left:15px;
  padding-right:15px;
`;

const JobNumber = styled(Text)`
  margin: 0;
  font-weight:700;
  font-size:64px;
`;

const JobLabel = styled(Text)`
  margin: 0;
  font-weight:500;
`;

const JobInfoRow = styled.div`
  display: flex;
  width:100%;
  align-items:center;
  border-bottom:2px solid #DEDEDE;
  justify-content: space-between;
`;

const Container = styled.div`
margin: 0px 0;
`;

const p = prefix("pageComp.dashboard.nodeRange.");

const JobInfo: React.FC<Props> = ({ runningJobs, pendingJobs, loading, display }) => {
  const t = useI18nTranslateToString();

  // 没有数据时不显示
  if (!display) {
    return null;
  }

  return (
    <Container>
      <Card
        type="inner"
        title={<span style={{ fontSize:"1em" }}>{t(p("jobs"))}</span>}
        style={{ maxHeight:"310px", boxShadow: "0px 2px 10px 0px #1C01011A" }}
        loading={loading}
      >
        <JobInfoContainer>
          <JobInfoRow>
            <JobNumber style={{ color: "#D1CB5B", fontSize:"64px" }}>{runningJobs}</JobNumber>
            <JobLabel style={{ fontSize:"18px" }}>{t(p("running"))}</JobLabel>
          </JobInfoRow>
          <JobInfoRow style={{ marginTop:"5px", marginBottom:"25px" }}>
            <JobNumber style={{ color: "#A58E74", fontSize:"64px" }}>{pendingJobs}</JobNumber>
            <JobLabel style={{ fontSize:"18px" }}>{t(p("pending"))}</JobLabel>
          </JobInfoRow>
        </JobInfoContainer>
      </Card>
    </Container>

  );
};

export default JobInfo;
