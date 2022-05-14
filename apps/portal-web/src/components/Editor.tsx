import MonacoEditor from "@monaco-editor/react";
import styled from "styled-components";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
  language: string;
}

const Container = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 2px;
`;

export const Editor: React.FC<Props> = ({ value, onChange, height, language }) => {
  return (
    <Container>
      <MonacoEditor language={language} height={height}
        value={value} onChange={onChange} options={{
          lineNumbers: "on",
          minimap: { enabled: false },
          "lineDecorationsWidth": 0,
        }} />
    </Container>
  );
};
