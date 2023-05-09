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

import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { useDarkMode } from "@scow/lib-web/build/layouts/darkMode";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback } from "react";
import styled from "styled-components";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
}

const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.token.colorBorder};
  border-radius: ${({ theme }) => theme.token.borderRadius};
`;

const extensions = [StreamLanguage.define(shell)];

export const CodeEditor: React.FC<Props> = ({ value, onChange, height = "" }) => {
  const { dark } = useDarkMode();
  const INITIAL_REMINDER = "#此处参数设置的优先级高于页面其它地方，两者冲突时以此处为准\n";
  return (
    <Container>
      <CodeMirror
        value={value}
        height={height}
        theme={dark ? githubDark : githubLight}
        onChange={useCallback((value) => {
          onChange?.(value);
        }, [onChange])}
        // theme={dark ? "dark" : "light"}
        extensions={extensions}
        placeholder={INITIAL_REMINDER}
      />
    </Container>
  );
};
