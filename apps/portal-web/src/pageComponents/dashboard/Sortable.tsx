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

import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext } from "@dnd-kit/sortable";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Entry } from "@scow/protos/build/portal/dashboard";
import { Card, message } from "antd";
import { useRouter } from "next/router";
import { join } from "path";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "src/apis";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { publicConfig } from "src/utils/config";
import { formatEntryId, getEntryClusterName, getEntryIcon, getEntryLogoPath, getEntryName } from "src/utils/dashboard";
import { styled } from "styled-components";

import { AddEntryModal } from "./AddEntryModal";
import { CardItem } from "./CardItem";
import { AppWithCluster } from "./QuickEntry";
import { SortableItem } from "./SortableItem";

const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ItemContainer = styled.div`
  position: relative;
`;

const IconContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 20px;
`;

const ClusterContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 36px;
  cursor: pointer;
`;

interface Props {
  isEditable: boolean,
  isFinished: boolean,
  quickEntryArray: Entry[],
  apps: AppWithCluster;
}
const p = prefix("pageComp.dashboard.sortable.");

export const Sortable: FC<Props> = ({ isEditable, isFinished, quickEntryArray, apps }) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;
  const router = useRouter();

  // 实际的快捷入口项
  const [items, setItems] = useState<Entry []>(quickEntryArray);
  // 编辑时临时的快捷入口项
  // 处理id使其唯一，因为不同集群可以有相同的交互式应用
  const [temItems, setTemItems] = useState([...(items.map((x) => ({ ...x, id:formatEntryId(x) }),
  ))]);

  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [changeClusterOpen, setChangeClusterOpen] = useState(false);

  // 要修改集信息快捷方式的id
  const [changeClusterItem, setChangeClusterItem] = useState<Entry | null>(null);

  // 被拖拽的快捷方式的id
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const activeItem = useMemo(() => {
    if (activeId) {
      return temItems.find((x) => x.id === activeId.toString());
    }
  }, [activeId]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const deleteFn = (id: string) => {
    setTemItems(temItems.filter((x) => x.id !== id));
  };

  const addItem = (item: Entry) => {
    item = { ...item, id:formatEntryId(item) };
    if (temItems.find((x) => x.id === item.id)) {
      message.error(t(p("alreadyExist")));
      return;
    }
    if (temItems.length >= 10) {
      message.error(t(p("exceedMaxSize")));
      return;
    }

    setTemItems([...temItems, item]);
  };

  const editItemCluster = (clusterId: string, loginNode?: string) => {

    const newId = changeClusterItem?.id.split("-")[0] + "-" + clusterId;

    if (temItems.find((x) => x.id === newId) && newId !== changeClusterItem?.id) {
      message.error(t(p("alreadyExist")));
      return;
    }

    setTemItems(temItems.map((x) => {
      if (x.id !== changeClusterItem?.id) {
        return x;
      }

      if (x.entry?.$case === "shell") {
        x.entry.shell.clusterId = clusterId;
        x.entry.shell.loginNode = loginNode as string;
      }
      else if (x.entry?.$case === "app") {
        x.entry.app.clusterId = clusterId;
      }

      x.id = newId;
      return x;
    }));
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setTemItems((temItems) => {
        const oldIndex = temItems.findIndex((x) => x.id === active.id.toString());
        const newIndex = temItems.findIndex((x) => x.id === over!.id.toString());

        return arrayMove(temItems, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const onItemClick = useCallback(
    (item: Entry) => {
      if (!isEditable) {
        switch (item.entry?.$case) {
        case "pageLink":
          router.push(join(publicConfig.BASE_PATH, item.entry.pageLink.path));
          break;

        case "shell":
          router.push(join(publicConfig.BASE_PATH, "/shell", item.entry.shell.clusterId, item.entry.shell.loginNode));
          break;

        case "app":
          router.push(
            join(publicConfig.BASE_PATH, "/apps", item.entry.app.clusterId, "/create", item.id.split("-")[0]));
          break;

        default:
          break;
        }
      }
    },
    [isEditable],
  );

  const saveItems = useCallback(
    async (newItems) => {
      await api.saveQuickEntries({ body:{
        quickEntries:newItems,
      } })
        .httpError(200, () => { message.error(t(p("saveFailed"))); })
        .then(() => {
          message.success(t(p("saveSuccessfully")));
        });
    },
    [],
  );

  useEffect(() => {
    if (isFinished) {
      const newItems = [...(temItems.map((x) => ({ ...x, id:x.id.split("-")[0] })))];
      setItems(newItems);
      saveItems(newItems);

    }
  }, [isFinished]);

  useEffect(() => {

    // 处理id使其唯一，因为不同集群可以有相同的交互式应用
    setTemItems([...(items.map((x) => ({ ...x, id:formatEntryId(x) })))]);
  }, [isEditable, items]);

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={temItems} strategy={rectSortingStrategy}>
          <ItemsContainer>
            {temItems.map((x) => (
              <ItemContainer
                key={x.id }
                onClick={() => {
                  onItemClick(x);
                }}
              >
                <SortableItem
                  id={x.id}
                  name={getEntryName(x)}
                  draggable={isEditable}
                  icon={getEntryIcon(x)}
                  logoPath={getEntryLogoPath(x, apps)}
                />
                {
                // 拖拽时隐藏删除按钮
                  isEditable && !(activeId && activeItem) ? (
                    <IconContainer onClick={() => { deleteFn(x.id); }}>
                      <MinusOutlined
                        style={{ backgroundColor:"#ccc", fontSize:"18px", borderRadius:"9px", color:"#fff" }}
                      />
                    </IconContainer>
                  ) :
                    undefined
                }
                {
                // 拖拽时隐藏集群信息
                // 交互式应用和shell在非编辑状态显示集群信息
                  (x.entry?.$case === "app" || x.entry?.$case === "shell") &&
                  ((!(activeId && activeItem) && isEditable) || !isEditable)
                    ? (
                      <ClusterContainer onClick={() =>
                      {
                        if (isEditable) {
                          setChangeClusterOpen(true);
                          setChangeClusterItem(x);
                        }
                      }}
                      >
                        { getI18nConfigCurrentText(
                          getEntryClusterName(x as Entry & {entry: {$case: "app" | "shell"} }),
                          languageId)
                        }
                      </ClusterContainer>
                    ) :
                    undefined
                }
              </ItemContainer>
            ))}
            {
              isEditable ? (
                <Card
                  style={{
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    width:"130px", height:"157px", margin:"20px 30px",
                    boxShadow:"rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px" }}
                  onClick={() => { setAddEntryOpen(true); }}
                >
                  <PlusOutlined style={{ fontSize:"40px", color:"#ccc" }} />
                </Card>
              ) : undefined
            }
          </ItemsContainer>
        </SortableContext>
        <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
          {activeId && activeItem ? (
            <CardItem
              isDragging
              id={activeId.toString()}
              name={getEntryName(activeItem)}
              draggable={isEditable}
              icon={getEntryIcon(activeItem)}
              logoPath={getEntryLogoPath(activeItem, apps)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <AddEntryModal
        open={addEntryOpen}
        onClose={() => { setAddEntryOpen(false); }}
        apps={apps}
        addItem={addItem}
        // 下面是修改快捷方式相关的内容
        editItem={editItemCluster}
        changeClusterOpen={changeClusterOpen}
        onChangeClusterClose={() => { setChangeClusterOpen(false); }}
        changeClusterItem={changeClusterItem}
      ></AddEntryModal>
    </div>
  );
};

