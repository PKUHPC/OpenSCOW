import { Tabs } from "antd";
import styled from "styled-components";

export const FilterFormContainer = styled.div`
  padding: 8px 16px 16px 16px;
  margin: 8px 0;
  background: #fbfbfb;
  border: 1px solid #d9d9d9;
  border-radius: 2px;

  .ant-form-item {
    margin: 4px;
  }
`;

const TabFormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

interface TabbedFilterFormProps {
  button: JSX.Element;
  tabs: { title: string; key?: string; node: JSX.Element; }[];
  onChange?: (activeKey: string) => void;
}

export const FilterFormTabs: React.FC<TabbedFilterFormProps> = ({
  button, tabs, onChange,
}) => {
  return (
    <Tabs
      defaultActiveKey={tabs.length > 0 ? tabs[0].title : ""}
      size="small"
      tabBarExtraContent={button}
      onChange={onChange}
    >
      {
        tabs.map(({ title, key, node }) => (
          <Tabs.TabPane tab={title} key={key ?? title}>
            <TabFormContainer>
              {node}
            </TabFormContainer>
          </Tabs.TabPane>
        ))
      }
    </Tabs>
  );
};
