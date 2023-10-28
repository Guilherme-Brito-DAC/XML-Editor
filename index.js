import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/+esm'

let editor

let exemplo = `<bookstore>
    <book ISBN="978-0451526531" category="Fiction">
        <title>Pride and Prejudice</title>
        <author>Jane Austen</author>
        <price currency="USD">12.99</price>
    </book>
    <book ISBN="978-0061120084" category="Non-Fiction">
        <title>To Kill a Mockingbird</title>
        <author>Harper Lee</author>
        <price currency="USD">10.99</price>
    </book>
    <book ISBN="978-0743273565" category="Fiction">
        <title>The Great Gatsby</title>
        <author>F. Scott Fitzgerald</author>
        <price currency="USD">11.99</price>
    </book>
</bookstore>`

$(document).ready(function () {
    iniciarMonaco()

    $(".menu-data-set").click(function () {
        menuDataSet($(this))
    })

    $(window).resize(function () {
        menuDataSet()
    })
})

function menuDataSet(element) {
    try {
        if ($(document).width() <= 950) {
            if (element)
                var id = $(element).attr("data-id")
            else
                var id = $(".uk-active").attr("data-id")

            $(".data-set").hide()
            $(`.${id}`).show()
        }
        else {
            $(".data-set").show()
            $(`.editor`).show()
            $(`.arvore`).show()
        }
    } catch (error) {
        console.log(error)
    }
}

function iniciarMonaco() {
    try {
        monaco.editor.defineTheme('custom', {
            base: 'vs',
            inherit: true,
            // colors: {
            //     'editor.background': '#1e1f23',
            // },
            rules: [],
        })

        // monaco.editor.setTheme('custom')

        editor = monaco.editor.create(document.getElementById("editor"), {
            value: exemplo,
            language: "xml",
            automaticLayout: true,
        })

        editor.getModel().onDidChangeContent((event) => {
            $("#arvore").html(construirArvoreXML(editor.getValue()))
        })

        $("#arvore").html(construirArvoreXML(editor.getValue()))
    } catch (error) {
        console.log(error)
    }
}

function construirArvoreXML(xml) {
    try {
        const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml')

        function transformarNode(node) {
            let html = ''

            if (node && node.nodeType && node.nodeType == 3) return

            let nome = node.nodeName

            if ($(node).children().length == 0)
                nome = $(node).text()

            html += `<ul>`

            const numeroDeFilhos = $(node).children().length

            if (numeroDeFilhos) {
                html += `<li><a href="" uk-icon="icon: chevron-down"></a> ${nome}  <span class="numero-de-filhos-label">(${numeroDeFilhos})</span>`

                html += '<ul>';

                for (let i = 0; i < node.childNodes.length; i++) {
                    const retorno = transformarNode(node.childNodes[i])

                    if (retorno)
                        html += retorno
                }

                html += '</ul>'
            }
            else {
                html += '<ul>';

                html += `<li>${node.nodeName} : ${nome}`

                html += '</ul>'
            }

            html += '</li></ul>'

            return html
        }

        if (xmlDoc.childNodes[0])
            return transformarNode(xmlDoc.childNodes[0])
        else
            return transformarNode(xmlDoc)

    } catch (error) {
        console.log(error)
    }
}