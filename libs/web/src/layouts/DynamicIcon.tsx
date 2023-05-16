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

// import * as icons from "@ant-design/icons";
// import React from "react";

// export const DynamicIcon = ({ icon }) => {

//   const antIcon: { [key: string]: any } = icons;
//   return React.createElement(antIcon[icon]);
// };
import React from "react";

export const DynamicIcon = ({ icon }) => {
  const IconComponent = React.lazy(() => import(`@ant-design/icons/${icon}`));

  return (
    <React.Suspense fallback={<span>Loading...</span>}>
      <IconComponent />
    </React.Suspense>
  );
};

