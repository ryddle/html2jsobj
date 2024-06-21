class HtmlToJsObj {
    static #objIndex = 0;

    constructor() {
    }


    static transform(parentNode, resultNodeId) {
        var html2js = "";
        for (let index = 0; index < parentNode.childNodes.length; index++) {
            const elm = parentNode.childNodes[index];
            if (elm.nodeType == 1) {
                html2js += this.#genAsObject(elm, 'document.getElementById("' + resultNodeId + '")');
            }
        }
        return html2js;
    }

    static #genAsObject(elm, parent) {
        var name = elm.tagName.toLowerCase() + 'Obj' + this.#objIndex;
        var elmJs = 'var ' + name + ' = document.createElement("' + elm.tagName.toLowerCase() + '");\n';
        if (elm.attributes.length > 0) {
            for (let attr of elm.attributes) {
                if (attr.nodeName == "id") {
                    elmJs += name + '.id="' + attr.nodeValue + '";\n';
                } else if (attr.nodeName == "name") {
                    elmJs += name + '.name="' + attr.nodeValue + '";\n';
                } else if (attr.nodeName == "class") {
                    elmJs += name + '.className="' + attr.nodeValue.replaceAll("\n", "") + '";\n';
                } else if (attr.nodeName == "style") {
                    if (attr.nodeValue == "") continue;
                    elmJs += 'Object.assign(' + name + '.style,  {\n';
                    /* var styleValues = attr.nodeValue.split(";");
                    for (let index = 0; index < styleValues.length; index++) {
                        const styleValue = styleValues[index];
                        if (styleValue == "") continue;
                        var styleName = styleValue.split(":")[0].trim();
                        const regex = /-(?<letter>\w)/i;
                        //const matches = styleName.match(regex);
                        //styleName = styleName.replace(regex, (matches !== null) ? matches.groups.letter.toUpperCase() : styleName);
                        styleName = styleName.replace(/-([a-z])/g,function(str,letter){ return letter.toUpperCase();});
                        var styleVal = styleValue.split(":")[1].trim();
                        //elmJs += name + ".style." + styleName + "=\"" + styleVal + "\";\n";
                        elmJs += '    ' + styleName + ':"' + styleVal + '"' + (index < styleValues.length - 2 ? ',' : '') + '\r\n';
                    } */
                    if (elm.style.length > 0) {
                        for (let index = 0; index < elm.style.length; index++) {
                            let styleName = elm.style[index];
                            let styleValue = elm.style[styleName];
                            if (styleValue == "") continue;
                            //const regex = /-(?<letter>\w)/g;
                            //const matches = styleName.match(regex);
                            //styleName = styleName.replace(regex, (matches !== null) ? matches.groups.letter.toUpperCase() : styleName);
                            styleName = styleName.replace(/-([a-z])/g,function(str,letter){ return letter.toUpperCase();});
                            if (!/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(styleName)) {
                                styleName = '"' + styleName + '"';
                            }
                            styleValue = (styleValue!==undefined) ?styleValue.replaceAll("\"", "'"):"";
                            elmJs += '    ' + styleName + ':"' + styleValue + '"' + (index < elm.style.length - 1 ? ',' : '') + '\r\n';
                        }
                    } else {
                        var styleValues = attr.nodeValue.split(";");
                        for (let index = 0; index < styleValues.length; index++) {
                            const styleValue = styleValues[index];
                            if (styleValue == "") continue;
                            var styleName = styleValue.split(":")[0].trim();
                            //const regex = /-(?<letter>\w)/i;
                            //const matches = styleName.match(regex);
                            //styleName = styleName.replace(regex, (matches !== null) ? matches.groups.letter.toUpperCase() : styleName);
                            styleName = styleName.replace(/-([a-z])/g,function(str,letter){ return letter.toUpperCase();});
                            var styleVal = styleValue.split(":")[1].trim();
                            //elmJs += name + ".style." + styleName + "=\"" + styleVal + "\";\n";
                            if (!/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(styleName)) {
                                styleName = '"' + styleName + '"';
                            }
                            elmJs += '    ' + styleName + ':"' + styleVal + '"' + (index < attr.nodeValue.length - 2 ? ',' : '') + '\r\n';
                        }
                    }
                    elmJs += '});\n';
                } else {
                    var attrName = attr.nodeName;
                    if (attrName.indexOf("-")!=-1){
                        //const regex = /-(?<letter>\w)/i;
                        //const matches = attrName.match(regex);
                        //attrName = attrName.replace(regex, (matches !== null) ? matches.groups.letter.toUpperCase() : attrName);
                        attrName = attrName.replace(/-([a-z])/g,function(str,letter){ return letter.toUpperCase();});
                    }
                    if(attrName.indexOf(':')!=-1){
                        elmJs += name + '["' + attrName + '"]="' + attr.nodeValue + '";\n';
                    }else{
                        elmJs += name + '.' + attrName + '="' + attr.nodeValue + '";\n';
                    }
                }
            }
        }

        if (elm.childNodes.length > 0) {
            for (let child of elm.childNodes) {
                if (child.nodeType == 1) {
                    this.#objIndex++;
                    elmJs += '\n';
                    elmJs += this.#genAsObject(child, name);
                } else if (child.nodeType == 3) {
                    if (child.wholeText != "\n") {
                        elmJs += name + '.innerText = ' + JSON.stringify(child.wholeText) + ';\n';
                    }
                }
            }
        }

        elmJs += parent + '.appendChild(' + name + ');\n';

        console.log(elmJs);
        return elmJs;
    }

    static transform2(htmltext) {
        var html2js = "";
        var parser = new DOMParser();
        var doc = parser.parseFromString(htmltext, "text/html");
        var root = doc.body;

        for (let index = 0; index < root.childNodes.length; index++) {
            const elm = root.childNodes[index];
            if (elm.nodeType == 1) {
                html2js += this.#genAsObject(elm, 'document.getElementById("result")');
            }
        }
        return html2js;
    }

}