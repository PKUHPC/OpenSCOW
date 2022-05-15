import { Divider } from "antd";
import Image from "next/image";
import React from "react";
import { publicConfig } from "src/utils/config";


interface Props {
  hostname: string | undefined;
}
export const CustomizableLogoAndText: React.FC<Props> = ({ hostname }) => {

  return (
    <div>
      <div style={{ position: "relative", width: "100%", paddingBottom: "8%" }} >
        <Image
          alt="logo"
          src="/api/logo"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "3%",
        marginLeft: "20%",
        marginRight: "20%",
        flexDirection: "column",
      }}>
        <h1 style={{ alignSelf: "center" }}>
          {(hostname && publicConfig.HOME_TITLES[hostname]) ?? publicConfig.DEFAULT_HOME_TITLE}
        </h1>
        <Divider />
        <p style={{ textIndent: "2rem" }}>
          {(hostname && publicConfig.HOME_TEXTS[hostname]) ?? publicConfig.DEFAULT_HOME_TEXT}
        </p>
      </div>
    </div>

  );
};
