/* CREATE REFERENCE NAV-BAR */
function populateBooks() {
    var booksList = bible.Data.bookNamesByLanguage.en;
    var booksLength = booksList.length;

    var bookName = null,
        bookStartIndex = null,
        bookEndIndex = null,
        numberOfChapters = null;

    for (let i = 0; i < booksLength; i++) {
        //Books Select
        bibleBook = document.createElement('option');
        bibleBook.setAttribute('bookName', booksList[i]);
        bibleBook.setAttribute('bookindex', i);
        bookName = booksList[i];
        bibleBook.value = 'book_' + i;
        bibleBook.classList.add('bkname');
        bibleBook.textContent = booksList[i];
        bibleBook.tabIndex = 0;

        selectBooks.appendChild(bibleBook);
        var chapterStartIncreamenter = 0;

        //Chapters Select
        var numberOfChapters = KJV[Object.keys(KJV)[i]].length;
        for (j = 0; j < numberOfChapters; j++) {
            var bookChapters = document.createElement('option');
            bookChapters.classList.add('book_' + i);
            bookChapters.setAttribute('bookName', bookName);
            bookChapters.setAttribute('bookIndex', i);
            bookChapters.setAttribute('chapterIndex', j);

            bookChapters.value = 'bk' + i + 'ch' + j;
            bookChapters.textContent = [j + 1];
            bookChapters.classList.add('chptnum');
            bookChapters.classList.add('show_chapter');
            bookChapters.tabIndex = 0;
            selectChapters.appendChild(bookChapters);
        }
    }
}

function getBksChptsNum(xxx) {
    if (document.querySelector(".show_chapter")) {
        document.querySelectorAll(".show_chapter").forEach(element => {
            element.classList.remove("show_chapter");
        });
    }
    let classOfChapters = document.querySelectorAll('.' + xxx.value);
    reference.value=xxx.getAttribute('bookname');
    classOfChapters.forEach(element => {
        element.classList.add("show_chapter");
    });
    //remove class from previous class holder in refnav
    if (bible_books.querySelector('.tmp_hlt')) {
        bible_books.querySelector('.tmp_hlt').classList.remove('tmp_hlt')
    }
    xxx.classList.add('tmp_hlt')
}

var stl = 0;
var currentBookValue = null;

if(!document.querySelector('body').matches('#versenotepage')){
    refnav.addEventListener("click", function (e) {
        // if((e.target===(undefined||null))||(e.target.toString().replace(/[\s\r\n]+/g, '').length==0)){return}
        clickedElm = e.target;
        function toggleActiveButtonClass(x){
            if(x.matches("#app_settings .active_button")){x.classList.remove("active_button")}
            else if(x.matches("#app_settings button")){x.classList.add("active_button")}
        }
        if (cE = elmAhasElmOfClassBasAncestor(e.target,'button:not(#darkmodebtn)')) {clickedElm = cE;}
        //CLICKING ON BOOK-NAME AND CHAPTER-NUMBER
        //To populate book chapter numbers refnav pane
        if (clickedElm.classList.contains('bkname')) {
            getBksChptsNum(clickedElm);
            goto = 0;
            currentBookValue = clickedElm.getAttribute('value');
            reference.value=clickedElm.getAttribute("bookname")
        }
        //To Get Text of Selected Chapter
        else if (clickedElm.classList.contains('chptnum')) {
            reference.value = `${clickedElm.getAttribute("bookname")} ${clickedElm.getAttribute("chapterindex")}`
            //For previous and next chapter
            if(clickedElm.previousElementSibling){prevBibleChapter = clickedElm.previousElementSibling;}
            if(clickedElm.nextElementSibling){nextBibleChapter = clickedElm.nextElementSibling;}
            hideRefNav(null, bible_nav);
            hideRefNav("hide");
            clearPageIfChapterNotPresent(clickedElm);
            getTextOfChapter(clickedElm, null, null, true, true);
            indicateBooknChapterInNav(null, clickedElm);
            currentChapterValue = clickedElm.getAttribute('value');
            bible_chapters.classList.remove('active_button')
            // setItemInLocalStorage('lastBookandChapter', currentBookValue + ',' + currentChapterValue);
        }
        toggleActiveButtonClass(clickedElm)
    }
)}

