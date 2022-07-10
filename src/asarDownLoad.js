import https from 'https'
import originalFS from 'original-fs'
const { get } = https
const { createWriteStream } = originalFS

/**
 * http.get
 * asarのダウンロード・置き換え
 * @param {*} url ダウンロードするファイルのURL
 * @param {*} outURL 出力するファイルのURL
 * @param {*} splash ローディング画面
 */
const asarDownLoad = async (url, outURL, splash) => {

    try {
        return await new Promise((resolve, reject) => {

            const req = get(url, async (res) => {

                console.log(res.statusCode) // 303が返ってくる
                console.log(res.statusMessage)

                // 303だった場合locationを見てそこから取得
                if (res.statusCode === 303) {
                    await asarDownLoad(res.headers.location, outURL, splash) // 再帰
                    resolve(true) //trueを返す
                    return
                }
                // ダウンロードした内容をそのまま、ファイル書き出し。
                let total = 0 // 合計byte数
                let percent = 0 // %
                // データを取得する度に実行される
                res.on("data", (chunk) => {
                    total += chunk.length // これまで読み取ったbyte数
                    const length = res.headers['content-length']
                    if (percent !== parseInt(total / length * 100)) {
                        percent = parseInt(total / length * 100)
                        console.log(`${percent} %`)
                        splash.webContents.send('loadingData', percent)
                    }
                });
                const outFile = createWriteStream(outURL)
                res.pipe(outFile)
                
                // 終わったらファイルストリームをクローズ。
                res.on('end', () => {
                    console.log('end')
                    outFile.close()
                    resolve(true) // trueを返す
                })
            })

            // エラーがあれば扱う。
            req.on('error', (err) => {
                console.log('Error: ', err)
                reject(false) // falseを返す
            })
        })
    } catch (err) { // rejectのfalseをキャッチ
        console.log(err)
        return err // falseを返す
    }

}

const _asarDownLoad = asarDownLoad
export { _asarDownLoad as asarDownLoad }