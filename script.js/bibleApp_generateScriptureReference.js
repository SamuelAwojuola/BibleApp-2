// const startTime = performance.now();
// const endTime=performance.now();
// //console.log({'diff':endTime-startTime});

var versesOT = 23145, versesNT = 7957, versesTotal = 31102, currentBook, currentBookName, currentChapter;
let currentlyParsedVersion = null, versionWithRedWordsArray = [];

// Populate Select Lists with Layouts and Categories from JSON file
var selectBooks = document.querySelector('#bible_books');
var selectChapters = document.querySelector('#bible_chapters');
var selectVerse = document.querySelector('#bible_verses');
var ppp = document.querySelector('#ppp');
var goto; //to determine if clicking on chapter number shows only the chapter or scrolls to the chapter

//ON CLICK OF CHAPTER, CLEAR PAGE IF NOT ALREADY PRESENT
function clearPageIfChapterNotPresent(xxx) {
    chNumInBk = Number(xxx.getAttribute("chapterindex"));
    chStartIdx = Number(xxx.getAttribute("chapterStartIndex"));
    chEndIdx = Number(xxx.getAttribute("chapterendindex")) + 1;
    bookName = xxx.getAttribute("bookname");

    currentBookName = bookName;
    bkid = Number(xxx.getAttribute("bookindex"));
    gotoId = `_${bkid}.${chNumInBk}.0`;

    // IF TEXT IS NOT ALREADY ON PAGE, JUST SCROLL TO IT
    if (!document.getElementById(gotoId)) {ppp.replaceChildren()}
}

// GENERATE THE TEXT/VERSES OF THE SELECTED CHAPTER
async function getTextOfChapterOnScroll(xxx, prependORnot, adjustScrolling) {
    try {
        // Get the highest visible H2 element
        // let { highestElm: helm } = await getHighestVisibleH2(false);

        // Store document height before modifications
        const old_scrollHeight = main.scrollHeight;

        // Create a DocumentFragment and generate the chapter content
        const wholeChapterFragment = new DocumentFragment();
        wholeChapterFragment.append(generateChapter(xxx));

        // Append or prepend the chapter content based on the flag
        prependORappendChapters(prependORnot, wholeChapterFragment);

        // Scroll handling
        /* if (helm) {helm.scrollIntoView();
        }
        else */ if (adjustScrolling) {main.scrollTo(0, main.scrollHeight - old_scrollHeight);}
    } catch (error) {
        //console.error("An error occurred while loading the chapter:", error);
    }
}

