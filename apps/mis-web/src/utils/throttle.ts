export function throttle<T extends(...args: any[]) => any>
(fn: T, wait = 500): (...args: Parameters<T>) => ReturnType<T> {
  // 上一次执行 fn 的时间
  let previous = 0;
  // 将 throttle 处理结果当作函数返回
  return function(...args: any[]) {
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
