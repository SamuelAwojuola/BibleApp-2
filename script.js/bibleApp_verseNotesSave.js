/* USING THE FILE SYSTEM ACCESS API --(WORKS ONLY IN CHROMIUM BASED BROWSERS, E.G., EDGE, CHROME)*/
function saveToLocalDrive(jsonVerseNoteData) {
  // store a reference to file handle
  let fileHandle;
  let fileName = `notes_${bookName}.json`; //File name should be bookName with .json extension, e.g., Romans.json
  const pickerOpts = {
    suggestedName: fileName, // `note_Romans.json`
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
    let fileData = await fileHandle.getFile();
    let fileText = await jsonVerseNoteData;
  }
  // Save to file
  async function saveFile() {
    if (!fileHandle) {
      saveFileAs();
    } else {
      let stream = await fileHandle.createWritable(pickerOpts);
      // ensure it is not empty
      let jvnd = jsonVerseNoteData;
      // clog(jvnd.length);
      if ((jvnd == false) || (jvnd == undefined) || (jvnd == null)) {
        alert('FILE IS EMPTY!! err1');
        return
      } else if ((jvnd == "") || jvnd.trim().length == 0) {
        alert('FILE IS EMPTY!! err2');
        return
      } else {
        // clog("File is fine")
      }
      await stream.write(jsonVerseNoteData)
      await stream.close()
    }
  }

  async function saveFileAs() {
    fileHandle = await window.showSaveFilePicker(pickerOpts);
    saveFile()
  }

  return saveFile()
}

/* MODIFY JSON VERSE NOTES FILE */
let noteForCurrentlyEditedVerse;
// let currentURLisGithubSamAwo = /samuelawojuola\.github\.io/.test(window.location.href);

let allBibleBooks = bible.Data.allBooks, objOfRefsWithNote={}, bkIdx=0;
let notesCount = 1;
function findAllBookChptnVersesWithNote(){
    let i = bkIdx;
    bookName=allBibleBooks[i];
    arrayOfRefsWithNote=[];
    //bibleNote for bookName
    getAllRefsInBookThatHaveNote(bookName, function (arrOfrefs) {

      // If book has notes
      if(arrOfrefs.length!=0){
        arrayOfRefsWithNote.push(arrOfrefs)
        objOfRefsWithNote[bookName]=arrOfrefs;
      }
      i++;
      bkIdx=i;
      if(i<allBibleBooks.length){
        findAllBookChptnVersesWithNote()
      }
      available_notes.click()// To automatically open the side menu of notes in verseNotesPage
    })
  return objOfRefsWithNote
}
findAllBookChptnVersesWithNote()
function appendAllRefsWithNote(){
  let detailSum='<em>Notes are available for the following...</em>';
  let openORclose='';// or ' open' if you want it open
  // objOfRefsWithNote = findAllBookChptnVersesWithNote();
    for (key in objOfRefsWithNote) {
      detailSum = `${detailSum}<details ${openORclose}><summary>${key}</summary>${codeWithRefinIt(key,objOfRefsWithNote)}</details>`
    }
    bibleapp_available_notes.innerHTML = detailSum;
  function codeWithRefinIt(bookName,objOfRefsWithNote){
    let arrOfrefs = objOfRefsWithNote[bookName];
    let codeWithRef='<span>';
    let chptNum='';
    arrOfrefs.forEach((ref,i)=> {
      lineend=', '
      // Old Chapter
      if(ref.split(':')[0]==chptNum){
        vrsNum=ref.split(':')[1];
        codeWithRef=`${codeWithRef}${lineend}<code ref="${bookName} ${ref}" aria-hidden="true" chpt="${chptNum}" title="${bookName} ${ref}">${vrsNum}</code>`
      }
      // New Chapter
      else{
        if(document.querySelector('body').matches('#versenotepage')){refsep =''}else{refsep ='; '}
        if(i==0){lineend=''}else{lineend='</span>'+refsep+'<span>'}
        chptNum=ref.split(':')[0];
        vrsNum=ref.split(':')[1];
        codeWithRef=`${codeWithRef}${lineend}<code ref="${bookName} ${ref}" aria-hidden="true" chpt="${chptNum}" title="${bookName} ${ref}"><b>${chptNum}</b>:${vrsNum}</code>`
      }
    });
    return codeWithRef
  }
  return detailSum
}
bibleapp_available_notes.addEventListener("click", codeELmRefClick)
// TO CLOSE OR OPEN ALL DETAILS ON RIGHT CLICK OF SUMMARY
bibleapp_available_notes.addEventListener("contextmenu", openCloseAllAvailableNotesDetail)
if(document.querySelector('#col2')){
  document.querySelector('#col2').addEventListener("contextmenu", openCloseAllAvailableNotesDetail)
  document.querySelector('#col1').addEventListener("contextmenu", appendAllNotesInChapter)
}
function openCloseAllAvailableNotesDetail(e){
  let etarget=e.target;
  if(etarget.matches('summary')){
    clog('sumry')
    let details2openORclose,eParent;
    if(etarget.matches('#col2>details>summary')){
      details2openORclose = '#col2>details';
      eParent = document.querySelector('#col2');
    } else {
      details2openORclose = 'details';
      eParent = bibleapp_available_notes;
    }
    clog(details2openORclose)
    if(etarget.parentElement.open){
      eParent.querySelectorAll(details2openORclose).forEach(dtl=>{dtl.open=false})
    } else {
      eParent.querySelectorAll(details2openORclose).forEach(dtl=>{dtl.open=true})
    }
  }
  e.preventDefault()
}


