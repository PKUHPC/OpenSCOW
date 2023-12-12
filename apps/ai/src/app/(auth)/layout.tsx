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

"use client";

import { AccountBookOutlined, InfoCircleOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import React from "react";
import { BaseLayout } from "src/layouts/base/BaseLayout";


export default function Layout(
  { children }:
  { children: React.ReactNode },
) {

  const routes = [
    {
      Icon: InfoCircleOutlined,
      text: "仪表盘",
      path: "/dashboard",
    },
    {
      Icon: TeamOutlined,
      text: "数据",
      path: "/dataset",
      clickToPath: "/dataset/private",
      children: [
        {
          Icon: UserOutlined,
          text: "我的数据集",
          path: "/dataset/private",
        },
        {
          Icon: AccountBookOutlined,
          text: "公共数据集",
          path: "/dataset/public",
        },
      ],
    },
    {
      Icon: TeamOutlined,
      text: "镜像",
      path: "/image",
      clickToPath: "",
      children: [
        {
          Icon: UserOutlined,
          text: "我的镜像",
          path: "/image/my",
        },
        {
          Icon: AccountBookOutlined,
          text: "公共镜像",
          path: "/image/public",
        },
      ],
    },
    {
      Icon: TeamOutlined,
      text: "算法",
      path: "/algorithm",
      clickToPath: "",
      children: [
        {
          Icon: UserOutlined,
          text: "我的算法",
          path: "/algorithm/my",
        },
        {
          Icon: AccountBookOutlined,
          text: "公共算法",
          path: "/algorithm/public",
        },
      ],
    },
    {
      Icon: TeamOutlined,
      text: "模型",
      path: "/algorithm",
      clickToPath: "",
      children: [
        {
          Icon: UserOutlined,
          text: "我的模型",
          path: "/modal/my",
        },
        {
          Icon: AccountBookOutlined,
          text: "公共模型",
          path: "/modal/public",
        },
      ],
    },
  ];

  return (
    <BaseLayout routes={routes}>
      {children}
    </BaseLayout>
  );

}
