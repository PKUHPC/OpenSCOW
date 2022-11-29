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
import { useStore } from "simstate";
import { Redirect } from "src/components/Redirect";
import { UserStore } from "src/stores/UserStore";

export const IndexPage: NextPage = () => {
  const userStore = useStore(UserStore);

  if (userStore.user) {
    return <Redirect url="/dashboard" />;
  } else {
    return <Redirect url="/api/auth" />;
  }

};


export default IndexPage;
