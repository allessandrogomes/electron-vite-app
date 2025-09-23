import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

export interface Bridge {
  updateMessage: (callback: (event: IpcRendererEvent, msg: string) => void) => void;
}

const bridge: Bridge = {
  updateMessage: (callback) => ipcRenderer.on("updateMessage", callback)
};

contextBridge.exposeInMainWorld("bridge", bridge);
