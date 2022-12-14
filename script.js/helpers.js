let bible_nav = document.querySelector('#bible_nav');
let refnav = document.querySelector('#refnav');

function clog(x){console.log(x);console.trace(x)}
/* GENERAL HELPER FUNCTIONS */
function isObject(objValue) {
    return objValue && typeof objValue === 'object' && objValue.constructor === Object;
}

/* Ensure doublick does not run click eventListner */
function debounce(func, timeout = 300) {
    // function func will only run if it is not clicked twice within 300ms
    var ttt;
    return function () {
        if (ttt) {
            clearTimeout(ttt)
            ttt = undefined;
        } else {
            // console.log('setting Timeout')
            const context = this
            const args = arguments
            ttt = setTimeout(() => {
                func.apply(context, args);
                ttt = undefined;
                // console.log('done & cleared')
            }, timeout)
        }
    }
}

function removeItemFromArray(n, array) {
    const index = array.indexOf(n);

    // if the element is in the array, remove it
    if (index > -1) {

        // remove item
        array.splice(index, 1);
    }
    return array;
}

/* Remove single string or array of strings from a string */
function removeCharacterFromString(xh, str) {
    if (typeof xh === 'string' || xh instanceof String) {return str.split(xh).join('')}
    //An array of characters to remove from the string,
    // e.g., "['.',',','lk']"
    else if (Array.isArray(xh)){
        xh.forEach(xh_i=>{str.split(xh_i).join('')});
        return str
    }
}

/* ***************************** */
/*       DOM MANIPULATIONS       */
/* ***************************** */

function elmAhasElmOfClassBasAncestor(a, ancestorsClass, limit = 'BODY') {
    while (a.parentElement && a.parentElement.tagName.toUpperCase() != limit) {
        if (a.parentElement.classList.contains(ancestorsClass) || a.parentElement.matches(ancestorsClass)) {
            return a.parentNode
        }
        a = a.parentElement;
    }
    return false
    
    //The :has() pseudo selector will do this quite easily, but,
    // First: elmA will have to be represented as a css selector, e.g., 'div>.a', and
    // Second: It is not yet supported in Mozilla FireFox
    // E.g: if(querySelector('.ancestorsClass:has(div>.a)'){return true})
}

function hideORshowID(hideOrShow, id) {
    if (hideOrShow.toUpperCase() == 'HIDE') {
        var id2hide = document.querySelectorAll('#' + id);
        id2hide.forEach(el => {
            el.style.display = 'none'
        });
    } else if (hideOrShow.toUpperCase() == 'SHOW') {
        var id2show = document.querySelectorAll('#' + id);
        id2show.forEach(el => {
            el.style.display = ''
        });
    } else {
        id = hideOrShow
        var id2toggle = document.querySelector('#' + id);
        // console.log(id2toggle.style.display)
        if (id2toggle.style.display == "none") {
            id2toggle.style.display = "block";
        } else {
            id2toggle.style.display = "none";
        }
    }
}
function hideORshowClass(hideOrShow, cls) {
    if (hideOrShow.toUpperCase() == 'HIDE') {
        var class2hide = document.querySelectorAll('.' + cls);
        class2hide.forEach(el => {
            el.style.display = 'none'
        });
    } else if (hideOrShow.toUpperCase() == 'SHOW') {
        var class2show = document.querySelectorAll('.' + cls);
        class2show.forEach(el => {
            el.style.display = ''
        });
    }
}

function hideElement(el) {
    el.classList.add("displaynone")
}
function showElement(el) {
    el.classList.remove("displaynone")
}

function toggleClassAndActiveButton(elm, cls,originElm){
    elm.classList.toggle(cls)
    originElm.classList.toggle('active_button');
}
function disableButton(cls, disableValue) {
    var class2toggleAttribute = document.querySelectorAll('.' + cls);
    class2toggleAttribute.forEach(el => {
        el.disabled = disableValue;
        if (disableValue) {
            el.style.pointerEvents = 'none';
            el.style.color = 'grey';
            el.style.fontStyle = 'italic';
        } else if (!disableValue) {
            el.style.pointerEvents = '';
            el.style.color = '';
            el.style.fontStyle = '';
        }
    });
    // Or just create a css style for class, e.g., 'button_disabled',
    // and then add the class to buttons to be disabled
}

