import { FloatButton } from "antd";
import Image from "next/image";
import React, { PropsWithChildren, useEffect, useState } from "react";
import moon from "src/components/icons/moon.svg";
import sun from "src/components/icons/sun.svg";
import sunMoon from "src/components/icons/sun-moon.svg";

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

export const DarkModeProvider = ({ children }: PropsWithChildren<{}>) => {

  const [mode, setMode] = useState<DarkMode>("system");

  const [dark, setDark] = useState(false);

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
