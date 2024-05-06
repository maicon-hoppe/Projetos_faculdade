/*
* Aquisição do template para o elemento personalizado
*/
async function getTemplate(path)
{
    let caminho = await fetch(path)
    let templateStr = await caminho.text()


    let html = new DOMParser().parseFromString(templateStr, 'text/html')
    return html.querySelector('head > template')
}

/*
* Definição do elemento personalizado <frame-livro>
*/
customElements.define(
    "frame-livro",
    class FrameLivro extends HTMLElement
    {
        constructor()
        {
            super()
        }
        
        connectedCallback()
        {
            let shadow = this.attachShadow({ mode: "open" })
            
            if ( shadow.isConnected )
            {
                getTemplate("templateLivro.html")
                    .then(opcaoLivroTemplate => 
                    {        
                        let opcaoLivro = opcaoLivroTemplate.content
                        shadow.appendChild(opcaoLivro.cloneNode(true))
                    })
            }
        }
    }
)

/*
* Criação de uma seção com livros de um autor
*/
function bookSection(autor, imagemAutor, bookArray)
{
    const section = document.createElement('section')
    const autorName = document.createElement('h2')
    const booksDiv = document.createElement('div')
    const books = document.createElement('section')
    const scrollButtonL = document.createElement('button')
    const scrollButtonR = document.createElement('button')

    const styleScrollButtonL = scrollButtonL.style
    const styleScrollButtonR = scrollButtonR.style

    autorName.innerText = autor
    autorName.style.backgroundImage = `
        linear-gradient(to right, var(--secundary-green) 25%, transparent),
        url('assets/images/${imagemAutor}')
    `
    section.appendChild(autorName)

    books.setAttribute('class', 'books')

    for ( const book of bookArray )
    {
        let page 
        if ( book['titulo'] === "Adicionar Livro" )
        {
            page = "#"
        }
        else
        {
            page = "pdfViewer.html"
        }

        let html = `
        <frame-livro
            onclick="configLink(this)"
            data-page=${page}
            data-pdf=${book['pdf']}
        >
            <img
                slot="bookCover"
                src=${book['capa']}
                alt=${book['titulo']}
            >
            <p slot="bookName">${book['titulo']}</p>
        </frame-livro>
        `

        books.insertAdjacentHTML('beforeend', html)
    }

    scrollButtonL.innerHTML = `
    <img src="assets/icons/arrow-before.png" alt="próximo">
    `
    styleScrollButtonL.opacity = 0
    styleScrollButtonL.cursor = "default"

    scrollButtonR.innerHTML = `
    <img src="assets/icons/arrow-next.png" alt="próximo">
    `
    styleScrollButtonR.display = bookArray.length <= 3 ? "none" : "initial"
    

    scrollButtonR.addEventListener('click', () => books.scrollLeft += 210)
    scrollButtonL.addEventListener('click', () => books.scrollLeft -= 210)

    books.addEventListener('scroll', () => 
    {
        let isScrollStart = books.scrollLeft === 0
        styleScrollButtonL.opacity = isScrollStart ? 0 : 1
        styleScrollButtonL.cursor = isScrollStart ? "default" : "pointer"

        let isMaxScroll = books.scrollLeft === books.scrollWidth - books.clientWidth
        styleScrollButtonR.opacity = isMaxScroll ? 0 : 1
        styleScrollButtonR.cursor = isMaxScroll ? "default" : "pointer"
    })

    booksDiv.append(scrollButtonL, books, scrollButtonR)
    section.appendChild(booksDiv)
    document.body.appendChild(section)
}

/*
* Define o caminho para página de leitura pdfViewer.html
*/
function configLink(element)
{
    const link = element.shadowRoot.querySelector('a')
    link.setAttribute('href', element.dataset.page)
    
    const autorName = element.lastElementChild.innerText

    localStorage.setItem('pdf', element.dataset.pdf)
    localStorage.setItem('autor', autorName)
}

/*
* Execução do programa
*/
(async () =>
{
    const listaAutores = await main.asyncCall('db', 'SELECT DISTINCT autor FROM livros')
    const listaImagemAutores = await main.asyncCall("getDir", 'renderer/assets/images')
    
    for (const autores of listaAutores)
    {
        const autor = autores['autor']
        const book = await main.asyncCall('db', `SELECT * FROM livros WHERE autor='${autor}'`)

        listaImagemAutores.forEach(imagemAutor =>
        {
            if (imagemAutor.slice(0, 3) === autor.slice(0, 3))
            {
                bookSection(autor, imagemAutor, book)

                const imageIndex = listaImagemAutores.indexOf(imagemAutor)
                listaImagemAutores.splice(imageIndex, 1)
            }
        })
    }

    // Dialog
    const addBooksButton = document.querySelector('header > button')
    const addBooksDialog = document.querySelector('#add-book-dialog')
    addBooksButton.addEventListener('click', () => addBooksDialog.showModal())

    const addBooksCover = document.querySelector("frame-livro[data-page='#']")
    addBooksCover.style.order = 999
    addBooksCover.addEventListener('click', () => addBooksDialog.showModal())


    const addBooksTitle = document.querySelector("dialog input[type='text']")
    const addBooksPdf = document.querySelector("dialog input[type='file']")
    const addBooksPdfLabel = document.querySelector("dialog label[for='input-file']")

    const closeAddBooks = document.querySelector("#close")
    const cancelAddBooks = document.querySelector('#cancel')

    closeAddBooks.addEventListener('click', () =>
    {
        addBooksDialog.close()
        addBooksPdf.value = ""

        addBooksPdfLabel.classList.remove("selected")
        addBooksPdfLabel.innerText = "Enviar Arquivo"
    })

    cancelAddBooks.addEventListener('click', () =>
    {
        addBooksDialog.close()
        addBooksPdf.value = ""

        addBooksPdfLabel.classList.remove("selected")
        addBooksPdfLabel.innerText = "Enviar Arquivo"
    })

    addBooksPdf.addEventListener("change", () =>
    {
        addBooksPdfLabel.classList.add("selected")
        addBooksPdfLabel.innerText = "Arquivo Selecionado"
    })

    const addBooksConfirm = document.querySelector("#confirm")
    addBooksConfirm.addEventListener('click', () =>
    {
        if ( addBooksTitle.value && addBooksPdf.files[0] )
        {
            main.send('insertBooks', addBooksTitle.value, addBooksPdf.files[0].path)
        }
        else
        {
            let count = 0
            const dialogHighlightRing = setInterval(() =>
            {
                addBooksDialog.style.outline =
                addBooksDialog.style.outline === "none"
                ?
                    "2px solid var(--highlight-orange-80-light)"
                :
                    "none"

                if ( count++ === 4 )
                {
                    addBooksDialog.style.outline = "none"
                    clearInterval(dialogHighlightRing)
                }
            },
            100)

            addBooksTitle.focus()
        }
    })

    const customBookSection = addBooksCover.parentElement
    for ( const element of customBookSection.children )
    {
        if ( element.tagName === "FRAME-LIVRO" && element.dataset.page !== "#" )
        {
            const deleteBookButton = document.createElement('button')
            const deleteBookIcon = document.createElement('img')

            deleteBookButton.setAttribute('id', 'deleteButton')
        
            deleteBookIcon.setAttribute('src', 'assets/icons/delete.png')
            deleteBookIcon.setAttribute('alt', 'svg')

            deleteBookButton.appendChild(deleteBookIcon)
            element.shadowRoot.appendChild(deleteBookButton)

            deleteBookButton.addEventListener('click', () =>
            {
                main.send('deleteBooks', element.children[1].textContent)
            })
        }
    }
})()
