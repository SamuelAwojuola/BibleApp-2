//Current Bible Version is changed with getCurrentBVN(e)
let bibleVersionsLoadedFromCACHE = [];
let loadedBibleVersions = [];
let versionsToShow = [];
let runCacheFunc2 = true;

//KJV Bible OT & NT
var request_KJV_URL = 'bibles/KJV.json';
var kjvBible = new XMLHttpRequest();
kjvBible.open('GET', request_KJV_URL);
kjvBible.responseType = 'json';
kjvBible.send();

var KJV;

window.onload = function () {
    kjvBible.onload = function () {
        let booksChaptersAndVerses = kjvBible.response;
        KJV = booksChaptersAndVerses['books'];
        populateBooks();
        cacheFunctions() //GET TRANSLITERATED ARRAY FROM CACHE
    }
    modifyRefNavChildrenHeight();
}

/* LOAD THE BIBLE */
let availableVersions = Object.assign({}, bible.Data.supportedVersions);
// Remove the following versions
['original', 'LC', 'GRKV'].forEach(key => delete availableVersions[key]);
let allLoadableVersions = [];
// Populate #bible_versions
for (key in availableVersions) {
    allLoadableVersions.push(key);
    bible_versions.innerHTML += `<div><input type="checkbox" id="${key}_version" name="${key}_version" value="${key}"><label for="${key}_version" abreviation="${key}" title="${availableVersions[key].name}">${key}</label></div>`;
}
//For the first time ever that the BibleApp is started
if (!localStorage.getItem('loadedBibleVersions')) {
    setTimeout(() => {localStorage.setItem('loadedBibleVersions', loadedBibleVersions);}, 1000);
}
bible_versions.addEventListener('change', async (e)=>{
    //Version Uploaded
    if ((e.target.checked) && (e.target.closest('#bible_versions'))) {
        loadVersion(e.target.getAttribute('value'));
        localStorage.setItem('loadedBibleVersions', loadedBibleVersions);
    }
    //Version Deloaded
    else if (!e.target.checked && (e.target.closest('#bible_versions'))) {        
        let versionName = e.target.getAttribute('value');
        let indxInVTS = versionsToShow.indexOf(versionName);
        if (indxInVTS > -1 && versionsToShow.length == 1) {//if it is included in the versions being shown
            e.target.checked = true;
            return
        }
        window[versionName] = null; //Delete the loaded JSON version
        loadedBibleVersions.splice(loadedBibleVersions.indexOf(versionName), 1);

        versionsToShow.splice(indxInVTS, 1);
        localStorage.setItem('versionsToShow', versionsToShow);
        let allVerseOfVersion = document.querySelectorAll(`.verse.v_${versionName}`);
        allVerseOfVersion ? allVerseOfVersion.forEach(v=>{v.remove()}) : null;

        localStorage.setItem('loadedBibleVersions', loadedBibleVersions);
        bibleversions_btns.querySelector(`[bversion="${e.target.getAttribute('value')}"]`).remove();
        if (singleverse_compare_menu) {
            singleverse_compare_menu.querySelector(`[bversion="${e.target.getAttribute('value')}"]`).remove();
        }
    }
});

/* ************************************* */
/* function loadVersion(versionName){} * */
/* ******* Moved To "helpers.js" ******* */
/* ************************************* */

