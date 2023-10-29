function validarXML(xml) {
    const parser = new DOMParser()

    try {
        const doc = parser.parseFromString(xml, 'text/xml')

        const errorNode = doc.querySelector("parsererror")

        if (errorNode) {
            return false
        }

        return true
    } catch (error) {
        return false
    }
}

function formatarXML(xml) {
    try {
        let formatted = '', indent = ''
        let tab = '\t'

        xml.split(/>\s*</).forEach(function (node) {
            if (node.match(/^\/\w/)) indent = indent.substring(tab.length)

            formatted += indent + '<' + node + '>\r\n'

            if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab
        })

        return formatted.substring(1, formatted.length - 3)
    } catch (error) {
        return null
    }
}

export { validarXML, formatarXML }