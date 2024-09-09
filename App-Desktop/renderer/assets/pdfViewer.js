const pdfViewer = document.createElement('object')

pdfViewer.innerText = 'Não foi possível abrir o arquivo.'
pdfViewer.setAttribute('type', "application/pdf")
pdfViewer.setAttribute('data', localStorage.getItem('pdf'))

document.body.appendChild(pdfViewer)

const voltar = document.querySelector('button:has(img[alt="Voltar página"])')
voltar.addEventListener('click', _ => history.back())

document.title = localStorage.getItem("autor")