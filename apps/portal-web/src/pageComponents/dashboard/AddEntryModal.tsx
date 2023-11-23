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
import React, { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SelectClusterModal } from "src/pageComponents/dashboard/selectClusterModal";
import { Cluster, publicConfig } from "src/utils/config";
import { styled } from "styled-components";

import { EntryItem } from "./EntryItem";

export interface Props {
  open: boolean;
  onClose: () => void;
  addItem: (item: EntryProps) => void;
}
export interface EntryProps {
  id: string;
  name: string;
  path: string;
  entryType: EntryType;
  needCluster?: boolean;
  icon?: string;
  logoPath?: string;
  cluster?: Cluster;
  loginNode?: string;
}

export enum EntryType {
  // 路径固定
  static = 1,
  // 交互式应用
  app = 2,
  shell = 3,
}

const staticEntry: EntryProps[] = [
  {
    id:"submitJob",
    name:"提交作业",
    icon:"PlusCircleOutlined",
    path: "/jobs/submit",
    entryType:EntryType.static,
  },
  {
    id:"runningJob",
    name:"未结束的作业",
    icon:"BookOutlined",
    path: "/jobs/runningJobs",
    entryType:EntryType.static,
  },
  {
    id:"allJobs",
    name:"所有作业",
    icon:"BookOutlined",
    path: "/jobs/allJobs",
    entryType:EntryType.static,
  },
  {
    id:"savedJobs",
    name:"作业模板",
    icon:"SaveOutlined",
    path: "/jobs/savedJobs",
    entryType:EntryType.static,
  },
  {
    id:"shell",
    name:"shell",
    icon:"MacCommandOutlined",
    path: "/shell",
    needCluster:true,
    entryType:EntryType.shell,
  },
];
const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
export const AddEntryModal: React.FC<Props> = ({
  open,
  onClose,
  addItem,
}) => {

  const clusters = publicConfig.CLUSTERS;

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

  const appInfo = useMemo(() => {
    const displayApp: EntryProps[] = [];

    if (apps) {
      for (const key in apps) {
        const x = apps[key];
        displayApp.push({
          id:x.app.id,
          name:x.app.name,
          path:"/app",
          logoPath:x.app.logoPath,
          needCluster:true,
          entryType:EntryType.app,
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
  const [entryInfo, setEntryInfo] = useState<EntryProps>({
    id:"",
    name:"",
    path:"/app",
    needCluster:true,
    entryType:EntryType.app,
  });

  const handleClick = (item: EntryProps) => {
    if (item.entryType === EntryType.shell) {
      setNeedLoginNode(true);
      setClustersToSelectedApp(clusters);
      setSelectClusterOpen(true);
      setEntryInfo((preVal) => {
        return { ...preVal, id:item.id, name:item.name, path:"/shell",
          entryType:EntryType.shell, icon:item.icon, logoPath:"" };
      });
    }
    else if (item.entryType === EntryType.app) {
      setNeedLoginNode(false);
      setClustersToSelectedApp(apps![item.id].clusters);
      setSelectClusterOpen(true);
      setEntryInfo((preVal) => {
        return { ...preVal, id:item.id, name:item.name, logoPath:item.logoPath, icon:item.icon };
      });
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
        // confirmLoading={loading}
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
    </>

  );
};