// Check or uncheck radio/checkbox input
function checkUncheck(x){
    let arrOfCheckBoxes;
    if(Array.isArray(x)==false){arrOfCheckBoxes=[x]}
    else{arrOfCheckBoxes=x}

    arrOfCheckBoxes.forEach(rcbx => {
        if(rcbx.type=='input'){rcbx.click();}
        else{if(rcbx.checked==true){rcbx.checked=false}
        else{rcbx.checked=true}}
    });
}

function insertElmAbeforeElmB(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode);
}
function relocateElmTo(elm, moveHere) {
    let elmCopy = elm.cloneNode(true);
    elm.remove();
    moveHere.append(elmCopy)
}

// GET FIRST SHADOW COLOR
function getBoxShadowColor(elm){
    // Even if element has more than one box-shadow color, it will only get the first one
    let boxShadowOfElem = window.getComputedStyle(elm, null).getPropertyValue("box-shadow");
    return boxShadowOfElem.split('px')[0].replace(/^.*(rgba?\([^)]+\)).*/,'$1')
}

/* ****************************** */
/*    DOM EXPLORATIONS/QUERIES    */
/* ****************************** */

function X_hasNoSibling_Y_b4_Z(x, y, z) {
    let a = x,
        yes_no = false,
        Y = null,
        Z = null,
        elm2appendAfter = x;
    while (a.nextElementSibling) {
        if (a.nextElementSibling.matches(z)) {
            Z = a.nextElementSibling;
            elm2appendAfter = x;
            yes_no = true;
            break
        } else if (a.nextElementSibling.matches(y)) {
            Y = a.nextElementSibling;
            elm2appendAfter = Y;
            aa = Y.nextElementSibling;
            yes_no = false;
            while (aa) {
                if (aa.matches(z)) {
                    Z = aa;
                    break
                }
                aa = aa.nextElementSibling;
            }
            break
        } else {
            a = a.nextElementSibling;
        }
    }
    return {
        elm2appendAfter: elm2appendAfter,
        yes_no: yes_no,
        elmY: Y,
        elmZ: Z
    }
}
function getSibling_Y_of_X_b4_Z(x, y, z) {}

function arrayOfNodesBetween(a, b) {
    //first check if they have the same parent
    let a_b_parent = a.parentNode;
    if (a_b_parent != b.parentNode) {
        return {
            array: [],
            indexOfA: -1,
            indexOfA: -1,
            length: 0
        }
    }
    let childNodesArr = a_b_parent.childNodes;
    let aIndx = null;
    let bIndx = null;
    //find their respective positions in their parent
    for (i = 0; i < childNodesArr.length; i++) {
        let cnode = childNodesArr[i];
        if (cnode == a) {
            aIndx = i
        }
        if (cnode == b) {
            bIndx = i
        }
        //no need to loop through every node once we have the indexes of a and b
        if (aIndx != null && bIndx != null) {
            return allnodesbtwAnB(childNodesArr, aIndx, bIndx)
        }
    };

    function allnodesbtwAnB(childNodesArr, aIndx, bIndx) {
        let arrOfNodesInbetween = [];
        if (aIndx == bIndx) {
            return arrOfNodesInbetween
        }
        let n1 = null,
            n2 = null;
        if (aIndx < bIndx) {
            n1 = aIndx;
            n2 = bIndx
        } else {
            n1 = bIndx;
            n2 = aIndx
        }
        for (j = n1 + 1; j < n2; j++) {
            arrOfNodesInbetween.push(childNodesArr[j])
        }
        return {
            arr: arrOfNodesInbetween,
            indexOfA: aIndx,
            indexOfA: bIndx,
            length: arrOfNodesInbetween.length
        }
    }
}

