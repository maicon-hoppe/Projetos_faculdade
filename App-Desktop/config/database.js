const path = require("path")
const fs = require('fs/promises')
const sqlite = require('sqlite3')
const valores = require('./valores.json')


/* 
* Script para popular o banco de dados
*/


const dbPath = path.join(__dirname, "../", "livros.db")

fs.access(dbPath, fs.constants.F_OK)
.then(() =>
{
    fs.unlink(dbPath)
})
.catch(err =>
{
    return
})
.finally(() =>
{
    const db = new sqlite.Database(dbPath)

    db.serialize(() =>
    {
        db.run(`CREATE TABLE IF NOT EXISTS livros (
                id INTEGER PRIMARY KEY,
                titulo TEXT NOT NULL UNIQUE,
                capa TEXT NOT NULL UNIQUE,
                pdf TEXT NOT NULL UNIQUE,
                autor TEXT NOT NULL
        )`)

        let stmt = db.prepare("INSERT OR IGNORE INTO livros (titulo, capa, pdf, autor) VALUES (?, ?, ?, ?)")
        for (const valor of valores)
        {
            stmt.run(valor.titulo, valor.capa, valor.pdf, valor.autor)
        }
        stmt.finalize()
    })

    db.close()
})