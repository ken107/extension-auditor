
const config = {
    risk: {
        declarativeNetRequest: .2,
        declarativeWebRequest: .2,
        geolocation: .1,
        history: .3,
        proxy: .5,
        scripting: 1,
        signedInDevices: .1,
        tabs: .3,
        topSites: .1,
        webNavigation: .3,
        webRequest: .3,
        webRequestBlocking: .5,
        wildcardUrls: 1,
    },
    wildcard: /^\s*(<all_urls>|(http|https|\*):\/\/\*(\.\w+)?\/)/i
}

perms = null
exts = null



async function loadExtensions(includeDisabled) {
    try {
        let result = await request("management", "getAll", [])
        result = result.filter(ext => ext.type == "extension" && (includeDisabled || ext.enabled))
        await Promise.all(result.map(fetchExtDetails))
        exts = result
        perms = Array.from(new Set(exts.flatMap(ext => ext.permissions))).sort()
    }
    catch (err) {
        console.error(err)
    }
}

async function fetchExtDetails(ext) {
    ext.warnings = await request("management", "getPermissionWarningsById", [ext.id])
    ext.icon = await request("other", "toDataUrl", [getExtensionIcon(ext, 16)])
}

function getExtensionIcon(extension, size) {
    let icon
    for (const tmp of extension.icons || []) if (!icon || icon.size > tmp.size && tmp.size >= size) icon = tmp
    return icon ? icon.url : "img/missing-icon.png"
}

function getRiskColor(level) {
    return 'rgba(255,165,0,' + level + ')'
}

function getRiskScore(extension) {
    let risk = (extension.permissions || []).reduce((sum, perm) => sum + (config.risk[perm] || 0), 0)
    if (hasWildcardHostPermission(extension.warnings)) risk += config.risk.wildcardUrls
    return risk
}

function popout() {
    request("tabs", "create", [{url: "sandbox.html?url=audit.html"}])
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
