// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Settings } from '../renderer/settings';

export type Channels = 'capture-screenshot' |
                         'screenshot-saved' |
                    'screenshot-save-error' |
                              'undo-canvas' |
                              'redo-canvas' |
                              'save-canvas' |
                                 'hide-app' |
                      'start-record-hotkey' |
                       'stop-record-hotkey';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
    putSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('put-settings', settings)
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
export type ElectronHandler = typeof electronHandler;
