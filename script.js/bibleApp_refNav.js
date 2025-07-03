/* CREATE REFERENCE NAV-BAR */
function populateBooks() {
    var booksList = bible.Data.bookNamesByLanguage.en;
    var booksLength = booksList.length;

    var bookName = null,
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

        //Chapters Select
        // var numberOfChapters = KJV[Object.keys(KJV)[i]].length;        
        var numberOfChapters = bible.Data.verses[i].length;
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
    const chapterNumsShowingInRefnav = document.querySelectorAll(".show_chapter");
    //Remove previously showing chapter numbers of #bible_chapters under #refnav
    chapterNumsShowingInRefnav.length>0?chapterNumsShowingInRefnav.forEach(element => {element.classList.remove("show_chapter");}):null;
    const classOfChapters = document.querySelectorAll('.' + xxx.value);
    reference.value=xxx.getAttribute('bookname');
    classOfChapters.forEach(element => {element.classList.add("show_chapter");});
    //remove class from previous class holder in refnav
    const tmp_hlt=bible_books.querySelector('.tmp_hlt');
    tmp_hlt?tmp_hlt.classList.remove('tmp_hlt'):null;
    xxx.classList.add('tmp_hlt')
}

var stl = 0;
var currentBookValue = null;
let app_settings = document.querySelector('#app_settings');
if(!document.querySelector('body').matches('#versenotepage')){
    ['mousedown','focusin'].forEach(listener=>{
        refnav.addEventListener(listener,(e)=>{
            const eT = e.target;
            bringRefNavForwardOnFocus(eT);
        });
    });
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
            // hideRefNav(null, bible_nav);
            // hideRefNav("hide");
            // clearPageIfChapterNotPresent(clickedElm);
            let ref2go2 = clickedElm.getAttribute('bookname') + ' ' + (Number(clickedElm.getAttribute('chapterindex'))+1);
            gotoRef(ref2go2);
            // getTextOfChapter(clickedElm, null, null, true);
            indicateBooknChapterInNav(null, clickedElm);
            currentChapterValue = clickedElm.getAttribute('value');
            bible_chapters.classList.remove('active_button');
        }
        toggleActiveButtonClass(clickedElm)
    }
)}

let bringRefNavForwardOnFocus = (function(){
    let ignore = false;
    return function (eT) {
        if (ignore) {return}
        ignore = true;
        refnav.classList.add('bringforward');
        main.addEventListener('mousedown', refnavBlur);
        main.addEventListener('focusin', refnavBlur);
        function refnavBlur(e) {
            if(e.target.closest('#refnav')){return}
            ignore = false;
            refnav.classList.remove('bringforward');
            main.removeEventListener('mousedown', refnavBlur);
            main.removeEventListener('focusin', refnavBlur);
        }
    }
})();

function indicateBooknChapterInNav(bk, chpt) {
    if(!chpt)return
    if(bk == null){bk = bible_books.querySelector(`[bookname="${chpt.getAttribute('bookname')}"`);}
    //remove class from previous class holder in refnav
    if(t_h = bible_books.querySelector('.tmp_hlt')) {t_h.classList.remove('tmp_hlt');}
    if(bk){
        if(refbk = bible_books.querySelector('.ref_hlt')){
            refbk.classList.remove('ref_hlt')
        }
        bk.classList.add('ref_hlt');
        if(!chpt){
            let chapter_to_highlight = bible_chapters.querySelector('.show_chapter');
            chapter_to_highlight.classList.add('ref_hlt');
        }
    }
    if(chpt){
        //remove class from previous class holder in refnav
        if (chptnumref = document.querySelector('.chptnum.ref_hlt')) {chptnumref.classList.remove('ref_hlt')}
        chpt.classList.add('ref_hlt');
        if (tmpbk = bible_books.querySelector('.tmp_hlt')) {
            tmpbk.classList.remove('tmp_hlt')
            let bookToHighlight = bible_books.querySelector('[bookname="' + chpt.getAttribute('bookname'));
            bookToHighlight.classList.add('ref_hlt');
        }
    }
    if (bk && chpt) {
        bk.scrollIntoView({behavior:"smooth",block:"center"});
        chpt.scrollIntoView({behavior:"smooth",block:"center"});
        
        // UPDATE CACHE
        const bkn = chpt.getAttribute("bookname");
        const cI = chpt.getAttribute("chapterindex");
        currentBooknChpt_Ref = `${bkn} ${cI}`;
        setItemInLocalStorage('lastBookandChapter', bk.getAttribute('value') + ',' + chpt.getAttribute("value") + ',' + bkn);
    }
}

