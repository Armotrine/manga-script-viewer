const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openFolder: () => ipcRenderer.invoke('open-folder'),
  getPairs: (folderPath) => ipcRenderer.invoke('get-pairs', folderPath),
  readMarkdown: (filePath) => ipcRenderer.invoke('read-markdown', filePath),
  getImageUrl: (filePath) => ipcRenderer.invoke('get-image-url', filePath),
})
