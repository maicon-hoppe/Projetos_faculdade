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

    scrollButtonL.innerText = "<"
    styleScrollButtonL.display = "none"
    styleScrollButtonL.position = "absolute"
    styleScrollButtonL.marginTop = "133.5px"

    scrollButtonR.innerText = ">"
    styleScrollButtonR.display = bookArray.length > 3 ? "initial" : "none"  // Mudaar o 3
    styleScrollButtonR.position = "absolute"
    styleScrollButtonR.right = "30px"
    styleScrollButtonR.marginTop = "133.5px"

    scrollButtonR.addEventListener('click', () =>
    {
        // Mudar esse valor
        books.scrollLeft += 200
    })

    scrollButtonL.addEventListener('click', () =>
    {
        // Mudar esse valor
        books.scrollLeft -= 200
    })

    books.addEventListener('scroll', () => 
    {
        let isScrollStart = books.scrollLeft === 0
        styleScrollButtonL.display = isScrollStart ? "none" : "initial"

        let isMaxScroll = books.scrollLeft === books.scrollWidth - books.clientWidth
        styleScrollButtonR.display = isMaxScroll ? "none" : "initial"
        
    })

    books.append(scrollButtonL, scrollButtonR)

    section.appendChild(books)
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

    const addBookDialog = document.querySelector('#add-book-dialog')
    
    const addBooksButton = document.querySelector('#add-books')
    addBooksButton.addEventListener('click', () => addBookDialog.setAttribute('open', true))

    const addBooksCover = document.querySelector("frame-livro[data-page='#']")
    addBooksCover.addEventListener('click', () => addBookDialog.setAttribute('open', true))
    
})()