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
import { Card } from "antd";
import React, { FC, useCallback, useEffect, useState } from "react";
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
  right: 12px;
`;
interface Props {
  isEditable: boolean,
  isFinish: boolean,
}

const Sortable: FC<Props> = ({ isEditable, isFinish }) => {

  // 实际的快捷入口项
  const [items, setItems] = useState(
    Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
  );
  // 编辑时临时的快捷入口项
  const [temItems, setTemItems] = useState([...items]);

  const [addEntryOpen, setAddEntryOpen] = useState(false);

  const deleteFn = (id: string) => {
    setTemItems(temItems.filter((i) => i !== id));
  };
  const addFn = () => {
    // setTemItems([...temItems, (temItems.length + 1).toString()]);
    setAddEntryOpen(true);
  };
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTemItems((temItems) => {
        const oldIndex = temItems.indexOf(active.id.toString());
        const newIndex = temItems.indexOf(over!.id.toString());

        return arrayMove(temItems, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }, []);
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  useEffect(() => {
    if (isFinish) {
      setItems([...temItems]);
    }
  }, [isFinish]);

  useEffect(() => {
    setTemItems([...items]);
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
            {(isEditable ? temItems : items).map((id) => (
              <ItemContainer key={id}>
                <SortableItem key={id} name={id} draggable={isEditable} icon="BookOutlined" />
                {
                  isEditable ? (
                    <IconContainer onClick={() => { deleteFn(id); }}>
                      <MinusOutlined
                        style={{ backgroundColor:"#ccc", fontSize:"16px", borderRadius:"8px", color:"#fff" }}
                      />
                    </IconContainer>
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
                  onClick={addFn}
                >
                  <PlusOutlined style={{ fontSize:"40px", color:"#ccc" }} />
                </Card>
              ) : undefined
            }

          </ItemsContainer>
        </SortableContext>
        <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
          {activeId ? <Item isDragging name={activeId.toString()} draggable={isEditable} /> : null}
        </DragOverlay>
      </DndContext>
      <AddEntryModal open={addEntryOpen} onClose={() => { setAddEntryOpen(false); }}></AddEntryModal>
    </div>

  );
};

export default Sortable;