/* **************************************************** */
/* *********** GENERAL ESCAPE EVENTLISTENER *********** */
/* **************************************************** */
document.addEventListener('keydown', general_EscapeEventListener);
function general_EscapeEventListener(e){
    if (e.key != "Escape") {return}
    const activeElm = document.activeElement;
    if (xxx = document.querySelector('#singleverse_compare_menu.show')) {
        xxx.remove();
    }
    else if (document.querySelector('#show_crossref_comments:not(.displaynone)')) {
        show_crossref_comments.classList.add('displaynone');
    }
    else if(document.querySelector('#context_menu.fillscreen')){
        context_menu.classList.remove('fillscreen');
    }
    else if(document.querySelector('#singleverse_compare_menu:not(.displaynone)')){
        singleverse_compare_menu.remove();
    }
    else if (typeof searchedWordsContainer != 'undefined' && searchedWordsContainer!=null) {
        // searchedWordsContainer.removeEventListener("keydown",searchHistory_enterKeyFunc_COPY);
        searchedWordsContainer.remove();
        searchedWordsContainer=null;
    } 
    else if(tempRefdiv_un_Select()){return}
    else if(typeof qfssc_1 !== 'undefined' && (!qfssc_1.matches('.displaynone')||!qfssc_2.matches('.displaynone'))){
        qfssc_1.classList.add('displaynone');
        qfssc_2.classList.add('displaynone');
    }
    else if(bbg = document.querySelector('#biblebooksgroup_inputndropdown:not(.displaynone)')){
        bbg.classList.add('displaynone');
        bbg.querySelector('.showhidebookgrps').classList.add('showbksdrpdown');
        bbg.querySelector('.biblebooksgroup_dropdown_content').classList.add('displaynone');
    }
    // Hide book ranges dropdown
    else if(bbg = document.querySelector('.biblebooksgroup_dropdown_content:not(.displaynone)')){
        bbg.classList.add('displaynone');
        bbg.parentElement.querySelector('.showhidebookgrps').classList.add('showbksdrpdown');
    }
    // Hide reference History dropdown
    else if(document.querySelector('#refhistorylist_front:not(.displaynone)') || document.querySelector('#refhistorylist_back:not(.displaynone)')){
        refhistorylist_back.classList.add('displaynone');
        refhistorylist_front.classList.add('displaynone');
    }
    else if(bbgDrpdwn2 = document.querySelector('#biblebooksgroup_myDropdown_2:not(.displaynone)')){
        bbgDrpdwn2.classList.add('displaynone');
        bbgDrpdwn2.closest('.biblebooksgroup_inputndropdown').querySelector('.showhidebookgrps').classList.add('showbksdrpdown');
    }
    else if(tsp = document.querySelector('#titlebarsearchparameters:not(.slideup)')){
        tsp.classList.add('slideup');
        titlebar_show_searchsettings.focus();
    }
    // Remove ContextMenu if present
    else if(document.querySelector('#context_menu.slideintoview')){
        hideRightClickContextMenu();
    }
    else if(fillScreen = document.querySelector('#refnav_col2 > .fillscreen.slideintoview')){
        fillScreen.classList.remove('fillscreen');
    }
    else if(document.querySelector('#versenote_totheright.showingNote')){
        versenote_totheright.classList.remove('showingNote');
    }
    // Hide bookMarks
    else if(document.querySelector('#bookmark_content') && bookmark_content.matches('.displayblock')){
        bookmark_content.classList.remove('displayblock');
        bookmarks_holder.classList.remove('showing_bookmarks');
    }        
    // Hide vmarker_options_menu
    else if(prev_vmrkoptm=document.querySelector('#vmarker_options_menu')){
        prev_vmrkoptm.remove()
    }
    // Stop editing verseNote
    else if (activeElm.matches('#noteEditingTarget')) {
        stop_note_editing(activeElm, e);
    }
    //Hide versenote notemenu, if open
    // else if((vnt=activeElm.closest('.verse_note')?activeElm.closest('.verse_note'):window.getSelection().anchorNode.parentNode.closest('.most_recent_note')) && ((nm=vnt.querySelector('.notemenu:not(.sld_up)')) && nm.style.display!='none')){
    else if((vnt=activeElm.closest('.verse_note')||((an=window.getSelection().anchorNode) && an.parentNode.closest('.most_recent_note'))) && ((nm=vnt.querySelector('.notemenu:not(.sld_up)')) && nm.style.display!='none')){
        generateNoteMenu(vnt);
    }
    else if(main.matches('.maximizeVertical, .maximizeHorizontal') && !app_settings.matches('.slideintoview') && !document.querySelector('#refnav_col2 > .slideintoview')){main.classList.remove('maximizeVertical','maximizeHorizontal')}

    /* RefNav && Top_Horizontal_Bar_Buttons */
    // else if(refnav && top_horizontal_bar_buttons) {
    else {
        // Hide refnav any child window, e.g., searchWindow, that is open
        if(!e.shiftKey /* && !refnav.matches('.refnav_detached') */ && (openRefnavChild = refnav.querySelector('.slideintoview:not(#app_settings)'))){hideRefNav('hide',openRefnavChild);}
        else // if (!top_horizontal_bar_buttons.matches('.sld_up')/*  && !e.shiftKey */){//if #top_horizontal_bar_buttons is showing
            if(app_settings.matches('.slideintoview')){hideRefNav('hide',app_settings);}// Hide #app_settings (if #app_settings is showing)
                /*Hide #top_horizontal_bar_buttons (if #app_settings is hidden)*/
            // else {
            else if(!e.shiftKey && !app_settings.matches('.slideintoview')) {
                titlebarsearchparameters.classList.add('slideup');
                slideUpDown(top_horizontal_bar_buttons);
                topbartogglebtn.classList.toggle('active_button');
                modifyRefNavChildrenHeight();
            }
        // }
        // else if (e.shiftKey){hideRefNav('show',app_settings);}//SHOW #app_settings
        else if (e.shiftKey){
            hideRefNav(null,app_settings, null, e.shiftKey);}//Toggle #app_settings
        else {
            /* SHOW both #top_horizontal_bar_buttons */
            slideUpDown(top_horizontal_bar_buttons);
            topbartogglebtn.classList.toggle('active_button');
            togglenavbtn.focus();
            modifyRefNavChildrenHeight();
        }
    }
}

