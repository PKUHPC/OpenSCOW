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

import { SharedStatus } from "src/models/common";

export const getSharedStatusText = (status: SharedStatus):
"share" | "cancelShare" | "cancelSharing" | "sharing" => {
  switch (status) {

    case SharedStatus.SHARED:
      return "cancelShare";

    case SharedStatus.UNSHARING:
      return "cancelSharing";

    case SharedStatus.SHARING:
      return "sharing";

    default:
      return "share";
  }
};

export const getSharedStatusUpperText = (status: SharedStatus):
"upperShare" | "upperCancelShare" | "upperCancelSharing" | "upperSharing" => {
  switch (status) {

    case SharedStatus.SHARED:
      return "upperCancelShare";

    case SharedStatus.UNSHARING:
      return "upperCancelSharing";

    case SharedStatus.SHARING:
      return "upperSharing";

    default:
      return "upperShare";
  }
};
