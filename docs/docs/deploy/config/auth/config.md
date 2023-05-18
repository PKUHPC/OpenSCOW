---
sidebar_position: 4
title: 内置认证系统配置 
---

# 内置认证系统配置

## 允许回调主机名

当登录完成后，认证系统将会回调到登录时传入的`callbackUrl`参数。为了保证安全性，认证系统默认只允许回调到和认证系统相同的主机名下。您可以通过配置`auth.yml`下的`allowedCallbackHostnames`配置项来配置允许回调的主机名。注意，主机名(hostname)不包括端口号。

```yaml title="config/auth.yml"
allowedCallbackHostnames：
  - localhost
  - another.com
```

## 验证码功能

在`auth.yaml`配置中，可以配置关于登录验证码的功能
  
```yaml title="config/auth.yml"
# 默认不启用登录验证码功能
# captcha:
  # enabled为true开启登录验证码功能
  # enabled: false
```

启用登录验证码时UI界面：

![验证码登录UI](./%E9%AA%8C%E8%AF%81%E7%A0%81%E7%99%BB%E5%BD%95UI.png)

## 模仿用户

如果登录用户的ID为某个key，那么实际将会以其对应的value的用户登录。修改此配置无需重启认证系统。

```yaml title="config/auth.yml"
mockUsers:
  # 当登录用户的ID为fromUser1，实际上以toUser1登录
  fromUser1: toUser1
  fromUser2: toUser2
```


## OTP功能

在`auth.yaml`配置中，可以配置关于otp验证码的功能, ldap认证方式支持支持绑定otp和验证，有效验证码为当前验证码和上一个验证码。ssh认证方式仅支持远程验证。
### 一、将OTP密钥保存在LDAP中(即otp.type为ldap):

   
  1. 手机app您可以使用authenticator，FreeOTP等。
  2. 您需要自己在ldap中定义一个属性名用来存储string类型的OTP密钥,并配置为`auth.yaml`中的`opt.secretAttributeName`，这个密钥属性名默认为`otpSecret`。
  3. 您需要配置邮件发送信息。其中，您需要提供有效的发件人地址、SMTP 服务器地址、SMTP 服务器端口号以及 SMTP 认证凭据（包括用户名和授权码）。

### 二、由您自己管理OTP密钥(otp.type为remote):

  1. 那么您需要提供一个验证otp码的接口, 并配置为`otp.remote.validateUrl`，返回验证的结果。返回结果要求json格式`{"result": true|false}`。
  2. scow会使用fetch向上述接口（`otp.remote.validateUrl`）发起请求。fetch请求中`otpCode`为用户输入的otp码，`userId`为用户名，类型均为`string`。

  | fetch| |
  |:----:|:---------------------------------: |
  |headers|"Content-Type": "application/json" |
  | body  | otpCode, userId                   |

