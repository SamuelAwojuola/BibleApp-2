/* MODIFY JSON VERSE NOTES FILE */
let noteForCurrentlyEditedVerse;
let notesFolder='bible_notes';
let currentDefaultFolder=notesFolder;
// let currentURLisGithubSamAwo = /samuelawojuola\.github\.io/.test(window.location.href);

let allReferencesWithNotes = {};
const allReferencesWithNotesProxy = new Proxy(allReferencesWithNotes, {
  set(target, property, value) {
    target[property] = value; // Update the actual property
    (async()=>{await window.sharedVariableAPI.set(target);})();// Pass the updated object
    return true; // Indicate success
  },
  deleteProperty(target, property) {
    delete target[property];
    (async()=>{await window.sharedVariableAPI.set(target);})();// Pass the updated object
    return true;
  },
});
function replaceAllReferencesWithNotes(newData) {
  Object.keys(allReferencesWithNotes).forEach((key) => {delete allReferencesWithNotesProxy[key];});// Clear existing properties
  Object.entries(newData).forEach(([key, value]) => {allReferencesWithNotesProxy[key] = value;});// Add new properties
}
let allBibleBooks = bible.Data.allBooks, objOfRefsWithNote={}, bkIdx=0;
let notesCount = 1;
function findAllBookChptnVersesWithNote(){
  if (document.body.matches('#homepage')) {
    biblenotes_nav.innerHTML='';// clear biblenotes_nav
  }
  objOfRefsWithNote={}// Cear collection of refs with notes
  // This generates 'arrOfrefs' which is used by 'appendAllRefsWithNote()'
  let i = 0;
  let bookName=allBibleBooks[i];
  let arrayOfRefsWithNote=[];
  //bibleNote for bookName
  getAllRefsInBookThatHaveNote(bookName, buildArrayOfRefs)
  function buildArrayOfRefs(arrOfrefs) {
    // If book has notes
    if(arrOfrefs.length!=0){
      arrayOfRefsWithNote.push(arrOfrefs);
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
function appendAllRefsWithNote(){
  let detailSum='';
  let openORclose='';// or ' open' if you want it open
    for (key in objOfRefsWithNote) {
      detailSum = `${detailSum}<details ${openORclose}><summary>${key}</summary>${codeWithRefinIt(key,objOfRefsWithNote)}</details>`
    }
    if(bibleapp_available_notes.querySelector('#biblenotes_nav')){
      biblenotes_nav.innerHTML = detailSum;
    } else {
      bibleapp_available_notes.innerHTML = detailSum;
    }
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
  if(document.querySelector('body').matches('#versenotepage') && typeof goToRefInNewNotePageWindow === 'function'){goToRefInNewNotePageWindow();}
  return detailSum
}
if(typeof bibleapp_available_notes !== 'undefined'){
  bibleapp_available_notes.addEventListener("mouseup", codeElmRefClick)
  bibleapp_available_notes.addEventListener("click", appendAllNotesInChapter)// Open all notes in chapter on click of chapter number of a reference with available verseNote
  // TO CLOSE OR OPEN ALL DETAILS ON RIGHT CLICK OF SUMMARY
  bibleapp_available_notes.addEventListener(contextMenu_touch, openCloseAllAvailableNotesDetail)
  bibleapp_available_notes.addEventListener('click', openCloseAllAvailableNotesDetail)
}
if(document.querySelector('#col2')){
  document.querySelector('#col2').addEventListener('click', openCloseAllAvailableNotesDetail);
  document.querySelector('#col2').addEventListener(contextMenu_touch, openCloseAllAvailableNotesDetail);
  document.querySelector('#col1').addEventListener(contextMenu_touch, appendAllNotesInChapter);
}
function openCloseAllAvailableNotesDetail(e){
  if (e.type=='click'&&!e.ctrlKey){return}
  let etarget=e.target;
  if(etarget.matches('summary')){
    let details2openORclose,eParent;
    if(etarget.matches('#col2>details>summary')){
      details2openORclose = '#col2>details';
      eParent = document.querySelector('#col2');
    } else {
      details2openORclose = 'details';
      eParent = bibleapp_available_notes;
    }
    //Close All Others
    if(e.ctrlKey){
      if(etarget.parentElement.open){
        eParent.querySelectorAll(details2openORclose).forEach(dtl=>{dtl.open=false})
      } else {
        eParent.querySelectorAll(details2openORclose).forEach(dtl=>{dtl.open=true})
      }
      etarget.scrollIntoView();
    } else {
      if(etarget.parentElement.open){
        eParent.querySelectorAll(details2openORclose).forEach(dtl=>{dtl.open=false})
      } else {
        eParent.querySelectorAll(details2openORclose).forEach(dtl=>{
          dtl!=etarget.parentElement ? dtl.open=false : dtl.open=true;
        })
      }
      etarget.scrollIntoView({behavior:"smooth"});
    }
  }
  e.preventDefault()
}

async function fetchBookNotes(jsBkNm,folderName) {
  if(typeof bookName=='undefined'){
    if(document.body.matches('#homepage')){
      bookName=await getHighestVisibleH2(false);
      bookName=bookName.highestChptBody.getAttribute('bookname');
    }
  }
  else {bookName};
  if (!jsBkNm) {jsBkNm = bookName}
  if(!folderName){folderName=notesFolder}
  let rootAddress = '';
  if(document.location.pathname.includes('/site_2/')){rootAddress = document.location.pathname.split('/site_2/')[0] + '/src/'}
 
  let response = await fetch(`${rootAddress}${folderName}/notes_${jsBkNm}.json`);
  return await response.json()
}

async function readFromVerseNotesFiles(bookName, chapternumber, verseNumber, appendHere,updateNoteHistory=true) {
  let newVerseNote;
  if ((bookName == undefined) && (chapternumber == undefined) && (verseNumber == undefined)) {
    let refObj = breakDownClickedVerseRef();
    bookName = refObj.bN;
    chapternumber = refObj.bC;
    verseNumber = refObj.cV;
  }
  updateNoteHistory?addToNOTEHistory({b:bookName,c:chapternumber,v:verseNumber}):null;

  async function getVerseNote() {
    bible_book = await fetchBookNotes(bookName);
    appendNote4selectedVerse();
    // Scroll the verseNote into view
    if(appendHere && !isFullyScrolledIntoView(appendHere.parentElement)){
      appendHere.parentElement.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"});
      clickAllLisOnPage(appendHere);
    }
    
    async function appendNote4selectedVerse() {
      if (bible_book.notes[chapternumber - 1]['_' + verseNumber]) {
        //Check for verse number
        noteForCurrentlyEditedVerse = bible_book.notes[chapternumber - 1]['_' + verseNumber];
        if(document.querySelector('body').matches('#versenotepage')){  
          const fullRef = `${bookName} ${chapternumber}:${verseNumber}`
          noteForCurrentlyEditedVerse = `<blockquote>${docFrag2String(getCrossReference(fullRef)).replace(/(\[)(\w+ \d+:\d+)(\])(.+)/ig, '<hr>$4 <small>$1<span ref="$2">$2</span> ' + bversionName + '$3</small><hr>')}</blockquote>${generateRefsInNote(noteForCurrentlyEditedVerse)}`;
        }
        else{noteForCurrentlyEditedVerse = generateRefsInNote(noteForCurrentlyEditedVerse);}
        appendHere ? appendHere.innerHTML = noteForCurrentlyEditedVerse : null;
        transliterateAllStoredWords();
        newVerseNote=noteForCurrentlyEditedVerse
      }
    }
    return await newVerseNote
  }
  return await getVerseNote()
}
/* **************************************************** */
/* **************************************************** */
function writeToVerseNotesFiles(bookName, chapternumber, verseNumber, def_folder) {
  if ((bookName == undefined) && (chapternumber == undefined) && (verseNumber == undefined)) {
    let refObj = breakDownClickedVerseRef();
    bookName = refObj.bN;
    chapternumber = Number(refObj.bC);
    verseNumber = Number(refObj.cV);
  }
  currentBookName=bookName;

  if(!def_folder){def_folder=notesFolder}
  currentDefaultFolder=def_folder;

  let noteStatus;
  if (def_folder=='bible_notes') {noteStatus='noted';}
  else {noteStatus='user1note';}

  async function fetchBookNotes() {
    let response = await fetch(`${def_folder}/notes_${bookName}.json`);
    return await response.json()
  }

  function modifyCreateVerseNote() {
    fetchBookNotes().then(jsonObject => {
      b_bk = jsonObject;
      writeNote();
    })

    async function writeNote() {
      let newNote = noteEditingTarget.cloneNode(true)
      newNote.querySelectorAll('.sld_up, .hidingsibs, .hidby_H1, .hidby_H2, .hidby_H3, .hidby_H4, .hidby_H5, .hidby_H6').forEach(el => {
        ['oldtransition', 'oldderivedheight', 'display', 'anim_dur'].forEach(a => el.removeAttribute(a));
        el.classList.remove('sld_up','hidingsibs','hidby_H1','hidby_H2','hidby_H3','hidby_H4','hidby_H5','hidby_H6');
        el.className = el.className.replace(/\bsld_up\b/, '');
        el.classList.value.trim() == '' ? el.removeAttribute('class') : null;
        el.removeAttribute('style');
      });
      newNote = newNote.innerHTML;
      if (newNote == "<p><br><\/p>") {
        noteEditingTarget.innerHTML = null;
        newNote = "";
        // return
      }
      newNote = modifyQuotationMarks(newNote);
      /* make copy of all the notes */
      let copyOfAllVerseNotesInCurrentBook = {...b_bk.notes};
      let originalVerseNotes = copyOfAllVerseNotesInCurrentBook[chapternumber - 1];
      if(newNote==""){delete originalVerseNotes['_'+verseNumber]}//delete note if empty
      else{originalVerseNotes['_'+verseNumber] = newNote;}

      /* REPLACE THE PREVIOUS VERSE NOTES FOR THE CHAPTER WITH THE MODIFIED VERSE NOTES */
      copyOfAllVerseNotesInCurrentBook[chapternumber - 1] = newNote=="" ? originalVerseNotes : sortVnotesObj(originalVerseNotes);
      b_bk['notes'] = copyOfAllVerseNotesInCurrentBook;
      let newJSON_data = JSON.stringify(b_bk, null, 4);
      let r = await saveToLocalDrive(newJSON_data,null,null,def_folder);
      // r will be false if the save operation was cancelled
      if(r==false) {return false}
      else {
        let verseServing = ppp.querySelector(`code[ref="${bookName} ${chapternumber}:${verseNumber}"]`).closest('.vmultiple');
        //update array of verses with notes
        if (!allReferencesWithNotes || Object.keys(allReferencesWithNotes).length === 0) {await generateObjectOfAllReferencesWithNotes();}//ensure allReferencesWithNotes is not empty 
        let arwn = allReferencesWithNotes[def_folder][bookName];
        if (!arwn[chapternumber]) {
          arwn[chapternumber] = [];
          allReferencesWithNotes[def_folder][bookName][chapternumber] = [];
        }

        verseNumber = Number(verseNumber);
        if (newNote === "") {
          // Remove the verseNumber from the array
          allReferencesWithNotes[def_folder][bookName][chapternumber] = arwn[chapternumber].filter(vnum => vnum !== verseNumber);
          verseServing.classList.remove(noteStatus);
          arwn = allReferencesWithNotes[def_folder][bookName];
          
          //modify the combined_referencesWithNotes object
          let someFolderHasNoteForVerse = ['bible_notes','bible_notes_user1'].find(x=>{
            return allReferencesWithNotes[x][bookName][chapternumber] && allReferencesWithNotes[x][bookName][chapternumber].includes(verseNumber)
          });
          if (!someFolderHasNoteForVerse) {
            combined_referencesWithNotes[bookName][chapternumber].filter(vnum => vnum !== verseNumber);
          }
        } else {
          // Add the verseNumber to the array if it is not already present
          if (!arwn[chapternumber]) {
            allReferencesWithNotes[def_folder][bookName][chapternumber]=[];
            allReferencesWithNotes[def_folder][bookName][chapternumber].push(verseNumber);
          }
          else if (!arwn[chapternumber].includes(verseNumber)) {
            allReferencesWithNotes[def_folder][bookName][chapternumber].push(verseNumber);
          }
          if (!combined_referencesWithNotes[bookName][chapternumber]) {
            combined_referencesWithNotes[bookName][chapternumber]=[];
            combined_referencesWithNotes[bookName][chapternumber].push(verseNumber);
          }
          else if (!combined_referencesWithNotes[bookName][chapternumber].includes(verseNumber)) {
            combined_referencesWithNotes[bookName][chapternumber].push(verseNumber);
          }
          verseServing.classList.add(noteStatus);
        }
        allReferencesWithNotesProxy[def_folder] = allReferencesWithNotes[def_folder];
        
        
        /* ***************************************** */
        /* Update notes_ file in serviceWorker cache */
        /* ***************************************** */
        // def_folder=notesFolder
        await fetch(`${def_folder}/notes_${bookName}.json`);
        /* ***************************************** The above may seem pointless, but it is done in an attempt to ensure the fetched files are always the latest.
        If the requested file has been stored in the cache, then when a fetch request is made, that is what is fetched. After this, the service worker fetches the file from the network, if availabe and updates the chache.
        So, I fetch the file immediately after it is modified so that the fresh file will be what is available when next it is fetched. ***************************************** */
        return true
      }
      
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
    }
  }
  return modifyCreateVerseNote()
}
/* **************************************************** */
function indicateThatVerseHasNoteInJSONnotes_file(chapterVersesFrag) {
  // get the books loaded on the page and get their chapters and verses that have notes, if any
  let allLoadedBooks = chapterVersesFrag ? chapterVersesFrag.querySelectorAll('.chptverses') : main.querySelectorAll('.chptverses');
  let old_bk_name = null;
  allLoadedBooks.forEach(code => {
    let bk_name = code.getAttribute('bookname');
    let bkIndx = '_' + bible.Data.allBooks.indexOf(bk_name);
    if (old_bk_name != bk_name) {
      ['bible_notes','bible_notes_user1'].forEach(folderName => {
        getAllRefsInBookThatHaveNote(bk_name, function (items) {
          let noteStatus;
          if (folderName=='bible_notes') {noteStatus='noted';}
          else {noteStatus='user1note';}
          var len = items.length;
          for(var i = 0; i < len; i += 1){
            let refCodeToMarkAsHavingNote=document.getElementById(`${bkIndx}.${Number(items[i].split(':')[0])-1}.${Number(items[i].split(':')[1])-1}`);
            if (refCodeToMarkAsHavingNote) {
              refCodeToMarkAsHavingNote.classList.add(noteStatus)
            }
          }
        },folderName);
      });
    }
    old_bk_name = bk_name;
  });
}
const rICSBWTRM = {};//refs In Current Selected Book With Their Respective Markers
function getAllRefsInBookThatHaveNote(bookName, callback, folderName) {
    let items = [];
  fetchBookNotes(bookName,folderName).then(jsonObject => {
    bible_book = jsonObject;
    versesWithNotes();
  })

  function versesWithNotes() {
    for (key in bible_book.notes) {
      let jsonChapter = bible_book.notes[key];
      if (Object.keys(jsonChapter).length > 0) {
        for (ky in jsonChapter) {
          items.push(`${Number(key)+1}:${Number(ky.substring(1))}`)
        }
      }
    }
    /* ********************************************************************************** */
    /* THe following does not add markers to the file but only gets the available markers */
    /* ********************************************************************************** */
    // if book has markers (colating all markers in the bible notes)
    if(bible_book.markers){
      let bookMarkers_tempArray = [];
      bookName in rICSBWTRM ? null : (rICSBWTRM[bookName] = {});
      for (key_marker in bible_book.markers) {
        bookMarkers_tempArray.push(key_marker);
        let bookMarkerObj = bible_book.markers[key_marker];
        if (document.body.matches('#homepage') && Object.keys(bookMarkerObj).length > 0) {
          allVMarkersInAllBooks = addKeyToArrayOfAllVerseMarkers(key_marker);
          for (key_chpt in bookMarkerObj) {
            !(key_chpt in rICSBWTRM[bookName]) ? (rICSBWTRM[bookName][key_chpt] = {}) : null;
            bookMarkerObj[key_chpt].forEach(v_under_marker => {
              !(v_under_marker in rICSBWTRM[bookName][key_chpt]) ? (rICSBWTRM[bookName][key_chpt][v_under_marker] = []) : null;
              rICSBWTRM[bookName][key_chpt][v_under_marker].includes(key_marker) ? null : rICSBWTRM[bookName][key_chpt][v_under_marker].push(key_marker);
            });
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
  fullRef = !fullRef.match(/[^0-9]+/) ? `${bookName} ${chptNum}:${fullRef}` : fullRef;
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
        appendHere.innerHTML = `${appendHere.innerHTML}<details ${openOrnot}><summary><div class='openCloseIconHolder'></div><h1 class="win2_bcv_ref">${ref_}</h1></summary><div class="win2_noteholder"><blockquote>${docFrag2String(getCrossReference(ref_,bookName)).replace(/(\[)(\w+ \d+:\d+)(\])(.+)/ig, '<hr>$4 <small>$1<span ref="$2">$2</span> ' + bversionName + '$3</small><hr>')}</blockquote>${generateRefsInNote(items[i+1])}</div></details>`;
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
    addToNOTEHistory({b:bN, c:bC, v:codeElm.getAttribute('ref')},true);
    getAllNotesInChapter(bN, bC, codeElm.getAttribute('ref'));
  }
}
// On page load and modification, generate array of all references that have note 
let combined_referencesWithNotes = {};
combined_referencesWithNotes['markers'] = {};
async function generateObjectOfAllReferencesWithNotes() {
  let referencesWithNotes = {};
  referencesWithNotes['markers'] = {};

  for (const folderName of ['bible_notes', 'bible_notes_user1']) {
    referencesWithNotes[folderName] = {};
    for (const bk_name of bible.Data.allBooks) {
      referencesWithNotes[folderName][bk_name] = {};
      if(!combined_referencesWithNotes[bk_name]){combined_referencesWithNotes[bk_name]={};}
      try {
        const items = await getAllRefsInBookThatHaveNoteAsync(bk_name, folderName);

        items.forEach(item => {
          let [chapter, verse] = item.split(':').map(Number);
          if (!combined_referencesWithNotes[bk_name][chapter]) {combined_referencesWithNotes[bk_name][chapter] = [];}
          if (!referencesWithNotes[folderName][bk_name][chapter]) {
            referencesWithNotes[folderName][bk_name][chapter] = [];
          }
          !referencesWithNotes[folderName][bk_name][chapter].includes(verse) ? referencesWithNotes[folderName][bk_name][chapter].push(verse) : null;
          !combined_referencesWithNotes[bk_name][chapter].includes(verse) ? combined_referencesWithNotes[bk_name][chapter].push(verse) : null;
        });
        Object.assign(referencesWithNotes['markers'], rICSBWTRM);
        Object.assign(combined_referencesWithNotes['markers'], rICSBWTRM);
      } catch (error) {
        console.error(`Error fetching notes for ${bk_name} in ${folderName}:`, error);
      }
    }
  }
  // allReferencesWithNotes = referencesWithNotes;
  replaceAllReferencesWithNotes(referencesWithNotes);
  return referencesWithNotes;
  function getAllRefsInBookThatHaveNoteAsync(bk_name, folderName) {
    return new Promise((resolve, reject) => {
      getAllRefsInBookThatHaveNote(bk_name, (items) => {
        if (items) {resolve(items);}
        else {reject(new Error('Failed to get items'));}
      }, folderName);
    });
  }
}
window.addEventListener('load', async function(){
  await generateObjectOfAllReferencesWithNotes();
  if(!main.querySelector('.vmultiple:is(.noted,.user1note)')){
    // In case there is an issue and on pageload, the chapters loaded have verses with notes, but it is not indicated.
    indicateThatVerseHasNoteInJSONnotes_file();
  }
});


let noteHistoryArray = [];// Array to store the noteHistoryArray of strings
let currentNoteRefIndx = -1;// Index to track the current position in the noteHistoryArray
if(document.body.matches('#versenotepage')){
  document.addEventListener('keydown', noteHistoryEListener);
  function noteHistoryEListener(event) {
    // Function to go back in the noteHistoryArray
    function noteHistoryArray_goBack() {
      if (currentNoteRefIndx > 0) {currentNoteRefIndx--; goToCurrentNoteRefIndx(currentNoteRefIndx);}
    }
    
    // Function to go forward in the 
    function noteHistoryArray_goForward() {
      if (currentNoteRefIndx < noteHistoryArray.length - 1) {currentNoteRefIndx++; goToCurrentNoteRefIndx(currentNoteRefIndx);}
    }
    function goToCurrentNoteRefIndx(currentNoteRefIndx) {
      const {b,c,v,wholeChpt} = noteHistoryArray[currentNoteRefIndx];
      if (!wholeChpt) {setNote4SingleVerse(b,c,v);}
      else{getAllNotesInChapter(b,c,v)};
    }
    if (!event.shiftKey) {
      if (event.altKey && event.key === 'ArrowLeft') {noteHistoryArray_goBack();}
      else if (event.altKey && event.key === 'ArrowRight') {noteHistoryArray_goForward();}
    }
  }
  function setNote4SingleVerse(b,c,v){
    let col2 = document.querySelector('#col2');
    col2.innerHTML = `<div id="context_menu" class="context_menu slideoutofview"></div><details open><summary><div class='openCloseIconHolder'></div><h1 class="win2_bcv_ref">${b} ${c}:${v}</h1></summary><div class="win2_noteholder"><em>loading...</em></div></details>`;
    win2_noteholder = col2.querySelector('.win2_noteholder');
    readFromVerseNotesFiles(b,c,v,win2_noteholder,false);
  }
}
// Function to add a string to the noteHistoryArray
function addToNOTEHistory(refObj,wholeChpt=false) {
  if (typeof refObj == 'string') {return}
  // Remove future noteHistoryArray if any, as we're adding a new entry
  if (currentNoteRefIndx < history.length - 1) {
    noteHistoryArray = noteHistoryArray.slice(0, currentNoteRefIndx + 1);
  }
  // refObj.wholeChpt=wholeChpt;
  refObj.wholeChpt=wholeChpt;
  // Add the new string to the history
  noteHistoryArray.push(refObj);
  // Update the current index
  currentNoteRefIndx++;
}