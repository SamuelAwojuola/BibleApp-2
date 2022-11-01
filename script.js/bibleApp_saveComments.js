/* DOWNLOAD MODIFIED JSON FILE */
/* ******************************************************************* */
function downloadFile(text_data, name = "myData", format = "json") {/* https://www.youtube.com/watch?v=io2blfAlO6E */
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
/* ******************************************************************* */

/* ******************************************************************* */
/* USIN THE FILE SYSTEM ACCESS API --(WORKS ONLY IN CHROMIUM BASED BROWSERS, E.G., EDGE, CHROME)*/
function saveToLocalDrive(jsonVerseNoteData) {
  // store a reference to our file handle
  let fileHandle;
  let fileName; //File name should be bookName with .json extension, e.g., Romans.json
  const pickerOpts = {
    suggestedName: `notes_${currentBookName}.json`, // `note_Romans.json`
    // startIn: 'C:\/Users\/samue\/OneDrive\/Desktop\/Folders on Desktop\/LC Apps\/LC BibleApp 2.0\/bible_notes',
    types: [{
      description: 'Text Files',
      accept: {
        'text/plain': ['.json'],
      }
    }, ],
    excludeAcceptAllOption: true,
    multiple: false
  };

  //Get file
  async function getFileToSaveTo() {
    [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    let fileData = await fileHandle.getFile()
    let fileText = await jsonVerseNoteData
    // fileName = fileData.name; //get the file name to ensure that the file that is saved to is the edited file
    // if (fileData.type == 'application\/json') {
    //   console.log(JSON.parse(fileText))
    // }
    // console.log(fileData);
    // console.log(fileText);
    // console.log(fileName);
  }
  // Save to file
  async function saveFile() {
    if(!fileHandle){await getFileToSaveTo()};
    let stream = await fileHandle.createWritable(pickerOpts);
    await stream.write(jsonVerseNoteData)
    await stream.close()
  }

  async function saveFileAs() {
    [fileHandle] = await window.showSaveFilePicker(pickerOpts);
    saveFile()
  }

  return saveFile()
}
/* ******************************************************************* */
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
/* ******************************************************************* */

/* ******************************************************************* */
/* MODIFY JSON VERSE NOTES FILE */
let currentlyEditedVerseNote;

function readFromVerseNotesFiles(bookName, chapternumber, verseNumber) {
  if ((bookName == undefined) && (chapternumber == undefined) && (verseNumber == undefined)) {
      let refObj = breakDownClickedVerseRef();
      bookName = refObj.bN;
      chapternumber = refObj.bC;
      verseNumber = refObj.cV;
  }

  async function fetchBookNotes() {
      const response = await fetch(`/bible_notes/notes_${bookName}.json`);
      return await response.json()
  }

  function getVerseNote() {
      fetchBookNotes().then(jsonObject => {
          bible_book = jsonObject,readNotes()
      })
      function readNotes(){
          if (bible_book.notes[chapternumber - 1]['_' + verseNumber]) {
              //Check for verse number
              currentlyEditedVerseNote = bible_book.notes[chapternumber - 1]['_' + verseNumber];
              console.log(bible_book.notes[chapternumber - 1].length);
              console.log(currentlyEditedVerseNote);
              return currentlyEditedVerseNote
          }
      }
  }
  return getVerseNote()
}

function writeToVerseNotesFiles(bookName, chapternumber, verseNumber) {
  if ((bookName == undefined) && (chapternumber == undefined) && (verseNumber == undefined)) {
      let refObj = breakDownClickedVerseRef();
      bookName = refObj.bN;
      chapternumber = refObj.bC;
      verseNumber = refObj.cV;
  }

  async function fetchBookNotes() {
      const response = await fetch(`/bible_notes/notes_${bookName}.json`);
      return await response.json()
  }

  function modifyCreateVerseNote() {
      fetchBookNotes().then(jsonObject => {
          b_bk = jsonObject,writeNote()
      })
      function writeNote(){
          // let newNote = "html so so so";
          let newNote = noteEditingTarget.innerHTML;
          /* make copy of all the notes */
          // let copyOfAllVerseNotesInCurrentBook=b_bk.notes;
          // let copyOfAllVerseNotesInCurrentBook=b_bk.notes.slice();
          let copyOfAllVerseNotesInCurrentBook={...b_bk.notes};
          let originalVerseNotes = copyOfAllVerseNotesInCurrentBook[chapternumber-1];
          console.log(Object.keys(b_bk.notes).length != 0 && b_bk.notes.constructor != Object)
          
          // let copyOfVerseNotes={...originalVerseNotes};
          // copyOfVerseNotes['_' + verseNumber] = newNote;
          originalVerseNotes['_' + verseNumber] = newNote;
          console.log(newNote.constructor)

          /* FUNCTION TO SORT THE VERSE NOTES */
          function sortVnotesObj(obj) {
              // keys are in the format '_1'
              // Therefore, remove the '_' and
              // Sort then add back the '_' to the sorted numbers
              let arrayOfKeysInObj = Object.keys(obj);
              let sortedArrayOfOjectsKeys = arrayOfKeysInObj.map(ky=>Number(ky.substring(1))).sort(function(a, b){return a-b}).map(ky=>"_"+ky)
              return sortedArrayOfOjectsKeys.reduce(function (result, key) {
                  result[key] = obj[key];
                  return result;
              }, {});
          }

          /* REPLACE THE PREVIOUS VERSE NOTES FOR THE CHAPTER WITH THE MODIFIED VERSE NOTES */
          console.log(originalVerseNotes['_' + verseNumber])
          console.log(copyOfAllVerseNotesInCurrentBook[chapternumber-1] = sortVnotesObj(originalVerseNotes))
          console.log(copyOfAllVerseNotesInCurrentBook)
          b_bk['notes']=copyOfAllVerseNotesInCurrentBook;
          let newJSON_data = JSON.stringify(b_bk);
          downloadFile(newJSON_data, 'notes_'+bookName);
          saveToLocalDrive(newJSON_data);
      }
  }
  return modifyCreateVerseNote()
}
/* ******************************************************************* */

ppp.addEventListener("click", saveJSONFileToLocalDrive);//For '#note_save_button'

function saveJSONFileToLocalDrive(e) {
  if (e.target.matches('.note_save_button')) {
      /* MODIFY THE BIBLE NOTES JSON FILE */
      writeToVerseNotesFiles();
  }
}