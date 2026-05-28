window.addEventListener("load", function() {
    // load the answers and images and insert the first ones
    loadData().then(() => {
    changeCards().then(() => {
    isElementLoaded("#loadingContainer").then(() => {
        getElement("loadingContainer").classList.toggle("hidden")
        console.log('hid loading screen')
    })
    })
    })
})

/**
 * Loads and parses the questions and answers from a remote source.
 * @returns null
 */
function loadData() {
    return new Promise((resolve) => {
        // load questions, answers, etc
        // use session storage to store them: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
        fetch('../assets/data.json').then((response) => {
            // raise error if failed
            if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`) }

            // json it and then store it
            response.json().then((loaded) => { 
                sessionStorage.setItem('data', loaded)
                console.log('loaded: ')
                console.log(loaded)
            })
        })
        
        // delay for a little to make it seem like more is going on
        console.log('done loading questions/answers')
        setTimeout(() => {
            resolve({status: 'done'})
        }, 2000)
    })
}

/**
 * Changes the image and animal cards on screen.
 * @returns null
 */
function changeCards() {
    return new Promise((resolve) => {
        // load everything we need
        // let animalTemplate = cloneTemplate('animalCard')
        let animalTemplate = cloneTemplate('animalCard')
        let habitatTemplate = cloneTemplate('habitatCard')
        let animalContainer = getElement('animalContainer')
        let habitatContainer = getElement('habitatContainer')

        // reset the containers to default templates
        animalContainer.replaceChildren()
        habitatContainer.replaceChildren()

        // create three elements of the animal / habitat
        for (let i = 0; i < 3; i++) {
            // create clones of templates
            let animalClone = animalTemplate.cloneNode(true)
            let habitatClone = habitatTemplate.cloneNode(true)

            // get animal and habitat IDs
            
            // set the parameters of the template
            animalClone.querySelector('.IMG').src = 'https://drive.google.com/thumbnail?id=1rpHrsEoMftQoboL-we-YCpASq5BV6mtk'

            animalContainer.appendChild(animalClone)
            habitatContainer.appendChild(habitatClone)
        }

        console.log('done inserting cards')
        resolve({status: 'done'})
    })
}