// Modified from code on ::: https://www.w3.org/TR/IndexedDB/
// function indexedDBgeneric(nameOfDataBase = "library"){
// Create a DataBase
let nameOfDataBase = "LC_Bible_Notes";
let db;

//The notes are under Bible Books, e.g., Genesis, Revelation, ICorinthians, etc.
//They will be supplied dynamically
let bibleBook_IDB;

function createDB(appendOBJ, func) {
    const request = indexedDB.open(nameOfDataBase);

    request.onupgradeneeded = function () {
        // The database did not previously exist, so create object stores and indexes.
        const db = request.result;
        const store = db.createObjectStore(bibleBook_IDB, {
            keyPath: "id" // bookChapter&Verse will be the key
        });
        // const titleIndex = store.createIndex("by_title", "title", {
        //     unique: true
        // });
        const refIndex = store.createIndex("by_ref", 'bCbV', {
            unique: true
        });
        // const authorIndex = store.createIndex("by_versenote", "verse_note");

        console.log((appendOBJ));
        if (appendOBJ) {
            store.put(appendOBJ);
        }
        if(func){func}
    };
    request.onsuccess = function () {
        db = request.result;
        // store.put(appendOBJ);
        // if(populatefunc){populateDB()}//If it was called from inside the populateDB function, then the 'populatefunc' variable will be 1
        // the populateDB function cannot run if the db has not been set
    };
}
let populatefunc = 0;

// Populate the database using a transaction.

function populateDB(_bCbV, verseNote) {
    let appendOBJ = {
        // id: _bCbV,
        // bCbV: _bCbV,
        id: Number(_bCbV),
        bCbV: Number(_bCbV),
        verse_note: verseNote,
    };
    console.log(bibleBook_IDB)
    const tx = db.transaction(bibleBook_IDB, "readwrite");
    const store = tx.objectStore(bibleBook_IDB);

    store.put(appendOBJ);
    // store.put({
    //     title: "Water Buffaloes",
    //     author: "Fred",
    //     isbn: 234567
    // });
    // store.put({
    //     title: "Bedrock Nights",
    //     author: "Barney",
    //     isbn: 345678
    // });

    tx.oncomplete = function () {
        // All requests have succeeded and the transaction has committed.
    };

}

// Look up a single book in the database by title using an index.

function lookUpBookbyCVref(bCbV) {
    function lookUp() {
        console.log('looking up')
        const tx = db.transaction(bibleBook_IDB, "readonly");
        const store = tx.objectStore(bibleBook_IDB);
        const index = store.index("by_ref");

        // const request = index.get("Bedrock Nights");
        const request = index.get(bCbV);
        request.onsuccess = function () {
            const matching = request.result;
            if (matching !== undefined) {
                // A match was found.
                console.log(matching.id, matching.verse_note);
                return matching.verse_note
            } else {
                // No match was found.
                console.log('No match was found');
                return null
            }
        };
    }
    if (db) {
        lookUp()
    } else {
        console.log(db)
        return false
    }

}

// Look up all books in the database by author using an index and a cursor.
function lookupBookbyIndxnCursor() {

    const tx = db.transaction(bibleBook_IDB, "readonly");
    const store = tx.objectStore(bibleBook_IDB);
    const index = store.index("by_author");

    const request = index.openCursor(IDBKeyRange.only("Fred"));
    request.onsuccess = function () {
        const cursor = request.result;
        if (cursor) {
            // Called for each matching record.
            report(cursor.value.id, cursor.value.verse_note, cursor.value.bCbV);
            cursor.continue();
        } else {
            // No more matching records.
            report(null);
        }
    };
}

/* **************************************************************************** */
/* **************************************************************************** */
/* **************************************************************************** */

// //Check if DataBase exists
// // (await window.indexedDB.databases()).map(db => db.name).includes("LC_Bible_Notes");

function save_verse_note_to_indexedDB(e) {
    if (e.target.matches('.note_save_button')) {
        bibleBook_IDB = e.target.getAttribute('bk');
        console.log(e.target.getAttribute('b_cv'))
        let _bCbV = e.target.getAttribute('b_cv');

        let verseNote = elmAhasElmOfClassBasAncestor(e.target, '.verse_note').querySelector('.text_content').innerHTML;

        console.log(verseNote)

        populateDB(_bCbV, verseNote)
        /* IF verse note exists in indXDB, modify it */
    }
}

function getNoteFromIDBifAvailable(bN, _bCbV, whereTOappend) {

    bibleBook_IDB = bN; //the name of the database to check
    // let verseNote = lookUpBookbyCVref(_bCbV)
    // let verseNote = lookUpBookbyCVref(Number(_bCbV));
    console.log(bibleBook_IDB)
    const tx = db.transaction(bibleBook_IDB, "readonly");
    const store = tx.objectStore(bibleBook_IDB);
    const index = store.index("by_ref");

    // const request = index.get("Bedrock Nights");
    const request = index.get(Number(_bCbV));
    request.onsuccess = function () {
        const matching = request.result;
        if (matching !== undefined) {
            // A match was found.
            console.log(matching.id, matching.verse_note);
            // if (verseNote != false || verseNote != undefined || verseNote != null) {
                whereTOappend.innerHTML = matching.verse_note;
            // }
            return matching.verse_note
        } else {
            // No match was found.
            console.log('No match was found');
            return null
        }
    };


}

// function getBibleBooksSavedNotes(bookName) {
//     // let db = LC_Bible_Notes
//     db.collection(bookName).orderBy('id').get().then(users => {
//         console.log('users: ', users)
//     })
// }