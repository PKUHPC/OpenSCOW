import { Popconfirm, Space } from "antd";
import React, { useEffect, useState } from "react";
import { api as realApi } from "src/apis/api";

interface Props {
  ischange: boolean,
  setchange,
  record,
}

export const DesktopTableActions: React.FC<Props> = ({ ischange, setchange, record }) => {
  
  //Is the popconfirm visible
  const [isPopconfirmVisible, setisPopconfirmVisible] = useState(false);

  return (
    <div>
      <Space size="middle">
        <a
          onClick={async () => {

            //launch desktop
            const resp = await realApi.launchDesktop({
              body: {
                cluster: record.desktop.split(":")[0],
                displayId: record.desktop.split(":")[1],
              },
            });
            
            const params = new URLSearchParams({
              path: `/vnc-server/${resp.node}/${resp.port}`,
              password: resp.password,
              autoconnect: "true",
              reconnect: "true",
            });
        
            window.open("/vnc/vnc.html?" + params.toString(), "_blank");
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
            await realApi.killDesktop({
              body: {
                cluster: record.desktop.split(":")[0],
                displayId: record.desktop.split(":")[1],
              },
            });

            setchange(!ischange);
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

