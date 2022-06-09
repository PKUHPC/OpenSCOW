import { autocompletion } from "@codemirror/autocomplete";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";
import styled from "styled-components";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
}

const Container = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 2px;
`;

export const Editor: React.FC<Props> = ({ value, onChange, height = "" }) => {

  const view = useRef<EditorView>();
  const editor = useRef<HTMLDivElement>(null);

  const updateListener = () => EditorView.updateListener.of((vu) => {
    if (vu.docChanged && onChange) {
      const doc = vu.state.doc;
      const value = doc.toString();
      onChange(value);
    }
  });

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
            borderColor: "var(--ant-primary-color-hover)",
            boxShadow: "0 0 0 2px var(--ant-primary-color-outline)",
            outline: "none !important",
            zIndex: "1",
          },
        }),
        // oneDark,
      ],

    });
    view.current = new EditorView({
      state,
      parent: editor.current!,
    });
    return () => {
      view.current?.destroy();
    };
  }, []);

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
  }, [value, view.current]);

  return (
    <Container>
      <div ref={editor} />
    </Container>
  );
};