const maxNumOfChptsOnPage = 5;//can use verses instead of chapters
async function getTextOfChapter(xxx, oneChptAtaTime=1, prependORnot, targetVerseOffset=0){
    if(xxx instanceof Element){
        // This works with the Bible Nav (#bible_nav)
        chNumInBk = Number(xxx.getAttribute("chapterindex"));
        bkid = Number(xxx.getAttribute("bookindex"));
        bookName = xxx.getAttribute("bookname");
        vrsInChpt=0;
    }
    else if(typeof xxx === 'object'){
        bookName = xxx.bkname;
        bkid = xxx.bk_indx;
        chNumInBk = xxx.chpIndx;
        vrsInChpt=xxx.vrsIndx;
    }
    currentBookName = bookName;
    let gotoId = `_${bkid}.${chNumInBk}.${vrsInChpt}`;
    let fullRef = `${bookName} ${chNumInBk+1}.${vrsInChpt+1}`;
    let jumpToID = gotoId;

    // IF TEXT IS ALREADY ON PAGE, JUST SCROLL TO IT
    if (targetVerse = document.getElementById(gotoId)) {
        scrollToVerse(targetVerse);
        // Prepend or Append New Chapter if this is the first or last chapter on page
        // setTimeout(() => {
            let chptHolder = targetVerse.closest('.chptverses');
            // if(chptHolder.matches('.chptverses:last-of-type')){loadNewChapter_After_Last_DisplayedChapterOnPage()}
            // else if(chptHolder.matches('.chptverses:first-of-type')){loadNewChapter_Before_First_DisplayedChapterOnPage()}
            if(chptHolder.lastOfType('.chptverses')){loadNewChapter_After_Last_DisplayedChapterOnPage()}
            else if(chptHolder == main.querySelector('.chptverses')){loadNewChapter_Before_First_DisplayedChapterOnPage()}
            scrollToVerse(targetVerse);
            // }, 500);
            return jumpToID;
    }
    // TEXT NOT ALREADY ON PAGE, SO FRESHLY GENERATE THE CONTENT
    else {
        let wholeChapterFragment = new DocumentFragment();
        
        if(typeof context_menu != 'undefined' && context_menu.matches('#main .context_menu')){context_menu.remove()}
        const numOfChptsOnPage = main.querySelectorAll('.chptheading').length;
        const firstChapterOnPage = (fCOP = main.querySelector('.chptheading')) ? fCOP.innerText.toUpperCase() : null;
        const lastChapterOnPage = (lCOP = main.lastOfType('.chptheading')) ? lCOP.innerText.toUpperCase() : null;
        let prevNnxtChapters = bible.getPrevAndNextChapterReferences(`${bookName} ${chNumInBk+1}`);
        let offsetVerseOBJ;
        if(targetVerseOffset){
            offsetVerseOBJ = verseOffset(fullRef, targetVerseOffset);
            jumpToID = offsetVerseOBJ.jumpToID;
            // compare bookChapter decimal to see if to add an extra chapter before or after
            // -1 before, 0, +1 after
            if (beforeOrAfter = offsetVerseOBJ.beforeOrAfter) {
                //first, check if chapter is on page
                let b4nafter_BooknChpt_ref = offsetVerseOBJ.bookNchapter;
                let isForLchptOnPage = [firstChapterOnPage, lastChapterOnPage].find(flChptOnP=>{return flChptOnP == b4nafter_BooknChpt_ref.toUpperCase()});
                if (!firstChapterOnPage || !isForLchptOnPage) {
                    // if not, create it and add it before the newly created chapter
                    if(beforeOrAfter < 0){
                        wholeChapterFragment.append(generateChapter({"bkname":offsetVerseOBJ.bookName,"bk_indx":offsetVerseOBJ.bookID - 1,"chpIndx":offsetVerseOBJ.chapter - 1,"vrsIndx":offsetVerseOBJ.offsetVerse - 1}));
                        wholeChapterFragment.append(generateChapter(xxx));
                    }
                    //if not, create it and after it before the newly created chapter
                    else if(0 < beforeOrAfter){
                        wholeChapterFragment.append(generateChapter(xxx));
                        wholeChapterFragment.append(generateChapter({"bkname":offsetVerseOBJ.bookName,"bk_indx":offsetVerseOBJ.bookID - 1,"chpIndx":offsetVerseOBJ.chapter - 1,"vrsIndx":offsetVerseOBJ.offsetVerse - 1}));
                    }
                }
            }
            else {
                wholeChapterFragment.prepend(generateChapter(xxx));
            }
        }
        else {
            wholeChapterFragment.prepend(generateChapter(xxx));
        }

        // if it is to jump from a prev or next chapter, then first check if that prev or next chatper is on page and add it before or after the actual chapter

        if(lastChapterOnPage!=null && lastChapterOnPage == prevNnxtChapters.prevChapter){
            prependORnot=false;
            // if(numOfChptsOnPage==maxNumOfChptsOnPage){main.querySelectorAll('.chptheading:first-of-type,.chptverses:first-of-type').forEach(x=>{x.remove()})};
            if(numOfChptsOnPage==maxNumOfChptsOnPage){
                [main.querySelector('.chptheading'),main.querySelector('.chptverses')].forEach(x=>{x.remove()})
            };
        }
        else if(firstChapterOnPage!=null && firstChapterOnPage == prevNnxtChapters.nextChapter){
            prependORnot=true;
            // if(numOfChptsOnPage==maxNumOfChptsOnPage){main.querySelectorAll('.chptheading:last-of-type,.chptverses:last-of-type').forEach(x=>{x.remove()})};
            if(numOfChptsOnPage==maxNumOfChptsOnPage){
                [main.querySelector('.chptheading'),main.querySelector('.chptverses')].forEach(x=>{x.remove()})
            };
        }
        else if(oneChptAtaTime){ppp.textContent='';}//clears all chapters
        prependORappendChapters(prependORnot,wholeChapterFragment);
        transliteratedWords_Array.forEach(storedStrnum => {showTransliteration(storedStrnum)});

        return jumpToID;
    }
}

