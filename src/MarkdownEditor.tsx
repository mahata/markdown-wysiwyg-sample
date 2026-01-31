import { useState, useRef, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { parseMarkdown } from './markdownParser';
import './MarkdownEditor.css';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMarkdown(value);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Tab key to insert tab character
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = markdown.substring(0, start) + '  ' + markdown.substring(end);
      setMarkdown(newValue);
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }, [markdown]);

  const handleSave = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  const parsedElements = parseMarkdown(markdown);

  return (
    <div className="markdown-editor">
      <header className="editor-header">
        <h1>Markdown WYSIWYG Editor</h1>
        <button onClick={handleSave} className="save-button">
          Save Markdown
        </button>
      </header>
      
      <div className="editor-container">
        <div className="editor-pane">
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your markdown here..."
            className="markdown-input"
            spellCheck="false"
          />
        </div>
        
        <div className="preview-pane">
          <div className="markdown-preview">
            {parsedElements.map((element, index) => {
              const key = `${element.type}-${index}`;
              
              switch (element.type) {
                case 'h1':
                  return <h1 key={key} dangerouslySetInnerHTML={{ __html: element.content }} />;
                case 'h2':
                  return <h2 key={key} dangerouslySetInnerHTML={{ __html: element.content }} />;
                case 'h3':
                  return <h3 key={key} dangerouslySetInnerHTML={{ __html: element.content }} />;
                case 'h4':
                  return <h4 key={key} dangerouslySetInnerHTML={{ __html: element.content }} />;
                case 'h5':
                  return <h5 key={key} dangerouslySetInnerHTML={{ __html: element.content }} />;
                case 'h6':
                  return <h6 key={key} dangerouslySetInnerHTML={{ __html: element.content }} />;
                case 'ul':
                  return (
                    <ul key={key}>
                      <li dangerouslySetInnerHTML={{ __html: element.content }} />
                    </ul>
                  );
                case 'ol':
                  return (
                    <ol key={key}>
                      <li dangerouslySetInnerHTML={{ __html: element.content }} />
                    </ol>
                  );
                case 'blockquote':
                  return <blockquote key={key} dangerouslySetInnerHTML={{ __html: element.content }} />;
                case 'codeblock':
                  return (
                    <pre key={key}>
                      <code>{element.content}</code>
                    </pre>
                  );
                case 'hr':
                  return <hr key={key} />;
                case 'br':
                  return <br key={key} />;
                case 'p':
                default:
                  return <p key={key} dangerouslySetInnerHTML={{ __html: element.content }} />;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
