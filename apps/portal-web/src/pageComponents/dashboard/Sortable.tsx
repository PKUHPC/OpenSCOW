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
import { api } from "src/apis";
import { EntryType, QuickEntry } from "src/models/User";
import { styled } from "styled-components";

import { AddEntryModal } from "./AddEntryModal";
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
  right: 20px;
`;

const ClusterContainer = styled.div`
  position: absolute;
  top: 18px;
  left: 34px;
`;

interface Props {
  isEditable: boolean,
  isFinish: boolean,
  quickEntryArray: QuickEntry[]
}

const Sortable: FC<Props> = ({ isEditable, isFinish, quickEntryArray }) => {

  // 实际的快捷入口项
  const [items, setItems] = useState<QuickEntry []>(
    quickEntryArray,
  );
  // 编辑时临时的快捷入口项
  // 处理id使其唯一，因为不同集群可以有相同的交互式应用
  const [temItems, setTemItems] = useState([...(items.map((x) => ({ ...x, id:x.id + "-" + x.cluster?.id })))]);

  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [changeClusterOpen, setChangeClusterOpen] = useState(false);

  const deleteFn = (id: string) => {
    setTemItems(temItems.filter((x) => x.id !== id));
  };

  const addItem = (item: QuickEntry) => {
    item = { ...item, id:item.id + "-" + item.cluster?.id };
    if (temItems.find((x) => x.id === item.id)) {
      message.error("已存在该快捷方式");
      return;
    }
    if (temItems.length >= 10) {
      message.error("最多只能添加10个快捷方式");
      return;
    }

    setTemItems([...temItems, item]);
  };

  const editItemCluster = (cluster: {id: string;name: string;}, loginNode?: string) => {
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
    (item: QuickEntry) => {
      if (!isEditable) {
        switch (item.entryType) {
        case EntryType.STATIC:
          Router.push(item.path);
          break;

        case EntryType.SHELL:
          Router.push(join(item.path, item.cluster!.id, item.loginNode!));
          break;

        case EntryType.APP:
          Router.push(join(item.path, item.cluster!.id, "/create", item.id));
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
      await api.saveQuickEntry({ body:{
        quickEntry:newItems,
      } })
        .httpError(200, () => { message.error("保存失败"); })
        .then(() => {
          message.success("保存成功");
        });
    },
    [],
  );

  useEffect(() => {
    if (isFinish) {
      const newItems = [...(temItems.map((x) => ({ ...x, id:x.id.split("-")[0] })))];
      setItems(newItems);
      saveItems(newItems);
    }
  }, [isFinish]);

  useEffect(() => {

    // 处理id使其唯一，因为不同集群可以有相同的交互式应用
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
                        style={{ backgroundColor:"#ccc", fontSize:"18px", borderRadius:"9px", color:"#fff" }}
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
