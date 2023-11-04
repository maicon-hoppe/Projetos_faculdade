const sqlite = require('sqlite3')
const valores = require('./valores.json')

/* 
* Script para popular o banco de dados
*/

const db = new sqlite.Database('livros.sqlite3')

db.serialize(() =>
{
    db.run(`CREATE TABLE IF NOT EXISTS livros (
            id INTEGER PRIMARY KEY,
            titulo TEXT NOT NULL UNIQUE,
            capa TEXT NOT NULL UNIQUE,
            pdf TEXT NOT NULL UNIQUE,
            autor TEXT NOT NULL
    )`)

    let stmt = db.prepare("INSERT INTO livros (titulo, capa, pdf, autor) VALUES (?, ?, ?, ?)")
    for (const valor of valores)
    {
        stmt.run(valor.titulo, valor.capa, valor.pdf, valor.autor)
    }
    stmt.finalize()

})

db.close()