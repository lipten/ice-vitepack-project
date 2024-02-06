
import * as monaco from 'monaco-editor';
import { Trie } from './trie';
import {
  candidateNum,
  completionDelay,
  disabledFor,
  supportLanguages,
  apiKey,
  apiSecret,
} from "./configures";
import { getCodeCompletions } from './getCodeCompletions'
// import inlineCompletionProvider from './utils/inlineCompletionProvider'


function middleOfLineWontComplete(editor: any, model: any) {
  // 获取当前光标位置
  const cursorPosition = editor.getSelection();
  const lineEndPosition = model.getLineMaxColumn(cursorPosition.startLineNumber);

  const selectionTrailingString = new monaco.Selection(
    cursorPosition.selectionStartLineNumber,
    cursorPosition.selectionStartColumn,
    cursorPosition.selectionStartLineNumber,
    lineEndPosition + 1,
  );
  const trailingString = model.getValueInRange(selectionTrailingString);
  const re = /^[\]\{\}\); \n\r\t\'\"]*$/;
  if (re.test(trailingString)) {
    return false;
  } else {
    return true;
  }
}

const getTrailingString = (editor, model) => {
  // 获取当前光标位置
  const cursorPosition = editor.getSelection();
  const lineEndPosition = model.getLineMaxColumn(cursorPosition.startLineNumber);

  const selectionTrailingString = new monaco.Selection(
    cursorPosition.selectionStartLineNumber,
    cursorPosition.selectionStartColumn,
    cursorPosition.selectionStartLineNumber,
    lineEndPosition + 1,
  );
  const trailingString = model.getValueInRange(selectionTrailingString);
  return trailingString
}

function isAtTheMiddleOfLine(editor: any, model: any) {
  const trailingString = getTrailingString(editor, model)
  const trimmed = trailingString.trim();
  return trimmed.length !== 0;
}


function removeTrailingCharsByReplacement(
  completion: string,
  replacement: string
) {
  for (let ch of replacement) {
    if (!isBracketBalanced(completion, ch)) {
      completion = replaceLast(completion, ch, "");
    }
  }
  return completion;
}


function replaceLast(str: string, toReplace: string, replacement: string) {
  let pos = str.lastIndexOf(toReplace);
  if (pos > -1) {
    return (
      str.substring(0, pos) +
      replacement +
      str.substring(pos + toReplace.length)
    );
  } else {
    return str;
  }
}

function isBracketBalanced(str: string, character: string) {
  let count = 0;
  for (let ch of str) {
    if (ch === character) {
      count++;
    }
    if (
      (character === "{" && ch === "}") ||
      (character === "[" && ch === "]") ||
      (character === "(" && ch === ")") ||
      (character === "}" && ch === "{") ||
      (character === "]" && ch === "[") ||
      (character === ")" && ch === "(")
    ) {
      count--;
    }
  }
  return count === 0;
}

const prompts: string[] = [];
const trie = new Trie([]);
let lastRequest


