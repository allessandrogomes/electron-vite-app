import { IpcRendererEvent } from "electron";

export interface Bridge {
  updateMessage: (callback: (event: IpcRendererEvent, msg: string) => void) => void;
}

declare global {
  interface Window {
    bridge: Bridge;
  }
}
