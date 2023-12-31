import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/+esm'
import { baixarArquivo } from './util/utilHelper.js'
import { formatarXML, validarXML } from './util/xmlHelper.js'

let editor

$(document).ready(function () {
    iniciarMonaco()
    adicionarLabels()

    $(".lingua-opcao").click(function () {
        linguagem($(this).attr("language"))
    })

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
        try {
            const arquivo = e.target.files[0]
            const reader = new FileReader()

            reader.onload = function (event) {
                const conteudo = event.target.result

                editor.setValue(conteudo)
            }

            reader.readAsText(arquivo)
        } catch (error) {
            console.log(error)
        }
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

    $("#cancelar-edicao-em-massa").click(function () {
        const elemento = $("#select-elemento").val()
        const atributo = $("#select-atributo").val()
        const valor = $("#input-valor").val()
        const valorParaSubstituir = $("#input-valor-para-substituir").val()
        const aplicarNoPai = $("#input-aplicar-no-pai").prop('checked')

        if (!elemento) return

        let seletor = $(elemento)

        if (atributo) {
            seletor = $(`${elemento}[${atributo}='${valor}']`)
        }

        if (aplicarNoPai) seletor = $(seletor).parent()

        if (seletor) {
            $(seletor).remove()
        }
    })

    $("#aplicar-edicao-em-massa").click(function () {
        $("#select-elemento").html("")
        $("#select-atributo").html("")
        $("#select-atributo").attr("disabled", "disabled")
        $("#input-valor").attr("disabled", "disabled")
        $("#input-valor").val("")
        $("#input-aplicar-no-pai").prop('checked', false)
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
        toggleXMLInvalido(false)

        if (editorXML) {
            if (!validarXML(editorXML)) {
                toggleXMLInvalido(true)
                return
            }

            const arvore = construirArvoreXML(editorXML)

            if (arvore) {
                $("#arvore").html(arvore)

                toggleElementoArvore()
                toggleAtributos()
            }
        }
        else {
            $("#arvore").html("")
        }

        carregarSelectElemento()
    } catch (error) {
        console.log(error)
        toggleXMLInvalido(true)
    }
}

function construirArvoreXML(xml) {
    try {
        toggleLoading(true)

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


        if (xmlDoc.childNodes[0]) {
            const resultado = transformarNode(xmlDoc.childNodes[0])

            toggleLoading(false)

            return resultado
        }
        else {
            const resultado = transformarNode(xmlDoc)

            toggleLoading(false)

            return resultado
        }
    } catch (error) {
        console.log(error)

        toggleLoading(false)

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

        toggleElementoArvore()
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

function toggleXMLInvalido(ativar) {
    if (ativar)
        $(".informativo-erro").show()
    else
        $(".informativo-erro").hide()
}

function toggleElementoArvore() {
    $(".colapsar").unbind("click").on("click", function () {
        if ($(this).attr("uk-icon") == "icon: chevron-down") {
            $(this).attr("uk-icon", "icon: chevron-up")

            $(this).parent().find("ul").hide()
        }
        else {
            $(this).attr("uk-icon", "icon: chevron-down")

            let ULs = Array.from($(this).parent().find("ul"))

            ULs.forEach(ul => {
                if ($(ul).parent().find("> .colapsar").length && $(ul).parent().find("> .colapsar").attr("uk-icon") == "icon: chevron-up")
                    $(ul).hide()
                else
                    $(ul).show()
            })
        }
    })
}

function carregarSelectElemento() {
    try {
        const parser = new DOMParser()
        const valor = editor.getValue()

        const xml = parser.parseFromString(valor, 'text/xml')

        let elementos = [...new Set(Array.from($(xml).find('*')).map(c => $(c).prop('nodeName')))]

        $("#select-elemento").html("")

        elementos.forEach(elemento => {
            $("#select-elemento").append(new Option(elemento, elemento))
        })

        $("#select-atributo").html("")

        $("#select-atributo").attr("disabled", "disabled")

        $("#select-elemento").on("change", function () {
            $("#select-atributo").html("")

            let atributos = []

            $(xml).find(`${$("#select-elemento").val()}:first`).each(function () {
                $.each(this.attributes, function () {
                    atributos.push(this.name)
                })
            })

            atributos.forEach(atributo => {
                $("#select-atributo").removeAttr("disabled")

                $("#select-atributo").append(new Option(atributo, atributo))
            })

            $("#select-atributo").change()
        })

        $("#select-atributo").on("change", function () {
            if ($("#select-atributo").val()) {
                $("#input-valor").removeAttr("disabled")
            } else {
                $("#input-valor").attr("disabled", "disabled")
                $("#input-valor").val("")
            }
        })

        $("#select-elemento").change()
    } catch (error) {
        console.log(error)
    }
}

function linguagem(lingua) {
    if (lingua == "pt")
        $("#linguaBotao > span").text("Português")
    else if (lingua == "en")
        $("#linguaBotao > span").text("English")
    else
        $("#linguaBotao > span").text("Español")

    $.getJSON("language.json", function (json) {
        const labels = json[lingua]

        Object.keys(labels).forEach(function (label) {
            const texto = labels[label]

            if ($(`[data-label='${label}']`).text())
                $(`[data-label='${label}']`).text(texto)

            $(`[data-label='${label}']`).attr("title", texto)
        })
    })
}