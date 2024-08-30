const fs = require('fs');
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
let configPath = is.dev? join(process.cwd(), 'config/app.properties'):join(process.cwd(), 'resources/config/app.properties')

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
