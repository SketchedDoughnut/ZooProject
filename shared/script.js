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
 * @param {boolean} add_url whether to add the current URL to the input or not.
 */
function redirect(page, add_url = false) {
  let newUrl = ''
  if (add_url) { newUrl += window.location.toString }
  // window.location.href = newUrl += page
  window.location.assign(newUrl + page)
}