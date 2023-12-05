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
import React, { useEffect, useMemo, useState } from "react";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { ChangeClusterModal } from "src/pageComponents/dashboard/ChangeClusterModal";
import { SelectClusterModal } from "src/pageComponents/dashboard/SelectClusterModal";
import { Cluster, publicConfig } from "src/utils/config";
import { getEntryIcon, getEntryLogoPath, getEntryName } from "src/utils/dashboard";
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
  editItem: (clusterId: string, loginNode?: string) => void;
  changeClusterOpen: boolean;
  onChangeClusterClose: () => void;
  changeClusterItem: Entry | null;
}

const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const p = prefix("pageComp.dashboard.addEntryModal.");

export const AddEntryModal: React.FC<Props> = ({
  open,
  onClose,
  addItem,
  apps,
  editItem,
  changeClusterOpen,
  onChangeClusterClose,
  changeClusterItem,
}) => {
  const t = useI18nTranslateToString();

  const staticEntry: Entry[] = defaultEntry.concat([
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

  const clusters = publicConfig.CLUSTERS;

  // 所有可创建的app
  const appInfo = useMemo(() => {
    const displayApp: Entry[] = [];

    if (apps) {
      for (const key in apps) {
        const x = apps[key];
        displayApp.push({
          id:x.app.id,
          name:x.app.name,
          entry:{
            $case:"app",
            app:{
              clusterId:"",
            },
          },
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
  const [IncompleteEntryInfo, setIncompleteEntryInfo] = useState<IncompleteEntryInfo | null>(null);

  // 设置要修改信息的快捷方式的 是否需要登录节点 和 可用的集群
  useEffect(() => {
    if (changeClusterItem?.entry?.$case === "shell") {
      setNeedLoginNode(true);
      setClustersToSelectedApp(clusters);
    }
    else if (changeClusterItem?.entry?.$case === "app") {
      setNeedLoginNode(false);
      setClustersToSelectedApp(apps![changeClusterItem.id.split("-")[0]].clusters);
    }
  }, [changeClusterItem]);


  const handleClick = (item: Entry) => {
    if (item.entry?.$case === "shell") {
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
    else if (item.entry?.$case === "app") {
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
            staticEntry.map((item, idx) => (
              <div
                key={idx}
                onClick={() => { handleClick(item);
                }}
              >
                <EntryItem
                  name={getEntryName(item)}
                  icon={getEntryIcon(item)}
                  style={{ padding:"10px" }}
                />
              </div>
            ),
            )
          }
          {
            appInfo.map((item, idx) => (
              <div
                key={idx}
                onClick={() => { handleClick(item);
                }}
              >
                <EntryItem
                  name={item.name}
                  logoPath={getEntryLogoPath(item, apps)}
                  style={{ padding:"10px" }}
                />
              </div>
            ),
            )
          }
        </ItemsContainer>
      </Modal>
      <SelectClusterModal
        open={selectClusterOpen}
        onClose={() => { setSelectClusterOpen(false); }}
        needLoginNode={needLoginNode}
        IncompleteEntryInfo={IncompleteEntryInfo}
        clusters={clustersToSelectedApp}
        addItem={addItem}
        closeAddEntryModal={onClose}
      />

      <ChangeClusterModal
        open={changeClusterOpen}
        onClose={onChangeClusterClose}
        needLoginNode={needLoginNode}
        clusters={clustersToSelectedApp}
        editItem={editItem}
      />
    </>

  );
};


