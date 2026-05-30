/**
 * Waits until an element is loaded to continue.
 * @param {*} selector the ID of the element to get: "#exampleID"
 * @returns when the element is loaded
 */
//https://www.nikitakazakov.com/js-wait-until-loaded-dom-element
const isElementLoaded = async selector => {
  while ( document.querySelector(selector) === null) {
    await new Promise( resolve => requestAnimationFrame(resolve) )
  }
  return document.querySelector(selector);
};

/**
 * Redirects to a different webpage.
 * @param {string} page 
 */
function redirect(page) {
  window.location.assign(page)
}

/**
 * A shorthand function to get an element from the document.
 * @param {string} id 
 * @returns HTMLElement | null
 */
function getElement(id) { return document.getElementById(id) }

/**
 * Clones an HTML template.
 * @param {string} id 
 * @returns any
 */
function cloneTemplate(id) { return document.getElementById(id).content.cloneNode(true) }

/**
 * Generate a hash of a string
 * @param {string} input 
 * @returns a 32bit integer
 */
const generateHash = (input) => {
  // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
  let hash = 0;
  for (const char of input) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Constrain to 32bit integer
  }
  return hash;
};

/**
 * Gets a random integer between min and max.
 * @param {Number} min 
 * @param {Number} max 
 * @returns Number
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles the content of a list
 * @param {Array} arrray 
 * @param {Number} rep how many times to repeat the shuffle (multiples of array.length - 1
 * @returns Array
 */
function shuffleArray(array,rep = 1) {
  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  for (i = (array.length - 1) * rep; i > 1; i--) {
      let j = getRandomInt(0, array.length - 1)
      let copy = array[j]
      array.splice(j, 1)
      array.push(copy)
  }
  return array
}