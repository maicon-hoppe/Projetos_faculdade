const aboutMeButton = document.querySelector('#about')
const graduationButton = document.querySelector('#grad')
const portButton = document.querySelector('#portifolio')
const contactButton = document.querySelector('#contact')

const buttons = [aboutMeButton, graduationButton, portButton, contactButton]
const main = document.querySelector("main")


async function getTemplate(path)
{
    let caminho = await fetch(path)
    let templateStr = await caminho.text()

    let html = new DOMParser().parseFromString(templateStr, 'text/html')
    return html.querySelector('head > template')
}

getTemplate('templates/aboutTemplate.html')
    .then(template => main.appendChild(template.content))

function selectedButton(callback)
{
    buttons.forEach(element =>
    {
        if (element.className === "selected")
        {
            callback(element)
        }
    })
}

buttons.forEach(button =>
{
    button.addEventListener('click', () =>
    {
        console.log(button.id);
        selectedButton(el => { el.className = "" })
        button.setAttribute('class', "selected")

        const mainContent = document.querySelector('main > section')
        if (mainContent)
        {
            mainContent.remove()
        }

        switch (button.id)
        {
            case "about":
                getTemplate('templates/aboutTemplate.html')
                    .then(template => main.appendChild(template.content))
            break;

            case "grad":
                getTemplate('templates/gradTemplate.html')
                    .then(template => main.appendChild(template.content))
            break;
        
            case "portifolio":
                getTemplate('templates/portifolioTemplate.html')
                    .then(template => main.appendChild(template.content))
            break;

            case "contact":
                getTemplate('templates/contactTemplate.html')
                    .then(template => main.appendChild(template.content))
            break;

            default:
                break;
        }
    })    
})