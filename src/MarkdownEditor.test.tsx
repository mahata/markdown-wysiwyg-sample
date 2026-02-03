import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import MarkdownEditor from './MarkdownEditor';

describe('MarkdownEditor - Typing with ArrowRight', () => {
  let container: HTMLElement;

  beforeEach(() => {
    const { container: c } = render(<MarkdownEditor />);
    container = c;
  });

  const getEditor = () => {
    const editor = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    if (!editor) throw new Error('Editor not found');
    return editor;
  };

  it('should place text after bold when typing, then ArrowRight, then typing', async () => {
    const editor = getEditor();
    const user = userEvent.setup();

    editor.focus();
    await user.type(editor, '**abc**');
    await user.keyboard('{ArrowRight}');
    await user.type(editor, 'def');

    expect(editor.innerHTML).toBe('<p><strong>abc</strong>def</p>');
  });
});