function indicateBooknChapterInNav(bk, chpt) {
    if (bk == null) bk = bible_books.querySelector(`[bookname="${chpt.getAttribute('bookname')}"`);
    //remove class from previous class holder in refnav
    if (bible_books.querySelector('.tmp_hlt')) {
        bible_books.querySelector('.tmp_hlt').classList.remove('tmp_hlt');
    }
    if (bk) {
        if (refbk = bible_books.querySelector('.ref_hlt')) {
            refbk.classList.remove('ref_hlt')
        }
        bk.classList.add('ref_hlt');
        if (!checkVisible(bk)) {
            bk.scrollIntoView(false);
        }
        // getBksChptsNum(bk);
        if (!chpt) {
            let chapter_to_highlight = bible_chapters.querySelector('.show_chapter');
            chapter_to_highlight.classList.add('ref_hlt');
            if (!checkVisible(chapter_to_highlight)) {
                chapter_to_highlight.scrollIntoView(false);
            }
        }
    }
    if (chpt) {
        //remove class from previous class holder in refnav
        if (chptnumref = document.querySelector('.chptnum.ref_hlt')) {
            chptnumref.classList.remove('ref_hlt')
        }
        chpt.scrollIntoView(false);
        chpt.classList.add('ref_hlt');
        if (tmpbk = bible_books.querySelector('.tmp_hlt')) {
            tmpbk.classList.remove('tmp_hlt')
            let bookToHighlight = bible_books.querySelector('[bookname="' + chpt.getAttribute('bookname'));
            bookToHighlight.classList.add('ref_hlt');
            bookToHighlight.scrollIntoView(false);
        }
    }
    // UPDATE CACHE
    setItemInLocalStorage('lastBookandChapter', bk.getAttribute('value') + ',' + chpt.getAttribute("value") + ',' + chpt.getAttribute("bookname"));

    //BROWERS HISTORY
    // let derivedReference=chpt.getAttribute('bookname') + ' ' + chpt.innerText;
    // if(derivedReference!=reference.value){
    //     console.log(derivedReference)
    //     if (derivedReference!=window.location.hash.split('%20').join(' ')){
    //         updateRefBrowserHistory(derivedReference);
    //     }
    // }
}

document.addEventListener('keydown', general_EscapeEventListener);
function general_EscapeEventListener(e){
    if (e.key === "Escape") {
        // Remove ContextMenu if present
        if(document.querySelector('#context_menu') && context_menu.matches('.slideintoview')){
            hideRightClickContextMenu();
        }
        // Hide vmarker_options_menu
        else if(prev_vmrkoptm=document.querySelector('#vmarker_options_menu')){
            prev_vmrkoptm.remove()
        }
        // Stop editing verseNote
        else if (document.activeElement.matches('#noteEditingTarget')) {
            let verseNoteDiv = elmAhasElmOfClassBasAncestor(noteEditingTarget, '.verse_note');
            let editBtn = verseNoteDiv.querySelector('.note_edit_button');
            let saveBtn = verseNoteDiv.querySelector('.note_save_button');
            editVerseNote(editBtn, e, saveBtn);
        }
        else if(refnav && top_horizontal_bar_buttons){
            // Hide refnav any child window, e.g., searchWindow, that is open
            if(openRefnavChild = refnav.querySelector('.slideintoview:not(#app_settings)')){
                hideRefNav('hide',openRefnavChild);
            }
            /* \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\ */
            /* Hide "app_settings" && "top_horizontal_bar_buttons" */
            /* \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\ */
            else if (!top_horizontal_bar_buttons.matches('.sld_up')){
                /* \/\/\/\/\/\/\/\/\ */
                /* Hide app_settings */
                /* \/\/\/\/\/\/\/\/\ */
                if(app_settings.matches('.slideintoview')){hideRefNav('hide',app_settings);}
                /* \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\ */
                /* Hide top_horizontal_bar_buttons (if app_settings is hidden) */
                /* \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\ */
                else {
                    titlebarsearchparameters.classList.add('slideup'),
                    slideUpDown(top_horizontal_bar_buttons),
                    topbartogglebtn.classList.toggle('active_button')
                }
            }
            /* \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/ */
            /* SHOW both "top_horizontal_bar_buttons" && "app_settings" */
            /* \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/ */
            else {
                slideUpDown(top_horizontal_bar_buttons),
                topbartogglebtn.classList.toggle('active_button')
                hideRefNav('show',app_settings);
                togglenavbtn.focus()                
            }
        }
    }
}