bibleversions_btns.addEventListener('mouseover', function (e) {
    //To highlight all verses of buttons version
    let pbtn = e.target;
    if (!pbtn.matches('[bversion]')) {return}
    let v = pbtn.getAttribute('bversion');
    let allVersesBelongingToVersion = ppp.querySelectorAll(`.chptverses > .vmultiple .v_${v}`);
    allVersesBelongingToVersion.forEach(vrs => {vrs.classList.add('hovered_version');});
    bibleversions_btns.addEventListener('mouseout', highlightAllVersesOfVerion)
    function highlightAllVersesOfVerion(){
        allVersesBelongingToVersion.forEach(vrs => {vrs.classList.remove('hovered_version');});
        bibleversions_btns.removeEventListener('mouseout', highlightAllVersesOfVerion)
    }
})
bibleversions_btns.addEventListener('mousedown', function (e) {
    let pbtn = e.target;
    if (!pbtn.matches('[bversion]')) {return}
    pbtn.classList.add('activationDeactivationReady');
    bibleversions_btns.addEventListener('mouseup', activateORdeactiveVersion)
    function activateORdeactiveVersion(){
        //The .activationDeactivationReady class is removed by mousemove so that the click eventlistener does not work
        if (pbtn.matches("[bversion].activationDeactivationReady")) {
            setTimeout(() => {pbtn.classList.remove('activationDeactivationReady');}, 10);
            bibleversions_btns.removeEventListener('mouseup', activateORdeactiveVersion)
        }
    }
})
bibleversions_btns.addEventListener('click', async (e)=>{await setActiveBibleVersionsasync(e)});
async function setActiveBibleVersionsasync(e){
    let pbtn = e.target;
    //If mousemove has taken place, the .activationDeactivationReady class would have been removed so that the click eventlistener does not work
    if (pbtn.matches('[bversion].activationDeactivationReady')) {
        !lastClickedVerse ? await getHighestVisibleH2() : null;
        const lcv_ref = lastClickedVerse.closest('.vmultiple').getAttribute('ref');//verse to scroll back to
        setTimeout(() => {//Delayed so that the css transition on the button would have taken place on the button before the version is added or removed
            let pbtnCheck = pbtn.querySelector('input');
            let vname = pbtn.getAttribute('bversion');
            // Remove version from vmultiple
            if ((pbtnCheck.checked) && (bibleversions_btns.querySelectorAll('[bversion] input:checked').length > 1)) {
                pbtn.classList.remove("active_button");
                pbtnCheck.checked = false;
                //remove the book from the display
                let versionVersesToRemove = document.querySelectorAll(`.v_${vname}`);
                versionVersesToRemove.forEach(v2r => {v2r.remove()});
                versionsToShow.splice(versionsToShow.indexOf(vname), 1);
                localStorage.setItem('versionsToShow', versionsToShow)
                // re-enable its twin
                if (main.querySelector('#singleverse_compare_menu')) {
                    let twinInSingleVerseCompare = singleverse_compare_menu.querySelector('[bversion="' + vname + '"]');
                    twinInSingleVerseCompare.disabled = false;
                    twinInSingleVerseCompare.classList.remove('active_button');
                }
                //MOVE DE-SELECTED VERSION BELOW SELECTED VERSIONS
                let elm2moveDown = pbtn.cloneNode(true);
                pbtn.remove();
                let elm2precede = bibleversions_btns.querySelector('button:not(.active_button)');
                bibleversions_btns.insertBefore(elm2moveDown, elm2precede);
                localVersionLoader();
                lcv_ref?setTimeout(()=>{main.querySelector(`.vmultiple[ref="${lcv_ref}"]`).scrollIntoView()},5) : null;
            }
            // Add version from vmultiple
            else if ((!pbtnCheck.checked)) {
                pbtn.classList.add("active_button");
                pbtnCheck.checked = true;
                if (versionsToShow.includes(vname) == 0) {
                    versionsToShow.push(vname);
                    localStorage.setItem('versionsToShow', versionsToShow);
                    //display the book
                    let allLoadedmainVerses = main.querySelectorAll('.vmultiple');
                    // 
                    allLoadedmainVerses.forEach(vrs => {
                        let singleCompV = vrs.querySelector('.v_' + vname);
                        singleCompV ? singleCompV.remove():null; //if there is a single compare version for this version in the vmultiple, remove it
                        let bkid = vrs.id.split('.')[0];
                        let v_ref = vrs.querySelector('code')?.getAttribute('ref')?.split(' ');
                        
                        if (v_ref) {
                            let chptNv = v_ref.pop();
                            let bookName = v_ref.join(' ');
                            chptNv = chptNv.split(':');
                            let chNumInBk = chptNv[0]
                            let vIdx = chptNv[1];
                            // let vText = window[vname][bookName][Number(chNumInBk) - 1][Number(vIdx) - 1];
                            // let vText2 = window[vname]?(window[vname][bookName]?(window[vname][bookName][Number(chNumInBk) - 1]?window[vname][bookName][Number(chNumInBk) - 1][Number(vIdx) - 1]:null):null):null;
                            let vText2 = window[vname]?.[bookName]?.[Number(chNumInBk) - 1]?.[Number(vIdx) - 1] ?? null;
                            
                            if (vText2) {
                                let appendHere = vrs;
                                parseSingleVerse(bkid, chNumInBk, vIdx, vText, appendHere, bookName, null, true, vname);
                            }
                        }
                    });
                    if (document.querySelector('#singleverse_compare_menu')) {
                        let twinInSingleVerseCompare = singleverse_compare_menu.querySelector('[bversion="' + vname + '"]');
                        twinInSingleVerseCompare.disabled = true;
                        twinInSingleVerseCompare.classList.add('active_button');
                    }
                    localVersionLoader();
                    lcv_ref?setTimeout(()=>{main.querySelector(`.vmultiple[ref="${lcv_ref}"]`).scrollIntoView()},5) : null;
                }
                //MOVE SELECTED VERSIONS TO THE TOP
                if (bibleversions_btns.querySelector('button:not(.active_button)')) {
                    let elm2precede = bibleversions_btns.querySelector('button:not(.active_button)');
                    let pbtnClone = pbtn;
                    bibleversions_btns.insertBefore(pbtnClone, elm2precede);
                }
            }
            pbtn.classList.remove('activationDeactivationReady');
        }, 90);
    }
}
/* COMPARE SINGLE VERSE */
// function compareThisVerse() {}
let clickedVerseRef, clickedChapterNverse;

