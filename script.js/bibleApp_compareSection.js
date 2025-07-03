/* ******************************** */
/* *** SCRIPTURE COMPARE WINDOW *** */
/* ******************************** */
async function fill_Compareverse(x, wordMap) {
    let x_p = x.parentElement;
    let x_input = x_p.querySelector('.verses_input');
    x_input.select();
    setTimeout(() => {
        //make first letter in book name upperCase
        x_input.value = x_input.value.replace(/\s+/g, ' ')
        .replace(/\s*;+\s*/g, ';')
        .replace(/(\p{L}{2,})([0-9])/ug,'$1 $2')
        .replace(/([0-9])(\p{L})/ug,'$1 $2')
        .replace(/([GHgh]\d+)\s+([Ii]*\s*\p{L}{2,}\s*\d+)/ug, '$1; $2')
        .replace(/([0-9]+)*\s*(\p{L}+(\s*\p{L})*)[\.\s+]([0-9]+)[:\.\s+]([0-9])/ug,'$1$2 $4:$5')
        .replace(/(\b\d*\s*\p{L}{2,}\s*\d+(:\d+((?:(\s*,\s*)|(\s*-\s*))\d+)*)*)/ug,(m,g1)=>{if(bible.Reference(g1)){return g1.replace(/(\d)\s*([,-])\s*(\d)/g, '$1$2$3') + ';'}})
        .replace(/([0-9]\s*)(\p{L})(\p{L}+)/ug, (m,g1,g2,g3) => {return g1 + g2.toUpperCase() + g3.toLowerCase()})
        .replace(/([a-zA-Z])(\w+\s*\d+)/g, (m, g1,g2) => {return g1.toUpperCase() + g2.toLowerCase();})
        .replace(/;+(\s*;)*/g,';')
        .replace(/;\s*$/g,'');
        
        // let arrayOfRefsAndSearchWords = x_input.value.replace(/((?<=[GH])\d+\b)[^\p{L}0-9]+(\p{L}+(?!\s*\d))/gu, '$1; $2').replace(/([GHgh]\d+);/g,'$1').split(';'); // For array of references
        let arrayOfRefsAndSearchWords = x_input.value.split(';'); // For array of references

        if (case_sensitive.checked) {
            arrayOfRefsAndSearchWords = Array.from(new Set(arrayOfRefsAndSearchWords)); // Remove duplicates observing case
        } else {
            arrayOfRefsAndSearchWords = removeDuplicatesIgnoreCase(arrayOfRefsAndSearchWords); // Remove duplicates ignoring case
        }
        x_input.value = arrayOfRefsAndSearchWords.join(' ;').replace(/\s+/g, ' ').trim();

        let refCount = 0;
        let cbknm;
        x_input.value = "";
        x_p.nextElementSibling.innerHTML = "";
        //Loop through each ref and word
        arrayOfRefsAndSearchWords.forEach((individualRefs, i) => {
            // let ref = x_input.value.replace....
            let ref = individualRefs.replace(/([a-zA-Z]{2})([0-9])/, '$1 $2').replace(/(\d)\s+(\d)/, '$1.$2').replace(/\s+/ig, ' ').replace(/\s*([:;,.-])\s*/ig, '$1').replace(/(\d),\s*(\d)\s*:\s*(\d)/ig, '$1; $2:$3').replace(/\[(^\]+)\]/ig, (m,b)=>{return m.match(/\d/g)?b:m;}).trim();
            if (ref.trim() != '' && ref.match(/[\w\p{L}]/gu).length > 1) {//match letters from any language
                const c = ref.match(/^([0-9]*\s*[a-zA-Z]+\s*\.*)[0-9]/); //ref book name to use for next ref if it has no book name
                if (c) {
                    cbknm = c[1].trim()
                } else if (cbknm && /[0-9][,.: ]+[0-9]/.test(ref)) {
                    ref = `${cbknm.trim()} ${ref}`
                }

                //Check if x is a scripture reference
                let bibleRefRegex = /^([1-3Ii]?(?:\s*[A-Za-z]{2,29}\.?\s*\d+|\d+\s*[A-Za-z]+\.?))(?::?(\d+)(?:-(\d+))?)?(?:\s*[:\.]\s*(\d+)(?:-(\d+))?)?(?:\s*,\s*(\d+)(?:-(\d+))?)*?$/;
                let isBibleReference = bibleRefRegex.test(ref);
                refCount++;
                refCount > 1 ? x_input.value += '; ' : null; //add semicolon to separate multiple refs
                if (isBibleReference) {
                    if (!/\d[.:]\d/.test(ref)) { //has no verse number (reference contains only chapter)
                        let chptnum = Number(ref.match(/[a-zA-Z]\s*([0-9]+)/)[1]);
                        ref = ref + '.1-' + bible.Data.verses[bible.getBookId(ref) - 1][chptnum - 1]; // Get last verse in chapter
                    }
                    x_input.value += ref.replace(/([a-zA-Z])\.(\d)/, '$1 $2').replace(/\./, ':');
                }
                
                searchNrefs(isBibleReference, ref, i);
            }
            else if (wordMap) {
                const alertString = `Input reference to word map, e.g., "Gal1;2;3-5"`;
                showAlert(alertString);
            }
        });

        async function searchNrefs(isBibleReference, ref, i) {
            if (isBibleReference) {
                // refCount > 1 ? x_input.value += '; ' : null; //add semicolon to separate multiple refs
                // x_input.value += ref.replace(/([a-zA-Z])\.(\d)/, '$1 $2').replace(/\./, ':');//moved into the arrayOfRefsAndSearchWords.forEach loop above because of WordMap
                const refBreakDown = breakDownRef(ref);//{bn,bc,cv,cv2,fullBkn}
                if(!wordMap){
                    let vHolder = getCrossReference(ref /*,refBreakDown.fullBkn*/);
                    
                    /* FOR CROSS-REFS & NOTES IN SEARCH WINDOW */
                    transliterateAllStoredWords(vHolder);
                    let vHolderSpanVerses = vHolder.querySelectorAll('span.verse');
                    vHolderSpanVerses.forEach(spanVerse => {
                        const [bN, bC, cV] = spanVerse.querySelector('[ref]').getAttribute('ref').split(/[(?<=\s)(?<=:)](?=\d)/);
                        checkAndIndicateThatVerseHasNote(bN, bC, cV, spanVerse);
                        const tskHolder = crfnnote_DIV(spanVerse);
                        showORdisplaynoneXrefSections(tskHolder);
                        spanVerse.append(tskHolder);
                    // Append Version Name
                    // vHolderSpanVerses.forEach(spanVerse => {
                        spanVerseCode = spanVerse.querySelector('code[ref]');
                        spanVerseCode.innerText = `(${bversionName})${spanVerseCode.innerText}`;
                    });
                    vHolder.prepend(h2divider(modifyBkNmeOfRef(ref).full.replace(/\./g, ':')));
                    let refseperator = '';
                    if (i == 0 || !x_p.nextElementSibling.querySelector('span:last-child .notfromsearch')) {
                        //If there was a preceding sub-section and it was a search result, differentiate this sub-section from it as a reference result
                        refseperator = document.createElement('span');
                        refseperator.innerText = 'Reference(s) Result';
                    }
                    let subSectionSpan = subSection();
                    // x_p.nextElementSibling.append(vHolder);
                    subSectionSpan.append(vHolder);
                    //Distinguish it from when it is used for search
                    // x_p.nextElementSibling.classList.remove('compare_search');
                    subSectionSpan.classList.remove('compare_search');
                    subSectionSpan.classList.add('notfromsearch');
                    subSectionSpan.prepend(refseperator);
                    subSectionSpan.addEventListener('click', showVersesUnderH2);
                    x_p.nextElementSibling.id = '';
                }
                else {                    
                    let wordMap = generateWordMap(refBreakDown.fullBkn, refBreakDown.bc, refBreakDown.cv/* , refBreakDown.bc, refBreakDown.cv2 */);
                    let subSectionSpan = subSection();
                    subSectionSpan.innerHTML=wordMap;
                    subSectionSpan.addEventListener('click', showVersesUnderH2);
                }
            }
            // If word and not a reference
            else {
                cbknm = null;
                // refCount > 1 ? x_input.value += '; ' : null;
                x_input.value += ref;
                let subSectionSpan = subSection();
                await runWordSearch(ref,subSectionSpan);
            }
        }

        function subSection() {
            // So that the search results and refs can be separated properly
            // runSearch() prepends analysis to results holding element. This would be the comparDiv itself and will be wrong if it has more than one search or ref to return.
            let subSectionSpan = document.createElement('span');
            x_p.nextElementSibling.append(subSectionSpan);
            x_p.nextElementSibling.scrollTo(0, 0);
            return subSectionSpan;
        }

        function h2divider(ref) {
            let chapterHeading = document.createElement('h2');
            chapterHeading.classList.add('chptheading');
            chapterHeading.classList.add('notfromsearch');
            chapterHeading.tabIndex = 0;
            // const divider = specifiedChptsToSearch.length ? ' ::' : '';
            chapterHeading.innerText = `${ref}`;
            return chapterHeading
        }
    }, 75);
}

