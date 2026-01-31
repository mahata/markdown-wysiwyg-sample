# Markdown WYSIWYG Editor

A standalone React application that provides a WYSIWYG (What You See Is What You Get) markdown editor, similar to Obsidian. Write markdown text and see it styled in real-time while preserving the original markdown syntax.

## Features

- **Real-time Preview**: Text is styled immediately as you type markdown syntax
- **Preserves Markdown**: The original markdown is maintained and can be saved
- **Split-pane Interface**: Left side for editing, right side for live preview
- **No External Libraries**: Custom markdown parser implementation
- **Comprehensive Markdown Support**:
  - Headers (h1-h6)
  - Bold, italic, and combined formatting
  - Inline code and code blocks
  - Unordered and ordered lists
  - Blockquotes
  - Links with target="_blank"
  - Horizontal rules
- **Save Functionality**: Download your markdown as a `.md` file
- **Clean UI**: Responsive design with dark mode support

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build:

```bash
npm run preview
```

### Testing

Run the test suite:

```bash
npm test
```

### Linting

Run ESLint:

```bash
npm run lint
```

## Tech Stack

- **React 18**: UI framework
- **Vite 5**: Build tool and dev server
- **TypeScript 5**: Type safety
- **Vitest**: Testing framework
- **ESLint**: Code linting

## Project Structure

```
.
├── src/
│   ├── App.tsx              # Main application component
│   ├── MarkdownEditor.tsx   # WYSIWYG editor component
│   ├── MarkdownEditor.css   # Editor styling
│   ├── markdownParser.ts    # Custom markdown parser
│   ├── markdownParser.test.ts # Parser unit tests
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## How It Works

The editor uses a custom markdown parser that processes the text in real-time:

1. User types markdown text in the left pane
2. Parser converts markdown to HTML elements
3. Right pane displays the styled preview
4. Original markdown is preserved for saving

The parser handles inline styles (bold, italic, code) and block elements (headers, lists, blockquotes, code blocks) while escaping HTML to prevent XSS attacks.

## License

MIT