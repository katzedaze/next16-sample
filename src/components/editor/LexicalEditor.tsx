'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { EditorState, LexicalEditor as LexicalEditorType } from 'lexical';
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';

interface LexicalEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

// プラグイン: 初期値の設定
function InitialValuePlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isFirstRender.current || !value) return;
    isFirstRender.current = false;

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      // HTMLからノードを生成
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $insertNodes(nodes);
    });
  }, [editor, value]);

  return null;
}

// エディタの内容をHTML文字列として取得
function OnChangeHTMLPlugin({ onChange }: { onChange?: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = (editorState: EditorState, editor: LexicalEditorType) => {
    if (!onChange) return;

    editorState.read(() => {
      const root = $getRoot();
      const htmlString = root.getTextContent();
      onChange(htmlString);
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
}

export default function LexicalEditor({ value, onChange, placeholder }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'TaskEditor',
    theme: {
      paragraph: 'mb-2',
      heading: {
        h1: 'text-2xl font-bold mb-2',
        h2: 'text-xl font-bold mb-2',
        h3: 'text-lg font-bold mb-2',
      },
      list: {
        ul: 'list-disc ml-4 mb-2',
        ol: 'list-decimal ml-4 mb-2',
        listitem: 'mb-1',
      },
      quote: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-2',
      link: 'text-blue-600 dark:text-blue-400 hover:underline',
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[200px] p-3 outline-none text-gray-900 dark:text-white"
              aria-placeholder={placeholder || ''}
              placeholder={
                <div className="absolute top-3 left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
                  {placeholder || ''}
                </div>
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <InitialValuePlugin value={value} />
        <OnChangeHTMLPlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}
