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

import { ClusterTextsConfigSchema } from "@scow/config/build/clusterTexts";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Collapse, Divider, Space, Spin, Typography } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { checkCookie } from "src/auth/server";
import { JobBillingTable } from "src/components/JobBillingTable";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { UserStore } from "src/stores/UserStore";
import { getSortedClusterValues } from "src/utils/cluster";
import { runtimeConfig } from "src/utils/config";
import { Head } from "src/utils/head";
import { styled } from "styled-components";

import { JobBillingTableItem } from "../api/job/getAvailableBillingTable";

const ClusterCommentTitle = styled(Typography.Title)`
  padding-top: 8px;
  font-weight: 600;
  font-size: 16px;
`;

const ContentContainer = styled(Typography.Paragraph)`
  white-space: pre-line;
`;

type ValueOf<T> = T[keyof T];

interface Props {
  text: ValueOf<ClusterTextsConfigSchema> | undefined;
}

const p = prefix("page.user.partitions.");

const { Panel } = Collapse;

export const PartitionsPage: NextPage<Props> = requireAuth(() => true)((props: Props) => {

  const userStore = useStore(UserStore);
  const user = userStore.user;

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;
  const { text } = props;

  const [completedRequestCount, setCompletedRequestCount] = useState<number>(0);
  const [renderData, setRenderData] = useState<{ [cluster: string]: JobBillingTableItem[] }>({});

  const { publicConfigClusters, clusterSortedIdList, activatedClusters } = useStore(ClusterInfoStore);

  const clusters = getSortedClusterValues(publicConfigClusters, clusterSortedIdList)
    .filter((x) => Object.keys(activatedClusters).includes(x.id));
  const sortedIds = clusterSortedIdList.filter((id) => activatedClusters[id]);
  sortedIds.forEach((clusterId) => {
    useAsync({ promiseFn: useCallback(async () => {
      const cluster = activatedClusters[clusterId];
      return api.getAvailableBillingTable({
        query: { cluster: cluster.id, tenant: user?.tenant, userId: user?.identityId } })
        .then((data) => {
          setRenderData((prevData) => ({
            ...prevData,
            [cluster.id]: data.items,
          }));
          setCompletedRequestCount((prevCount) => prevCount + 1);
        });
    }, [userStore.user]) });
  });

  return (
    <div>
      <Head title={t(p("partitionInfo"))} />
      <PageTitle titleText={t(p("partitionInfo"))} />
      <div>
        {
          completedRequestCount < clusters.length ? (
            <Spin
              spinning={completedRequestCount < clusters.length}
              tip={t(p("loading"))}
            >
              <></>
            </Spin>
          ) : (
            clusters.length === 0 ? (
              <>
                {t("common.noAvailableClusters")}
              </>
            ) : null
          )
        }
      </div>
      <div style={completedRequestCount < clusters.length
        ? { marginBottom: "32px", marginTop: "48px" } : { marginBottom: "32px" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {clusters.map((cluster) => {
            const data = renderData[cluster.id];
            return (
              data && data.length > 0 ? (
                <Collapse defaultActiveKey={[cluster.id]}>
                  <Panel
                    header={getI18nConfigCurrentText(cluster.name, languageId)}
                    collapsible="header"
                    key={cluster.id}
                  >
                    <div key={cluster.id}>
                      <JobBillingTable data={data} isUserPartitionsPage={true} />
                    </div>
                  </Panel>
                </Collapse>
              ) : null
            );
          })}
        </Space>
      </div>

      <div>
        {
          text?.clusterComment ? (
            <div>
              <ClusterCommentTitle level={2}>{t("common.illustrate")}</ClusterCommentTitle>
              <ContentContainer>
                {getI18nConfigCurrentText(text?.clusterComment, languageId)}
              </ContentContainer>
            </div>
          ) : undefined
        }
        {
          text?.extras?.map(({ title, content }, i) => (
            <div key={i}>
              <Divider />
              <PageTitle titleText={getI18nConfigCurrentText(title, languageId)} />
              <ContentContainer>{getI18nConfigCurrentText(content, languageId)}</ContentContainer>
            </div>
          ))
        }
      </div>

    </div>
  );
});


export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {

  const user = await checkCookie(() => true, ctx.req);

  const clusterTexts = runtimeConfig.CLUSTER_TEXTS_CONFIG;

  // find the applicable text
  const applicableTexts = clusterTexts ? (
    typeof user === "number"
      ? clusterTexts
      : (clusterTexts[user.tenant] ?? clusterTexts.default)
  ) : undefined;

  return { props: { text: applicableTexts } };
};


export default PartitionsPage;
