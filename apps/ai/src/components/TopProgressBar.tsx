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

"use client";

import { useIsFetching } from "@tanstack/react-query";
import NProgress from "nprogress";
import { useEffect, useRef } from "react";

const delay = 250;

export function TopProgressBar() {

  const isFetching = useIsFetching();

  const on = useRef(false);

  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isFetching > 0) {
      if (on.current) { return; }

      on.current = true;
      timer.current = setTimeout(function() {
        NProgress.start();
      }, delay); // only show progress bar if it takes longer than the delay
    } else {
      on.current = false;
      clearTimeout(timer.current);
      NProgress.done();
    }
  }, [isFetching]);

  useEffect(() => {

    NProgress.configure({ showSpinner: false });

  }, []);

  return null;
}

