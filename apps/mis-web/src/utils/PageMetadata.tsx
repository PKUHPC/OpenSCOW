import Head from "next/head";
import React from "react";

interface Props {
  title?: string;
}

export const PageMetadata: React.FC<Props> = ({ title }) => {
  const titleStr = `${title ? `${title} | ` : ""}第三届全国高校数据驱动创新研究大赛`;

  return (
    <Head>
      <title>{titleStr}</title>
    </Head>
  );
};
