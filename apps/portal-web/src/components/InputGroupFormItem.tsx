import { Input } from "antd";

export interface Props {
  value?: string;
  onChange?: (value: string) => void;
  deltaWidth: string;
}

export const InputGroupFormItem: React.FC<Props> = ({ children, deltaWidth, value, onChange }) => (
  <Input.Group compact >
    <Input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ width: `calc(100% - ${deltaWidth})` }}
    />
    {children}
  </Input.Group>
);
