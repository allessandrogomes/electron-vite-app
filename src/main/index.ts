import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // ajusta para o preload
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (app.isPackaged) {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    mainWindow.loadURL('http://localhost:5173') // porta padrão do Vite dev server
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Atualizações automáticas
app.on('ready', () => {
  createWindow()

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

// Exemplo d
