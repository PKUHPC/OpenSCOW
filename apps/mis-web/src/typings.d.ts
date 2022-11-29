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

declare module "*.less" {
  const module: any;
  export = module;
}

// declare module "*.svg" {
//   import { FC, SVGProps } from "react";
//   export const ReactComponent: FC<SVGProps<SVGSVGElement>>;

//   const src: string;
//   export default src;
// }

declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_BASE_PATH: string;
    NEXT_PUBLIC_USE_MOCK: string;
  }
}
