import { Menu } from "antd";
import React, { useMemo } from "react";
import { calcSelectedKeys, createMenuItems } from "src/layouts/common";
import { NavItemProps } from "src/layouts/NavItemProps";
import { arrayContainsElement } from "src/utils/array";
import styled from "styled-components";

// get the select
const Container = styled.div`
  width: 100%;

  .ant-menu-item {
    padding-left: 16px !important;
  }
`;

interface Props {
  routes?: NavItemProps[];
  pathname: string;
  className?: string;
}

export const BigScreenMenu: React.FC<Props> = ({
  routes, pathname, className,
}) => {

  const selectedKeys = useMemo(() =>
    routes
      ? calcSelectedKeys(routes, pathname)
      : []
  , [routes, pathname]);

  return (
    <Container className={className}>
      {
        arrayContainsElement(routes)
          ? (
            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={selectedKeys}
              style={{ border: 0 }}
              forceSubMenuRender
              items={createMenuItems(routes, true)}
            />
          ) : undefined
      }
    </Container>
  );
};
