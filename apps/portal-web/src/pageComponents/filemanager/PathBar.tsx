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

import { ReloadOutlined, RightOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Input } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  path: string;
  loading: boolean;
  onPathChange: (path: string) => void;
  breadcrumbItemRender: (pathSegament: string, index: number, path: string) => React.ReactNode;
}

const Bar = styled.div`
  display: flex;
  width: 100%;
`;

const BarStateBar = styled(Bar)`
  border: 1px solid ${({ theme }) => theme.token.colorBorder};
  border-radius: ${({ theme }) => theme.token.borderRadius}px;
  padding: 0 8px;
  margin: 0 4px;

  .ant-breadcrumb {
    align-self: center;
  }
`;

export const PathBar: React.FC<Props> = ({
  path,
  loading,
  onPathChange,
  breadcrumbItemRender,
}) => {

  const [state, setState] = useState<"bar" | "input">("bar");

  const [input, setInput] = useState(path);

  useEffect(() => {
    setInput(path);
  }, [path]);

  const pathSegments = path === "/" ? [""] : path.split("/");

  const icon = path === input
    ? <ReloadOutlined spin={loading} />
    : <RightOutlined />;

  return (
    <Bar onBlur={() => {
      setInput(path);
      setState("bar");
    }}
    >
      {state === "input"
        ? (
          <Input.Search
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onSearch={onPathChange}
            enterButton={icon}
          />
        ) : (
          <>
            <BarStateBar onClick={() => setState("input")}>
              <Breadcrumb style={{ alignSelf: "center" }}>
                {pathSegments.map((segament, index) => (
                  <Breadcrumb.Item key={index}>
                    {breadcrumbItemRender(segament, index, pathSegments.slice(1, index + 1).join("/"))}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </BarStateBar>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPathChange(input);
              }}
              icon={icon}
            />
          </>
        )
      }
    </Bar>
  );
};
