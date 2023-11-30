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

import { Button, Spin, Typography } from "antd";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { Entry } from "src/models/dashboard";
import Sortable from "src/pageComponents/dashboard/Sortable";
import { styled } from "styled-components";

const ContentContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  padding-right: 0;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

interface Props {

}
const p = prefix("pageComp.dashboard.quickEntry.");

export const QuickEntry: React.FC<Props> = () => {
  const t = useI18nTranslateToString();

  const staticEntry: Entry[] = [
    {
      id:"submitJob",
      name:t("routes.job.submitJob"),
      entry:{
        $case:"pageLink",
        pageLink:{
          path: "/jobs/submit",
          icon:"PlusCircleOutlined",
        },
      },
    },
    {
      id:"runningJob",
      name:t("routes.job.runningJobs"),
      entry:{
        $case:"pageLink",
        pageLink:{
          path: "/jobs/runningJobs",
          icon:"BookOutlined",
        },
      },
    },
    {
      id:"allJobs",
      name:t("routes.job.allJobs"),
      entry:{
        $case:"pageLink",
        pageLink:{
          path: "/jobs/allJobs",
          icon:"BookOutlined",
        },
      },
    },
    {
      id:"savedJobs",
      name:t("routes.job.jobTemplates"),
      entry:{
        $case:"pageLink",
        pageLink:{
          path: "/jobs/savedJobs",
          icon:"SaveOutlined",
        },
      },
    },
  ];

  const { data, isLoading } = useAsync({ promiseFn: useCallback(async () => {
    return await api.getQuickEntries({});
  }, []) });

  const { Title } = Typography;

  const [isEditable, setIsEditable] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  return (
    <ContentContainer>
      <TitleContainer>
        <Title level={5} style={{ marginBottom:0, lineHeight:"32px" }}>{t(p("quickEntry"))}</Title>
        {isEditable ? (
          <div>
            <Button type="link" onClick={() => { setIsEditable(false); setIsFinished(true); }}>
              {t(p("finish"))}
            </Button>
            <Button type="link" onClick={() => { setIsEditable(false); }}>{t(p("cancel"))}</Button>
          </div>
        ) :
          <Button type="link" onClick={() => { setIsEditable(true); setIsFinished(false); }}>{t(p("edit"))}</Button>}
      </TitleContainer>
      <CardsContainer>
        {isLoading ?
          <Spin /> : (
            <Sortable
              isEditable={isEditable}
              isFinished={isFinished}
              quickEntryArray={data?.quickEntries.length ? data?.quickEntries : staticEntry }
            ></Sortable>
          )}
      </CardsContainer>
    </ContentContainer>
  );
};
