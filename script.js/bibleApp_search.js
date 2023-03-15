/* FUNCTION FOR SEARCH FOR SCRIPTURES BY WORDS AND PHRASES */
let booksToSearchIn=[];
/* Below I sync the two places (wordsearch & wordsearch_fixed) where search can be run from */
['wordsearch', 'wordsearch_fixed'].forEach(wsId=>{
    let forws=document.querySelector('#for' + wsId); 
    let ws=document.querySelector('#' + wsId);
    let disableornot;

    /* TO DISABLE ENABLE WORD-SEARCH BUTTON */
    ws.addEventListener('keyup', function(){
        if(ws.value.trim()!=''){disableornot=false;}
        else{disableornot=true;}
        forws.disabled=disableornot;
        if(ws==wordsearch){
            wordsearch_fixed.value = ws.value
            forwordsearch_fixed.disabled=disableornot;
        } else {
            wordsearch.value = ws.value
            forwordsearch.disabled=disableornot;
        }
    });

    /* RUN RUNWORDSEARCH() FUNCTION ON PRESSING ENTER KEY */
    ws.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            runWordSearch()
            e.preventDefault();
        }
    });
})

searchPreviewFixed.addEventListener("click", codeElmRefClick);
let verseCount;
function returnStrippedTextOfVerse(vTxt) {
    let madePlain_without_strongs,arrayOfStrongs=[];
    if(Array.isArray(vTxt)){
        arrayOfStrongs = vTxt.map(txt=>txt[1]);
        let arrayOfWordsWithoutStrongs = vTxt.map(txt=>txt[0]);
        // console.log(arrayOfWordsWithoutStrongs);
        // console.log(arrayOfStrongs);
        madePlain_without_strongs = arrayOfWordsWithoutStrongs.filter(elm=>{if(!/^[,.?\-]$/.test(elm)){return elm}}).join(' ');
        // if(verseCount==0){
            // console.log(vTxt);
            // console.log(madePlain_without_strongs);
            // verseCount++
        // }
    } else {
        vTxt = vTxt.toString()
        let madePlain = vTxt.replace(/"\],\["/g, ' '); //strip off '],['
        madePlain = madePlain.replace(/","/g, ' '); //strip off '","'
        madePlain = madePlain.replace(/,/g, ' '); //strip off '","'
        madePlain = madePlain.replace(/’/g, "'");
        madePlain = madePlain.replace(/”/g, '"');
        madePlain = madePlain.replace(/[{}\[\]]/g, ' '); //strip off {}[]
        madePlain = madePlain.replace(/<i>/g, ' ');
        madePlain = madePlain.replace(/<\/i>/g, ' ');
        madePlain = madePlain.replace(/<r>/g, ' ');
        madePlain = madePlain.replace(/<\/r>/g, ' ');
        madePlain = madePlain.replace(/\s\s+/g, ' ');
        madePlain_TH = madePlain.replace(/TH\d+/g, ''); //strip off strongs numbers
        madePlain_TH = madePlain_TH.replace(/\s\s+/g, ' '); //strip off strongs numbers
        madePlain_without_strongs = madePlain_TH.replace(/[HG]\d+/g, ''); //strip off strongs numbers
        madePlain_without_strongs = madePlain_without_strongs.replace(/\s\s+/g, ' '); //strip off strongs numbers
    }
    return {
        withOutStrongs: madePlain_without_strongs,
        arrayOfStrongsNums:arrayOfStrongs
    }
}

