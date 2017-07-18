;(function() {
'use strict'

/**
 * Gets manifest from window.strictDomManifest variable, html tag with manifest id or current script tag
 */
function getManifest() {
    if('strictDomManifest' in window) {
        return window.strictDomManifest
    }
    if('currentScript' in document) {
        var node = document.currentScript
        if(node == null) {
            throw ReferenceError('Script must be called inside a script tag')
        }
    } else {
        var scripts = document.getElementsByTagName('script')
        var node = scripts[scripts.length - 1]
    }
    if(node.async) {
        throw Error('Script must be sync. Remove async attribute to use strict_dom')
    }
    var manifestNodeId = node.getAttribute('manifest')
    if(manifestNodeId) {
        var manifestNode = document.getElementById(manifestNodeId)
        if(!manifestNode) {
            throw Error('No manifest found with id '+manifestNodeId)
        }
        return JSON.parse(manifestNode.innerText)
    } else {
        return JSON.parse(node.innerText)
    }
}

/**
 * Sets some variables from manifest
 */
function setItems(name, value, values, defaultValue) {
    if(!value) {
        value = defaultValue
    }
    value = value.toLowerCase()
    if(values.indexOf(value) < 0) {
        throw TypeError('Unknown '+name+' value: '+value+'. Possible ones: '+values.join(', '))
    }
    return value
}

/**
 * remove some additional data from node
 */
function removeAdditional(node, attribute) {
    if(attribute[0] === 'o' && attribute[1] === 'n' && attribute[2].toLowerCase() === attribute[2] && attribute in node) {
        node[attribute] = null
    }
}

/**
 * Removes attribute from node
 */
function removeAttribute(node, attribute) {
    node.removeAttribute(attribute)
    removeAdditional(node, attribute)
}

/**
 * Removes node
 */
function removeNode(node) {
    if(node.nodeName !== 'BODY' && node.nodeName !== 'HEAD') {
        if(node.parentNode) {
            node.parentNode.removeChild(node)
        }
        for(var i = node.attributes.length - 1; i >= 0; i--) {
            var attribute = node.attributes[i].name
            removeAdditional(node, attribute)
        }
    }
}

/**
 * Resolving node attributes
 */
function resolveNodeAttributes(node, nodeName) {
    var currentAttributes = attributes[nodeName]
    for(var i = 0; i < node.attributes.length; ++i) {
        var nodeAttribute = node.attributes[i].name
        switch(attributesType) {
        case 'blacklist':
            if(currentAttributes && currentAttributes.indexOf(nodeAttribute) >= 0) {
                removeAttribute(node, nodeAttribute)
            }
            break
        case 'whitelist':
            if(!currentAttributes || currentAttributes.indexOf(nodeAttribute) < 0) {
                removeAttribute(node, nodeAttribute)
            }
            break
        }
    }
}

/**
 * Resolve node by tag
 */
function resolveNode(node) {
    if(node.nodeType !== 1) {
        return
    } 
    switch(tagsType) {
    case 'blacklist':
        if(tags.indexOf(node.nodeName) >= 0) {
            removeNode(node)
        } else {
            resolveNodeAttributes(node, node.nodeName)
            resolveNodeAttributes(node, '*')
        }
        break
    case 'whitelist':
        if(tags.indexOf(node.nodeName) >= 0) {
            resolveNodeAttributes(node, node.nodeName)
            resolveNodeAttributes(node, '*')
        } else {
            removeNode(node)
        }
        break
    }
}

/**
 * Start listening for changes in DOM
 */
function observe() {
    new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            switch(mutation.type) {
            case 'childList':
                mutation.addedNodes.forEach(function(node) {
                    resolveNode(node)
                })
                break
            case 'attributes':
                resolveNode(mutation.target)
                break
            default:
                console.error('unknown mutation', mutation)
            }
        })
    }).observe(document, { 
        attributes: true,
        childList: true,
        subtree: true,
    })
}


var manifest = getManifest()

var outdatedUrl = manifest.outdatedUrl
var tagsType = setItems('tagsType', manifest.tagsType, ['blacklist', 'whitelist'], 'blacklist')
var attributesType = setItems('attributesType', manifest.attributesType, ['blacklist', 'whitelist'], 'blacklist')
var tags = []
if(manifest.tags) {
    manifest.tags.forEach(function(tag) {
        tags.push(tag.toUpperCase())
    })
}
var attributes = {}
if(manifest.attributes) {
    for(var k in manifest.attributes) {
        var currentAttributes = []
        attributes[k.toUpperCase()] = currentAttributes
        manifest.attributes[k].forEach(function(attribute) {
            currentAttributes.push(attribute.toLowerCase())
        })
    }
}

if(!window.MutationObserver) {
    if(outdatedUrl) {
        location.href = outdatedUrl
    } else {
        console.warn('MutationObserver is not supported. Doing nothing')
        return
    }
} else {
    observe()
}


})()
