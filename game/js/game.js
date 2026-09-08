///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Data formats (so I know what in the world is going on)
 * in session storage:
 * - kDifficulty is either kEASY or kHARD, a literal string
 * - kONLY_ANIMAL is a dictionary with {"animal name": {"natural": "url", "habitat": "url"}}
 * - kHASHES is a dictionary with {"animal name": number representing a unique hash}
 */

///////////////////////////////////////////////////////////////////////////////////////////////

// runs on load of the page
window.addEventListener("load", function() {
    // hide the game container
    setClass('gameContainer', 'hidden', true)

    // set difficulty to easy if doesn't exist in session storage
    if (!sessionStorage.getItem(kDIFFICULTY)) { setDifficulty(kEASY) }

    // reset last habitat, last animals, whether the answer is correct
    sessionStorage.setItem(kLAST_HABITAT, "")
    sessionStorage.setItem(kLAST_ANIMALS, JSON.stringify([]))
    sessionStorage.setItem(kCORRECT, JSON.stringify(0))

    // load the data and parse it, then load the first cards, then hide the loading page
    // new Promise(() => { setClass() })
    loadData().then(() => {
    preloadImages().then(() => {
    changeCards().then(() => {
    isElementLoaded("#loadingContainer").then(() => {
        setClass('loadingContainer', 'hidden', true)
        setClass('gameContainer', 'hidden', false)
    })
    })
    })
    })
})




/**
 * Loads all of the images beforehand in order to make displaying later smooth
 * @returns null
 */
function preloadImages() {
    // from https://macarthur.me/posts/preloading-images
    return new Promise((resolve) => {
        // create all of our constants and stuff
        const raw = JSON.parse(sessionStorage.getItem(kRAW))['other']
        const loadingText = document.getElementById('loadingText')

        // initialize loading text
        loadingText.textContent += " 0/" + Object.keys(raw).length*2

        // format all of our links for loading
        let links = []
        for (let animal of Object.keys(raw)) {
            let animInfo = raw[animal]
            let animImageID = animInfo['pic']
            let habitatImageID = animInfo['habitat']
            let animLink = 'https://github.com/SketchedDoughnut/ZooProject/blob/main/assets/img/' + animal + '/' + animImageID + '.JPG?raw=true'
            let habLink = 'https://github.com/SketchedDoughnut/ZooProject/blob/main/assets/img/' + animal + '/' + habitatImageID + '.JPG?raw=true'
            links.push(animLink)
            links.push(habLink)
        }
        
        // go through every link and preload
        let promises = []
        let counter = 0
        for (let link of links) {
            // create a new promise so we can wait for all of them to load
            let newPromise = new Promise((resolve) => {
                let linkObject = document.createElement('link')
                linkObject.rel = 'preload'
                linkObject.as = 'image'
                linkObject.href = link
                linkObject.fetchPriority = 'high'

                // function for what to do when resolved
                function resolvedFunction() {
                    // edit the loading text and update the number
                    counter += 1
                    let spl = loadingText.textContent.split('...')
                    loadingText.textContent = spl[0] + '... ' + counter + '/' + links.length

                    console.log('image resolved!')
                    resolve({'status': 'done'})
                }

                linkObject.onload = resolvedFunction
                linkObject.onerror = resolvedFunction

                // add the link to the head of the document for preloading
                document.head.append(linkObject)
            })
            promises.push(newPromise)
        }

        // wait until all promises have resolved, then resolve
        Promise.all(promises).then(() => {
            resolve({'status': 'done'})
        })
    })
}




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
                let animSlides = {}

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
                        animSlides[animalKey] = animal['slides']
                        
                        // generate a randomized hash for all of the animals
                        hashes[animalKey] = generateHash(animalKey)
                    }
                }
                sessionStorage.setItem(kRAW, JSON.stringify(loaded))
                sessionStorage.setItem(kONLY_ANIMAL, JSON.stringify(onlyAnimals))
                sessionStorage.setItem(kHASHES, JSON.stringify(hashes))
                sessionStorage.setItem(kANIM_SLIDES, JSON.stringify(animSlides))

                // if difficulty is easy, remove the habitats and just have random animals
                // this makes it easy because its obvious that a seal is with water and a giraffe is with tall trees.
                // hard is hard because the habitats all look similar of animals in the same section
                let parsed = loaded
                let difficulty = sessionStorage.getItem(kDIFFICULTY)
                if (difficulty == kEASY) { parsed = JSON.parse(sessionStorage.getItem(kONLY_ANIMAL)) }

                // finally, return the resolve
                resolve({status: 'done'})
            })
        })
        
    })
}










/**
 * Check when two animals are matched, and mark them as correct. 
 * Most correct answers has an info card. If all three are right, then
 * the cards will change.
 * @returns null
 */
function winCheck() {
    return new Promise((resolve) => {

        // get win state and the selected hab and anim
        let win = sessionStorage.getItem(kSEL_COMPARE) == 'true'
        let selAnim = sessionStorage.getItem(kANIM_SEL)
        let selHab = sessionStorage.getItem(kHAB_SEL)

        // if they did not get the animals right (and habitat and animal are not null)
        if (!win && selAnim != "" && selHab != 0) {
            let habElem = getElement(selHab)
            setClass(selAnim, 'selected', false)
            sessionStorage.setItem(kANIM_SEL, "")
            sessionStorage.setItem(kHAB_SEL, 0)
            setClass(selHab, 'wrong', true)
            setClass(selHab, 'selected', false)
        }

        // if they did get the animal-habitat pair right
        if (win) {

            // update win count
            let winCount = JSON.parse(sessionStorage.getItem(kCORRECT))
            sessionStorage.setItem(kCORRECT, JSON.stringify(winCount += 1))

            // set the two selected classes to right and remove selected
            setClass(selAnim, 'right', true)
            setClass(selAnim, 'selected', false)
            setClass(selHab, 'right', true)
            setClass(selHab, 'selected', false)

            // remove them from SEL
            sessionStorage.setItem(kANIM_SEL, "")
            sessionStorage.setItem(kHAB_SEL, 0)

            // get rid of any of the wrongs
            let animContainer = getElement('animalContainer')
            let habContainer = getElement('habitatContainer')
            animCardCont = animContainer.children
            habCardCont = habContainer.children
            for (let i = 0; i < animCardCont.length; i++) {
                let animImg = animCardCont[i].children[0]
                let habImg = habCardCont[i].children[0]
                setClass(animImg.id, 'wrong', false)
                setClass(habImg.id, 'wrong', false)
            }

            // if they got all right, show the three info cards
            if (JSON.parse(sessionStorage.getItem(kCORRECT)) >= 3) { loadInfoCards() }
        }
        
        // finally, resolve
        resolve({status: 'done'})

    })
}