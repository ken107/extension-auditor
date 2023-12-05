
document.addEventListener("DOMContentLoaded", function() {
  const frame = document.getElementById("sandbox")

  const query = new URLSearchParams(location.search)
  if (query.has("url")) frame.src = query.get("url")
  else console.error("Missing query param 'url'")

  const otherApi = {
    toDataUrl(url) {
      if (url.startsWith("data:")) return url
      return ajaxGet(url, "blob")
        .then(blob => new Promise((fulfill, reject) => {
          const reader = new FileReader()
          reader.onload = ev => fulfill(ev.target.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }))
    },
    setSize(width, height) {
      frame.classList.remove("fullscreen")
      frame.width  = width
      frame.height = height
    }
  }

  window.addEventListener("message", event => {
    if (event.data.api && event.data.method) {
      const api = event.data.api == "other" ? otherApi : chrome[event.data.api]
      Promise.resolve(api[event.data.method](...event.data.args))
        .then(result => event.source.postMessage({id: event.data.id, result}, "*"))
        .catch(err => event.source.postMessage({id: event.data.id, error: err.message}, "*"))
    }
  })
})
