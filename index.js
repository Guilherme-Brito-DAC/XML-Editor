import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/+esm'
import { baixarArquivo } from './util/utilHelper.js'
import { formatarXML } from './util/xmlHelper.js'

let editor

$(document).ready(function () {
    iniciarMonaco()
    adicionarLabels()

    $(".menu-data-set").click(function () {
        menuDataSet($(this))
    })

    $(".menu-data-set").click(function () {
        menuDataSet($(this))
    })

    $("#btn_copiarconteudo").click(function () {
        navigator.clipboard.writeText(editor.getValue())

        const range = editor.getModel().getFullModelRange()

        editor.setSelection(range)
    })

    $("#btn_abrirarquivo").click(function () {
        $("#arquivoinput").click()
    })

    $("#btn_formatar").click(function () {
        editor.setValue(formatarXML(editor.getValue()))
    })

    $("#arquivoinput").change(function (e) {
        const arquivo = e.target.files[0]
        const reader = new FileReader()

        reader.onload = function (event) {
            const conteudo = event.target.result

            editor.setValue(conteudo)
        }

        reader.readAsText(arquivo)
    })

    $("#btn_baixararquivo").click(function () {
        toggleLoading(true)
        setTimeout(() => {
            toggleLoading(false)
            baixarArquivo(editor.getValue(), `arquivo.xml`)
        }, 200)
    })

    $("#btn_fullscreeneditor").click(function () {
        if ($('.editor').hasClass("fullscreen"))
            $('.editor').removeClass("fullscreen")
        else
            $('.editor').addClass("fullscreen")
    })

    $("#btn_fullscreenvisualizacao").click(function () {
        if ($('.arvore').hasClass("fullscreen"))
            $('.arvore').removeClass("fullscreen")
        else
            $('.arvore').addClass("fullscreen")
    })

    $("#esconderAtributos").change(function () {
        toggleAtributos()
    })

    $("#txt_pesquisar").on("keyup", function () {
        pesquisar($("#txt_pesquisar").val())
    })

    $(window).resize(function () {
        menuDataSet()
    })

    toggleElementoArvore()

    toggleLoading(true)

    setTimeout(() => {
        toggleLoading(false)
    }, 200)
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
            rules: [],
        })

        editor = monaco.editor.create(document.getElementById("editor"), {
            value: `<bookstore>
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
</bookstore>`,
            language: "xml",
            automaticLayout: true,
        })

        editor.getModel().onDidChangeContent((event) => {
            onChangeXML()
        })

        onChangeXML()
    } catch (error) {
        console.log(error)
    }
}

function onChangeXML() {
    try {

        const editorXML = editor.getValue()

        if (editorXML) {
            const arvore = construirArvoreXML(editorXML)

            if (arvore) {
                $("#arvore").html(arvore)
            }
        }
    } catch (error) {
        console.log(error)
    }
}

function construirArvoreXML(xml) {
    try {
        const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml')

        function renderAtributos(node) {
            let html = "<span class='atributo'>"

            $(node).each(function () {
                $.each(this.attributes, function () {
                    if (this.specified) {
                        html += ` ${this.name} : ${this.value} `
                    }
                })
            })

            html += "</span>"

            return html
        }

        function transformarNode(node) {
            let html = ''

            if (node && node.nodeType && node.nodeType == 3) return

            let nome = node.nodeName

            if ($(node).children().length == 0)
                nome = $(node).text()

            html += `<ul>`

            const numeroDeFilhos = $(node).children().length

            const atributos = renderAtributos(node)

            if (numeroDeFilhos) {
                html += `<li><a class="colapsar" uk-icon="icon: chevron-down"></a> ${nome}  <span class="numero-de-filhos-label">(${numeroDeFilhos})</span> ${atributos}`

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

                html += `<li>${node.nodeName} : ${nome} ${atributos}`

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

        return null
    }
}

function toggleAtributos() {
    try {
        if ($("#esconderAtributos").is(":checked")) {
            $(".atributo").hide()
        }
        else {
            $(".atributo").show()
        }
    } catch (error) {
        console.log(error)
    }
}

function adicionarLabels() {
    $(".tippy").each(function () {
        tippy(`#${$(this).attr('id')}`, {
            content: $(this).attr("title"),
        })

        $(this).removeAttr("title")
    })
}

function pesquisar(texto) {
    try {
        $("#arvore").find("mark").each(function () {
            $(this).replaceWith($(this).text())
        })

        if (texto && texto.trim())
            $("#arvore").html($("#arvore").html().replace(new RegExp(texto + "(?=[^>]*<)", "ig"), "<mark>$&</mark>"))
    } catch (error) {
        console.log(error)
    }
}

function toggleLoading(ativar) {
    if (ativar)
        $("#loading").show()
    else
        $("#loading").hide()
}

function toggleElementoArvore() {
    $(".colapsar").on("click", function () {
        if ($(this).attr("uk-icon") == "icon: chevron-down") {
            $(this).attr("uk-icon", "icon: chevron-up")
            $(this).parent().find("ul").hide()
        }
        else {
            $(this).attr("uk-icon", "icon: chevron-down")
            $(this).parent().find("ul").show()
        }
    })
}