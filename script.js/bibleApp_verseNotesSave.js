/* MODIFY JSON VERSE NOTES FILE */
let noteForCurrentlyEditedVerse;
// let currentURLisGithubSamAwo = /samuelawojuola\.github\.io/.test(window.location.href);

let allBibleBooks = bible.Data.allBooks, objOfRefsWithNote={}, bkIdx=0;
let notesCount = 1;
function findAllBookChptnVersesWithNote(){
  // This generates 'arrOfrefs' which is used by 'appendAllRefsWithNote()'
  let i = 0;
  let bookName=allBibleBooks[i];
  arrayOfRefsWithNote=[];
  //bibleNote for bookName
    getAllRefsInBookThatHaveNote(bookName, buildArrayOfRefs)
    function buildArrayOfRefs(arrOfrefs) {
      // If book has notes
      if(arrOfrefs.length!=0){
        arrayOfRefsWithNote.push(arrOfrefs)
        objOfRefsWithNote[bookName]=arrOfrefs;
      }
      i++;
      if(i < allBibleBooks.length){
        bookName=allBibleBooks[i];
        getAllRefsInBookThatHaveNote(bookName, buildArrayOfRefs)
      } else {
        appendAllRefsWithNote()
        if (document.body.matches('#homepage')) {
          appendMarkersToSideBar()
        }
      }
    }
    return objOfRefsWithNote
}
findAllBookChptnVersesWithNote()
function appendAllRefsWithNote(){
  // let detailSum='<em>Available Notes</em>';
  let detailSum='';
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
    })
    return codeWithRef
  }
  return detailSum
}
bibleapp_available_notes.addEventListener("click", codeElmRefClick)
bibleapp_available_notes.addEventListener("click", appendAllNotesInChapter)// Open all notes in chapter on click of chapter number of a reference with available verseNote
// TO CLOSE OR OPEN ALL DETAILS ON RIGHT CLICK OF SUMMARY
bibleapp_available_notes.addEventListener(contextMenu_touch, openCloseAllAvailableNotesDetail)
if(document.querySelector('#col2')){
  document.querySelector('#col2').addEventListener(contextMenu_touch, openCloseAllAvailableNotesDetail)
  document.querySelector('#col1').addEventListener(contextMenu_touch, appendAllNotesInChapter)
}
function openCloseAllAvailableNotesDetail(e){
  let etarget=e.target;
  if(etarget.matches('summary')){
    // clog('sumry')
    let details2openORclose,eParent;
    if(etarget.matches('#col2>details>summary')){
      details2openORclose = '#col2>details';
      eParent = document.querySelector('#col2');
    } else {
      details2openORclose = 'details';
      eParent = bibleapp_available_notes;
    }
    // clog(details2openORclose)
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

async function readFromVerseNotesFiles(bookName, chapternumber, verseNumber, appendHere) {
  let newVerseNote;
  if ((bookName == undefined) && (chapternumber == undefined) && (verseNumber == undefined)) {
    let refObj = breakDownClickedVerseRef();
    bookName = refObj.bN;
    chapternumber = refObj.bC;
    verseNumber = refObj.cV;
  }

  async function getVerseNote() {
    bible_book = await fetchBookNotes();
    appendNote4selectedVerse();
    // Scroll the verseNote into view
    if(appendHere && !isFullyScrolledIntoView(appendHere.parentElement)){
        appendHere.parentElement.scrollIntoView({behavior: "smooth",block: "end", inline: "nearest"})
    }

    async function appendNote4selectedVerse() {
      if (bible_book.notes[chapternumber - 1]['_' + verseNumber]) {
        //Check for verse number
        noteForCurrentlyEditedVerse = bible_book.notes[chapternumber - 1]['_' + verseNumber];
        if(document.querySelector('body').matches('#versenotepage')){  
          const fullRef = `${bookName} ${chapternumber}:${verseNumber}`
          noteForCurrentlyEditedVerse = `<blockquote>${docFrag2String(getCrossReference(fullRef)).replace(/(\[\w+ \d+:\d+)(\])(.+)/ig, '<hr>$3 <small>$1 ' + bversionName + '$2</small><hr>')}</blockquote>${generateRefsInNote(noteForCurrentlyEditedVerse)}`;
        }else{
          noteForCurrentlyEditedVerse = generateRefsInNote(noteForCurrentlyEditedVerse);
        }
        appendHere.innerHTML = noteForCurrentlyEditedVerse;
        transliterateAllStoredWords();
        newVerseNote=noteForCurrentlyEditedVerse
      }
    }
    return await newVerseNote
  }
  return await getVerseNote()
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
    // if book has markers (colating all markers in the bible notes)
    if(bible_book.markers){
      let bookMarkers_tempArray = [];
      for (key in bible_book.markers) {
        bookMarkers_tempArray.push(key);
        let bookMarkerObj = bible_book.markers[key];
        if (document.body.matches('#homepage') && Object.keys(bookMarkerObj).length > 0) {
          for (ky in bookMarkerObj) {
            allVMarkersInAllBooks = addKeyToArrayOfAllVerseMarkers(key)
          }
        }
      }
      if(document.body.matches('#homepage')){
        allBibleMarkersOBJ[bookName]=bookMarkers_tempArray;
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
    appendHere.innerHTML='<div id="context_menu" class="context_menu slideoutofview"></div>';
    var items = [];
    let jsonChapter = bible_book.notes[Number(chptNum)-1];
    if (Object.keys(jsonChapter).length > 0) {
      for (ky in jsonChapter) {
        items.push(`${bookName} ${chptNum}:${Number(ky.substring(1))}`)
        items.push(`${jsonChapter[ky]}`)
      }
    }
    let openOrnot='';
    items.forEach((ref_,i)=>{
      if((i+1)%2==1){
        openOrnot='';
        if(fullRef == ref_){openOrnot = 'open id="opened_detail"'}
        appendHere.innerHTML = `${appendHere.innerHTML}<details ${openOrnot}><summary><div class='openCloseIconHolder'></div><h1 class="win2_bcv_ref">${ref_}</h1></summary><div class="win2_noteholder"><blockquote>${docFrag2String(getCrossReference(ref_,bookName)).replace(/(\[\w+ \d+:\d+)(\])(.+)/ig, '<hr>$3 <small>$1 ' + bversionName + '$2</small><hr>')}</blockquote>${generateRefsInNote(items[i+1])}</div></details>`;
      }
    })
    document.querySelector('#opened_detail').scrollIntoView({behavior: "smooth",block: "start", inline: "nearest"})
    transliterateAllStoredWords()
  }
}

function appendAllNotesInChapter(e){
  let eTarget = null;
  if(e.type == contextMenu_touch && e.target.matches('code[ref]')){eTarget=e.target}
  else if (e.target.matches('code[ref] > b')) {
    eTarget=e.target.parentElement;
  }
  if(eTarget){
    let codeElm = eTarget;
    let refDetails = refDetails4rmCodeElm(codeElm);
    bN = refDetails.bookName;
    bC = refDetails.bookChapter;
    cV = refDetails.chapterVerse;
    getAllNotesInChapter(bN, bC, codeElm.getAttribute('ref'))
  }
}