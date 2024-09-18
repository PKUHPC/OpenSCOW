/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

"use client";

import { FloatButton } from "antd";
import Image from "next/image";
import { setCookie } from "nookies";
import React, { PropsWithChildren, useEffect, useState } from "react";
import moon from "src/components/icons/moon.svg";
import sun from "src/components/icons/sun.svg";
import sunMoon from "src/components/icons/sun-moon.svg";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const modes = ["system", "dark", "light"] as const;

const icons = {
  system: [sunMoon, "system", "跟随系统"],
  light: [sun, "light", "亮色"],
  dark: [moon, "dark", "暗色"],
};

export type DarkMode = typeof modes[number];

const DarkModeContext = React.createContext<{
  mode: DarkMode;
  dark: boolean;
  setMode: (mode: DarkMode) => void;
}>(undefined!);

export const useDarkMode = () => React.useContext(DarkModeContext);

export const DarkModeButton = () => {
  const { mode, setMode } = useDarkMode();

  const [icon, alt, label] = icons[mode];

  return (
    <FloatButton
      onClick={() => setMode(mode === "system" ? "dark" : mode === "dark" ? "light" : "system")}
      icon={<Image src={icon} alt={alt} width={20} height={20} />}
      tooltip={label}
      // icon={icon}
    />
  );
};

export interface DarkModeCookie {
  dark: boolean;
  mode: DarkMode;
}

interface Props {
  initial?: DarkModeCookie;
}

export const DARK_MODE_COOKIE_NAME = "xscow-dark";

export const DarkModeProvider = ({ children, initial }: PropsWithChildren<Props>) => {

  const [mode, setMode] = useState<DarkMode>(initial?.mode ?? "system");

  const [dark, setDark] = useState(initial?.dark ?? false);

  useEffect(() => {
    setCookie(null, DARK_MODE_COOKIE_NAME, JSON.stringify({ mode, dark } as DarkModeCookie), {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  }, [dark, mode]);

  useEffect(() => {
    if (mode === "system") {

      const onChange = function(this: MediaQueryList, ev: MediaQueryListEvent) {
        setDark(ev.matches);
      };

      const media = window.matchMedia("(prefers-color-scheme: dark)");

      setDark(media.matches);

      media.addEventListener("change", onChange);

      return () => media.removeEventListener("change", onChange);
    } else {
      setDark(mode === "dark");
    }
  }, [mode]);

  return (
    <DarkModeContext.Provider value={{ mode, dark, setMode }}>
      {children}
    </DarkModeContext.Provider>

  );
};
