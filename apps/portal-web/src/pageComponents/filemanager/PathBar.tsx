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

import { DatabaseOutlined, ReloadOutlined, RightOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Input } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  path: string;
  loading: boolean;
  reload: () => void;
  go: (path: string) => void;
  fullUrl: (path: string) => string;
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

export const PathBar: React.FC<Props> = ({ path, loading, reload, go, fullUrl }) => {

  const [state, setState] = useState<"bar" | "input">("bar");

  const [input, setInput] = useState(path);

  useEffect(() => {
    setInput(path);
  }, [path]);

  const goOrReload = () => {
    if (input === path) {
      reload();
    } else {
      go(input);
    }

  };

  const pathSegments = path === "/" ? [] : path.split("/").splice(1);

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
            onSearch={goOrReload}
            enterButton={icon}
          />
        ) : (
          <>
            <BarStateBar onClick={() => setState("input")}>
              <Breadcrumb style={{ alignSelf: "center" }}>
                <Breadcrumb.Item>
                  <Link href={fullUrl("/")} title="/" onClick={(e) => e.stopPropagation()}>
                    <DatabaseOutlined />
                  </Link>
                </Breadcrumb.Item>
                {pathSegments.map((x, i) => (
                  <Breadcrumb.Item key={i}>
                    <Link
                      href={fullUrl(pathSegments.slice(0, i + 1).join("/"))}
                      key={i}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {x}
                    </Link>
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </BarStateBar>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                goOrReload();
              }}
              icon={icon}
            />
          </>
        )
      }
    </Bar>
  );
};
