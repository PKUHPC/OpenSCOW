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

import { Entry } from "@scow/protos/build/portal/dashboard";
import { Button, Spin, Typography } from "antd";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { Sortable } from "src/pageComponents/dashboard/Sortable";
import { App } from "src/pages/api/app/listAvailableApps";
import { Cluster, publicConfig } from "src/utils/config";
import { styled } from "styled-components";

const ContentContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  padding-right: 0;
  border-radius: 8px 8px 0 0;
  margin-bottom: 20px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export interface AppWithCluster {
  [appId: string]: {
    app: App;
    clusters: Cluster[];
  };
}

interface Props {

}

export const defaultEntry: Entry[] = [
  {
    id:"submitJob",
    name:"submitJob",
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
    name:"runningJobs",
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
    name:"allJobs",
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
    name:"savedJobs",
    entry:{
      $case:"pageLink",
      pageLink:{
        path: "/jobs/savedJobs",
        icon:"SaveOutlined",
      },
    },
  },
];
const p = prefix("pageComp.dashboard.quickEntry.");

export const QuickEntry: React.FC<Props> = () => {
  const t = useI18nTranslateToString();

  const { data, isLoading:getQuickEntriesLoading } = useAsync({ promiseFn: useCallback(async () => {
    return await api.getQuickEntries({});
  }, []) });

  const clusters = publicConfig.CLUSTERS;

  // apps包含在哪些集群上可以创建app
  const { data:apps, isLoading:getAppsLoading } = useAsync({ promiseFn: useCallback(async () => {
    const appsInfo = await Promise.all(clusters.map((x) => {
      return api.listAvailableApps({ query: { cluster: x.id } });
    }));

    const appWithCluster: AppWithCluster = {};
    appsInfo.forEach((x, idx) => {
      x.apps.forEach((y) => {
        if (!appWithCluster[y.id]) {
          appWithCluster[y.id] = {
            app: y,
            clusters: [],
          };
        }

        // 只要有一个集群配置了app图片，快捷方式就可以显示app图片了
        if (!appWithCluster[y.id].app.logoPath && y.logoPath) {
          appWithCluster[y.id].app.logoPath = y.logoPath;
        }

        appWithCluster[y.id].clusters.push(clusters[idx]);
      });
    });
    return appWithCluster;
  }, [clusters]) });

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
        {getQuickEntriesLoading || getAppsLoading ?
          <Spin /> : (
            <Sortable
              isEditable={isEditable}
              isFinished={isFinished}
              quickEntryArray={data?.quickEntries.length ? data?.quickEntries : defaultEntry }
              apps={apps ?? {}}
            ></Sortable>
          )}
      </CardsContainer>
    </ContentContainer>
  );
};
