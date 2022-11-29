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

import React from "react";
import { Section } from "src/components/Section";
import { StorageCard } from "src/pageComponents/dashboard/StorageCard";
import styled from "styled-components";

interface Props {
  storageQuotas: Record<string, number>;
}

const CardContainer = styled.div`
  flex: 1;
  min-width: 300px;
  margin: 4px;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;


export const StorageSection: React.FC<Props> = ({ storageQuotas }) => {

  return (
    <Section title="存储状态">
      <Container>
        {
          Object.entries(storageQuotas).map(([cluster, quota]) => (
            <CardContainer key={cluster}>
              <StorageCard cluster={cluster} quota={quota} />
            </CardContainer>
          ))
        }
      </Container>
    </Section>

  );

};