function add_verseCompColumn(x) {
    let scriptureCompare_columns = elmAhasElmOfClassBasAncestor(x, '.scriptureCompare_columns');
    let newCompareColumn = createNewElement('DIV', '.scriptureCompare_columns');
    newCompareColumn.innerHTML = `<div class="input_n_btn"><input class="verses_input" placeholder="Enter Bible Reference"></input><select class="nearbyVerses" onchange="updateNearbyVersesSelect(this.value)" title="Adjacent verse(s) to include in search."><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option></select><button onclick="fill_Compareverse(this)">GO</button><button class="wordmap_btn" onclick="wordMapFromVerseCompareInput(this)" title="Word Map">WM</button><button onclick="delete_verseCompColumn(this)">-</button><button onclick="add_verseCompColumn(this)">+</button></div>
    <div class="compare_verses"></div>`;
    insertElmAafterElmB(newCompareColumn, scriptureCompare_columns);
    newCompareColumn.querySelector('input').select();
}

function delete_verseCompColumn(x) {
    // First remove style in head if it is a search result
    const x_p = x.parentElement;
    const resultContainer = x_p.nextElementSibling;
    if (resultContainer.classList.contains('compare_search')) {
        let searchStyleID = resultContainer.id + '_style';
        document.head.querySelector('#' + searchStyleID).remove()
    }
    let scriptureCompare_columns = x.closest('.scriptureCompare_columns');
    const sCc = Array.from(scriptureCompare_columns_holder.querySelectorAll('.scriptureCompare_columns'));

    //change value of mrcib based on first input with value
    if (mrcib && mrcib.closest('.scriptureCompare_columns') == scriptureCompare_columns) {
        mrcib = null;
        let precedingInputWithValue = Array.from(scriptureCompare_columns_holder.querySelectorAll('.verses_input')).reverse().find(x => x != scriptureCompare_columns.querySelector('input.verses_input') && x.value.trim() !== '');
        if (precedingInputWithValue) {
            mrcib = precedingInputWithValue.parentElement.querySelector('button'); //input's GO btn
            precedingInputWithValue.select();
        }
    }
    if (sCc.length > 1) {
        deleteNselectInput();
        scriptureCompare_columns.remove();
    } else {
        scriptureCompare_columns.querySelector('.compare_verses').innerHTML = '';
        scriptureCompare_columns.querySelector('.verses_input').value = '';
    }

    function deleteNselectInput() {
        let sCcIndx = sCc.reverse().indexOf(scriptureCompare_columns);
        if (sCcIndx > 0) { //If it is not the first that is being deleted
            sCc[sCcIndx - 1].querySelector('input').select(); //select input in preceding .scriptureCompare_columns
        } else { //If it is the first that is being deleted
            sCc[sCcIndx + 1].querySelector('input').select();
        }
    }
}
let mrcib = null; //most Recent Compare Input Button
function scriptureCompareWindowBtnToggle(e) {
    if (!e || e.altKey && e.code == 'KeyC') {
        if (e) {
            e.preventDefault()
        }
        const hdtime = hideRefNav(null, scriptureCompareWindow);

        //Select the last .verses_input after the scriptureCompareWindow has been displayed
        setTimeout(() => {
            //check after the hdtime delay, then you will be sure the scriptureCompareWindow is fully showing
            // const lastverses_input = refnav_col2.querySelector('#scriptureCompareWindow:not(.displaynone) .verses_input:last-of-type');
            const lastverses_input = refnav_col2.lastOfType('#scriptureCompareWindow:not(.displaynone) .verses_input');
            lastverses_input ? lastverses_input.select() : null;
            if (scriptureCompareWindow.matches('.slideintoview')) {
                let bt = setInterval(() => {
                    sCWToggleBtns_active_button_toggle(bt)
                }, 100)
            }
        }, hdtime.delay);
        // scriptureCompareWindow.addEventListener('focusin',saveCurrentInput)
        scriptureCompareWindow.addEventListener('input', saveCurrentInput)
        //Remove eventlistener when compare window is no longer open
        let t = setInterval(() => {
            scriptureCompareWindow.matches('.displaynone') ? (scriptureCompareWindow.removeEventListener('focusin', saveCurrentInput), mrcib = null, clearTimeout(t)) : null;
        }, 100);
    }

    function saveCurrentInput(evt) {
        if (evt.target.matches('input.verses_input')) {
            mrcib = evt.target.parentElement.querySelector('button'); //first btn is the GO btn
        }
    }
}

