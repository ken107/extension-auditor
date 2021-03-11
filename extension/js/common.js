
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
