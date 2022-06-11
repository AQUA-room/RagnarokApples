const { app, BrowserWindow } = require('electron')

/**
 * ウィンドウを作成する
 */
 const createWindow = () => {
    return new Promise( async (resolve, reject) => {
        // ウィンドウを新たに開く
        const win = new BrowserWindow({
            width: 1042,
            minWidth: 1024,
            height: 810,
            minHeight: 768,
            icon: __dirname + '/app.png',
            webPreferences:{
                nodeIntegration:true
            },
            show: false
        })
        win.once('ready-to-show', () => {
            // アスペクト比修正の挙動を隠すために遅延させる
            setTimeout(() => {
                win.show()
                resolve(win)
            }, 2000);
        })
        win.loadURL('file://' + app.getPath('userData') + '/render.asar/index.html') // asarの中のアプリを開く
    })

}

/**
 * ダウンロード中のスカッシュウィンドウ表示
 * @returns window
 */
const createSplash = () => {
    return new Promise( async (resolve, reject) => {
        const splash = new BrowserWindow({
            width: 300,
            height: 300,
            icon: __dirname + '/app.png',
            webPreferences:{
                nodeIntegration:true
            },
            frame: false ,
            titleBarStyle: 'hidden',
            resizable: false,
            show: false
        })
        splash.once('ready-to-show', () => {
            splash.show()
            resolve(splash)
        })
        splash.loadURL('file://' + __dirname + '/loading.html')
        // Mac 信号機ボタンを非表示
        if (process.platform === 'darwin') splash.setWindowButtonVisibility(false)
    })
}

exports.createWindow = createWindow
exports.createSplash = createSplash