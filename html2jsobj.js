class HtmlToJsObj {
    static #objIndex = 0;

    constructor() {
    }


    static transform(parentNode, resultNodeId) {
        var html2js = "";
        for (let index = 0; index < parentNode.childNodes.length; index++) {
            const elm = parentNode.childNodes[index];
            if (elm.nodeType == 1) {
                html2js += this.#genAsObject(elm, "document.getElementById(\"" + resultNodeId + "\")");
            }
        }
        return html2js;
    }

    static #genAsObject(elm, parent) {
        var name = elm.tagName.toLowerCase() + "Obj" + this.#objIndex;
        var elmJs = "var " + name + " = document.createElement(\"" + elm.tagName.toLowerCase() + "\");\n"
        if (elm.attributes.length > 0) {
            for (let attr of elm.attributes) {
                if (attr.nodeName == "id") {
                    elmJs += name + ".id=\"" + attr.nodeValue + "\";\n";
                } else if (attr.nodeName == "name") {
                    elmJs += name + ".name=\"" + attr.nodeValue + "\";\n";
                } else if (attr.nodeName == "class") {
                    elmJs += name + ".className=\"" + attr.nodeValue + "\";\n";
                } else if (attr.nodeName == "style") {
                    var styleValues = attr.nodeValue.split(";");
                    for (let styleValue of styleValues) {
                        if (styleValue == "") continue;
                        var styleName = styleValue.split(": ")[0].trim();
                        const regex = /-(?<letter>\w)/i;
                        const matches = styleName.match(regex);
                        styleName = styleName.replace(regex, (matches !== null) ? matches.groups.letter.toUpperCase() : styleName);
                        var styleVal = styleValue.split(": ")[1].trim();
                        elmJs += name + ".style." + styleName + "=\"" + styleVal + "\";\n";
                    }
                } else {
                    var attrName = attr.nodeName;
                    if (attrName.indexOf("-")) {
                        const regex = /-(?<letter>\w)/i;
                        const matches = attrName.match(regex);
                        attrName = attrName.replace(regex, (matches !== null) ? matches.groups.letter.toUpperCase() : attrName);
                    }
                    elmJs += name + "." + attrName + "=\"" + attr.nodeValue + "\";\n";
                }
            }
        }

        if (elm.childNodes.length > 0) {
            for (let child of elm.childNodes) {
                if (child.nodeType == 1) {
                    this.#objIndex++;
                    elmJs += "\n";
                    elmJs += this.#genAsObject(child, name);
                } else if (child.nodeType == 3) {
                    if (child.wholeText != "\n") {
                        elmJs += name + ".innerText = " + JSON.stringify(child.wholeText) + ";\n";
                    }
                }
            }
        }

        elmJs += parent + ".appendChild(" + name + ");\n";

        console.log(elmJs);
        return elmJs;
    }

}