function arrayOfElementsBetween(a, b) {
    //first check if they have the same parent
    let a_b_parent = a.parentElement;
    if (a_b_parent != b.parentElement) {
        return {
            array: [],
            indexOfA: -1,
            indexOfA: -1,
            length: 0
        }
    }
    let childrenArr = a_b_parent.children;
    let aIndx = null;
    let bIndx = null;
    //find their respective positions in their parent
    for (i = 0; i < childrenArr.length; i++) {
        let cElm = childrenArr[i];
        if (cElm == a) {
            aIndx = i
        }
        if (cElm == b) {
            bIndx = i
        }
        //no need to loop through every element once we have the indexes of a and b
        if (aIndx != null && bIndx != null) {
            return allElementsbtwAnB(childrenArr, aIndx, bIndx)
        }
    };

    function allElementsbtwAnB(childrenArr, aIndx, bIndx) {
        let arrOfNodesInbetween = [];
        if (aIndx == bIndx) {
            return arrOfNodesInbetween
        }
        let n1 = null,
            n2 = null;
        if (aIndx < bIndx) {
            n1 = aIndx;
            n2 = bIndx
        } else {
            n1 = bIndx;
            n2 = aIndx
        }
        for (j = n1 + 1; j < n2; j++) {
            arrOfNodesInbetween.push(childrenArr[j])
        }
        return {
            array: arrOfNodesInbetween,
            indexOfA: aIndx,
            indexOfA: bIndx,
            length: arrOfNodesInbetween.length
        }
    }
}

function windowsSelection(){
    const selObj = window.getSelection();
    // return selObj
    const selRange = selObj.getRangeAt(0);
    return selRange
}
/* ********************************************* */
/* LIGHTCITY BIBLE APP SPECIFIC HELPER FUNCTIONS */
/* ********************************************* */
function codeELmRefClick(e) {
    if (e.target.tagName == "CODE") {
        let codeElm = e.target;
        
        // If it is the verseNotePage and not the index.html.
        if(document.querySelector('body').matches('#versenotepage')){
            
            let col2 = document.querySelector('#col2');
            col2.innerHTML = `<div id="context_menu" class="context_menu slideout"></div><details open><summary><div class='openCloseIconHolder'></div><h1 class="win2_bcv_ref">${codeElm.getAttribute('ref')}</h1></summary><div class="win2_noteholder"><em>loading...</em></div></details>`;
            
            win2_noteholder = col2.querySelector('.win2_noteholder')

            let refDetails = refDetails4rmCodeElm(codeElm);
            // clog({bN, bC, cV,win2_noteholder})
            bN = refDetails.bookName;
            bC = refDetails.bookChapter;
            cV = refDetails.chapterVerse;
            bookName = bN;
            chapternumber = bC;
            verseNumber = cV;
            readFromVerseNotesFiles(bN, bC, cV,win2_noteholder)
        }
        else{
            gotoRef(codeElm.getAttribute('ref'))
        }
        e.preventDefault();
    }
}
function refDetails4rmCodeElm(codeElm){
    let bC=codeElm.getAttribute('chpt').trim();
    let bkNvrs=codeElm.getAttribute('ref').split(' ' + bC + ':');
    let bN=bkNvrs[0].trim();
    let cV=bkNvrs[1].trim();
    return {
        bookName:bN,
        bookChapter:bC,
        chapterVerse:cV
    }
}
// function getFUllBookName(shortBkNm) {
//     bible.Data.books.forEach((ref_, ref_indx) => {
//         if (ref_.includes(shortBkNm.toUpperCase())) {
//             let fullname = bible.Data.bookNamesByLanguage.en[ref_indx]
//             return fullname;
//         }
//     });
// }

/* DIV RESIZER - DRAGGING TO RESIZE */
const BORDER_SIZE = 10;
const panel = document.getElementById("strongsdefinitionwindow");
const resizerdiv = document.getElementById("resizerdiv");

let m_pos;
let old_width;
let hasBeenClicked = false;

// resizerdiv.addEventListener("mousedown", resizeStrongsDefinitionWindow, false);

function resizeDiv(e) {
    const dx = e.x - m_pos;
        //   const dx = m_pos - e.x;
        if (dx > 0) {
            let increased_width = old_width + dx;
            panel.style.maxWidth = increased_width + "px";
            panel.style.minWidth = increased_width + "px";
        } else if (dx < 0) {
            let decreased_width = old_width + dx;
            panel.style.maxWidth = decreased_width + "px";
            panel.style.minWidth = decreased_width + "px";
        }
        if(parseInt(getComputedStyle(panel, '').width)<200){
            panel.style.maxWidth = "200px";
            panel.style.minWidth = "200px";
    }
}
function handleSelectAttempt(event) {if (window.event) {
        event.returnValue = false;
        }
}
function resizeStrongsDefinitionWindow(e) {
    if (e.target.matches('#resizerdiv') && hasBeenClicked == false && e.offsetX < BORDER_SIZE) {
        m_pos = e.x;
        old_width = parseInt(getComputedStyle(panel, '').width);
        hasBeenClicked = true;
        document.addEventListener("mousemove", resizeDiv, false);
        document.addEventListener('selectstart', handleSelectAttempt, false)
        document.addEventListener("mouseup", remove_resizer_funcs, false);
    }
}
function remove_resizer_funcs() {
    console.log('JESJSUS')
    document.removeEventListener("mousemove", resizeDiv, false);
    document.removeEventListener('selectstart', handleSelectAttempt);
    hasBeenClicked = false;
}

