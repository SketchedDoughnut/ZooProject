/**
 * Changes the image and animal cards on screen.
 * @returns null
 */
function changeCards() {
    return new Promise((resolve) => {

            // hide info and game cards and unhide loading
            setClass('loadingContainer', 'hidden', false)
            setClass('gameContainer', 'hidden', true)
            setClass('infoContainer', 'hidden', true)

            // load everything we need
            // let animalTemplate = cloneTemplate('animalCard')
            let animalTemplate = cloneTemplate('animalCard')
            let habitatTemplate = cloneTemplate('habitatCard')
            let animalContainer = getElement('animalContainer')
            let habitatContainer = getElement('habitatContainer')

            // reset the containers to default templates with no image
            animalContainer.replaceChildren()
            habitatContainer.replaceChildren()

            // reset the selections, hashes, win comparison, scores, etc
            sessionStorage.setItem(kHAB_SEL, 0)
            sessionStorage.setItem(kANIM_SEL, '')
            sessionStorage.setItem(kSEL_COMPARE, false)
            sessionStorage.setItem(kANIM_SEL_HASH, 0)
            sessionStorage.setItem(kCORRECT, 0)
            sessionStorage.setItem(kINFO_CARD_LIST, JSON.stringify([]))
            // sessionStorage.setItem(kINFO_CURRENT_ANIM, "")

            // load three random animals (from a habitat if enabled)
            let animals;
            let sel = [];

            // get our selection of animals based on difficulty
            // if easy, just get the full random list of animals
            let difficulty = sessionStorage.getItem(kDIFFICULTY)
            if (difficulty == kEASY) { animals = JSON.parse(sessionStorage.getItem(kONLY_ANIMAL)) }

            // if hard, choose a habitat and then get the animals
            else if (difficulty == kHARD) {

                // load raw data and get a habitat key
                let lastHabitat = sessionStorage.getItem(kLAST_HABITAT)
                let raw = JSON.parse(sessionStorage.getItem(kRAW))
                let habitatKeys = Object.keys(raw)
                let habitatKey = habitatKeys[getRandomInt(0, habitatKeys.length - 1)]

                // verify we don't have the same habitat as last time
                while (habitatKey == lastHabitat) { habitatKey = habitatKeys[getRandomInt(0, habitatKeys.length - 1)] }
                sessionStorage.setItem(kLAST_HABITAT, habitatKey)
                animals = raw[habitatKey]
            }

            // shuffle the list of animals
            let animKeys = Object.keys(animals)
            animKeys = shuffleArray(animKeys)

            // select three animals at random
            // if we got the same animal as last time, reshuffle
            let lastAnimals = JSON.parse(sessionStorage.getItem(kLAST_ANIMALS))
            for (let i = 0; i < kMAX_CARDS; i++) {
                let animalKey = animKeys[getRandomInt(0, animKeys.length - 1)]

                // make sure we do not match either sel or the previous ones
                while (sel.includes(animalKey) || lastAnimals.includes(animalKey)) { animalKey = animKeys[getRandomInt(0, animKeys.length - 1)] }
                sel.push(animalKey)
            }
            sessionStorage.setItem(kLAST_ANIMALS, JSON.stringify(sel))

            // shuffle habitat and animal pictures to not be aligned with respective matches
            let hashes = JSON.parse(sessionStorage.getItem(kHASHES))
            let habPics = []
            let animPics = []
            for (let i = 0; i < kMAX_CARDS; i++) {
                habPics.push([animals[sel[i]]['habitat'], hashes[sel[i]]])
                animPics.push([animals[sel[i]]['pic'], sel[i]])
            }
            habPics = shuffleArray(habPics, kMAX_CARDS)
            animPics = shuffleArray(animPics, kMAX_CARDS)

            // create three elements of the animal / habitat
            for (let i = 0; i < kMAX_CARDS; i++) {
                let animPicID = animPics[i][0] // the picture ID of the animal
                let animID = animPics[i][1] // the element ID (animal name)
                let habPicID = habPics[i][0] // the picture ID of the habitat 
                let habID = habPics[i][1] // the element id (hash of animal name)

                // create clones of templates
                let animalClone = animalTemplate.cloneNode(true)
                let habitatClone = habitatTemplate.cloneNode(true)

                // set the parameters of the animal card
                let animCard = animalClone.querySelector('.imageCards')
                animCard.id = animID // name of the animal
                animCard.src = getDriveURL(animPicID) // google drive id with the animal picture
                animCard.addEventListener('click', function() {
                    setSelected(animCard.id, true).then(() => { // have this one be selected and none of the others
                        winCheck()
                    })
                })

                // set the parameters of the habitat card
                let habCard = habitatClone.querySelector('.imageCards')
                habCard.id = habID // the hash of the animal that is in this habitat
                habCard.src = getDriveURL(habPicID) // google drive id with the habitat picture
                habCard.addEventListener('click', function() {
                    setSelected(habCard.id, false).then(() => { // have this one be selected and none of the others
                        winCheck()
                    })
                })

                // add the images back in
                animalContainer.appendChild(animalClone)
                habitatContainer.appendChild(habitatClone)
            }

            // unhide game container and hide loading
            setClass('gameContainer', 'hidden', false)
            setClass('loadingContainer', 'hidden', true)

            // finally, return the resolve
            resolve({status: 'done'})
    })
}










