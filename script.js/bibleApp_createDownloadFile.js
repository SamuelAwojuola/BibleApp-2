/* https://www.youtube.com/watch?v=io2blfAlO6E */
function downloadFile(text_data, name = "myData", format = "json") {
    // const blob = new Blob([JSON.stringify(obj, null, 2)], {
    //     type: "application/json",
    //   });
    console.log(name)
    const blob = new Blob([text_data], {
        type: "application/octet-stream",
    });
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
        href,
        styles: "display:none",
        download: `${name}.${format}` // myData.json
    })
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(href);
    a.remove(a);
}

// FINAL FORMAT
/* {
        "book":"Daniel",
        "notes": [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "_1":"<p>Michael is mentioned again.<\/p><p>There is certainly a prupose to the mentioning of Michael.<\/p>",

                "_2":"<p>Michael has something to do with the resurrection. Consider that he was also involved in the resurection of Moses when Satan contended against him.<\/p>"
            }
        ]
} */
let currentlyEditedVerseNote;
function readWriteFromVerseNotesFiles(bookName, chapternumber, verseNumber) {
    const versenote_promise = fetch(`/bible_notes/notes_${bookName}.json`);
    versenote_promise
        .then(response => response.json())
        .then(jsonObject => {
            bible_book = jsonObject, getVerseNote()
        });

    function getVerseNote() {
        if (bible_book.notes[chapternumber - 1]['_'+verseNumber]) {
            //Check for verse number
            currentlyEditedVerseNote=bible_book.notes[chapternumber - 1]['_'+verseNumber];
            console.log(currentlyEditedVerseNote);
            return currentlyEditedVerseNote
        }
    }
}

function modifyVerseNote() {
    currentVerseInJSON=[innerHTMLofVerseNote];
    console.log('modifyVerseNote')
}

function readORwrite() {
    return {
        write: modifyVerseNote(),
        read: getVerseNote()
    }
}