/* FUNCTION FOR SEARCH FOR SCRIPTURES BY WORDS AND PHRASES */
let booksToSearchIn=[];
// if(aowthbsf=localStorage.getItem('searchHistoryArr')){searchHistoryArr = aowthbsf.split(',')}// it is saved on windows close by the electron main process
/* // Inline Search Words Modifiers
startsWith=God*; endsWith=*God; exactMatch=*God*; anyOfTheWords=[God Lord Heaven] */

function setRegexForPartsOfSearchString(string, matchWholeWords = whole_word.checked) {
    // Remove any spaces attached to '[' and ']'
    let originalString = string;
    string = string.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']').replace(/[,.]/g, '');
    
    // Replace spaces inside square brackets but not inside quotes
    string = string.replace(/\[([^\[\]]+)\]/g, function(match) {
        // ensure opening and closing quotes are appropriately spaced from surrounding words
        let matchIndex = 0;
        match = match.replace(/(\w*\.{0,1})["'](.{0,1}\w*)/g, function(m, g1, g2, offset) {
            matchIndex++;
            // For opening quotes (odd matchIndex), ensure space after the quote
            if(matchIndex % 2 === 1){return g1.replace(/\s*$/, '') + ' "' + g2.trim();}// For closing quotes (even matchIndex), ensure space before the quote
            else {return g1.trim() + '" ' + g2.replace(/^\s*/, '');}
        })

        // Inside each bracket, replace spaces outside quotes
        match = match.replace(/\[/g, '(?:').replace(/\]/g, ')');//Change opening and closing square brackets to non-capturing groups
        return match.replace(/(["']).*?\1|(\s+)/g, function(innerMatch, quoted, space) {
            return quoted ? innerMatch : (space ? '|' : innerMatch);// If it's inside quotes, return as is
        });
    });
    // string = string.replace(/\[/g, '(?:').replace(/\]/g, ')');//Change opening and closing square brackets to non-capturing groups
    
    // Handle quoted phrases, ensuring words are separated by non-alphabetic characters
    string = string.replace(/"([^"]+)"/g, function(match, phrase) {
        let words = phrase.split(/\s+/);
        let wordRegexParts = words.map(word => {
            // If matching whole words, use \b to enforce word boundaries
            return matchWholeWords ? `\\b${word.replace(/\*/g,'')}\\b` : word.replace(/\*([^\*\s]+)\*/g,'\\b$1\\b').replace(/\b([^\*\s]+)\*/g,'\\b$1\\w*').replace(/\*([^\*\s]+)/g,'\\w*$1\\b');
            // return matchWholeWords ? `\\b${word.replace(/\*/g,'')}\\b` : word;
        });
        // Join words with the non-alphabetic character pattern
        // return wordRegexParts.join('(?:[^a-zA-Z]+)').replace(/["']/g, ''); // Remove unmatched `"`
        return wordRegexParts.join('(?:<^a-zA-Z>+)').replace(/["']/g, ''); // Remove unmatched `"`
    })
    
    // Change [w1 w2...] to a non-capturing group (?:w1|w2...)
    let regexify = string.replace(/\[[^\]]*\]/g, function(match) {
        return match
            .replace(/\[|\]/g, '') // Remove [ and ]
            // .replace(/(?<!\\w)\*([^*\s+]+)/g, '$1\\b') // Convert * to \b (word boundaries)
            // .replace(/([^*\s+]+)(?<!\\w)\*/g, '\\b$1') // Same for trailing *
            .replace(/\s+/g, '|')// Replace spaces with |
            .replace(/</g, '[').replace(/>/g, ']')
        }).replace(/(.+)/g, '(?:$1)') // Non-capturing group

        regexify = regexify.replace(/\*([\p{L}-]+)\*/ug, '\\b$1\\b')// *word* => \bword\b
        .replace(/\b([\p{L}-]+)\*/ug, '\\b$1')// *word => word\b
        .replace(/\*([\p{L}-]+)\b/ug, '$1\\b')// word* => \bword
        .replace(/\b([GHgh]\d+)\b/g,'\\b$1\\b') // Strong's number must be exact match
        .replace(/\\\\bb/g, '\\b')
        .replace(/\\b\\b/g, '\\b')

        // Ensure all square brackets are removed
        regexify = regexify.replace(/\[|\]/g, '')
        // .replace(/(?<!\\w)\*([^\*\s]+)(?<!\\w)\*/g,'\\b$1\\b').replace(/\b([^\*\s]+)(?<!\\w)\*/g,'\\b$1\\w*').replace(/(?<!\\w)\*([^\*\s]+)/g,'\\w*$1\\b');
        
        // regexify = regexify
        //     .replace(/(\[*)(?<!\\w)\*([^*\]]+)(\]*)/g, '$1$2\\b')
        //     .replace(/(\[*)([^*]+)(?<!\\w)\*/g, '$1\\b$2')
            .replace(/</g, '[').replace(/>/g, ']')
        //     .replace(/(\W)*\|\)/g, '$1)')

        // regexify = regexify.replace(/\b([GHgh]\d+)\b/g,'\\b$1\\b') // Strong's number must be exact match

    let unregexify = originalString
        .replace(/\\b/g, '*')
        .replace(/[(\(\?\:)(\))]*/g, '')
        .replace(/\[|\]/g, '')
        .replace(/\|/g, ' ');

    let removeSpecialCharacters = originalString.replace(/[-]/ug, ' ').replace(/\s+/ug, ' ').replace(/[^\p{L}^(\s|\d+)]/ug, '');
        
    // Return the results
    return { removeSpecialCharacters, regexify, unregexify };
}

// ['[*G371 *G372 *G373]','Jesus Nazareth', 'Holy God Heaven']
let targetSearchInputElm, searchHistory_enterKeyFunc_COPY, fillInputWithSelectedSearchWord_COPY;
[wordsearch,wordsearch_fixed,scriptureCompareWindow].forEach(inpt => {
    inpt.addEventListener('contextmenu',attachArrayOfSearchWords);
    inpt.addEventListener('keydown',attachArrayOfSearchWords);
    inpt.addEventListener('input',attachArrayOfSearchWords);
    // inpt.addEventListener('blur',attachArrayOfSearchWords);
});
function attachArrayOfSearchWords(e) {
    const selectedInputElement = e.target;
    let eKey=e.key;
    let eKeyTab=null;
    if(eKey=='Enter'){return}

    if(eKey=='Tab' && selectedInputElement.parentNode.querySelector('#searchedWordsContainer')) {
        e.preventDefault();
        eKeyTab=true;
        if(e.shiftKey){eKey='ArrowUp'}
        else {eKey='ArrowDown'}
    }
    
    if(searchHistoryArr.length==0 || !selectedInputElement.matches('#wordsearch,#wordsearch_fixed,#scriptureCompareWindow .scriptureCompare_columns .verses_input')){return}

    var parentElement = selectedInputElement.parentNode;// Get the parent element of the clicked button

    function append_recentSearchedWords(arr=searchHistoryArr) {
        // If #searchedWordsContainer exists, remove it before creating another one
        remove_searchedWordsContainer();
        // Create a new element
        targetSearchInputElm = selectedInputElement;
        selectedInputElement.addEventListener('blur',attachArrayOfSearchWords);
        var newElement = document.createElement('div');
        newElement.id = 'searchedWordsContainer';
        newElement.setAttribute('tabindex','0');
        searchedWordsContainer = newElement;
        arr.forEach(sw => {
            //If compare section input, temporarily append id to it
            if(selectedInputElement.id==''){
                const compHistorySearchInput=document.getElementById('compHistorySearchInput');
                compHistorySearchInput?compHistorySearchInput.id='':null;
                selectedInputElement.id='compHistorySearchInput';
            };
            const sID=selectedInputElement.id;
            newElement.innerHTML = `<span class="searchwordfromhistory" onclick="fillInputWithSelectedSearchWord(${sID},this)" tabindex="0">${sw}</span>${newElement.innerHTML}`
        });
        // Calculate the position of the clicked element relative to its parent
        var topPosition = selectedInputElement.offsetTop + selectedInputElement.offsetHeight;
        // Set the top position of the new element
        newElement.style.top = topPosition + 'px';
        // newElement.style.left = selectedInputElement.offsetLeft + 'px';
        newElement.style.width = parentElement.offsetWidth + 'px';
        newElement.style.maxHeight = (selectedInputElement.offsetHeight * 6) + 'px';
        // Append the new element to the parent element
        parentElement.appendChild(newElement);
    }
    let currentElement = document.querySelector('#searchedWordsContainer span.active_button:not(.displaynone)');
    if (api.isElectron) {
        api.getSavedPageContent().then(result => {
            searchHistoryArr = result[2];
            searchHistoryArr_ = searchHistoryArr;
            runAfterPromiseHasResolved();
        }).catch(error => {
            runAfterPromiseHasResolved();
            console.error('Error retrieving saved page content:', error);
        });
    }
    function runAfterPromiseHasResolved() {
        
        if (e.type=='contextmenu'||(e.type=='keydown' && !e.ctrlKey && (eKeyTab || !e.shiftKey))) {
            if (eKey=='ArrowDown'||e.type=='contextmenu'){
                //If the input elements parent does not have the searchedWordsContainer in it
                if(!parentElement.querySelector('#searchedWordsContainer')){
                    // The first time the arrowDown is pressed, indicating that the user wants the list to appear (if it is not already present)
                    append_recentSearchedWords();
                    setActiveCurrentSpan('ArrowDown');
                    if (e.type=='contextmenu'){return};//To show searchHistory when input is rightClicked
                }
                else if(currentElement){
                    if(cn=currentElement.nextElementSibling){
                        setActiveCurrentSpan(null,cn)
                    } else {
                        currentElement.classList.remove('active_button');
                        // If there is no nextSibling, restart at the beginning if last element
                        setActiveCurrentSpan(eKey)
                    }
                } else {
                    // If there is no current element, make the first span current element
                    setActiveCurrentSpan(eKey)
                }
            }
            else if (eKey=='ArrowUp'){
                //If the input elements parent does not have the searchedWordsContainer in it
                if(!parentElement.querySelector('#searchedWordsContainer')){
                    // The first time the arrowDown is pressed, indicating that the user wants the list to appear (if it is not already present)
                    append_recentSearchedWords();
                    setActiveCurrentSpan(eKey)
                }
                else if(currentElement){
                    if(cn=currentElement.previousElementSibling){
                        setActiveCurrentSpan(null,cn)
                    } else {
                        // If there is no previousElementSibling, go to the end
                        currentElement.classList.remove('active_button');
                        setActiveCurrentSpan(eKey)
                    }
                } else {
                    // If there is no current element, make the last span current element
                    setActiveCurrentSpan(eKey)
                }
            }
            function setActiveCurrentSpan(up_down,cn) {
                if(up_down=='ArrowDown'){
                    currentElement = document.querySelector('#searchedWordsContainer span');//get first span element
                }
                else if(up_down=='ArrowUp'){
                    let allChildSpans = document.querySelectorAll('#searchedWordsContainer span');
                    currentElement = allChildSpans[allChildSpans.length-1];//get last span element
                } else {
                    currentElement?currentElement.classList.remove('active_button'):null;//remove active_button class from prev currentElement before setting new one
                    currentElement = cn;
                }
                currentElement.classList.add('active_button');
                setTimeout(() => {currentElement.scrollIntoView({behavior:"smooth",block:"nearest"})}, 1);
                if ([wordsearch,wordsearch_fixed].includes(selectedInputElement)) {
                    // Make wordsearch & wordsearch_fixed equal
                    [wordsearch,wordsearch_fixed].forEach(wI=>{
                        wI.value = currentElement.innerText;
                        const sbtn = wI.parentElement.querySelector('[disabled]');
                        sbtn ? sbtn.disabled = false : null;
                    })
                } else{
                    selectedInputElement.value = currentElement.innerText;
                }
            }
        }
        // Check if the key is an alphabet character
        else if (e.type=='input'){
            // Find span elements that fully or partially contain the current selectedInputElement.value
            let currentSearchInputValue = selectedInputElement.value;
            let arr = filterStringsContainingSubstring(searchHistoryArr, currentSearchInputValue);
            // arr = arr.length>0?arr:searchHistoryArr;//if there is no match, use the full list
            // append_recentSearchedWords(arr);//if there is no match, use the full list
            if(arr.length==0){
                //if there is no match, remove_searchedWordsContainer 
                remove_searchedWordsContainer();
            } else {append_recentSearchedWords(arr)}
        }
        else if (e.type=='blur'){
            // setTimeout(() => {
            if(!document.activeElement.closest('#searchedWordsContainer')){
                remove_searchedWordsContainer();
            } else {
                selectedInputElement.removeEventListener('blur',attachArrayOfSearchWords);
            }
            // }, 10);//delayed so that word can be selected from list of search words before it is removed
        }
    }
}
function remove_searchedWordsContainer() {       
    if (typeof searchedWordsContainer != 'undefined' && searchedWordsContainer!=null) {
        // searchedWordsContainer.removeEventListener("keydown", searchHistory_enterKeyFunc_COPY);
        searchedWordsContainer.remove();
        searchedWordsContainer=null;
    }
}
function fillInputWithSelectedSearchWord(inputElm,dis) {
    inputElm.value = dis.innerText;

    if ([wordsearch,wordsearch_fixed].includes(inputElm)) {
        wordsearch.value = dis.innerText
        wordsearch_fixed.value = dis.innerText
    }
    else {
        inputElm.value = dis.innerText;
    }
    const c = searchedWordsContainer.querySelector('span.active_button');
    c ? c.classList.remove('active_button') : null;
    dis.classList.add('active_button');
    inputElm.focus();
    if ([wordsearch,wordsearch_fixed].includes(inputElm)) {
        [wordsearch,wordsearch_fixed].forEach(ws=>{bubbleInputFillEvent(ws);});remove_searchedWordsContainer();
    } else {bubbleInputFillEvent(inputElm);}
    remove_searchedWordsContainer();
}
/* Below I sync the two places (wordsearch & wordsearch_fixed) where search can be run from */
['wordsearch', 'wordsearch_fixed'].forEach(wsId=>{
    let forws=document.querySelector('#for' + wsId); 
    let ws=document.querySelector('#' + wsId);
    let disableornot;

    /* TO DISABLE ENABLE WORD-SEARCH BUTTON */
    ws.addEventListener('input', function(){enableSearchButtons();});
    /* RUN RUNWORDSEARCH() FUNCTION ON PRESSING ENTER KEY */
    ws.addEventListener("keypress", async function (e) {
        if (e.key === "Enter") {
            await runWordSearch();
            enableSearchButtons();
            e.preventDefault();
        }
    });
    function enableSearchButtons() {
        if (ws.value.trim() != '') { disableornot = false; }
        else { disableornot = true; }
        forws.disabled = disableornot;
        if (ws == wordsearch) {
            wordsearch_fixed.value = ws.value;
            forwordsearch_fixed.disabled = disableornot;
        } else {
            wordsearch.value = ws.value;
            forwordsearch.disabled = disableornot;
        }
    }
})

document.addEventListener('keydown', searchInputsValueChange)
async function searchInputsValueChange(e,strongsNum){
    if (!strongsNum || ![0,2].includes(e.button)) {return}//has to be left or right click and not middle mouse button click
    /* ********** ** ************** ****** */
    /* RightClick or CTRL+LeftClick ****** */
    /* ********** ** ************** ****** */
    if(e.button==2 || (e.ctrlKey && e.button==0)){//add strongs number to already existing search value
        let snRgx = new RegExp(strongsNum.replace(/([\[\]])/g,'\\$1'),'gi');
        let wsv = wordsearch.value.trim();
        wsv.length>0?wsv=`${wsv} `:wsv;// add space after if it has a word in it
        if(!wsv.match(snRgx)){
            wordsearch.value =`${wsv}${strongsNum}`;
            wordsearch_fixed.value =`${wsv}${strongsNum}`;
            bubbleInputFillEvent();
        }
    }
    /* ********* ************************* */
    /* LeftClick ************************* */
    /* ********* ************************* */
    else if(!e.ctrlKey && e.button==0) {
        wordsearch.value=strongsNum;
        wordsearch_fixed.value=strongsNum;
        bubbleInputFillEvent();//To trigger the input eventlistner (without this, will only work if input is manually changed)
        //for search results to be visually appended before the search is carried out 
        setTimeout(() => {forwordsearch.click();},10);// runWordSearch()
    }
    wordsearch.select();
    /* *********************************** */
    /* RunWordSearch() if LeftClick At All */
    /* *********************************** */
    // if(e.button==0){
    //     setTimeout(() => {//for search results to be visually appended before the search is carried out 
    //         //To trigger the input eventlistner (without this, will only work if input is manually changed)
    //         bubbleInputFillEvent();
    //         forwordsearch.click();// runWordSearch()
    //     }, 10);
    // }
}

function bubbleInputFillEvent(inputElm) {    
    //To trigger the input eventlistner (without this, will only work if input is manually changed)
    var inputEvent = new Event("input", {bubbles: true,cancelable: true,});
    if (!inputElm||[wordsearch,wordsearch_fixed].includes(inputElm)) {
        [wordsearch,wordsearch_fixed].forEach(ws=>{ws.dispatchEvent(inputEvent);});
    }
    else {inputElm.dispatchEvent(inputEvent);}
    inputElm?inputElm.focus():null;
}

searchPreviewFixed.addEventListener("mouseup", codeElmRefClick);
let verseCount;
function returnStrippedTextOfVerse(vTxt) {
    let madePlain_without_strongs,arrayOfStrongs=[];
    if(Array.isArray(vTxt)){
        vTxt = vTxt.filter(txt=>txt !== undefined);//remove undefined
        arrayOfStrongs = vTxt.map(txt=>txt[1]);
        let arrayOfWordsWithoutStrongs = vTxt.map(txt=>txt[0]);
        madePlain_without_strongs = arrayOfWordsWithoutStrongs.filter(elm=>{if(!/^[,.?\-]$/.test(elm)){return elm}}).join(' ');
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
/* 
SOME POSSIBLE SEARCH PARAMETERS
Search excluding Strongs Number
    Search for verses with the exact phrase
Search may include Strongs Number
    Search for verses with any of the words
    Search for verses that have all the words in any order
*/
let general_eKeyDown=null;
let sourceOfranges, totalOccurencesInSearch = 0, runWordSearchCount = 0;
async function runWordSearch(compareValue,compareDiv) {
    let findAnything = false;
    /* ******************* */
    let doStrongAnalysis = false;
    let do_StrongAnalysisOnly = ((general_eKeyDown && general_eKeyDown.shiftKey) || strongsAnalysisOnly.checked) ? true : false;
    
    if (typeof searchedWordsContainer != 'undefined' && searchedWordsContainer!=null) {
        // searchedWordsContainer.removeEventListener("keydown", searchHistory_enterKeyFunc_COPY);
        searchedWordsContainer.remove();
        searchedWordsContainer=null;
    }
    /* ******************* */
    verseCount=0,totalOccurencesInSearch = 0;
    let word2find, wordsearchValue, value2searchfor, where2appendSearchresult, compDivID, styleID, totalnumOfoccurencesInVerse=0;
    sourceOfranges = "biblebooksgroup_1";
    if(compareValue){
        value2searchfor = compareValue;
        where2appendSearchresult = compareDiv;
        if (!compareDiv.classList.contains('compare_search')) {
            compareDiv.classList.add('compare_search');
            //give is a unique id
            for (let i = 0; i < 9; i++) {
                compDivID = 'compare_search_' + i;
                if (!document.querySelector('#' + compDivID)) {
                    compareDiv.id = compDivID;
                    styleID = compDivID + '_style';
                    break
                }
            }
        } else {
            compDivID = compareDiv.id;
            styleID = compDivID + '_style';
        }
        cssForCMenuInCompareSection = `#scriptureCompareWindow #context_menu`;
        cssOfSearchWin = `#${compDivID}.compare_search`;
        sourceOfranges = "biblebooksgroup_3";
    } else {
        value2searchfor = wordsearch.value;
        where2appendSearchresult = searchPreviewFixed;
        styleID = 'search_returned_words';
        cssForCMenuInCompareSection=null;
        cssOfSearchWin = "#searchPreviewFixed";
    }
    
    let wholeORpartial = '*';
    let versionHasStrongsNums=bible.Data.supportedVersions[bversionName].withStrongsNums
    let wholeWordChecked=whole_word.checked;
    if(wholeWordChecked){wholeORpartial = '~';}
    let anyWordChecked=search_anyWord.checked;
    let search_phraseChecked = search_phrase.checked;
    let case_sensitiveChecked = case_sensitive.checked;
    let strongsAnalysisObj={};
    let verseProximity = Number(nearbyVerses.value);// Should only be able to affect search if search value is more than one word
    // remove repeated words
    const oldv = value2searchfor;
    value2searchfor = value2searchfor.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');
    if(/[GHgh]\d+/.test(value2searchfor)){//if it has strongs word
        if (case_sensitiveChecked) {
            value2searchfor = value2searchfor.replace(/\b([GHgh]\d+)\b(?=.*\b\1\b)/g, '').replace(/\s+/g,' ');
        } else {
            value2searchfor = value2searchfor.replace(/\b([GHgh]\d+)\b(?=.*\b\1\b)/gi, '').replace(/\s+/g,' ');
        }
    } else if(!search_phraseChecked){//if not search for phrase
        if (case_sensitiveChecked) {
            value2searchfor = value2searchfor.replace(/\b(\w+)\b(?=.*\b\1\b)/g, '').replace(/\s+/g,' ');
        } else {
            value2searchfor = value2searchfor.replace(/\b(\w+)\b(?=.*\b\1\b)/gi, '').replace(/\s+/g,' ');
        }
    }
    value2searchfor = value2searchfor.trim();
    // Save All SearchedWords in array
    if(searchHistoryArr.includes(value2searchfor)){
        searchHistoryArr = searchHistoryArr.filter(function(item) {return item !== value2searchfor;})
    }
    if(!searchHistoryArr.includes(value2searchfor)){
        if(searchHistoryArr.length==400){
            // remove oldest saved search item when array is up to 100
            searchHistoryArr.shift()
        }
        searchHistoryArr.push(value2searchfor);
        searchHistoryArr_=searchHistoryArr;
        if (api.isElectron) {
            //IMPORTANT: Update the searchHistory in Electron App to sync accross multiple open sessions
            api.updateSavedPageContent();
        }
        // localStorage.setItem('searchHistoryArr',searchHistoryArr);
        if(searchedWordsContainer=document.querySelector('#searchedWordsContainer')){
            const c = searchedWordsContainer.querySelector('span.active_button');
            c ? c.classList.remove('active_button') : null;
            searchedWordsContainer.innerHTML = `<span class="active_button" onclick="onclick="fillInputWithSelectedSearchWord(targetSearchInputElm,this)" tabindex="0">${value2searchfor}</span>${searchedWordsContainer.innerHTML}`
        }
    }
    if(where2appendSearchresult==searchPreviewFixed){
        wordsearch.value=value2searchfor;
        wordsearch_fixed.value=value2searchfor;
    }
    else{
        let compDivInput = compareDiv.closest('.scriptureCompare_columns').querySelector('.verses_input');
        compDivValue = compDivInput.value;
        compDivInput.value = compDivValue.replace(oldv,value2searchfor);
    }

    wordsearchValue =value2searchfor;
    if (wordsearchValue.trim() == '' || wordsearchValue.trim().length < 2) {return}
    biblebooksgroup_inputndropdown.classList.add('displaynone');
    biblebooksgroup_myDropdown_2.classList.add('displaynone');
    biblebooksgroup_myDropdown_3.classList.add('displaynone');
    biblebooksgroup_fixed_myDropdown.classList.add('displaynone');
    
    runWordSearchCount++;
    wordsearchValue=wordsearchValue.replace(/\s+/g, " ");
    wordsearchValue=wordsearchValue.replace(/’/g, "'");
    wordsearchValue=wordsearchValue.replace(/”/g, '"');
    value2searchfor=wordsearchValue;//before case is changed
    //If Case Sensitive Search
    word2find = value2searchfor;
    // const regexifiedWord2find = setRegexForPartsOfSearchString(word2find);
    if(case_sensitiveChecked) {
        // value2searchfor = new RegExp(regexifiedWord2find.regexify);
    } else {
        value2searchfor = value2searchfor.toLowerCase();
    }
    // let searchResultArr = [];
    let searchFragment = new DocumentFragment()
    let allResultRefs_Obj = {};
    let booksLength;

    let searchResultStats_Details = document.createElement('DETAILS');
    searchResultStats_Details.classList.add('searchResultStats_Details');
    searchResultStats_Details.classList.add('verse');
    searchResultStats_Details.classList.add('resultsummary');
    searchResultStats_Details.innerHTML = `<summary style="sont-style:normal;">Search Result Refs & Words</summary>`;

    await searchJSON();
    
    if(!compareValue){
        hideRefNav('show', searchPreviewWindowFixed);// Show #searchPreviewWindowFixed
        searchsettings.classList.add('active_button');
    } else {where2appendSearchresult.addEventListener('click', showVersesUnderH2)}

    let allResultRefs='';
    let allResultRefsPerBOOK='';
    let allchptheading = where2appendSearchresult.querySelectorAll('.chptheading')
    let refIndxInResult=-1;
    let numOfVersesPerBook=0;
    
    /* All References WITH-OUT Their Actual Verse Text */ 
    for(book in allResultRefs_Obj){
        refIndxInResult++;
        allResultRefs+=`${bible.Data.books.find(subarray => subarray.includes(book.toUpperCase()))[1].toLocaleLowerCase().replace(/[a-z]/, match => match.toUpperCase())} `;
        allResultRefsPerBOOK+=`${bible.Data.books.find(subarray => subarray.includes(book.toUpperCase()))[1].toLocaleLowerCase().replace(/[a-z]/, match => match.toUpperCase())} `;
        for(chpt in allResultRefs_Obj[book]){
            const versesInChpt = allResultRefs_Obj[book][chpt];
            numOfVersesPerBook += versesInChpt.split(',').length;//Get number of verses by spliting with ','
            allResultRefs+=chpt + ':' + versesInChpt + '; ';
            allResultRefsPerBOOK+=chpt + ':' + versesInChpt + '; ';
        }
        //All Refs per book
        let allResultRefs_Details = document.createElement('DETAILS');
        allResultRefs_Details.setAttribute('vrscount',numOfVersesPerBook)
        allResultRefs_Details.classList.add('verse');
        allResultRefs_Details.innerHTML = `<summary>All Refs In Book of ${book}</summary>${generateRefsInNote(allResultRefsPerBOOK,true)}`;

        //Add the result after the chapter heading of the book
        allchptheading[refIndxInResult].outerHTML = allchptheading[refIndxInResult].outerHTML + allResultRefs_Details.outerHTML;
        allResultRefsPerBOOK='';
        numOfVersesPerBook=0;
    }
    allResultRefs = allResultRefs.replace(/;+\s*$/, '');//remove ending semicolon

    where2appendSearchresult.prepend(searchResultStats_Details);

    if (refIndxInResult>0) {//If more than one book then have refs of all search results
        let allResultRefs_Details = document.createElement('DETAILS');
        allResultRefs_Details.classList.add('verse');
        allResultRefs_Details.classList.add('resultsummary');
        allResultRefs_Details.innerHTML = `<summary>All References In Search Result</summary>${generateRefsInNote(allResultRefs,true)}`;
        searchResultStats_Details.prepend(allResultRefs_Details);
        // where2appendSearchresult.prepend(allResultRefs_Details);
    }

    if (booksLength>1 && !showreturnedverses.checked) {
        if(compareValue){appendResultCountToHeader(true,compDivID,value2searchfor)}
        else {appendResultCountToHeader(true,undefined,value2searchfor)}
    } else {
        if(compareValue){appendResultCountToHeader(false,compDivID,value2searchfor);}
        else {appendResultCountToHeader(false,undefined,value2searchfor)}
    }
    
    transliteratedWords_Array.forEach(storedStrnum=>{showTransliteration(storedStrnum,where2appendSearchresult)});
   
    async function appendVerseToSearchResultWindow(currentBK = null, prevBook = null, bkid, chNumInBk, vNumInChpt, vText, appendHere=searchFragment,bookName,wordORphrase2find,specifiedChptsToSearch) {
        if ((prevBook != currentBK) || (prevBook == null)) {
            chapterHeading = document.createElement('h2');
            chapterHeading.classList.add('chptheading');
            chapterHeading.tabIndex = 0;
            const divider = specifiedChptsToSearch.length ? ' ::' : '';
            chapterHeading.innerText = `${bookName}${divider}${specifiedChptsToSearch}`;
            appendHere.appendChild(chapterHeading)
            // Button simulating eventlistener added in appendResultCountToHeader()
            prevBook = currentBK;
            allResultRefs_Obj[currentBK]={};
        }
        /* Instead of going the route below with 'allResultRefs_Obj' I could generate a string of all the references at this point */
        // let verseID = '_' + bkid + '.' + chNumInBk + '.' + vNumInChpt;
        // searchResultArr.push(verseID);
        
        /* Search Result References Only */
        const srchChpt = Number(chNumInBk)+1;
        if(allResultRefs_Obj[currentBK][srchChpt]){allResultRefs_Obj[currentBK][srchChpt]+=`,${vNumInChpt}`;}
        else {allResultRefs_Obj[currentBK][srchChpt] = `${vNumInChpt}`;}
        allResultRefs_Obj[currentBK][Number(chNumInBk)+1]

        if (do_StrongAnalysisOnly) {return}

        /* Parse the JSON string to HTML verse */
        parseSingleVerse(bkid, Number(chNumInBk)+1, vNumInChpt, vText, appendHere,bookName,null, true);

        /* FOR CROSS-REFS & NOTES IN SEARCH WINDOW */
        let allVsInFrag = appendHere.querySelectorAll('.verse');
        let verseInFrag = allVsInFrag[allVsInFrag.length-1];//the last verse in the array
        verseInFrag.innerHTML = '<button class="closebtn cmenu_closebtn" onclick="removeCompareVerse(this)"></button>' + verseInFrag.innerHTML;
        const _cd_ = crfnnote_DIV(verseInFrag);
        verseInFrag.append(showORdisplaynoneXrefSections(_cd_));
        // Ensure wordORphrase2find is an array and iterate over each item in it
        if (!Array.isArray(wordORphrase2find)) {wordORphrase2find = [wordORphrase2find];}
        // Call the same function for each text in the array
        wordORphrase2find.forEach(text => {
            // wrapPhrase(setRegexForPartsOfSearchString(text).removeSpecialCharacters);
            // for words that are words surrounded with '[' & ']'
            text = text.trim();
            const textArr = text.startsWith('[') && text.endsWith(']') ? text.slice(1,-1).split(/\s+/) : [text];
            textArr.forEach(txt=>{w(setRegexForPartsOfSearchString(txt).removeSpecialCharacters)});
            function w(text){wrapPhrase(text);}
        });
        // To indicate the word hits in versions without strongs numbers
        function wrapPhrase(string2Wrap){
            const arrayOfDirectChildNodes = [];
            for (let i = 0; i < verseInFrag.childNodes.length; i++) {
                const vc = verseInFrag.childNodes[i]
                if (vc.nodeType === Node.TEXT_NODE) {
                    arrayOfDirectChildNodes.push(vc)
                } else if(versionHasStrongsNums && bversionName=='KJV' && vc.nodeName==='SPAN' && vc.matches('span:not([strnum])')){
                    arrayOfDirectChildNodes.push(vc)
                }
            }
            while (arrayOfDirectChildNodes.length > 0) {
                const currentNode = arrayOfDirectChildNodes.pop();
                // Find the index of the search text within the current node
                let index, regex, iorI='i';
                if (case_sensitiveChecked) {iorI=''}
                if(wholeWordChecked) {
                    regex = new RegExp(`\\b${string2Wrap}\\b`, iorI);
                } else {
                    regex = new RegExp(string2Wrap, iorI);
                }
                index = currentNode.textContent.search(regex);
                if (index > -1){
                    if (currentNode.nodeType === Node.TEXT_NODE) {
                        // Create a new range that starts at the index of the search text
                        // and has the same length as the search text
                        const range = document.createRange();
                        range.setStart(currentNode, index);
                        range.setEnd(currentNode, index + string2Wrap.length);
                        const strongElement = document.createElement('i');// Create a new `strong` element
                        strongElement.setAttribute("translation",string2Wrap);
                        searchStyles2(strongElement)
                        range.surroundContents(strongElement);// Wrap the range in the `strong` element
                    } else {
                        currentNode.setAttribute("translation",string2Wrap);
                        currentNode.style.fontWeight='bold';
                        searchStyles2(currentNode)
                    }
                    function searchStyles2(node) {
                        node.style.color = 'var(--searchedword-hlt2)';
                        node.style.boxShadow = 'inset 0 -1.5px var(--searchedword-hlt2)';
                    }
                }
            }
        }
    }
    async function searchJSON() {
        let prevBook = null;
        let currentBK = null;
        let returnedOBJofArrayOfWordsToSearchFor = arrayOfWordsToSearchFor(value2searchfor);
        let searchForStrongs = returnedOBJofArrayOfWordsToSearchFor.hasStrongsNum;
        let lastBknChpt = {};

        function loopThroughBibleBooks() {
            //Books to search in
            let booksToSearchIn = listOfBooksToSearchIn(document.getElementById(sourceOfranges).value);//Get list of books to search in as array
            if(!booksToSearchIn){return};
            booksLength = booksToSearchIn.length;
            let bookName = null;
            let prvChptNum = null;
            let currentChptNum = null;
            
            /* LOOP THROUGH SELECTED BOOKS TO SEARCH IN */
        
            let allBooksWithContentInVersion = window[bversionName];
            for (let x = 0; x < booksLength; x++) {
                if (totalOccurencesInSearch > (!doStrongAnalysis ? 500 : 2000)) {
                    showAlert(`<b>NOT SHOWING ALL SEARCH RESULTS.</b><p>Search result is too large, <em>Greater than <b>${!doStrongAnalysis ? 500 : 2000}</b>.</em></p>Please refine your search.`);
                    break
                    // return
                }
                bookName = booksToSearchIn[x];//from book ranges in #biblebooksgroup_1 parsed by listOfBooksToSearchIn(...)
                let arrOf_chaptersTosearch;
                let specifiedChptsToSearch='';
                //if bookName is object
                if(isObject(bookName)){
                    arrOf_chaptersTosearch = bookName.chp;//If chapters are specified for book in range
                    bookName = bookName.bk;
                }
                let allChaptersInCurrentBook = allBooksWithContentInVersion?.[bookName];
                let numberOfChaptersInCurrentBook = allChaptersInCurrentBook?.length;
                
                if(!arrOf_chaptersTosearch){//If no chapter is specified, search all chapters in book
                    arrOf_chaptersTosearch=populateRange(1, numberOfChaptersInCurrentBook)
                } else {
                    const tempSrchChptArr=[];
                    //remove chapter number from array if it doesn't exist in the book
                    arrOf_chaptersTosearch.forEach((a,b)=>{
                        a=Number(a);
                        if (a <= numberOfChaptersInCurrentBook) {tempSrchChptArr.push(Number(arrOf_chaptersTosearch[b]))}
                    })
                    arrOf_chaptersTosearch = tempSrchChptArr;
                    aocts = arrOf_chaptersTosearch;
                    let chptsString='';
                    aoctsL = aocts.length;
                    let comma='';
                    for (let i = 0; i < aoctsL; i++) {
                        let cnum = aocts[i];
                        chptsString += `${comma}${cnum}`;
                        let nextString='';
                        // Are the next two chapters increaments
                        let f=i, f1=f+1, f2=f+2;
                        if(f1 < aoctsL && cnum+1 == aocts[f1]){//If range is from low to high
                            nextString = `-${aocts[f1]}`;
                            while((f1 < aoctsL && f2 < aoctsL) && (cnum+1 == aocts[f1] && cnum+2 == aocts[f2])){
                                nextString = `-${aocts[f2]}`;
                                f++, f1=f+1, f2=f+2, cnum++;
                            }
                            chptsString += nextString;
                            i=f2-1;
                        } else if(f1 < aoctsL && cnum-1 == aocts[f1]){//If range is from high to low
                            nextString = `-${aocts[f1]}`;
                            while((f1 < aoctsL && f2 < aoctsL) && (cnum-1 == aocts[f1] && cnum-2 == aocts[f2])){
                                nextString = `-${aocts[f2]}`;
                                f++, f1=f+1, f2=f+2, cnum--;
                            }
                            chptsString += nextString;
                            i=f2-1;
                        }
                        comma=',';
                    }
                    specifiedChptsToSearch = chptsString;
                }
        
                //Loop through Chapters
                // arrOf_chaptersTosearch.forEach(y1 => {
                for (let index = 0; index < arrOf_chaptersTosearch.length; index++) {
                    let y1 = arrOf_chaptersTosearch[index];
                    if (totalOccurencesInSearch > (!doStrongAnalysis ? 500 : 2000)) {
                        showAlert(`<b>NOT SHOWING ALL SEARCH RESULTS.</b><p>Search result is too large, <em>Greater than <b>${!doStrongAnalysis ? 500 : 2000}</b>.</em></p>Please refine your search.`);
                        break
                        // return
                    }
                    let y = y1-1;// Actual chapter number minus one for use in array
                    currentChptNum = y1;
                    
                    let currentChapter = allChaptersInCurrentBook[y];
                    let allVersesInCurrentChapter = currentChapter;
                    let chapterVersesLength = currentChapter.length;
                    let iorI = case_sensitiveChecked ? '' : 'i';

                                        
                    /* ANY WORD SEARCH */
                    if (anyWordChecked == true) {
                        /* if searching for any word, then no need to search nearbyVerses */
                        let wordsArray = returnedOBJofArrayOfWordsToSearchFor.wordsArray;
                        for (z = 0; z < chapterVersesLength; z++) {
                            const currentVerseText = allVersesInCurrentChapter[z];
                            let originalText = currentVerseText.toString();
                            //IT ONLY NEEDS TO INCLUDE ONE OF THE WORDS
                            for (let j = 0; j < wordsArray.length; j++) {
                                let nreg;
                                iorI = 'i';
                                // const currentIndividualSrchWord = wordsArray[j];
                                const currentIndividualSrchWord = setRegexForPartsOfSearchString(wordsArray[j]).regexify
                                if(case_sensitiveChecked){iorI=''};
                                // If wholeWord is checked or current word is a strong's number search for whole word (will not search for a partially matching strong's num)
                                if(wholeWordChecked||(/[GHgh]\d+/.test(currentIndividualSrchWord))){
                                    nreg = new RegExp("\\b" + currentIndividualSrchWord + "\\b",iorI);
                                } else {
                                    nreg = new RegExp(currentIndividualSrchWord,iorI)
                                }
                                if (nreg.test(originalText)) {
                                    if ((prevBook != currentBK) || (prevBook == null)) {
                                        prevBook = currentBK;
                                    }
                                
                                    //It only gets here if ANY word is found, so check for each word
                                    wordsArray.forEach(cISW => {
                                        if (versionHasStrongsNums) {
                                            // updateArrayOfTranslationsForStrongs(cISW, currentVerseText, y1, currentChptNum);
                                            updateArrayOfTranslationsForStrongs(cISW.replace(/[\[\]]/g, '\\b').replace(/\*([^*]+)/g, '$1\\b').replace(/([^*]+)\*/g, '\\b$1'), currentVerseText, y1, currentChptNum);
                                        }
                                    });

                                    currentBK = bookName;
                                    totalOccurencesInSearch += 1;
                                    if (!do_StrongAnalysisOnly) {   
                                        appendVerseToSearchResultWindow(currentBK, prevBook, x, y, z+1, allVersesInCurrentChapter[z], searchFragment,bookName,wordsArray,specifiedChptsToSearch)
                                        findAnything = true;
                                    } else {doStrongAnalysis = true;}
                                    break
                                }
                            }
                        }
                    }
                    
                    //If there is a strongs num to be searched for, then you cannot search for a phrase. Rather search to see if verse contains all words
                    
                    /* STRONGS NUMBER INCLUDED IN SEARCH */
                    else if (searchForStrongs == true) {
                        let wordsArray = returnedOBJofArrayOfWordsToSearchFor.wordsArray;
                        /* FIRST, CREATE ARRAY OF REGEXED WORDS TO SEARCH FOR */
                        let rgxWrdsArr = [];
                        for (let j = 0; j < wordsArray.length; j++) {
                            //IT HAS TO INCLUDE ALL THE WORDS (won't work for a search that is for any of the words)
                            let nreg;
                            let currentIndividualSrchWord = setRegexForPartsOfSearchString(iorI == 'i' ? wordsArray[j].toLowerCase() : wordsArray[j]).regexify;

                            //if there is a non-strongs word in it, e.g., if it is (?:\\bJesus|G100)
                            if (/[^0-9]{3}\d+/i.test(currentIndividualSrchWord)) {
                                //make strong's number case-insensitive if present
                                currentIndividualSrchWord = currentIndividualSrchWord.replace(/G(\d+)/gi, '[Gg]$1').replace(/H(\d+)/gi, '[Hh]$1');
                                nreg = new RegExp(currentIndividualSrchWord, iorI);
                            }
                            // If wholeWord is checked or current word is a strong's number search for whole word (will not search for a partially matching strong's num)
                            else if (wholeWordChecked || (/[GHgh]\d+/.test(currentIndividualSrchWord))) {
                                currentIndividualSrchWord = currentIndividualSrchWord.replace(/G(\d+)/gi, '[Gg]$1').replace(/H(\d+)/gi, '[Hh]$1');
                                // nreg = new RegExp("\\b" + currentIndividualSrchWord + "\\b");
                                nreg = new RegExp(`\\b${currentIndividualSrchWord}\\b`, iorI)
                            } else {
                                nreg = new RegExp(currentIndividualSrchWord, iorI);
                                // nreg = new RegExp(currentIndividualSrchWord);
                            }
                            rgxWrdsArr.push(nreg);
                        }

                        //Loop through every verse in the current chapter
                        for (z = 0; z < chapterVersesLength; z++) {
                            let containsAll = true;
                            //Strip off {}[] and strongs numbers
                            const currentVerseText = allVersesInCurrentChapter[z];
                            let originalText = currentVerseText.toString();
                            
                            // let vText=originalText;
                            /*
                            * if no word is found, then move on to next verse
                            * if all words in rgxWrdsArr are found in verse then  analyseArrOfStrngsWrds()
                            * if one or more words (but not all words) are found, check the next verse for the missing words until
                            ```* all the words are found or
                            ```* an adjoining verse does not have any of the searched words
                            **** increament z as you check adjoining verses
                            */

                            // verseProximity = ((search_all_words.checked || search_phraseChecked) && arrayOfSearchWords.length>1) ? verseProximity : 0;
                            let missingWords = [];
                            let v2check = verseProximity;
                            let q = z;
                            let matchedVersesNums = [];

                            proximitySearch_strngs(rgxWrdsArr);
   
                            function proximitySearch_strngs(rWa) {
                                if (v2check == 0) {
                                    matchedVersesNums.push(q);
                                    missingWords = [];
                                    containsAll = true;
                                    
                                    rWa.forEach(rgxW => {
                                        if (!rgxW.test(originalText)) {
                                            containsAll = false;
                                            missingWords.push(rgxW);
                                        }
                                    });
                                }
                                else if (v2check > 0) {
                                    matchedVersesNums.push(q);
                                    missingWords = [];

                                    rWa.forEach(rgxW => {
                                        if (!rgxW.test(originalText)) {
                                            containsAll = false;
                                            missingWords.push(rgxW);
                                        }
                                    });
                                    
                                    q++;
                                    const _x = missingWords.length != rgxWrdsArr.length;
                                    if (_x && q < chapterVersesLength) {
                                        v2check = v2check - 1;
                                        originalText = allVersesInCurrentChapter[q].toString();

                                        missingWords.length > 0 ? proximitySearch_strngs(missingWords) : (containsAll = true);
                                    }
                                }
                                return {containsAll}
                            }

                            //IT WILL ONLY CHECK AT THE END OF THE FOR LOOP WHICH IT WILL NOT GET TO IF ALL WORDS ARE NOT INCLUDED IN THE VERSE.TXT

                            // if (j == wordsArray.length - 1) { //Last search word
                            if (containsAll) { //Last search word
                                if ((prevBook != currentBK) || (prevBook == null)) {
                                    prevBook = currentBK;
                                }
                                analyseArrOfStrngsWrds();
                            }

                            function analyseArrOfStrngsWrds() {
                                
                                //Analysis array for strong's words (all the words were found so loop through all)
                                wordsArray.forEach(cISW => {
                                    cISW = cISW.replace(/\]|\[/g, '').split(/\s+/);
                                    cISW.forEach(c => {
                                        if (versionHasStrongsNums) {
                                            updateArrayOfTranslationsForStrongs(c, currentVerseText, y1, currentChptNum);
                                        }
                                    });
                                }); //Why looop through all the words? Because at this point it will only have the last search word in currentIndividualSrchWord

                                currentBK = bookName;
                                totalOccurencesInSearch += 1;
                                if (!do_StrongAnalysisOnly) {

                                    // appendVerseToSearchResultWindow(currentBK, prevBook, x, y, z + 1, allVersesInCurrentChapter[z], searchFragment, bookName, wordsArray, specifiedChptsToSearch)
                                    matchedVersesNums.forEach((zz,i) => {
                                        appendVerseToSearchResultWindow(currentBK, prevBook, x, y, zz+1, allVersesInCurrentChapter[zz], searchFragment,bookName,wordsArray,specifiedChptsToSearch);
                                        if ((prevBook!=currentBK)||(prevBook==null)){prevBook = currentBK;}
                                        const mvnLngth = matchedVersesNums.length;
                                        if(mvnLngth>1){
                                            // const prox = searchFragment.lastOfType('.verse');
                                            const prox = searchFragment.querySelector('.verse:last-of-type');
                                            prox.classList.add('prox_sv');
                                            if(i == 0){prox.classList.add('prox_first');}
                                            else if(i == mvnLngth-1){prox.classList.add('prox_last');}
                                        }
                                        currentBK = bookName;
                                        z = zz;//so as not to search a verse that has been searched
                                    });
                                    findAnything = true;
                                } else {
                                    doStrongAnalysis = true;
                                }
                            }
                        }
                    }

                    //If there is no strongs num to be searched for, then just search for all words or the phrase
                    // nearbyVerses is relevant here
                    
                    /* NO STRONGS NUMBER TO SEARCH */
                    else if (searchForStrongs == false) {
                        let arrayOfSearchWords = returnedOBJofArrayOfWordsToSearchFor.wordsArray;
                        for (z = 0; z < chapterVersesLength; z++) {
                            let currentVerseText = allVersesInCurrentChapter[z];
                            let combinedVersesText = currentVerseText;
                            let madePlain = returnStrippedTextOfVerse(currentVerseText).withOutStrongs;

                            if(!case_sensitiveChecked){madePlain=madePlain.toLowerCase()}

                            /* PHRASE SEARCH && WHOLE WORD */
                            let arrayOfWordsInVerse = madePlain.split(' ');
                            let exactMatchOrNot = false;

                            if (search_phraseChecked && arrayOfSearchWords.length>1){
                                if((wholeWordChecked && isAsubArrayofB(arrayOfSearchWords.map(m=>{return setRegexForPartsOfSearchString(m).regexify}), arrayOfWordsInVerse,exactMatchOrNot)) || 
                                (!wholeWordChecked && isAsubArrayofB(arrayOfSearchWords.map(m=>{return setRegexForPartsOfSearchString(m).regexify}), madePlain.split(' '),exactMatchOrNot))) {
                                    if ((prevBook != currentBK) || (prevBook == null)) {
                                        prevBook = currentBK;
                                    }
                                    currentBK = bookName;
                                    appendVerseToSearchResultWindow(currentBK, prevBook, x, y, z+1, allVersesInCurrentChapter[z], searchFragment,bookName,arrayOfSearchWords,specifiedChptsToSearch)
                                    findAnything = true;
                                    totalOccurencesInSearch += 1;
                                }
                            }

                            /* ALL WORDS (NOT PHRASE) SEARCH && WHOLE WORD */
                            else if (search_all_words.checked || (search_phraseChecked && arrayOfSearchWords.length==1)) {
                                
                                // verseProximity
                                verseProximity = ((search_all_words.checked || search_phraseChecked) && arrayOfSearchWords.length>1) ? verseProximity : 0;

                                let q=z;
                                let allWordsFound = false;
                                let someWordsFound = false;
                                let matchedVersesNums = [];
                                let wordsFound = [];
                                
                                let arrOfSWrgx = arrayOfSearchWords.map(m=>{return setRegexForPartsOfSearchString(m).regexify});

                                let v2check = verseProximity;
                                if (proximitySearch()) {
                                    if ((prevBook!=currentBK)||(prevBook==null)){prevBook = currentBK;}
                                    
                                    if(versionHasStrongsNums){
                                        arrayOfSearchWords.forEach(w=>{updateArrayOfTranslationsForStrongs(w, combinedVersesText, y1, currentChptNum)})
                                    }
                                    currentBK = bookName;
                                    matchedVersesNums.forEach((zz,i) => {
                                        appendVerseToSearchResultWindow(currentBK, prevBook, x, y, zz+1, allVersesInCurrentChapter[zz], searchFragment,bookName,arrayOfSearchWords,specifiedChptsToSearch);
                                        if ((prevBook!=currentBK)||(prevBook==null)){prevBook = currentBK;}
                                        const mvnLngth = matchedVersesNums.length;
                                        if(mvnLngth>1){
                                            // const prox = searchFragment.lastOfType('.verse');
                                            const prox = searchFragment.querySelector('.verse:last-of-type');
                                            prox.classList.add('prox_sv');
                                            if(i == 0){prox.classList.add('prox_first');}
                                            else if(i == mvnLngth-1){prox.classList.add('prox_last');}
                                        }
                                        currentBK = bookName;
                                        z = zz;//so as not to search a verse that has been searched
                                    });
                                    findAnything = true;
                                    totalOccurencesInSearch += 1;
                                }
                                function proximitySearch(checkAllInOneVerse=true) {
                                    
                                    let arrOfSWrgxFiltered = arrOfSWrgx.filter(item => !wordsFound.includes(item))
                                    // check for each searched word in the verse
                                    arrOfSWrgxFiltered.forEach((w_rgx,i)=>{
                                        const w_rgx_I = new RegExp(w_rgx, iorI);
                                        if (w_rgx_I.test(madePlain)) {wordsFound.push(w_rgx);}
                                    })
                                    
                                    if (checkAllInOneVerse && (wholeWordChecked && areAllitemsOfAinB_1(arrOfSWrgx, arrayOfWordsInVerse)) || (!wholeWordChecked && areAllitemsOfAinB_1(arrOfSWrgx, madePlain))) {
                                        allWordsFound = true;
                                        matchedVersesNums.push(q);
                                    } else if(wordsFound.length > 0 && wordsFound.length != arrayOfSearchWords.length){
                                        someWordsFound = true;
                                        matchedVersesNums.push(q);
                                        q = q+1;
                            
                                        /* Check Adjacent Verse Only If Part of the Search Words Were Found In Current Verse(s) */
                                        if(v2check>0){
                                            v2check = v2check - 1;
                                            currentVerseText = currentVerseText.concat(allVersesInCurrentChapter[q]);
                                            madePlain = returnStrippedTextOfVerse(currentVerseText).withOutStrongs;
                                            combinedVersesText = currentVerseText;
                                            
                                            arrayOfWordsInVerse = madePlain.split(' ');
                                            proximitySearch(false);
                                        }
                                    } else if (wordsFound.length == arrayOfSearchWords.length){
                                        allWordsFound = true;
                                        matchedVersesNums.push(q);
                                    }
                                    return allWordsFound
                                }
                            }
                        }
                    }
                }
                // });
            }

            function updateArrayOfTranslationsForStrongs(currentIndividualSrchWord, currentVerseText, y1, currentChptNum) {
                //Loop through every occurence of strongs number in verse
                let innerArrayWithStrongs;
                let n,i='i';
                //If it is a strongs word
                if (/[GHgh]\d+/.test(currentIndividualSrchWord)){n=0;}
                //If it is NOT a strongs word
                else {
                    n=1;
                    if(case_sensitiveChecked){i=''}
                }
                
                // innerArrayWithStrongs = findArraysContainingString(currentVerseText, currentIndividualSrchWord.toUpperCase())
                innerArrayWithStrongs = findArraysContainingString(currentVerseText, new RegExp(setRegexForPartsOfSearchString(currentIndividualSrchWord).regexify, i))
                const ilength=innerArrayWithStrongs.length;
                let tranlationOccurencesInVerse = [];
                // Checks each array in each verse
                innerArrayWithStrongs.forEach((s,i) => {
                    let strongsTranslation = s[n]?s[n]:currentIndividualSrchWord;//First position in array will contain the translation of the strongs number
                    strongsTranslation = strongsTranslation.trim().replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '').trim();// so that punctuation does not make the same word not match. E.g., 'heaven' vs., 'heaven,'
                    //First time registering for a strongs number
                    if (!strongsAnalysisObj.hasOwnProperty(currentIndividualSrchWord)) {
                        strongsAnalysisObj[currentIndividualSrchWord] = {};
                        lastBknChpt[currentIndividualSrchWord] = {};
                        let to = `_total_${currentIndividualSrchWord}`;//for totalOccurences
                        strongsAnalysisObj[to]={};
                    }
                    
                    //First time registering for translation of strongs number
                    if (!strongsAnalysisObj[currentIndividualSrchWord].hasOwnProperty(strongsTranslation)) {
                        strongsAnalysisObj[currentIndividualSrchWord][strongsTranslation] = `${bookName} ${y1}:${z + 1}`;
                        lastBknChpt[currentIndividualSrchWord][strongsTranslation] = {};
                        lastBknChpt[currentIndividualSrchWord][strongsTranslation][bookName]=[];
                        lastBknChpt[currentIndividualSrchWord][strongsTranslation][bookName].push(y1);
                        lastBknChpt[currentIndividualSrchWord][strongsTranslation]['deletededBook']=[];
                        tranlationOccurencesInVerse.push(`${strongsTranslation}*${z}`)
                        strongsAnalysisObj[`_total_${currentIndividualSrchWord}`][strongsTranslation]=1;
                    }

                    //If the same book as before
                    else if (lastBknChpt[currentIndividualSrchWord][strongsTranslation].hasOwnProperty(bookName)) {
                        //If new chapter
                        if (!lastBknChpt[currentIndividualSrchWord][strongsTranslation][bookName].includes(y1)) {
                            strongsAnalysisObj[currentIndividualSrchWord][strongsTranslation] += `; ${y1}:${z + 1}`;
                            lastBknChpt[currentIndividualSrchWord][strongsTranslation][bookName].push(y1);
                            strongsAnalysisObj[`_total_${currentIndividualSrchWord}`][strongsTranslation] += 1;// register totalOccurences
                        }
                        //If same chapter as before
                        else if (!tranlationOccurencesInVerse.includes(`${strongsTranslation}*${z}`)) {
                            strongsAnalysisObj[currentIndividualSrchWord][strongsTranslation] += `,${z + 1}`;
                            strongsAnalysisObj[`_total_${currentIndividualSrchWord}`][strongsTranslation] += 1;// register totalOccurences
                        }
                        tranlationOccurencesInVerse.push(`${strongsTranslation}*${z}`)
                        // Indicate number of times a translation occurs in a verse if it is more than once
                        const numOfoccurencesInVerse = tranlationOccurencesInVerse.filter(item => item === `${strongsTranslation}*${z}`).length;
                        if(ilength > 1 && ilength == i+1 && numOfoccurencesInVerse > 1){
                            strongsAnalysisObj[currentIndividualSrchWord][strongsTranslation] += `<em>-(${numOfoccurencesInVerse}x)</em>`;
                            //Reset book and chapter so that if the next reference is the same book it will start will be full reference
                            delete lastBknChpt[currentIndividualSrchWord][strongsTranslation][bookName];
                            lastBknChpt[currentIndividualSrchWord][strongsTranslation]['deletededBook'].push(bookName);
                            strongsAnalysisObj[`_total_${currentIndividualSrchWord}`][strongsTranslation] += numOfoccurencesInVerse-1;// register totalOccurences
                        }
                    }
                    //If a different book
                    else {
                        let hr='<hr>';// add divider between different books
                        if(lastBknChpt[currentIndividualSrchWord][strongsTranslation]['deletededBook'].includes(bookName)){hr='; '}
                        strongsAnalysisObj[currentIndividualSrchWord][strongsTranslation] += `${hr}${bookName} ${y1}:${z + 1}`;
                        lastBknChpt[currentIndividualSrchWord][strongsTranslation][bookName]=[];
                        lastBknChpt[currentIndividualSrchWord][strongsTranslation][bookName].push(y1);
                        tranlationOccurencesInVerse.push(`${strongsTranslation}*${z}`)
                        const numOfoccurencesInVerse = tranlationOccurencesInVerse.filter(item => item === `${strongsTranslation}*${z}`).length;
                        if(ilength > 1 && ilength == i+1 && numOfoccurencesInVerse > 1){
                            strongsAnalysisObj[currentIndividualSrchWord][strongsTranslation] += `<em>-(${numOfoccurencesInVerse}x)</em>`;
                            //Reset book and chapter so that if the next reference is the same book it will start will be full reference
                            delete lastBknChpt[currentIndividualSrchWord][strongsTranslation][bookName];
                            lastBknChpt[currentIndividualSrchWord][strongsTranslation]['deletededBook'].push(bookName);
                            strongsAnalysisObj[`_total_${currentIndividualSrchWord}`][strongsTranslation]+=numOfoccurencesInVerse;// register totalOccurences
                        } else{
                            strongsAnalysisObj[`_total_${currentIndividualSrchWord}`][strongsTranslation]+=1;// register totalOccurences
                        }
                    }
                });
                findAnything = true;
                // totalOccurencesInSearch += 1;
                prvChptNum = currentChptNum;
            }
        }
        
        loopThroughBibleBooks();
        where2appendSearchresult == searchPreviewFixed ? where2appendSearchresult.innerHTML = '':null;// So that it doesn't clear compareDiv. Clearing of compDiv is handled by "fill_Compareverse(x)"

        let caseSensitiveSearch, anyWORDsearch, phraseSearch, wholeWordSearch;
        if (case_sensitiveChecked) {caseSensitiveSearch = 'CASE SENSITIVE|'}
        else {caseSensitiveSearch = 'CASE INSENSITIVE|'}
        if (searchForStrongs) {phraseSearch = 'ANY|';} else {anyWORDsearch = ''}
        if (search_phraseChecked) {phraseSearch = 'PHRASE|';} else {phraseSearch = 'NONE PHRASE|';}
        if (wholeWordChecked) {wholeWordSearch = 'WHOLE WORD';} else {wholeWordSearch = 'PARTIAL MATCH';}
        // if (findAnything == false) {setTimeout(() => {wordsearch_fixed.select();}, 200);}
        strongsAnalysisResult();
        where2appendSearchresult.append(searchFragment);
        where2appendSearchresult.setAttribute('b_version',bversionName);
        //To Clear "where2appendSearchresult" Window after given time
        if(!keepsearchopen.checked){runFuncAfterSetTimeInactivityInElm(searchPreviewWindowFixed, 60000, clearSearchWindow)}
    }
    function strongsAnalysisResult(){
        let cnt=0;
        let allOccurencesInSearch = 0;
        for(strNum in strongsAnalysisObj){
            if(strNum.startsWith('_total_')){continue}
            cnt++;
            let allResultRefs_Details = document.createElement('DETAILS');
            if (cnt==1 && do_StrongAnalysisOnly) {allResultRefs_Details.open = true;}//if first detail and if strongsAnalysisOnly is checked
            let allResultRefs_Summary = document.createElement('SUMMARY');
            let ol = document.createElement('OL');
            ol.style.paddingLeft='1em'
            allResultRefs_Details.classList.add('verse');
            allResultRefs_Details.classList.add('resultsummary');

            /* ACTUAL RESULTS OF STRONGS ANALYSIS */
            // Get the keys of the object
            let snTrans_keys = Object.keys(strongsAnalysisObj[strNum]);
            snTrans_keys.sort((a, b) => {
                const wordCountDiff = a.split(' ').length - b.split(' ').length;
                // If the word count is the same, sort alphabetically
                if (wordCountDiff === 0) {return a.toLowerCase().localeCompare(b.toLowerCase());}
                return wordCountDiff;
            });
            //snTrans, i.e., strongs numbers translation
            // for(snTrans in strongsAnalysisObj[strNum]){
            let snTotal=0;
            for(snTrans of snTrans_keys){
                let details = document.createElement('details');
                let summary = document.createElement('summary');
                details.append(summary);
                details.open=true;
                let li = document.createElement('li');
                let numOfoccurencesInVerse = strongsAnalysisObj[`_total_${strNum}`][snTrans];
                allOccurencesInSearch += numOfoccurencesInVerse;
                //Search word is a strong's number
                if (/[GHgh]\d+/.test(strNum)) {
                    summary.innerHTML += `<span class="strongs_analysis">${snTrans}</span> - <em><b>${numOfoccurencesInVerse}</b>x</em>: <br>`;
                    snTotal += numOfoccurencesInVerse;
                }
                //Search word is not a strong's number
                else {
                    const snTransArr = snTrans.split(/\s+/);//In case more than one strong's word
                    snTransArr.forEach(snt => {
                        if (/[GHgh]\d+/.test(snt)) {
                            const strNum_UP = snt.toUpperCase();
                            summary.innerHTML += `<span class="${strNum_UP} strnum vnotestrnum" strnum="${strNum_UP}">${getsStrongsLemmanNxLit(strNum_UP).lemma} (${getsStrongsLemmanNxLit(strNum_UP).xlit}, ${strNum_UP})</span> `;
                        } else {
                            summary.innerHTML += `<span>${strNum} <em>(No Strong's Num)</em></span> `
                        }
                    });
                    snTotal += numOfoccurencesInVerse;
                    summary.innerHTML += `- <em><b>${numOfoccurencesInVerse}</b>x</em>:`;
                }
                details.innerHTML += `<div style="margin-left:0.5em;margin-bottom:0.5em">${strongsAnalysisObj[strNum][snTrans]}<hr></div>`;//append references
                li.append(details);
                ol.append(li);
            }

            /* MASTER SUMMARY OF STRONGS ANALYSIS */
            strNum=setRegexForPartsOfSearchString(strNum).unregexify;
            if (/[GHgh]\d+/.test(strNum)) {
                const xxxx = strNum.split(/\s+/);
                if(xxxx.length>1){
                    allResultRefs_Summary.innerHTML = `<span>${snTotal}<em> <b>${bversionName}</b> Translations of </em><b>`;
                    xxxx.forEach(x=>{
                        x=x.toUpperCase().replace(/\*/g,'')
                        allResultRefs_Summary.innerHTML += `<span class="${x} strnum vnotestrnum" strnum="${x}"> ${x.toUpperCase()}</span>`;
                    })
                    allResultRefs_Summary.innerHTML += `</b></span>`;
                }
                else {
                    const strNum_UP = strNum.toUpperCase().replace(/\*/g,'');
                    allResultRefs_Summary.innerHTML = `<span>${snTotal}<em> <b>${bversionName}</b> Translations of </em><b><span class="${strNum_UP} strnum vnotestrnum" strnum="${strNum_UP}">${strNum.toUpperCase()} / ${getsStrongsLemmanNxLit(strNum_UP).xlit}/ ${getsStrongsLemmanNxLit(strNum_UP).lemma}</span> </b></span>`;
                    // allResultRefs_Summary.innerHTML = `<span>${allOccurencesInSearch}<em> <b>${bversionName}</b> Translations of </em><b><span class="${strNum_UP} strnum vnotestrnum" strnum="${strNum_UP}">${strNum.toUpperCase()} / ${getsStrongsLemmanNxLit(strNum_UP).xlit}/ ${getsStrongsLemmanNxLit(strNum_UP).lemma}</span> </b></span>`;
                }
            } else {
                allResultRefs_Summary.innerHTML = `<span>${snTotal}<em> <b>${bversionName}</b> Strong's Number For </em><b><span class="strongs_analysis">${strNum}</span> </b></span>`;
            }
            allResultRefs_Details.append(allResultRefs_Summary);
            ol.innerHTML = generateRefsInNote(ol.innerHTML,true)//parse/convert references to crossrefs
            allResultRefs_Details.append(ol);
            // searchFragment.prepend(allResultRefs_Details);
            searchResultStats_Details.append(allResultRefs_Details);
            doStrongAnalysis ? searchResultStats_Details.setAttribute('open', '') : null;
            searchFragment.prepend(searchResultStats_Details);
        }
        return searchFragment
    }
    function arrayOfWordsToSearchFor(w) {
        let regexified = setRegexForPartsOfSearchString(w).regexify;
        let caseSensitivity='';
        if(!case_sensitive.checked){
            /*w=w.toLowerCase();*/
            caseSensitivity='i';
        }
        let hasStrongs = /.*[H|G|h|g]\d+.*/.test(w); //YesItHasStrongs
        let wArray = w.split(/("[^"]+"|\[[^\]]+\]|\S+)/).filter(part => part.trim().length > 0);//treat words in "word" as one word (for phrase searching);
        let wArray_forStyleRule = w.replace(/[(\s\s+),."';:]/g, ' ').replace(/\s+(\])/g, '$1').replace(/(\])\s+/g, '$1').trim().split(/\s+/);
        let tempArr=[];
        wArray.forEach(x=>{
            x = x.replace(/[(\s\s+),.;:]/g,' ').replace(/\s+(\])/g,'$1').replace(/(\])\s+/g,'$1').replace(/(^\s*")|("\s*$)/g,'').replace(/(\w)\s*"/g,'$1"').replace(/"\s*(\w)/g,'"$1').trim();
            tempArr.push(x);
        });
        wArray=tempArr;
        let searchStrongsNumArray = [];
        let non_StrongsNumArray = [];
        let regexedArray = [];
        wArray.forEach((x)=>{
            regexedArray.push(setRegexForPartsOfSearchString(x).regexify)
            // if(new RegExp(/\b[H|G|h|g]\d+.*/).test(x)){searchStrongsNumArray.push(x)}
            // else {non_StrongsNumArray.push(x)}
        })
        wArray_forStyleRule.forEach((x)=>{
            if(new RegExp(/\b[H|G|h|g]\d+.*/).test(x)){searchStrongsNumArray.push(x)}
            else {non_StrongsNumArray.push(x)}
        })
        
        function createStyleRuleForSearchedWords(){
            let styleRule = '';
            let styleRule_sup = '';
            let styleRule3 = '';

            // in case words are surrounded with brackets
            const ssna = searchStrongsNumArray.flatMap(item=>item.replace(/^\[/g,'').replace(/\]$/g,'').replace(/[\s+\[\]]/g,' ').split(/\s+/));
            const n_sna = non_StrongsNumArray.flatMap(item=>item.replace(/^\[/g,'').replace(/\]$/g,'').replace(/[\s+\[\]]/g,' ').split(/\s+/));

            function ruleDescription(location, x, strnum_translation='[strnum][translation') {
                return `${location} ${strnum_translation}${wholeORpartial}="${x}"${caseSensitivity}]:not(${strnum_translation}${wholeORpartial}="${x}"${caseSensitivity}]:has([strnum])),
                ${location} ${strnum_translation}${wholeORpartial}="${x}"${caseSensitivity}] [strnum],
                ${location} ${strnum_translation}${wholeORpartial}="${x}"${caseSensitivity}].eng2grk::after`
            }
            ssna.forEach((x,i)=>{
                x = setRegexForPartsOfSearchString(x).removeSpecialCharacters;
                if (/[GHgh]\d+/.test(x.replace(/[\*\]\[\(\)\]]*/g,''))) {
                    styleRule = cssForCMenuInCompareSection ? (`${styleRule}${cssForCMenuInCompareSection} [strnum~="${x}"i],${cssOfSearchWin} [strnum~="${x}"i],`):(`${styleRule}${cssOfSearchWin} [strnum~="${x}"i],`);
                    styleRule_sup = cssForCMenuInCompareSection ? (`${styleRule_sup}${cssForCMenuInCompareSection} [strnum~="${x}"i].translated:not(.eng2grk)::after,${cssOfSearchWin} [strnum~="${x}"i].translated:not(.eng2grk)::after,`):(`${styleRule_sup}${cssOfSearchWin} [strnum~="${x}"i].translated:not(.eng2grk)::after,`);
                } else {
                    n_sna_func([x])
                }
            });
            n_sna_func(n_sna)
            function n_sna_func(n_sna) {
                n_sna.forEach((x,i)=>{
                    x=setRegexForPartsOfSearchString(x).removeSpecialCharacters;
                    styleRule = cssForCMenuInCompareSection?(`${styleRule}${ruleDescription(cssForCMenuInCompareSection, x, '[strnum][translation')},${ruleDescription(cssOfSearchWin, x, '[strnum][translation')},`):(`${styleRule}${ruleDescription(cssOfSearchWin, x, '[strnum][translation')},`);
                    styleRule3 = cssForCMenuInCompareSection?(`${styleRule3}${cssForCMenuInCompareSection} [translation${wholeORpartial}="${x}"${caseSensitivity}]:not([strnum]),${cssOfSearchWin} [translation${wholeORpartial}="${x}"${caseSensitivity}]:not([strnum]),`):(`${styleRule3}${cssOfSearchWin} [translation${wholeORpartial}="${x}"${caseSensitivity}]:not([strnum]),`);
                    styleRule_sup = cssForCMenuInCompareSection?(`${styleRule_sup}${cssForCMenuInCompareSection} [strnum][translation${wholeORpartial}="${x}"${caseSensitivity}]:not(.eng2grk)::after,${cssOfSearchWin} [strnum][translation${wholeORpartial}="${x}"${caseSensitivity}]:not(.eng2grk)::after,`):(`${styleRule_sup}${cssOfSearchWin} [strnum][translation${wholeORpartial}="${x}"${caseSensitivity}]:not(.eng2grk)::after,`);
                    styleRule_sup = cssForCMenuInCompareSection?(`${styleRule_sup}${cssForCMenuInCompareSection} [translation${wholeORpartial}="${x}"${caseSensitivity}]:not([strnum]):not(.eng2grk)::after,${cssOfSearchWin} [translation${wholeORpartial}="${x}"${caseSensitivity}]:not([strnum]):not(.eng2grk)::after,`):(`${styleRule_sup}${cssOfSearchWin} [translation${wholeORpartial}="${x}"${caseSensitivity}]:not([strnum]):not(.eng2grk)::after,`);
                });
            }
            
            styleRule = styleRule.replace(/null/g,''+ cssOfSearchWin)
            styleRule3 = styleRule3.replace(/null/g,''+ cssOfSearchWin)
            styleRule_sup = styleRule_sup.replace(/null/g,''+ cssOfSearchWin)
            let styleRule2 = styleRule.replace(/,/g,':hover,');
            let styleRule4 = styleRule3.replace(/,/g,':hover,');
            
            styleRule = `${styleRule.replace(/(::after)*\s*,/g, ':not(.context_menu)$1,')}{
                font-style:italic; color:var(--searchedword-hlt)/*!important*/;
                font-weight: bold;
                box-shadow:inset 0 -2.5px orange, 0px 1px 6px -2px var(--sh)!important;
                /*box-shadow:inset 0 -2.5px orange, 0px 1px 6px -2px black, 0px 0px 0.5px 0.5px!important;*/
                /*background:transparent;*/
            }
            ${styleRule2}{box-shadow:inset 0 -2.5px orange,0px 1px 6px -2px black!important;}
            ${styleRule4}{box-shadow:inset 0 -3px var(--searchedword-hlt2),0px 0px 0px 1px grey!important;}
            ${styleRule_sup}{
                content:attr(data-xlit);
                font-size:75%;
                font-weight:300;
                line-height:0;
                position:relative;
                vertical-align:baseline;
                top:-0.5em;
                font-style italic;
                margin-left:2px;
                /*color:#51362d;*//*grey*/
            }`
            //Remove last comma (', {' to '{') in "styleRule"
            styleRule = styleRule.replace(/,\s*\{/g,'{')
            createNewStyleSheetandRule(styleID, styleRule)
        }
        createStyleRuleForSearchedWords()
        return {
            "regexified": regexified,
            "regexifiedArray": regexedArray,
            "wordsArray": wArray,
            // "wordsArray": regexedArray,
            "hasStrongsNum": hasStrongs,
            "moreThanOneWord": wArray.length > 1,
            "searchStrongsNumArray": searchStrongsNumArray,
            "non_StrongsNumArray": non_StrongsNumArray,
        }
    }
    searchPreviewFixed.scrollTo(0,0);
    bringRefNavForwardOnFocus();
    // do_StrongAnalysisOnly ? general_eKeyDown = null : null;
    if (findAnything&&!compareDiv){forwordsearch_fixed.focus()}//If search was found and it is not for compareWindow
    else if(!findAnything){wordsearch_fixed.select();}
    return findAnything
}
let verseArray;
function findArraysContainingString(arr, string) {
    return arr.filter(innerArr =>
        innerArr.some(item =>
            Array.isArray(item)
                ? findArraysContainingString(item, string).length > 0
                : typeof item === "string" && string.test(item)
        )
    );
}
function appendResultCountToHeader(hideResult=false, resultWindow='searchPreviewFixed',value2searchfor) {
    let chpHeadingInFixedSearch = document.querySelectorAll(`#${resultWindow} .chptheading`);
    let totalVerseReturned = 0;
    let numOfVersesInAllSearchedBooks = 0;
    chpHeadingInFixedSearch.forEach(h2 => {
        let verseUnderBook = h2.nextElementSibling;
        if(verseUnderBook.matches('details')){
            detailsUnderBook = verseUnderBook;
            const numOfVersesPerBook = Number(detailsUnderBook.getAttribute('vrscount'));
            const s = numOfVersesPerBook>1 ? 's' : '';
            const divider = h2.innerText.match(/[a-zA-Z]\s*::\d/) ? ':: ' : ' :: ';//Has chapters or not
            h2.innerText = h2.innerText + divider + numOfVersesPerBook + 'v' + s;
            numOfVersesInAllSearchedBooks+=numOfVersesPerBook;
            verseUnderBook = verseUnderBook.nextElementSibling;
        }
        /* ************************** */
        /* dhid -- descendants hidden */
        /* ************************** */
        if (hideResult) {
            detailsUnderBook.classList.add('displaynone')
            if (verseUnderBook && verseUnderBook.classList.contains('displaynone')) {h2.classList.remove('dhid');}
            else {h2.classList.add('dhid');}
        }
        let verseCount = 0;
        while (verseUnderBook && verseUnderBook.classList.contains('verse')) {
            if (hideResult) {verseUnderBook.classList.toggle('displaynone');}
            verseCount++;
            totalVerseReturned++;
            verseUnderBook = verseUnderBook.nextElementSibling;
        }
        // So that ENTER and SPACEBAR will click it as if it was a BUTTON
        h2.addEventListener('keydown', (e)=>{
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent default behavior (e.g., scrolling)
                if (e.ctrlKey) {
                    showVersesUnderH2({target:h2,type:'contextmenu'})
                } else {
                    h2.click(); // Trigger the click event
                }
            }
        });            
        
        // h2.innerText = h2.innerText + ' - ' + verseCount;//“”
    });
    let bbksg = document.getElementById(sourceOfranges).value.trim();
    //Capitalize first letter in each book in book range
    bbksg = bbksg.replace(/\b(\d*)(\w)/g, (match, group1, group2) => group1 + group2.toUpperCase()).replace(/\bi+\b/gi, match => match.toUpperCase());
    numOfVersesInAllSearchedBooks = numOfVersesInAllSearchedBooks ? numOfVersesInAllSearchedBooks : totalOccurencesInSearch;
    totalReport = `<b>${numOfVersesInAllSearchedBooks} ${bversionName}</b> verse${numOfVersesInAllSearchedBooks>1 ? 's':''} contain <b>${value2searchfor.replace(/([ghGH][0-9]+)/g, '<span class="$1 strnum vnotestrnum" strnum="$1">$1</span>')}</b> in <b>${bbksg!='' ? bbksg : 'Gen-Rev'}</b>` ;
    // if (strongsAnalysisOnly.checked) {totalReport='';}
    if(resultWindow=='searchPreviewFixed'){totalfound.innerHTML = totalReport;}
    else {
        const totalReportSpan = document.createElement('SPAN');
        totalReportSpan.innerHTML = totalReport;
        totalReportSpan.classList.add('totalfound');
        document.querySelector(`#${resultWindow}`).prepend(totalReportSpan)
    }
}

