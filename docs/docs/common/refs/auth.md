---
title: "auth"
---

# auth

## 环境变量配置






<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`HOST`|主机名|监听地址|0.0.0.0|
|`PORT`|端口号|监听端口|5000|
|`LOG_LEVEL`|字符串|日志等级|info|
|`REDIS_URL`|字符串|redis地址|redis:6379|
|`TOKEN_TIMEOUT_SECONDS`|数字|token未使用的失效时间，单位秒|3600|
|`LDAP_URL`|字符串|LDAP地址。认证类型为ldap必填|**必填**|
|`LDAP_SEARCH_BASE`|字符串|LDAP用户搜索base。认证类型为ldap必填|**必填**|
|`LDAP_BIND_DN`|字符串|操作LDAP时以什么用户操作，默认为空字符串||
|`LDAP_BIND_PASSWORD`|字符串|操作LDAP的用户的密码，默认为空字符串||
|`LDAP_FILTER`|字符串|LDAP用户筛选器。认证类型为ldap必填|**必填**|
|`LDAP_ADD_USER_BASE`|字符串|LDAP增加用户节点时，把用户增加到哪个节点下。认证类型为LDAP必填。|**必填**|
|`LDAP_ADD_GROUP_BASE`|字符串|LDAP增加用户对应的组时，把组节点增加到哪个节点下。认证类型为LDAP必填。|**必填**|
|`LDAP_ADD_HOME_DIR`|字符串|LDAP增加用户时，用户的homeDirectory值。使用{userId}代替新用户的用户名|/nfs/{userId}|
|`LDAP_ADD_USER_TO_GROUP`|字符串|LDAP增加用户时，应该把用户增加到哪个Group下。如果不填，创建用户后不会增加用户到Group|不设置|
|`LDAP_ADD_UID_START`|数字|LDAP创建用户时，uid从多少开始。生成的用户的uid等于此值加上用户账户中创建的用户ID。创建的Group的gid和uid和此相同。|66000|
|`LDAP_ATTR_UID`|字符串|LDAP中对应用户的id的属性名。认证类型为ldap必填|**必填**|
|`LDAP_ATTR_NAME`|字符串|<br/>    LDAP中对应用户的姓名的属性名。<br/>    此字段用于在创建用户的时候把姓名信息填入LDAP，以及验证ID和姓名是否匹配。<br/>    本系统返回的姓名总是以用户账户系统中保存的信息为准。<br/>  |**必填**|
|`LDAP_ATTR_MAIL`|字符串|LDAP中对应用户的邮箱的属性名。可不填。此字段只用于在创建用户的时候把邮件信息填入LDAP。|不设置|
|`LDAP_ADD_ATTRS`|字符串|<br/>    LDAP增加用户时，用户项除了id、name和mail，还应该添加哪些属性。格式：key=name,key=name。<br/>    如果这里出现了uid, name或email同名的属性，这里的值将替代用户输入的值。<br/>    属性值支持使用 {LDAP属性值key} 格式来使用用户填入的值。<br/>    值可以用:来分割来添加数组<br/>    例如：LDAP_ATTR_NAME=cn, LDAP_ADD_ATTRS=sn={cn}，那么添加时将会增加一个sn项，其值为cn项，即为用户输入的姓名<br/><br/>    ||
|`TEST_USERS`|字符串|测试用户，如果这些用户登录，将其ID改为另一个ID。格式：原用户ID=新用户ID,原用户ID=新用户ID。||
|`FOOTER_TEXTS`|字符串|根据域名（从referer判断）不同，显示在footer上的文本。格式：域名=文本,域名=文本||

<!-- ENV TABLE END -->





