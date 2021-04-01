
exts = null
extsd = null
loadExtensions()


function loadExtensions() {
    new Promise(fulfill => chrome.management.getAll(fulfill))
        .then(result => result.filter(ext => ext.type == "extension"))
        .then(also(result => Promise.all(result.map(ext => new Promise(fulfill => chrome.management.getPermissionWarningsById(ext.id, fulfill)).then(x => ext.warnings = x)))))
        .then(result => result.filter(isRisky))
        .then(result => {
            exts = result.filter(ext => ext.enabled)
            extsd = result.filter(ext => !ext.enabled)
        })
        .catch(console.error)
}

function isRisky(extension) {
    const risky = [
        "Read and change all your data on the websites you visit",
        "Read and change all your data on the websites that you visit",
    ]
    return extension.warnings.some(x => risky.includes(x))
}

function getExtensionIcon(extension, size) {
    let icon
    for (const tmp of extension.icons || []) if (!icon || icon.size > tmp.size && tmp.size >= size) icon = tmp
    return icon ? icon.url : "img/missing-icon.png"
}

function discuss(extension) {
    chrome.tabs.create({
        url: "https://groups.google.com/g/extension-auditor"
    })
}

function setEnabled(extension, yes) {
    new Promise(fulfill => chrome.management.setEnabled(extension.id, yes, fulfill))
        .then(loadExtensions)
}



dialog = {
    visible: false,
    extension: null,
}

function showDialog(extension) {
    dialog.extension = extension
    dialog.visible = true
}
