
// set up any constants
const kDIFFICULTY = 'difficulty' // difficulty
const kEASY = 'easy' // difficulty
const kHARD = 'hard' // difficulty
const kRAW = 'raw' // the raw loaded data (for habitats)
const kONLY_ANIMAL = 'only animals' // session storage
const kHASHES = 'hashes' // hashes for name : hash of name
const kLAST_HABITAT = 'last habitat' // the last habitat that was shown (to avoid repition)
const kLAST_ANIMALS = 'last animals' // the last animals that were shown (to avoid repition)
const kANIM_SEL = 'animal selected' // what animal is currently selected
const kHAB_SEL = 'habitat selected' // what habitat is currently selected

///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Data formats (so I know what in the wrorld is going on)
 * in session storage:
 * - kDifficulty is either kEASY or kHARD, a literal string
 * - kONLY_ANIMAL is a dictionary with {"animal name": {"natural": "url", "habitat": "url"}}
 * - kHASHES is a dictionary with {"animal name": number representing a unique hash}
 */

///////////////////////////////////////////////////////////////////////////////////////////////

// runs on load of the page
window.addEventListener("load", function() {
    // clear session storage before storing anything new
    // sessionStorage.clear()

    // set difficulty to easy if doesn't exist in session storage
    if (!sessionStorage.getItem(kDIFFICULTY)) { setDifficulty(kEASY) }
    sessionStorage.setItem(kLAST_HABITAT, "")
    sessionStorage.setItem(kLAST_ANIMALS, JSON.stringify([]))
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
                        hashes[animalKey] = generateHash(animalKey)
                    }
                }
                sessionStorage.setItem(kRAW, JSON.stringify(loaded))
                sessionStorage.setItem(kONLY_ANIMAL, JSON.stringify(onlyAnimals))
                sessionStorage.setItem(kHASHES, JSON.stringify(hashes))

                // if difficulty is easy, remove the habitats and just have random animals
                // this makes it easy because its obvious that a seal is with water and a giraffe is with tall trees.
                // hard is hard because the habitats all look similar of animals in the same section
                let parsed = loaded
                let difficulty = sessionStorage.getItem(kDIFFICULTY)
                if (difficulty == kEASY) { parsed = JSON.parse(sessionStorage.getItem(kONLY_ANIMAL)) }

                resolve({status: 'done'})
            })
        })
        
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

        // reset the containers to default templates with no image
        animalContainer.replaceChildren()
        habitatContainer.replaceChildren()

        // load three random animals (from a habitat if enabled)
        let animals;
        let sel = [];

        // get our selection of animals based on difficulty
        // if easy, just get the full random list of animals
        let difficulty = sessionStorage.getItem(kDIFFICULTY)
        if (difficulty == kEASY) {
            animals = JSON.parse(sessionStorage.getItem(kONLY_ANIMAL))
        }
        // if hard, choose a habitat and then get the animals
        else if (difficulty == kHARD) {
            // load raw data and get a habitat key
            let lastHabitat = sessionStorage.getItem(kLAST_HABITAT)
            let raw = JSON.parse(sessionStorage.getItem(kRAW))
            let habitatKeys = Object.keys(raw)
            let habitatKey = habitatKeys[getRandomInt(0, habitatKeys.length - 1)]

            // verify we don't have the same habitat as last time
            while (habitatKey == lastHabitat) {
                habitatKey = habitatKeys[getRandomInt(0, habitatKeys.length - 1)]
            }
            sessionStorage.setItem(kLAST_HABITAT, habitatKey)
            animals = raw[habitatKey]
        }

        // shuffle the list of animals
        let animKeys = Object.keys(animals)
        animKeys = shuffleArray(animKeys)

        // select three animals at random
        // if we got the same animal as last time, reshuffle
        let lastAnimals = JSON.parse(sessionStorage.getItem(kLAST_ANIMALS))
        for (let i = 0; i < 3; i++) {
            let animalKey = animKeys[getRandomInt(0, animKeys.length - 1)]
            // make sure we do not match either sel or the previous ones
            while (sel.includes(animalKey) || lastAnimals.includes(animalKey)) {
                animalKey = animKeys[getRandomInt(0, animKeys.length - 1)]
            }
            sel.push(animalKey)
        }
        sessionStorage.setItem(kLAST_ANIMALS, JSON.stringify(sel))

        // shuffle habitat and animal pictures to not be aligned with respective matches
        let habPics = []
        let animPics = []
        for (let i = 0; i < 3; i++) {
            habPics.push(animals[sel[i]]['habitat'])
            animPics.push(animals[sel[i]]['pic'])
        }
        habPics = shuffleArray(habPics, 3)
        animPics = shuffleArray(animPics, 3)

        // create three elements of the animal / habitat
        let hashes = JSON.parse(sessionStorage.getItem(kHASHES))
        for (let i = 0; i < 3; i++) {
            // let anim = animals[sel[i]]
            // let animPicID = anim['pic']
            // let habPicID = anim['habitat']
            let animHash = hashes[sel[i]]
            animPicID = animPics[i]
            habPicID = habPics[i]

            // create clones of templates
            let animalClone = animalTemplate.cloneNode(true)
            let habitatClone = habitatTemplate.cloneNode(true)

            // set the parameters of the animal card
            let animCard = animalClone.querySelector('.imageCards')
            animCard.id = sel[i] // name of the animal
            animCard.src = getDriveURL(animPicID) // google drive id with the animal picture
            animCard.addEventListener('click', function() {
                // have this one be selected and none of the others
                setSelected(animCard.id)
            })

            // set the parameters of the habitat card
            let habCard = habitatClone.querySelector('.imageCards')
            habCard.id = animHash // the hash of the animal that is in this habitat
            habCard.src = getDriveURL(habPicID) // google drive id with the habitat picture
            habCard.addEventListener('click', function() {
                // have this one be selected and none of the others
                setSelected(habCard.id)
            })

            // add the images back in
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









/**
 * Gives the selected element the selected class and removes it from everyone else in the container.
 * @param {string} id the name of the one to be allowed to be selected
 * @param {boolean} the type of container (animal or habitat)
 * +
 */
function setSelected(id, is_animal = true) {
    // get all elements of the main container
    let mc;
    let cardContainers;
    if (is_animal) { mc = getElement('animalContainer') }
    else { mc = getElement('habitatContainer') }
    // get all of the card containers
    cardContainers = mc.getElementsByClassName('cardContainer')
    for (i = 0; i < cardContainers.length + 1; i++) {
        // get the img card within
        let container = cardContainers[i]
        container.getElementByID()
    }
}








/**
 * Generates the Google Drive URL for an image based on its ID.
 * @param {string} id the ID of the image
 * @returns {string} the Google Drive URL for the image
 */
function getDriveURL(id) {
    return `https://drive.google.com/thumbnail?id=${id}`
}