function breakDownClickedVerseRef(cvdivider = '.', manual_ref) {

    // "manual_ref" is manually inputed reference
    let in_ref;
    if (manual_ref) {in_ref = manual_ref}
    else {in_ref = clickedVerseRef}

    let fullRefSplit = in_ref.split(' ');
    let bN, bC, cV, bCnCv;
    bCnCv = fullRefSplit.pop().split(':').join(cvdivider);
    clickedChapterNverse = bCnCv;
    bC = bCnCv.split('.')[0];
    cV = bCnCv.split('.')[1];
    bN = fullRefSplit.join(' ');
    return {
        bCnCv: bCnCv,
        bC: bC,
        cV: cV,
        bN: bN,
        clickedChapterNverse: clickedChapterNverse,
    }
}

//To ensure local versions loader does not load if a verse is double clicked
const add_VersionsLoader_preventDoublick = debounce(local_versionsloader, 300);

//The actual function that adds the local versions loader to the window
function local_versionsloader(e) {
    let clkelm = e.target;
    // let eT_classes = clkelm ? '.' + clkelm.classList.value.split(' ').join(',.') : null;
    let eT_classes = clkelm ? clkelm.classList.value : null;
    // Remove #singleverse_compare_menu by clicking directly on it (i.e., if you are not clicking on any of its children)
    if (clkelm.matches('#singleverse_compare_menu')) {
        clkelm.remove();
        main.removeEventListener('click', local_versionsloader)
        searchPreviewFixed.removeEventListener('click', local_versionsloader)
        return
    }
    /* ATTACH VERSE VERSION COMPARE BUTTONS */
    if (clkelm.matches('.verse,.vmultiple')) {
        if (clkelm.querySelector('#singleverse_compare_menu')) {
            // clkelm.querySelector('#singleverse_compare_menu').remove();
            // main.removeEventListener('click', local_versionsloader)
            // searchPreviewFixed.removeEventListener('click', local_versionsloader)
            // return
        }
        clickedVerseRef = clkelm.querySelector('[ref]').getAttribute('ref');
        if (scm=document.querySelector('#singleverse_compare_menu')) {scm.remove();}
        singleverse_compare_menu = bibleversions_btns.cloneNode(true);
        singleverse_compare_menu.querySelectorAll('input').forEach(inp=>{inp.remove()});
        singleverse_compare_menu.id = 'singleverse_compare_menu';
        let sverse_comp = singleverse_compare_menu;
        sverse_comp.setAttribute('clickedVerse',eT_classes);
        disableNenable_compareBtn();

        function disableNenable_compareBtn() {
            sverse_comp.querySelectorAll('[bversion][disabled]').forEach(vn => {
                vn.disabled = false;
                vn.classList.remove('active_button');
            })
            versionsToShow.forEach(vn => {
                let sverse_comp_btn = sverse_comp.querySelector('[bversion="' + vn + '"]');
                sverse_comp_btn.disabled = true;
                sverse_comp_btn.classList.add('active_button');
            })
            //On change of verse ensure that only versions of that verse are active
            if (hlv = sverse_comp.querySelectorAll('button:not([disabled])')) {
                hlv.forEach(b => {
                    let vn = b.getAttribute('bversion');
                    if (!clkelm.parentElement.querySelector('.v_' + vn)) { //If verse does not have the Version 
                        b.classList.remove('active_button');
                    } else { //If verse has the version
                        b.classList.add('active_button');
                    }
                })
            }
        }
        if (clkelm.matches('.vmultiple,.vmultiple .verse')) {
            clkelm.append(sverse_comp)
        } else if (clkelm.matches('.verse')) {
            insertElmAbeforeElmB(sverse_comp, clkelm.querySelector('.crfnnote'))
        }
        main.addEventListener('click', local_versionsloader)
        searchPreviewFixed.addEventListener('click', local_versionsloader)
        sverse_comp.classList.remove('displaynone')
        // sverse_comp.classList.add('slideintoview')
    }
}

