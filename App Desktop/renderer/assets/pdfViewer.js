let pdfViewer = document.createElement('object')

pdfViewer.innerText = 'Não deu'
pdfViewer.setAttribute('type', "application/pdf")
pdfViewer.setAttribute('data', localStorage.getItem('pdf'))

console.log(localStorage.pdf)

document.body.appendChild(pdfViewer)


let voltar = document.querySelector('span.material-symbols-outlined')
voltar.addEventListener('click', event => history.back())