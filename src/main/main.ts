/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import os from 'os';
import fs from 'fs';
import { app, GlobalShortcut, BrowserWindow, shell, ipcMain, screen, desktopCapturer, Rectangle, Tray, Menu, dialog, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import icon from '../../assets/icon.svg';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let tray: Tray | null = null;

let mainWindow: BrowserWindow | null = null;

ipcMain.on('hide-app', async (event, arg) => {
  mainWindow?.hide();
});


ipcMain.on('capture-screenshot', async (event, arg) => {
  const screenShotInfo = await captureScreen();
  if (screenShotInfo) {
    const dataURL = screenShotInfo.toDataURL();

    const downloadsFolder = path.join(os.homedir(), 'Downloads');
    const defaultFilePath = path.join(downloadsFolder, `pineshot_${Date.now()}.png`)

    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Notes',
      buttonLabel: 'Save',
      filters: [{ name: 'Pine Notes', extensions: ['png'] }],
      defaultPath: defaultFilePath,
    })

    if (filePath) {
      const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
      fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
          console.error('Error saving the file:', err);
          event.sender.send('screenshot-save-error', 'Failed to save file');
        } else {
          event.sender.send('screenshot-saved', 'File saved successfully');
        }
      });
    }
  } else {
    event.sender.send('screenshot-save-error', 'Failed to save file');
    throw new Error("Failed to capture screenshot");
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')({ showDevTools: false });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    resizable: false,
    skipTaskbar: false,
    transparent: true,
    x: 0,
    y: 400,
    titleBarStyle: 'default', // Change to hidden for prod
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    // Tray Menus
    tray = new Tray(getAssetPath('icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show',
        click: () => {
          mainWindow?.show();
        }
      },
      {
        label: 'Hide',
        click: () => {
          mainWindow?.hide();
        }
      },
      {
        label: 'Quit Pine',
        click: () => {
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Pine');

    // Main window
    //mainWindow.maximize();
    mainWindow.setResizable(false);

    // Hotkeys
    globalShortcut.register('Ctrl+Alt+P', () => {
      if (mainWindow?.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow?.show();
      }
    })

  });

  mainWindow.on('focus', () => {
    globalShortcut.register('Ctrl+Z', () => {
      mainWindow?.webContents.send('undo-canvas')
    })

    globalShortcut.register('Ctrl+Y', () => {
      mainWindow?.webContents.send('redo-canvas')
    })

    globalShortcut.register('Ctrl+S', () => {
      mainWindow?.webContents.send('save-canvas')
    })
  });

  mainWindow.on('blur', () => {
    globalShortcut.unregister('Ctrl+Z');
    globalShortcut.unregister('Ctrl+Y');
    globalShortcut.unregister('Ctrl+S');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */


app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if(!gotTheLock){
  app.quit();
}

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);


app.on('will-quit', () => {
  globalShortcut.unregisterAll();
})

async function captureScreen() {
  const { x, y, width, height } = mainWindow?.getBounds() || { x: 0, y: 0, width: 1280, height: 720 };

  // Capture options for the whole screen
  const options: Electron.SourcesOptions = {
    types: ['screen'],
    thumbnailSize: screen.getPrimaryDisplay().size
  };

  // Get sources
  const sources = await desktopCapturer.getSources(options);
  const primarySource = sources.find(({ display_id }) => display_id === screen.getPrimaryDisplay().id.toString());

  if (!primarySource?.thumbnail) return undefined;

  // Crop the image to the mainWindow
  const cropRect: Rectangle = { x, y, width, height };
  const croppedImage = primarySource.thumbnail.crop(cropRect);

  return croppedImage;
}
