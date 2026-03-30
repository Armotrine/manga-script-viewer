const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

function scanDir(dirPath, images, markdowns) {
  for (const name of fs.readdirSync(dirPath)) {
    const ext = path.extname(name).toLowerCase()
    const stem = path.basename(name, ext)
    if (IMAGE_EXTS.has(ext)) {
      images[stem] = path.join(dirPath, name)
    } else if (ext === '.md') {
      markdowns[stem] = path.join(dirPath, name)
    }
  }
}

function buildPairs(folderPath) {
  const images = {}
  const markdowns = {}

  // Scan the selected folder directly
  scanDir(folderPath, images, markdowns)

  // If images or markdowns are missing, also scan one level of subdirectories
  if (Object.keys(images).length === 0 || Object.keys(markdowns).length === 0) {
    for (const name of fs.readdirSync(folderPath)) {
      const subPath = path.join(folderPath, name)
      if (fs.statSync(subPath).isDirectory()) {
        scanDir(subPath, images, markdowns)
      }
    }
  }

  const allStems = Array.from(new Set([...Object.keys(images), ...Object.keys(markdowns)]))
  allStems.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

  return allStems.map(stem => ({
    stem,
    imagePath: images[stem] || null,
    markdownPath: markdowns[stem] || null,
  }))
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Manga Script Viewer',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('open-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: '选择包含图片和翻译文件的文件夹',
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('get-pairs', (event, folderPath) => {
  try {
    return buildPairs(folderPath)
  } catch (err) {
    console.error('Error building pairs:', err)
    return []
  }
})

ipcMain.handle('read-markdown', (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
})

ipcMain.handle('get-image-url', (event, filePath) => {
  if (!filePath) return null
  // Encode path for file:// URL (handle spaces and special chars)
  return 'file://' + filePath.split('/').map(seg => encodeURIComponent(seg)).join('/')
})
