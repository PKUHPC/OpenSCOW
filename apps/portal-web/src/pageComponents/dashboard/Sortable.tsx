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
import { Card, message } from "antd";
import Router from "next/router";
import { join } from "path";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Cluster } from "src/utils/config";
import { styled } from "styled-components";

import { AddEntryModal, EntryProps, EntryType } from "./AddEntryModal";
import Item from "./CardItem";
import SortableItem from "./SortableItem";

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
  right: 12px;
`;
const ClusterContainer = styled.div`
  position: absolute;
  top: 18px;
  left: 24px;
`;
interface Props {
  isEditable: boolean,
  isFinish: boolean,
}

const Sortable: FC<Props> = ({ isEditable, isFinish }) => {

  // 实际的快捷入口项
  const [items, setItems] = useState<EntryProps []>(
    [
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
    ],
  );
  // 编辑时临时的快捷入口项
  const [temItems, setTemItems] = useState([...(items.map((x) => ({ ...x, id:x.id + "-" + x.cluster?.id })))]);

  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [changeClusterOpen, setChangeClusterOpen] = useState(false);

  const deleteFn = (id: string) => {
    setTemItems(temItems.filter((x) => x.id !== id));
  };
  const addItem = (item: EntryProps) => {
    item = { ...item, id:item.id + "-" + item.cluster?.id };
    if (temItems.find((x) => x.id === item.id)) {
      message.error("已存在该快捷方式");
      return;
    }
    setTemItems([...temItems, item]);
  };

  const editItemCluster = (cluster: Cluster, loginNode?: string) => {
    setTemItems(temItems.map((x) => {
      if (x.id !== changeClusterActiveId) {
        return x;
      }
      x.cluster = cluster;
      x.loginNode = loginNode;
      return x;
    }));
  };

  // 要修改集信息快捷方式的id
  const [changeClusterActiveId, setChangeClusterId] = useState<string | null>(null);
  // 要修改集信息快捷方式的类型
  const [changeClusterEntryType, setChangeClusterEntryType] = useState< EntryType | null>(null);

  // 被拖拽的快捷方式的id
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const activeItem = useMemo(() => {
    if (activeId) {
      return temItems.find((x) => x.id === activeId.toString());
    }
  }, [activeId]);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    console.log("event.active.id", event.active.id);
  }, []);
  console.log("activeId", activeId);
  console.log("activeItem", activeItem);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    console.log("active.id", active.id);
    console.log("over.id", over!.id);
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
    (item: EntryProps) => {
      if (!isEditable) {
        switch (item.entryType) {
        case EntryType.static:
          Router.push(item.path);
          break;

        case EntryType.shell:
          Router.push(join(item.path, item.cluster!.id, item.loginNode!));
          break;

        case EntryType.app:
          Router.push(join(item.path, item.cluster!.id, "/create", item.id));
          break;

        default:
          break;
        }
      }
    },
    [isEditable],
  );


  useEffect(() => {
    if (isFinish) {
      setItems([...(temItems.map((x) => ({ ...x, id:x.id.split("-")[0] })))]);
    }
  }, [isFinish]);

  useEffect(() => {
    setTemItems([...(items.map((x) => ({ ...x, id:x.id + "-" + x.cluster?.id })))]);
  }, [isEditable]);

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={(isEditable ? temItems : items)} strategy={rectSortingStrategy}>
          <ItemsContainer>
            {(isEditable ? temItems : items).map((x) => (
              <ItemContainer
                key={x.id }
                onClick={() => {
                  onItemClick(x);
                }}
              >
                <SortableItem
                  id={x.id}
                  name={x.name}
                  draggable={isEditable}
                  icon={x.icon}
                  logoPath={x.logoPath}
                />
                {
                // 拖拽时隐藏删除按钮和集群信息
                  isEditable && !(activeId && activeItem) ? (
                    <IconContainer onClick={() => { deleteFn(x.id); }}>
                      <MinusOutlined
                        style={{ backgroundColor:"#ccc", fontSize:"16px", borderRadius:"8px", color:"#fff" }}
                      />
                    </IconContainer>
                  ) :
                    undefined
                }
                {
                  x.cluster?.name && !(activeId && activeItem) ? (
                    <ClusterContainer onClick={() =>
                    {
                      setChangeClusterOpen(true);
                      setChangeClusterId(x.id);
                      setChangeClusterEntryType(x.entryType);
                    }}
                    >
                      {x.cluster?.name as string}
                    </ClusterContainer>
                  ) :
                    undefined
                }
                {
                  // 非编辑状态显示集群信息
                  x.cluster?.name && !isEditable ? (
                    <ClusterContainer>
                      {x.cluster?.name as string}
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
                    width:"114px", height:"130px", margin:"20px",
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
            <Item
              isDragging
              id={activeId.toString()}
              name={activeItem.name}
              draggable={isEditable}
              icon={activeItem.icon}
              logoPath={activeItem.logoPath}
              cluster={activeItem.cluster}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <AddEntryModal
        open={addEntryOpen}
        onClose={() => { setAddEntryOpen(false); }}
        addItem={addItem}
        // 下面是修改快捷方式相关的内容
        editItem={editItemCluster}
        changeClusterOpen={changeClusterOpen}
        onChangeClusterClose={() => { setChangeClusterOpen(false); }}
        changeClusterEntryType={changeClusterEntryType}
        changeClusterId={changeClusterActiveId}
      ></AddEntryModal>
    </div>

  );
};

export default Sortable;
