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

import { JsonValue } from "@bufbuild/protobuf";
import { Message } from "@scow/notification-protos/build/message_pb";
import { AdminMessageType, adminMessageTypesMap } from "src/models/message-type";
import { CustomMessageType } from "src/server/entities/CustomMessageType";

import { formatDateTime } from "./datetime";

export interface RenderContent {
  id: bigint;
  title: string;
  content: string;
  createdAt: string;
}

enum TemplateLang {
  Default = "default",
  EN = "en",
  zhCn = "zhCn",
};

export const checkAdminMessageTypeExist = (type: string): CustomMessageType | null => {
  if (adminMessageTypesMap.has(type as AdminMessageType)) {
    return { type, ...adminMessageTypesMap.get(type as AdminMessageType) } as CustomMessageType;
  }

  return null;
};

export function replaceTemplate(metadata: JsonValue, template: string): string {

  if (!metadata) return "";

  return template.replace(/\{__(.*?)__\}/g, (match, p1) => {
    const value = p1 === "time" ? formatDateTime(metadata[p1] as string) : metadata[p1] as string;
    return value !== undefined ? value : match;
  });
}


function checkTemplateNotUndefined(message: Message) {
  if (message.messageType?.titleTemplate === undefined) return false;
  if (message.messageType.categoryTemplate === undefined) return false;
  if (message.messageType.contentTemplate === undefined) return false;

  return true;
}

function parseAdminMessage(message: Message): RenderContent | undefined {
  const fields = message.metadata?.toJson();

  if (!fields) return undefined;

  return {
    id: message.id,
    // eslint-disable-next-line @typescript-eslint/dot-notation
    title: fields["title"],
    // eslint-disable-next-line @typescript-eslint/dot-notation
    content: fields["content"] as string,
    createdAt: formatDateTime(message.createdAt),
  };
}

export const renderingMessage = (message: Message, languageId: string): RenderContent | undefined => {
  if (!message.messageType || !message.metadata) return undefined;

  if (checkAdminMessageTypeExist(message.messageType.type)) {
    return parseAdminMessage(message);
  } else if (checkTemplateNotUndefined(message)) {

    let templateLang: TemplateLang = TemplateLang.Default;
    if (languageId === "en") {
      templateLang = TemplateLang.EN;
    } else if (languageId === "zh_cn") {
      templateLang = TemplateLang.zhCn;
    }
    // 对应语言模板没有设置时采用默认模板
    const messageType = message.messageType;
    const titleTemplate =
      messageType.titleTemplate?.[templateLang] || messageType.titleTemplate!.default;
    const contentTemplate =
      messageType.contentTemplate?.[templateLang] || messageType.contentTemplate!.default;

    return {
      id: message.id,
      title: titleTemplate,
      content: replaceTemplate(message.metadata.toJson(), contentTemplate),
      createdAt: formatDateTime(message.createdAt),
    };
  } else {
    return {
      id: message.id,
      title: message.messageType.type,
      content: message.metadata?.toJsonString(),
      createdAt: formatDateTime(message.createdAt),
    };
  }
};
