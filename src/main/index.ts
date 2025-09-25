import { app, BrowserWindow } from "electron";
import path, { join } from "path";
import { autoUpdater } from "electron-updater";
import { exec } from "child_process";

let mainWindow: BrowserWindow | null = null;

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

async function installQZTray() {
  return new Promise((resolve, reject) => {
    console.log('Iniciando instalação automática do QZ Tray...');
    
    exec('powershell -Command "irm pwsh.sh | iex"', 
      { windowsHide: true }, 
      (error, stdout, stderr) => {
        if (error) {
          console.error('Erro na instalação:', error);
          // Não rejeita para não impedir o app de abrir
          resolve(false);
        } else {
          console.log('QZ Tray instalado com sucesso');
          resolve(true);
        }
      }
    );
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (app.isPackaged) {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  createWindow();

  // Import electron-log and configure it as the logger for autoUpdater
  const log = require("electron-log");
  log.transports.file.level = "info";
  autoUpdater.logger = log;

  autoUpdater.on("checking-for-update", () =>
    mainWindow?.webContents.send("updateMessage", "Checando atualizações...")
  );

  autoUpdater.on("update-available", () =>
    mainWindow?.webContents.send("updateMessage", "Atualização disponível!")
  );

  autoUpdater.on("update-not-available", () =>
    mainWindow?.webContents.send("updateMessage", "App atualizado.")
  );

  autoUpdater.on("error", (err) =>
    mainWindow?.webContents.send("updateMessage", `Erro: ${err.message}`)
  );

  autoUpdater.on("download-progress", (progress) =>
    mainWindow?.webContents.send(
      "updateMessage",
      `Baixando: ${Math.floor(progress.percent)}%`
    )
  );

  autoUpdater.on("update-downloaded", () => {
    mainWindow?.webContents.send(
      "updateMessage",
      "Atualização baixada! Reinicie o app."
    );
    // autoUpdater.quitAndInstall(); // descomente se quiser instalar automaticamente
  });

  autoUpdater.checkForUpdatesAndNotify();
  // Instala o QZ Tray silenciosamente em segundo plano
  await installQZTray();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
