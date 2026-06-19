import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import type { Extension } from '@codemirror/state';
import { StateField } from '@codemirror/state';
import { EditorView, Decoration, type DecorationSet } from '@codemirror/view';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  activeLine: number;
}

function lineHighlightExtension(lineNo: number): Extension {
  return StateField.define<DecorationSet>({
    create(state) {
      if (lineNo <= 0 || lineNo > state.doc.lines) return Decoration.none;
      return Decoration.set([
        Decoration.line({ class: 'cm-activeLine' }).range(state.doc.line(lineNo).from),
      ]);
    },
    update(_deco, tr) {
      if (lineNo <= 0 || lineNo > tr.state.doc.lines) return Decoration.none;
      return Decoration.set([
        Decoration.line({ class: 'cm-activeLine' }).range(tr.state.doc.line(lineNo).from),
      ]);
    },
    provide: (f) => EditorView.decorations.from(f),
  });
}

export default function CodeEditor({ code, onChange, activeLine }: CodeEditorProps) {
  const extensions = useMemo(() => {
    const ext: Extension[] = [javascript({ jsx: true })];
    if (activeLine > 0) {
      ext.push(lineHighlightExtension(activeLine));
    }
    return ext;
  }, [activeLine]);

  return (
    <div className="flex-1 overflow-auto relative custom-scrollbar">
      <CodeMirror
        value={code}
        height="100%"
        theme="dark"
        extensions={extensions}
        onChange={onChange}
        className="h-full text-base"
        style={{ fontSize: '14px', backgroundColor: 'transparent' }}
      />
    </div>
  );
}
