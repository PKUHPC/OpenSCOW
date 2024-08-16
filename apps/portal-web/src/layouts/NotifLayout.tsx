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

import { Button, notification, Space, Typography } from "antd";
import { useEffect, useRef } from "react";
import { api } from "src/apis";
import { AdminMessageType } from "src/models/notif";
import { RenderContent, renderingMessage } from "src/utils/renderingMessage";

const { Paragraph, Title } = Typography;
interface NotificationLayoutProps {
  children: React.ReactNode;
  interval?: number; // 定时器的时间间隔，默认60秒
}

const NotificationLayout: React.FC<NotificationLayoutProps> = ({ children, interval = 60000 }) => {

  const [notifApi, contextHolder] = notification.useNotification();
  const notifiedIdsRef = useRef<Set<number>>(new Set()); // 用于追踪已通知的ID

  const close = () => {
    console.log(
      "Notification was closed. Either the close button was clicked or duration time elapsed.",
    );
  };

  const openNotification = (content: RenderContent) => {
    const key = content.id;
    const btn = (
      <Space>
        <Button type="link" size="small" onClick={() => notifApi.destroy()}>
          忽略
        </Button>
        <Button type="primary" size="small" onClick={() => notifApi.destroy(key)}>
          已读
        </Button>
      </Space>
    );
    notifApi.open({
      message: <Title level={5}>{content.title}</Title>,
      description: (
        <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "more" }}>
          {content.description}
        </Paragraph>
      ),
      btn,
      key,
      duration: 0,
      onClose: close,
    });
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { results } = await api.getUnreadMessage({ query: {} });

        for (const msg of results.messages) {
          if (msg.messageType?.type === AdminMessageType.SystemNotification) {
            const content = renderingMessage(msg);

            // 使用 ref 来检查已通知的 ID
            if (content && !notifiedIdsRef.current.has(msg.id)) {
              openNotification(content);
              notifiedIdsRef.current.add(msg.id); // 更新 ref 中的 ID 集合
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    // 定时器，按指定的时间间隔调用
    const timer = setInterval(() => {
      fetchNotifications();
    }, interval);

    // 清除定时器
    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div>
      {contextHolder}
      {children}
    </div>
  );
};

export default NotificationLayout;
