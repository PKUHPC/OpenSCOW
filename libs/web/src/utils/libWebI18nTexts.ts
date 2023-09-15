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

import { SYSTEM_VALID_LANGUAGES } from "./languages";

export const libWebZhCn = {
  comp: {
    clusterSelector: {
      placeholder: "请选择集群",
    },
  },
  layouts: {
    smallScreenMenu: {
      welcome: "欢迎",
      logout: "退出登录",
    },
    userIndicator: {
      userName: "用户姓名",
      userId: "用户ID",
      personalInfo: "个人信息",
      logout: "退出登录",
      login: "登录",
    },
    darkMode: {
      system: "跟随系统",
      light: "亮色",
      dark: "暗色",
    },
    defaultClusterSelector: {
      title: "需要选择集群的功能将会默认选择默认集群",
      label: "选择默认集群",
    },
  },
  utils: {
    dateTime: {
      today: "今天",
      tWeek: "本周",
      tMonth: "本月",
      tYear: "今年",
      threeMonths: "3个月",
      sixMonths: "6个月",
      oneYear: "一年",
    },
    form: {
      confirmPasswordForm: {
        message: "请确认密码",
        notEqualError: "两次密码输入不一致，请重新输入",
        emailError: "邮箱格式不正确，请重新输入",
      },
    },
    refreshToken: {
      refreshButton: "刷新",
    },
  },
};

export const libWebEn = {
  comp: {
    clusterSelector: {
      placeholder: "Select a cluster",
    },
  },
  layouts: {
    smallScreenMenu: {
      welcome: "Welcome",
      logout: "Logout",
    },
    userIndicator: {
      userName: "User Name",
      userId: "User ID",
      personalInfo: "Personal Information",
      logout: "Logout",
      login: "Login",
    },
    darkMode: {
      system: "Follow the system",
      light: "Light",
      dark: "Dark",
    },
    defaultClusterSelector: {
      title: "Functions that require cluster selection will default to the default cluster",
      label: "Select Default Cluster",
    },
  },
  utils: {
    dateTime: {
      today: "Today",
      tWeek: "This Week",
      tMonth: "This Month",
      tYear: "This Year",
      threeMonths: "3 Months",
      sixMonths: "6 Months",
      oneYear: "1 Year",
    },
    form: {
      confirmPasswordForm: {
        message: "Please confirm your password",
        notEqualError: "Passwords do not match. Please re-enter.",
        emailError: "Invalid email format. Please re-enter.",
      },
    },
    refreshToken: {
      refreshButton: "Refresh",
    },
  },
};

export type LibWebTextsType = typeof libWebEn;

export const getCurrentLangLibWebText = (languageId: string, key: string): string | undefined => {

  let currentLangText: LibWebTextsType;
  switch (languageId) {
  case SYSTEM_VALID_LANGUAGES.ZH_CN:
  default:
    currentLangText = libWebZhCn;
  case SYSTEM_VALID_LANGUAGES.EN:
    currentLangText = libWebEn;
  }

  const keys = key.split(".");
  let value: any = currentLangText;

  for (const k of keys) {
    value = value[k];
    if (value === undefined) {
      return undefined;
    }
  }

  if (typeof value === "string") {
    return value;
  }

};
