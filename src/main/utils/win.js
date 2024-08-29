
import { shell, BrowserWindow, screen, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { uIOhook, UiohookKey } from 'uiohook-napi';
import { saveConfig, readConfig } from './index'
const keyCodeArr = Object.entries(UiohookKey).map(n => {
    return {
        keyCode: n[1],
        key: n[0]
    }
})

class winBase {
    win = null;
    width = null;
    height = null;
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

}

export class live2dWinManager extends winBase {
    focus = false; //是否聚焦
    mouseDown = false; //鼠标是否按下
    mousePointDis = [0, 0]; //鼠标距离窗口顶点距离
    screenInfo = {}; //屏幕信息

    constructor(width, height) {
        super(width, height)
        uIOhook.start()
        this.createWindow()
        this.monitorKeyboard()
        this.monitorMouse()
    }
    createWindow() {
        let x = this.__readPosition().live2dX || undefined
        let y = this.__readPosition().live2dY || undefined
        this.win = new BrowserWindow({
            x,
            y,
            width: this.width || 400,
            height: this.height || 400,
            frame: false,
            autoHideMenuBar: true,
            transparent: true,
            resizable: false,
            alwaysOnTop: false,
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false
            }
        })
        this.win.on('ready-to-show', () => {
            this.win.show()
            //窗口置顶
            // mainWindow.setAlwaysOnTop(true)
            // 默认忽略鼠标
            this.win.setIgnoreMouseEvents(true, { forward: true })
        })
        this.win.on('close',()=>{
            this.__writePosition()
        })
        this.win.on('closed', () => {
            this.win = null
            uIOhook.stop()
        })
        this.win.on('blur', () => this.focus = false)
        this.win.on('focus', () => this.focus = true)
        this.win.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url)
            return { action: 'deny' }
        })
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            this.win.loadURL(process.env['ELECTRON_RENDERER_URL'])
        } else {
            this.win.loadFile(join(__dirname, '../../renderer/index.html'))
        }
        ipcMain.on('ignoreMouse', (e, payLoad) => {
            if (payLoad) {
                this.win.setIgnoreMouseEvents(payLoad, { forward: payLoad })
            } else {
                this.win.setIgnoreMouseEvents(false)
            }
        })
    }
    monitorKeyboard() {

        uIOhook.on('keydown', (e) => {
            this.__resKey(e, 'keydown')
        })

        uIOhook.on('keyup', (e) => {
            this.__resKey(e, 'keyup')
        })
    }


    monitorMouse() {
        uIOhook.on('mousedown', (e) => {
            this.mouseDown = true
            if (this.focus) {
                const displays = screen.getAllDisplays();
                // 计算所有屏幕的总宽度和高度
                let totalWidth = 0;
                let totalHeight = 0;

                displays.forEach(display => {
                    totalWidth += display.workAreaSize.width;
                    totalHeight = Math.max(totalHeight, display.workAreaSize.height);
                });
                this.screenInfo = {
                    width: totalWidth,
                    height: totalHeight
                }
                let position = this.win.getPosition()
                this.mousePointDis = [e.x - position[0], e.y - position[1]]
            }
        })

        uIOhook.on('mousemove', (e) => {
            // 拖动处理
            if (this.focus && this.mouseDown) {
                let { width, height } = this.screenInfo
                let appSize = this.win.getSize()
                let x = e.x - this.mousePointDis[0]
                let y = e.y - this.mousePointDis[1]
                if (x + appSize[0] > width) x = width - appSize[0]
                if (y + appSize[1] > height) y = height - appSize[1]
                if (x < 0) x = 0
                if (y < 0) y = 0
                this.win.setPosition(x, y)
                // writePosition({ x, y });
            }
        })
        uIOhook.on('mouseup', (e) => {
            this.mouseDown = false

        })
    }
    __resKey(e, type) {
        // 不响应组合键
        // if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
        //     console.log(e) 
        // }
        let keyObj = keyCodeArr.find(n => n.keyCode == e.keycode)
        this.win.webContents.send(type, keyObj.key)
    }
    __writePosition() {
        let position = this.win.getPosition()
        saveConfig({
            live2dX: position[0],
            live2dY: position[1]
        })
    }
    __readPosition() {
        return readConfig()
    }
} 