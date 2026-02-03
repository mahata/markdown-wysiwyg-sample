import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MarkdownEditor from './MarkdownEditor';

describe('MarkdownEditor - Typing with ArrowRight', () => {
  it('should place text after bold when typing, then ArrowRight, then typing', async () => {
    render(<MarkdownEditor />);
    const user = userEvent.setup();

    // Get the contenteditable editor
    const editor = screen.getByRole('textbox') as HTMLDivElement;
    
    editor.focus();
    await user.type(editor, '**abc**');
    await user.keyboard('{ArrowRight}');
    await user.type(editor, 'def');

    expect(editor.innerHTML).toBe('<p><strong>abc</strong>def</p>');
  });
});
