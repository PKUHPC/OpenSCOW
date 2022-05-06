/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import React from "react";

import styles from "./HomepageFeatures.module.css";

type FeatureItem = {
  title: string;
  image: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "方便使用",
    image: "/img/undraw_docusaurus_react.svg",
    description: (
      <>
        SCOW让超算用户和运维人员都可以在浏览器中完成日常科研和运维任务。
      </>
    ),
  },
  {
    title: "方便部署",
    image: "/img/undraw_docusaurus_tree.svg",
    description: (
      <>
        SCOW使用模块化结构，可以根据自己的需求部署全部或者部分功能。
      </>
    ),
  },
  {
    title: "方便扩展",
    image: "/img/undraw_docusaurus_mountain.svg",
    description: (
      <>
        SCOW采用现代技术栈，方便用户定制。
      </>
    ),
  },
];

function Feature({ title, image, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <img className={styles.featureSvg} alt={title} src={useBaseUrl(image)} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
