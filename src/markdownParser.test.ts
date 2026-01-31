import { describe, it, expect } from 'vitest';
import { parseMarkdownLine, parseMarkdown } from './markdownParser';

describe('parseMarkdownLine', () => {
  it('should parse bold text', () => {
    const result = parseMarkdownLine('This is **bold** text');
    expect(result).toBe('This is <strong>bold</strong> text');
  });

  it('should parse italic text', () => {
    const result = parseMarkdownLine('This is *italic* text');
    expect(result).toBe('This is <em>italic</em> text');
  });

  it('should parse bold and italic text', () => {
    const result = parseMarkdownLine('This is ***bold italic*** text');
    expect(result).toBe('This is <strong><em>bold italic</em></strong> text');
  });

  it('should parse inline code', () => {
    const result = parseMarkdownLine('This is `code` text');
    expect(result).toBe('This is <code>code</code> text');
  });

  it('should parse links', () => {
    const result = parseMarkdownLine('This is a [link](https://example.com)');
    expect(result).toBe('This is a <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>');
  });

  it('should escape HTML', () => {
    const result = parseMarkdownLine('<script>alert("xss")</script>');
    expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  it('should handle multiple inline styles', () => {
    const result = parseMarkdownLine('**bold** and *italic* and `code`');
    expect(result).toBe('<strong>bold</strong> and <em>italic</em> and <code>code</code>');
  });
});

describe('parseMarkdown', () => {
  it('should parse headers', () => {
    const result = parseMarkdown('# Header 1\n## Header 2\n### Header 3');
    expect(result).toHaveLength(3);
    expect(result[0].type).toBe('h1');
    expect(result[0].content).toBe('Header 1');
    expect(result[1].type).toBe('h2');
    expect(result[1].content).toBe('Header 2');
    expect(result[2].type).toBe('h3');
    expect(result[2].content).toBe('Header 3');
  });

  it('should parse unordered lists', () => {
    const result = parseMarkdown('- Item 1\n- Item 2');
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('ul');
    expect(result[0].content).toBe('Item 1');
    expect(result[1].type).toBe('ul');
    expect(result[1].content).toBe('Item 2');
  });

  it('should parse ordered lists', () => {
    const result = parseMarkdown('1. Item 1\n2. Item 2');
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('ol');
    expect(result[0].content).toBe('Item 1');
    expect(result[1].type).toBe('ol');
    expect(result[1].content).toBe('Item 2');
  });

  it('should parse blockquotes', () => {
    const result = parseMarkdown('> This is a quote');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('blockquote');
    expect(result[0].content).toBe('This is a quote');
  });

  it('should parse code blocks', () => {
    const result = parseMarkdown('```\nconst x = 1;\nconsole.log(x);\n```');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('codeblock');
    expect(result[0].content).toBe('const x = 1;\nconsole.log(x);');
  });

  it('should parse horizontal rules', () => {
    const result = parseMarkdown('---');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('hr');
  });

  it('should parse paragraphs', () => {
    const result = parseMarkdown('This is a paragraph');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('p');
    expect(result[0].content).toBe('This is a paragraph');
  });

  it('should handle empty lines', () => {
    const result = parseMarkdown('Line 1\n\nLine 2');
    expect(result).toHaveLength(3);
    expect(result[0].type).toBe('p');
    expect(result[1].type).toBe('br');
    expect(result[2].type).toBe('p');
  });

  it('should handle complex markdown', () => {
    const markdown = `# Title
This is a **bold** paragraph with *italic* text.

## Subtitle
- Item 1
- Item 2

> A quote`;

    const result = parseMarkdown(markdown);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].type).toBe('h1');
    expect(result[1].type).toBe('p');
    expect(result[1].content).toContain('<strong>bold</strong>');
    expect(result[1].content).toContain('<em>italic</em>');
  });
});
