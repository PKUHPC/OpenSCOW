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

import { OperationType } from "@scow/lib-operation-log/build/constant";

export enum OperationLogQueryType {
  USER = 0,
  ACCOUNT = 1,
  TENANT = 2,
  PLATFORM = 3,
};


export enum OperationResult {
  UNKNOWN = 0,
  SUCCESS = 1,
  FAIL = 2,
};

export const OperationResultTexts = {
  [OperationResult.UNKNOWN]: "未知",
  [OperationResult.SUCCESS]: "成功",
  [OperationResult.FAIL]: "失败",
};

export const OperationTypeTexts = {
  [OperationType.login]: "用户登录",
  [OperationType.logout]: "用户登出",
  [OperationType.submitJob]: "提交作业",
  [OperationType.endJob]: "结束作业",
  [OperationType.userSetJobTimeLimit]: "用户设置作业时限",
  [OperationType.addJobTemplate]: "保存作业模板",
  [OperationType.deleteJobTemplate]: "删除作业模板",
  [OperationType.updateJobTemplate]: "更新作业模板",
  [OperationType.shellLogin]: "SHELL登录",
  [OperationType.createDesktop]: "新建桌面",
  [OperationType.deleteDesktop]: "删除桌面",
  [OperationType.createApp]: "创建应用",
  [OperationType.endApp]: "结束应用",
  [OperationType.createFile]: "新建文件",
  [OperationType.createDirectory]: "新建文件夹",
  [OperationType.uploadFile]: "上传文件",
  [OperationType.deleteFile]: "删除文件",
  [OperationType.deleteDirectory]: "删除文件夹",
  [OperationType.renameFile]: "重命名文件",
  [OperationType.renameDirectory]: "重命名文件夹",
  [OperationType.moveFile]: "移动文件",
  [OperationType.moveDirectory]: "移动文件夹",
  [OperationType.copyFile]: "复制文件",
  [OperationType.copyDirectory]: "复制文件夹",
  [OperationType.accountSetJobTimeLimit]: "账户设置作业时限",
  [OperationType.createUser]: "创建用户",
  [OperationType.addUserToAccount]: "添加用户至账户",
  [OperationType.removeUserFromAccount]: "从账户移出用户",
  [OperationType.setAccountAdmin]: "设置账户管理员",
  [OperationType.unsetAccountAdmin]: "取消账户管理员",
  [OperationType.blockUser]: "封锁用户",
  [OperationType.unblockUser]: "解封用户",
  [OperationType.accountSetChargeLimit]: "账户设置限额",
  [OperationType.tenantSetJobTimeLimit]: "租户设置作业时限",
  [OperationType.setTenantBilling]: "修改作业租户计费",
  [OperationType.setTenantAdmin]: "设置租户管理员",
  [OperationType.unsetTenantAdmin]: "取消租户管理员",
  [OperationType.setTenantFinance]: "设置租户财务人员",
  [OperationType.unsetTenantFinance]: "取消租户财务人员",
  [OperationType.tenantChangePassword]: "租户重置用户密码",
  [OperationType.createAccount]: "创建账户",
  [OperationType.addAccountToWhitelist]: "添加白名单账户",
  [OperationType.removeAccountFromWhitelist]: "移出白名单",
  [OperationType.accountPay]: "账户充值",
  [OperationType.importUsers]: "导入用户",
  [OperationType.setPlatformAdmin]: "设置平台管理员",
  [OperationType.unsetPlatformAdmin]: "取消平台管理员",
  [OperationType.setPlatformFinance]: "设置平台财务人员",
  [OperationType.unsetPlatformFinance]: "取消平台财务人员",
  [OperationType.platformChangePassword]: "平台重置用户密码",
  [OperationType.setPlatformBilling]: "设置平台作业计费",
  [OperationType.createTenant]: "创建租户",
  [OperationType.platformSetTenantBilling]: "平台设置租户计费",
  [OperationType.tenantPay]: "租户充值",
};
