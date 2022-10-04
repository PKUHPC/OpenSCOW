import { Result, Tabs } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { InitImportUsersForm } from "src/pageComponents/init/InitImportUsersForm";
import { InitDrawer } from "src/pageComponents/init/InitLayout";
import { queryIfInitialized } from "src/utils/init";
type Props = SSRProps<{}>;

export const ImportUsersPage: NextPage<Props> = (props) => {
  if ("error" in props) {
    return (
      <UnifiedErrorPage code={props.error}
        customComponents={{
          409: (
            <Result
              status="error"
              title="系统已初始化"
              subTitle="系统已经初始化完成，无法重新初始化！"
            />
          ),
        }}
      />
    );
  }
  return (
    <div>
      <InitDrawer/>
      <Tabs centered defaultActiveKey="1">
        <Tabs.TabPane tab="导入用户" key="1">
          <InitImportUsersForm />
        </Tabs.TabPane>
        <Tabs.TabPane tab="用户账户管理" key="2">
        </Tabs.TabPane>
        <Tabs.TabPane tab="创建初始管理员用户" key="3">
        </Tabs.TabPane>
        <Tabs.TabPane tab="编辑作业价格表" key="4">
        </Tabs.TabPane>
      </Tabs>
    </div>
  );

};

export const getServerSideProps: GetServerSideProps<Props> = async () => {

  const result = await queryIfInitialized();

  if (result) { return { props: { error: 409 } }; }

  return { props: {} };

};

export default ImportUsersPage;