/**
 * Gives the selected element the "selected" class and removes it from everyone else in the container.
 * @param {string} id the name of the one to be allowed to be selected
 * @param {boolean} the type of container (animal or habitat)
 * +
 */
function setSelected(id, is_animal) {
    return new Promise((resolve) => {

        // get all elements of the main container
        let mc;
        let cardContainers;
        if (is_animal) { mc = getElement('animalContainer') }
        else { mc = getElement('habitatContainer') }

        // get all of the card containers
        cardContainers = mc.children
        for (i = 0; i < cardContainers.length; i++) {

            // get the img card within
            let container = cardContainers[i]
            let imgElem = container.children[0]

            // if the image is the one that is being clicked
            let imgID = imgElem.id
            if (imgID == id) { 

                // if the one we are selecting contains "right", remove "selected" and continue
                if (imgElem.classList.contains('right')) {
                    setClass(imgElem.id, 'selected', false)
                    continue
                }

                // toggle the selected
                imgElem.classList.toggle('selected')

                // if we toggled 'selected' in the img and its gone, we are un-selecting
                if (!imgElem.classList.contains('selected')) { 
                    if (is_animal) { sessionStorage.setItem(kANIM_SEL, '') }
                    else { sessionStorage.setItem(kHAB_SEL, 0) }
                 }
                else {
                    if (is_animal) { sessionStorage.setItem(kANIM_SEL, imgID) }
                    else { sessionStorage.setItem(kHAB_SEL, imgID) }
                }
                continue
            }

            // for everything else, remove selected
            if ((imgElem.classList.contains('selected'))) { imgElem.classList.toggle('selected') }
        }

        // compare hash of selected animal to selected image
        let selAnimHash = generateHash(sessionStorage.getItem(kANIM_SEL))
        let selHabHash = sessionStorage.getItem(kHAB_SEL)
        sessionStorage.setItem(kSEL_COMPARE, selAnimHash == selHabHash && selAnimHash != '' && selHabHash != 0)
        sessionStorage.setItem(kANIM_SEL_HASH, selAnimHash)

        // finally, return the resolve
        resolve({status: 'done'})
    })
}










/**
 * Loads the information cards for all of the animals that have them
 */
function loadInfoCards() {
    // hide everything besides loading
    setClass('infoContainer', 'hidden', true)
    setClass('gameContainer', 'hidden', true)
    setClass('loadingContainer', 'hidden', false)

    // get info container and clear it
    let infoCont = getElement('infoContainer')
    infoCont.replaceChildren()

    // get the list of all of the animals and all of the animals on screen
    let onlyAnimals = JSON.parse(sessionStorage.getItem(kONLY_ANIMAL))
    let animCardCont = getElement('animalContainer').children

    // go through each animal card and gather animal data (for ones that don't, skip)
    let animIDlist = []
    for (let i = 0; i < animCardCont.length; i++) {

        // check if they have info, if they do add animal name to list with their names
        let animName = animCardCont[i].children[0].id
        let animData = onlyAnimals[animName]
        if (!animData['has_info']) { continue }
        animIDlist.push(animName)
    }

    // if there are no animals, just have a next or home button
    // then return
    if (animIDlist.length <= 0) {
        // clone template and append it
        infoCont.appendChild( cloneTemplate('noInfoButtons').cloneNode(true).cloneNode(true) )
        
        // show this and hide everything else
        setClass('loadingContainer', 'hidden', true)
        setClass('infoContainer', 'hidden', false)
        return
    }

    // store animal ID list
    sessionStorage.setItem(kINFO_CARD_LIST, JSON.stringify(animIDlist))
    // sessionStorage.setItem(kINFO_CURRENT_ANIM, animIDlist[0])

    // set the first one then unhide
    setClass('loadingContainer', 'hidden', true)
    setClass('infoContainer', 'hidden', false)
    changeInfoCard()
}











/**
 * Changes the info card to the next, or redirects to change the cards.
 */
function changeInfoCard() {
    // hide info container and show loading container
    setClass('infoContainer', 'hidden', true)
    setClass('loadingContainer', 'hidden', false)

    // load data
    let cards = JSON.parse(sessionStorage.getItem(kINFO_CARD_LIST))
    let nextAnim;
    let nextCard;
    let callback;
    let cont;

    // clear the current info container
    let infoCont = getElement('infoContainer')
    infoCont.replaceChildren()

    // get the last animal and remove it from the cards
    nextAnim = cards.pop()

    // if the length of the list is 0 now, make it change cards
    if (cards.length <= 0) { callback = changeCards; cont = true }
    else { callback = changeInfoCard; cont = false }

    // create and append element
    nextCard = createInfoCard(nextAnim, callback, cont)
    infoCont.appendChild(nextCard)

    // show info again and hide loading, and save new cards list
    sessionStorage.setItem(kINFO_CARD_LIST, JSON.stringify(cards))
    setClass('loadingContainer', 'hidden', true)
    setClass('infoContainer', 'hidden', false)
}