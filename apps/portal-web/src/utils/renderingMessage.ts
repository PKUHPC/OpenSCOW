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
import { AdminMessageType, adminMessageTypesMap, CustomMessageType } from "@scow/lib-web/build/models/notif";
import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { Message } from "src/pages/api/notif/getUnreadMessages";

export interface RenderContent {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

enum TemplateLang {
  Default = "default",
  EN = "en",
  zhCn = "zhCn",
};

export const checkAdminMessageTypeExist = (
  type: string,
): CustomMessageType | undefined => {
  if (adminMessageTypesMap.has(type as AdminMessageType)) {
    return { type, ...adminMessageTypesMap.get(type as AdminMessageType) } as CustomMessageType;
  }

  return undefined;
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
  const fields = message.metadata;

  if (!fields) return undefined;

  return {
    id: message.id,
    // eslint-disable-next-line @typescript-eslint/dot-notation
    title: fields["title"],
    // eslint-disable-next-line @typescript-eslint/dot-notation
    description: fields["content"] as string,
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
    return {
      id: message.id,
      title: message.messageType.titleTemplate![templateLang],
      description: replaceTemplate(message.metadata, message.messageType.contentTemplate![templateLang]),
      createdAt: formatDateTime(message.createdAt),
    };
  } else {
    return {
      id: message.id,
      title: message.messageType.type,
      description: message.metadata?.content,
      createdAt: formatDateTime(message.createdAt),
    };
  }
};
