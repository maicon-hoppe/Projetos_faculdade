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
                getTemplate("Livro.html")
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
function bookSection(autor, bookArray)
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
    styleScrollButtonL.display = "none"

    scrollButtonR.innerHTML = `
    <img src="assets/icons/arrow-next.png" alt="próximo">
    `
    styleScrollButtonR.display = bookArray.length > 3 ? "initial" : "none"  // Mudaar o 3

    scrollButtonR.addEventListener('click', () => books.scrollLeft += 200)
    scrollButtonL.addEventListener('click', () => books.scrollLeft -= 200)

    books.addEventListener('scroll', () => 
    {
        let isScrollStart = books.scrollLeft === 0
        styleScrollButtonL.display = isScrollStart ? "none" : "initial"

        let isMaxScroll = books.scrollLeft === books.scrollWidth - books.clientWidth
        styleScrollButtonR.display = isMaxScroll ? "none" : "initial"
        
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
    let link = element.shadowRoot.querySelector('a')
    link.setAttribute('href', element.dataset.page)

    localStorage.setItem('pdf', element.dataset.pdf)
}

/*
* Execução do programa
*/
(async () =>
{
    const listaAutores = await main.asyncCall('db', 'SELECT DISTINCT autor FROM livros')

    for (const autores of listaAutores)
    {
        let autor = autores['autor']
        let book = await main.asyncCall('db', `SELECT * FROM livros WHERE autor='${autor}'`)

        bookSection(autor, book)
    }

    const addBooksDialog = document.querySelector('#add-book-dialog')

    const addBooksButton = document.querySelector('header > button')
    addBooksButton.addEventListener('click', () => addBooksDialog.showModal())

    const addBooksCover = document.querySelector("frame-livro[data-page='#']")
    addBooksCover.style.order = 999
    addBooksCover.addEventListener('click', () => addBooksDialog.showModal())

    const closeAddBooks = document.querySelector("#close")
    const cancelAddBooks = document.querySelector('#cancel')
    closeAddBooks.addEventListener('click', () => addBooksDialog.close())
    cancelAddBooks.addEventListener('click', () => addBooksDialog.close())


    const addBooksTitle = document.querySelector("dialog input[type='text']")
    const addBooksPdf = document.querySelector("dialog input[type='file']")

    const addBooksConfirm = document.querySelector("#confirm")
    addBooksConfirm.addEventListener('click', () =>
    {
        if (addBooksTitle.value && addBooksPdf.files[0] )
        {
            main.send('insertBooks', addBooksTitle.value, addBooksPdf.files[0].path)
        }
        else
        {
            console.log('Não'); // TO DO
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