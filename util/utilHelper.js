function baixarArquivo(conteudo, nomeDoArquivo) {
    try {
        let file = new Blob([conteudo], { type: "xml" })

        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(file, nomeDoArquivo)
        }
        else {
            let a = document.createElement("a")
            let url = URL.createObjectURL(file)

            a.href = url

            a.download = nomeDoArquivo

            document.body.appendChild(a)

            a.click()

            setTimeout(function () {
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
            }, 0)
        }
    } catch (error) {
        console.log(error)
    }
}

export { baixarArquivo }