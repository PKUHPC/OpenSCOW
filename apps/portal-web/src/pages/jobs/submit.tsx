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

import { queryToString, useQuerystring } from "@scow/lib-web/build/utils/querystring";
import { getCurrentLanguageId } from "@scow/lib-web/build/utils/systemLanguage";
import { Spin } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { useI18nTranslateToString } from "src/i18n";
import { TimeUnit } from "src/models/job";
import { SubmitJobForm } from "src/pageComponents/job/SubmitJobForm";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { getServerI18nConfigText, publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

interface Props {
  submitJobPromptText: string;
}

export const SubmitJobPage: NextPage<Props> = requireAuth(() => true)(
  (props: Props) => {

    const query = useQuerystring();

    const cluster = queryToString(query.cluster);
    const { currentClusters } = useStore(ClusterInfoStore);
    const clusterObj = currentClusters.find((x) => x.id === cluster);

    const jobTemplateId = queryToString(query.jobTemplateId);

    const { data, isLoading } = useAsync({
      promiseFn: useCallback(async () => {
        if (cluster && jobTemplateId) {
          if (!clusterObj) { return undefined; }
          return api.getJobTemplate({ query: { cluster, id: jobTemplateId } })
            .then(({ template }) => ({
              cluster: clusterObj,
              command: template.command,
              jobName: template.jobName,
              partition: template.partition,
              nodeCount: template.nodeCount,
              coreCount: template.coreCount,
              gpuCount: template.gpuCount,
              qos: template.qos,
              maxTime: template.maxTime,
              account: template.account,
              comment: template.comment || "",
              workingDirectory: template.workingDirectory,
              output: template.output,
              errorOutput: template.errorOutput,
              save: false,
              scriptOutput: template.scriptOutput,
              maxTimeUnit: template.maxTimeUnit || TimeUnit.MINUTES,
            }));
        } else {
          return undefined;
        }
      }, [cluster, jobTemplateId]),
    });

    const t = useI18nTranslateToString();

    return (
      <div>
        <Head title={t("pages.jobs.submit.title")} />
        <PageTitle titleText={t("pages.jobs.submit.pageTitle")} />
        {
          isLoading ? (
            <Spin tip={t("pages.jobs.submit.spin")} />
          ) : (
            <SubmitJobForm initial={data} submitJobPromptText={props.submitJobPromptText} />
          )
        }
      </div>
    );

  });

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

  const languageId = getCurrentLanguageId(req, publicConfig.SYSTEM_LANGUAGE_CONFIG);
  const submitJobPromptText = getServerI18nConfigText(languageId, "submitJopPromptText");

  return {
    props: {
      submitJobPromptText,
    },
  };
};

export default SubmitJobPage;
