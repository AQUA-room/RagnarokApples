// モジュールロード
const { app, Menu, BrowserWindow, dialog } = require('electron')
const { asarDownLoad } = require('./asarDownLoad.js')
const { createWindow, createSplash } = require('./createWindow.js');

/**
 * メインプロセス
 */
const mainProcess = async () => {
    // URLを指定 
    const url = 'https://drive.google.com/uc?id=1mHfOd4seMjFuknv6hB1C55U9kMiw64sN&confirm=t';
    // 出力ファイル名を指定
    const outURL = app.getPath('userData') + '/render.asar'

    const splashWin = await createSplash() // ローディング画面起動
    const download =  await asarDownLoad(url, outURL) // ダウンロード開始
    if (!download) { // 失敗時
        dialog.showErrorBox('Connection Failed','インターネットへの接続が失敗しました。インターネットに接続して、もう一度アプリを起動してください');
    }
    const mainWin = await createWindow() // メインウィンドウ起動
    splashWin.close() //ローディング画面閉じる
}

//------------------------------------
// メニュー
//------------------------------------
// メニューを準備する
const template = Menu.buildFromTemplate([
    {
      label: "アプリ",
      submenu: [
        // { role:'close', label:'ウィンドウを閉じる' }
        { role:'togglefullscreen', label:'全画面切り替え' },
        { role:'quit', label:'アプリを終了' }
      ]
    },
    // {
    //   label: "編集",
    //   submenu: [
    //     { role:'undo',  label:'元に戻す' },
    //     { role:'redo',  label:'やり直す' },
    //     { type:'separator' },
    //     { role:'cut',   label:'切り取り' },
    //     { role:'copy',  label:'コピー' },
    //     { role:'paste', label:'貼り付け' },
    //   ]
    // }
]);

if (app.isPackaged) {//アプリがパッケージングされてる場合
    
    // メニューを適用する
    Menu.setApplicationMenu(template);
}

// 初期化が終了したらウィンドウをを新規に作成する
app.whenReady().then(mainProcess)

// 全てのウィンドウが閉じられた時の処理
app.on('window-all-closed', () => {
    // macOS以外はアプリを終了する
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// アプリがアクティブになった時
//(macOSはDocアイコンがクリックされたとき)
app.on('activate', () => {
    // ウィンドウがすべて閉じられている場合は新しく開く
    if (BrowserWindow.getAllWindows().length === 0) {
        // Macにて信号赤が押されてからアイコンクリックされた時にダウンロードから始める
        createWindow()
    }
})