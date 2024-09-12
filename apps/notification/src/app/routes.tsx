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

import { BookOutlined, DashboardOutlined, DatabaseOutlined, FileImageOutlined } from "@ant-design/icons";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { PlatformRole, UserInfo } from "src/models/user";


export const userRoutes:
(userInfo: UserInfo | undefined, scowParams: string) => NavItemProps[] = (userInfo, scowParams) => {

  if (!userInfo) return [];

  return [
    {
      Icon: DashboardOutlined,
      text: "消息通知",
      path: "/extensions/notification",
      clickToPath: `/extensions/notification?${scowParams}`,
    },
    {
      Icon: DatabaseOutlined,
      text: "消息订阅",
      path: "/subscription",
      clickToPath: `/subscription?${scowParams}`,
    },
    ...(userInfo.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ? [
      {
        Icon: FileImageOutlined,
        text: "消息设置",
        path: "/message-config",
        clickToPath: `/message-config?${scowParams}`,
      },
      {
        Icon: BookOutlined,
        text: "发送通知",
        path: "/send-message",
        clickToPath: `/send-message?${scowParams}`,
      },
      {
        Icon: FileImageOutlined,
        text: "创建自定义消息类型",
        path: "/create-custom-message-type",
        clickToPath: `/create-custom-message-type?${scowParams}`,
      },
    ] : []),
  ];

};
