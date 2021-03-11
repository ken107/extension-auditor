
const config = {
    risk: {
        declarativeNetRequest: .2,
        declarativeWebRequest: .5,
        geolocation: .1,
        history: .5,
        proxy: .5,
        scripting: 1,
        signedInDevices: .1,
        tabs: .5,
        topSites: .1,
        webNavigation: .5,
        webRequest: .9,
        wildcardUrls: 1,
    },
    wildcard: /^\s*(<all_urls>|(http|https|\*):\/\/\*(\.\w+)?\/)/i
}

perms = null
exts = null



function loadExtensions(includeDisabled) {
    new Promise(fulfill => chrome.management.getAll(fulfill))
        .then(result => result.filter(ext => ext.type == "extension" && (includeDisabled || ext.enabled)))
        .then(also(result => Promise.all(result.map(ext => new Promise(fulfill => chrome.management.getPermissionWarningsById(ext.id, fulfill)).then(x => ext.warnings = x)))))
        .then(result => exts = result)
        .then(() => perms = Array.from(new Set(exts.flatMap(ext => ext.permissions))).sort())
        .catch(console.error)
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
    if (hasWildcardHostPermission(extension)) risk += config.risk.wildcardUrls
    return risk
}

function hasWildcardHostPermission(extension) {
    return extension.warnings.includes("Read and change all your data on the websites you visit")
}

function popout() {
    chrome.tabs.create({
        url: chrome.runtime.getURL("audit.html")
    })
}



dialog = {
    visible: false,
    extension: null,
}

function showDialog(extension) {
    dialog.extension = extension
    dialog.visible = true
}