function prependORappendChapters(prependORnot, what_to_append){
    if(prependORnot){ppp.prepend(what_to_append);}
    else{ppp.appendChild(what_to_append);}
    // setTimeout(() => {generateAllMarkers(ppp)}, 100);//Indicate Verses That Have Markers
}

function getPrevNextChapter(focusedChapter, appendHere){
    // Gets THREE chapters at a time if the requested chapter is not the first or last chapter of the Bible
    // This works with the Bible Nav (#bible_nav)
    // That is how it determines which chapter is before and after and
    // Then checks if there is already a (prv/nxt) generated chapter on the page
    
    // Is prevChapter on page
    // const prevChapter = bible.Reference(focusedChapter.fullRef).prevChapter();
    // const nextChapter = bible.Reference(focusedChapter.fullRef).nextChapter();
    // if (prevChapter) {
    //     const bookID = prevChapter.bookID-1;
    //     const prvC = prevChapter.chapter1-1;
    //     let prev_gotoId = `_${prevChapter.bookID-1}.${prvC}.0`;
    //     if (!document.getElementById(prev_gotoId)) {
    //         const pC = {"bkname":bible.Data.allBooks[bookID],"bk_indx":bookID,"chpIndx":prvC}
    //         appendHere.append(generateChapter(pC));
    //     }
    // }
    appendHere.append(generateChapter(focusedChapter));
    //Is nextChapter on page
    if (nextChapter) {
        const bookID = nextChapter.bookID-1;
        const nxtC = nextChapter.chapter1-1;
        const prev_gotoId = `_${bookID}.${nxtC}.0`;
        const nC = {"bkname":bible.Data.allBooks[bookID],"bk_indx":bookID,"chpIndx":nxtC}
        if (!document.getElementById(prev_gotoId)) {
            appendHere.append(generateChapter(nC));
        }
    }
}

function generateChapter(xyz){

    // This Generates 1 chapter and
    // Returns a documentFragment
    let wholeChapterFragment = document.createDocumentFragment();
    let xyz_bookName,xyz_bookIdx,xyz_chNumInBk;
    if(xyz instanceof Element){
        xyz_bookName = xyz.getAttribute("bookname");
        xyz_bookIdx = Number(xyz.getAttribute("bookindex"));
        xyz_chNumInBk = Number(xyz.getAttribute("chapterindex"));
    }
    else if(typeof xyz === 'object'){
        
        xyz_bookName = xyz.bkname;
        xyz_bookIdx = xyz.bk_indx;
        xyz_chNumInBk = xyz.chpIndx;
    }
    let chapterHeading = null;
    let actualChapter;
    for (const vrzn of versionsToShow) {
        actualChapter = window[vrzn]?.[xyz_bookName]?.[xyz_chNumInBk];
        if (actualChapter) {
            currentlyParsedVersion = vrzn;
            break
        }
    }
  
    // Create Chapter Heading
    chapterHeading = document.createElement('h2');
    chapterHeading.classList.add('chptheading');
    chapterHeading.setAttribute('bookName', xyz_bookName);
    chapterHeading.append(`${xyz_bookName} ${xyz_chNumInBk+1}`);
    chapterHeading.id = `_${xyz_bookIdx}.${xyz_chNumInBk}`;
    wholeChapterFragment.appendChild(chapterHeading);
  
    // Create Chapter Verses
    let chpVersesContainer = document.createElement('div');
    chpVersesContainer.classList.add('chptverses');
    chpVersesContainer.setAttribute('bookName', xyz_bookName);
    chpVersesContainer.setAttribute('bookId', xyz_bookIdx);
    chpVersesContainer.setAttribute('chapter', xyz_chNumInBk + 1);

    let verseFragment = document.createDocumentFragment();
    for (let i = 0; i < actualChapter.length; i++) {
        const verseContent = actualChapter[i];
      
      parseSingleVerse(xyz_bookIdx, xyz_chNumInBk, i + 1, verseContent, verseFragment, xyz_bookName, i);
    }
    chpVersesContainer.append(verseFragment);
    wholeChapterFragment.appendChild(chpVersesContainer);
    currentlyParsedVersion = null;

    return wholeChapterFragment;
}