async function fetchBookNotes(jsBkNm) {
  if (!jsBkNm) {
    jsBkNm = bookName
  }
  let response = await fetch(`bible_notes/notes_${jsBkNm}.json`);
  return await response.json()
}

function readFromVerseNotesFiles(bookName, chapternumber, verseNumber, appendHere) {
  // console.log({bookName, chapternumber, verseNumber, appendHere})
  if ((bookName == undefined) && (chapternumber == undefined) && (verseNumber == undefined)) {
    let refObj = breakDownClickedVerseRef();
    bookName = refObj.bN;
    chapternumber = refObj.bC;
    verseNumber = refObj.cV;
  }

  function getVerseNote() {
    fetchBookNotes().then(jsonObject => {
      bible_book = jsonObject;
      appendNote4selectedVerse();
      // Scroll the verseNote into view
      if(appendHere && !isScrolledIntoView(appendHere.parentElement)){
          appendHere.parentElement.scrollIntoView({behavior: "smooth",block: "end", inline: "nearest"})
      }
    })

    function appendNote4selectedVerse() {
      if (bible_book.notes[chapternumber - 1]['_' + verseNumber]) {
        // clog('hello there')
        //Check for verse number
        noteForCurrentlyEditedVerse = bible_book.notes[chapternumber - 1]['_' + verseNumber];
        // console.log(bible_book.notes[chapternumber - 1].length);
        // console.log(noteForCurrentlyEditedVerse);
        noteForCurrentlyEditedVerse = generateRefsInNote(noteForCurrentlyEditedVerse);
        appendHere.innerHTML = noteForCurrentlyEditedVerse;
        return noteForCurrentlyEditedVerse
      }
    }
  }
  return getVerseNote()
}
/* **************************************************** */
function writeToVerseNotesFiles(bookName, chapternumber, verseNumber) {
  if ((bookName == undefined) && (chapternumber == undefined) && (verseNumber == undefined)) {
    let refObj = breakDownClickedVerseRef();
    bookName = refObj.bN;
    chapternumber = refObj.bC;
    verseNumber = refObj.cV;
  }

  async function fetchBookNotes() {
    const response = await fetch(`bible_notes/notes_${bookName}.json`);
    return await response.json()
  }

  function modifyCreateVerseNote() {
    fetchBookNotes().then(jsonObject => {
      b_bk = jsonObject, writeNote()
    })

    function writeNote() {
      // let newNote = "html so so so";
      let newNote = noteEditingTarget.innerHTML;
      if (newNote == "<p><br><\/p>") {
        noteEditingTarget.innerHTML = null;
        newNote = "";
        return
      }
      newNote = modifyQuotationMarks(newNote);
      /* make copy of all the notes */
      let copyOfAllVerseNotesInCurrentBook = {
        ...b_bk.notes
      };
      let originalVerseNotes = copyOfAllVerseNotesInCurrentBook[chapternumber - 1];
      // console.log(Object.keys(b_bk.notes).length != 0 && b_bk.notes.constructor != Object)

      // let copyOfVerseNotes={...originalVerseNotes};
      // copyOfVerseNotes['_' + verseNumber] = newNote;
      originalVerseNotes['_' + verseNumber] = newNote;
      // console.log(newNote.constructor)

      /* FUNCTION TO SORT THE VERSE NOTES */
      function sortVnotesObj(obj) {
        // keys are in the format '_1'
        // Therefore, remove the '_' and
        // Sort then add back the '_' to the sorted numbers
        let arrayOfKeysInObj = Object.keys(obj);
        let sortedArrayOfOjectsKeys = arrayOfKeysInObj.map(ky => Number(ky.substring(1))).sort(function (a, b) {
          return a - b
        }).map(ky => "_" + ky)
        return sortedArrayOfOjectsKeys.reduce(function (result, key) {
          result[key] = obj[key];
          return result;
        }, {});
      }

      /* REPLACE THE PREVIOUS VERSE NOTES FOR THE CHAPTER WITH THE MODIFIED VERSE NOTES */
      // console.log(originalVerseNotes['_' + verseNumber])
      copyOfAllVerseNotesInCurrentBook[chapternumber - 1] = sortVnotesObj(originalVerseNotes)
      // console.log(copyOfAllVerseNotesInCurrentBook)
      b_bk['notes'] = copyOfAllVerseNotesInCurrentBook;
      let newJSON_data = JSON.stringify(b_bk, null, 4);
      // downloadFile(newJSON_data, 'notes_'+bookName);
      saveToLocalDrive(newJSON_data);
    }
  }
  return modifyCreateVerseNote()
}
/* **************************************************** */
function saveJSONFileToLocalDrive(e) {
  if (e.target.matches('.note_save_button')) {
    bookName = e.target.getAttribute('bk');
    let cNv = e.target.getAttribute('b_cv').split('.')
    chapternumber = cNv[0];
    verseNumber = cNv[1];
    /* MODIFY THE BIBLE NOTES JSON FILE */
    writeToVerseNotesFiles(bookName, chapternumber, verseNumber);
  }
}
/* **************************************************** */
function indicateThatVerseHasNoteInJSONnotes_file() {
  // get the books loaded on the page and get their chapters and verses that have notes, if any
  let allLoadedBooks = main.querySelectorAll('.chptverses');
  let old_bk_name = null;
  allLoadedBooks.forEach(code => {
    let bk_name = code.getAttribute('bookname');
    let bkIndx = '_' + bible.Data.allBooks.indexOf(bk_name);
    if (old_bk_name != bk_name) {
      getAllRefsInBookThatHaveNote(bk_name, function (items) {
        //works iwth JSON files as database
        var len = items.length;
        for (var i = 0; i < len; i += 1) {
          let refCodeToMarkAsHavingNote = document.getElementById(`${bkIndx}.${Number(items[i].split(':')[0])-1}.${Number(items[i].split(':')[1])-1}`);
          if (refCodeToMarkAsHavingNote) {
            refCodeToMarkAsHavingNote.classList.add('noted')
          }
        }
      });
    }
    old_bk_name = bk_name;
  });

}
async function getAllRefsInBookThatHaveNote(bookName, callback) {
  fetchBookNotes(bookName).then(jsonObject => {
    bible_book = jsonObject;
    versesWithNotes()
  })

  function versesWithNotes() {
    var items = [];
    for (key in bible_book.notes) {
      let jsonChapter = bible_book.notes[key];
      if (Object.keys(jsonChapter).length > 0) {
        for (ky in jsonChapter) {
          items.push(`${Number(key)+1}:${Number(ky.substring(1))}`)
        }
      }
    }
    callback(items);
  }
}
async function getAllNotesInChapter(bookName, chptNum, fullRef, appendHere) {
  if(!appendHere){appendHere = document.querySelector('#col2')};

  fetchBookNotes(bookName).then(jsonObject => {
    bible_book = jsonObject;
    notesInBookChapter()
  })

  function notesInBookChapter() {
    appendHere.innerHTML='<div id="context_menu" class="context_menu slideout"></div>';
    var items = [];
    let jsonChapter = bible_book.notes[Number(chptNum)-1];
    if (Object.keys(jsonChapter).length > 0) {
      for (ky in jsonChapter) {
        items.push(`${bookName} ${chptNum}:${Number(ky.substring(1))}`)
        items.push(`${jsonChapter[ky]}`)
      }
    }
    let openOrnot='';
    items.forEach((x,i)=>{
      if((i+1)%2==1){
        openOrnot='';
        if(fullRef == x){openOrnot = 'open id="opened_detail"'}
        appendHere.innerHTML = `${appendHere.innerHTML}<details ${openOrnot}><summary><div class='openCloseIconHolder'></div><h1 class="win2_bcv_ref">${x}</h1></summary><div class="win2_noteholder">${generateRefsInNote(items[i+1])}</div></details>`;
      }
    })
    document.querySelector('#opened_detail').scrollIntoView({behavior: "smooth",block: "start", inline: "nearest"})
  }
}

function appendAllNotesInChapter(e){
  if (e.target.matches('code[ref]')) {
    let codeElm = e.target;
    let refDetails = refDetails4rmCodeElm(codeElm);
    bN = refDetails.bookName;
    bC = refDetails.bookChapter;
    cV = refDetails.chapterVerse;
    getAllNotesInChapter(bN, bC, codeElm.getAttribute('ref'))
  }
}