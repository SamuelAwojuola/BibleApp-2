let winPrevHeight = window.outerHeight;
let winPrevWidth = window.outerWidth;
let windowWidthWasResized = false;
let general_Resize_function = (function (){
    let _t,_lcv;
    return function (){
        // _lcv will be null when resize begins
        // once it is set, it will not change until resize stops
        _lcv = _lcv==null ? (lastClickedVerse ? lastClickedVerse : null) : _lcv;//the _lcv inside resize listner will not change until resizing stops which is after the setTimeout finally runs
        _lcv ? _lcv.scrollIntoView() : null;//ensure topmost verse is the same verse on top
        clearTimeout(_t);
        _t = setTimeout(() => {
            if(document.querySelector('.refdiv_showing_temp') && top_horizontal_bar_buttons.matches('.sld_up')){
                const new_topbar_height = Math.round(parseFloat(window.getComputedStyle(top_horizontal_bar_buttons).height));
                documentROOT.style.setProperty('--topbar-height', new_topbar_height+'px');
                windowWidthWasResized = winPrevWidth != window.outerWidth ? true : false; 
            }
            _lcv ? _lcv.scrollIntoView() : null;//ensure topmost verse is the same verse untop
            _lcv = null;//reset last clicked verse inside resize listener

            if (winPrevHeight == window.outerHeight && winPrevWidth == window.outerWidth) {return;}
            modifyRefNavChildrenHeight();
            winPrevHeight = window.outerHeight;
            winPrevWidth = window.outerWidth;
        }, 250);
    }
})();
window.addEventListener('resize', general_Resize_function);
/* GET TOPMOST H2*/
// To Know When Scrolling is Triggered By User
let dontGetLastVerse=false;
//TO LOAD NEW CHAPTER WHEN CHAPTER HAS BEEN SCROLLED TO THE END
main.addEventListener('scroll', loadNewChapterOnScroll);
let mainScrollTimeout,goAheadandHighlightSameStrongs=true;
//Prevent Highlighting of Same Strong's Numbers While Page is Scrolling
window.addEventListener('scroll', function() {
    goAheadandHighlightSameStrongs=false;
    clearTimeout(mainScrollTimeout);// Clear the previous timeout
    // Set a new timeout to run after scrolling stops
    mainScrollTimeout = setTimeout(function() {// Code to run when scrolling has stopped
        goAheadandHighlightSameStrongs=true;
    }, 200); // Adjust the timeout value as needed
});
// SHOW CLICKED VERSE REFERENCE IN REFERENCE INPUT
let lastClickedVerse;
main.addEventListener('click', function (e) {
    let mostRecentRef;
    if (et=e.target.closest('.vmultiple')) {lastClickedVerse = et;}
    if(!lastClickedVerse){return}
    if(mostRecentRef = lastClickedVerse.querySelector('code').getAttribute('ref')){reference.value=mostRecentRef;}
});
// NAVIGATION BY CTRL+UP/DOWN ARROW KEYS */
document.addEventListener('keydown',goToNextPrevChapter)
let observer;
let oldChapter = null,oldBookName=null;
const previouslyObserved = new Set();// Use a Set for efficient lookups
async function getHighestVisibleH2(getLastClickedVerse=true) {
    observer?observer.disconnect():null;//remove the previous intersection observer if there is
    return new Promise((resolve, reject) => {
        function generateReturnObject(elms) {
            const [topmostElement] = elms; // The first element in the set is the topmost intersecting element
            if (!topmostElement) {resolve(null);return;}
            const highestElm = topmostElement;
            let aORb;
            let highestChptHeading, highestChptBody, highestVerse;
            let refActive = document.activeElement.matches('#reference');
            if (topmostElement.matches('.vmultiple')) {
                aORb=1;
                highestVerse = topmostElement;
                highestChptBody = topmostElement.closest('.chptverses');
                highestChptHeading = highestChptBody.previousElementSibling;
                !refActive?(reference.value = highestVerse.getAttribute('ref')):null;
            } else if (topmostElement.matches('.chptheading')) {
                aORb=2;
                highestChptHeading = topmostElement;
                highestChptBody = highestElm.nextElementSibling;
                highestVerse = highestChptBody.querySelector('.vmultiple');
                !refActive?(reference.value = highestChptHeading.innerText):null;
            }

            const highestChptHeading_Value = highestChptHeading.innerText; // Just Book and Chapter in Page Title
            // const highestChptHeading_Value = highestVerse.getAttribute('ref'); // Full Reference in Page Title
            if (oldChapter!=highestChptHeading_Value) {
                oldChapter=highestChptHeading_Value;
                document.querySelector('head>title').innerText = highestChptHeading_Value;
                
                const hID = highestChptHeading.id;
                let selectedChapter = bible_chapters.querySelector(`[value="${hID.replace(/_(\d+).(\d+)/,'bk$1ch$2')}"]`);
                bkName = highestChptHeading_Value.replace(/\s*\d+:*\s*\d*$/,'');bookName=bkName;
                let optbybkName = bible_books.querySelector(`[bookname="${bkName}"]`);

                bible_nav.querySelectorAll('.ref_hlt').forEach(optChpt => {optChpt.classList.remove('ref_hlt')});
                if(x=bible_chapters.querySelectorAll(`.show_chapter:not([bookname="${bkName}"])`)){
                    x.forEach(optChpt => {optChpt.classList.remove('show_chapter')});
                    bible_chapters.querySelectorAll(`[bookname="${bkName}"]`).forEach(optChpt => {optChpt.classList.add('show_chapter')});
                }
                const sivo = {behavior:"smooth",block:"center"};
                selectedChapter?(selectedChapter.classList.add('ref_hlt'),setTimeout(() => {selectedChapter.scrollIntoView(sivo)}, 1)):null;
                optbybkName?(optbybkName.classList.add('ref_hlt'),setTimeout(() => {optbybkName.scrollIntoView(sivo)}, 1)):null;
                
                if (oldBookName!=bkName) {appendMarkersToSideBar();oldBookName=bkName;}//update markers // should be when book is different not chapter
            }
            getLastClickedVerse?lastClickedVerse=highestVerse:null;
            highest_verse = highestVerse;
            const returnObject = { highestElm, highestChptHeading, highestChptBody, highestVerse };
            resolve(returnObject);
        }

        const callback = (entries, observer) => {
            const intesectingElements = new Set();
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const elm = entry.target;
                    intesectingElements.add(elm);
                }
            });
            generateReturnObject(intesectingElements);
        };

        const options = {
            root: document.querySelector("#main"),
            rootMargin: "-10px 0px 0px 0px",
            threshold: 0,
        };
        observer = new IntersectionObserver(callback, options);

        // Unobserve any previously observed element
        previouslyObserved.forEach(element => { observer.unobserve(element); });
        main.querySelectorAll('.chptheading, .vmultiple').forEach(x => {
            previouslyObserved.add(x);
            observer.observe(x);
        });
        // document.querySelectorAll('.vmultiple').forEach(x => { observer.observe(x) });
    });
}
let allVisitedChapters = [];
let previousBibleBook = null;