async function parseSingleVerse(bkid, chNumInBk, vNumInChpt, vText, appendHere, bookName, vIdx, fromSearch=false, bibleVersionName){
    chNumInBk = fromSearch ? chNumInBk : chNumInBk+1;
    const verseNotesANDmarkers = checkAndIndicateThatVerseHasNote(bookName, chNumInBk, vNumInChpt);
    let verseHasNote = verseNotesANDmarkers.notes;
    let verseMarkers = verseNotesANDmarkers.markers;
    let vref = `${bookName} ${chNumInBk}:${vNumInChpt}`;
    let verseMultipleSpan = document.createElement('span');
    verseMultipleSpan.classList.add('vmultiple');
    /* ***************************** */
    /* Check if verse was bookmarked */
    /* ***************************** */
    if (bookMarkedVersesArr.indexOf(vref) > -1) {verseMultipleSpan.classList.add('v_dblclckd');}
    verseMultipleSpan.setAttribute('ref', vref);
    let verseSpan = document.createElement('span');
    let verseNum = document.createElement('code');
    // let bereanIndex = jsonVerseIdex - versesOT;/* TO BE CHANGED */

    if (vText == null && bibleVersionName) {
        vText = window[bibleVersionName][bookName][chNumInBk - 1][vNumInChpt - 1];
    }

    if (fromSearch) {
        let trans_lang;
        bibleVersionName = bibleVersionName || bversionName;// if (!bibleVersionName) {}
        trans_lang = bible.Data.supportedVersions[bibleVersionName].language;
        verseSpan = parseVerseText(vText, verseSpan);
        if (bibleVersionName) {
            verseSpan.classList.add(`v_${bibleVersionName}`);
            let vc;
            if (bible.isRtlVersion(bibleVersionName, bookName) == true) {
                verseSpan.classList.add('rtl');
                verseNum.prepend(`[${(chNumInBk)}:${vNumInChpt} ${fullBookName(bookName).shortBkn}](${bibleVersionName})`);
            } else {
                verseNum.prepend(`(${bibleVersionName})[${fullBookName(bookName).shortBkn} ${(chNumInBk)}:${vNumInChpt}]`);
            }
        } else {
            verseNum.prepend(`${chNumInBk}:${vNumInChpt} `);
        }
        verseNum.setAttribute('ref', `${bookName} ${chNumInBk}:${vNumInChpt}`);
        verseNum.setAttribute('aria-hidden','true');//so that screen readers ignore the verse numbers
        verseSpan.prepend(' ');
        verseSpan.prepend(verseNum);

        createTransliterationAttr(verseSpan, trans_lang);
        verseSpan.classList.add('verse');
        addNoteClassIfVerseHasNote(verseSpan);
        const lastVersionInVerseHolder = appendHere.querySelector('.verse:last-of-type');
        // const lastVersionInVerseHolder = appendHere.lastOfType('.verse');
        /* ****************************************************************************** */
        /* appendHere.nodeType==1 ensure it is an element node and not a documentFragment */
        /* ****************************************************************************** */
        if (appendHere.nodeType == 1 && lastVersionInVerseHolder && lastVersionInVerseHolder.nextElementSibling) {
            insertElmAafterElmB(verseSpan, lastVersionInVerseHolder)
        } else {
            appendHere.appendChild(verseSpan);
        }
        transliteratedWords_Array.forEach(storedStrnum => {showTransliteration(storedStrnum)});
        return
    }
    // /* OTHER VERSIONS */
    if (versionsToShow.length != 0) {
        versionsToShow.forEach(bv2d => {
            currentlyParsedVersion = bv2d;
            let trans_lang = bible.Data.supportedVersions[bv2d].language;
            let verseSpan2 = document.createElement('span');
            let verseNum2 = document.createElement('code');
            let vText2 = window[bv2d]?.[bookName]?.[chNumInBk - 1]?.[vIdx] ?? null;
            if (!vText2) {return}
            
            verseSpan2 = parseVerseText(vText2, verseSpan2);
            verseSpan2.classList.add(`v_${bv2d}`)

            verseNum2.setAttribute('ref', `${bookName} ${chNumInBk}:${vNumInChpt}`);
            verseNum2.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
            verseSpan2.prepend(' ');
            verseSpan2.prepend(verseNum2);
            verseSpan2.classList.add('verse');
            if (bible.isRtlVersion(bv2d, bookName) == true) {
                verseSpan2.classList.add('rtl');
                verseNum2.prepend(`${chNumInBk}:${vNumInChpt} ${fullBookName(bookName).shortBkn} [${bv2d}]`);
            } else {
                verseNum2.prepend(`[${bv2d}] ${fullBookName(bookName).shortBkn} ${(chNumInBk)}:${vNumInChpt}`);
            }
            createTransliterationAttr(verseSpan2, trans_lang);
            verseMultipleSpan.appendChild(verseSpan2);
            verseMultipleSpan.id = (`_${bkid}.${chNumInBk-1}.${vNumInChpt-1}`);
            addNoteClassIfVerseHasNote(verseMultipleSpan);
        })
    }
    // Get Subheading if availabe and attach it first
    const vSubHeading = attachSubheading(appendHere, [bkid+1, chNumInBk, vNumInChpt]);
    
    appendHere.appendChild(verseMultipleSpan);
    currentlyParsedVersion = null;
    return appendHere

    function addNoteClassIfVerseHasNote(vms) {
        verseHasNote.forEach(noteClass => {noteClass!='undefined' ? vms.classList.add(noteClass):null;});
        verseMarkers.forEach(noteMarker => {vms.classList.add(`marker_${noteMarker}`);});
    }
}
function parseVerseText(vT, verseSpan) {

    if (Array.isArray(vT)) {
        previousVT=vT;
        vTLength = Object(vT).length;
        let redWordFRAG, redWordSpan, startRed, endRed, restartRed, italicStart=false, italicEnd=true;
        let italicElm;
        vT.forEach((wString, i) => {
            let wordSpan = document.createElement('span');
            let wordSpan1 = document.createElement('span');
            let wordSpan2 = document.createElement('span');

            // For making words of Christ red, for versions that have it, e.g., WEB. (The WEB translation however has issues so I do not use it)
            if (/^""/.test(wString[0]) || (restartRed && versionWithRedWordsArray.includes(currentlyParsedVersion))) {
                startRed = true;
                redWordFRAG = new DocumentFragment()
                redWordSpan = document.createElement('span');
                redWordSpan.classList.add('red');
                /* To ensure it only applies the red word span accross multiple verses for the same translation */
                if (!versionWithRedWordsArray.includes(currentlyParsedVersion)) {
                    versionWithRedWordsArray.push(currentlyParsedVersion);
                }
            };
            if (/""$/.test(wString[0])) {
                endRed = true;
                removeItemFromArray(currentlyParsedVersion, versionWithRedWordsArray)
            };

            if (wString.length === 3) {
                if (wString[2].includes('/')) {
                  const [splt_L1, splt_L2] = wString[2].split('/');
                  wordSpan1.setAttribute('TH', splt_L1);
                  wordSpan2.setAttribute('TH', splt_L2);
                } else {
                  wordSpan.setAttribute('TH', wString[2]);
                }
              }
            if (wString.length >= 2) {
                if (wString[0].includes('/')) { //For words such as ["וְ/כָל","Hc/H3605","HC/Ncmsc"]
                    const [splt_L1, splt_L2] = wString[0].split('/');

                    wordSpan1.classList.add('translated');
                    wordSpan1.setAttribute('data-xlit', "");
                    wordSpan1.setAttribute('data-lemma', "");
                    wordSpan1.setAttribute('strnum', wString[1].split('/')[0]);
                    wordSpan1.setAttribute('data-kjv-trans', ' ' + splt_L1);
                    wordSpan1.setAttribute('translation', ' ' + splt_L1);
                    wordSpan1.innerHTML = splt_L1;
                    versespanAppender([' ', wordSpan1]);

                    wordSpan2.classList.add('translated');
                    wordSpan2.setAttribute('data-xlit', "");
                    wordSpan2.setAttribute('data-lemma', "");
                    wordSpan2.setAttribute('strnum', wString[1].split('/')[1]);
                    // wordSpan2.classList.add(wString[1].split('/')[1]);
                    wordSpan2.setAttribute('data-kjv-trans', ' ' + splt_L2);
                    wordSpan2.setAttribute('translation', ' ' + splt_L2);
                    wordSpan2.innerHTML = splt_L2;
                    versespanAppender([wordSpan2]);
                } else {
                    // The actual translated text
                    wStringREGEXED = wString[0];
                    
                    italicsStartnEnd(wStringREGEXED)
                    
                    wStringREGEXED = wStringREGEXED.replace(/\{/g, '<sup>');
                    wStringREGEXED = wStringREGEXED.replace(/\}/g, '</sup>');
                    wStringREGEXED = wStringREGEXED.replace(/(^"")|(^")/g, '“');
                    wStringREGEXED = wStringREGEXED.replace(/(""$)|"$/g, '”');
                    
                    // Create its "SPAN" container and set attributes as needed 
                    if (wString[1] != 'added') {//If it has an actual strongs number
                        wordSpan.classList.add('translated');
                        wordSpan.setAttribute('data-xlit', "");
                        wordSpan.setAttribute('data-lemma', "");
                        wordSpan.setAttribute('strnum', wString[1]);
                        // wordSpan.classList.add(wString[1]);
                        wordSpan.setAttribute('data-kjv-trans', ' ' + wStringREGEXED);//add the actual translation as an attribute
                        wordSpan.setAttribute('translation', ' ' + wStringREGEXED);//add the actual translation as an attribute
                        // If it is a Title to a Psalm (**they are in italics in the original document, ABP in particular)
                        if(italicStart==true && italicEnd==false){
                            wordSpan.classList.add('em');
                        }
                        if(italicStart==true && italicEnd==true){
                            italicStart=false;
                            // //console.log(wStringREGEXED)
                            wordSpan.classList.add('em');
                            wStringREGEXED=wStringREGEXED+'<hr>'
                        }
                    }

                    // Add the text to the "SPAN" element
                    wordSpan.innerHTML = wStringREGEXED;
                    // Add the "SPAN" element with text in it to the current verse
                    versespanAppender([' ', wordSpan]);
                }
            }
            if (wString.length == 1) {
                let spacebtwwords = ' ';
                // Check if last string of string is a punctuation that should be followed by a space
                if (([".", ",", ":", ";", "?", "]", ")"].includes(wString[0][0]) == true)) {
                    spacebtwwords = '';
                }

                if (wString[0].match(/\{\d+\}/)) {// ABP word order number
                    spacebtwwords = ' ';
                    wStringREGEXED = wString[0];
                    wStringREGEXED = wStringREGEXED.replace(/\{/g, '<sup>');
                    wStringREGEXED = wStringREGEXED.replace(/\}/g, '</sup>');
                    verseSpan.append(' ');
                    verseSpan.innerHTML=verseSpan.innerHTML+wStringREGEXED;
                } else {
                    wStringREGEXED = wString[0];
                    //Opening and closing quotations marks
                    wStringREGEXED = wStringREGEXED.replace(/(^"")|(^")/g, '“');
                    wStringREGEXED = wStringREGEXED.replace(/(""$)|"$/g, '”');
                    italicsStartnEnd(wStringREGEXED)
                    if(italicStart==true && italicEnd==false){
                        // //console.log('italicsStartnEnd')
                        wordSpan.append(wStringREGEXED);
                        wordSpan.classList.add('em');
                    }
                    if(italicStart==true && italicEnd==true){
                        italicStart=false;
                        wStringREGEXED = wStringREGEXED.replace(/<ii>/g, '')
                        wordSpan.append(wStringREGEXED);
                        wordSpan.append(document.createElement('hr'));
                        wordSpan.classList.add('em');
                        wStringREGEXED=wordSpan;
                    }
                    if (startRed) {
                        redWordFRAG.append(spacebtwwords);
                        redWordFRAG.append(wStringREGEXED);
                    } else {
                        verseSpan.append(spacebtwwords);
                        verseSpan.append(wStringREGEXED);
                    }
                }
                
            }
            verseSpan.innerHTML = verseSpan.innerHTML.replace(/<\/sup> /g, '</sup>').replace(/(([\(\[])\s*)/g, '$2').replace(/NaN/g, '');
        });
        function italicsStartnEnd(wStringREGEXED){
            italicStart
            italicEnd
            if((italicStart==false)&&(/<i>/i.test(wStringREGEXED))){
                italicStart=true;
                italicEnd=false;
                wStringREGEXED = wStringREGEXED.replace(/<i>/g, '');
            }
            if(/<ii>/i.test(wStringREGEXED)){
                italicEnd=true;
                wStringREGEXED = wStringREGEXED.replace(/<ii>/g, '');
            }
        }
        function versespanAppender(arr) {
            if (redWordFRAG) {
                arr.forEach(a => {
                    redWordFRAG.append(a)
                })
                restartRed = false;
                if (endRed || i == vTLength - 1) {
                    redWordSpan.append(redWordFRAG);
                    verseSpan.append(redWordSpan);
                    endRed = null;
                    startRed = null;
                    if (i == vTLength - 1) {
                        restartRed = true;
                    }
                }
            } else {
                arr.forEach(a => {
                    verseSpan.append(a)
                })
            }
        }
    } else {
        if(vT){
            vT = vT.replace(/<hi type="bold">/g, '<span class="b">');
            vT = vT.replace(/<hi type="italic">/g, '<span class="i">');
            vT = vT.replace(/<\/hi>/g, '</span>');
            vT = vT.replace(/<ptitle>/g, '<span class="em">');
            vT = vT.replace(/<\/ptitle>/g, '</span><hr>');
            vT = modifyQuotationMarks(vT);
            vT = vT.replace(/ ,/g, ',');
            verseSpan.innerHTML = vT;
        }
    }
    
    return verseSpan;
}

let subheadings;
async function getSubheading() {
    if(!subHeadingsFileName){loadSubheading()}
    const subheadingsFilePath = "data/sub_headings/" + subHeadingsFileName;
    try {
        const response = await fetch(subheadingsFilePath);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        subheadings = await response.json();
    } catch (error) {
        //console.error('There has been a problem with your fetch operation:', error);
    }
}
(async function (){await getSubheading();})();// Get Subheading
async function attachSubheading(appendHere, arr) {
    // Implement your logic to attach the subheading here
    if(subheadings && subheadings[arr[0]] && subheadings[arr[0]][arr[1]] && subheadings[arr[0]][arr[1]][arr[2]]) {
        let subHeading = subheadings[arr[0]][arr[1]][arr[2]];
        let subHeading_split = subHeading.split(/\s+::\s+/);
        subHeading_split.forEach(subH => {
            let subHeadingDiv = document.createElement('div');
            subHeadingDiv.innerHTML = subH;
            subHeadingDiv.classList.add('subheadings');
            // Does it have subheading level number
            if(levelNum = subH.match(/(\d+)\]$/)){
                subHeadingDiv.classList.add('level_'+levelNum[1]);
            }
            appendHere.appendChild(subHeadingDiv);
        })
    }
    else if(!subheadings){await getSubheading()}
}
function loadSubheading(value){
    if (document.body.id != 'homepage') {return}
    let subHeadFiles = {"NIV1984":"Subheadings (NIV1984).json","NIV2011":"Subheadings (NIV2011).json","BereanSB":"Subheadings (BereanStudyBible).json","TSK":"Subheadings (TSK).json"};
    if(!value){
        if(localStorage.getItem("subHeadingsFileName")!='undefined' && localStorage.getItem("subHeadingsFileName")!='null'){subHeadingsFileName = localStorage.getItem("subHeadingsFileName");}
        else {value = "BereanSB"; subHeadingsFileName = subHeadFiles[value];}
        value = Object.keys(subHeadFiles).find(k => subHeadFiles[k] === subHeadingsFileName);
    }
    else {subHeadingsFileName = subHeadFiles[value];}
    localStorage.setItem("subHeadingsFileName",subHeadingsFileName);
    Subheadings_source.value = value;
}
loadSubheading();// Load Subheading