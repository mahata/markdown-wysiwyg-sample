import { ClipboardEvent, KeyboardEvent, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './MarkdownEditor.css';
import { parseMarkdown } from './markdownParser';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHtmlFromElements(elements: Array<{ type: string; content: string; level?: number }>): string {
  return elements
    .map((element) => {
      switch (element.type) {
        case 'h1':
          return `<h1>${element.content}</h1>`;
        case 'h2':
          return `<h2>${element.content}</h2>`;
        case 'h3':
          return `<h3>${element.content}</h3>`;
        case 'h4':
          return `<h4>${element.content}</h4>`;
        case 'h5':
          return `<h5>${element.content}</h5>`;
        case 'h6':
          return `<h6>${element.content}</h6>`;
        case 'ul':
          return `<ul><li>${element.content}</li></ul>`;
        case 'ol':
          return `<ol><li>${element.content}</li></ol>`;
        case 'blockquote':
          return `<blockquote>${element.content}</blockquote>`;
        case 'codeblock':
          return `<pre><code>${escapeHtml(element.content)}</code></pre>`;
        case 'hr':
          return '<hr />';
        case 'br':
          return '<br />';
        case 'p':
        default:
          return `<p>${element.content}</p>`;
      }
    })
    .join('');
}

function escapeBackticks(text: string): string {
  return text.replace(/`/g, '\\`');
}

function serializeInlineContent(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }
  if (!(node instanceof HTMLElement)) {
    return '';
  }

  const tag = node.tagName.toLowerCase();
  const childrenText = Array.from(node.childNodes).map(serializeInlineContent).join('');

  switch (tag) {
    case 'strong':
    case 'b':
      return `**${childrenText}**`;
    case 'em':
    case 'i':
      return `*${childrenText}*`;
    case 'code':
      return `\`${escapeBackticks(childrenText)}\``;
    case 'a': {
      const href = node.getAttribute('href') ?? '';
      return `[${childrenText}](${href})`;
    }
    case 'br':
      return '\n';
    default:
      return childrenText;
  }
}

function serializeBlock(node: ChildNode): string[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    return text.trim() ? [text] : [''];
  }
  if (!(node instanceof HTMLElement)) {
    return [];
  }

  const tag = node.tagName.toLowerCase();

  switch (tag) {
    case 'h1':
      return [`# ${serializeInlineContent(node)}`];
    case 'h2':
      return [`## ${serializeInlineContent(node)}`];
    case 'h3':
      return [`### ${serializeInlineContent(node)}`];
    case 'h4':
      return [`#### ${serializeInlineContent(node)}`];
    case 'h5':
      return [`##### ${serializeInlineContent(node)}`];
    case 'h6':
      return [`###### ${serializeInlineContent(node)}`];
    case 'blockquote': {
      const lines = serializeInlineContent(node).split('\n');
      return lines.map((line) => `> ${line}`);
    }
    case 'pre': {
      const code = node.textContent ?? '';
      return ['```', code.replace(/\n$/, ''), '```'];
    }
    case 'ul': {
      const items = Array.from(node.querySelectorAll(':scope > li')).map(
        (li) => `- ${serializeInlineContent(li)}`
      );
      return items.length ? items : ['- '];
    }
    case 'ol': {
      const items = Array.from(node.querySelectorAll(':scope > li')).map(
        (li, index) => `${index + 1}. ${serializeInlineContent(li)}`
      );
      return items.length ? items : ['1. '];
    }
    case 'hr':
      return ['---'];
    case 'br':
      return [''];
    case 'p':
    case 'div': {
      const text = serializeInlineContent(node);
      return [text];
    }
    default: {
      const text = serializeInlineContent(node);
      return [text];
    }
  }
}

function serializeMarkdownFromDom(root: HTMLElement): string {
  const blocks = Array.from(root.childNodes).flatMap(serializeBlock);
  if (blocks.every((block) => block.trim() === '')) {
    return '';
  }
  return blocks.join('\n');
}

function getCaretOffset(root: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return 0;
  }
  const range = selection.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
}

function setCaretOffset(root: HTMLElement, offset: number) {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  let currentOffset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();

  while (node) {
    const textLength = node.textContent?.length ?? 0;
    if (currentOffset + textLength >= offset) {
      const range = document.createRange();
      range.setStart(node, Math.max(0, offset - currentOffset));
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    currentOffset += textLength;
    node = walker.nextNode();
  }

  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function insertTextAtCursor(text: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    if (markdown.trim() === '') {
      return '';
    }
    return renderHtmlFromElements(parseMarkdown(markdown));
  }, [markdown]);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    if (editor.innerHTML === html) {
      return;
    }
    const isFocused = document.activeElement === editor;
    const caretOffset = isFocused ? getCaretOffset(editor) : null;
    editor.innerHTML = html;
    if (isFocused && caretOffset !== null) {
      setCaretOffset(editor, Math.min(caretOffset, editor.textContent?.length ?? 0));
    }
  }, [html]);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const newMarkdown = serializeMarkdownFromDom(editor);
    setMarkdown((prev) => (prev === newMarkdown ? prev : newMarkdown));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    // Allow Tab key to insert tab character
    if (e.key === 'Tab') {
      e.preventDefault();
      insertTextAtCursor('  ');
      handleInput();
    }
  }, [handleInput]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (text) {
      insertTextAtCursor(text);
      handleInput();
    }
  }, [handleInput]);

  const handleSave = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  return (
    <div className="markdown-editor">
      <header className="editor-header">
        <h1>Markdown WYSIWYG Editor</h1>
        <button onClick={handleSave} className="save-button">
          Save Markdown
        </button>
      </header>

      <div className="editor-container">
        <div className="editor-surface">
          <div
            ref={editorRef}
            className="markdown-surface"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            data-placeholder="Type your markdown here..."
            spellCheck={false}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
        </div>
      </div>
    </div>
  );
}
