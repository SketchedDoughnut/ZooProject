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