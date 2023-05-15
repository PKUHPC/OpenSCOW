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

import { useEffect, useState } from "react";

interface Props {
  seconds: number;
}

export const CountdownText: React.FC<Props> = ({ seconds }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining > 0) {
      const timeoutId = setTimeout(() => {
        setRemaining(remaining - 1);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [remaining]);

  return <>{remaining}</>;
};
