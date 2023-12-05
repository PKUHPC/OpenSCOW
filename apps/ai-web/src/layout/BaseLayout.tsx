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

import type { FC, ReactNode } from "react";

interface Props {
  children: ReactNode
}

export const BaseLayout: FC<Props> = ({ children }) => (
  <main className="w-screen h-screen">
    <div className="min-h-screen w-full lg:max-w-laptop lg:mx-auto lg:py-5 p-5 flex flex-col">
      {children}
    </div>
  </main>
);
