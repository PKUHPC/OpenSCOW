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

export function throttle<T extends(...args: any[]) => any>(fn: T, wait = 500):
(...args: Parameters<T>) => ReturnType<T> {
  // 上一次执行 fn 的时间
  let previous = 0;
  // 将 throttle 处理结果当作函数返回
  return function(this: any, ...args: any[]) {
    // 获取当前时间，转换成时间戳，单位毫秒
    const now = +new Date();
    // 将当前时间和上一次执行函数的时间进行对比
    // 大于等待时间就把 previous 设置为当前时间并执行函数 fn
    if (now - previous > wait) {
      previous = now;
      return fn.apply(this, args);
    }
  };
}
