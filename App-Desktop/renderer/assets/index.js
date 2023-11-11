async function getTemplate(path)
{
    let caminho = await fetch(path)
    let templateStr = await caminho.text()


    let html = new DOMParser().parseFromString(templateStr, 'text/html')
    return html.querySelector('head > template')
}


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


function bookSection(autor, bookArray)
{
    let section = document.createElement('section')
    let autorName = document.createElement('h2')
    let books = document.createElement('section')
    let scrollButtonR = document.createElement('button')

    let styleScrollButtonR = scrollButtonR.style

    autorName.innerText = autor
    section.appendChild(autorName)
    
    books.setAttribute('id', 'books')

    for ( const book of bookArray )
    {
        let html = `
        <frame-livro
            onclick="configLink(this)"
            data-page="pdfViewer.html"
            data-pdf=${book['pdf']}
        >
            <img
                slot="bookCover"
                src=${book['capa']}
                alt=${book['titulo']}
            >
            <span slot="bookName">${book['titulo']}</span>
        </frame-livro>`

        books.insertAdjacentHTML('beforeend', html)
    }

    scrollButtonR.innerText = ">"
    styleScrollButtonR.position = "absolute"
    styleScrollButtonR.right = "30px"
    styleScrollButtonR.marginTop = "133.5px"

    scrollButtonR.addEventListener('click', () =>
    {
        // Mudar esse valor
        books.scrollLeft += 200
    })
    
    books.addEventListener('scrollend', () => 
    {
        let isMaxScroll = books.scrollLeft === books.scrollWidth - books.clientWidth
        styleScrollButtonR.display = isMaxScroll ? "none" : "initial"
    })

    books.appendChild(scrollButtonR)

    section.appendChild(books)
    document.body.appendChild(section)
}

function configLink(element)
{
    let link = element.shadowRoot.querySelector('a')
    link.setAttribute('href', element.dataset.page)

    localStorage.setItem('pdf', element.dataset.pdf)
}

(async () =>
{
    let listaAutores = await main.asyncCall('db', 'SELECT DISTINCT autor FROM livros')

    for (const autores of listaAutores)
    {
        let autor = autores['autor']
        let book = await main.asyncCall('db', `SELECT * FROM livros WHERE autor='${autor}'`)
        
        bookSection(autor, book)
    }
})()