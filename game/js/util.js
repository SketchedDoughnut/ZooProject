/**
 * Sets the difficulty of the game.
 * @param {string} type the difficulty to be set.
 */
function setDifficulty(type) { sessionStorage.setItem(kDIFFICULTY, type) }











/**
 * 
 * @param {string} animID the ID of the animal a card is being generated for
 * @param {CallableFunction} callback the function to be called when next is clicked
 * @returns DOM element of an info card
 */
function createInfoCard(animID, callback) {
    // get the info template and clone it
    let infoTemplate = cloneTemplate('infoCard')
    let infoClone = infoTemplate.cloneNode(true)

    // get animal data
    let onlyAnimals = JSON.parse(sessionStorage.getItem(kONLY_ANIMAL))
    let animInfo = onlyAnimals[animID]
    
    // get all of the data
    let inf = animInfo['info']
    let animName = inf['name']
    let slides = inf['slides']
    let nat_hab = inf['natural_hab']
    let zoo_hab = inf['zoo_hab']
    let consv = inf['conservation']

    // set all of the data
    infoClone.querySelector('#animName').innerText = animName
    infoClone.querySelector('#info_slideshow_container #info #nat_hab').innerText = nat_hab
    infoClone.querySelector('#info_slideshow_container #info #zoo_hab').innerText = zoo_hab
    infoClone.querySelector('#info_slideshow_container #info #consv').innerText = consv
    infoClone.querySelector("#buttons #home").addEventListener('click', () => {
        redirect('../landing')
    })
    infoClone.querySelector("#buttons #next").addEventListener('click', callback)

    return infoClone
}