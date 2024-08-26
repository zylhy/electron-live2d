import { uIOhook, UiohookKey } from 'uiohook-napi';
const keyCodeArr = Object.entries(UiohookKey).map(n => {
    return {
        keyCode: n[1],
        key: n[0]
    }
})
// 定义一个监听类
export default class InputMonitor {
    keydownCallback = null
    keyupCallback = null
    mousemoveCallback = null
    mousedownCallback = null
    mouseupCallback = null
    constructor(option) {
        this.keydownCallback = option.keydownCallback || null
        this.keyupCallback = option.keyupCallback || null
        this.mousemoveCallback = option.mousemoveCallback || null
        this.mousedownCallback = option.mousedownCallback || null
        this.mouseupCallback = option.mouseupCallback || null
        this.start()
    }
    //   监听键盘事件
    listenerKeyboardEvent() {
        uIOhook.on('keydown', (e) => {
            this.__resKey(e, this.keydownCallback)
        })

        uIOhook.on('keyup', (e) => {
            this.__resKey(e, this.keyupCallback)
        })
    }

    //   监听鼠标移动，主要用于live2d 的跟随
    listenerMouseEvent() {
        uIOhook.on('mousedown', (e) => {
            this.mousedownCallback && this.mousedownCallback({ x: e.x, y: e.y })
        })

        uIOhook.on('mousemove', (e) => {
            this.mousemoveCallback && this.mousemoveCallback({ x: e.x, y: e.y })
        })
        uIOhook.on('mouseup', (e) => {
            this.mouseupCallback && this.mouseupCallback({ x: e.x, y: e.y })
        })
    }
    // 开始
    start() {
        this.listenerKeyboardEvent()
        this.listenerMouseEvent()
        uIOhook.start()
    }
    // 关闭
    close() {
        uIOhook.stop()
    }

    __resKey(e, callback) {
        // 不响应组合键
        // if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
        //     console.log(e) 
        // }
        let keyObj = keyCodeArr.find(n => n.keyCode == e.keycode)
        callback && callback(keyObj.key)
    }
}

