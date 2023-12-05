
exts = null
extsd = null
loadExtensions()
request("other", "setSize", [400, 500])
    .catch(console.error)


async function loadExtensions() {
    try {
        let result = await request("management", "getAll", [])
        result = result.filter(ext => ext.type == "extension")
        await Promise.all(result.map(fetchExtDetails))
        result = result.filter(isRisky)
        exts = result.filter(ext => ext.enabled)
        extsd = result.filter(ext => !ext.enabled)
    }
    catch (err) {
        console.error(err)
    }
}

async function fetchExtDetails(ext) {
    ext.warnings = await request("management", "getPermissionWarningsById", [ext.id])
    ext.icon = await request("other", "toDataUrl", [getExtensionIcon(ext, 16)])
}

function isRisky(extension) {
    return hasWildcardHostPermission(extension.warnings)
}

function getExtensionIcon(extension, size) {
    let icon
    for (const tmp of extension.icons || []) if (!icon || icon.size > tmp.size && tmp.size >= size) icon = tmp
    return icon ? icon.url : "img/missing-icon.png"
}

function discuss(extension) {
    request("tabs", "create", [{url: "https://groups.google.com/g/extension-auditor"}])
        .catch(console.error)
}

function setEnabled(extension, yes) {
    request("management", "setEnabled", [extension.id, yes])
        .then(loadExtensions)
        .catch(console.error)
}

function viewPermissionMatrix() {
    request('tabs', 'create', [{url: 'sandbox.html?url=audit.html'}])
        .catch(console.error)
}



dialog = {
    visible: false,
    extension: null,
}

function showDialog(extension) {
    dialog.extension = extension
    dialog.visible = true
}
