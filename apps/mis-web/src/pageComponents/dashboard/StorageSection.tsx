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

import React from "react";
import { Section } from "src/components/Section";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { StorageCard } from "src/pageComponents/dashboard/StorageCard";
import { styled } from "styled-components";

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

const p = prefix("pageComp.dashboard.storageSection.");

export const StorageSection: React.FC<Props> = ({ storageQuotas }) => {

  const t = useI18nTranslateToString();

  return (
    <Section title={t(p("storageStatus"))}>
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
