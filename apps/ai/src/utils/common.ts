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

import { ShareStatus } from "src/models/common";

export const getShareStatusText = (status: ShareStatus) => {
  switch (status) {

  case ShareStatus.SHARED:
    return "取消分享";

  case ShareStatus.UNSHARING:
    return "取消分享中";

  case ShareStatus.SHARING:
    return "分享中";

  default:
    return "分享";
  }
};
