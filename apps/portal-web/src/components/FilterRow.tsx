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

import { RefreshLink } from "@scow/lib-web/build/utils/refreshToken";
import { PropsWithChildren } from "react";
import styled from "styled-components";

type Props = PropsWithChildren<{
  isLoading: boolean;
  reload: () => void;
}>;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FilterRow: React.FC<Props> = ({
  reload, children,
}) => {
  return (
    <Container>
      {children}
      <RefreshLink refresh={reload} />
    </Container>
  );
};
