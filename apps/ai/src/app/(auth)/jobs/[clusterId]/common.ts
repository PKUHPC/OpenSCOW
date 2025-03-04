export const validateMountPoints = (
  mountsDuplicateText: string,
  workingDirText: string = "",
) => ({ getFieldValue }: { getFieldValue: (name: string) => any }) => ({
  validator(_: any, value: string) {
    // 标准化当前值（去除尾部斜杠）
    const currentValueNormalized = value.replace(/\/+$/, "");

    const mountPoints: string[] = getFieldValue("mountPoints")
    // 过滤掉空字符串和undefined
      .filter((mountPoint: string | undefined) => mountPoint !== undefined && mountPoint !== "")
      .map((mountPoint: string) =>
        mountPoint.replace(/\/+$/, ""),
      );

    const currentIndex = mountPoints.findIndex((point) => point === currentValueNormalized);

    const otherMountPoints = mountPoints.filter((_, idx) => idx !== currentIndex);
    if (otherMountPoints.includes(currentValueNormalized)) {
      return Promise.reject(new Error(mountsDuplicateText));
    }

    const workingDirectory = getFieldValue("customFields")?.workingDir?.toString();
    if (workingDirectory && workingDirectory.replace(/\/+$/, "") === currentValueNormalized) {
      return Promise.reject(new Error(workingDirText));
    }

    return Promise.resolve();
  },
});
