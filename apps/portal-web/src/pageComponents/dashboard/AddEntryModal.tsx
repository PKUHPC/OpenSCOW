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
import { Entry } from "src/models/dashboard";
import { ChangeClusterModal } from "src/pageComponents/dashboard/changeClusterModal";
import { SelectClusterModal } from "src/pageComponents/dashboard/selectClusterModal";
import { Cluster, publicConfig } from "src/utils/config";
import { getEntryIcon } from "src/utils/dashboard";
import { styled } from "styled-components";

import { EntryItem } from "./EntryItem";

export interface Props {
  open: boolean;
  onClose: () => void;
  addItem: (item: Entry) => void;
  editItem: (clusterId: string, loginNode?: string) => void;
  changeClusterOpen: boolean;
  onChangeClusterClose: () => void;
  changeClusterItem: Entry | null;
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
  changeClusterItem,
}) => {
  const staticEntry: Entry[] = [
    {
      id:"submitJob",
      name:"提交作业",
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
      name:"未结束的作业",
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
      name:"所有作业",
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
      name:"作业模板",
      entry:{
        $case:"pageLink",
        pageLink:{
          path: "/jobs/savedJobs",
          icon:"SaveOutlined",
        },
      },
    },
    {
      id:"desktop",
      name:"桌面",
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

        // 只要有一个集群配置了app图片，快捷方式就可以显示app图片了
        if (!appWithCluster[y.id].app.logoPath && y.logoPath) {
          appWithCluster[y.id].app.logoPath = y.logoPath;
        }

        appWithCluster[y.id].clusters.push(clusters[idx]);
      });
    });
    return appWithCluster;
  }, [clusters]) });

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
              logoPath:x.app.logoPath,
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
  // 新建快捷方式的信息
  const [entryInfo, setEntryInfo] = useState<Entry>({
    id:"",
    name:"",
  });

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
      setEntryInfo({
        id:item.id,
        name:item.name,
        entry:{
          $case:"shell",
          shell:{
            clusterId:"",
            loginNode:"",
            icon:"MacCommandOutlined",
          },
        },
      },
      );
    }
    else if (item.entry?.$case === "app") {
      setNeedLoginNode(false);
      setClustersToSelectedApp(apps![item.id].clusters);
      setSelectClusterOpen(true);
      setEntryInfo({
        id:item.id,
        name:item.name,
        entry:{
          $case:"app",
          app:{
            clusterId:"",
            logoPath:item.entry.app.logoPath,
          },
        },
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
                    logoPath={item.entry?.$case === "app" ? item.entry.app.logoPath : ""}
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