// main.addEventListener('click', addLocalVersionsLoaderButtons)
main.addEventListener(contextMenu_touch, addLocalVersionsLoaderButtons)
searchPreviewFixed.addEventListener(contextMenu_touch, addLocalVersionsLoaderButtons)

function addLocalVersionsLoaderButtons(e) {
    // The local versions loader should not be loaded if there is context menu in the window.
    // IF there is 'context_menu', then the first click should remove it.
    if (main.querySelector('#context_menu.slideintoview') == null && searchPreviewFixed.querySelector('#context_menu.slideintoview') == null) {
        // add_VersionsLoader_preventDoublick(e) // this works with click eventListener
        local_versionsloader(e) // this works with contextmenu eventListener
    }
}
//Get and append (or un-append) reference on click of comparison version button
main.addEventListener('click', localVersionLoader);
searchPreviewFixed.addEventListener('click', localVersionLoader);

function localVersionLoader(e) {
    let clkelm, verseHolder, v, vmOvr;
    clkelm = e?e.target:null;
    if(clkelm && clkelm.closest('#inline_versions_buttons')){return}
    if (clkelm && clkelm.matches('#singleverse_compare_menu [bversion]')) {
        v = clkelm.closest('.verse');
        // v = v ? v : Array.from(clkelm.closest('.vmultiple').getElementsByClassName('_localcompare_v')).reverse()[0];
        v = v ? v : clkelm.closest('.vmultiple').getElementsByClassName(clkelm.closest('[clickedVerse]').getAttribute('clickedVerse').split(' ').find(x=>x.startsWith('v_')))[0];
        if(v){
            let w = v;
            while (w.nextElementSibling && w.nextElementSibling.matches('._localcompare_v')) {w = w.nextElementSibling;}
            v = w;
        }
        // v = v ? v : clkelm.closest('.vmultiple').querySelector('.verse:last-of-type');
        v = v ? v : clkelm.closest('.vmultiple').lastOfType('.verse');
        /* FOR MAIN WINDOW */
        if (vh = elmAhasElmOfClassBasAncestor(clkelm, '.vmultiple')) {
            verseHolder = vh;
            vmOvr = true;
        }
        /* FOR SEARCH WINDOW */
        else if (vh = elmAhasElmOfClassBasAncestor(clkelm, '.verse')) {
            verseHolder = vh;
            vmOvr = false;
        };
        let bversion = clkelm.getAttribute('bversion');
        if (!clkelm.matches('.active_button')) {
            let refBreakDownObj = breakDownClickedVerseRef();
            bC = refBreakDownObj.bC;
            cV = refBreakDownObj.cV;
            bN = refBreakDownObj.bN;
            bCnCv = refBreakDownObj.bCnCv;
            clkelm.classList.toggle('active_button');
            if (vmOvr) {
                parseSingleVerse(null, bC, cV, null, verseHolder, bN, null, true, bversion);
                let appendedVerse = verseHolder.getElementsByClassName('v_' + bversion)[0];
                appendedVerse.classList.add('_localcompare_v');
                //Move the appended version next to the version from which the funtion was called
                insertElmAafterElmB(appendedVerse, v);
                setFlexMinWidth_for_localCompareVerses(appendedVerse)
            } else {
                insertElmAbeforeElmB(getCrossReference(bN + '.' + bCnCv, null, bversion), verseHolder.querySelector('.crfnnote'))
            }
        } else {
            verseHolder.querySelector('.v_' + bversion).remove();
            clkelm.classList.toggle('active_button');
            setFlexMinWidth_for_localCompareVerses()
        }
    } else {
        let all_ilc = main.querySelectorAll('.inline-local-compare');
        if(all_ilc.length>0){
            all_ilc.forEach(ilc => {
                verseHolder = ilc.closest('.vmultiple');
                setFlexMinWidth_for_localCompareVerses();
                typeof singleverse_compare_menu != 'undefined' ? singleverse_compare_menu.remove():null;
            });
        } 
    }
    function setFlexMinWidth_for_localCompareVerses(added_V) {
        // Change the min-width of the verses to accommodate the newly added version
        let numOfVersionsBeforeFlexWrap = 100/(Number(getComputedStyle(document.documentElement).getPropertyValue('--maxwidth-of-verses-per-row').replace('%','')));
        //check index of actual clicked .verse among non ._localcompare_v against the max num of .verse per flex row
        let non_localcompare_v = Array.from(verseHolder.querySelectorAll('.verse:not(._localcompare_v)'));
        // let indxOFv = non_localcompare_v.indexOf(v);
        let numOf_lcv = verseHolder.querySelectorAll('._localcompare_v:not(.v_outside_minnum)').length;
        if(v && !((non_localcompare_v.indexOf(v) + 2) > numOfVersionsBeforeFlexWrap)){
            let mxw = numOfVersionsBeforeFlexWrap + numOf_lcv;
            let ilc = verseHolder.querySelector('.inline-local-compare');
            ilc?ilc.remove():null;//remove inline-local-compare style if it already has one
            verseHolder.innerHTML +=
`<style class="inline-local-compare">
[ref="${verseHolder.getAttribute('ref')}"] .verse:not(.v_outside_minnum) {
    min-width:${100/mxw}%!important
}
/* ._localcompare_v{border-left:10px solid grey;border-bottom:3px solid grey} */
</style>`
        } else{
            if(numOf_lcv==0){
                //remove inline-local-compare if it has one
                let ilc = verseHolder.querySelector('.inline-local-compare');
                ilc?ilc.remove():null;    
            }
            if(added_V){
                added_V.classList.add('v_outside_minnum');
                verseHolder.innerHTML +=
`<style class="inline-local-compare"">
/* ._localcompare_v{border-left:10px solid grey;border-bottom:3px solid grey} */
</style>`
        }
        }
    }
}
/* ****************************** */
/* REARRANGE VERSIONS BY DRAGGING */
/* ****************************** */
let isDragging = false;
bibleversions_btns.addEventListener('mousedown', bibleversionDragging)
bibleversions_btns.addEventListener('touchstart', bibleversionDragging, { passive: false })
main.addEventListener('mousedown', bibleversionDragging)
main.addEventListener('touchstart', bibleversionDragging, { passive: false })
function bibleversionDragging(e){
    if (e.target.matches('[bversion]') || (e.button==1 && e.target.matches('.vmultiple .verse'))) {
        
        // e.preventDefault()
        isDragging = true;
        let dragElement = e.target;
        if (dragElement.matches('[bversion]:not(.active_button), .verse._localcompare_v')) {return}//only drag active versions
        let elementsCrossedToLeft=[];
        let elementsCrossedToRight=[];
        let midpointsLeft=[];
        let midpointsRight=[];
        let otherElement=null;
        let initialTransformX = getTransformXPercentage(dragElement).tX;
        let initialTransformY = getTransformXPercentage(dragElement).tY;
        let direction;
        
        let initialX;
        let initialY;
        if(e.type=='mousedown'){
            initialX = e.clientX;
            initialY = e.clientY;
            // Add event listeners for mouse events
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            makeAllvmultipleVerseColsEqual();
        }
        else if(e.type=='touchstart'){
            initialX = e.touches[0].clientX;
            initialY = e.touches[0].clientY;
            // Add event listeners for touch events
            document.addEventListener('touchmove', handleMouseMove, { passive: false });
            document.addEventListener('touchend', handleMouseUp);
            makeAllvmultipleVerseColsEqual();
        }


        
        function handleMouseMove(e) {
            // makeAllvmultipleVerseColsEqual();
            let clientX, clientY;
            // e.preventDefault()
            function clientXYbasedOnTouchOrMouse() {
                if (e.type === 'mousemove' || e.type === 'mouseup') {
                    clientX = e.clientX;
                    clientY = e.clientY;
                } else if (e.type === 'touchmove' || e.type === 'touchend') {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                }
                return {clientX,clientY}
            }
            clientX=clientXYbasedOnTouchOrMouse().clientX;
            clientY=clientXYbasedOnTouchOrMouse().clientY;
            if (isDragging) {
                dragElement.classList.add('dragging'/* ,'relocating' */);
                dragElement.classList.remove('activationDeactivationReady');
                let currentX = clientXYbasedOnTouchOrMouse().clientX;
                let deltaX = currentX - initialX;//distance moved by mouse
                let width = dragElement.offsetWidth;
                let newTransformX_percent = initialTransformX + (deltaX / width) * 100;
                let newTransformX = initialTransformX + deltaX;

                let currentY = clientXYbasedOnTouchOrMouse().clientY;
                let deltaY = currentY - initialY;//distance moved by mouse
                let height = dragElement.offsetWidth;
                // let newTransformY = initialTransformY + (deltaY / height) * 100;
                let newTransformY = initialTransformY + deltaY;

                // setTransformXPercentage(dragElement, newTransformX, newTransformY);
                setTransformXPercentage(dragElement, newTransformX, 0, true);// 0 no transform along Y-axis
                console.log(dragElement.classList.toString());
                let overlappedElement = isElementOverlappingWithTransform(dragElement);
                otherElement = overlappedElement.otherElement;
                console.log(otherElement.classList.toString());
                if (otherElement && (otherElement.classList.contains('active_button') || ((opvm = dragElement.closest('.vmultiple')) && Array.from(opvm.children).includes(otherElement)))) {

                    let halfWayDistance=0;
                    direction = newTransformX<0?'left':'right';
                    if (direction=='right') {
                        if(elementsCrossedToRight.length>0){
                            elementsCrossedToRight.forEach(x=>{if(x!=otherElement){halfWayDistance += x.offsetWidth;}})
                        }
                        halfWayDistance += otherElement.offsetWidth/2;
                        if(elementsCrossedToRight.indexOf(otherElement)==-1 && dragElement != otherElement.nextElementSibling){
                            elementsCrossedToRight.push(otherElement);
                        }
                    }
                    else if (direction=='left') {
                        if(elementsCrossedToLeft.length>0){
                            elementsCrossedToLeft.forEach(x=>{if(x!=otherElement){halfWayDistance += x.offsetWidth;}})
                        }
                        halfWayDistance += otherElement.offsetWidth/2;
                        if(elementsCrossedToLeft.indexOf(otherElement)==-1 && dragElement != otherElement.previousElementSibling){
                            elementsCrossedToLeft.push(otherElement);
                        }
                    }
                    let distanceTranslated = Math.abs(newTransformX);
                    let distanceToTranslteOtherElement = dragElement.offsetWidth;

                    //Change the otherElement's transform to visually relocate it to where dragElement was
                    if (direction=='right') {
                        if (distanceTranslated > halfWayDistance) {
                            otherElement.classList.add('relocated')
                            setTransformXPercentage(otherElement, -distanceToTranslteOtherElement, 0, true);
                            midpointsRight.push(halfWayDistance);
                            translateVerses(newTransformX_percent,-100)
                        } else if (distanceTranslated < midpointsRight[midpointsRight.length-1]) {
                            otherElement.classList.remove('relocated')
                            setTransformXPercentage(otherElement, 0, 0, true);
                            midpointsRight.pop();
                            translateVerses(0,0)
                        }
                    }
                    else if (direction=='left') {
                        if (distanceTranslated > halfWayDistance) {
                            otherElement.classList.add('relocated')
                            setTransformXPercentage(otherElement, distanceToTranslteOtherElement, 0, true);
                            midpointsLeft.push(halfWayDistance);
                            translateVerses(newTransformX_percent,100)
                        } else if (distanceTranslated < midpointsLeft[midpointsLeft.length-1]) {
                            otherElement.classList.remove('relocated')
                            setTransformXPercentage(otherElement, 0, 0, true);
                            midpointsLeft.pop();
                            translateVerses(0,0)
                        }
                    }
                    function translateVerses(newTransformX_percent,x2) {
                        let dragedVersion = dragElement.getAttribute('bversion');
                        dragedVersion = dragedVersion?dragedVersion : getVerseVersion(dragElement);
                        let otherElmVersion = otherElement.getAttribute('bversion');
                        otherElmVersion = otherElmVersion ? otherElmVersion : getVerseVersion(otherElement);
                        let dragedVersionverses = ppp.querySelectorAll(`.chptverses > .vmultiple .v_${dragedVersion}`);
                        let otherElmVersionsverses = ppp.querySelectorAll(`.chptverses > .vmultiple .v_${otherElmVersion}`);
                        //can set it with style sheet in head instead
                        dragedVersionverses.forEach(vrs => {
                            vrs.classList.add('relocating');
                            setTransformXPercentage(vrs, newTransformX_percent, 0)
                        });
                        otherElmVersionsverses.forEach(vrs => {
                            vrs.classList.add('relocating_2');
                            setTransformXPercentage(vrs, x2, 0)
                        });
                    }
                }
            }
        }
        function handleMouseUp() {
            let relocatedElements = bibleversions_btns.querySelectorAll('.relocated');
            relocatedElements = relocatedElements.length > 0 ? relocatedElements : main.querySelectorAll('.relocating_2');
            isDragging = false;
            dragElement.classList.remove('dragging');
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
            dragElement.style.transform='';
            
            if (relocatedElements.length>0){
                if (direction=='right') {
                    let rE = relocatedElements[relocatedElements.length-1];
                    // bibleversions_btns.insertBefore(elm2moveDown, rE.nextElementSibling)
                    Array.from(bibleversions_btns.children).includes(dragElement) ? bibleversions_btns.insertBefore(dragElement, rE.nextElementSibling) : null;
                    let shifted_version = rE.getAttribute('bversion');
                    shifted_version = shifted_version ? shifted_version : getVerseVersion(rE);

                    relocatedElements.forEach(elm=>{
                        elm.style.transform='';
                        elm.classList.remove('relocated')
                    })
                    //change column of actual verses
                    let dragedVersion = dragElement.getAttribute('bversion');
                    dragedVersion = dragedVersion?dragedVersion : getVerseVersion(dragElement);

                    let dragedVersionverses = ppp.querySelectorAll(`.chptverses > .vmultiple .v_${dragedVersion}`);
                    dragedVersionverses.forEach(vrs => {
                        let vparent = vrs.parentElement;
                        let v = vrs;
                        let shiftedV = vparent.querySelector(`.v_${shifted_version}`);
                        vparent.insertBefore(v, shiftedV.nextElementSibling);
                    });
                }
                else if (direction=='left') {
                    relocatedElements.forEach(elm=>{
                        elm.style.transform='';
                        elm.classList.remove('relocated')
                    })
                    let shifted_version = relocatedElements[0].getAttribute('bversion');
                    shifted_version = shifted_version ? shifted_version : getVerseVersion(relocatedElements[0]);
                    // bibleversions_btns.insertBefore(dragElement, relocatedElements[0]);
                    Array.from(bibleversions_btns.children).includes(dragElement) ? bibleversions_btns.insertBefore(dragElement, relocatedElements[0]) : null;
                    //change column of actual verses
                    let dragedVersion = dragElement.getAttribute('bversion');
                    dragedVersion = dragedVersion?dragedVersion : getVerseVersion(dragElement);
                    
                    let dragedVersionverses = ppp.querySelectorAll(`.chptverses > .vmultiple .v_${dragedVersion}`);
                    dragedVersionverses.forEach(vrs => {
                        let vparent = vrs.parentElement;
                        let v = vrs;
                        let shiftedV = vparent.querySelector(`.v_${shifted_version}`);
                        vparent.insertBefore(v, shiftedV);
                    });
                }
                //Save the new order of books
                versionsToShow=[];
                bibleversions_btns.querySelectorAll('[bversion].active_button').forEach(bvBtn => {
                    let vname = bvBtn.getAttribute('bversion');
                    versionsToShow.push(vname);
                    localStorage.setItem('versionsToShow', versionsToShow);
                });
                removeRelocatingClasses()
            }
        }
        function makeAllvmultipleVerseColsEqual() {
            let ptfm = ppp.querySelector(".ppp-temp-flex-minwidth");
            if(!ptfm){
                let bvbnum = bibleversions_btns.querySelectorAll('[bversion]').length + 1;
                ppp.innerHTML += `<style class="ppp-temp-flex-minwidth">#ppp .vmultiple .verse {min-width:${100/bvbnum}%!important}</style>`
            }
        }
    }
    function getVerseVersion(elm) {return elm.classList.toString().match(/v_(\S*)/)[1]}
}
function removeRelocatingClasses(dragElement) {
    console.log('removeRelocatingClasses');
    
    ppp.querySelectorAll('.relocating').forEach(v => {
        v.style.transform='';
        setTimeout(()=>{v.classList.remove('relocating');}, 500);
    });
    ppp.querySelectorAll('.relocating_2').forEach(s => {
        s.classList.add('transition_none');
        s.style.transform = '';
        s.classList.remove('relocating_2');
        setTimeout(()=>{s.classList.remove('transition_none');}, 100);
    });
    let ptfm = ppp.querySelector(".ppp-temp-flex-minwidth");
    setTimeout(()=> {ptfm?ptfm.remove():null;}, 200);
}
function getTransformXPercentage(element) {
    const transform = window.getComputedStyle(element).getPropertyValue('transform');
    if (transform === 'none') {return {dx:0,tX:0,dy:0,tY:0}}
    const matrix = new DOMMatrix(transform);
    let dx = matrix.m41;
    let tX = (dx / element.offsetWidth) * 100;
    let dy = matrix.m42;
    let tY = (dy / element.offsetHeight) * 100;
    return {dx,tX,dy,tY}
}
function setTransformXPercentage(element, percentageX, percentageY, px=false) {
    if (px==false) {
        element.style.transform = `translate(${percentageX}%,${percentageY}%)`;
    } else {
        element.style.transform = `translate(${percentageX}px,${percentageY}px)`;
    }
}
function isElementOverlappingWithTransform(element) {
    const targetRect = element.getBoundingClientRect();
    const computedStyle = getComputedStyle(element);
    const transformMatrix = new DOMMatrix(computedStyle.transform);
  
    // Apply the transformation to the target element's bounding box
    const transformedRect = targetRect;
    const points = [
      new DOMPoint(transformedRect.left, transformedRect.top),
      new DOMPoint(transformedRect.right, transformedRect.top),
      new DOMPoint(transformedRect.left, transformedRect.bottom),
      new DOMPoint(transformedRect.right, transformedRect.bottom),
    ];
  
    for (const point of points) {
      const transformedPoint = point.matrixTransform(transformMatrix);
      transformedRect.left = Math.min(transformedRect.left, transformedPoint.x);
      transformedRect.right = Math.max(transformedRect.right, transformedPoint.x);
      transformedRect.top = Math.min(transformedRect.top, transformedPoint.y);
      transformedRect.bottom = Math.max(transformedRect.bottom, transformedPoint.y);
    }
  
    // Get a NodeList of all elements on the page (you can adjust this selector)
    // const allElements = document.querySelectorAll('#bibleversions_btns > [bversion]');
    const allElements = element.closest('#bibleversions_btns, .vmultiple').querySelectorAll('[bversion], .verse');
  
    // allElements.forEach(el => {console.log(el)});
    
    for (const otherElement of allElements) {
        // console.log((otherElement == element));
        
      if (otherElement == element) continue;
  
      const otherRect = otherElement.getBoundingClientRect();
  
      if (
        transformedRect.right >= otherRect.left &&
        transformedRect.left <= otherRect.right &&
        transformedRect.bottom >= otherRect.top &&
        transformedRect.top <= otherRect.bottom
      ) {
        return {otherElement};
      }
    }
    return {otherElement:null};
}

