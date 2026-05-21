window.addEventListener("load", function() {
    isElementLoaded("#LoadingContainer").then((selector) => {
        document.getElementById("LoadingContainer").classList.toggle("hidden")
    })
})