monaco.languages.registerInlineCompletionsProvider(supportLanguages, {
  async provideInlineCompletions(model, position, context, token) {
    const editors = monaco.editor.getEditors();
    if (!editors?.length) {
      return;
    }
    const activeEditor = editors.find((item) => item.getModel() === model);
    if (!activeEditor) {
      return;
    }
    // 获取当前光标位置
    const cursorPosition = activeEditor.getSelection();
    // 实例化光标以前的选择范围
    const selection = new monaco.Selection(
      0,
      0,
      cursorPosition.selectionStartLineNumber,
      cursorPosition.selectionStartColumn,
    );
    // 获取光标之前的内容
    let textBeforeCursor = model.getValueInRange(selection);
    if (
      cursorPosition.selectionStartColumn === 0 &&
      textBeforeCursor[textBeforeCursor.length - 1] !== '\n'
    ) {
      textBeforeCursor += '\n';
    }

    // 解决光标之后有除括号空格之外内容，仍然补充造成的调用浪费
    // const selectionNextChar = new monaco.Selection(
    //     cursorPosition.line,
    //     cursorPosition.character,
    //     cursorPosition.line,
    //     cursorPosition.character + 1
    // );
    // let nextChar = model.getValueInRange(selectionNextChar);
    // const checkString = "]}) \n\t'\"";
    // if (!checkString.includes(nextChar)) {

    if (middleOfLineWontComplete(activeEditor, model)) {
      console.log('不进行补充');
      return;
    }

    // for (const prompt of prompts) {
    //   if (textBeforeCursor.trimEnd().indexOf(prompt) != -1) {
    //     let completions;
    //     completions = trie.getPrefix(textBeforeCursor);
    //     let useTrim = false;
    //     if (completions.length === 0) {
    //       completions = trie.getPrefix(
    //         textBeforeCursor.trimEnd(),
    //       );
    //       useTrim = true;
    //     }
    //     if (completions.length == 0) {
    //       break;
    //     }
    //     const items: any[] = [];
    //     // const lastLine = document.lineAt(document.lineCount - 1);
    //     for (
    //       let i = 0;
    //       i <
    //       Math.min(
    //         Math.min(completions.length, 1) + 1,
    //         completions.length,
    //       );
    //       i++
    //     ) {
    //       let insertText = useTrim
    //         ? completions[i].replace(
    //           textBeforeCursor.trimEnd(),
    //           '',
    //         )
    //         : completions[i].replace(textBeforeCursor, '');
    //       console.log(insertText);
    //       const needRequest = ['', '\n', '\n\n'];
    //       if (
    //         needRequest.includes(insertText) ||
    //         insertText.trim() === ''
    //       ) {
    //         continue;
    //       }
    //       if (useTrim) {
    //         const lines = insertText.split('\n');
    //         let nonNullIndex = 0;
    //         while (lines[nonNullIndex].trim() === '') {
    //           nonNullIndex++;
    //         }
    //         let newInsertText = '';
    //         for (
    //           let j = nonNullIndex;
    //           j < lines.length;
    //           j++
    //         ) {
    //           newInsertText += lines[j];
    //           if (j !== lines.length - 1) {
    //             newInsertText += '\n';
    //           }
    //         }
    //         if (
    //           textBeforeCursor[
    //           textBeforeCursor.length - 1
    //           ] === '\n' ||
    //           nonNullIndex === 0
    //         ) {
    //           insertText = newInsertText;
    //         } else {
    //           insertText = `\n${newInsertText}`;
    //         }
    //       }
    //       console.log('prompt insertText', insertText)
    //       items.push({
    //         insertText,
    //         range: new monaco.Range(
    //           cursorPosition.selectionStartLineNumber,
    //           cursorPosition.selectionStartColumn,
    //           cursorPosition.selectionStartLineNumber,
    //           cursorPosition.selectionStartColumn,
    //         ),
    //       });
    //       if (useTrim) {
    //         trie.addWord(
    //           textBeforeCursor.trimEnd() + insertText,
    //         );
    //       } else {
    //         trie.addWord(textBeforeCursor + insertText);
    //       }
    //     }
    //     if (items.length === 0) {
    //       continue;
    //     } else {
    //       return { items };
    //     }
    //   }
    // }
    console.log('textBeforeCursor', textBeforeCursor)
    if (textBeforeCursor.length > 8) {
      console.log('try to get');
      const requestId = new Date().getTime();
      lastRequest = requestId;
      await new Promise((f) => setTimeout(f, 1000));
      if (lastRequest !== requestId) {
        return { items: [] };
      }
      console.log('real to get');
      console.log('new command');
      let rs;
      const lang = model.getLanguageId() || 'javascript';
      const num = 1;
      try {
        const timestart = new Date().getTime();
        rs = await getCodeCompletions(
          textBeforeCursor,
          num,
          lang,
          apiKey,
          apiSecret,
          'inlinecompletion',
        );
        const timeend = new Date().getTime();
        console.log('time execute', timeend - timestart);
      } catch (err) {
        if (err) {
          console.log('intended error');
          console.log(err);
        }
        return { items: [] };
      }
      if (rs === null) {
        return { items: [] };
      }
      prompts.push(textBeforeCursor);
      // Add the generated code to the inline suggestion list
      const items: any[] = [];
      for (let i = 0; i < rs.completions.length; i++) {
        let completion = rs.completions[i];
        if (isAtTheMiddleOfLine(activeEditor, model)) {
          const trailingString = getTrailingString(activeEditor, model)
          completion = removeTrailingCharsByReplacement(
            completion,
            trailingString,
          );
          if (
            completion.trimEnd().slice(-1) === '{' ||
            completion.trimEnd().slice(-1) === ';' ||
            completion.trimEnd().slice(-1) === ':'
          ) {
            completion = completion
              .trimEnd()
              .substring(0, completion.length - 1);
          }
        }
        console.log('cursorPosition.selectionStartColumn + rs.completions[i].length', cursorPosition.selectionStartColumn + rs.completions[i].length)
        console.log('rs.completions[i]', rs.completions[i])
        items.push({
          // insertText: completion,
          insertText: rs.completions[i],
          // range: new vscode.Range(endPosition.translate(0, rs.completions.length), endPosition),
          range: new monaco.Range(
            cursorPosition.selectionStartLineNumber,
            cursorPosition.selectionStartColumn + rs.completions[i].length,
            cursorPosition.selectionStartLineNumber,
            cursorPosition.selectionStartColumn,
          ),
        });
        trie.addWord(textBeforeCursor + rs.completions[i]);
      }
      // for (let j = 0; j < items.length; j++) {
      //   items[j].command = {
      //     command: 'verifyInsertion',
      //     title: 'Verify Insertion',
      //     arguments: [
      //       rs.commandid,
      //       rs.completions,
      //       items[j].insertText,
      //     ],
      //   };
      // }
      return { items };
    }

    return { items: [] };
  },
  // provideInlineCompletions: inlineCompletionProvider,
  freeInlineCompletions(arg) { },
});