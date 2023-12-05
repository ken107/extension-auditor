
const queryString = location.search ? parseQueryString(location.search.slice(1)) : {};

function parseQueryString(string) {
    var query = {};
    var tuples = string.split('&');
    for (var i=0; i<tuples.length; i++) {
            var pair = tuples[i].split('=', 2);
            if (pair.length == 2) query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, '%20'));
            else if (pair.length == 1) query[decodeURIComponent(pair[0])] = "";
    }
    return query;
}

function also(doSomethingWith) {
    return data => Promise.resolve(doSomethingWith(data)).then(() => data)
}

function request(api, method, args) {
    return new Promise((fulfill, reject) => {
        const id = Math.random()
        const onResponse = event => {
            const response = event.data
            if (response.id == id) {
                if (response.error) reject(new Error(response.error))
                else fulfill(response.result)
                window.removeEventListener("message", onResponse)
            }
        }
        window.addEventListener("message", onResponse)
        window.parent.postMessage({id, api, method, args}, "*")
    })
}

function ajaxGet(url, responseType) {
    return new Promise((fulfill, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("GET", url, true)
        xhr.responseType = responseType
        xhr.onreadystatechange = function() {
          if (xhr.readyState == XMLHttpRequest.DONE) {
            if (xhr.status == 200) fulfill(xhr.response)
            else reject(new Error("Failed to fetch " + url))
          }
        }
        xhr.send()
    })
}

function hasWildcardHostPermission(warnings) {
    return warnings.some(x => x.includes("all your data") && x.includes("all websites"))
}
