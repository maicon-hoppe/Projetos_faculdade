const {
    BrowserWindow,
    ipcMain,
    app,
    Menu
} = require('electron');
const sqlite = require('sqlite3')
const path = require('path')


let win
async function createWindow()
{
    win = new BrowserWindow({
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

Menu.setApplicationMenu(null)

const dbPath = path.join(__dirname, "livros.db")
const db = new sqlite.Database(dbPath)

ipcMain.handle("db", (_, query) =>
{
    function request()
    {
        const dados = new Promise((resolve, reject) =>
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

ipcMain.on('insertBooks', (_, title, file) =>
{
    db.run(`INSERT INTO livros
                (titulo, capa, pdf, autor)
            VALUES
                (?, 'pdfs/capas/capa_per.jpeg', ?, 'Livros adicionados')`,
            title, file
    )

    win.reload()
})

ipcMain.on('deleteBooks', (_, title) =>
{
    db.run(`DELETE FROM livros
            WHERE
                titulo = ?
            AND
                autor = 'Livros adicionados'`,
            title)

    win.reload()
})