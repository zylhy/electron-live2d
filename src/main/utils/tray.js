import {  Tray, Menu, nativeImage } from 'electron'
const icon = nativeImage.createFromPath('../../../build/icon.ico')
export default   function createTray() {
    let tray = new Tray(icon)
tray.setToolTip("cat")

}