function showVersesUnderH2(e) {
    let h2 = !e.target.closest('.strnum')?e.target.closest('.chptheading') : null;
    if (!h2) {return}
    const h2Parent = h2.parentElement;
    (currentH2parent = document.querySelector('.currentH2parent'))?currentH2parent.classList.remove('currentH2parent'):null;//remove previous '.currentH2parent'
    h2Parent.classList.add('currentH2parent');//make current h2parent the '.currentH2parent'
    let searchResultWindow = e.target.closest('.scriptureCompare_columns, #searchPreviewFixed, .compare_verses .compare_search, .compare_verses .notfromsearch');
    //add class indicating h2 is currently clicked
    const prevClickedH2 = h2Parent.querySelector('.clickedH2');
    prevClickedH2?prevClickedH2.classList.remove('clickedH2'):null;
    h2.classList.add('clickedH2');
    const parentOfResultWindow = searchResultWindow.parentElement;
    if(searchResultWindow!=h2Parent){h2Parent.classList.add('h2parent')}
    
    const selector = ['.scriptureCompare_columns', '#searchPreviewFixed','.compare_verses .compare_search, .compare_verses .notfromsearch'].find(selector => searchResultWindow.matches(selector));
    
    if(e.type=='contextmenu'){
        // Hide every verse except for the clicked verses that are directly under the clicked H2

        let firstH2Indx = Array.from(h2Parent.children).indexOf(h2Parent.querySelector('h2.chptheading,h2'));//index of first H2 among the children of its h2's parent. Elements before it, if any, should not be affected by the following code

        if(h2.matches('.dhid')){
            // if its own siblings are hidden,
            if(e.ctrlKey){// If control key is NOT pressed along with right click
                // show all siblings of all h2s (including its own) in its parent
                parentOfResultWindow.querySelectorAll(`.currentH2parent > *`).forEach((x,i)=>{
                    if(i >= firstH2Indx){
                        x.matches(`.currentH2parent > :not(.chptheading):not(.donothide)`)?x.classList.remove('displaynone'):
                        (x.matches('.dhid')?x.classList.remove('dhid'):null);
                    }
                });
            }
            else {// If control key is pressed along with right click
                // show only its own siblings
                // hide all siblings of all other h2s in its parent
                hideSiblingsOfOthersButShowOwnSiblings();
            }
        }
        else {
            // if its own siblings are showing,
            // hide siblings of all its h2s in its parent
            // but don't hide its own siblings
            let anyOtherOpenH2 = parentOfResultWindow.querySelector(`.currentH2parent > .chptheading:not(.dhid):not(.clickedH2)`);
            if (anyOtherOpenH2) {
                hideSiblingsOfOthersButShowOwnSiblings();
            } else {// hide all siblings
                parentOfResultWindow.querySelectorAll(`.currentH2parent > *`).forEach((x,i)=>{
                    if(i >= firstH2Indx){
                        x.matches(`.currentH2parent > :not(.chptheading):not(.donothide)`)?x.classList.add('displaynone'):
                        (x.matches(':not(.dhid)')?x.classList.add('dhid'):null);
                    }
                })
            }
            // hideH2siblings(h2,'hide');//unhide its own siblings
        }
        setTimeout(()=>{h2.scrollIntoView({behavior:"smooth", inline: "nearest"})},10);
        // searchResultWindow.scrollTop = spos; 
        // h2.classList.add('lastOpened_H2');
        return
        
        function hideSiblingsOfOthersButShowOwnSiblings() {
            let affectSiblings=true;
            parentOfResultWindow.querySelectorAll(`.currentH2parent > *`).forEach((x,i)=>{
                if(i >= firstH2Indx){
                    x.matches(`.currentH2parent > .chptheading`)?((x==h2)?affectSiblings=false:affectSiblings=true):null;//skip siblings of h2
                    if(affectSiblings){// hide siblings of others
                        x.matches(`.currentH2parent > :not(.chptheading):not(.donothide)`)?x.classList.add('displaynone'):(x.matches('.chptheading')?x.classList.add('dhid'):null);
                    } else {// Unhide siblings of h2
                        x.matches(`.currentH2parent > :not(.chptheading):not(.donothide)`)?x.classList.remove('displaynone'):(x.matches('.chptheading')?x.classList.remove('dhid'):null);
                    }
                }
            });
        }
    }
    hideH2siblings(h2); //This is to compensate for the shifting out of view of the search parmeter section
                
    function hideH2siblings(h2,hide) {
        let verseUnderBook = h2.nextElementSibling;
        if(hide){
            h2.classList.add('dhid');
            while (verseUnderBook && verseUnderBook.classList.contains('verse')) {
                verseUnderBook.classList.add('displaynone');
                verseUnderBook = verseUnderBook.nextElementSibling;
            }
        }
        else {
            if(verseUnderBook.classList.contains('displaynone')){h2.classList.remove('dhid');}
            else{h2.classList.add('dhid');}
            while(verseUnderBook && verseUnderBook.classList.contains('verse')) {
                verseUnderBook.classList.toggle('displaynone');
                verseUnderBook = verseUnderBook.nextElementSibling;
            }
        }
        if(!h2.classList.contains('dhid')){
            setTimeout(()=>{h2.scrollIntoView({behavior:"smooth",block: "start", inline: "nearest"})},10);
            // searchResultWindow.scrollTop = spos; 
        }
        searchparametertitlebar.scrollIntoView();
    }
}
/* ******************************************** */
/* On Checking and Unchecking "Show all verses" */
/* ******************************************** */
showreturnedverses.addEventListener('change', function () {
    let versesInFixed = searchPreviewFixed.querySelectorAll('.verse:not(details.resultsummary)');
    let chpHeadingInFixedSearch = document.querySelectorAll('#searchPreviewFixed .chptheading');
    if (this.checked) {
        chpHeadingInFixedSearch.forEach(h2=>{h2.classList.remove('dhid');})
        versesInFixed.forEach(elm=>{elm.classList.remove('displaynone')});
        setItemInLocalStorage('showVersesInSearch', 'yes')
    }
    else {
        chpHeadingInFixedSearch.forEach(h2=>{h2.classList.add('dhid');})
        versesInFixed.forEach(elm=>{elm.classList.add('displaynone')});
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
async function setBiblebooksValue(e,option,justChangeValues=false) {
    if (e.type=='keydown'&&e.key!='Enter'&&e.key!=' ') {return}
    e.preventDefault();
    
    if (option=='currentBookName') {
        if (currentBookName==undefined) {
            const bkopt = document.querySelectorAll('option.ref_hlt')[0];
            currentBookName = bkopt ? bkopt.getAttribute('bookname') : undefined;
            if(!currentBookName){
                const hcb = await getHighestVisibleH2();
                currentBookName = hcb.highestChptBody.getAttribute('bookname');
            }
        }
        option=currentBookName;
    }
    //Run wordsearch if an option is clicked twice
    if (!justChangeValues) {
        const ae = document.activeElement.closest('.biblebooksgroup_dropdown_content');
        ae.classList.add('displaynone');
        ae.classList.add('displaynone');
        const aeParent = ae.closest('.biblebooksgroup_inputndropdown');
        aeParent.querySelector('input').focus();
        aeParent.querySelector('.showhidebookgrps').classList.add('showbksdrpdown');
    }
    if ((e.type=='mouseup' && e.button==2)||(e.type == 'keydown' && (e.key == 'Enter' || e.key == ' ') && e.ctrlKey)) {
        biblebooksgroup_1.value.trim()!='' ? (option = `; ${option.replace(/\s*,*;*\s*$/g,'')}`) : null;
        biblebooksgroup_1.value += option;
        biblebooksgroup_2.value += option;
        biblebooksgroup_3.value += option;
        biblebooksgroup_fixed.value += option;
    } else {
        biblebooksgroup_1.value = option;
        biblebooksgroup_2.value = option;
        biblebooksgroup_3.value = option;
        biblebooksgroup_fixed.value = option;
    }
}
function listOfBooksToSearchIn(bkGrp){
    // setBiblebooksValue(bkGrp.trim(),true);
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
        'ap' : bible.Data.apBooks,
        'apocrypha' : bible.Data.apBooks,
        'pentateuch' : findBooksFromA2B('Genesis','Deuteronomy'),
        'moses' : findBooksFromA2B('Genesis','Deuteronomy'),
        'history' : findBooksFromA2B('Joshua','Esther'),
        'wisdom' : findBooksFromA2B('Job','Song of Solomon'),
        'majorprophets' : findBooksFromA2B('Isaiah','Daniel'),
        'minorprophets' : findBooksFromA2B('Hosea','Malachi'),
        'gospels' : findBooksFromA2B('Matthew','John'),
        'nt_narrative' : findBooksFromA2B('Matthew','Acts'),
        'paul' : findBooksFromA2B('Romans','Hebrews'),
        'pauline' : findBooksFromA2B('Romans','Hebrews'),
        'peter' : findBooksFromA2B('I Peter','II Peter'),
        'john' : findBooksFromA2B('John').concat(findBooksFromA2B('I John','III John')).concat(findBooksFromA2B('Revelation')),
        'generalepistles' : findBooksFromA2B('James','Jude'),
        'revelation' : findBooksFromA2B('Revelation'),
        'currentbk' : findBooksFromA2B(`${currentBookName}`)
    }
    if (!bkGrp||bkGrp.trim()=='') {booksToSearchIn = bible.Data.allBooks;}//Search all books if no book is supplied
    else if (typeof bkGrp === 'string' || bkGrp instanceof String){
        bkGrp=bkGrp.replace(/\s*(,|-)\s*/g, '$1')
        const bkGrpRgx = new RegExp(`\\b${bkGrp}\\b`,'ig')
        if (!bible.Data.books.toString().match(bkGrpRgx)) {// To avoid, e.g., 'gen', intended for Genesis, matching ('gen' in) "[gen]eralepistles"
            for (const key in generalBibleBooksGroups) {// for partial match of name
                if (key.startsWith(bkGrp)) {
                    bkGrp=key;
                    break
                }
            }
        }
        booksToSearchIn = generalBibleBooksGroups[bkGrp.toLowerCase()];
        if(!booksToSearchIn){ //If it is not one of the standard bible section names in generalBibleBooksGroups above, then it is a (or they are) regular book names or abbreviations
            booksToSearchIn = [];
            let commaSeprated = [bkGrp];
            if(bkGrp.match(/,|;/)){commaSeprated = bkGrp.split(/,|;/)}
            //Loop through commaSeprated array
            commaSeprated.forEach(csbk => {
                csbk = csbk.trim();
                bible.Data.books.findIndex
                // Check if it is a range of books
                if(csbk.match(/[a-zA-Z]\s*-\s*[iI0-9]*\s*[a-zA-Z]/)){
                    let csbkRange = csbk.toUpperCase().split('-');
                    //Get full name (in case it is an abbreviation)
                    let bk1 = bible.Data.allBooks[bible.Data.books.findIndex(x => {if(x.includes(csbkRange[0].trim())){return x}})];
                    let bk2 = bible.Data.allBooks[bible.Data.books.findIndex(x => {if(x.includes(csbkRange[1].trim())){return x}})];
                    bible.Data.books.forEach((x,i) => {
                        if(x.includes(csbkRange[0].trim())){bk1 = bible.Data.allBooks[i]}
                        else if(x.includes(csbkRange[1].trim())){bk2 = bible.Data.allBooks[i]}
                    })
                    let bksrange = findBooksFromA2B(bk1,bk2);
                    // Try
                    if(!bksrange){
                        bksrange = findBooksFromA2B(bk2,bk1);
                        if(!bksrange){
                            alert('Faulty Range of Books To Search In.');
                            return
                        }
                        bksrange = bksrange.reverse();
                    }
                    bksrange.forEach(bx=>{booksToSearchIn.push(bx)})
                }
                // If it is a single book
                else {                    
                    // Check if it is a book and chapter(s)
                    if(csbk.match(/[iI0-9]*\s*[a-zA-Z]+\s*[0-9]+/)){
                        const srch_bkNm = csbk.match(/[iI0-9]*\s*[a-zA-Z]+/)[0];
                        const bkChptObj = {};
                        const bk = bible.Data.allBooks[bible.Data.books.findIndex(x => {if(x.includes(srch_bkNm.toUpperCase().trim())){return x}})];//add full bkname to object
                        if(!bk){alert('Faulty Range of Books To Search In.');return}
                        bkChptObj.bk = bk;
                        bkChptObj.chp=[];//chapter numbers under book will be stored in an array
                        csbk = csbk.replace(/[iI0-9]*\s*[a-zA-Z]+\s*/,'').trim();
                        if(csbk.match(/^\d+$/)){
                            bkChptObj.chp.push(csbk);//add chapter number to object
                        }
                        else if(csbk.match(/^\d+\s*-\s*\d+$/)){
                            srch_chptNmRange = csbk.match(/^\d+\s*-\s*\d+$/)[0].split(/\s*-\s*/);
                            bkChptObj.chp = populateRange(Number(srch_chptNmRange[0]),Number(srch_chptNmRange[1]))
                        }
                        booksToSearchIn.push(bkChptObj);//Update array of books (and chapters) to search in
                    }
                    // Check if it is just a number, i.e., a chapter
                    else if(csbk.match(/^\d+$/)){
                        srch_chptNm = csbk.match(/^\d+$/)[0];
                        //check previous value if it is an object
                        let lastValue;
                        if (booksToSearchIn.length>0) {
                            lastValue = booksToSearchIn[booksToSearchIn.length-1];
                            if(isObject(lastValue)){
                                lastValue.chp.push(srch_chptNm)
                            } else {
                                // If no previous book, make it the current bible book
                                const bkChptObj = {};
                                bkChptObj.bk=currentBookName;
                                bkChptObj.chp=[srch_chptNm]
                                booksToSearchIn.push(bkChptObj);
                            }
                        }
                    }
                    // Check if it is a number range, i.e., a chapter range
                    else if(csbk.match(/^\d+\s*-\s*\d+$/)){
                        srch_chptNmRange = csbk.match(/^\d+\s*-\s*\d+$/)[0].split(/\s*-\s*/);//unpopulated range
                        //check previous value if it is an object
                        const lastValue = booksToSearchIn[booksToSearchIn.length-1];
                        srch_chptNmRange = populateRange(Number(srch_chptNmRange[0]),Number(srch_chptNmRange[1]));//populated range
                        if (booksToSearchIn.length>0){
                            if(isObject(lastValue)){
                                srch_chptNmRange.forEach(c=>{lastValue.chp.push(c)})
                            } else {
                                // If no previous book, make it the current bible book
                                const bkChptObj = {};
                                bkChptObj.bk=currentBookName;
                                bkChptObj.chp=srch_chptNmRange
                                booksToSearchIn.push(bkChptObj);
                            }
                        }
                    }
                    else {
                        booksToSearchIn.push(bible.Data.allBooks[bible.Data.books.findIndex(x => {if(x.includes(csbk.toUpperCase())){return x}})])
                    }
                }
            });
        }
    } else if (Array.isArray(bkGrp)) {booksToSearchIn = bkGrp}
    if(!booksToSearchIn || booksToSearchIn.length == 0 || (booksToSearchIn.length == 1 && booksToSearchIn[0]==undefined)){
        showAlert(`<p>Please review the book range to search in.</p>‘<b style="font-size:2em;">${bkGrp}</b>’<p>...is not acceptable.</p>`);
        return null;
    }
    return booksToSearchIn;
}
function populateRange(start, end) {
    const result = [];
    if(start==end){return [start]}//if start and end are the same
    if(start < end){//Range is for low to high
        for (let i = start; i <= end; i++) {result.push(i);}
    }
    else if(end < start){//Range is for high to low
        for (let i = start; i >= end; i--) {result.push(i);}
    }
    return result;
}
function isObject(objx) {return typeof objx === "object" && objx !== null && !Array.isArray(objx)}
/* CLEAR THE SEARCH WINDOW IF IT HAS BEEN INACTIVE AFTER 1min */
function clearSearchWindow(x=true){
    if(!keepsearchopen.checked){
        searchPreviewFixed.innerHTML='';
        x?hideRefNav('hide', searchPreviewWindowFixed):null;
        searchsettings.classList.remove('active_button')
        totalfound.innerHTML='Search window was cleared';
    }
}
function toggleSearchWindow(event,hideORshow) {
    if(event && (event.ctrlKey || event.button==2) && !event.shiftKey){
        searchPreviewFixed.innerHTML='';
        searchsettings.classList.remove('active_button')
        totalfound.innerHTML='Search window was cleared';
    }
    hideRefNav(hideORshow, searchPreviewWindowFixed);
}

async function searchForHighlightedText(e){
    // (CTRL + F) && (CTRL + SHIFT + F)
    if(e.ctrlKey && e.code=='KeyF'){
        // CTRL + F (without Shift Key)
        if (!e.shiftKey) {await showTopBar_refInput_OR_search('search'); wordsearch.select(); return}
        // CTRL + SHIFT + F
        tempRefdiv_un_Select();
        hideRefNav(null, searchPreviewWindowFixed);
        const srchSel=window.getSelection().toString();
        if(srchSel.trim()!=''){
            wordsearch.value=srchSel;
            wordsearch_fixed.value=srchSel;
            wordsearch.select();
            bubbleInputFillEvent();
        } else {wordsearch.select();}
    }
}
document.addEventListener("keydown",searchForHighlightedText);
keepsearchopen.addEventListener('change', function (e) {
    if (e.target.checked) {
        localStorage.setItem('keepsearchopen',true)
    } else {
        localStorage.setItem('keepsearchopen',false)
    }
})

// To show books ranges on focusin search div
// [titlebar_show_searchsettings,forwordsearch]
let titlebar_show_searchsettings = top_horizontal_bar.querySelector('#titlebar_show_searchsettings');
[titlebar_show_searchsettings].forEach(btn => {
    btn.addEventListener('click',(e)=>{
        toggleClassAndActiveButton(titlebarsearchparameters, 'slideup', btn);
        biblebooksgroup_inputndropdown.classList.add('displaynone');
        titlebarsearchparameters.querySelector('button').focus();
        modifyRefNavChildrenHeight();
    })
});
// Hide #biblebooksgroup_inputndropdown on searchdiv loosing focus
// use set interval to find out if focus is lost
wordsearch.addEventListener("focusin", (e) => {
    if(titlebarsearchparameters.matches('.slideup')){
        biblebooksgroup_inputndropdown.classList.remove("displaynone");
        let intervalId = setInterval(() => {
            // Hide #biblebooksgroup_inputndropdown on searchdiv loosing focus
            if (searchdiv != document.activeElement && !searchdiv.contains(document.activeElement)) {
                biblebooksgroup_inputndropdown.classList.add("displaynone");
                showhidebookgrps_1.parentElement.querySelector('.biblebooksgroup_dropdown_content').classList.add('displaynone');
                showhidebookgrps_1.classList.add('showbksdrpdown');
                clearInterval(intervalId);
            }
        }, 100);
    }
});
// biblebooksgroup_myDropdown_3    
function hideOnFocusOut(el) {
    let bkrngselectdrpdwn = el.matches('.biblebooksgroup_dropdown_content:not(.displaynone)');
    let btn;
    if(!bkrngselectdrpdwn){return}else{btn = el.parentElement.querySelector('.showhidebookgrps');}
    let intervalId = setInterval(() => {
        // Hide EL on loosing focus
        if (btn != document.activeElement && el != document.activeElement && !btn.contains(document.activeElement) && !el.contains(document.activeElement)) {
            el.classList.add("displaynone");
            btn.classList.add('showbksdrpdown');
            clearInterval(intervalId);
        }
    }, 100);
}
// Books Ranges Input Element eventlistners
const bbksgrps=[biblebooksgroup_1,biblebooksgroup_2,biblebooksgroup_3,biblebooksgroup_fixed]
bbksgrps.forEach((bbksg,i) => {
    bbksg.addEventListener("keypress", async function (e) {
        if (e.key === "Enter") {
            // If in compare window, run the most recently active .verses_input
            if (bbksg==biblebooksgroup_3) {
                if(!mrcib){mrcib=scriptureCompareWindow.querySelector('[onclick="fill_Compareverse(this)"]')};
                let mrcibInput = mrcib.parentElement.querySelector('input.verses_input');
                mrcibInput.select()//Go to verses_input if it is empty
                // if(mrcibInput.value.trim()!=''){fill_Compareverse(mrcib)}// for some reason this is not neccesary
            }
            //If wordsearch has text in it to search for, runWordSearch() on it on press of enter key
            else if(wordsearch.value.trim()!=''){
                biblebooksgroup_inputndropdown.classList.add('displaynone');
                await runWordSearch();
            }
            //If wordsearch has no text in it to search for, focus on it on press of enter key
            else {
                let searchParent = bbksg.closest('#top_horizontal_bar'); 
                let wordsearchinput = searchParent ? searchParent.querySelector('.searchinput') : bbksg.closest('#searchparameters').querySelector('.searchinput');
                wordsearchinput.focus();
            }
            e.preventDefault();
        }
    });
    //So that the compareWindows search ranges input does not change other searchranges. Nevertheless, it can be changed by others
    if (bbksg!=biblebooksgroup_3) {
        bbksg.addEventListener('keyup', (e)=>{bbksgrps.forEach((bi,k) => {if (k!=i) {bi.value=bbksg.value;}})});
    }
});
// Show books groups on click of their respective buttons
let runtimer;
[showhidebookgrps_1,showhidebookgrps_2,showhidebookgrps_3,showhidebookgrpsFixed].forEach((shwHbkgrps_btn,i) => {
    // clicking or focusing on the button toggle dropdown
    ['click','focusin'].forEach(listener => {
        shwHbkgrps_btn.addEventListener(listener, (e)=>{
            const bgrpdrpdwn = shwHbkgrps_btn.parentElement.querySelector('.biblebooksgroup_dropdown_content');
            // Click also focuses
            if (listener === 'click') {
                clearTimeout(runtimer);
                bgrpdrpdwn.classList.toggle('displaynone');
                shwHbkgrps_btn.classList.toggle('showbksdrpdown');
                if(i>0){
                    hideOnFocusOut(bgrpdrpdwn)
                }
            }
            if (listener === 'focusin') {
                runtimer = setTimeout(() => {
                    bgrpdrpdwn.classList.toggle('displaynone');
                    shwHbkgrps_btn.classList.toggle('showbksdrpdown');
                    if(i>0){
                        hideOnFocusOut(bgrpdrpdwn)
                    }
                }, 300);
            }
            e.preventDefault();
        });
    });
});
document.querySelectorAll('.biblebooksgroup_inputndropdown').forEach(el=>{el.addEventListener('keydown', bookRangesArrowNavigation)})
function bookRangesArrowNavigation(e) {
    let et=e.target;
    let holder = et.closest('.biblebooksgroup_inputndropdown');
    let allBtns=Array.from(holder.querySelectorAll('input, button'));
    let indx;
    let key_code = e.which || e.keyCode;
    switch (key_code) {
        case 38: //Up arrow key
            indx = allBtns.indexOf(et);
            if(indx!=0){allBtns[indx-1].focus();}
            break;
        case 40: //down arrow key
            indx = allBtns.indexOf(et);
            if(indx!=allBtns.length-1){allBtns[indx+1].focus();}
            break;
    }
}

/* ****************************************************************** */
/* ****************************************************************** */
function add_verseUpDownNavigationByKeys(e) {
    let etargetVerse;
    if (e.target.matches('#searchPreviewFixed span.verse:not(#context_menu .verse), #scriptureCompare_columns_holder .compare_search span.verse:not(#context_menu .verse)')) {
        etargetVerse = e.target;
    }
    else if (e.target.matches('#searchPreviewFixed span.verse:not(#context_menu .verse) *, #scriptureCompare_columns_holder .compare_search span.verse:not(#context_menu .verse) *')) {
        etargetVerse = e.target.closest('.verse');
    }
    else if (e.target.matches('#scriptureCompare_columns_holder .compare_verses .notfromsearch')) {
        etargetVerse = e.target;
    }
    else if (e.target.matches('#scriptureCompare_columns_holder .compare_verses .notfromsearch span.verse:not(#context_menu .verse), #scriptureCompare_columns_holder .compare_verses .notfromsearch span.verse:not(#context_menu .verse) *')) {
        etargetVerse = e.target.closest('.compare_verses .notfromsearch');
    }
    else {return}
    if(keydownready=document.querySelector('.keydownready')){keydownready.classList.remove('keydownready');}//remove keydownready class from any previously element having the keydownready class
    etargetVerse.classList.add('keydownready')
    document.addEventListener('keydown', verseUpDownNavigationByKeys);
}

document.addEventListener('mouseover', add_verseUpDownNavigationByKeys);
// document.addEventListener('mouseout', remove_verseUpDownNavigationByKeys);
document.addEventListener('mousedown', add_verseUpDownNavigationByKeys);
// document.addEventListener('mousedown', remove_verseUpDownNavigationByKeys);
function remove_verseUpDownNavigationByKeys(e) {
    if(keydownready=document.querySelector('.keydownready')){keydownready.classList.remove('keydownready');}
    document.removeEventListener('keydown', verseUpDownNavigationByKeys);
}
function verseUpDownNavigationByKeys(e){
    //remove_verseUpDownNavigationByKeys(e);
    let targetVerseInsearchWindow;
    if(keydownready = document.querySelector('.verse.keydownready')){targetVerseInsearchWindow = [keydownready];}
    else if((keydownready = document.querySelectorAll('.compare_verses .notfromsearch.keydownready .verse:not(#context_menu .verse):not(.verse.verse_compare)')) && keydownready.length>0){targetVerseInsearchWindow = keydownready;}
    // else if (document.activeElement.closest('#context_menu,'))
    else {return}
    
    let key_code = e.key || e.keyCode || e.which;
    if(document.activeElement.closest('[contenteditable="true"]')){return}
    switch (key_code) {
        case (e.altKey && ('ArrowUp'||38)) || (!e.ctrlKey && !document.activeElement.closest('input,[contenteditable="true"]') && '-'): //Up arrow key
            cmenu_goToPrevOrNextVerse('prev', targetVerseInsearchWindow);
            e.preventDefault();
            break;
        case (e.altKey && ('ArrowDown'||40)) || (!e.ctrlKey && !document.activeElement.closest('input,[contenteditable="true"]') && '+'): //down arrow key
            cmenu_goToPrevOrNextVerse('next', targetVerseInsearchWindow);
            e.preventDefault();
            break;
    }
}

function general_eKeyDownListener(e) {
    general_eKeyDown = e;
    general_eKeyDown_key = e.key;
    document.addEventListener('keyup', inner_keyUpListen);
    function inner_keyUpListen(ev){
        setTimeout(() => {
            ev.key == general_eKeyDown_key ? (
                general_eKeyDown = null,
                document.removeEventListener('keyup', inner_keyUpListen),
                document.removeEventListener('keydown', general_eKeyDownListener),
                document.addEventListener('keydown', general_eKeyDownListener) // Re-add keydown listener
            ) : null;
        }, 10);
    }
}

searchPreviewFixed.addEventListener('contextmenu', openCloseAllDetailsInParent);
searchPreviewFixed.addEventListener('click', showVersesUnderH2);
searchPreviewFixed.addEventListener('contextmenu', showVersesUnderH2);
/* Make Search Window Draggable */
enableInteractJSonEl(searchPreviewWindowFixed.querySelector('#closebtn_searchPreviewWindowFixed'), searchPreviewWindowFixed)
document.addEventListener('keydown',general_eKeyDownListener);
let nearbyVersesSelect = document.getElementsByClassName('nearbyVerses');
function updateNearbyVersesSelect(n) {Array.from(nearbyVersesSelect).forEach(nbvs => {nbvs.value = n;});}