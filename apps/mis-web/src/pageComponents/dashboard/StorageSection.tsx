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
