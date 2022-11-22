import { autocompletion } from "@codemirror/autocomplete";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";
import { useDarkMode } from "src/layouts/darkMode";
import styled, { useTheme } from "styled-components";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
}

const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.token.colorBorder};
  border-radius: ${({ theme }) => theme.token.borderRadius};
`;

export const CodeEditor: React.FC<Props> = ({ value, onChange, height = "" }) => {

  const view = useRef<EditorView>();
  const editor = useRef<HTMLDivElement>(null);

  const updateListener = () => EditorView.updateListener.of((vu) => {
    if (vu.docChanged && onChange) {
      const doc = vu.state.doc;
      const value = doc.toString();
      onChange(value);
    }
  });

  const { token } = useTheme();
  const { dark } = useDarkMode();

  useEffect(() => {
    const state = EditorState.create({
      extensions: [
        basicSetup,
        autocompletion({ activateOnTyping: false }),
        updateListener(),
        StreamLanguage.define(shell),
        EditorView.theme({
          "&": {
            height,
          },
          ".cm-scroller": {
            fontFamily: "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",
          },
          "&.cm-focused": {
            borderColor: token.colorBorder,
            boxShadow: token.boxShadow,
            outline: "none !important",
            zIndex: "1",
          },
        }, { dark }),
      ],

    });
    view.current = new EditorView({
      state,
      parent: editor.current!,
    });
    return () => {
      view.current?.destroy();
    };
  }, [token, dark]);

  useEffect(() => {
    const currentView = view.current;
    if (currentView) {
      const currentValue = currentView.state.doc.toString();
      if (value !== currentValue) {
        currentView.dispatch({
          changes: { from: 0, to: currentValue.length, insert: value || "" },
        });
      }
    }
  }, [value, view.current, token]);

  return (
    <Container>
      <div ref={editor} />
    </Container>
  );
};