/* SORT OBJECTS */
// function sortObj(obj) {
//     return Object.keys(obj).sort().reduce(function (result, key) {
//         result[key] = obj[key];
//         return result;
//     }, {});
// }

//Random Color Generator
function randomColor(brightness) {
    function randomChannel(brightness) {
        var r = 255 - brightness;
        var n = 0 | ((Math.random() * r) + brightness);
        var s = n.toString(16);
    return (s.length == 1) ? '0' + s : s;
    }
    return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
}

function isAsubArrayofB(a, b) {
    let aL = a.length;
    let bL = b.length;
    //b cannot contain a if a is longer
    if (bL >= aL) {
        // start comparison where at the last possible starting point of a in b.
        // E.g., if aL is 3 and bL is 5, then the last possible starting point of a in b is 2
        let lastPossibleStartIndex = bL - aL;
        let lind = lastPossibleStartIndex;
        while (lind >= 0) {
            let i = 0,
            j = lind;
            while (a[i] == b[j]) {
                if (i == aL - 1) {
                    return true
                }
                i++;
                j++;
            }
            lind--; //move backwards in b array from last possible index to the start of b
        }
        return false
    }
    return false
}

function areAllitemsOfAinB(a, b) {
    if (a.every(elem => b.indexOf(elem) > -1)) {
        return true
    } else {
        return false
    }
}
const findMatch = (array, value) => {
    return array.find(element => element === value);
}
/* WATCH FOR INACTIVITY IN ELM AND RUN FUNCTION AFTER SET-TIME */
// https://www.brcline.com/blog/detecting-inactivity-in-javascript
function runFuncAfterSetTimeInactivityInElm(elm2Watch, timeoutInMiliseconds = 60000, func2run){
    var timeoutId;

    function resetTimer() { 
        window.clearTimeout(timeoutId)
        startTimer();
    }
      
    function startTimer() {
        // window.setTimeout returns an Id that can be used to start and stop a timer
        timeoutId = window.setTimeout(doInactive, timeoutInMiliseconds)
    }
      
    function doInactive() {
        // Clear the eventListeners
        elm2Watch.removeEventListener("mousemove", resetTimer, false);
        elm2Watch.removeEventListener("mousedown", resetTimer, false);
        elm2Watch.removeEventListener("keypress", resetTimer, false);
        elm2Watch.removeEventListener("touchmove", resetTimer, false);
        // if(searchsettings.classList.contains('active_button')){searchsettings.click()}
        // totalfound.innerHTML='Search Cleared';
        func2run()
    }
     
    // function setupTimers () {
        elm2Watch.addEventListener("mousemove", resetTimer, false);
        elm2Watch.addEventListener("mousedown", resetTimer, false);
        elm2Watch.addEventListener("keypress", resetTimer, false);
        elm2Watch.addEventListener("touchmove", resetTimer, false);
         
        startTimer();
    // }
}

/* CHECK IF DEVICE IS A MOBILE DEVICE */
// window.addEventListener("load", () => {
//     // (A) CHECK FOR MOBILE
//     isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
   
//     // (B) DO SOMETHING...
//     if (isMobile) { console.log("Is mobile device"); }
//     else { console.log("Not mobile device"); }
//   });

