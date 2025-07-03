document.addEventListener('keydown', function (event) {
    if (event.ctrlKey /*  && event.shiftKey */ && event.code === 'KeyG') {
        event.preventDefault();
        //To show reference input in case top_horizontal_bar_buttons is hidden
        showTopBar_refInput_OR_search('ref');
        refdiv.querySelector('input').select();
    }
    smoothScrollFromVerseToVerse(event)
});
async function showTopBar_refInput_OR_search(refORsearch = 'ref') {
    /* *** For when TopBar is hidden *** *** *** **** */
    /* *** To Show RefInput, Search and BibleVersions */
    if (top_horizontal_bar_buttons.matches('.sld_up')) {
        const refORsearchOBJ = {
            'ref': [refdiv, refhistoryBtns],
            'search': [searchdiv],
            'bibleVersion': [bibleversions_btns]
        };
        const refdiv_showing_temp = refORsearchOBJ[refORsearch];

        // Hide if showing (create toggle effect)
        if (refdiv_showing_temp[0].matches('.refdiv_showing_temp')) {
            tempRefdiv_un_Select();
            return
        }
        tempRefdiv_un_Select(); //hide any previously showing .refdiv_showing_temp
        /* ****** ***** ** *************************** ** */
        /* Modify style of #top_horizontal_bar_buttons to allow #refdiv,#refhistoryBtns and #searchdiv show. */
        /* ****** ***** ** *************************** ** */
        const prvStyle = top_horizontal_bar_buttons.getAttribute('style');
        let tempStyle = prvStyle.replace(/(?:\/\*\s*)*(opacity\s*:\s*\d(.d+)*)(\s*\*\/)*/g, '/*$1*/');
        tempStyle = tempStyle.replace(/(?:\/\*\s*)*(display\s*:\s*\w+(\s*!\s*important\s*\s*)*)(\s*\*\/)*/g, '/*$1*/');
        top_horizontal_bar_buttons.setAttribute('style', tempStyle);

        /* **** **** ** ********* ** ******** ***** ********* ******** */
        /* They will be displayed by changing their transform location */
        /* **** **** ** ********* ** ******** ***** ********* ******** */
        setTimeout(() => {
            refdiv_showing_temp.forEach(rdst => {
                rdst.classList.add('refdiv_showing_temp');
            });
        }, 10);

        if (windowWidthWasResized) {
            const new_topbar_height = Math.round(parseFloat(window.getComputedStyle(top_horizontal_bar_buttons).height));
            documentROOT.style.setProperty('--topbar-height', new_topbar_height + 'px');
        }
        document.addEventListener('mousedown', undo_showTopBar_refInput_OR_search);
        return true //it displayed it
    }
}
let _t;

function undo_showTopBar_refInput_OR_search(e) {
    if (mousedownOnRefnavOrMain = e.target.closest('#refnav,#main')) {
        document.addEventListener('mouseover', mouseover_showTopBar_refInput_OR_search);
        // const t = setInterval(() => {
        _t = setTimeout(() => {
            !document.activeElement.closest('#refdiv,#refhistoryBtns,#searchdiv.refdiv_showing_temp,#bibleversions_btns') ? tempRefdiv_un_Select(_t) : null;
        }, 3000);

        function mouseover_showTopBar_refInput_OR_search(ev) {
            if (ev.target.closest('#refdiv,#refhistoryBtns,#searchdiv.refdiv_showing_temp,#bibleversions_btns')) {
                document.removeEventListener('mouseover', mouseover_showTopBar_refInput_OR_search);
                clearInterval(_t);
            }
        }
    }
}