function stop_note_editing(note_editing_target, e={key:'Escape'}) {
    note_editing_target = note_editing_target ? note_editing_target.closest('#noteEditingTarget'):null;
    if (!note_editing_target) {return}
    let verseNoteDiv = note_editing_target.closest('.verse_note');
    let editBtn = verseNoteDiv.querySelector('.note_edit_button');
    let saveBtn = verseNoteDiv.querySelector('.note_save_button');
    editVerseNote(editBtn, e, saveBtn);
}

function toggleNav(event, showHide=null) {
    let elm2HideShow;
    // IF ANY SUB-WINDOW, E.G., SEARCH-WINDOW, IS OPENNED
    if(!event.shiftKey && !refnav.matches('.slideoutofview') && refnav.querySelector('.slideintoview:not(#app_settings)')){
        elm2HideShow = refnav.querySelector('.slideintoview:not(#app_settings)')
        hideRefNav(showHide,elm2HideShow)
    }
    // IF NO SUB-WINDOW IS OPENNED
    elm2HideShow = app_settings;
    hideRefNav(showHide,elm2HideShow,null,event.shiftKey)
    // realine();
}

// FUNCTION TO SHOW OR HIDE REF_NAV
// hideRefNav(null, searchPreviewWindowFixed)
async function hideRefNav(hideOrShow, elm2HideShow, runfunc, shiftKey) {
    if(!elm2HideShow){
        if(!hideOrShow){hideOrShow=null};
        toggleNav(hideOrShow);
        return
    }
    if(!document.body.matches('#homepage')){lastClickedVerse=null}
    else {!lastClickedVerse ? await getHighestVisibleH2() : null};
    const lcv = lastClickedVerse;

    const hdtime = elm2HideShow != document.querySelector('#context_menu') ? 300 : 0;
    if ((hideOrShow == 'show')||((hideOrShow==null||hideOrShow==undefined)&&(elm2HideShow.classList.contains('slideoutofview')))) {        
        elm2HideShow.classList.remove('displaynone');
        // To ensure that the display none is no longer applied (because it cancels the animation)
        setTimeout(()=>{            
           if(elm2HideShow!=app_settings || (elm2HideShow==app_settings && !shiftKey)){toShowOnlyOneAtaTime()};
            changeMarginLeft(elm2HideShow,0);
            elm2HideShow.classList.remove('slideoutofview');
            elm2HideShow.classList.add('slideintoview');
            /* For when I set #refnav_col2 > div {position: absolute;} */
            // if(document.body.matches('#homepage') && elm2HideShow != app_settings && elm2HideShow.matches('#refnav_col2>div')){elm2HideShow.style.height = `calc(100% - ${top_horizontal_bar.offsetHeight}px)`;}
        }, 1)
        
        // TO SCROLL BOOK-NAME AND CHAPTER-NUMBER IN REF-NAV INTO VIEW
        if(elm2HideShow == bible_nav){
            main.addEventListener("click", hideBibleNav);//add eventlistener to hide bible_nav
            if(isMobileDevice){
                topbartogglebtn.style.right='';
                bottomleft_btns.style.right='';
            }
            let higlightedBknChpt = bible_nav.querySelectorAll('.ref_hlt');
            higlightedBknChpt.forEach(refHlt => {refHlt.scrollIntoView(false);});
        }
        else if(elm2HideShow==app_settings){
            const idx = refNavMainBtns.indexOf(document.activeElement)
            if(idx<2 || idx>10){biblenavigation.focus();}
        }
        else if(typeof searchPreviewWindowFixed != 'undefined' && elm2HideShow==searchPreviewWindowFixed){wordsearch_fixed.select();}
    }
    //TO HIDE
    else if((hideOrShow == 'hide')||((hideOrShow==null||hideOrShow==undefined)&&((!elm2HideShow.classList.contains('slideoutofview'))||(elm2HideShow.classList.contains('slideintoview'))))) {
        if(elm2HideShow==bible_nav){
            main.removeEventListener("click", hideBibleNav);//remove eventlistener that hides bible_nav
            if(isMobileDevice){
                topbartogglebtn.style.right='0.75em';
                bottomleft_btns.style.right='0.75em';
            }
        }
        if(elm2HideShow==app_settings){togglenavbtn.focus();}
        elm2HideShow.classList.remove('slideintoview');
        elm2HideShow.classList.add('slideoutofview');
        if (app_settings != null) {
            //If there is active_button
            const a_b=app_settings.querySelector('.active_button');
            app_settings.matches('.displaynone')?togglenavbtn.focus():a_b?a_b.focus():null;// Make focus main nav button if app_settings is hidden
            a_b?a_b.classList.remove('active_button'):null;//If there is active_button
        }
        
        changeMarginLeft(elm2HideShow)
        
        refnav_timeout = setTimeout(()=>{
            elm2HideShow.classList.add('displaynone');
            elm2HideShow==document.querySelector('#context_menu')?elm2HideShow.remove():null;
        }, hdtime);
    }
    (lcv && !elm2HideShow.closest('#context_menu') && elm2HideShow.closest('#refnav')) ? setTimeout(()=>{lcv.scrollIntoView()},hdtime) : null;
    runfunc;
    return {delay:hdtime}
    function hideBibleNav() {if(bible_nav.matches('.slideintoview')){hideRefNav('hide', bible_nav)}}
    function changeMarginLeft(x,l=null) {
        if (l==null) {x.style.marginLeft = `-${x.getBoundingClientRect().x + x.offsetWidth}px`}
        // else if(elm2HideShow==bible_nav && isMobileDevice){x.style.marginLeft ="10px"}
        else {x.style.marginLeft = `-${l}px`}
    }
    function toShowOnlyOneAtaTime(){
        //To show only one at a time
        if(document.querySelector('#context_menu')==null||elm2HideShow!=context_menu){
            let btnID = new RegExp(elm2HideShow.id);
            let otherActiveButtonsToHide = app_settings.querySelectorAll('.active_button');
            otherActiveButtonsToHide.forEach(o_btns=>{
                // Don't run if btn is the orginating button
                // (the orginating btn will have the id of the 'elm2HideShow' in its onclick function)
                // if(btnID.test(o_btns.onclick.toString())==false){
                if(btnID.test(o_btns.getAttribute("toopen"))==false){
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
}
let refnav_timeout=null;
async function modifyRefNavChildrenHeight(resizeNoteOnly) {
    if (!notedetach_check.checked && !show_versenote_totheright_2_check.checked) {
        if (vntdrs=document.querySelector('head').querySelector('#vn_totheright_topANDheight')){
            vntdrs.remove();
        };
        // return
    }
    !lastClickedVerse ? await getHighestVisibleH2() : null;
    const lcv = lastClickedVerse;

    // /* For when I set #refnav_col2 > div {position: absolute;} */
    setTimeout(() => {
        let maxH = `calc(100vh - 0px)`;
        if (!top_horizontal_bar.querySelector('#top_horizontal_bar > div').closest('.sld_up')) {//if topbar is showing
            const h = top_horizontal_bar.offsetHeight;
            maxH = `calc(100vh - ${h}px)`;
            documentROOT.style.setProperty('--refnav-max-height', maxH);
            // const maxH = `calc(100vh - var(--topBarHeight))`;
            // document.querySelector(':root').style.setProperty('--topBarHeight', `${h}px`);
            const tp = `${h}px`;
            const vntdr_style = !show_versenote_totheright_2_check.checked ? (`.verse_note {max-height: ${maxH}!important;margin-top:${tp}!important;}`) : (`.versenote_totheright {max-height:${maxH}!important;margin-top:${tp}!important;}#cke_noteEditingTarget {margin-top:${tp}!important;}#refnav.refnav_tobottom:not(.ignore_refnav_tobottom) #refnav_col2 {height: calc(100% - ${h}px - 2.1em)!important;}#refnav:has(#refnav_col2:hover).refnav_tobottom:not(.ignore_refnav_tobottom) #refnav_col2 {height: calc(100% - ${h}px - 1em)!important;}`);
            createNewStyleSheetandRule('vn_totheright_topANDheight', vntdr_style);
            resizeNoteOnly ? null : setTimeout(()=>{lcv.scrollIntoView()},5);
        } else if (vntdrs = document.querySelector('head').querySelector('#vn_totheright_topANDheight')) {
            vntdrs.remove();
            resizeNoteOnly ? null : setTimeout(()=>{lcv.scrollIntoView()},5);
        }
        documentROOT.style.setProperty('--refnav-max-height', maxH);
    }, 300);
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
    // searchparameters.classList.toggle('hidesearchparameters');
    if (hidesearchparameters.innerText != '▼') {
        hidesearchparameters.innerHTML = '▼'
    } else {
        hidesearchparameters.innerHTML = '▲'
    }
}

/* *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+ */
/* FOR CENTERING THE REFNAV & ITS CHILDREN ON NARROW MOBILE SCREENS */
/* *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+ */
function centerNavigationAndOtherSettings(vh){
    // console.log(refnavpositions.querySelectorAll('input:checked'));    
    let et;
    // refnav.classList.remove('refnav_totheright');
    refnav.classList.remove('ignore_refnav_tobottom');
    /* HORIZONTALLY */
    if (vh=='h') {
        et = center_settings_h_check.closest('button');
        if(document.head.querySelector('.h_centeredSettings')){
            h_centeredSettings.remove();
            center_settings_h_check.checked=false;
            refnav.classList.remove('ignore_refnav_tobottom');
        } else {
            refnav.classList.add('h_centeredSettings');
            center_settings_v_check.checked=false;
            center_settings_h_check.checked=true;
            center_settings_r_check.checked=false;
            center_settings_b_check.checked=false;
            refnav.classList.remove('v_centeredSettings')
            refnav.classList.add('ignore_refnav_tobottom');
        }
    }
    /* VERTICALLY */
    else if(vh=='v'){
        et = center_settings_v_check.closest('button');
        if(document.head.querySelector('#v_centeredSettings')){
            v_centeredSettings.remove();
            center_settings_v_check.checked=false;
            refnav.classList.remove('ignore_refnav_tobottom');
        } else {
            refnav.classList.add('v_centeredSettings');
            center_settings_v_check.checked=true;
            center_settings_h_check.checked=false;
            center_settings_b_check.checked=false;
            center_settings_r_check.checked=false;
            refnav.classList.remove('h_centeredSettings');
            refnav.classList.add('ignore_refnav_tobottom');
        }
        if (!center_settings_v_check.checked){
        } else {
        }

    }
    else if(vh=='r'){
        et = center_settings_r_check.closest('button');
        center_settings_v_check.checked=false;
        center_settings_h_check.checked=false;
        center_settings_b_check.checked=false;
        refnav.classList.remove('h_centeredSettings', 'v_centeredSettings');
        if (!center_settings_r_check.checked){
            center_settings_r_check.checked=true;
            refnav.classList.add('refnav_totheright');
            refnav.classList.add('ignore_refnav_overlay');
            refnav.classList.add('ignore_refnav_tobottom');
        } else {
            center_settings_r_check.checked=false;
            refnav.classList.remove('refnav_totheright');
            refnav.classList.remove('ignore_refnav_overlay');
            refnav.classList.remove('ignore_refnav_tobottom');
        }
    }
    else if(vh=='b'){//refnav_fixed_but_overlaying_bible
        et = center_settings_b_check.closest('button');
        center_settings_v_check.checked=false;
        center_settings_h_check.checked=false;
        center_settings_r_check.checked=false;
        refnav.classList.remove('refnav_totheright');
        refnav.classList.remove('h_centeredSettings', 'v_centeredSettings');
        if (!center_settings_b_check.checked){
            center_settings_b_check.checked=true;
            center_settings_b.classList.add('active_button');
            refnav.classList.add('refnav_tobottom');
            refnav.classList.add('refnav_detached');
        } else {
            center_settings_b_check.checked=false;
            center_settings_b.classList.remove('active_button');
            refnav.classList.remove('refnav_tobottom');
            refnav.classList.remove('ignore_refnav_tobottom');
            refnav.classList.remove('ignore_refnav_overlay');
        }
    }
    else if(vh=='o'){//refnav_fixed_but_overlaying_bible
        if (!center_settings_o_check.checked){
            center_settings_o_check.checked=true;
            center_settings_o.classList.add('active_button');
            refnav.classList.add('refnav_overlay');
            refnav.classList.add('refnav_detached');
        } else {
            center_settings_o_check.checked=false;
            center_settings_o.classList.remove('active_button');
            refnav.classList.remove('refnav_overlay');
            refnav.classList.remove('refnav_detached');
            refnav.classList.remove('ignore_refnav_overlay');
        }
    }
    
    if(center_settings_h_check.checked){
        center_settings_h.classList.add('active_button');
        center_settings_v.classList.remove('active_button');
        center_settings_r.classList.remove('active_button');
        refnav.classList.add('refnav_detached');
    }
    else if(center_settings_v_check.checked){
        center_settings_v.classList.add('active_button');
        center_settings_h.classList.remove('active_button');
        center_settings_r.classList.remove('active_button');
        refnav.classList.add('refnav_detached');
    }
    else if(center_settings_r_check.checked){
        center_settings_h.classList.remove('active_button');
        center_settings_v.classList.remove('active_button');
        center_settings_r.classList.add('active_button');
        if (!center_settings_o_check.checked && !center_settings_b_check.checked) {
            refnav.classList.remove('refnav_detached');
        }    }
    else {
        center_settings_h.classList.remove('active_button');
        center_settings_v.classList.remove('active_button');
        center_settings_r.classList.remove('active_button');
        center_settings_b.classList.remove('active_button');
        if (!center_settings_o_check.checked && !center_settings_b_check.checked) {
            refnav.classList.remove('refnav_detached');
        }
    }
    showHideTransliterationSection({'target':et})
}
// ALT + V
document.addEventListener('keydown', (e)=>{
    if (!e || e.altKey && e.code=='KeyV') {
        let cbcs = [[center_settings_v_check.checked,'h'],[center_settings_h_check.checked,'r'],[center_settings_r_check.checked,'b'],[center_settings_b_check.checked,'b']];
        let chckdB = cbcs.find(x=>{return x[0]});
        chckdB ? centerNavigationAndOtherSettings(chckdB[1]) : centerNavigationAndOtherSettings('v');
    }
});
/* *+*+*+*+*+*+*+*+*+*+*+*+*+**+*+*+*+*+*+*+*+*+ */
/* *+*+* Navigating RefNav With Arrow Keys +*+*+ */
/* *+*+*+*+*+*+*+*+*+*+*+*+*+**+*+*+*+*+*+*+*+*+ */
let refNavMainBtns
if (document.body.matches('#homepage')) {
    document.addEventListener('keydown',navigationByArrowKeys)
    refNavMainBtns=[togglenavbtn,biblenavigation,bibles,comparewindowBtn,searchsettings,open_strongsdefinitionwindow,available_notes,verse_markers_list,cachesettings,darkmodebtn,sitehome,sidemenubtn_rightbottom,gotochpt_next,gotochpt_prev,topbartogglebtn];
    togglenavbtn.focus();
}
function navigationByArrowKeys(e){
    if(document.activeElement.matches('input, .cke_dialog_body') || document.activeElement.closest('.cke_dialog_body')){return}
    
    /* TOGGLE REF_NAV WITH CTRL+SHIFT+Z */
    if (e.altKey){return}//If altKey is pressed don't work. Because of verseUpDownNavigationByKeys(e) which uses alt + up/down arrow keys
    if (e.ctrlKey && e.shiftKey && e.keyCode==90) {
        hideRefNav(null,app_settings);
    }
    
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
        /* ---------------------------------------------------------- */
        /* ---------------------------------------------------------- */
        /* TO ADAPT THE KEYS DIRECTIONS WHEN THE REFNAV IS HORIZONTAL */
        /* ---------------------------------------------------------- */
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
        /* ---------------------------------------------------------- */
        /* ---------------------------------------------------------- */
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
                        rfnvb.classList.toggle('active_button');
                        if (newFocusElm=bible_nav.querySelector('.bkname.ref_hlt')) {newFocusElm.focus();}
                    } else {
                        if (sectionToShow=rfnvb.getAttribute('toopen')) {
                            sectionToShow=refnav_col2.querySelector('#'+sectionToShow);
                            hideRefNav("show",sectionToShow);
                            rfnvb.classList.toggle('active_button')
                            sectionToShow.focus();
                            if(sectionToShow==bibleapp_cache){
                                sectionToShow.querySelector('button:not(.refnav_col2_closebtn)').focus()
                            }
                            else if(sectionToShow==available_notes){
                                bibleapp_available_notes.querySelector('details').focus()
                            }
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
    function ePrev(){e.target.closest('select') ? null:e.preventDefault()}
}
document.addEventListener("keydown",goToParentButton)
function goToParentButton(e){
    if (e.ctrlKey && e.key === 'Tab') {
        const currentTarget = document.activeElement;
        if(currentTarget && currentTarget.matches('#refnav_col2 *')){
            e.preventDefault()
            const currentTargetID = elmAhasElmOfClassBasAncestor(currentTarget, '#refnav_col2>div').id;
            app_settings.querySelector(`[toopen="${currentTargetID}"]`).focus()
        }
    }
}
function topbartogglebtnFunctions(){
    titlebarsearchparameters.classList.add('slideup');
    slideUpDown(top_horizontal_bar_buttons,'slideup');
    this.classList.toggle('active_button');
    modifyRefNavChildrenHeight(true);
    tempRefdiv_un_Select();
}
if (typeof topbartogglebtn != 'undefined') {
    topbartogglebtn.addEventListener('click',topbartogglebtnFunctions)
}
function resetAllTransforms(){
    refnav_col2.querySelectorAll('[data-x]').forEach(x=>{
        x.style.transform = '';
        x.removeAttribute('data-x');
        x.removeAttribute('data-y');
    })
}
function tileVerses(dis) {
    const targElm = dis.closest('.context_menu, #searchPreviewWindowFixed, #scriptureCompareWindow');
    const classAdded = targElm.classList.toggle('versestiled');
    if(targElm.id == 'context_menu'){classAdded ? cmenuVerseTiling=true : cmenuVerseTiling = false;}
}