import { FormInstance } from "antd";

export const passwordRule = {
  pattern: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[`~!@#\$%^&*()_+\-[\];',./{}|:"<>?]).{8,}$/,
  message: "必须包含字母、数字和符号，八位及以上",
};


export const confirmPasswordFormItemProps = <
  PasswordFieldName extends string,
  T extends { [key in PasswordFieldName]: string }
>(form: FormInstance<T>, passwordFieldName: PasswordFieldName) => {
  return {
    dependencies: [passwordFieldName],
    validateFirst: true,
    rules: [
      {
        required: true,
        message: "请确认密码",
      },
      {
        validator: async (_, value) => {
          if (value && form.getFieldValue(passwordFieldName) !== value) {
            throw new Error("两次密码输入不一致，请重新输入");
          }
        },
      },
    ],
  };
};

export const emailRule = ({
  type: "email",
  message: "邮箱格式不正确，请重新输入",
}) as const;
