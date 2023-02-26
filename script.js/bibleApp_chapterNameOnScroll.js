/* GET TOPMOST H2*/
main.addEventListener('scroll', getHighestVisibleH2)
//TO LOAD NEW CHAPTER WHEN CHAPTER HAS BEEN SCROLLED TO THE END
main.addEventListener('scroll', loadNewChapterOnScroll)
// SHOW CLICKED VERSE REFERENCE IN REFERENCE INPUT
main.addEventListener('click', function (e) {
    // if(!document.activeElement.matches('#reference')){
        let hoveredRef;
        if (e.target.matches('.verse')) {
            hoveredRef = e.target.querySelector('code').getAttribute('ref');
        } else if (et=elmAhasElmOfClassBasAncestor(e.target,'.verse')) {
            hoveredRef = et.querySelector('code').getAttribute('ref');
        }
        if(hoveredRef){reference.value=hoveredRef;}
    // }
});

function getHighestVisibleH2() {
    function highestElmFromMainTop(){
        let distanceFromMainTop = 0;
        let highestElm = null;
        // Will only check for highest elm over a distance of 10px from the start of the main
        while (((highestElm != null && (!highestElm.matches('.chptheading')&&(!highestElm.matches('.chptverses')||elmAhasElmOfClassBasAncestor(highestElm, 'chptverses')))) || (highestElm == null)) && distanceFromMainTop<10){
                distanceFromMainTop++;
                highestElm = document.elementFromPoint(main.getBoundingClientRect().x + (main.getBoundingClientRect().width / 2), main.getBoundingClientRect().y + distanceFromMainTop);
        }
        return highestElm
    }
    function highestVerseFromTop(){
        let distanceFromMainTop = 0;
        let highestElm = null;
        // Will only check for highest elm over a distance of 10px from the start of the main
        while (((highestElm != null && (!highestElm.matches('.vmultiple')||(elmAhasElmOfClassBasAncestor(highestElm, '.vmultiple')))) || (highestElm == null)) && distanceFromMainTop<100){
                distanceFromMainTop++;
                highestElm = document.elementFromPoint(main.getBoundingClientRect().x + (main.getBoundingClientRect().width / 2), main.getBoundingClientRect().y + distanceFromMainTop);
                if(!highestElm.matches('.vmultiple')&& elmAhasElmOfClassBasAncestor(highestElm, '.vmultiple')){
                    highestElm = elmAhasElmOfClassBasAncestor(highestElm, '.vmultiple')
                }
        }
        return highestElm
    }
    let highestChptHeading=null;
    let highestElm = highestElmFromMainTop();
    if(highestElm == null){return}

    if (highestElm.matches('.chptheading')) {
        highestChptHeading=highestElm;
        highestChptBody=highestElm.nextElementSibling;
    } else if (highestElm.matches('.chptverses')) {
        highestChptHeading = highestElm.previousElementSibling;
        highestChptBody = highestElm;
    } else if (elmAhasElmOfClassBasAncestor(highestElm, 'chptverses')) {
        highestChptBody = elmAhasElmOfClassBasAncestor(highestElm, 'chptverses');
        highestChptHeading = highestChptBody.previousElementSibling;
    }
    if(highestChptHeading!=null&&highestChptHeading.matches('.chptheading')&&highestChptHeading.innerText!=reference.value){showCurrentChapterInHeadnSearchBar(highestChptHeading)}

    return {highestElm,highestChptHeading,highestChptBody,highestVerse:highestVerseFromTop()}

}
let allVisitedChapters = [];
let previousBibleBook = null;
function showCurrentChapterInHeadnSearchBar(h, isH2 = true) {
    //Change reference in reference search box
    let derivedReference, hID, bkName;
    if (isH2) {
        derivedReference = h.innerText;
        hID = h.id.split('_')[1];
    } else {
        derivedReference = `${h.getAttribute('bookname')} ${h.getAttribute('chapter')}`;
        hID = `${h.getAttribute('bookid')}.${Number(h.getAttribute('chapter'))-1}`;
    }

    //To indicate the selected current chapter

    let selectedChapter = bible_chapters.querySelector(`[value="bk${hID.split('.')[0].toString()}ch${Number(hID.split('.')[1])}"]`)
    bkName = h.getAttribute('bookname');
    bookName=bkName;
    let optbybkName = bible_books.querySelector(`[bookname="${bkName}"]`);
    indicateBooknChapterInNav(optbybkName, selectedChapter);

    reference.value = derivedReference;
    //Make current chapter page title
    document.querySelector('head>title').innerText = /*'LightCity-' +  */ derivedReference
    
    // The ref should not be stored if it is the same with the previous stored ref
    if(allVisitedChapters.length==0 || allVisitedChapters.indexOf(derivedReference)<allVisitedChapters.length-1){
        allVisitedChapters.push(derivedReference)
    }
    if(previousBibleBook==null || previousBibleBook!=bkName){
        appendMarkersToSideBar()
    }
    previousBibleBook=bkName;
}

/* REMOVE HIGHEST AND LOWEST CHAPTERS VERSES */
function remove_HIGHEST_Chapter() {
    if (main.querySelectorAll('.chptheading').length >= 4) {
        let highestChapterHeading = main.querySelector('.chptheading:first-of-type');
        let highestChapterID = highestChapterHeading.id;
        let highestChapterBookName = highestChapterHeading.getAttribute('bookname');
        let hCidSplit = highestChapterID.split('.');
        let chapterNum = Number(hCidSplit[1]) + 1;
        let elmToRemove = main.querySelector('[bookname="' + highestChapterBookName + '"][chapter="' + chapterNum + '"]')
        highestChapterHeading.remove();
        elmToRemove.remove();
    }
}

