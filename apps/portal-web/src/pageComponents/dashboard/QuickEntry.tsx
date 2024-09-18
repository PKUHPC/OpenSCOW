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

import { Entry } from "@scow/protos/build/portal/dashboard";
import { Button, Spin } from "antd";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Localized, prefix } from "src/i18n";
import { DashboardSection } from "src/pageComponents/dashboard/DashboardSection";
import { Sortable } from "src/pageComponents/dashboard/Sortable";
import { App } from "src/pages/api/app/listAvailableApps";
import { Cluster } from "src/utils/cluster";
import { styled, useTheme } from "styled-components";

import Bullet from "./Bullet";

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const EditButton = styled(Button)`
`;


export type AppWithCluster = Record<string, {
  app: App;
  clusters: Cluster[];
}>;

interface Props {
  currentClusters: Cluster[];
  publicConfigClusters: Cluster[];
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
        icon:"AllJobsOutlined",
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

export const QuickEntry: React.FC<Props> = ({ currentClusters, publicConfigClusters }) => {

  const { data, isLoading:getQuickEntriesLoading } = useAsync({ promiseFn: useCallback(async () => {
    return await api.getQuickEntries({});
  }, []) });

  // apps包含在哪些集群上可以创建app
  const { data:apps, isLoading:getAppsLoading } = useAsync({ promiseFn: useCallback(async () => {
    const appsInfo = await Promise.all(currentClusters.map((x) => {
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

        appWithCluster[y.id].clusters.push(currentClusters[idx]);
      });
    });
    return appWithCluster;
  }, [currentClusters]) });

  const [isEditable, setIsEditable] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const theme = useTheme();

  return (
    <DashboardSection
      style={{ marginBottom: "16px" }}
      title={ (
        <>
          <Bullet style={{
            width: "0.8em", /* 与字体大小相对应 */
            height:" 0.8em", /* 与字体大小相对应 */
            backgroundColor:theme.token.colorPrimary, /* 与主题颜色相对应 */
            marginRight:"1em",
          }}
          />
          <Localized id={p("quickEntry")} />
        </>
      )}
      extra={
        isEditable ? (
          <div>
            <EditButton
              style={{ marginRight:"20px" }}
              onClick={() => { setIsEditable(false); setIsFinished(true); }}
            >
              <Localized id={p("finish")} />
            </EditButton>
            <EditButton
              onClick={() => { setIsEditable(false); }}
            >
              <Localized id={p("cancel")} />
            </EditButton>
          </div>
        ) : (
          <EditButton onClick={() => { setIsEditable(true); setIsFinished(false); }}>
            <Localized id={p("edit")} />
          </EditButton>
        )}
    >
      <CardsContainer>
        {getQuickEntriesLoading || getAppsLoading ?
          <Spin /> : (
            <Sortable
              isEditable={isEditable}
              isFinished={isFinished}
              quickEntryArray={data?.quickEntries.length ? data?.quickEntries : defaultEntry }
              apps={apps ?? {}}
              currentClusters={currentClusters}
              publicConfigClusters={publicConfigClusters}
            ></Sortable>
          )}
      </CardsContainer>
    </DashboardSection>
  );
};
