import { FloatButton } from "antd";
import { DarkModeButton } from "src/layouts/darkMode";

export const AppFloatButtons = () => {
  return (
    <FloatButton.Group shape="circle" style={{ right: 24 }}>
      <DarkModeButton /> <FloatButton.BackTop />
    </FloatButton.Group>
  );
};


