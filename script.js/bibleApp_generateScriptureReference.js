var versesOT = 23145;
var versesNT = 7957;
var versesTotal = 31102;

var currentBook, currentBookName, currentChapter;

// Populate Select Lists with Layouts and Categories from JSON file
var selectBooks = document.querySelector('#bible_books');
var selectChapters = document.querySelector('#bible_chapters');
var selectVerse = document.querySelector('#bible_verses');
var ppp = document.querySelector('#ppp');

var goto; //to determine if clicking on chapter number shows only the chapter or scrolls to the chapter
function createChaptersVerses(xxx, yyy) {
    //Clear the chapters refnav pane
    selectVerse.querySelectorAll('*').forEach(element => {
        element.remove();
    });
    getTextOfChapter(xxx, yyy)
}

function getTextOfBook(xxx) {
    getTextOfChapter(xxx, 0)
}

//ON CLICK OF CHAPTER, CLEAR PAGE IF NOT ALREADY PRESENT
function clearPageIfChapterNotPresent(xxx) {
    chNumInBk = Number(xxx.getAttribute("chapterindex"));
    chStartIdx = Number(xxx.getAttribute("chapterStartIndex"));
    chEndIdx = Number(xxx.getAttribute("chapterendindex")) + 1;
    bookName = xxx.getAttribute("bookname");

    currentBookName = bookName;
    bkid = Number(xxx.getAttribute("bookindex"));
    gotoId = '_' + bkid + '.' + chNumInBk + '.0';

    // IF TEXT IS NOT ALREADY ON PAGE, JUST SCROLL TO IT
    if (!document.getElementById(gotoId)) {
        ppp.replaceChildren();
    }
}

// GENERATE THE TEXT/VERSES OF THE SELECTED CHAPTER
function getTextOfChapterOnScroll(xxx, prependORnot, adjustScrolling) {
    var old_scrollheight = main.scrollHeight; //store document height before modifications
    let wholeChapterFragment = new DocumentFragment();
    wholeChapterFragment.prepend(generateChapter(xxx));
    prependORappendChapters(prependORnot, wholeChapterFragment);
    // getBksChptsNum(clickCurrentBook(xxx).book);
    if (adjustScrolling) {
        main.scrollTo(0, main.scrollHeight - old_scrollheight)
    }
}

function getTextOfChapter(xxx, oneChptAtaTime = 1, prependORnot, freshClick = false) {
    // console.log('gotoId')
    chNumInBk = Number(xxx.getAttribute("chapterindex"));
    bkid = Number(xxx.getAttribute("bookindex"));
    bookName = xxx.getAttribute("bookname");
    currentBookName = bookName;
    // setItemInLocalStorage('lastBookandChapter', 'book_' + bkid + ',' + xxx.getAttribute("value") + ',' + bookName);
    // clickCurrentBook(xxx);
    let gotoId = '_' + bkid + '.' + chNumInBk + '.0';
    // console.log(chNumInBk + ' ' + bkid + ' ' + bookName + ' ' + gotoId)
    if (document.getElementById(gotoId)) { // IF TEXT IS ALREADY ON PAGE, JUST SCROLL TO IT
        scrollToVerse(document.getElementById(gotoId));
    } else { // TEXT NOT ALREADY ON PAGE, SO FRESHLY GENERATE THE CONTENT
        if (oneChptAtaTime) {
            ppp.replaceChildren();
        } //will only contain one chapter at a time
        let wholeChapterFragment = new DocumentFragment();
        if (freshClick) {
            getPrevNextChapter(xxx, wholeChapterFragment);
            prependORappendChapters(prependORnot, wholeChapterFragment);
        } else {
            wholeChapterFragment.prepend(generateChapter(xxx));
            prependORappendChapters(prependORnot, wholeChapterFragment);
        }
        // console.log(gotoId)
        scrollToVerse(document.getElementById(gotoId));
    }
}

function clickCurrentBook(xxx) {
    bookName = xxx.getAttribute("bookname");
    currentBookName = bookName;
    let bk_option = bible_books.querySelector('[bookname="' + bookName + '"]');
    return {
        indicateBknChpt: indicateBooknChapterInNav(bk_option, xxx),
        clickBook: bk_option.click(),
        clickChpt: xxx.click(),
        book: bk_option
    }
}

function prependORappendChapters(prependORnot, what_to_append) {
    if (!prependORnot) {
        ppp.appendChild(what_to_append);
    } else {
        ppp.prepend(what_to_append);
    }
}

