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
import { Button, Modal } from "antd";
import React, { useMemo, useState } from "react";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { SelectClusterModal } from "src/pageComponents/dashboard/SelectClusterModal";
import { Cluster } from "src/utils/cluster";
import { getEntryBaseName, getEntryIcon } from "src/utils/dashboard";
import { styled } from "styled-components";

import { EntryItem } from "./EntryItem";
import { AppWithCluster, defaultEntry } from "./QuickEntry";

export enum EntryCase {
  shell,
  app
}
export interface IncompleteEntryInfo {
  id: string;
  name: string;
  case: EntryCase;
}
export interface Props {
  open: boolean;
  onClose: () => void;
  addItem: (item: Entry) => void;
  apps: AppWithCluster;
  clusters: Cluster[];
}

const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const ItemContainer = styled.div`
  cursor: pointer;
  height: 120px;
  min-width: 120px;
  padding: 12px;

  background-color: ${(p) => p.theme.token.colorBgBlur};
`;

const p = prefix("pageComp.dashboard.addEntryModal.");

export const AddEntryModal: React.FC<Props> = ({
  open,
  onClose,
  addItem,
  apps,
  clusters,
}) => {
  const t = useI18nTranslateToString();

  const staticEntries: Entry[] = defaultEntry.concat([
    {
      id:"desktop",
      name:"desktop",
      entry:{
        $case:"pageLink",
        pageLink:{
          path: "/desktop",
          icon:"DesktopOutlined",
        },
      },
    },
    {
      id:"shell",
      name:"shell",
      entry:{
        $case:"shell",
        shell:{
          clusterId:"",
          loginNode:"",
          icon:"MacCommandOutlined",
        },
      },
    },
  ]);

  // 所有可创建的app
  const appInfo = useMemo(() => {
    const displayApp: IncompleteEntryInfo[] = [];

    if (apps) {
      for (const key in apps) {
        const x = apps[key];
        displayApp.push({
          id:x.app.id,
          name:x.app.name,
          case:EntryCase.app,
        });
      }
    }

    return displayApp;
  }, [apps]);

  const [selectClusterOpen, setSelectClusterOpen] = useState(false);
  const [needLoginNode, setNeedLoginNode] = useState(false);
  // 可以创建该App的集群
  const [clustersToSelectedApp, setClustersToSelectedApp] = useState<Cluster[]>([]);
  // 新建快捷方式的部分信息
  const [incompleteEntryInfo, setIncompleteEntryInfo] = useState<IncompleteEntryInfo | null>(null);

  const handleClick = (item: Entry | IncompleteEntryInfo) => {

    if ((item as Entry).entry?.$case === "shell") {
      setNeedLoginNode(true);
      setClustersToSelectedApp(clusters);
      setSelectClusterOpen(true);
      setIncompleteEntryInfo({
        id:item.id,
        name:item.name,
        case:EntryCase.shell,
      },
      );
    }
    else if ((item as IncompleteEntryInfo).case === EntryCase.app) {
      setNeedLoginNode(false);
      setClustersToSelectedApp(apps![item.id].clusters);
      setSelectClusterOpen(true);
      setIncompleteEntryInfo({
        id:item.id,
        name:item.name,
        case:EntryCase.app,
      },
      );
    }
    else {
      addItem(item);
      onClose();
    }

  };
  return (
    <>
      <Modal
        title={t(p("addQuickEntry"))}
        open={open}
        width={600}
        onCancel={onClose}
        destroyOnClose
        footer={[
          <Button key="back" onClick={onClose}>
            {t(p("cancel"))}
          </Button>,
        ]}
      >
        <ItemsContainer>
          {
            staticEntries.map((item, idx) => (
              <ItemContainer key={idx} onClick={() => { handleClick(item); }}>
                <EntryItem
                  entryBaseName={getEntryBaseName(item, t)}
                  icon={getEntryIcon(item)}
                />
              </ItemContainer>
            ),
            )
          }
          {
            appInfo.map((item, idx) => (
              <ItemContainer
                key={idx}
                onClick={() => { handleClick(item); }}
              >
                <EntryItem
                  entryBaseName={item.name}
                  logoPath={apps[item.id].app.logoPath}
                />
              </ItemContainer>
            ),
            )
          }
        </ItemsContainer>
      </Modal>
      <SelectClusterModal
        open={selectClusterOpen}
        onClose={() => { setSelectClusterOpen(false); }}
        needLoginNode={needLoginNode}
        incompleteEntryInfo={incompleteEntryInfo}
        clusters={clustersToSelectedApp}
        addItem={addItem}
        closeAddEntryModal={onClose}
      />
    </>
  );
};


