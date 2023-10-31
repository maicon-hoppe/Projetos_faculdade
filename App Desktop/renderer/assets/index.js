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


function configLink(elemento)
{
    let link = elemento.shadowRoot.querySelector('a')
    link.setAttribute('href', elemento.dataset.page)

    localStorage.setItem('pdf', elemento.dataset.pdf)
}


let response = main.asyncCall('db', "SELECT titulo FROM livros")

response.then(valor => console.log(valor)).catch(err => console.log(err))