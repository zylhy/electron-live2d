const fs = require('fs');
import { join } from 'path'
let configPath = join(__dirname, '../live2d.config')

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
