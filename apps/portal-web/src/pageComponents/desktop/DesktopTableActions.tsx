import { Popconfirm, Space } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import type { DesktopItem } from "src/pageComponents/desktop/DesktopTable";
import { openDesktop } from "src/utils/vnc";

interface Props {
  reload: () => void;
  record: DesktopItem;
}

export const DesktopTableActions: React.FC<Props> = ({ reload, record }) => {

  // Is the popconfirm visible
  const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
  return (
    <div>
      <Space size="middle">
        <a
          onClick={async () => {

            // launch desktop
            const resp = await api.launchDesktop({
              body: {
                cluster: record.cluster.id,
                displayId: record.desktopId,
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
            setIsPopconfirmVisible(false);

            // kill desktop
            await api.killDesktop({
              body: {
                cluster: record.cluster.id,
                displayId: record.desktopId,
              },
            });

            reload();

          }}
          onCancel={() => {
            setIsPopconfirmVisible(false);
          }}
        >

          <a
            onClick={() => {
              setIsPopconfirmVisible(true);
            }}
          >
            删除
          </a>
        </Popconfirm>
      </Space>
    </div>
  );

};

