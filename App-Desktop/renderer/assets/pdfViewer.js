const pdfViewer = document.createElement('object')

pdfViewer.innerText = 'Não deu'
pdfViewer.setAttribute('type', "application/pdf")
pdfViewer.setAttribute('data', localStorage.getItem('pdf'))

document.body.appendChild(pdfViewer)

const voltar = document.querySelector('button:has(img[alt="Voltar página"])')
voltar.addEventListener('click', _ => history.back())