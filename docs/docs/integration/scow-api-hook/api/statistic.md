---
sidebar_position: 2
title: 数据统计相关API
---

# 数据统计相关API

OpenSCOW系统提供了一些数据统计相关的API，您可以通过这些API获取OpenSCOW系统的一些统计数据。其中有部分API是以日期为维度进行的统计，您可以通过这些API获取x天内每一天的统计数据。但由于数据库里采用的是UTC时间，如果希望统计的维度和客户端一致，在使用这些API时，您需要注意时区的问题。

## 相关API

- `GetActiveUserCount`：获取x天内每一天的用户登录次数
- `GetNewUserCount`：获取x天内每一天的新用户注册数
- `GetNewJobCount`：获取x天内每一天的新作业提交数
- `GetDailyCharge`：获取x天内每一天的用户消费金额总计
- `GetDailyPay`: 获取x天内每一天的用户充值金额总计

## 参数 TimeZone

以上API在调用时都需要传timeZone参数，这个参数是用来指定统计的时区。如果不传timeZone参数，统计的时区默认为UTC。如果希望统计的维度和客户端一致，您需要传入timeZone参数。


timeZone参数请遵循以下格式指南：

1.  **UTC偏移量**: 使用格式+HH:MM或-HH:MM表示相对于UTC的偏移。例如，+08:00表示东八区。

2.  **时区名称**: 使用具体的地理时区名称，如Asia/Shanghai或Europe/London。这些名称代表特定地区的标准时间。

请根据您的需求选择以上一种格式来指定时区。

## 可用时区名称及UTC偏移量

- **UTC-12:00** `Etc/GMT+12` - `-12:00`
- **UTC-11:00** `Pacific/Pago_Pago` - `-11:00`
- **UTC-10:00** `Pacific/Honolulu` - `-10:00`
- **UTC-09:00** `America/Anchorage` - `-09:00`
- **UTC-08:00** `America/Los_Angeles` - `-08:00`
- **UTC-07:00** `America/Denver` - `-07:00`
- **UTC-06:00** `America/Chicago` - `-06:00`
- **UTC-05:00** `America/New_York` - `-05:00`
- **UTC-04:00** `America/Caracas` - `-04:00`
- **UTC-03:00** `America/Argentina/Buenos_Aires` - `-03:00`
- **UTC-02:00** `Atlantic/South_Georgia` - `-02:00`
- **UTC-01:00** `Atlantic/Azores` - `-01:00`
- **UTC+00:00** `UTC` - `+00:00`
- **UTC+01:00** `Europe/Paris` - `+01:00`
- **UTC+02:00** `Europe/Athens` - `+02:00`
- **UTC+03:00** `Europe/Moscow` - `+03:00`
- **UTC+04:00** `Asia/Dubai` - `+04:00`
- **UTC+05:00** `Asia/Karachi` - `+05:00`
- **UTC+06:00** `Asia/Dhaka` - `+06:00`
- **UTC+07:00** `Asia/Bangkok` - `+07:00`
- **UTC+08:00** `Asia/Shanghai` - `+08:00`
- **UTC+09:00** `Asia/Tokyo` - `+09:00`
- **UTC+10:00** `Australia/Sydney` - `+10:00`
- **UTC+11:00** `Pacific/Noumea` - `+11:00`
- **UTC+12:00** `Pacific/Fiji` - `+12:00`

