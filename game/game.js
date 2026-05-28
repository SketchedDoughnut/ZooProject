
// set up any constants
const kDIFFICULTY = 'difficulty' // difficulty
const kEASY = 'easy' // difficulty
const kHARD = 'hard' // difficulty
const kONLY_ANIMAL = 'only animals' // session storage
const kHASHES = 'hashes' // hashes for name : hash of name

// runs on load of the page
window.addEventListener("load", function() {
    // clear session storage before storing anything new
    sessionStorage.clear()

    // set default difficulty
    setDifficulty(kHARD)
    // load the data and parse it, then load the first cards, then hide the loading page
    loadData().then(() => {
    changeCards().then(() => {
    isElementLoaded("#loadingContainer").then(() => {
        getElement("loadingContainer").classList.toggle("hidden")
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

            // json it and then store multiple things in session storage
            response.json().then((loaded) => {
                
                // make a list of all animals (no habitat) and store it
                // also make the list of hashes so we can do both of these at the same time
                let onlyAnimals = {}
                let hashes = {}
                // go through each habitat key and get the animals in that habitat
                let habitatKeys = Object.keys(loaded)
                for (let a = 0; a < habitatKeys.length; a++) {
                    let habitatKey = habitatKeys[a]
                    let animals = loaded[habitatKey]
                    let animalKeys = Object.keys(animals)

                    // go through each animal and get their data
                    for (let b = 0; b < animalKeys.length; b++) {
                        let animalKey = animalKeys[b]
                        let animal = animals[animalKey]
                        onlyAnimals[animalKey] = animal
                        
                        // generate a randomized hash for all of the animals
                        hashes[animalKey] = generateHash(animalKey) + Math.round(Math.random() * 1000)
                    }
                }
                sessionStorage.setItem(kONLY_ANIMAL, JSON.stringify(onlyAnimals))
                sessionStorage.setItem(kHASHES, JSON.stringify(hashes))

                // if difficulty is easy, remove the habitats and just have random animals
                // this makes it easy because its obvious that a seal is with water and a giraffe is with tall trees.
                // hard is hard because the habitats all look similar of animals in the same section
                let parsed = loaded
                let difficulty = sessionStorage.getItem(kDIFFICULTY)
                if (difficulty == kEASY) { parsed = JSON.parse(sessionStorage.getItem(kONLY_ANIMAL)) }
            })
        })
        
        // delay for a little to make it seem like more is going on :p
        setTimeout(() => {
            resolve({status: 'done'})
        }, 1000)
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
            animalClone.querySelector('.imageCards').src = 'https://drive.google.com/thumbnail?id=1rpHrsEoMftQoboL-we-YCpASq5BV6mtk'

            animalContainer.appendChild(animalClone)
            habitatContainer.appendChild(habitatClone)
        }

        // finally, return the resolve
        resolve({status: 'done'})
    })
}










/**
 * Sets the difficulty of the game.
 * @param {string} type the difficulty to be set.
 */
function setDifficulty(type) { sessionStorage.setItem(kDIFFICULTY, type) }