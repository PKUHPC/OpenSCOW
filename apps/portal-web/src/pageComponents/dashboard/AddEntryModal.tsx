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

import { Button, Modal, Spin } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { EntryType, QuickEntry } from "src/models/User";
import { ChangeClusterModal } from "src/pageComponents/dashboard/changeClusterModal";
import { SelectClusterModal } from "src/pageComponents/dashboard/selectClusterModal";
import { Cluster, publicConfig } from "src/utils/config";
import { styled } from "styled-components";

import { EntryItem } from "./EntryItem";

export interface Props {
  open: boolean;
  onClose: () => void;
  addItem: (item: QuickEntry) => void;
  editItem: (cluster: Cluster, loginNode?: string) => void;
  changeClusterOpen: boolean;
  onChangeClusterClose: () => void;
  changeClusterEntryType: EntryType | null;
  changeClusterId: string | null;
}

const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const AddEntryModal: React.FC<Props> = ({
  open,
  onClose,
  addItem,
  editItem,
  changeClusterOpen,
  onChangeClusterClose,
  changeClusterEntryType,
  changeClusterId,
}) => {
  const staticEntry: QuickEntry[] = [
    {
      id:"submitJob",
      name:"提交作业",
      icon:"PlusCircleOutlined",
      path: "/jobs/submit",
      entryType:EntryType.STATIC,
    },
    {
      id:"runningJob",
      name:"未结束的作业",
      icon:"BookOutlined",
      path: "/jobs/runningJobs",
      entryType:EntryType.STATIC,
    },
    {
      id:"allJobs",
      name:"所有作业",
      icon:"BookOutlined",
      path: "/jobs/allJobs",
      entryType:EntryType.STATIC,
    },
    {
      id:"savedJobs",
      name:"作业模板",
      icon:"SaveOutlined",
      path: "/jobs/savedJobs",
      entryType:EntryType.STATIC,
    },
    {
      id:"desktop",
      name:"桌面",
      icon:"DesktopOutlined",
      path: "/desktop",
      entryType:EntryType.STATIC,
    },
    {
      id:"shell",
      name:"shell",
      icon:"MacCommandOutlined",
      path: "/shell",
      needCluster:true,
      entryType:EntryType.SHELL,
    },
  ];
  const clusters = publicConfig.CLUSTERS;

  // apps包含在哪些集群上可以创建app
  const { data:apps, isLoading } = useAsync({ promiseFn: useCallback(async () => {
    const appsInfo = await Promise.all(clusters.map((x) => {
      return api.listAvailableApps({ query: { cluster: x.id } });
    }));

    const appWithCluster = {};
    appsInfo.forEach((x, idx) => {
      x.apps.forEach((y) => {
        if (!appWithCluster[y.id]) {
          appWithCluster[y.id] = {
            app: y,
            clusters: [],
          };
        }
        appWithCluster[y.id].clusters.push(clusters[idx]);
      });
    });
    return appWithCluster;
  }, [clusters]) });

  // 所有可创建的app
  const appInfo = useMemo(() => {
    const displayApp: QuickEntry[] = [];

    if (apps) {
      for (const key in apps) {
        const x = apps[key];
        displayApp.push({
          id:x.app.id,
          name:x.app.name,
          path:"/app",
          logoPath:x.app.logoPath,
          needCluster:true,
          entryType:EntryType.APP,
        });
      }
    }

    return displayApp;
  }, [apps]);

  const [selectClusterOpen, setSelectClusterOpen] = useState(false);
  const [needLoginNode, setNeedLoginNode] = useState(false);
  // 可以创建该App的集群
  const [clustersToSelectedApp, setClustersToSelectedApp] = useState<Cluster[]>([]);
  // 新建快捷方式的信息
  const [entryInfo, setEntryInfo] = useState<QuickEntry>({
    id:"",
    name:"",
    path:"/apps",
    needCluster:true,
    entryType:EntryType.APP,
  });

  // 设置要修改信息的快捷方式的 是否需要登录节点 和 可用的集群
  useEffect(() => {
    if (changeClusterEntryType === EntryType.SHELL) {
      setNeedLoginNode(true);
      setClustersToSelectedApp(clusters);
    }
    else if (changeClusterEntryType === EntryType.APP) {
      setNeedLoginNode(false);
      setClustersToSelectedApp(apps![changeClusterId!.split("-")[0]].clusters);
    }
  }, [changeClusterEntryType, changeClusterId]);


  const handleClick = (item: QuickEntry) => {
    if (item.entryType === EntryType.SHELL) {
      setNeedLoginNode(true);
      setClustersToSelectedApp(clusters);
      setSelectClusterOpen(true);
      setEntryInfo(
        (preVal) => ({ ...preVal,
          ... {
            id:item.id,
            name:item.name,
            path:"/shell",
            entryType:EntryType.SHELL,
            icon:item.icon,
            logoPath:"",
          },
        }),
      );
    }
    else if (item.entryType === EntryType.APP) {
      setNeedLoginNode(false);
      setClustersToSelectedApp(apps![item.id].clusters);
      setSelectClusterOpen(true);
      setEntryInfo((preVal) => ({ ...preVal,
        ...{
          id:item.id,
          name:item.name,
          path:"/apps",
          entryType:EntryType.APP,
          icon:"",
          logoPath:item.logoPath,
        },
      }),
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
        title="添加快捷方式"
        open={open}
        width={600}
        onCancel={onClose}
        destroyOnClose
        footer={[
          <Button key="back" onClick={onClose}>
            取消
          </Button>,
        ]}
      >
        {isLoading ? <Spin /> : (
          <ItemsContainer>
            {
              staticEntry.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => { handleClick(item);
                  }}
                >
                  <EntryItem
                    name={item.name}
                    icon={item.icon}
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
                    icon={item.icon}
                    style={{ padding:"10px" }}
                  />
                </div>
              ),
              )
            }
          </ItemsContainer>
        )}

      </Modal>
      <SelectClusterModal
        open={selectClusterOpen}
        onClose={() => { setSelectClusterOpen(false); }}
        needLoginNode={needLoginNode}
        entryInfo={entryInfo}
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


