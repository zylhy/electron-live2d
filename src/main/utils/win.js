
import { shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { uIOhook, UiohookKey } from 'uiohook-napi';
import { saveConfig, readConfig, getUserScreenInfo } from './index'
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
        this.width = width || 400;
        this.height = height || 400;
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
        // 窗口记忆，先判断是否在窗口里面
        let winX = undefined;
        let winY = undefined;
        this.screenInfo = getUserScreenInfo();
        if ( this.__readPosition().live2dX >= 0
            && this.__readPosition().live2dX <= this.screenInfo.width - this.width
            && this.__readPosition().live2dY >= 0
            && this.__readPosition().live2dY <= this.screenInfo.height - this.height
        ) {
            winX = this.__readPosition().live2dX
            winY = this.__readPosition().live2dY
        }
        console.log(this.__readPosition().live2dX, this.__readPosition().live2dY, this.width, this.height)
        console.log(this.__readPosition().live2dX >= 0
            && this.__readPosition().live2dX <= this.screenInfo.width - this.width
            && this.__readPosition().live2dY >= 0
            && this.__readPosition().live2dY <= this.screenInfo.height - this.height)

        this.win = new BrowserWindow({
            x: winX,
            y: winY,
            width: this.width,
            height: this.height,
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
            // 默认忽略鼠标
            this.win.setIgnoreMouseEvents(true, { forward: true })
        })
        this.win.on('close', () => {
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
            this.win.loadFile(join(__dirname, '../renderer/index.html'))
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
                this.screenInfo = getUserScreenInfo()
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