function arrayOfWordsToSearchFor(w) {
    let caseSensitivity='';
    if(!case_sensitive.checked){w=w.toLowerCase(); caseSensitivity='i';}
    // let hasStrongs = w.replace(/.*[H|G|h|g]\d+.*/ig, 'YesItHasStrongs');
    let hasStrongs = /.*[H|G|h|g]\d+.*/.test(w); //YesItHasStrongs
    w = w.replace(/[(\s\s+),.;:]/g, ' ');
    w = w.trim();
    let wArray = w.split(' ');
    let searchStrongsNumArray = [];
    let non_StrongsNumArray = [];
    wArray.forEach((x)=>{
        if(new RegExp(/\b[H|G|h|g]\d+.*/).test(x)){
            searchStrongsNumArray.push(x)
        } else {
            non_StrongsNumArray.push(x)
        }
    })
    function createStyleRuleForSearchedWords(){
        let styleID = 'search_returned_words'
        let styleRule = '';
        searchStrongsNumArray.forEach((x,i)=>{styleRule=`${styleRule}#searchPreviewFixed [strnum*="${x}"${caseSensitivity}],`});
        non_StrongsNumArray.forEach((x,i)=>{styleRule=`${styleRule}#searchPreviewFixed [translation*="${x}"${caseSensitivity}],`});
        //Remove last comma in "styleRule"
        styleRule = styleRule.substring(0, styleRule.length - 1);
        styleRule = `${styleRule}{
            font-style:italic;color:var(--searchedword-hlt);border-bottom: 3px solid orange!important;
        }`
        createNewStyleSheetandRule(styleID, styleRule)
    }
    createStyleRuleForSearchedWords()
    return {
        "wordsArray": wArray,
        "hasStrongsNum": hasStrongs,
        "moreThanOneWord": wArray.length > 1,
        "searchStrongsNumArray": searchStrongsNumArray,
        "non_StrongsNumArray": non_StrongsNumArray,
    }
}
/* 
SOME POSSIBLE SEARCH PARAMETERS
Search excluding Strongs Number
    Search for verses with the exact phrase
Search may include Strongs Number
    Search for verses with any of the words
    Search for verses that have all the words in any order
*/
let runWordSearchCount = 0;
function runWordSearch() {
    let wholeWordChecked=whole_word.checked;
    let anyWordChecked=search_anyWord.checked;
    verseCount=0;
    if (wordsearch.value.trim() == '' || wordsearch.value.trim().length < 2) {
        return
    }
    runWordSearchCount++;
    let word2find, wordsearchValue;
    wordsearchValue = wordsearch.value;
    wordsearchValue=wordsearchValue.replace(/’/g, "'");
    wordsearchValue=wordsearchValue.replace(/”/g, '"');
    //If Case Sensitive Search
    if(case_sensitive.checked) {
        word2find = new RegExp(wordsearch.value);
    } else {
        wordsearchValue = wordsearch.value.toLowerCase();
        // word2find = new RegExp(wordsearchValue, "i");
        word2find = wordsearchValue;
    }
    let searchResultArr = [];
    let moreThanOneWord = arrayOfWordsToSearchFor(wordsearchValue).moreThanOneWord

    function searchInPage() {
        allVersesInPage.forEach(v => {
            if (v.innerText.search(word2find) != -1) {
                searchResultArr.push(v.id)
                scrollToVerse(v)
            }
        });
    }

    let searchFragment = new DocumentFragment()

    function appendVerseToSearchResultWindow(currentBK = null, prevBook = null, bkid, chNumInBk, vNumInChpt, vText, appendHere,bookName) {
        if ((prevBook != currentBK) || (prevBook == null)) {
            chapterHeading = document.createElement('h2');
            chapterHeading.classList.add('chptheading');
            chapterHeading.append(currentBK);
            searchFragment.appendChild(chapterHeading)
            // searchPreview.appendChild(chapterHeading)
            prevBook = currentBK;
        }
        let verseID = '_' + bkid + '.' + chNumInBk + '.' + vNumInChpt;
        searchResultArr.push(verseID)
        // console.log(vText)

        parseSingleVerse(bkid, Number(chNumInBk)+1, vNumInChpt, vText, appendHere,bookName,null, true)
        
        /* FOR CROSS-REFS & NOTES IN SEARCH WINDOW */
        let allVsInFrag = appendHere.querySelectorAll('.verse')
        let verseInFrag = allVsInFrag[allVsInFrag.length-1];
        verseInFrag.append(crfnnote_DIV(verseInFrag))
    }

    
    let booksLength;
    function searchJSON() {
        let prevBook = null;
        let currentBK = null;
        let findAnything = false;
        let returnedOBJofArrayOfWordsToSearchFor = arrayOfWordsToSearchFor(wordsearch.value);
        let searchForStrongs = returnedOBJofArrayOfWordsToSearchFor.hasStrongsNum;
        let strongsSearchArray = returnedOBJofArrayOfWordsToSearchFor.searchStrongsNumArray;
        // console.log(strongsSearchArray)

        function loopThroughBibleBooks() {
            // let booksList = bible.Data.bookNamesByLanguage.en;
            //Books to search in
            let booksToSearchIn = listOfBooksToSearchIn(document.getElementById("biblebooksgroup").value);
            booksLength = booksToSearchIn.length;
            let bookName = null;
            
            /* LOOP THROUGH SELECTED BOOKS TO SEARCH IN */
        
            let allBooksWithContentInVersion = window[bversionName];
            for (let x = 0; x < booksLength; x++) {
                // let bookNameInVersion = Object.keys(allBooksWithContentInVersion)[x];
                // bookName = bookNameInVersion;
                bookName = booksToSearchIn[x];
                let allChaptersInCurrentBook = allBooksWithContentInVersion[bookName];
        
                //Loop through Chapters
                let numberOfChapters = allChaptersInCurrentBook.length;
                for (y = 0; y < numberOfChapters; y++) {
                    let currentChapter = allChaptersInCurrentBook[y];
                    let allVersesInCurrentChapter = currentChapter;
                    let chapterVersesLength = currentChapter.length;
                   
                    //If there is a strongs num to be searched for, then you cannot search for a phrase. Rather search to see if verse contains all words
                    if (anyWordChecked == true) {
                        let wordsArray = returnedOBJofArrayOfWordsToSearchFor.wordsArray;
                        for (z = 0; z < chapterVersesLength; z++) {
                            let originalText = allVersesInCurrentChapter[z].toString().toLowerCase();
                            for (let j = 0; j < wordsArray.length; j++) {
                                //IT ONLY NEEDS TO INCLUDE ONE OF THE WORDS
                                let nreg;
                                // If wholeWord is checked or current word is a strong's number search for whole word (will not search for a partially matching strong's num)
                                if(wholeWordChecked||(/[GHgh]\d+/.test(wordsArray[j]))){
                                    nreg = new RegExp("\\b" + wordsArray[j].toLowerCase() + "\\b");
                                } else {nreg = new RegExp(wordsArray[j].toLowerCase());}
                                if (nreg.test(originalText)) {
                                    if ((prevBook != currentBK) || (prevBook == null)) {
                                        prevBook = currentBK;
                                    }
                                    currentBK = bookName;
                                    appendVerseToSearchResultWindow(currentBK, prevBook, x, y, z+1, allVersesInCurrentChapter[z], searchFragment,bookName)
                                    findAnything = true;
                                    break
                                }
                                //IT WILL ONLY CHECK AT THE END OF THE FOR LOOP WHICH IT WILL NOT GET TO IF ALL WORDS ARE NOT INCLUDED IN THE VERSE.TXT
                                // if (j == wordsArray.length - 1) {
                                // }
                            }
                        }
                    }
                    //If there is a strongs num to be searched for, then you cannot search for a phrase. Rather search to see if verse contains all words
                    else if (searchForStrongs == true) {
                        let wordsArray = returnedOBJofArrayOfWordsToSearchFor.wordsArray;
                        for (z = 0; z < chapterVersesLength; z++) {
                            let containsAll = true;
                            //Strip off {}[] and strongs numbers
                            let originalText = allVersesInCurrentChapter[z].toString().toLowerCase();
                            // let vText=originalText;
                            for (let j = 0; j < wordsArray.length; j++) {
                                //IT HAS TO INCLUDE ALL THE WORDS (won't work for a search that is for any of the words)
                                let nreg;
                                // If wholeWord is checked or current word is a strong's number search for whole word (will not search for a partially matching strong's num)
                                if(wholeWordChecked||(/[GHgh]\d+/.test(wordsArray[j]))){
                                    nreg = new RegExp("\\b" + wordsArray[j].toLowerCase() + "\\b");
                                } else {nreg = new RegExp(wordsArray[j].toLowerCase());}
                                if (!nreg.test(originalText)) {
                                    containsAll = false;
                                    break
                                }
                                //IT WILL ONLY CHECK AT THE END OF THE FOR LOOP WHICH IT WILL NOT GET TO IF ALL WORDS ARE NOT INCLUDED IN THE VERSE.TXT
                                if (j == wordsArray.length - 1) {
                                    if ((prevBook != currentBK) || (prevBook == null)) {
                                        prevBook = currentBK;
                                    }
                                    currentBK = bookName;
                                    appendVerseToSearchResultWindow(currentBK, prevBook, x, y, z+1, allVersesInCurrentChapter[z], searchFragment,bookName)
                                    findAnything = true;
                                }
                            }
                        }
                    }
                    //If there is no strongs num to be searched for, then just search for the phrase
                    else if (searchForStrongs == false) {
                        let arrayOfSearchWords = returnedOBJofArrayOfWordsToSearchFor.wordsArray;
                        for (z = 0; z < chapterVersesLength; z++) {
                            let originalText = allVersesInCurrentChapter[z].toString();
                            let originalText_notString = allVersesInCurrentChapter[z];
                            let madePlain = returnStrippedTextOfVerse(originalText_notString).withOutStrongs
                            if (!case_sensitive.checked) {
                                madePlain = madePlain.toLowerCase()
                            }
                            
                            /* PHRASE SEARCH && WHOLE WORD */
                            let arrayOfWordsInVerse = madePlain.split(' ');
                            if (search_phrase.checked){
                                if(((whole_word.checked) && (isAsubArrayofB(arrayOfSearchWords, arrayOfWordsInVerse))) || 
                                 ((!whole_word.checked) && (isAsubArrayofB(arrayOfSearchWords, madePlain.split(' '))))) {
                                if ((prevBook != currentBK) || (prevBook == null)) {
                                    prevBook = currentBK;
                                }
                                currentBK = bookName;
                                appendVerseToSearchResultWindow(currentBK, prevBook, x, y, z+1, allVersesInCurrentChapter[z], searchFragment,bookName)
                                findAnything = true;
                            
                                }
                            }

                            /* ALL WORDS (NOT PHRASE) SEARCH && WHOLE WORD */
                            else if (search_all_words.checked) {
                                if (((whole_word.checked) && (areAllitemsOfAinB(arrayOfSearchWords, arrayOfWordsInVerse))) ||
                                    ((!whole_word.checked) && (areAllitemsOfAinB(arrayOfSearchWords, madePlain)))) {
                                if ((prevBook != currentBK) || (prevBook == null)) {
                                    prevBook = currentBK;
                                }
                                currentBK = bookName;
                                appendVerseToSearchResultWindow(currentBK, prevBook, x, y, z+1, allVersesInCurrentChapter[z], searchFragment,bookName)
                                // console.log(madePlain)
                                findAnything = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        loopThroughBibleBooks();
        // searchPreview.innerHTML = '';
        searchPreviewFixed.innerHTML = '';

        let caseSensitiveSearch;
        if (case_sensitive.checked) {
            caseSensitiveSearch = 'CASE SENSITIVE|'
        } else {
            caseSensitiveSearch = 'CASE INSENSITIVE|'
        }
        let anyWORDsearch;
        let phraseSearch;
        let wholeWordSearch;
        if (searchForStrongs) {
            phraseSearch = 'ANY|';
        } else {
            anyWORDsearch = ''
        }
        if (search_phrase.checked) {
            phraseSearch = 'PHRASE|';
        } else {
            phraseSearch = 'NONE PHRASE|';
        }
        if (whole_word.checked) {
            wholeWordSearch = 'WHOLE WORD';
        } else {
            wholeWordSearch = 'PARTIAL MATCH';
        }
        if (findAnything == false) {
            // searchPreview.innerHTML = '<code>Sorry, <i><b>"' + wordsearchValue + '"</b></i><br>Was Not Found!<br><br>Your Search Parameters Were:<br>[<b>' + caseSensitiveSearch + phraseSearch + wholeWordSearch + '</b>]</code>';
            searchPreviewFixed.innerHTML = '<code>Sorry, <i><b>"' + wordsearchValue + '"</b></i><br>Was Not Found!<br><br>Your Search Parameters Were:<br>[<b>' + caseSensitiveSearch + phraseSearch + wholeWordSearch + '</b>]</code>';
        }
        searchPreviewFixed.append(searchFragment);
        //To Clear "searchPreviewFixed" Window after given time
        if(!keepsearchopen.checked){runFuncAfterSetTimeInactivityInElm(searchPreviewWindowFixed, 60000, clearSearchWindow)}
    }
    searchJSON();
    hideRefNav('show');
    hideRefNav('show', searchPreviewWindowFixed);
    searchsettings.classList.add('active_button');

    if (booksLength>1 && !showreturnedverses.checked) {
        hideAllVerseInSearch()
    } else {appendResultCountToHeader()}
}


function hideAllVerseInSearch() {
    appendResultCountToHeader(true)
}
function appendResultCountToHeader(hideResult=false) {
    let chpHeadingInFixedSearch = document.querySelectorAll('#searchPreviewFixed .chptheading');
    let totalVerseReturned = 0;
    chpHeadingInFixedSearch.forEach(h2 => {
        let verseUnderBook = h2.nextElementSibling;
        /* ************************** */
        /* dhid -- descendants hidden */
        /* ************************** */
        if (hideResult) {
            if (verseUnderBook.classList.contains('displaynone')) {
                h2.classList.remove('dhid');
            } else {
                h2.classList.add('dhid');
            }
        }
        let verseCount = 0;
        while (verseUnderBook && verseUnderBook.classList.contains('verse')) {
            if (hideResult) {
                verseUnderBook.classList.toggle('displaynone');
            }
            verseCount++;
            totalVerseReturned++;
            verseUnderBook = verseUnderBook.nextElementSibling;
        }
        h2.innerText = h2.innerText + ' - ' + verseCount;
    });
    totalfound.innerHTML = "Found in <b>" + totalVerseReturned + "</b> verses in the <b>" + bversionName + "</b>" ;
}
searchPreviewFixed.addEventListener('click', showVersesUnderH2)

function showVersesUnderH2(e) {
    let h2 = e.target;
    if (h2.classList.contains('chptheading')) {
        let verseUnderBook = h2.nextElementSibling;
        if (verseUnderBook.classList.contains('displaynone')) {
            h2.classList.remove('dhid');
        } else {
            h2.classList.add('dhid');
        }
        while (verseUnderBook && verseUnderBook.classList.contains('verse')) {
            verseUnderBook.classList.toggle('displaynone');
            verseUnderBook = verseUnderBook.nextElementSibling;
        }
        h2.scrollIntoView();
        searchparametertitlebar.scrollIntoView(); //This is to compensate for the shifting out of view of the search parmeter section
    }
}
/* ******************************************** */
/* On Checking and Unchecking "Show all verses" */
/* ******************************************** */
showreturnedverses.addEventListener('change', function () {
    let versesInFixed = searchPreviewFixed.querySelectorAll('.verse');
    let chpHeadingInFixedSearch = document.querySelectorAll('#searchPreviewFixed .chptheading');
    if (this.checked) {
        chpHeadingInFixedSearch.forEach(h2 => {
            h2.classList.remove('dhid');
        })
        versesInFixed.forEach(elm => {
            elm.classList.remove('displaynone')
        });
        setItemInLocalStorage('showVersesInSearch', 'yes')
    }
    else {
        chpHeadingInFixedSearch.forEach(h2 => {
            h2.classList.add('dhid');
        })
        versesInFixed.forEach(elm => {
            elm.classList.add('displaynone')
        });
        setItemInLocalStorage('showVersesInSearch', 'no')
    }
});

function minimize(el) {
    if (el.style.height != '0px') {
        el.style.height = '0';
        el.classList.add("displaynone")
    } else {
        el.style.height = 'auto';
        el.classList.remove("displaynone")
    }
}

//Books to search in.
function listOfBooksToSearchIn(bkGrp){
    function findBooksFromA2B(A,B){
        let booksToSearchIn=[];
        let bksArray = bible.Data.allBooks;
        let b = bksArray.indexOf(A);
        booksToSearchIn.push(bksArray[b]);
        if(B){
            for(c=b+1; c<bksArray.length; c++){
                if(bksArray[c]!=B){
                    booksToSearchIn.push(bksArray[c]);
                } else {
                    booksToSearchIn.push(bksArray[c]);
                    return booksToSearchIn
                }
            }
        } else {return booksToSearchIn}
    }
    let generalBibleBooksGroups = {
        'allbks' : bible.Data.allBooks,
        'ot' : bible.Data.otBooks,
        'nt' : bible.Data.ntBooks,
        'pentateuch' : findBooksFromA2B('Genesis','Deuteronomy'),
        'history' : findBooksFromA2B('Joshua','Esther'),
        'wisdom' : findBooksFromA2B('Job','Song of Solomon'),
        'majorProphets' : findBooksFromA2B('Isaiah','Daniel'),
        'minorProphets' : findBooksFromA2B('Hosea','Malachi'),
        'nt_narrative' : findBooksFromA2B('Matthew','Acts'),
        'pauline' : findBooksFromA2B('Romans','Hebrews'),
        'generalEpistles' : findBooksFromA2B('James','Jude'),
        'revelation' : findBooksFromA2B('Revelation'),
        'currentbk' : findBooksFromA2B(`${currentBookName}`)
    }
    if (typeof bkGrp === 'string' || bkGrp instanceof String){
        booksToSearchIn = generalBibleBooksGroups[bkGrp];
    } else if (Array.isArray(bkGrp)) {booksToSearchIn = bkGrp}
    return booksToSearchIn
}

/* CLEAR THE SEARCH WINDOW IF IT HAS BEEN INACTIVE AFTER 1min */
function clearSearchWindow(){
    if(!keepsearchopen.checked){
        searchPreviewFixed.innerHTML='';
        hideRefNav('hide', searchPreviewWindowFixed)
        searchsettings.classList.remove('active_button')
        totalfound.innerHTML='Search window was cleared';
    }
}

function searchForHighlightedText(e){
    if((e.ctrlKey && e.shiftKey && e.key.toLowerCase()=='f') && window.getSelection()){
        const srchSel=window.getSelection().toString();
        wordsearch.value = srchSel;
        wordsearch_fixed.value = srchSel;
        runWordSearch()        
    }
}
document.addEventListener("keydown",searchForHighlightedText)
keepsearchopen.addEventListener('change', function (e) {
    if (e.target.checked) {
        localStorage.setItem('keepsearchopen',true)
    } else {
        localStorage.setItem('keepsearchopen',false)
    }
})