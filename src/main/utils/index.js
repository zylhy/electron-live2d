const fs = require('fs');
import { screen } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
let configPath = is.dev ? join(process.cwd(), 'config/app.properties') : join(process.cwd(), 'resources/config/app.properties')

// 写入配置文件
export function saveConfig(config) {
    let oldConfig = readConfig()
    let newConfig = { ...oldConfig, ...config }
    console.log(newConfig)
    fs.writeFileSync(configPath, JSON.stringify(newConfig));
}
// 加载配置文件
export function readConfig() {
    try {
        const data = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}


//获取用户屏幕信息

export function getUserScreenInfo() {
    const displays = screen.getAllDisplays();
    // 计算所有屏幕的总宽度和高度
    let totalWidth = 0;
    let totalHeight = 0;
    displays.forEach(display => {
        totalWidth += display.workAreaSize.width;
        totalHeight = Math.max(totalHeight, display.workAreaSize.height);
    });
    return {
        width: totalWidth,
        height: totalHeight
    }
}