/* ***************************************** */
/*                   REGEX                   */
/* ***************************************** */
function modifyQuotationMarks(txt){
    txt = txt.replace(/&nbsp;/ig, ' ');
    // Modify Opening Quotation Marks
    txt = txt.replace(/(?<!<[^>]*)(.)\.\.\./ig, '$1???');
    txt = txt.replace(/??????/ig, '??????');
    txt = txt.replace(/(?<!<[^>]*)([\d\w])['???]([\w???])/ig, '$1???$2');
    txt = txt.replace(/(?<!<[^>]*)(^|[\b\s???])"/ig, '$1???');
    txt = txt.replace(/(?<!<[^>]*)"([\d\w??????])/ig, '???$1');
    txt = txt.replace(/(?<!<[^>]*)"([\s.,???])/ig, '???$1');
    txt = txt.replace(/(?<!<[^>]*)([\w\d.,??????])"/ig, '$1???');
    // Modify Closing Quotation Marks 
    txt = txt.replace(/!"/g, '!???');
    txt = txt.replace(/(?<!<[^>]*)(^|[\b\s???])'/ig, '$1???');
    txt = txt.replace(/(?<!<[^>]*)'([\d\w??????])/ig, '???$1');
    txt = txt.replace(/(?<!<[^>]*)'([\s.,???])/ig, '???$1');
    txt = txt.replace(/(?<!<[^>]*)([\w\d.,??????])'/ig, '$1???');
    txt = txt.replace(/--/g, '???');
    // Remove <br> that comes before block element closing tag
    txt = txt.replace(/<br>(<\/(p|h\d)>)/ig, '$1');
    txt = txt.replace(/(?<!<[^>]*)(\s+([.,]))/ig, '$2');
    txt = txt.replace(/<span contenteditable="false" data-cke-magic-line="\d+" style="height: \d+px; padding: \d+px; margin: \d+px; display: block; z-index: \d+; color: rgb(\d+, \d+, \d+); font-size: \d+px; line-height: 0px; position: absolute; border-top: \d+px dashed rgb(\d+, \d+, \d+); user-select: none; left: \d+px; right: \d+px; top: \d+px;">  \s*???\s*<\/span>/ig, '');
    return txt
}

/* FOR CHECKING IF TRANSLATION HAS ANY ISSUE AND WHERE THE ISSUES ARE */
function findMissingIncompleteChapters(translation){
    let reportOBJ={};
    let inCompleteChapters={};
    // Loop through all bible books
    bible.Data.allBooks.forEach((bibleBook,bbkIndx) => {
        let bkchptVdata = bible.Data.verses[bbkIndx];
        let numOfChptsInBk = window[translation][bibleBook].length;
        let expectedNumOfChptsInBk = bkchptVdata.length;
        inCompleteChapters[bbkIndx+'_'+bibleBook]={};

        // Incomplete books
        if(numOfChptsInBk!=expectedNumOfChptsInBk){
            console.log('?Bk?: ' + bibleBook + ':' + numOfChptsInBk +' :insteadOf: ' + expectedNumOfChptsInBk)
        }

        // Complete Books
        // if book has complete number of chapters, check each chapter to see it has complete number of verses
        // window[translation][bibleBook][chNumInBk - 1][vNumInChpt - 1]
        window[translation][bibleBook].forEach((chapt,chpIndx)=>{
            let numOfVrsInChpt = chapt.length;
            let expectedNumOfVrsInChpt = bkchptVdata[chpIndx];
            if(numOfVrsInChpt!=expectedNumOfVrsInChpt){
                inCompleteChapters[bbkIndx+'_'+bibleBook][chpIndx+1]=numOfVrsInChpt + ' :vs: ' + expectedNumOfVrsInChpt
                reportOBJ[bbkIndx+'_'+bibleBook]=inCompleteChapters[bbkIndx+'_'+bibleBook];
            }
        })
    });
    if(Object.keys(reportOBJ).length === 0){
        return "No Issue With Translation: Correct Number of Chapters in Books and Correct Number of Verses in Chpaters"
    }else{
        return reportOBJ
    }
}

/* Check If element is in view on page */
function isScrolledIntoView(el) {
    var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    // Only completely visible elements return true:
    var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
    return isVisible;
}
/* ***************************************************** */
/* DOWNLOAD MODIFIED JSON FILE */
/* function downloadFile(text_data, name = "myData", format = "json") {
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
} */
/* https://www.youtube.com/watch?v=io2blfAlO6E */
/* ***************************************************** */

// CONVERT DOCUMENT FRAGMENT INTO STRING
function docFrag2String(dfrg){
    const serializer = new XMLSerializer();
    const document_fragment_string = serializer.serializeToString(dfrg);
    // const xmlnAttribute = ' xmlns="http://www.w3.org/1999/xhtml"';
    // const regEx = new RegExp(xmlnAttribute, 'g');
    // document_fragment_string = document_fragment_string.replace(regEx, '');
    return document_fragment_string
}