function remove_LOWEST_Chapter() {
    if (main.querySelectorAll('.chptheading').length >= 4) {
        let lowestChapterHeading = main.querySelector('.chptheading:last-of-type');
        let lowestChapterID = lowestChapterHeading.id;
        let lowestChapterBookName = lowestChapterHeading.getAttribute('bookname');
        let lCidSplit = lowestChapterID.split('.');
        let chapterNum = Number(lCidSplit[1]) + 1;
        let elmToRemove = main.querySelector('[bookname="' + lowestChapterBookName + '"][chapter="' + chapterNum + '"]')
        //ScrollHeight is affected by removal of chapters
        //So, making adjustments for it
        let old_scrollheight = main.scrollHeight;
        lowestChapterHeading.remove();
        elmToRemove.remove();
        main.scrollTo(0, main.scrollHeight - old_scrollheight)
    }
}

function showOnlyLoadedChapters() {
    main.removeEventListener('scroll', loadNewChapterOnScroll)
}
let prev_bkNumb=null;
function loadNewChapterOnScroll() {
    let lastScrollTop = 0;
    var mst = main.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
    if (mst > lastScrollTop) {
        // downscroll code
        if (main.scrollHeight - main.scrollTop - main.clientHeight < 100) { //If you have scrolled to the end of the element
            loadNewChapter_After_Last_DisplayedChapterOnPage()
        }
    } else {
        // upscroll code
        if (main.scrollTop < 10) { //If you have scrolled to the top of the element
            loadNewChapter_Before_First_DisplayedChapterOnPage()
        }
    }
    // For Mobile or negative scrolling
    lastScrollTop = mst <= 0 ? 0 : mst;
    //to style verse references that have notes in the database
    // indicateThatVerseHasNoteInIndxDB()
}

function loadNewChapter_After_Last_DisplayedChapterOnPage(){
    let lastChapter = main.querySelector('.chptverses:last-of-type');
    bkNumb = lastChapter.getAttribute('bookid');
    let chptNumb = lastChapter.getAttribute('chapter') - 1;
    // let nextChapter = bible_chapters.querySelector(`[value="bk${bkNumb}ch${Number(chptNumb)+1}"]`)//Stops generating chapters at end of book
    let nextChapter = bible_chapters.querySelector(`[value="bk${bkNumb}ch${Number(chptNumb)}"]`).nextElementSibling;

    if (nextChapter) {
        remove_HIGHEST_Chapter();
        getTextOfChapterOnScroll(nextChapter, 0);
        indicateThatVerseHasNoteInJSONnotes_file();
    }
    transliteratedWords_Array.forEach(storedStrnum => {
        showTransliteration(storedStrnum)
    });
}
function loadNewChapter_Before_First_DisplayedChapterOnPage(){
    let firstChapter = main.querySelector('.chptverses:first-of-type')
    bkNumb = firstChapter.getAttribute('bookid');
    let chptNumb = firstChapter.getAttribute('chapter') - 1;
    // let prevChapter = bible_chapters.querySelector(`[value="bk${bkNumb}ch${Number(chptNumb)-1}"]`)//Stops generating chapters when scrolling gets to the beginning of book
    let prevChapter = bible_chapters.querySelector(`[value="bk${bkNumb}ch${Number(chptNumb)}"]`).previousElementSibling
    if (prevChapter) {
        remove_LOWEST_Chapter()
        getTextOfChapterOnScroll(prevChapter, true, true);
        indicateThatVerseHasNoteInJSONnotes_file();
    }
    transliteratedWords_Array.forEach(storedStrnum => {
        showTransliteration(storedStrnum)
    });
}

/* Scroll To Target Verse */
function scrollToVerse(targetVerse) {
    if (targetVerse.parentElement.classList.contains('vmultiple')) {
        targetVerse = targetVerse.parentElement
    } //When verse is put in a verse holder for multiple verses
    let scrollBehaviour = null;
    if(scrollToVerseBtn_check.checked==false){scrollBehaviour = null;}
    else {scrollBehaviour = {behavior: "smooth"};}
    if (targetVerse) {
        if (!targetVerse.previousElementSibling) {
            //(if no previous-sibling, then it must be the first verse so) scroll to parents sibling (which should be the heading)
            targetVerse.parentElement.previousElementSibling.scrollIntoView();
        } else {
                targetVerse.scrollIntoView(scrollBehaviour);
        }
    }
}

function checkVisible(elm) {
    //From: https://stackoverflow.com/questions/5353934/check-if-element-is-visible-on-screen
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= -10);
}

/* GO TO PREVIOUS / NEXT CHAPTER */
function goToNextPrevChapter(pn){
    let hchpt_H = getHighestVisibleH2().highestChptHeading
    // Goto previous chapter
    if(pn=='-'){
        if(!hchpt_H.matches('.chptheading:first-of-type')){
            hchpt_H.previousElementSibling.previousElementSibling.scrollIntoView()
        } else {
            // Load new chapter and then scroll to it
            loadNewChapter_Before_First_DisplayedChapterOnPage()
            hchpt_H.previousElementSibling.previousElementSibling.scrollIntoView()
        }
    }
    // Goto next chapter
    else if(pn=='+'){
        if(!hchpt_H.matches('.chptheading:last-of-type')){
            hchpt_H.nextElementSibling.nextElementSibling.scrollIntoView()
        } else {
            // Load new chapter and then scroll to it
            loadNewChapter_After_Last_DisplayedChapterOnPage()
            hchpt_H.nextElementSibling.nextElementSibling.scrollIntoView()
        }
    }

}