function getPrevNextChapter(prvORnxtChpt, appendHere) {
    //Is prevChapter on page
    if (prvORnxtChpt.previousElementSibling) {
        // console.log('previousElementSibling')

        let prevChapter = prvORnxtChpt.previousElementSibling;
        let prev_chNumInBk = Number(prevChapter.getAttribute("chapterindex"));
        let prev_bkid = Number(prevChapter.getAttribute("bookindex"));
        let prev_gotoId = '_' + prev_bkid + '.' + prev_chNumInBk + '.0';
        if (!document.getElementById(prev_gotoId)) {
            appendHere.append(generateChapter(prevChapter));
        }
    }
    appendHere.append(generateChapter(prvORnxtChpt));
    //Is nextChapter on page
    if (prvORnxtChpt.nextElementSibling) {
        let nextChapter = prvORnxtChpt.nextElementSibling;
        let nxt_chNumInBk = Number(nextChapter.getAttribute("chapterindex"));
        let nxt_bkid = Number(nextChapter.getAttribute("bookindex"));
        let nxt_gotoId = '_' + nxt_bkid + '.' + nxt_chNumInBk + '.0';
        if (!document.getElementById(nxt_gotoId)) {
            appendHere.append(generateChapter(nextChapter));
        }
    }
}

function generateChapter(xyz) {
    let wholeChapterFragment = new DocumentFragment();
    let chpHeadingFragment = new DocumentFragment();
    let chapterHeading = null;
    let chpVersesFragment = new DocumentFragment();
    let chapterVersesSpan = document.createElement('SPAN');
    let xyz_bookName = xyz.getAttribute("bookname");
    let xyz_bookIdx = Number(xyz.getAttribute("bookindex"));
    let xyz_chNumInBk = Number(xyz.getAttribute("chapterindex"));
    let actualChapter = window[versionsToShow[0]][xyz_bookName][xyz_chNumInBk];
    // let actualChapter = KJV[xyz_bookName][xyz_chNumInBk];
    for (vNumInChpt = 1, i = 0; i < actualChapter.length; i++, vNumInChpt++) {
        // Create Chapter Heading
        if (vNumInChpt == 1) {
            chapterHeading = document.createElement('h2');
            chapterHeading.classList.add('chptheading');
            chapterHeading.setAttribute('bookName', xyz_bookName);
            chapterHeading.append(xyz_bookName + ' ' + (xyz_chNumInBk + 1));
            chapterHeading.id = '_' + xyz_bookIdx + '.' + (xyz_chNumInBk);
            chpHeadingFragment.prepend(chapterHeading)
        }
        let verseContent = actualChapter[i];
        parseSingleVerse(xyz_bookIdx, xyz_chNumInBk, vNumInChpt, verseContent, chpVersesFragment, xyz_bookName, i)
    }
    chapterVersesSpan.classList.add('chptverses');
    chapterVersesSpan.setAttribute('bookName', xyz_bookName);
    chapterVersesSpan.setAttribute('bookId', xyz_bookIdx);
    chapterVersesSpan.setAttribute('chapter', xyz_chNumInBk + 1);
    chapterVersesSpan.append(chpVersesFragment);
    wholeChapterFragment.append(chapterVersesSpan);
    wholeChapterFragment.prepend(chpHeadingFragment);
    return wholeChapterFragment;
    // chpVersesFragment.prepend(chpHeadingFragment);
    // return chpVersesFragment;
}

