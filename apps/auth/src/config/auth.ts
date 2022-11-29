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

import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/build/constants";
import { getConfigFromFile } from "@scow/lib-config";
import { Static, Type } from "@sinclair/typebox";

import { AuthType } from "./AuthType";

export enum NewUserGroupStrategy {
  "newGroupPerUser" = "newGroupPerUser",
  "oneGroupForAllUsers" = "oneGroupForAllUsers"
}

export const LdapConfigSchema = Type.Object({
  url: Type.String({ description: "LDAP地址" }),
  searchBase: Type.String({ description: "LDAP用户搜索base。", default: "" }),
  bindDN: Type.String({ description: "操作LDAP时以什么用户操作，默认为空字符串", default: "" }),
  bindPassword: Type.String({ description: "操作LDAP的用户的密码，默认为空字符串", default: "" }),
  userFilter: Type.String({ description: "LDAP用户筛选器" }),
  addUser: Type.Object({
    userBase: Type.String({ description: "LDAP增加用户节点时，把用户增加到哪个节点下" }),
    homeDir: Type.String({
      description: "LDAP增加用户时，用户的homeDirectory值。使用{{ userId }}代替新用户的用户名",
      default: "/nfs/{{ userId }}",
    }),

    userIdDnKey: Type.Optional(Type.String({
      description: `
      LDAP增加用户时，新用户节点的DN中，第一个路径的属性的key。
      新用户节点的DN为{userIdDnKey}={用户ID},{userBase}
      如果不填写，则使用ldap.attrs.uid的值
      `,
    })),

    groupStrategy: Type.Enum(NewUserGroupStrategy, { description: `
      如何确定新用户的组。
      ${NewUserGroupStrategy.newGroupPerUser}: 给每个用户创建一个新的组
      ${NewUserGroupStrategy.oneGroupForAllUsers}: 将所有用户加入某个已有的组
    ` }),

    newGroupPerUser: Type.Optional(Type.Object({
      groupBase: Type.String({ description: "LDAP增加用户对应的组时，把组节点增加到哪个节点下" }),
      groupIdDnKey: Type.Optional(Type.String({ description: `
      新的组节点的DN中，第一个路径的属性的key。
      新的组节点的DN为{groupIdDnKey}={用户ID},{groupBase}
      如果不填写，则使用ldap.attrs.uid的值
      ` })),
      extraProps: Type.Optional(Type.Record(Type.String(), Type.Union([Type.String(), Type.Array(Type.String())], {
        description: "组的节点应该额外拥有的属性值。可以使用 {{ 用户节点的属性key }}来使用用户节点的属性值",
      }))),
    }, { description: "如果groupStrategy采用newGroupPerUser，填写新的组节点的配置信息" })),

    oneGroupForAllUsers: Type.Optional(Type.Object({
      gidNumber: Type.Integer({ description: "新用户将会加入的组的gidNumber属性值" }),
    }, { description: "如果groupStrategy采用oneGroupForAllUsers，填写原有组的信息" })),

    addUserToLdapGroup: Type.Optional(
      Type.String({ description: "LDAP增加用户时，应该把用户增加到哪个LDAP Group下。如果不填，创建用户后不会增加用户到Group" }),
    ),

    uidStart: Type.Integer({
      description: `
      LDAP创建用户时，uid从多少开始。生成的用户的uid等于此值加上用户账户中创建的用户ID。
      如果采用newGroupPerUser的用户组策略，创建的组的gid和uid和此相同。`,
      default: 66000,
    }),

    extraProps: Type.Optional(
      Type.Record(
        Type.String(),
        Type.Union([Type.String(), Type.Array(Type.String())]),
        { description: `
          LDAP增加用户时，用户项除了id、name和mail，还应该添加哪些属性
          如果这里出现了uid, name或email同名的属性，这里的值将替代用户输入的值。
          属性值支持使用 {{ 用户节点的属性key }} 格式来使用已有用户节点的属性值
          例如：{ sn: "{{ cn }}" }，那么添加时将会增加一个sn属性，其值为cn的属性，即为用户输入的姓名
        `,
        })),
  }, { description: "添加用户的配置" }),
  attrs: Type.Object({
    uid: Type.String({ description: "LDAP中对应用户的id的属性名。" }),
    name: Type.Optional(Type.String({ description: `
        LDAP对应用户姓名的属性名。此字段用于
        1. 登录时显示为用户的姓名
        2. 创建用户的时候把姓名信息填入LDAP
        3. 管理系统添加用户时，验证ID和姓名是否匹配

        如果不设置此字段，那么
        1. 用户姓名为用户的ID
        2. 创建用户时姓名信息填入LDAP
        3. 管理系统添加用户时，不验证ID与姓名是否匹配
    ` })),
    mail: Type.Optional(Type.String({ description: "LDAP中对应用户的邮箱的属性名。可不填。此字段只用于在创建用户的时候把邮件信息填入LDAP。" })),
  }, { description: "属性映射" }),
}, { description: "LDAP配置" });

export type LdapConfigSchema = Static<typeof LdapConfigSchema>;

export const SshConfigSchema = Type.Object({
  baseNode: Type.Optional(Type.String({ description: "SSH认证中，以哪个节点为认证用户的基础。如果不设置则为第一个集群的第一个登录节点" })),
}, { description: "SSH配置", default: {} });

export type SshConfigSchema = Static<typeof SshConfigSchema>;

export const AuthConfigSchema = Type.Object({
  redisUrl: Type.String({ description: "存放token的redis地址", default: "redis:6379" }),
  tokenTimeoutSeconds: Type.Integer({ description: "token未使用的失效时间", default: 3600 }),
  authType: Type.Enum(AuthType, { description: "认证类型", default: "ssh" }),
  ldap: Type.Optional(LdapConfigSchema),
  ssh: Type.Optional(SshConfigSchema),
});

export type AuthConfigSchema = Static<typeof AuthConfigSchema>;

export const AUTH_CONFIG_FILE = "auth";

export const authConfig = getConfigFromFile(AuthConfigSchema, AUTH_CONFIG_FILE, DEFAULT_CONFIG_BASE_PATH);

// validate the config
function validateConfig(config: AuthConfigSchema) {
  if (config.authType === "ldap") {
    if (!config.ldap) {
      throw new Error("authType is set to ldap, but ldap config is not set");
    }

    if (config.ldap.addUser.groupStrategy === NewUserGroupStrategy.newGroupPerUser
    && !config.ldap.addUser.newGroupPerUser) {
      throw new Error(`
      ldap.addUser.groupStrategy is set to ${NewUserGroupStrategy.newGroupPerUser} is set to ldap,
      but ldap.addUser.groupStrategy.newGroupPerUser config is not set`,
      );
    }

    if (config.ldap.addUser.groupStrategy === NewUserGroupStrategy.oneGroupForAllUsers
    && !config.ldap.addUser.oneGroupForAllUsers) {
      throw new Error(`
      ldap.addUser.groupStrategy is set to ${NewUserGroupStrategy.oneGroupForAllUsers} is set to ldap,
      but ldap.addUser.groupStrategy.oneGroupFroAllUsers config is not set`,
      );
    }

  }

  if (config.authType === AuthType.ssh && !config.ssh) {
    throw new Error("authType is set to ldap, but ldap config is not set");
  }
}

validateConfig(authConfig);