function toggleInlineVerseCompareContextMenu(dis) {
    if(singleverse_compare_menu = document.querySelector('#singleverse_compare_menu')){
        singleverse_compare_menu.classList.toggle('displaynone');
        const showing = singleverse_compare_menu.classList.toggle('show');
        if(showing && singleverse_compare_menu.parentElement != show_crossref_comments.parentElement){
            const x = main.querySelector('.vmultiple:has(#show_crossref_comments)');
            x ? x.appendChild(singleverse_compare_menu) : null;
        }
        else if(!showing){singleverse_compare_menu.remove();}
    }
    else {
        addLocalVersionsLoaderButtons({type:'click',target:dis.closest('.vmultiple').querySelector('.verse')});
        setTimeout(() => {
            const x = main.querySelector('.vmultiple:has(#show_crossref_comments)');
            x ? x.appendChild(singleverse_compare_menu) : null;
            singleverse_compare_menu.classList.add('show');
            singleverse_compare_menu.style.display = 'flex';
            singleverse_compare_menu.style.flexWrap = 'wrap';
            singleverse_compare_menu.style.flexDirection = 'column';
            singleverse_compare_menu.style.position = 'absolute';
            singleverse_compare_menu.style.width = '90px';
            singleverse_compare_menu.style.left = dis.getAttribute('left');
            singleverse_compare_menu.style.top = dis.getAttribute('top');
        }, 50);
    }
}
document.addEventListener("keydown",showBibleVersions_Btns)
function showBibleVersions_Btns(e){
    // CTRL + B (or V) (when active element is not a contentEditable element)
    if(e.ctrlKey && !document.activeElement.isContentEditable && (e.code=='KeyB' || (e.code=='KeyV' && document.activeElement.type!='text'))){
        !bibleversions_btns.matches('.slideintoview') ? showTopBar_refInput_OR_search('bibleVersion') : null;
    }
}