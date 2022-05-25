import { Popconfirm, Space } from "antd";
import { join } from "path";
import React, { useState } from "react";
import { api } from "src/apis";
import type { DesktopItem } from "src/pageComponents/desktop/DesktopTable";
interface Props {
  isChange: boolean,
  setChange: React.Dispatch<React.SetStateAction<boolean>>,
  record: DesktopItem,
}

export const openDesktop = (node: string, port: number, password: string) => {

  const params = new URLSearchParams({
    path: join(process.env.NEXT_PUBLIC_BASE_PATH ?? "", `api/proxy/${node}/${port}`),
    password: password,
    autoconnect: "true",
    reconnect: "true",
  });

  window.open("/vnc/vnc.html?" + params.toString(), "_blank");
};

export const DesktopTableActions: React.FC<Props> = ({ isChange, setChange, record }) => {

  //Is the popconfirm visible
  const [isPopconfirmVisible, setisPopconfirmVisible] = useState(false);
  return (
    <div>
      <Space size="middle">
        <a
          onClick={async () => {

            //launch desktop
            const resp = await api.launchDesktop({
              body: {
                cluster: record.clusterId,
                displayId: Number(record.desktop.split(":")[1]),
              },
            });

            openDesktop(resp.node, resp.port, resp.password);
          }}
        >
          启动
        </a>

        <Popconfirm
          title="删除后不可恢复，你确定要删除吗?"
          visible={isPopconfirmVisible}
          onConfirm={async () => {
            setisPopconfirmVisible(false);

            //kill desktop
            await api.killDesktop({
              body: {
                cluster: record.clusterId,
                displayId: Number(record.desktop.split(":")[1]),
              },
            });
            setChange(!isChange);
          }}
          onCancel={() => {
            setisPopconfirmVisible(false);
          }}
        >

          <a
            onClick={() => {
              setisPopconfirmVisible(true);
            }}
          >
            删除
          </a>
        </Popconfirm>
      </Space>
    </div>
  );

};

