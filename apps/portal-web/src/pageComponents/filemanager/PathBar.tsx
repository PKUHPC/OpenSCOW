import { ReloadOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
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
              <Space>
                <Link href={fullUrl("/")} passHref onClick={(e) => e.stopPropagation()}>

                    /

                </Link>
                {pathSegments.map((x, i) => (
                  <Fragment key={x}>
                    <Link
                      href={fullUrl(pathSegments.slice(0, i + 1).join("/"))}
                      key={i}
                      passHref
                      onClick={(e) => e.stopPropagation()}
                    >

                      {x}

                    </Link>
                    <span>
                    /
                    </span>
                  </Fragment>
                ))}
              </Space>
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
