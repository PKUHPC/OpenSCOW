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

import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { FileManager } from "src/pageComponents/filemanager/FileManager";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

export const FileManagerPage: NextPage = requireAuth(() => true)(() => {

  const router = useRouter();
  const pathParts = router.query.path as (string[] | undefined);

  const cluster = router.query.cluster as string;
  const fullPath = (pathParts && pathParts.length === 1 && pathParts[0] === "~")
    ? "~"
    : "/" + (pathParts?.join("/") ?? "");

  const homePathMemo = useRef({} as Record<string, string>);

  const toHomeDir = async () => {
    if (!homePathMemo.current[cluster]) {
      homePathMemo.current[cluster] = await api.getHomeDirectory({ query: { cluster } }).then((x) => x.path);
    }

    router.push(`/files/${cluster}/${homePathMemo.current[cluster]}`);
  };

  // if cluster changes and accesses homedir, find the homedir and go to it
  useEffect(() => {
    if (pathParts && pathParts.length === 1 && pathParts[0] === "~") {
      toHomeDir();
    }
  }, [cluster, fullPath]);

  return (
    <>
      <Head title={`${publicConfig.CLUSTERS_CONFIG[cluster]?.displayName ?? cluster}文件管理`} />
      <FileManager
        cluster={cluster}
        path={fullPath}
        urlPrefix="/files"
      />
    </>
  );
});

export default FileManagerPage;
