import React from 'react';
import * as monaco from 'monaco-editor';
import { useMount, useUpdateEffect } from 'ahooks';
import './utils/inlineCompletionProvider'

const CodeEditor = ({lang}) => {
  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: false,
    wrappingIndent: 'none',
    inlineSuggest: {
      enabled: true,
      showToolbar: 'onHover',
      mode: 'subword',
      suppressSuggestions: false,
    },
  };
  useUpdateEffect(() => {
    monaco.editor.setModelLanguage(monaco.editor.getModels()[0], lang);
  }, [lang])
  useMount(() => {
    monaco.editor.create(document.getElementById('editorContainer'), {
      value: "function hello() {\n\talert('Hello world!');\n}",
      language: lang || 'javascript',
      ...options,
    });
  });
  return (
    <div id="editorContainer" style={{ height: 700, border: '1px solid #ccc' }}>
      {/* <MonacoEditor width="800" height="600" language="javascript" theme="vs-dark" value={'test code'} /> */}
    </div>
  );
};
export default CodeEditor;

