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

    // await win.loadFile("renderer/index.html")
    await win.loadURL("http://localhost:5500/renderer/index.html")
}

app.whenReady()
    .then(() => createWindow()
)

if (require('electron-squirrel-startup')) app.quit()

const dbPath = path.join(__dirname, "livros.db")
const db = new sqlite.Database(dbPath)

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