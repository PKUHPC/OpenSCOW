import { getConfigFromFile } from "@scow/config";
import { Static, Type } from "@sinclair/typebox";

import { AuthType } from "./AuthType";

export const LdapConfigSchema = Type.Object({
  url: Type.String({ description: "LDAP地址" }),
  searchBase: Type.String({ description: "LDAP用户搜索base。", default: "" }),
  bindDN: Type.String({ description: "操作LDAP时以什么用户操作，默认为空字符串", default: "" }),
  bindPassword: Type.String({ description: "操作LDAP的用户的密码，默认为空字符串", default: "" }),
  userFilter: Type.String({ description: "LDAP用户筛选器" }),
  addUser: Type.Object({
    userBase: Type.String({ description: "LDAP增加用户节点时，把用户增加到哪个节点下" }),
    groupBase: Type.String({ description: "LDAP增加用户对应的组时，把组节点增加到哪个节点下" }),
    homeDir: Type.String({ description: "LDAP增加用户时，用户的homeDirectory值。使用{userId}代替新用户的用户名", default: "/nfs/{userId}" }),
    userToGroup: Type.Optional(Type.String({ description: "LDAP增加用户时，应该把用户增加到哪个Group下。如果不填，创建用户后不会增加用户到Group" })),
    uidStart: Type.Integer({
      description: "LDAP创建用户时，uid从多少开始。生成的用户的uid等于此值加上用户账户中创建的用户ID。创建的Group的gid和uid和此相同。",
      default: 66000,
    }),
    extraProps: Type.Optional(
      Type.Record(
        Type.String(), 
        Type.Union([Type.String(), Type.Array(Type.String())]), 
        { description: `
          LDAP增加用户时，用户项除了id、name和mail，还应该添加哪些属性
          如果这里出现了uid, name或email同名的属性，这里的值将替代用户输入的值。
          属性值支持使用 {LDAP属性值key} 格式来使用用户填入的值。
          例如：LDAP_ATTR_NAME=cn, LDAP_ADD_ATTRS=sn={cn}，那么添加时将会增加一个sn项，其值为cn项，即为用户输入的姓名
        `,
        })),
  }, { description: "添加用户的配置" }),
  attrs: Type.Object({
    groupUserId: Type.String({ description: "LDAP中用户对应的组的实体表示用户ID的属性名。" }),
    uid: Type.String({ description: "LDAP中对应用户的id的属性名。" }),
    name: Type.Optional(Type.String({ description: `
      LDAP中对应用户的姓名的属性名。认证类型为LDAP可选填。
      此字段用于在创建用户的时候把姓名信息填入LDAP，以及验证ID和姓名是否匹配。
      如果不填写，则系统将不会验证ID和姓名是否匹配，且不会再创建用户的时候把姓名信息填入LDAP。
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

export const AUTH_CONFIG_FILE = "auth";

export const authConfig = getConfigFromFile(AuthConfigSchema, AUTH_CONFIG_FILE);