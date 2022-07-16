import { envConfig, host, num, parseKeyValue, port, str } from "@scow/config";

export const AUTH_EXTERNAL_URL = "/auth";
export const AUTH_REDIRECT_URL = "/api/auth/callback";
export const FAVICON_URL = "/api/icon?type=favicon";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  REDIS_URL: str({ desc: "redis地址", default: "redis:6379" }),

  TOKEN_TIMEOUT_SECONDS: num({ desc: "token未使用的失效时间，单位秒", default: 3600 }),

  AUTH_TYPE: str({ desc: "认证类型", choices: ["ldap", "ssh"], default: "ssh" }),

  LDAP_URL: str({ desc: "LDAP地址。认证类型为ldap必填", default: undefined }),
  LDAP_SEARCH_BASE: str({ desc: "LDAP用户搜索base。认证类型为ldap必填", default: "" }),
  LDAP_BIND_DN: str({ desc: "操作LDAP时以什么用户操作，默认为空字符串", default: "" }),
  LDAP_BIND_PASSWORD: str({ desc: "操作LDAP的用户的密码，默认为空字符串", default: "" }),
  LDAP_FILTER: str({ desc: "LDAP用户筛选器。认证类型为ldap必填", default: undefined }),
  LDAP_ADD_USER_BASE: str({ desc: "LDAP增加用户节点时，把用户增加到哪个节点下。认证类型为LDAP必填。", default: undefined }),
  LDAP_ADD_GROUP_BASE: str({ desc: "LDAP增加用户对应的组时，把组节点增加到哪个节点下。认证类型为LDAP必填。", default: "undefined" }),
  LDAP_ADD_HOME_DIR: str({ desc: "LDAP增加用户时，用户的homeDirectory值。使用{userId}代替新用户的用户名", default: "/nfs/{userId" }),
  LDAP_ADD_USER_TO_GROUP: str({ desc: "LDAP增加用户时，应该把用户增加到哪个Group下。如果不填，创建用户后不会增加用户到Group", default: undefined }),
  LDAP_ADD_UID_START: num({
    desc: "LDAP创建用户时，uid从多少开始。生成的用户的uid等于此值加上用户账户中创建的用户ID。创建的Group的gid和uid和此相同。",
    default: 66000,
  }),
  LDAP_ATTR_GROUP_USER_ID: str({ desc: "LDAP中用户对应的组的实体表示用户ID的属性名。认证类型为LDAP必填", default: undefined }),
  LDAP_ATTR_UID: str({ desc: "LDAP中对应用户的id的属性名。认证类型为ldap必填", default: undefined }),
  LDAP_ATTR_NAME: str({ desc: `
    LDAP中对应用户的姓名的属性名。认证类型为LDAP可选填。
    此字段用于在创建用户的时候把姓名信息填入LDAP，以及验证ID和姓名是否匹配。
    如果不填写，则系统将不会验证ID和姓名是否匹配，且不会再创建用户的时候把姓名信息填入LDAP。
  `, default: undefined }),
  LDAP_ATTR_MAIL: str({ desc: "LDAP中对应用户的邮箱的属性名。可不填。此字段只用于在创建用户的时候把邮件信息填入LDAP。", default: undefined }),
  LDAP_ADD_ATTRS: str({ desc: `
    LDAP增加用户时，用户项除了id、name和mail，还应该添加哪些属性。格式：key=name,key=name。
    如果这里出现了uid, name或email同名的属性，这里的值将替代用户输入的值。
    属性值支持使用 {LDAP属性值key} 格式来使用用户填入的值。
    值可以用:来分割来添加数组
    例如：LDAP_ATTR_NAME=cn, LDAP_ADD_ATTRS=sn={cn}，那么添加时将会增加一个sn项，其值为cn项，即为用户输入的姓名
    `,
  default: "",
  }),

  SSH_BASE_NODE: str({ desc: "SSH认证中，以哪个节点为认证用户的基础。如果不设置则为第一个集群的第一个登录节点", default: undefined }),

  TEST_USERS: str({ desc: "测试用户，如果这些用户登录，将其ID改为另一个ID。格式：原用户ID=新用户ID,原用户ID=新用户ID。", default: "" }),

  FOOTER_TEXTS: str({ desc: "根据域名（从referer判断）不同，显示在footer上的文本。格式：域名=文本,域名=文本", default: "" }),
});

export const FOOTER_TEXTS = parseKeyValue(config.FOOTER_TEXTS);
