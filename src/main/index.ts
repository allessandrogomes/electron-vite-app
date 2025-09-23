import { app, BrowserWindow } from "electron";
import { join } from "path";
import { autoUpdater } from "electron-updater";

let mainWindow: BrowserWindow | null = null;

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true
// autoUpdater.setFeedURL({
//   provider: "github",
//   owner: "allessandrogomes",
//   repo: "electron-vite-app"
// });
// autoUpdater.checkForUpdates()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true
    }
  });

  if (app.isPackaged) {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  }
}

app.on("ready", () => {
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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