function tempRefdiv_un_Select(t = _t) {
    const refdiv_showing_temp = document.querySelectorAll('.refdiv_showing_temp');
    if (refdiv_showing_temp.length > 0) {
        refdiv_showing_temp.forEach(rdst => {
            rdst.classList.remove('refdiv_showing_temp');
        });
        const prvStyle = top_horizontal_bar_buttons.getAttribute('style');
        let tempStyle = prvStyle.replace(/\/\*\s*(opacity\s*:\s*\d(.d+)*)\s*\*\//g, '$1')
        tempStyle = tempStyle.replace(/\/\*\s*(display\s*:\s*\w+(\s*!\s*important\s*\s*)*)\s*\*\//g, '$1');
        top_horizontal_bar_buttons.setAttribute('style', tempStyle);
        if (t) {
            clearInterval(t)
        }
        document.removeEventListener('mousedown', undo_showTopBar_refInput_OR_search);
        return true
    }
    document.removeEventListener('mousedown', undo_showTopBar_refInput_OR_search);
    return false
}
let ref_Abrev;
ref_Abrev = bible.Data.books;
//On enter go to reference
document.addEventListener("keypress", enterKeyFunc);

function enterKeyFunc(event) {
    if (event.key === "Enter") {
        if (document.activeElement.matches('.reference')) {
            let focusElm = document.activeElement;
            if (focusElm.matches('.homepage')) {gotoRef(focusElm.value)}
            else {getCrossReference(focusElm)}
            event.preventDefault();
        } else if (document.activeElement.matches('.verses_input')) {
            fill_Compareverse(document.activeElement)
        }
    }
}
function changeSingleStringToTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}
let reset_dontGetLastVerse, goingToRef=false;
async function gotoRef() {

    // tempRefdiv_un_Select();
    let from_refdiv;
    if (arguments[0] instanceof Event) {
        goingToRef = true;
        const e = arguments[0];
        ref_to_get = arguments[1];
        shouldBrowserHistoryBeUpdated = [undefined, true].includes(arguments[2]) ? true : false;
        let et = e.target;
        if (e.button == 0) { // Go to the verse if click is leftClick
            et.addEventListener('mouseup', gotoRef_Inner);
            let t = setTimeout(() => {
                et.removeEventListener('mouseup', gotoRef_Inner), endTimer()
            }, 500); //mouseup will only run gotoRef() within 100ms 
            et.addEventListener('mousemove', endTimer); //mousemove will cancel gotoRef() 
            function endTimer() {
                clearTimeout(t);
                et.removeEventListener('mouseup', gotoRef_Inner);
                et.removeEventListener('mousemove', endTimer);
            }
        }
    } else { // if there is no e
        goingToRef = true;
        ref_to_get = arguments[0];
        //if there is a second parameter, assign it to 'shouldBrowserHistoryBeUpdated' else default to true
        
        shouldBrowserHistoryBeUpdated = [undefined, true].includes(arguments[1]) ? true : false;
        
        if (arguments[1] == undefined) { //from_refdiv input
            const currentHighestVerse = (await getHighestVisibleH2()).highestVerse.getAttribute('ref');
            updateRefBrowserHistory(currentHighestVerse, true);
        }
        setTimeout(() => {gotoRef_Inner()}, 1); //delayed to prevent rightclicking on strong's number under the rightclicked reference
    }
    
    async function smoothScrollToRef(newRef) {
        goingToRef = true;
        
        let hchpt_H_obj = await getHighestVisibleH2();
        let hchpt_H = hchpt_H_obj.highestChptHeading;
        let hVisible_v = hchpt_H_obj.highestVerse;
        let hChptBody = hchpt_H_obj.highestChptBody;

        let _ref_bkID,_ref_bk,_ref_chpt,_ref_vrs; 

        let currentRef = hchpt_H_obj.highestVerse.querySelector('[ref]').getAttribute('ref');

        function refNums(ref) {
            let {bookID, chapter, verse} = bible.parseReference(ref);
            bookName = bible.Data.bookNamesByLanguage.en[bookID-1];
            let [bkID, bkNm, ch, vr] = [bookID, bookName, chapter, verse];
            [_ref_bkID,_ref_bk,_ref_chpt,_ref_vrs] = [bookID, bookName, chapter, verse];
            return {bkID, bkNm, ch, vr}
        }
        
        let c = refNums(currentRef); //currentRef_STATS
        let n = refNums(newRef); //newRef_STATS
        let jumpFromVerseBeforeOrAfter = 0;

        // new ref comes AFTER current ref
        // go to two preceding verses and then scroll to new ref (scroll downward)
        if ((c.bkID < n.bkID) || ((c.bkID == n.bkID) && c.ch < n.ch)) {
            jumpFromVerseBeforeOrAfter = -1;
        } else if ((n.bkID < c.bkID) || ((c.bkID == n.bkID) && n.ch < c.ch)) {
            jumpFromVerseBeforeOrAfter = 1;
        }
        
        const bkChpIndxs = {
            "bkname": _ref_bk,
            "bk_indx": _ref_bkID-1,
            "chpIndx": _ref_chpt - 1,
            "fullRef": `${_ref_bk} ${_ref_chpt}:${_ref_vrs}`,
            "chptOptionElm": document.querySelector(`[value="bk${_ref_bkID-1}ch${_ref_chpt-1}"]`),
            "vrsIndx": _ref_vrs - 1,
            "bkDOTchpt": _ref_bkID + _ref_chpt*0.1
        };
        
        return jumpFromVerseBeforeOrAfter
    }
    
    async function gotoRef_Inner() {

        let ref_indx, ref_bkname, ref_chp, ref_ver, ref_chpnVer, refDisplay;
        let ref;
        if (ref_to_get) {ref = ref_to_get;}
        else {ref = reference.value;}
        
        ref=ref.replace(/\bI\s/i, '1 ').replace(/\bII\s/i, '2 ').replace(/\bIII\s/i, '3 ').replace(/\bIV\s/i, '4 ').replace(/\bV\s/i, '5 ');// Convert Roman Numerals at start of bookName to numbers
        ref = ref.replace(/[.,:;_]/g, ' ');//convert every none-digit and none-word to space
        ref = ref.replace(/\s+/g, ' ');//ensure every space is a single space
        ref = ref.replace(/\b([1-9])\s+([a-zA-Z]+)/g, '$1$2');//ensure book name is one word, e.g., 1 Sam => 1Sam
        ref = ref.replace(/([a-zA-Z]+)([0-9])/g, '$1 $2');//seperate between book name (letters) and chapter number (numbers)
        ref = ref.replace(/(((1|2|3|4|5)\s*)*(([a-zA-Z]*\s*)+[0-9]*\s+[0-9]*)).*/i, '$1').trim();//remove any artifact after verse number
        let refArrbySpace = ref.split(" ");

        let spaceSepratedRef=refArrbySpace.join(' ');
        if (ref_bknameMatch = spaceSepratedRef.match(/([1-9]*\s*)([a-zA-Z]\s*)+/)) {
            ref_bkname=ref_bknameMatch[0];
            ref_chpnVer=spaceSepratedRef.split(ref_bkname).pop();
            ref_bkname=ref_bkname.trim();
        }
        /* If no bookname */
        else {
            let currentBook = bible_books.querySelector('.ref_hlt');
            ref_bkname = currentBook.getAttribute('bookname');
            ref_chpnVer=spaceSepratedRef.split(ref_bkname).pop();
        }
        
        ref_chp = 1;// default
        ref_ver = 1;// default
        if(ref_chpnVer.trim().length>0){
            let ref_chpnVer_arr=ref_chpnVer.split(' ');
            ref_chp=Number(ref_chpnVer_arr[0].trim());
            if (ref_chpnVer_arr.length>1) {
                ref_ver=Number(ref_chpnVer_arr[1].trim().match(/[1-9][0-9]*/)[0]);
            }
        }
    
        // Find id of Book
        let ref_bkname_reg = new RegExp('^' + ref_bkname, 'i'); // make case insensitive (instead of using bknm.toUpperCase())
        ref_indx =  bible.Data.books.findIndex(x=>{return x.includes(ref_bkname.toUpperCase())});
        ref_indx = ref_indx + 1 ? ref_indx : bible.Data.books.findIndex(x=>{return x.find(y=>{return y.match(ref_bkname_reg)})}); // If No Match For Standard Book Names Abbreviations, Checks For Partial Spelling Match 
        let ref_ = ref_indx + 1 ? bible.Data.books[ref_indx]: null;
        const chptOptionElm = document.querySelector(`[value="bk${ref_indx}ch${ref_chp-1}"]`);
        // if on page already, just scroll to it
        let tempRef = ref.replace(/([^0-9]\s[0-9]+)\s*$/g, '$1:1').replace(/([^0-9]\s[0-9]+)\s+(\d)/g, '$1:$2');
        if (_vmltp = main.querySelector(`.vmultiple[ref="${tempRef}"]`)) {
            let hchpt_H_obj = await getHighestVisibleH2();
            let hchpt_H = hchpt_H_obj.highestChptHeading;
            let hVisible_v = hchpt_H_obj.highestVerse;
            let hChptBody = hchpt_H_obj.highestChptBody;
            
            let allVerses = main.querySelectorAll('.vmultiple[ref]');
            allVerses = Array.from(allVerses);
            // let refIndex = allVerses.findIndex(x => x.getAttribute('ref') == ref);
            let refIndex = allVerses.indexOf(_vmltp);
            let currentHighestVerseIndex = allVerses.indexOf(hVisible_v);
            if(refIndex > currentHighestVerseIndex){//newref is below highest ref
                if(refIndex - currentHighestVerseIndex > 2){
                    let jumpToVerse = allVerses[refIndex - 2];
                    jumpToVerse.scrollIntoView();
                }
            }
            else if(refIndex < currentHighestVerseIndex){//newref is above highest ref
                if(currentHighestVerseIndex - refIndex > 2){
                    let jumpToVerse = allVerses[refIndex + 2];
                    jumpToVerse.scrollIntoView();
                }
            }
            // if(_vmltp.matches('.vmultiple:first-of-type')){
            if(_vmltp == main.querySelector('.vmultiple')){
                _vmltp.closest('.chptverses').previousElementSibling.scrollIntoView({behavior:'smooth'});
            } else {
                _vmltp.scrollIntoView({behavior:'smooth'});
            }
            return
        }
        ref = ref.trim();
        if (ref == '') {return}

        // const chptOptionElm = document.querySelector(`[value="bk${ref_indx}ch${ref_chp-1}"]`);
        
        if (ref_indx+1) {
            ref_bkname = bible.Data.bookNamesByLanguage.en[ref_indx];
            let jumpToID, jumpToVerse;
            // bible.Reference
            if (currentBook != ref_indx) {
                const selected_chapter = document.querySelector(`[value="book_${ref_indx}"]`);
                getBksChptsNum(selected_chapter); // update #bible_chapters in #refnav
                const fullRef = `${ref_bkname} ${ref_chp}:${ref_ver}`;
                
                const bkChpIndxs = {
                    "bkname": ref_bkname,
                    "bk_indx": ref_indx,
                    "chpIndx": ref_chp - 1,
                    fullRef,
                    chptOptionElm,
                    "vrsIndx": ref_ver - 1,
                    "bkDOTchpt": ref_indx + ref_chp*0.1
                };
                                
                let jumpFromVerseBeforeOrAfter = await smoothScrollToRef(fullRef);//Verse to jump to before scrolling to target verse
                jumpToID = await getTextOfChapter(bkChpIndxs, 1, null, jumpFromVerseBeforeOrAfter * 3);
            }
            
            ref_chpnVer = `${ref_chp - 1}.${ref_ver - 1}`;
            let targetVerse = document.getElementById(`_${ref_indx}.${ref_chpnVer}`);
            jumpToVerse = jumpToID ? document.getElementById(`${jumpToID}`) : null;
            jumpToID && jumpToVerse ? jumpToVerse.scrollIntoView() : null;
            clearTimeout(reset_dontGetLastVerse);
            dontGetLastVerse = true;
            reset_dontGetLastVerse = setTimeout(()=>{dontGetLastVerse=false;},100);
            scrollToVerse(targetVerse);
        }
        refDisplay = `${ref_bkname} ${ref_chp}:${ref_ver}`;
        updateRefBrowserHistory(refDisplay, shouldBrowserHistoryBeUpdated);
        setItemInLocalStorage('lastRef', refDisplay);
        reference.value = refDisplay;

        indicateBooknChapterInNav(bible_books.querySelector(`[bookname="${ref_bkname}"`), chptOptionElm);
    }
    goingToRef = false;
    return true
}

// TO SHOW BIBLE_NAV ON CLICK OF REFERENCE INPUT
if (document.body.matches('#homepage')) {
    reference.addEventListener('click', showBibleNav)
}

function showBibleNav(e) {
    if (isMobileDevice || showBible_Nav_check.checked) {
        hideRefNav("show", bible_nav);
        refnav_col2.querySelector('.bkname.ref_hlt').scrollIntoView({
            block: "center"
        });
        refnav_col2.querySelector('.chptnum.ref_hlt').scrollIntoView({
            block: "center"
        });
    }
    if (isMobileDevice) {
        reference.blur();
    }
}