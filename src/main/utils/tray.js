import { Tray, Menu, nativeImage } from 'electron'
export default function createTray() {
const icon = nativeImage.createFromPath('../../../build/icon.ico')

    let tray = new Tray(icon)
    tray.setToolTip("cat")

}