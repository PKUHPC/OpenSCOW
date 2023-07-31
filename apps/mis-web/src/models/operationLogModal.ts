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

export enum OperationLogQueryType {
  USER = 0,
  ACCOUNT = 1,
  TENANT = 2,
  PLATFORM = 3,
};

export enum OperationType {
  /** LOGIN - 用户登录 */
  LOGIN = 0,
  /** LOGOUT - 退出登录 */
  LOGOUT = 1,
  /** SUBMIT_JOB - 提交作业 */
  SUBMIT_JOB = 2,
  /** END_JOB - 结束作业 */
  END_JOB = 3,
  /** SET_JOB_TIME_LIMIT - 设置作业时限 */
  SET_JOB_TIME_LIMIT = 4,
  /** BATCH_SET_JOB_TIME_LIMIT - 批量设置作业时限 */
  BATCH_SET_JOB_TIME_LIMIT = 5,
  /** SAVE_JOB_TEMPLATE - 保存作业模板 */
  SAVE_JOB_TEMPLATE = 6,
  /** DELETE_JOB_TEMPLATE - 删除作业模板 */
  DELETE_JOB_TEMPLATE = 7,
  /** UPDATE_JOB_TEMPLATE - 设置作业模板 */
  UPDATE_JOB_TEMPLATE = 8,
  /** SHELL_LOGIN - SHELL登录 */
  SHELL_LOGIN = 9,
  /** CREATE_DESKTOP - 新建桌面 */
  CREATE_DESKTOP = 10,
  /** DELETE_DESKTOP - 删除桌面 */
  DELETE_DESKTOP = 11,
  /** CREATE_APPLICATION - 创建应用 */
  CREATE_APPLICATION = 12,
  /** END_APPLICATION - 结束应用 */
  END_APPLICATION = 13,
  /** CREATE_FILE - 新建文件 */
  CREATE_FILE = 14,
  /** CREATE_FOLDER - 新建文件夹 */
  CREATE_FOLDER = 15,
  /** UPLOAD_FILE - 上传文件 */
  UPLOAD_FILE = 16,
  /** DELETE_FILE - 删除文件 */
  DELETE_FILE = 17,
  /** DELETE_FOLDER - 删除文件夹 */
  DELETE_FOLDER = 18,
  /** RENAME_FILE - 重命名文件 */
  RENAME_FILE = 19,
  /** RENAME_FOLDER - 重命名文件夹 */
  RENAME_FOLDER = 20,
  /** MOVE_FILE - 移动文件 */
  MOVE_FILE = 21,
  /** MOVE_FOLDER - 移动文件夹 */
  MOVE_FOLDER = 22,
  /** COPY_FILE - 复制文件 */
  COPY_FILE = 23,
  /** COPY_FOLDER - 复制文件夹 */
  COPY_FOLDER = 24,
  /** CREATE_AND_ADD_USER - 创建并添加用户至账户 */
  CREATE_AND_ADD_USER = 25,
  /** CREATE_USER - 创建用户 */
  CREATE_USER = 26,
  /** ADD_USER - 添加用户 */
  ADD_USER = 27,
  /** REMOVE_USER - 移出用户 */
  REMOVE_USER = 28,
  /** SET_ACCOUNT_ADMIN - 设为账户管理员 */
  SET_ACCOUNT_ADMIN = 29,
  /** UNSET_ACCOUNT_ADMIN - 取消账户管理员 */
  UNSET_ACCOUNT_ADMIN = 30,
  /** BLOCK_USER - 封锁用户 */
  BLOCK_USER = 31,
  /** UNBLOCK_USER - 解封用户 */
  UNBLOCK_USER = 32,
  /** SET_CHARGE_LIMIT - 设置限额 */
  SET_CHARGE_LIMIT = 33,
  /** UPDATE_TENANT_BILLING - 修改作业租户计费 */
  UPDATE_TENANT_BILLING = 34,
  /** SET_TENANT_ADMIN - 设置租户管理员 */
  SET_TENANT_ADMIN = 35,
  /** UNSET_TENANT_ADMIN - 取消租户管理员 */
  UNSET_TENANT_ADMIN = 36,
  /** SET_TENANT_FINANCIAL - 设置租户财务人员 */
  SET_TENANT_FINANCIAL = 37,
  /** UNSET_TENANT_FINANCIAL - 取消租户财务人员 */
  UNSET_TENANT_FINANCIAL = 38,
  /** RESET_USER_PASSWORD - 重置用户密码 */
  RESET_USER_PASSWORD = 39,
  /** CREATE_ACCOUNT - 创建账户 */
  CREATE_ACCOUNT = 40,
  /** ADD_ACCOUNT_TO_WHITELIST - 添加白名单账户 */
  ADD_ACCOUNT_TO_WHITELIST = 41,
  /** REMOVE_ACCOUNT_FROM_WHITELIST - 移出白名单 */
  REMOVE_ACCOUNT_FROM_WHITELIST = 42,
  /** ACCOUNT_PAY - 账户充值 */
  ACCOUNT_PAY = 43,
  /** IMPORT_USER - 导入用户 */
  IMPORT_USER = 44,
  /** SET_PLATFORM_ADMIN - 设置平台管理员 */
  SET_PLATFORM_ADMIN = 45,
  /** UNSET_PLATFORM_ADMIN - 取消平台管理员 */
  UNSET_PLATFORM_ADMIN = 46,
  /** SET_PLATFORM_FINANCIAL - 设置平台财务人员 */
  SET_PLATFORM_FINANCIAL = 47,
  /** UNSET_PLATFORM_FINANCIAL - 取消平台财务人员 */
  UNSET_PLATFORM_FINANCIAL = 48,
  /** UPDATE_PLATFORM_BILLING - 设置平台作业计费 */
  UPDATE_PLATFORM_BILLING = 49,
  /** CREATE_TENANT - 创建租户 */
  CREATE_TENANT = 50,
  /** TENANT_PAY - 租户充值 */
  TENANT_PAY = 51,
};