function sCWToggleBtns_active_button_toggle(bt) {
    const scwdi = scriptureCompareWinDetacher_inHeader;
    scriptureCompareWindow.matches('.slideoutofview') ? (scwdi.classList.remove('active_button'), comparewindowBtn.classList.remove('active_button'), bt ? clearTimeout(bt) : null) : (scwdi.classList.add('active_button'), comparewindowBtn.classList.add('active_button'));
}

// ALT + C TO OPEN COMPARE WINDOW
document.addEventListener('keydown', scriptureCompareWindowBtnToggle);
scriptureCompareWindow.addEventListener("mouseup", codeElmRefClick);
scriptureCompareWindow.addEventListener("contextmenu", openCloseAllDetailsInParent);
// scriptureCompare_columns_holder.addEventListener('click', showVersesUnderH2)
scriptureCompare_columns_holder.addEventListener('contextmenu', showVersesUnderH2);
/* Make Scripture Compare Window Draggable */
enableInteractJSonEl(btns_compareWindow_totheright, scriptureCompareWindow)
function removeAllVersesIn_A_From_B_(compA,compB) {
    let arrOfRefsInCompA =[];
    //Get verse references to remove
    compA.querySelectorAll("span[class*=v_].verse code[ref]").forEach(vref => {
        arrOfRefsInCompA.push(vref.getAttribute('ref'))
    });
    //Remove the verse references
    arrOfRefsInCompA.forEach(ref => {
        const r=compB.querySelector(`span[class*=v_].verse:has(code[ref="${ref}"])`)
        r?r.remove():null;
    });
}