function parseSingleVerse(bkid, chNumInBk, vNumInChpt, vText, appendHere, bookName, vIdx, fromSearch=false, bibleVersionName) {    
    let verseMultipleSpan = document.createElement('span');
    verseMultipleSpan.classList.add('vmultiple')
    let verseSpan = document.createElement('span');
    let verseNum = document.createElement('code');
    // let bereanIndex = jsonVerseIdex - versesOT;/* TO BE CHANGED */

    // let parsedVerse = new DocumentFragment();
    if(vText==null&&bibleVersionName){
        vText = window[bibleVersionName][bookName][chNumInBk-1][vNumInChpt-1];
    }

    function parseVerseText(vT, verseSpan) {
        let wcount = 0;
        if (Array.isArray(vT)) {
            vT.forEach(wString => {
                let wordSpan = document.createElement('span');
                wcount++;
                if (wString.length == 3) {
                    wordSpan.setAttribute('TH', wString[2]);
                }
                if (wString.length >= 2) {
                    if (wString[1] != 'added') {
                        wordSpan.classList.add('translated');
                        wordSpan.setAttribute('data-xlit', "");
                        wordSpan.setAttribute('data-lemma', "");
                        wordSpan.setAttribute('strnum', wString[1]);
                        wordSpan.setAttribute('data-kjv-trans', ' ' + wString[0]);
                        wordSpan.setAttribute('translation', ' ' + wString[0]);
                    }

                    wordSpan.innerHTML = wString[0];
                    verseSpan.append(' ')
                    verseSpan.append(wordSpan)
                }
                if (wString.length == 1) {
                    let spacebtwwords = '';
                    if (([".", ",", ":", ";", "?"].includes(wString[0]) == false)) {
                        spacebtwwords = ' ';
                    }
                    verseSpan.append(spacebtwwords)
                    verseSpan.append(wString[0])
                }
                // '<span class="translated" translation="created" data-kjv-trans="created" strnum="H853 H1254" data-xlit="" data-lemma="">created</span>'
            });
        } else {
            vT = vT.replace(/<hi type="bold">/g, '<strong>');
            vT = vT.replace(/<\/hi>/g, '</strong>');
            verseSpan.innerHTML = vT;
        }
        return verseSpan;
    }
    if (fromSearch) {
        let trans_lang;
        if(bibleVersionName){
            trans_lang = bible.Data.supportedVersions[bibleVersionName].language;
        }
        verseSpan = parseVerseText(vText, verseSpan);
        if(bibleVersionName){
            verseNum.prepend(document.createTextNode(`${bibleVersionName} ${(chNumInBk)}:${vNumInChpt} `));
            verseSpan.classList.add(`v_${bibleVersionName}`);
        }
        else{
            verseNum.prepend(document.createTextNode((chNumInBk) + ':' + vNumInChpt + ' '));
            // verseSpan.id = ('_' + bkid + '.' + (chNumInBk) + '.' + (vNumInChpt - 1));
        }
        verseNum.setAttribute('ref', bookName + ' ' + (chNumInBk) + ':' + vNumInChpt);
        verseNum.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
        verseSpan.prepend(verseNum);
        createTransliterationAttr(verseSpan,trans_lang);
        verseSpan.classList.add('verse');
        appendHere.appendChild(verseSpan);
        transliteratedWords_Array.forEach(storedStrnum => {
            showTransliteration(storedStrnum)
        });
        return
    }
    // /* OTHER VERSIONS */
    if (versionsToShow.length != 0) {
        versionsToShow.forEach(bv2d => {
            let trans_lang = bible.Data.supportedVersions[bv2d].language;
            // console.log(window[bv2d][bookName][chNumInBk][vIdx])
            let verseSpan2 = document.createElement('span');
            let verseNum2 = document.createElement('code');
            // console.log(versionsToShow)
            // console.log(window[bv2d])
            let vText2 = window[bv2d][bookName][chNumInBk][vIdx]
            verseSpan2 = parseVerseText(vText2, verseSpan2);
            verseSpan2.classList.add(`v_${bv2d}`)

            verseNum2.setAttribute('ref', bookName + ' ' + (chNumInBk + 1) + ':' + vNumInChpt);
            verseNum2.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
            verseSpan2.prepend(verseNum2);
            verseSpan2.classList.add('verse');
            if(bible.isRtlVersion(bv2d,bookName)==true){
                verseSpan2.classList.add('rtl');
                verseNum2.prepend(document.createTextNode(`${(chNumInBk + 1)}:${vNumInChpt} ${bv2d}`));
            }else{                
                verseNum2.prepend(document.createTextNode(`${bv2d} ${(chNumInBk + 1)}:${vNumInChpt} `));
            }
            // verseSpan2.id = ('_' + bkid + '.' + (chNumInBk) + '.' + (vNumInChpt - 1));
            createTransliterationAttr(verseSpan2,trans_lang);
            verseMultipleSpan.appendChild(verseSpan2);
            verseMultipleSpan.id = ('_' + bkid + '.' + (chNumInBk) + '.' + (vNumInChpt - 1));
        })
    }
    appendHere.appendChild(verseMultipleSpan);
    return appendHere
}


// function getTextOfVerse(xxx) {
//     vIdx = xxx.getAttribute("verseIndex")
//     ppp.append(bcv_kjv[Number(vIdx)].text)
// }