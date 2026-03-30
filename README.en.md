# Manga Script Viewer

A desktop tool for viewing manga images and their translation documents side by side.

## Features

- Displays manga images on the left and the corresponding Markdown translation on the right
- Browse files in sequential order by filename (`i-001` → `i-002` → `i-003`)
- Navigate with keyboard shortcuts, buttons, or jump directly to any page
- Remembers the last opened folder and page — restores automatically on next launch

## File Naming

Images and Markdown files must share the **same filename prefix**. They can be placed in the **same folder** or in **separate subfolders**:

```
# Same folder
my-folder/
├── i-001.jpg
├── i-001.md
├── i-002.jpg
├── i-002.md
└── ...

# Separate subfolders
my-folder/
├── image/
│   ├── i-001.jpg
│   └── i-002.jpg
└── script/
    ├── i-001.md
    └── i-002.md
```

Select `my-folder/` and the app will automatically detect and pair the files.

Supported image formats: `.jpg` `.jpeg` `.png` `.webp` `.gif`

> If an image has no matching `.md` file (or vice versa), the page still displays normally with a placeholder on the missing side.

## Usage

### Run in development mode

```bash
# Install dependencies (first time only)
npm install

# Start the app
npm start
```

Once started, click the **Open Folder** button in the top-left corner and select the folder containing your images and translation files.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` / `↓` / `j` | Next page |
| `←` / `↑` / `k` | Previous page |
| `Home` | Jump to first page |
| `End` | Jump to last page |

### Jump to Page

Click the page number in the navigation bar, type the target page number, and press `Enter` to jump. Press `Esc` to cancel.

## Requirements

- Node.js
- Electron 28

## License

MIT
