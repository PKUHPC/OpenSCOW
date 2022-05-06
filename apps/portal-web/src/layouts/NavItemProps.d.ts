import React from "react";

export interface NavItemProps {
  path: string;
  clickToPath?: string;
  text: string;
  Icon: React.ReactNode | React.ForwardRefExoticComponent<{}>;
  match?: (spec: string, pathname: string) => boolean;
  children?: NavItemProps[];
  clickable?: boolean
  extraLinkProps?: object;
}