例：假设您是像[Google Authenticator](https://github.com/google/google-authenticator-libpam)一样将密钥存在用户家目录下的`.google_authenticator`第一行内容，那么您可以提供的路由接口及服务TypeScript示例：

```

import { Static, Type } from "@sinclair/typebox";
import fastify from "fastify";
import { NodeSSH } from "node-ssh";
import * as speakeasy from "speakeasy";

// 远程验证OTP码
const app = fastify({ logger: true });

/**
 * 要求启动该服务的主机可以ssh免密登录到存放otp密钥的主机的root用户。启动该服务的主机的私钥地址为/home/node/.ssh/id_rsa，node为用户名。
 * 假设您的OTP密钥存放主机host="192.168.88.102"上/data/home/{{userId}}/.google_authenticator文件的第一行内容，其中{{userId}}为需要验证otp码是否正确的用户名
 * 
 */
// ssh免密登录到存放otp密钥的root用户
const sshUserName = "root";
// 假设启动该服务的主机的私钥地址为/home/node/.ssh/id_rsa
const privateKeyPath = "/home/node/.ssh/id_rsa";

// OTP密钥存放主机host="192.168.88.102"
const host = "192.168.88.102";
// 用户家目录，otp密钥存放于此目录下的.google_authenticator文件的第一行内容
const homedir = "/data/home/{{ userId }}";

// routePath需要与您实现的验证接口(otp.remote.url中的path)一致
const routePath = "/otp/remote/validateCode";

const bodySchema = Type.Object({
  otpCode: Type.String(),
  userId: Type.String(),
});
app.post<{Body: Static<typeof bodySchema>}>(
  routePath,
  {
    schema: {
      body: bodySchema,
    },
  },
  async (req, res) => {
    // otpCode为scow发起的请求携带的OTP验证码，userId为OTP验证的用户名
    const { otpCode, userId } = req.body;
    const ssh = new NodeSSH();
    // 获取OTP密钥
    const otpSecret = await ssh.connect({ host: host, username: sshUserName, privateKeyPath: privateKeyPath })
      .then(async () => {
        const otpSecretFilePath = homedir.replace("{{ userId }}", userId) + "/.google_authenticator";
        const fileContent = await ssh.execCommand(`su ${userId} && cat ${otpSecretFilePath}`);
        return fileContent.stdout.toString().split("\n")[0];
      }).finally(() => {
        ssh.dispose();
      });
    // 获取绝对时间戳
    const currentTime = new Date();
    const timeStamp = Date.UTC(currentTime.getUTCFullYear(), currentTime.getUTCMonth(), currentTime.getUTCDate(),
      currentTime.getUTCHours(), currentTime.getUTCMinutes(), currentTime.getUTCSeconds(),
      currentTime.getUTCMilliseconds());

    // 验证
    let result = speakeasy.totp.verify({
      token: otpCode,
      time: timeStamp / 1000,
      encoding: "base32",
      secret: otpSecret,
      // digits, step, algorithm需要您与手机app设置保持一致,默认digits为6，step为30，algorithm为sha1
    });
    // 验证失败则检测输入的是否是上一个step的otp码，如果是，也算通过
    if (!result) {
      result = speakeasy.totp.verify({
        token: otpCode,
        time: timeStamp / 1000 - 30,
        encoding: "base32",
        secret: otpSecret,
      });
    }
    res.send({ result });
  },
);

export const start = async () => {
  // 配置监听的ip和端口
  await app.listen({ port: 9999, host: "192.168.88.100" });
};
start();

```

默认不启用`otp`功能，无需配置。若要启用`otp`, 则需要将`otp.enabled`配置为`true`, 此时必须配置`otp.type`为`ldap`或者`remote`。

启用时，如果您将`otp.type`配置为`ldap`, 那么`otp.ldap`下所有没有默认值的配置项都需要配置，此外您需要保证`auth.yaml`文件中`ldap.attrs.mail`被配置了，此配置在这里用于获取邮箱信息发送邮件。同样地如果您将`otp.type`配置为`remote`, 那么`otp.remote`下所有没有默认值的配置项都需要配置。

`auth.yaml:`
```yaml title="config/auth.yml"

# ldap认证支持绑定和验证otp，ssh认证仅支持验证
otp:
  # 是否启用otp功能， 默认false
  enabled: false
  # status指定otp启用类型，分别为ldap：密钥存在ldap，remote：密钥您自己管理。
  type: ldap
  # 当status为ldap时间，需配置以下这段内容
  ldap:
    # 限制绑定otp要在多少分钟内完成，需要整数, 默认10
    # bindLimitMinutes: 10
    # 密钥存储属性名, 默认为otpSecret, 需要用户自己在ldap中进行定义
    secretAttributeName: 
    # 访问scow系统的域名或ip地址(不需要填写scow的base path),用于发送邮件中组成OTP绑定页面的地址，例如：https://pku.edu.cn
    scowHost: 
    # otp验证软件扫描二维码之后，出现的label中，用户名和@后显示的名称, 默认为SCOW
    # ldabel: "scow"
    # otp的二维码上方文字描述信息", 默认为 "此二维码仅出现一次，用过即毁", 支持html标签
    # qrcodeDescription: "此二维码仅出现一次"
    # 绑定otp时发送绑定信息方式
    authenticationMethod:
      mail:
        # 发件邮箱地址
        from: "morgan68@ethereal.email"
        # 向每个用户发送邮件频率限制，需要整数，单位秒，默认60秒间隔
        # sendEmailFrequencyLimitInSeconds: 60
        # 邮件主题，默认为"OTP绑定链接"
        # subject: "OTP绑定链接"
        # 邮件内容标题，默认为"Bind OTP"，也可以是html标签内容
        # title: "Bind OTP"
        # 邮件内容,默认为"Please click on the following link to bind your OTP:"，也可以是html标签内容
        # contentText: "Please click on the following link to bind your OTP"
        # 标签点击文字,默认为"Bind OTP"
        # labelText: "Bind OTP"
        mailTransportInfo:
          # SMTP服务器
          host: "smtp.ethereal.email"
          # 是否启用安全连接，默认false
          # secure: false
          # 服务器端口
          port: 587
          # SMTP身份验证用户名
          user: "morgan68@ethereal.email"
          # SMTP身份验证授权码
          password: "y2es3bd3rYwxWs5n8g"
  # 如果mode指定为remote，需要配置以下内容
  remote:
    # 远程验证url，例如http://localhost:9999/otp/remote/validateCode,详见https://pkuhpc.github.io/SCOW/docs/deploy/config/auth/config
    validateUrl: 
    # 当用户点击绑定OTP按钮时跳转的按钮，建议配置，不配置会不显示绑定otp按钮
    # redirectUrl: https://pkuhpc.github.io/SCOW/docs/deploy/config/auth/config 

```