/* REMOVE HIGHEST AND LOWEST CHAPTERS VERSES */
function remove_HIGHEST_Chapter() {
    if (main.querySelectorAll('.chptheading').length >= maxNumOfChptsOnPage) {
        // let highestChapterHeading = main.querySelector('.chptheading:first-of-type');
        let highestChapterHeading = main.querySelector('.chptheading');
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
    if (main.querySelectorAll('.chptheading').length >= maxNumOfChptsOnPage) {
        // let lowestChapterHeading = main.querySelector('.chptheading:last-of-type');
        let lowestChapterHeading = main.lastOfType('.chptheading');
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

let prev_bkNumb=null;
let preventRefInRefereceInput=true;//to prevent changing of the first reference in the referenceInput on page load

async function loadNewChapterOnScroll(e) {
    if(dontGetLastVerse){return};
    await getHighestVisibleH2();
    let lastScrollTop = 0;
    var mst = main.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
    if (mst > lastScrollTop) {// downscroll code
        if (main.scrollHeight - main.scrollTop - main.clientHeight < 100) {
            // If you have scrolled to the end of the element
            loadNewChapter_After_Last_DisplayedChapterOnPage();
        }
    } else {// upscroll code
        if (main.scrollTop < 10) {
            //If you have scrolled to the top of the element
            loadNewChapter_Before_First_DisplayedChapterOnPage();
        }
    }
    // For Mobile or negative scrolling
    lastScrollTop = mst <= 0 ? 0 : mst;
}

async function loadNewChapter_After_Last_DisplayedChapterOnPage(){
    // let lastChapter = main.querySelector('.chptverses:last-of-type');
    let lastChapter = main.lastOfType('.chptverses');
    bkNumb = lastChapter.getAttribute('bookid');
    let chptNumb = lastChapter.getAttribute('chapter') - 1;
    let nextChapter = bible_chapters.querySelector(`[value="bk${bkNumb}ch${Number(chptNumb)}"]`).nextElementSibling;// From Bible Nav

    if (nextChapter) {
        remove_HIGHEST_Chapter();
        await getTextOfChapterOnScroll(nextChapter, 0);
        indicateThatVerseHasNoteInJSONnotes_file();
    }
    transliteratedWords_Array.forEach(storedStrnum => {showTransliteration(storedStrnum)});
}
async function loadNewChapter_Before_First_DisplayedChapterOnPage(){
    // let firstChapter = main.querySelector('.chptverses:first-of-type')
    let firstChapter = main.querySelector('.chptverses')
    bkNumb = firstChapter.getAttribute('bookid');
    let chptNumb = firstChapter.getAttribute('chapter') - 1;
    let prevChapter = bible_chapters.querySelector(`[value="bk${bkNumb}ch${Number(chptNumb)}"]`).previousElementSibling
    if (prevChapter) {
        remove_LOWEST_Chapter()
        await getTextOfChapterOnScroll(prevChapter, true, true);
        indicateThatVerseHasNoteInJSONnotes_file();
    }
    transliteratedWords_Array.forEach(storedStrnum => {
        showTransliteration(storedStrnum)
    });
}
/* Scroll To Target Verse */
async function scrollToVerse(targetVerse) {
    //When verse is put in a verse holder for multiple verses
    if (targetVerse.closest('.vmultiple')) {targetVerse = targetVerse.closest('.vmultiple');}
    // if (targetVerse.parentElement.classList.contains('vmultiple')) {targetVerse = targetVerse.parentElement}
    let scrollBehaviour = scrollToVerseBtn_check.checked ? {behavior: "smooth"}: null;
    //(if no previous-sibling, then it must be the first verse so) scroll to parents sibling (which should be the heading)
    if (targetVerse == targetVerse.parentElement.querySelector('.vmultiple')) {
        targetVerse.closest('.chptverses').previousElementSibling.scrollIntoView(scrollBehaviour);
    } else {
        targetVerse.scrollIntoView(scrollBehaviour);
    }
}

function checkVisible(elm) {
    //From: https://stackoverflow.com/questions/5353934/check-if-element-is-visible-on-screen
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= -10);
}

/* GO TO PREVIOUS / NEXT CHAPTER */
async function goToNextPrevChapter(pn){
    if(document.activeElement.matches('input, .showhidebookgrps, .biblebooksgroup_dropdown_content, .biblebooksgroup_dropdown_content button, .verse_note .text_content, .verse_note .text_content *, .cke_dialog_body') || document.body.classList.contains('cke_dialog_open')){return}

    // "pn" may be a string (+/-) or a windows key press event
    
    if(pn instanceof Event) {
        if(pn.ctrlKey && [38,40].includes(pn.keyCode) && !pn.shiftKey && !pn.altKey){
            if(pn.keyCode==38){pn='-'}
            else if(pn.keyCode==40){pn='+'}
        }
        else {return}
    }
    //if event, run only if it is ctrl + '-' or '+'
    // if(!['-','+'].includes(pn)){stopScrolling()};
    stopScrolling();
    
    let hchpt_H_obj = await getHighestVisibleH2();
    let hchpt_H = hchpt_H_obj.highestChptHeading;
    let hVisible_v = hchpt_H_obj.highestVerse;
    let hChptBody = hchpt_H_obj.highestChptBody;
    
    // Goto (beginning of chapter or if already at beginning, go to) previous chapter
    if(pn=='-'){
        // Scroll to the beginning of the chapter if the highestVerse is not verse1 
        // if (!hVisible_v.matches('.vmultiple:first-of-type')){
        let hvParent = hVisible_v.parentElement;
        if (hVisible_v != hvParent.querySelector('.vmultiple')){
            // if the hVisible_v is not the 1st,2nd or 3rd, jump to 3rd and then scroll
            // if (!hVisible_v.matches('.vmultiple:first-of-type, .vmultiple:nth-of-type(2), .vmultiple:nth-of-type(3)')){
            let firstThreeVmultiple = Array.from(hvParent.querySelectorAll('.vmultiple'));
            firstThreeVmultiple = firstThreeVmultiple.length > 3 ? firstThreeVmultiple.slice(0,3) : firstThreeVmultiple;
            if (!firstThreeVmultiple.includes(hVisible_v)){
                // hChptBody.querySelector('.chptverses .vmultiple:nth-of-type(2)').scrollIntoView();
                firstThreeVmultiple[1].scrollIntoView();
            }
            hchpt_H.scrollIntoView({behavior:'smooth'});
        }
        else {
            if (hchpt_H == main.querySelector('.chptheading')){
                // The previous chapter before this chapter is not already loaded on page // Load new chapter and then scroll to it
                loadNewChapter_Before_First_DisplayedChapterOnPage();
            }
            //jump to the second verse
            hchpt_H.previousElementSibling.querySelector('.chptverses .vmultiple:nth-of-type(2)').scrollIntoView();
            // then scroll to the chapter heading
            hchpt_H.previousElementSibling.previousElementSibling.scrollIntoView({behavior:'smooth'});}
        const hCH = await getHighestVisibleH2();
        updateRefBrowserHistory(hCH.highestChptHeading.innerText + ':1', true);
        gotochpt_prev.style.setProperty('background-color', 'brown', 'important');
        bottomleft_btns.style.setProperty('opacity', '1', 'important');
        setTimeout(() => {
            gotochpt_prev.style.backgroundColor="";
            bottomleft_btns.style.opacity="";
            goingToRef = false;
        }, 300);
    }
    // Goto next chapter
    else if(pn=='+'){
        // if(hchpt_H.matches('.chptheading:last-of-type')){
            if(hchpt_H == main.lastOfType('.chptheading')){
            // Load new chapter and then scroll to it
            loadNewChapter_After_Last_DisplayedChapterOnPage();
        }
        
        // jump to the second from the last verse (it is not the highest on the page)
        // if (!hVisible_v.matches('.vmultiple:last-of-type, .vmultiple:nth-last-of-type(2), .vmultiple:nth-last-of-type(3)')){
        let lastThreeVmultiple = Array.from(main.querySelectorAll('.vmultiple'));
        lastThreeVmultiple = lastThreeVmultiple.length > 3 ? lastThreeVmultiple.slice(-3) : lastThreeVmultiple;
        if (!lastThreeVmultiple.includes(hVisible_v)){
            // hchpt_H.nextElementSibling.querySelector('.chptverses .vmultiple:nth-last-of-type(2)').scrollIntoView();
            const vm = Array.from(hchpt_H.nextElementSibling.querySelectorAll('.chptverses .vmultiple')).reverse();
            vm.length > 1 ? vm[1].scrollIntoView() : vm[0].scrollIntoView();
        }
        // then scroll to the next chapter heading
        hchpt_H.nextElementSibling.nextElementSibling.scrollIntoView({behavior:'smooth'})

        const hCH = await getHighestVisibleH2();
        updateRefBrowserHistory(hCH.highestChptHeading.innerText + ':1', true);
        gotochpt_next.style.setProperty('background-color', 'brown', 'important');
        bottomleft_btns.style.setProperty('opacity', '1', 'important');
        setTimeout(() => {
            gotochpt_next.style.backgroundColor="";
            bottomleft_btns.style.opacity="";
            goingToRef = false;
        }, 300);
    }
}