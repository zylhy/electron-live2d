import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { live2dWinManager } from './utils/win'
import createTray from './utils/tray.js';
import { recognizeDigits } from './utils/qcr.js'
let appWin = null;
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  appWin = new live2dWinManager()
  createTray()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) appWin = new live2dWinManager()
  })



})
ipcMain.handle('ocr:getDigits', async (event, region) => {
  try {
    const digits = await recognizeDigits(region);
    return digits;
  } catch (err) {
    console.error('OCR 出错:', err);
    return '';
  }
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