export const OperationTypeTexts = {
  // 门户系统的操作
  // [OperationType.LOGIN]: "用户登录",
  // [OperationType.LOGOUT]: "退出登录",
  // [OperationType.SUBMIT_JOB]: "提交作业",
  // [OperationType.END_JOB]: "结束作业",
  // [OperationType.SET_JOB_TIME_LIMIT]: "设置作业时限",
  // [OperationType.BATCH_SET_JOB_TIME_LIMIT]: "批量设置作业时限",
  // [OperationType.SAVE_JOB_TEMPLATE]: "保存作业模板",
  // [OperationType.DELETE_JOB_TEMPLATE]: "删除作业模板",
  // [OperationType.UPDATE_JOB_TEMPLATE]: "设置作业模板",
  // [OperationType.SHELL_LOGIN]: "SHELL登录",
  // [OperationType.CREATE_DESKTOP]: "新建桌面",
  // [OperationType.DELETE_DESKTOP]: "删除桌面",
  // [OperationType.CREATE_APPLICATION]: "创建应用",
  // [OperationType.END_APPLICATION]: "结束应用",
  // [OperationType.CREATE_FILE]: "新建文件",
  // [OperationType.CREATE_FOLDER]: "新建文件夹",
  // [OperationType.UPLOAD_FILE]: "上传文件",
  // [OperationType.DELETE_FILE]: "删除文件",
  // [OperationType.DELETE_FOLDER]: "删除文件夹",
  // [OperationType.RENAME_FILE]: "重命名文件",
  // [OperationType.RENAME_FOLDER]: "重命名文件夹",
  // [OperationType.MOVE_FILE]: "移动文件",
  // [OperationType.MOVE_FOLDER]: "移动文件夹",
  // [OperationType.COPY_FILE]: "复制文件",
  // [OperationType.COPY_FOLDER]: "复制文件夹",
  [OperationType.CREATE_AND_ADD_USER]: "创建并添加用户至账户",
  [OperationType.CREATE_USER]: "创建用户",
  [OperationType.ADD_USER]: "添加用户",
  [OperationType.REMOVE_USER]: "移出用户",
  [OperationType.SET_ACCOUNT_ADMIN]: "设为账户管理员",
  [OperationType.UNSET_ACCOUNT_ADMIN]: "取消账户管理员",
  [OperationType.BLOCK_USER]: "封锁用户",
  [OperationType.UNBLOCK_USER]: "解封用户",
  [OperationType.SET_CHARGE_LIMIT]: "设置限额",
  [OperationType.UPDATE_TENANT_BILLING]: "修改作业租户计费",
  [OperationType.SET_TENANT_ADMIN]: "设置租户管理员",
  [OperationType.UNSET_TENANT_ADMIN]: "取消租户管理员",
  [OperationType.SET_TENANT_FINANCIAL]: "设置租户财务人员",
  [OperationType.UNSET_TENANT_FINANCIAL]: "取消租户财务人员",
  [OperationType.RESET_USER_PASSWORD]: "重置用户密码",
  [OperationType.CREATE_ACCOUNT]: "创建账户",
  [OperationType.ADD_ACCOUNT_TO_WHITELIST]: "添加白名单账户",
  [OperationType.REMOVE_ACCOUNT_FROM_WHITELIST]: "移出白名单",
  [OperationType.ACCOUNT_PAY]: "账户充值",
  [OperationType.IMPORT_USER]: "导入用户",
  [OperationType.SET_PLATFORM_ADMIN]: "设置平台管理员",
  [OperationType.UNSET_PLATFORM_ADMIN]: "取消平台管理员",
  [OperationType.SET_PLATFORM_FINANCIAL]: "设置平台财务人员",
  [OperationType.UNSET_PLATFORM_FINANCIAL]: "取消平台财务人员",
  [OperationType.UPDATE_PLATFORM_BILLING]: "设置平台作业计费",
  [OperationType.CREATE_TENANT]: "创建租户",
  [OperationType.TENANT_PAY]: "租户充值",
};


