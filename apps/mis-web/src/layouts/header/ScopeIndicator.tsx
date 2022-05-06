// import { DownOutlined } from "@ant-design/icons";
// import { Button, Dropdown, Menu, Space } from "antd";
// import React from "react";
// import { AccountAffiliation, UserRole } from "src/models/User";
// import { User, UserStore } from "src/stores/UserStore";
// import styled from "styled-components";

// interface Props {
//   user: User;
//   updateAccount: ReturnType<typeof UserStore>["updateSelectedAccount"],
// }

// const Container = styled.div`
//   display: flex;
//   align-items: center;
// `;

// const AccountRoleText = {
//   [UserRole.USER]: "用户",
//   [UserRole.ADMIN]: "管理员",
//   [UserRole.OWNER]: "拥有者",
// };

// const AccountText: React.FC<{ account?: AccountAffiliation }> = ({ account }) => (
//   <>
//     {
//       account
//         ? `${account.accountName} (${AccountRoleText[account.role]})`
//         : "无账户"
//     }
//   </>
// );

// export const ScopeIndicator: React.FC<Props> = ({ user, updateAccount }) => {

//   const menuItems = [] as React.ReactNode[];

//   menuItems.push(
//     <Menu.Item key="projectPrompt" disabled={true}>
//       请选择需要管理的账户
//     </Menu.Item>,
//   );

//   const onChange = (account: AccountAffiliation) => () => {
//     updateAccount(null, account);
//   };

//   user.accountAffiliations.forEach((x) => {
//     menuItems.push(
//       <Menu.Item key={x.accountName} onClick={onChange(x)}>
//         <AccountText account={x}/>
//       </Menu.Item>,
//     );
//   });

//   return (
//     <Container>
//       <Dropdown
//         trigger={["click"]}
//         overlay={(
//           <Menu>
//             {menuItems}
//           </Menu>
//         )}
//       >
//         <Button>
//           <Space>
//             <AccountText account={user.selectedAccount}/>
//             <DownOutlined />
//           </Space>
//         </Button>
//       </Dropdown>
//     </Container>
//   );
// };
export {};