function toggleNav(showHide=null) {
    let elm2HideShow;
    // IF ANY SUB-WINDOW, E.G., SEARCH-WINDOW, IS OPENNED
    if(!refnav.matches('.slideoutofview') && refnav.querySelector('.slideintoview:not(#app_settings)')){
        elm2HideShow = refnav.querySelector('.slideintoview:not(#app_settings)')
        hideRefNav(showHide,elm2HideShow)
    }
    // IF NO SUB-WINDOW IS OPENNED
    elm2HideShow = app_settings;
    hideRefNav(showHide,elm2HideShow)
    // realine();
}

// FUNCTION TO SHOW OR HIDE REF_NAV
// hideRefNav(null, searchPreviewWindowFixed)
function hideRefNav(hideOrShow, elm2HideShow, runfunc) {
    if(!elm2HideShow){
        if(!hideOrShow){hideOrShow=null}
        toggleNav(hideOrShow)
        return
    }
    const hdtime = 100;
    function changeMarginLeft(x,l=null){
        if(l==null) {x.style.marginLeft = `-${x.offsetWidth}px`}
        // else if(elm2HideShow==bible_nav && isMobileDevice){x.style.marginLeft ="10px"}
        else {x.style.marginLeft = `-${l}px`}
    }
    function toShowOnlyOneAtaTime(){
        //To show only one at a time
        if(document.querySelector('#context_menu')==null||elm2HideShow!=context_menu){
            let btnID = new RegExp(elm2HideShow.id);
            let otherActiveButtonsToHide = app_settings.querySelectorAll('.active_button')
            otherActiveButtonsToHide.forEach(o_btns=>{
                // Don't run if btn is the orginating button
                // (the orginating btn will have the id of the 'elm2HideShow' in its onclick function)
                if(btnID.test(o_btns.onclick.toString())==false){
                    o_btns.classList.remove('active_button')
                }
            })
            refnav.querySelectorAll('.slideintoview:not(#app_settings)').forEach(x=>{
                if(x!=elm2HideShow){
                    x.classList.remove('slideintoview');
                    x.classList.add('slideoutofview');
                    changeMarginLeft(x);
                    setTimeout(()=>{x.classList.add('displaynone')}, hdtime)
                }
            })
        }
    }
    if ((hideOrShow == 'show')||((hideOrShow==null||hideOrShow==undefined)&&(elm2HideShow.classList.contains('slideoutofview')))) {
        elm2HideShow.classList.remove('displaynone');
        // To ensure that the display none is no longer applied (it cancels the animation)
        setTimeout(()=>{
            toShowOnlyOneAtaTime()
            changeMarginLeft(elm2HideShow,0);
            elm2HideShow.classList.remove('slideoutofview');
            elm2HideShow.classList.add('slideintoview');
            /* For when I set #refnav_col2 > div {position: absolute;} */
            // if(document.body.matches('#homepage') && elm2HideShow != app_settings && elm2HideShow.matches('#refnav_col2>div')){elm2HideShow.style.height = `calc(100% - ${top_horizontal_bar.offsetHeight}px)`;}
        }, 1)
        
        // TO SCROLL BOOK-NAME AND CHAPTER-NUMBER IN REF-NAV INTO VIEW
        if(elm2HideShow == bible_nav){
            if(isMobileDevice){
                topbartogglebtn.style.right='';
                bottomleft_btns.style.right='';
            }
            let higlightedBknChpt = bible_nav.querySelectorAll('.ref_hlt');
            higlightedBknChpt.forEach(refHlt => {
                refHlt.scrollIntoView(false);
            });
        }
    } else if ((hideOrShow == 'hide')||((hideOrShow==null||hideOrShow==undefined)&&((!elm2HideShow.classList.contains('slideoutofview'))||(elm2HideShow.classList.contains('slideintoview'))))) {
        if(elm2HideShow==bible_nav && isMobileDevice){
            topbartogglebtn.style.right='0.75em';
            bottomleft_btns.style.right='0.75em';
        }
        elm2HideShow.classList.remove('slideintoview');
        elm2HideShow.classList.add('slideoutofview');
        changeMarginLeft(elm2HideShow)
        
        setTimeout(()=>{elm2HideShow.classList.add('displaynone')}, hdtime);
    }
    runfunc
}
function modifyRefNavChildrenHeight() {
    // /* For when I set #refnav_col2 > div {position: absolute;} */
    // setTimeout(() => {
    //     if(refCol2showingChild=refnav.querySelector('#refnav_col2 > div.slideintoview')){
    //         refCol2showingChild.style.height = `calc(100% - ${top_horizontal_bar.offsetHeight}px)`;
    //         if(refCol2showingChild.matches('#bible_nav')){
    //             refCol2showingChild.querySelector('.bkname.ref_hlt').scrollIntoView({block:"center"});
    //             refCol2showingChild.querySelector('.chptnum.ref_hlt').scrollIntoView({block:"center"})}
    //     }
    // }, 200);
}
function changeVerseAlignment() {
    let styleID = 'verse_alignement'
    if (verseAlignmentStyleSheet = document.querySelector('head style#' + styleID)) {
        verseAlignmentStyleSheet.remove()
    } else {
        let styleRule = `.verse {
        display: block;
    }`;
        createNewStyleSheetandRule(styleID, styleRule)
    }
}

