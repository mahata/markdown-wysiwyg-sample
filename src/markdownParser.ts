/**
 * Parse markdown text into styled HTML elements while preserving the markdown syntax
 * This parser handles inline styles within a line
 */
export function parseMarkdownLine(line: string): string {
  let processed = line;
  
  // Escape HTML to prevent XSS
  processed = processed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Parse inline code first (to avoid parsing markdown inside code)
  processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Parse bold+italic ***text***
  processed = processed.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  
  // Parse bold **text**
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Parse italic *text*
  processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Parse links [text](url)
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return processed;
}

/**
 * Parse a full markdown document into structured elements
 */
export function parseMarkdown(text: string): Array<{ type: string; content: string; level?: number }> {
  const lines = text.split('\n');
  const elements: Array<{ type: string; content: string; level?: number }> = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push({
          type: 'codeblock',
          content: codeBlockContent.join('\n'),
          level: codeBlockLanguage ? 1 : 0
        });
        codeBlockContent = [];
        codeBlockLanguage = '';
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLanguage = line.substring(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Headers
    if (line.startsWith('# ')) {
      elements.push({ type: 'h1', content: parseMarkdownLine(line.substring(2)), level: 1 });
    } else if (line.startsWith('## ')) {
      elements.push({ type: 'h2', content: parseMarkdownLine(line.substring(3)), level: 2 });
    } else if (line.startsWith('### ')) {
      elements.push({ type: 'h3', content: parseMarkdownLine(line.substring(4)), level: 3 });
    } else if (line.startsWith('#### ')) {
      elements.push({ type: 'h4', content: parseMarkdownLine(line.substring(5)), level: 4 });
    } else if (line.startsWith('##### ')) {
      elements.push({ type: 'h5', content: parseMarkdownLine(line.substring(6)), level: 5 });
    } else if (line.startsWith('###### ')) {
      elements.push({ type: 'h6', content: parseMarkdownLine(line.substring(7)), level: 6 });
    }
    // Unordered list
    else if (line.match(/^[-*+]\s/)) {
      elements.push({ type: 'ul', content: parseMarkdownLine(line.substring(2)) });
    }
    // Ordered list
    else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^\d+\.\s/);
      if (match) {
        elements.push({ type: 'ol', content: parseMarkdownLine(line.substring(match[0].length)) });
      }
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      elements.push({ type: 'blockquote', content: parseMarkdownLine(line.substring(2)) });
    }
    // Horizontal rule
    else if (line.match(/^(---|\*\*\*|___)$/)) {
      elements.push({ type: 'hr', content: '' });
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push({ type: 'br', content: '' });
    }
    // Regular paragraph
    else {
      elements.push({ type: 'p', content: parseMarkdownLine(line) });
    }
  }
  
  return elements;
}
