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

export enum ErrorCode {
  ALGORITHM_NAME_ALREADY_EXIST = "algorithm_name_already_exist",
  OLD_PASSWORD_IS_WRONG = "old_password_is_wrong",
  FILE_NOT_EXSIT = "file_not_exist",
  FILE_EXSIT = "file_exist",
  FILE_CANNOT_BE_ACCESSED = "file_cannot_be_accessed",
  FILE_NOT_READABLE = "file_not_readable",
  FILE_NOT_WRITABLE = "file_not_writable",
}