export enum OperationCode {
  CODE_UNKNOWN = 0,
  /** USER_LOGIN - 用户登录 */
  USER_LOGIN = 100001,
  /** USER_LOGOUT - 用户登出 */
  USER_LOGOUT = 100002,
  /** USER_SUBMIT_JOB - 普通用户操作 - 提交作业 */
  USER_SUBMIT_JOB = 200101,
  /** USER_END_JOB - 普通用户操作 - 结束作业 */
  USER_END_JOB = 200102,
  /** USER_SET_JOB_TIME_LIMIT - 普通用户操作 - 设置作业时限 */
  USER_SET_JOB_TIME_LIMIT = 200103,
  /** USER_ADD_JOB_TEMPLATE - 普通用户操作 - 保存作业模板 */
  USER_ADD_JOB_TEMPLATE = 200104,
  /** USER_DELETE_JOB_TEMPLATE - 普通用户操作 - 删除作业模板 */
  USER_DELETE_JOB_TEMPLATE = 200105,
  /** USER_SET_JOB_TEMPLATE - 普通用户操作 - 修改作业模板 */
  USER_SET_JOB_TEMPLATE = 200106,
  /** USER_SHELL_LOGIN - 普通用户操作 - SHELL登录 */
  USER_SHELL_LOGIN = 200201,
  /** USER_CREATE_DESKTOP - 普通用户操作 - 新建桌面 */
  USER_CREATE_DESKTOP = 200301,
  /** USER_DELETE_DESKTOP - 普通用户操作 - 删除桌面 */
  USER_DELETE_DESKTOP = 200302,
  /** USER_CREATE_APPLICATION - 普通用户操作 - 创建应用 */
  USER_CREATE_APPLICATION = 200401,
  /** USER_END_APPLICATION - 普通用户操作 - 结束应用 */
  USER_END_APPLICATION = 200402,
  /** USER_CREATE_FILE - 普通用户操作 - 新建文件 */
  USER_CREATE_FILE = 200501,
  /** USER_CREATE_FOLDER - 普通用户操作 - 新建文件夹 */
  USER_CREATE_FOLDER = 200502,
  /** USER_UPLOAD_FILE - 普通用户操作 - 上传文件 */
  USER_UPLOAD_FILE = 200503,
  /** USER_DELETE_FILE - 普通用户操作 - 删除文件 */
  USER_DELETE_FILE = 200504,
  /** USER_DELETE_FOLDER - 普通用户操作 - 删除文件夹 */
  USER_DELETE_FOLDER = 200505,
  /** USER_RENAME_FILE - 普通用户操作 - 重命名文件 */
  USER_RENAME_FILE = 200506,
  /** USER_RENAME_FOLDER - 普通用户操作 - 重命名文件夹 */
  USER_RENAME_FOLDER = 200507,
  /** USER_MOVE_FILE - 普通用户操作 - 移动文件 */
  USER_MOVE_FILE = 200508,
  /** USER_MOVE_FOLDER - 普通用户操作 - 移动文件夹 */
  USER_MOVE_FOLDER = 200509,
  /** USER_COPY_FILE - 普通用户操作 - 复制文件 */
  USER_COPY_FILE = 200510,
  /** USER_COPY_FOLDER - 普通用户操作 - 复制文件夹 */
  USER_COPY_FOLDER = 200511,
  /** ACCOUNT_SET_JOB_TIME_LIMIT - 账户管理员操作 - 设置作业时限 */
  ACCOUNT_SET_JOB_TIME_LIMIT = 300101,
  /** ACCOUNT_BATCH_SET_JOB_TIME_LIMIT - 账户管理员操作 - 批量设置作业时限 */
  ACCOUNT_BATCH_SET_JOB_TIME_LIMIT = 300102,
  /** ACCOUNT_CREATE_AND_ADD_USER - 账户管理员操作 - 创建并添加用户 */
  ACCOUNT_CREATE_AND_ADD_USER = 300201,
  /** ACCOUNT_ADD_USER - 账户管理员操作 - 添加用户 */
  ACCOUNT_ADD_USER = 300202,
  /** ACCOUNT_REMOVE_USER - 账户管理员操作 - 移出用户 */
  ACCOUNT_REMOVE_USER = 300203,
  /** ACCOUNT_SET_ACCOUNT_ADMIN - 账户管理员操作 - 设为管理员 */
  ACCOUNT_SET_ACCOUNT_ADMIN = 300204,
  /** ACCOUNT_UNSET_ACCOUNT_ADMIN - 账户管理员操作 - 取消管理员 */
  ACCOUNT_UNSET_ACCOUNT_ADMIN = 300205,
  /** ACCOUNT_BLOCK_USER - 账户管理员操作 - 封锁用户 */
  ACCOUNT_BLOCK_USER = 300206,
  /** ACCOUNT_UNBLOCK_USER - 账户管理员操作 - 解封用户 */
  ACCOUNT_UNBLOCK_USER = 300207,
  /** ACCOUNT_SET_CHARGE_LIMIT - 账户管理员操作 - 设置限额 */
  ACCOUNT_SET_CHARGE_LIMIT = 300208,
  /** TENANT_SET_JOB_TIME_LIMIT - 租户管理员操作 - 设置作业时限 */
  TENANT_SET_JOB_TIME_LIMIT = 400101,
  /** TENANT_BATCH_SET_JOB_TIME_LIMIT - 租户管理员操作 - 批量设置作业时限 */
  TENANT_BATCH_SET_JOB_TIME_LIMIT = 400102,
  /** TENANT_SET_TENANT_BILLING - 租户管理员操作 - 设置作业租户计费 */
  TENANT_SET_TENANT_BILLING = 400103,
  /** TENANT_CREATE_USER - 租户管理员操作 - 创建用户 */
  TENANT_CREATE_USER = 400201,
  /** TENANT_SET_TENANT_ADMIN - 租户管理员操作 - 设置租户管理员 */
  TENANT_SET_TENANT_ADMIN = 400202,
  /** TENANT_UNSET_TENANT_ADMIN - 租户管理员操作 - 取消租户管理员 */
  TENANT_UNSET_TENANT_ADMIN = 400203,
  /** TENANT_SET_TENANT_FINANCIAL - 租户管理员操作 - 设置租户财务人员 */
  TENANT_SET_TENANT_FINANCIAL = 400204,
  /** TENANT_UNSET_TENANT_FINANCIAL - 租户管理员操作 - 取消租户财务人员 */
  TENANT_UNSET_TENANT_FINANCIAL = 400205,
  /** TENANT_RESET_USER_PASSWORD - 租户管理员操作 - 重置用户密码 */
  TENANT_RESET_USER_PASSWORD = 400206,
  /** TENANT_CREATE_ACCOUNT - 租户管理员操作 - 创建账户 */
  TENANT_CREATE_ACCOUNT = 400301,
  /** TENANT_ADD_ACCOUNT_TO_WHITELIST - 租户管理员操作 - 添加白名单账户 */
  TENANT_ADD_ACCOUNT_TO_WHITELIST = 400302,
  /** TENANT_REMOVE_ACCOUNT_FROM_WHITELIST - 租户管理员操作 - 移出白名单 */
  TENANT_REMOVE_ACCOUNT_FROM_WHITELIST = 400303,
  /** TENANT_ACCOUNT_PAY - 租户管理员操作 - 账户充值 */
  TENANT_ACCOUNT_PAY = 400304,
  /** PLATFORM_IMPORT_USER - 平台管理员操作- 导入用户 */
  PLATFORM_IMPORT_USER = 500101,
  /** PLATFORM_SET_PLATFORM_ADMIN - 平台管理员操作 - 设置平台管理员 */
  PLATFORM_SET_PLATFORM_ADMIN = 500201,
  /** PLATFORM_UNSET_PLATFORM_ADMIN - 平台管理员操作 - 取消平台管理员 */
  PLATFORM_UNSET_PLATFORM_ADMIN = 500202,
  /** PLATFORM_SET_PLATFORM_FINANCIAL - 平台管理员操作 - 设置平台财务人员 */
  PLATFORM_SET_PLATFORM_FINANCIAL = 500203,
  /** PLATFORM_UNSET_PLATFORM_FINANCIAL - 平台管理员操作 - 取消平台财务人员 */
  PLATFORM_UNSET_PLATFORM_FINANCIAL = 500204,
  /** PLATFORM_RESET_PASSWORD - 平台管理员操作 - 重置密码 */
  PLATFORM_RESET_PASSWORD = 500205,
  /** PLATFORM_SET_PLATFORM_BILLING - 平台管理员操作 - 设置平台作业计费 */
  PLATFORM_SET_PLATFORM_BILLING = 500206,
  /** PLATFORM_CREATE_TENANT - 平台管理员操作 - 创建租户 */
  PLATFORM_CREATE_TENANT = 500301,
  /** PLATFORM_SET_TENANT_BILLING - 平台管理员操作 - 设置租户作业计费 */
  PLATFORM_SET_TENANT_BILLING = 500302,
  /** PLATFORM_TENANT_PAY - 平台管理员操作 - 租户充值 */
  PLATFORM_TENANT_PAY = 500303,
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
