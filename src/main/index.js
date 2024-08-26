import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import InputMonitor from '../utils/uiohook'

let appWin = null;
let appFocus = false;
let mouseDown = false
let appPosition = [0, 0]
let screenInfo = null
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    transparent: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    //窗口置顶
    // mainWindow.setAlwaysOnTop(true)
    //默认忽略鼠标
    // mainWindow.setIgnoreMouseEvents(true, { forward: true })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  appWin = mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('ignoreMouse', (e, payLoad) => {
    if (!appWin) return
    if (payLoad) {
      appWin.setIgnoreMouseEvents(payLoad, { forward: payLoad })
    } else {
      appWin.setIgnoreMouseEvents(false)
    }
  })
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  appWin.on('blur', () => appFocus = false)
  appWin.on('focus', () => appFocus = true)

  // 监听全局键盘与鼠标事件
  new InputMonitor({
    keydownCallback: (e) => {
      // console.log(`down${e}`);
      // 获取当前活动的窗口
      // const activeWindow = BrowserWindow.getFocusedWindow();
      if (activeWindow) {
        // 向渲染进程发送消息
        // activeWindow.webContents.send('key-down', e);
      }


    },
    keyupCallback: (e) => {
      // console.log(`up${e}`)
    },
    mousedownCallback: (e) => {
      mouseDown = true
      if (appFocus) {
        const displays = screen.getAllDisplays();
        // 计算所有屏幕的总宽度和高度
        let totalWidth = 0;
        let totalHeight = 0;

        displays.forEach(display => {
          totalWidth += display.workAreaSize.width;
          totalHeight = Math.max(totalHeight, display.workAreaSize.height);
        });
        screenInfo = {
          width: totalWidth,
          height: totalHeight
        }
        console.log(screenInfo)

        let position = appWin.getPosition()
        appPosition = [e.x - position[0], e.y - position[1]]
      }
    },
    mousemoveCallback: (e) => {
      // console.log(e,'move')
      // 拖动处理
      if (appFocus && mouseDown) {
        let { width, height } = screenInfo
        let appSize = appWin.getSize()

        let x = e.x - appPosition[0]
        let y = e.y - appPosition[1]
        if (x + appSize[0] > width) x = width - appSize[0]
        if (y + appSize[1] > height) y = height - appSize[1]
        if (x < 0) x = 0
        if (y < 0) y = 0
        appWin.setPosition(x, y)
      }

    },
    mouseupCallback: (e) => {
      mouseDown = false

    },

  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


