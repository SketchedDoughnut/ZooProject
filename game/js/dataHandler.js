// the indexedDB object itself
let db;

window.addEventListener('load', function () {
    openDB('test')
})

window.addEventListener("beforeunload", function() {
    closeDB()
})

/**
 * Attempts to create a new IndexedDB object.
 * @param {string} name the name of the databse object to open.
 * @returns {boolean} whether it succeeded or not
 */
function openDB(name = 'default') {
    // made with
    // https://github.com/mdn/dom-examples/blob/main/to-do-notifications/scripts/todo.js
    // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

    // whether succeeded or not
    let succeeded = false

    // open a request to get a database
    const DBOpenRequest = window.indexedDB.open(name, 4)

    // Register two event handlers to act on the database being opened successfully, or not
    DBOpenRequest.onerror = (event) => {
        /** @TODO develop a better way of handling this */
        console.log("Error accessing database")
        console.log(event.error)
        succeeded = false
    };

    DBOpenRequest.onsuccess = (event) => {
        console.log("Success accessing database")

        // Store the result of opening the database in the db variable
        db = DBOpenRequest.result;
        succeeded = true
    };

    // This event handles the event whereby a new version of the database needs to be created
    // Either one has not been created before, or a new version number has been submitted via the
    // window.indexedDB.open line above
    //it is only implemented in recent browsers
    DBOpenRequest.onupgradeneeded = (event) => {
        db = event.target.result;
        };

    // return the final state of the creation of the db
    return succeeded
}

/**
 * Attempts to close the created IndexedDB object.
 * @returns {boolean} whether it succeeded or not.
 */
function closeDB() {
    // made with 
    // https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/deleteDatabase

    let succeeded = false

    console.log('requesting deletion of db with name:', db.name)
    const DBDeleteRequest = window.indexedDB.deleteDatabase(db.name)

    DBDeleteRequest.onerror = (event) => {
    console.error("Error deleting database.");
    succeeded = false
    };

    DBDeleteRequest.onsuccess = (event) => {
    console.log("Database deleted successfully");
    succeeded = true
    console.log(event.result); // should be undefined
    };

    return succeeded
}