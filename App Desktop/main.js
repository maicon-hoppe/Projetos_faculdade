const { BrowserWindow, app, ipcMain } = require('electron');
const sqlite = require('sqlite3')
const path = require('path')


async function createWindow()
{
    const win = new BrowserWindow({
        height: 500,
        width: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })

    win.webContents.openDevTools()

    await win.loadFile("renderer/index.html")
}

app.whenReady()
    .then(() => createWindow())


let db = new sqlite.Database("livros.sqlite3")

ipcMain.handle("db", (_, query) =>
{
    function request()
    {
        let dados = new Promise((resolve, reject) =>
        {
            db.all(query, (err, rows) =>
            {
                if (err) { reject(err) }
                resolve(rows)
            })
        })

        return dados
    }

    return request()
})