function hideSearchParameters(arr) {
    searchparameters.classList.toggle('hidesearchparameters');
    if (hidesearchparameters.innerText != '▼') {
        hidesearchparameters.innerHTML = '▼'
    } else {
        hidesearchparameters.innerHTML = '▲'
    }
}

/* *+*+*+*+*+*+*+*+*+*+*+*+*+**+*+*+*+*+*+*+*+*+ */
/* *+*+* Navigating RefNav With Arrow Keys +*+*+ */
/* *+*+*+*+*+*+*+*+*+*+*+*+*+**+*+*+*+*+*+*+*+*+ */
document.addEventListener('keydown',navigationByArrowKeys)
const refNavMainBtns=[togglenavbtn,biblenavigation,bibles,searchsettings,open_strongsdefinitionwindow,available_notes,verse_markers_list,cachesettings,darkmodebtn,sitehome,sidemenubtn_rightbottom,gotochpt_next,gotochpt_prev,topbartogglebtn];
function navigationByArrowKeys(e){
    // console.log(e.keyCode)
    if(e.keyCode==17){if(e.keyCode==16){console.log('TRUE')}}
    if(!e.keyCode==(13|32|36|37|38|39|40)){return}
    if(!e.keyCode==(13|32|36|37|38|39|40)){return}
    let up_key=0,down_key=0,left_key=0,right_key=0,enter_key=0,spacebar_key=0,home_key=0;
    // Array of buttons in order of navigation

    switch(e.keyCode){
        case 13:enter_key=1;break;
        case 32:spacebar_key=1;break;
        case 36:home_key=1;break;
        case 37:left_key=1;break;
        case 38:up_key=1;break;
        case 39:right_key=1;break;
        case 40:down_key=1;
    }
    const idx_A = refNavMainBtns.indexOf(document.activeElement);
    if(idx_A>-1){
        if(center_settings_h_check.checked){
            if (idx_A>0 && idx_A<refNavMainBtns.length-4) {
                switch (e.keyCode) {
                    //left becomes up
                    case 37:up_key=1;left_key=0;break;
                    //right becomes down
                    case 39:down_key=1;right_key=0;break;
                    //up becomes right
                    case 38:right_key=1;up_key=0;break;
                    //down becomes left
                    case 40:left_key=1;down_key=0;
                  }
            }
            if(e.keyCode==37 && document.activeElement==sidemenubtn_rightbottom){
              //left becomes up
              up_key=1;
              left_key=0
            } else if(idx_A>refNavMainBtns.length-5){
                switch (e.keyCode) {
                    //up becomes down
                    case 38:down_key=1;up_key=0;break;
                    //down becomes up
                    case 40:up_key=1;down_key=0;
                    //left becomes up
                    case 37:up_key=1;left_key=0;break;
                    //right becomes down
                    case 39:down_key=1;right_key=0;break;
                  }
            }
        }
        if(up_key|down_key|left_key|right_key)ePrev()// Prevent default browser action if the active element in the dom is included in the array
        if(e.target!=togglenavbtn && left_key){
            hideRefNav('hide',app_settings);
            togglenavbtn.focus();
        }
        else {
            for(let i=idx_A;i<refNavMainBtns.length;i++){
                const rfnvb=refNavMainBtns[i]
                if(up_key && (i-1)>-1){
                    const upperBtn=refNavMainBtns[i-1];
                    if(upperBtn==togglenavbtn){hideRefNav('hide',app_settings)}
                    upperBtn.focus();
                    return
                }
                else if(down_key && (i+1)<refNavMainBtns.length){
                    const lowerBtn=refNavMainBtns[i+1];
                    if(lowerBtn==biblenavigation){hideRefNav('show',app_settings)}
                    lowerBtn.focus();
                    break
                }
                else if(right_key){
                    if(rfnvb==biblenavigation){
                        hideRefNav("show",bible_nav);
                        if (newFocusElm=bible_nav.querySelector('.bkname.ref_hlt')) {
                            newFocusElm.focus();
                        }
                    }
                    return
                }
            }
        }
    }
    else if(document.activeElement.matches("#refnav_col2 *")){
        if(up_key|down_key|left_key|right_key)ePrev()
        const rfnvb = document.activeElement;
        if(rfnvb.matches('#bible_nav .bkname')){
            const allBkOpts = bible_nav.querySelectorAll('#bible_nav .bkname');
            upDownKeys(rfnvb,allBkOpts);
            if(right_key||enter_key||spacebar_key){
                getBksChptsNum(rfnvb)
                if(newFocus=bible_nav.querySelector('.chptnum.show_chapter.ref_hlt')){newFocus.focus();}
                else {
                    bible_nav.querySelector('.chptnum.show_chapter').focus();
                }
            }
            else if(left_key){
                hideRefNav("hide",bible_nav);
                biblenavigation.focus();
            }
            else if(home_key){
                allBkOpts[0].focus();
            }
        }
        else if(rfnvb.matches('#bible_nav .chptnum')){
            const allOptVrs = bible_nav.querySelectorAll('#bible_nav .chptnum');
            upDownKeys(rfnvb,allOptVrs);
            if(left_key){
                if(x=bible_nav.querySelector('.bkname.tmp_hlt')){x.focus();}
                else if(x=bible_nav.querySelector('.bkname.ref_hlt')){x.focus();}
            }
            else if(enter_key||spacebar_key){
                /* Get the reference */
                let bk=rfnvb.getAttribute('bookname');
                let chpt=rfnvb.textContent;
                gotoRef(bk+'.'+chpt)
            }
            else if(home_key){
                allOptVrs[0].focus();
            }
        }
    }
    function upDownKeys(rfnvb,elmArr) {
        if(up_key && rfnvb!=elmArr[0]){
            ePrev();
            rfnvb.previousElementSibling.focus();
            return
        }
        else if(down_key && rfnvb!=elmArr[elmArr.length-1]){
            ePrev();
            rfnvb.nextElementSibling.focus();
            return
        }
    }
    function ePrev(){e.preventDefault()}
}
togglenavbtn.focus()