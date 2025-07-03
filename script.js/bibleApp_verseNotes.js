let mouseHasMoved=false, mouseHasMoved_timer;
function mouseHasMoved_toggle(t) {
    mouseHasMoved=true;
    clearTimeout(mouseHasMoved_timer);
    t!=undefined?(mouseHasMoved_timer=setTimeout(()=>{mouseHasMoved=false;},t)):null;
}
main.addEventListener("mousemove", function(e){mouseHasMoved_toggle(500);});
main.addEventListener("mousedown", function(e){
    if (typeof show_crossref_comments!='undefined' && !show_crossref_comments.matches('.displaynone') && !e.target.matches('.verse_notes_button')){mouseHasMoved_toggle(e.button==2?0:500);}
    else {mouseHasMoved=false;}
});
main.addEventListener("mouseup", function(e){mouseHasMoved_timer=setTimeout(()=>{mouseHasMoved=false;},500);});
if(!document.querySelector('body').matches('#versenotepage')){
    // For '#verse_notes_button' && '.note_edit_button'
    main.addEventListener("click", showVerseNote);
    refnav.addEventListener("click", showVerseNote);
    
    // To open verse note in new window
    main.addEventListener(contextMenu_touch, showVerseNote);
    // To make verseNote editable on doubleClick
    main.addEventListener("dblclick", showVerseNote);
    // To save or stop editing currently edited verseNote
    main.addEventListener("keydown", showVerseNote);
    document.addEventListener("keydown", (e)=>{
        if (e.altKey && e.code=='KeyN') {
            if(e.ctrlKey){verseNoteToRightChecks()}// CTRL + ALT + N
            else if (!e.ctrlKey) {detachInlineVerseNote()}// ALT + N
        }
    })
    // For '#note_save_button'
    // To save new/edited verse note to coressponding JSON file
    main.addEventListener("click", saveJSONFileToLocalDrive);
    document.addEventListener('keyup', function(e) {
        if(!e.altKey && e.code=='KeyN' && !document.activeElement.matches('input, [contenteditable="true"]')){
            if(lastClickedVerse){
                mouseHasMoved=false;
                const eObj = {target:lastClickedVerse, callorigin:'n',type:'click'};
                showVerseNote(eObj)
            }
        }
    });
    document.addEventListener('keydown',noteNavigationByArrowKey);
}
function saveJSONFileToLocalDrive(e) {
    if (e.target.matches('.note_save_button')) {
        saveEditedNote(e.target,true);
        bookName=e.target.getAttribute('bk');
        let cNv=e.target.getAttribute('b_cv').split('.')
    }
}
function showVerseNote(e, x, showNote) {
    if(e){
        if(e.callorigin=='n') {appendVerseNote(e,showNote);}
        else if (e.type=='click' && (e.target.closest('#refnav') || !mouseHasMoved)) {
            // if (!mouseHasMoved && (typeof show_crossref_comments!='undefined' && !show_crossref_comments.matches('.displaynone')) && !e.target.closest('#verse_notes_button')) {return}

            if (!mouseHasMoved && showing_show_crossref_comments && !e.target.closest('#verse_notes_button')) {return}
            if(e.timeStamp){
                // clickTimeStamp is the timeStamp of mouseup of the mousedown that hid/removed the contextmenu
                // If the timeStamp of this click is  the same as clickTimeStamp, then it is a click to hide the cmenu
                // Therefore, don't show the versenote
                if (!e.target.closest('#verse_notes_button')) {
                    if(e.timeStamp==clickTimeStamp || pagemaster.querySelector("#main > #context_menu:not(.displaynone):not(.slideoutofview)")){return}
                }
                else {clickTimeStamp=e.timeStamp;}
            }
                // Get verse note, if available, from JSON file and append it
            if (e.target.closest('#verse_notes_button') || (notedetach_check.checked && e.target.matches('.vmultiple, .vmultiple .verse'))) {
                if (e.target.closest('.context_menu, #refnav .verse.noted')) {
                    showNoteForVerseNOTinMainBibleWindow(e.target.closest('.verse').querySelector('.crfnnote .verse_notes_button'));
                }
                else {appendVerseNote(e,showNote);}
            }
        }
        // Edit verse note
        else if (e.target.matches('.note_edit_button') && (e.type=='click' || ['Enter',' '].includes(e.key))) {
            let saveBtn = e.target.parentNode.querySelector('.note_save_button');
            editVerseNote(e.target, e, saveBtn);
        }
        else if (e.type==contextMenu_touch) {
            // Open verse note in a new window (on rightClick of #verse_notes_button)
            if (e.target.matches('#verse_notes_button')) {
                appendVerseNote(e,showNote);
            }
        }
        //make verseNote editable by double-clicking anywhere in the verse note
        else if (e.type=='dblclick') {
            if (e.target.closest('.verse_note') && (!document.querySelector('.verse_note #context_menu') || (document.querySelector('.verse_note #context_menu') && (e.target!=context_menu && !e.target.closest('.context_menu'))))) {
                let verseNoteDiv = e.target.closest('.verse_note');
                let editBtn = verseNoteDiv.querySelector('.note_edit_button');
                let saveBtn = verseNoteDiv.querySelector('.note_save_button');
                editVerseNote(editBtn, e, saveBtn);
            }
        } 
        // ctrl+s for saving currently edited verseNote
        else if (e.ctrlKey && document.activeElement.matches('#noteEditingTarget') && (e.key==='s'||e.key==='S')){
            e.preventDefault();
            e.stopPropagation();
            //Get current book, chpt & verseNum from the active verseNote
            saveEditedNote(e.target);
        }
        // stop editing by pressing 'Escape' key 
        // moved to general_EscapeEventListener()
    }
    else {editVerseNote(x);}
}

function saveEditedNote(eTarget,saveBtn) {
    const x = saveBtn?eTarget:noteEditingTarget;
    bookName = x.getAttribute('bk');
    let cNv = x.getAttribute('b_cv').split('.');
    chapternumber = cNv[0];
    verseNumber = cNv[1];
    modifyRefsInNoteOnPage(x.closest('#noteEditingTarget,#noteEditingTarget.text_content[contenteditable],.text_content[contenteditable]'));
    /* ****************************** */
    /* DETERMINE FOLDER TO SAVE IT TO */
    /* ****************************** */
    if (eTarget.closest('.verse_note').querySelector('.t1.text_content')) { currentDefaultFolder = 'bible_notes'; }
    else { currentDefaultFolder = 'bible_notes_user1'; }
    /* ................................ */
    /* MODIFY THE BIBLE NOTES JSON FILE */
    /* ................................ */
    writeToVerseNotesFiles(bookName, chapternumber, verseNumber, currentDefaultFolder);
}

/* TO GET VERSE NOTE FROM JSON FILE AND APPEND EITHER TO THE VERSENOTE DIV OR TO A NEW HTML PAGE */
async function appendVerseNote(e,showNote=false) {
    if (document.body.classList.contains('cke_dialog_open') && document.activeElement.closest('.cke_dialog_body')){return}
    const prvlastClickedVerse = lastClickedVerse;
    let eTarget=e.target;
    let not_verse_notes_button = e.target.closest('#verse_notes_button');
    let noteBelongingToSelectedVerse;//formerly 'siblingVersenote'
    let verseToWhichNoteBelongs;//formerly 'masterVerseHolder'
    if (eTarget.matches('.vmultiple, .vmultiple *')) {
        //Get reference of clicked verse
        if(eTarget.matches('.vmultiple')){verseToWhichNoteBelongs = eTarget;}
        else {verseToWhichNoteBelongs = eTarget.closest('.vmultiple');}
        clickedVerseRef = verseToWhichNoteBelongs.querySelector('[ref]').getAttribute('ref');
    } else {
        //Get reference of clicked verse
        clickedVerseRef = eTarget.closest('[ref]').getAttribute('ref');
        verseToWhichNoteBelongs = eTarget.closest('.vmultiple');
    }

    //Make notes always come after crossref
    let elementTOappendAfter = undefined;//formerly 'whereTOappend'
    elementTOappendAfter = X_hasNoSibling_Y_b4_Z(verseToWhichNoteBelongs, '.crossrefs,.crossrefs_holder', '.vmultiple').elm2appendAfter;//either .vmultiple or versemarker if verse has

    /* CREATE VERSENOTE IF NOT AVAILABLE ELSE JUST TOGGLE IT */
    //If verse_note is not already attached to verse 
    if (!verseToWhichNoteBelongs.classList.contains('showing_versenote')) {
        let noteID = 'note' + verseToWhichNoteBelongs.id.replaceAll(".", "_");
        let chapterHolder = elmAhasElmOfClassBasAncestor(verseToWhichNoteBelongs, '.chptverses');
        
        //GET CURRENT BOOK NAME, CHAPTER & VERSE (NEEDED TO RETRIEVE VERSE-NOTE))
        let clickedVerseRefObj = breakDownClickedVerseRef();
        let bN = clickedVerseRefObj.bN;
        let bC = clickedVerseRefObj.bC;
        let cV = clickedVerseRefObj.cV;
        let bCnCv = clickedVerseRefObj.bCnCv;
        bookName=bN, chapternumber=bC, verseNumber=cV;

        if(e.type=='click'){
            // if (showing_show_crossref_comments) {return}//I don't remember why I added this
            if (showing_show_crossref_comments && !not_verse_notes_button) {return}//the above is the original
            let vnt = chapterHolder.querySelector('#' + noteID);
            
            /* ***** **** ********** ** ******** */
            /* FIRST TIME VERSE_NOTE IS ATTACHED */
            /* ***** **** ********** ** ******** */
            if (!vnt) {
                //cloned from template
                let newVerseNote = verse_note.cloneNode(true);
                newVerseNote.id = noteID;

                //Note Save and Edit Buttons Setting of Relevant Attributes 
                let saveBtn = newVerseNote.querySelector('.note_save_button');
                saveBtn.setAttribute('bk', bN);//Add refrence book_name to the button
                saveBtn.setAttribute('b_cv', bCnCv);
                let editBtn = newVerseNote.querySelector('.note_edit_button');
                editBtn.setAttribute('bk', bN);//Add refrence book_name to the button
                editBtn.setAttribute('b_cv', bCnCv);
                //Add refrence book_name to the newVerseNote
                newVerseNote.querySelectorAll('.text_content,.t1,.t2').forEach(t=>{t.setAttribute('bk', bN)});
                newVerseNote.querySelectorAll('.text_content,.t1,.t2').forEach(t=>{t.setAttribute('b_cv', bCnCv)});
                
                if(dnArr=document.querySelectorAll('.most_recent_note')) {dnArr.forEach(dn => {dn.classList.remove('most_recent_note')});}
                newVerseNote.classList.add('most_recent_note');

                /* ****** ******** ** *** *** ****** ***** **** */
                /* ACTUAL FUNCTION TO GET AND APPEND VERSE NOTE */
                /* ****** ******** ** *** *** ****** ***** **** */
                let appendHere = newVerseNote.querySelector('.text_content');//Where actual note (text) will be appended
                await readFromVerseNotesFiles(bN, bC, cV,appendHere);//WORKS WITH JSON BIBLE NOTES
                newVerseNote.classList.add('most_recent_note');
                // clickAllLisOnPage(appendHere);//click all lis on in the note to collapse them

                let notes_ref_head;
                notes_ref_head = newVerseNote.querySelector('.notes_ref_head');
                notes_ref_head.setAttribute('ref',`${bN} ${bC}:${cV}`);
                //If Note is to Be Detached
                if(notedetach_check.checked){
                    //Close any previously open detached note
                    if(dn=document.querySelector('.detached_note')) {
                        dn.classList.remove('detached_note');//remove class that makes is detached
                        closeNote(dn);//close it
                    }
                    const sbn = fullBookName(bN).shortBkn;
                    notes_ref_head.innerHTML=`<span ref="${sbn}.${bC}.${cV}">${sbn} ${bC}:${cV}</span>`;
                    newVerseNote.classList.add('detached_note');
                    if(show_versenote_totheright_2_check.checked){
                        newVerseNote.classList.add('versenote_totheright');//verseNote to the RightSide
                    }
                }

                // NOW ATTACHED THE NEW VERSE NOTE TO THE PAGE AT THE RIGHT POSITION
                elementTOappendAfter.parentNode.insertBefore(newVerseNote, elementTOappendAfter.nextSibling);
                
                verseToWhichNoteBelongs.classList.add('showing_versenote');
                noteBelongingToSelectedVerse = X_hasNoSibling_Y_b4_Z(verseToWhichNoteBelongs, 'div.note_temp_holder .verse_note,.verse_note', '.vmultiple').elmY;//the appended note (it is a sibling to the verse)
               
                slideUpDown(noteBelongingToSelectedVerse, 'show')

                // Make verseNote draggable
                if (notedetach_check.checked){enableInteractJSonEl(notes_ref_head, noteBelongingToSelectedVerse)};

                //Relocate verseNote to temporaryDiv to make it draggable from the very first time it is created
                let tempDiv = document.createElement('DIV');
                tempDiv.classList.add('note_temp_holder');
                tempDiv.classList.add(noteID);
                tempDiv.append(newVerseNote);
                elementTOappendAfter.parentNode.insertBefore(tempDiv, elementTOappendAfter.nextSibling);
                appendHere.querySelector('h1,h2,h3,h4,h5,h6')?(setTimeout(() => {generateNoteMenu(newVerseNote);newVerseNote.querySelector('.togglenav').focus()}, 10)):null;//open noteMenu by default
            }
            /* ******** ********** **** *** ******* **** ******** */
            /* TOGGLING VERSE_NOTE THAT HAS ALREADY BEEN ATTACHED */
            /* ******** ********** **** *** ******* **** ******** */
            else {
                vnt.style.display = '';
                slideUpDown(vnt,'show');
                verseToWhichNoteBelongs.classList.add('showing_versenote');
                if(tempDiv = vnt.closest(`.note_temp_holder.${noteID}`)) {
                    tempDiv.classList.remove('versenote_hidden');
                }
                if(dnArr=document.querySelectorAll('.most_recent_note')) {dnArr.forEach(dn => {dn.classList.remove('most_recent_note')});}
                vnt.classList.add('most_recent_note');
                let notes_ref_head;
                //If Note is to Be Detached
                if(notedetach_check.checked){
                    //Close any previously open detached note
                    if((dn=document.querySelector('.detached_note'))&&dn!=vnt) {
                        dn.classList.remove('detached_note');//remove class that makes is detached
                        closeNote(dn);//close it
                    }
                    const sbn = fullBookName(bN).shortBkn;
                    notes_ref_head = vnt.querySelector('.notes_ref_head');
                    notes_ref_head.innerHTML=`<span ref="${sbn}.${bC}.${cV}">${sbn} ${bC}:${cV}</span>`;
                    vnt.classList.add('detached_note','most_recent_note');
                    
                    if(show_versenote_totheright_2_check.checked){
                        vnt.classList.add('versenote_totheright');//verseNote to the RightSide
                    }
                }

                // Make verseNote draggable
                if (notedetach_check.checked){enableInteractJSonEl(notes_ref_head, vnt)}
                
            }
        }
        // If it is rightClicked, it is to be opened in a new window
        else if(e.type==contextMenu_touch){
            // Open new window and append verse note to the body
            // Check if win2 has been opened at any time (check if it has been created)
            if(!window2){
                // await openNewVerseNotesWindow({bN, bC, cV});// the new window is assigned "window2"
                // window2.close();
                await openNewVerseNotesWindow({bN,bC,cV});
            } else if(!window2.closed){
                window2.close();
                await goToRefInNewNotePageWindow(bN,bC,cV);
            }
            else if (window2.closed) { // if win2 is closed, reopen it
                await openNewVerseNotesWindow({bN, bC, cV});
            }
        }
    }
    //Hide verseNote if available on note button click
    else { 
        noteBelongingToSelectedVerse = X_hasNoSibling_Y_b4_Z(verseToWhichNoteBelongs, '.verse_note', '.vmultiple').elmY;
        showNote ? null : closeNote(noteBelongingToSelectedVerse,verseToWhichNoteBelongs);
    }
    setTimeout(() => {lastClickedVerse = prvlastClickedVerse;}, 300);
}
function closeNote(vnote,vholder,dIS){
    if(!vnote||vholder){
        if (vholder) {
            vnoteID = vholder.id.replace(/(_\d+)\.(\d+)\.(\d+)/ig, 'note$1_$2_$3');
            vnote = document.getElementById(vnoteID);
        } else if(dIS){
            vnote = elmAhasElmOfClassBasAncestor(dIS,'.verse_note');
            vnoteID = vnote.id;
            vholderID = vnoteID.replace(/note/ig, '').replace(/(\d+)_(\d+)_(\d+)/ig, '$1.$2.$3');
            vholder = document.getElementById(vholderID);
        }
    } else if (!vholder||vnote) {
        vnoteID = vnote.id;
        vholderID = vnoteID.replace(/note/ig, '').replace(/(\d+)_(\d+)_(\d+)/ig, '$1.$2.$3');
        vholder = document.getElementById(vholderID);
    }
    let tempDiv;
    if(!document.querySelector('.note_temp_holder.' + vnoteID)){
        tempDiv = document.createElement('DIV');
        tempDiv.classList.add('note_temp_holder');
        tempDiv.classList.add(vnoteID);
        insertElmAbeforeElmB(tempDiv, vnote);
        // So that it doesn't show as it is sliding up
        // the tempDiv has overflow:hidden
        relocateElmTo(vnote, tempDiv);
    } else {
        tempDiv = document.querySelector('.note_temp_holder.' + vnoteID)
    }
    vnote = document.getElementById(vnoteID);
    const anim_dur = slideUpDown(vnote, 'hide')
    vholder.classList.remove('showing_versenote');
    dontGetLastVerse=true;
    setTimeout(() => {
        tempDiv.classList.add('versenote_hidden');
        // getHighestVisibleH2();
        dontGetLastVerse = false;
        dIS ? dIS.closest('.verse_note').classList.remove('maximizeVertical', 'maximizeHorizontal'):null;
    }, anim_dur);
    return anim_dur
}
let toggleMaximize = (function (){
    let noteWasdetachedByToggleMaximize = false;
    return function(dis,maximizeClass){
        maximizeClass = typeof maximizeClass == 'string' ? [maximizeClass] : maximizeClass;
        let classWasAdded;
        maximizeClass.forEach(mC => {classWasAdded = main.classList.toggle(mC)});
        if(classWasAdded){
            if (!main.matches('.detached_inlineversenote')) {//if note is not already detached
                detachInlineVerseNote();
                noteWasdetachedByToggleMaximize = true;
            }
        } else if(noteWasdetachedByToggleMaximize){
            detachInlineVerseNote();
            noteWasdetachedByToggleMaximize = false;
        }
    }
})();

function noteNavigationByArrowKey(e) {
    if (!document.querySelector('.most_recent_note:not(.displaynone):not(.sld_up)')) {return}
    if (e.ctrlKey && e.key=='ArrowRight' && !document.activeElement.matches('input, [contenteditable="true"]')) {
        e.preventDefault();
        dis = document.querySelector('#main .most_recent_note .nextNoteButton');
        showPrevNextNote(dis);
        // dis.click();
    } else if (e.ctrlKey && e.key=='ArrowLeft' && !document.activeElement.matches('input, [contenteditable="true"]')) {
        e.preventDefault();
        dis = document.querySelector('#main .most_recent_note .prevNoteButton');
        showPrevNextNote(dis,true);
        // dis.click();
    }
}
function editVerseNote(eTarget, e, saveBtn) { //Toggles editing of versnote on and off
    let eTargets_note = eTarget.parentNode.parentNode.querySelector('.text_content');
    editNotez = eTargets_note;

    // Turn ON verseNote editing
    if (eTargets_note.contentEditable == 'false') {
        //before this new button click check if another wasn't clicked before it.
        if (oldeditbtn = main.querySelector('.note_edit_button.active')) {
            let old_verse_note = elmAhasElmOfClassBasAncestor(oldeditbtn, '.verse_note');
            let oldeditbtn_note = old_verse_note.querySelector('.text_content');
            let old_save_btn = old_verse_note.querySelector('.note_save_button');
            turnOFFverseNoteEditing(oldeditbtn,old_save_btn,oldeditbtn_note);
        }
        
        if(eTargets_note.querySelector('.context_menu')){eTargets_note.querySelector('.context_menu').remove()}
        saveBtn.disabled = false; //enable save verse note button

        // IF THERE IS NO NOTE, ADD A STARTER TEMPLATE
        if((p1=eTargets_note.querySelector('p')) && (p1.innerText.trim()==(''||'↵'))){p1.remove()};
        const starterTemplateForEmptyNote = `<p><em>cf.,</em></p><h2>Key Points, Observations and Deductions</h2><ol><li></li></>`;
        if(eTargets_note.innerHTML.trim()==''){
            eTargets_note.innerHTML=starterTemplateForEmptyNote
        }
        // IF THERE IS NOTE
        else{
            // Replace span[ref] with the textNode
            // eTargets_note.querySelectorAll('span[ref], span[strnum]').forEach(spanRef => {spanRef.parentNode.replaceChild(document.createTextNode(spanRef.innerText), spanRef);});

            // Remove all classes that hide elements--'hidingsibs','hidby_H...' classes if added
            // eTargets_note.innerHTML = removeClasses(eTargets_note.innerHTML, ['hidingsibs','hidby_H1','hidby_H2','hidby_H3','hidby_H4','hidby_H5','hidby_H6','displaynone']);
            
            // Remove artifact sometimes created by CKEditor
            eTargets_note.querySelectorAll('span:has(span span[title="Insert paragraph here"])').forEach(x => {x.remove()});
        };

        // Remove lazyLoader and loadingOverlay
        const lazyLoader_stuvs = eTargets_note.querySelectorAll('#loadingOverlay,#lazyLoaderSpinner');
        lazyLoader_stuvs.forEach((x,i) => {x.remove();if(i+1==lazyLoader_stuvs.length){window.getSelection().getRangeAt(0).collapse(true)}});
        eTargets_note.contentEditable = 'true';
        eTargets_note.id = 'noteEditingTarget';
        // eTarget.style.backgroundColor = 'orange';
        eTarget.classList.add('active');

        enableCKEditor('noteEditingTarget', eTarget);

        // Start observing the [ref]
        refObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        // Add Keystroke EventListener
        eTargets_note.addEventListener("keydown", handleSmartQuotesAndDashes);
    }
    
    // Turn OFF verseNote editing
    else if (e.type!='dblclick' && eTargets_note.contentEditable == 'true') {
        modifyRefsInNoteOnPage(eTargets_note);
        cleanupObservers();
        // Remove Keystroke EventListener
        eTargets_note.removeEventListener("keydown", handleSmartQuotesAndDashes);
        
        turnOFFverseNoteEditing(eTarget,saveBtn,eTargets_note); //to repopulate notemenu
    }

    function turnOFFverseNoteEditing(editBtn,saveBtn,target_note) {
        saveBtn.disabled = true; //disable save verse note button
        target_note.querySelectorAll('span:has(span span[title="Insert paragraph here"])').forEach(x => { x.remove(); });
        // let noteForCurrentlyEditedVerse = generateRefsInNote(target_note.innerHTML);
        // target_note.innerHTML = noteForCurrentlyEditedVerse;

        const starterTemplateForEmptyNote = `cf.,\n\nKey Points, Observations and Deductions`;
        if (target_note.innerText.trim() == starterTemplateForEmptyNote) { target_note.innerText = ''; };
        target_note.contentEditable = 'false';
        editBtn.style.backgroundColor = '';
        editBtn.classList.remove('active');
        target_note ? target_note.id = '' : null;
        disableCKEditor();
        generateNoteMenu(editBtn, true);
    }
}
/* Edit Notes In Place Wrap Refs and Strong Numbers in place */
function modifyRefsInNoteOnPage(eTargets_note) {
    changedRefElements.forEach(span => { span.replaceWith(document.createTextNode(span.textContent)); }); //replace all span[ref] that have been mofified with text nodes
    changedRefElements = []; //empty the array
    const cursorPOS = getCursorPosition(eTargets_note);
    eTargets_note.innerHTML = generateRefsInNote(eTargets_note.innerHTML, true, false); //Update the text on the page
    // findTextNodesWithPattern(eTargets_note).forEach(node => {
    //     node.innerHTML = generateRefsInNote(node.innerHTML, true, false); //Update the text on the page
    // });
    restoreCursorPosition(eTargets_note, cursorPOS);
}

/* FOR GENERATING RIGHTCLICKABLE REFERENCES AND STRONGS NUMBERS IN THE VERSENOTES */

function generateRefsInNote(txt, shortForm='false', proofEditText=true) {
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${txt}</div>`, 'text/html');
    const container = doc.body.firstChild;
    // container.querySelectorAll(".strnum.vnotestrnum").forEach(s => {s.textContent = s.textContent;});
    container.querySelectorAll('span').forEach(s => {
        // Because of nested spans
        // Check if span has exactly one child node and it's also a span
        if (s.childNodes.length === 1 && s.firstChild.nodeType === Node.ELEMENT_NODE && s.firstChild.tagName === 'SPAN') {s.replaceWith(s.firstChild);}
    });
    container.querySelectorAll('span[ref]').forEach(sref => {sref.replaceWith(...sref.childNodes);});
    container.querySelectorAll('span').forEach((s) => {s.innerText.trim()==''?s.remove():null;});

    const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            for (let p = node.parentNode; p; p = p.parentNode) {
                if (p.nodeName.toLowerCase() === 'svg' || p.nodeName.toLowerCase() === 'text') {
                    return NodeFilter.FILTER_REJECT;
                }
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    // Group adjacent text nodes
    let textGroups = [];
    let currentGroup = null;

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!currentGroup || node.previousSibling !== currentGroup[currentGroup.length - 1]) {
            currentGroup = [];
            textGroups.push(currentGroup);
        }
        currentGroup.push(node);
    }

    // Process each group as a single string
    for (const group of textGroups) {
        if (group.length === 0) continue;

        // Combine text content of the group
        const combinedText = group.map(node => node.textContent).join('');
        let normalizedText = combinedText
            .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
            .replace(/&ZeroWidthSpace;|&#8203;|&nbsp;|&#160;/gi, '')
            .replace(/\s+/g, ' ');

        // Generate new HTML for the combined text
        const newHtml = innerGenerateRefsInNote(normalizedText, shortForm, proofEditText);

        if (newHtml !== normalizedText) {
            const temp = doc.createElement('div');
            temp.innerHTML = newHtml;

            // Replace the entire group with the new HTML's content (not the temp div itself)
            const firstNode = group[0];
            const parent = firstNode.parentNode;
            
            // Insert all child nodes of temp before the first node in the group
            const fragment = doc.createDocumentFragment();
            while (temp.firstChild) {
                fragment.appendChild(temp.firstChild);
            }
            parent.insertBefore(fragment, firstNode);
            
            // Remove all original nodes in the group
            for (const node of group) {
                parent.removeChild(node);
            }
        }
    }

    // Find and Wrap Strong's numbers before returning `txt`
    return container.innerHTML = container.innerHTML.replace(/<p>&nbsp;<\/p>/ig,'').replace(/(?<!<[^>]*)(?!<span[^>]*?strnum[^>]*?>|<text[^>]*?>)((H|G)[0-9]+)(?![^<]*<\/text>)(?![^<]*>)/gi, function(match) {
        const strn = match.toUpperCase();
        return `<span class="strnum ${strn} vnotestrnum" strnum="${strn}">${strn}</span>`;
    });

    function innerGenerateRefsInNote(txt,shortForm='false',proofEditText=true){
        // Step 1: Extract all <svg> or <text> elements
        // let svgPlaceholders = [];
        // txt = txt.replace(/<svg[\s\S]*?<\/svg>/gi, function(match) {
        //     let id = svgPlaceholders.length;
        //     svgPlaceholders.push(match);
        //     return `___SVG_PLACEHOLDER_${id}___`;
        // });
        txt = txt.replace(/<p>&nbsp;<\/p>/ig,'');
        let bdb=bible.Data.books;
        let preferredBKabrv;
        
        //because of Joh (42) and I Joh (61,62,63) conflict
        let orderOfarray = Array.from({ length: bible.Data.allBooks.length }, (_, i) => i);
        let moved = orderOfarray.splice(61, 3); // removes 61, 62, 63
        orderOfarray.splice(42, 0, ...moved);
        
        //loop through all the arrays of book names and their abbreviations
        for(let k=0;k<orderOfarray.length;k++){
            let i = orderOfarray[k];
            const bkMatchFound=bdb[i].some((bkNabrv) => {
                let rgx = new RegExp(`\\b${bkNabrv}(?=[^a-zA-Z]|$|[\s\n\r])`, 'i');
                return txt.match(rgx)
            });
            if(bkMatchFound){//check if any of the names in the array matches
                preferredBKabrv=bdb[i][1];//NOT USED: if there is a match, pick the second name which is the preferred abbreviation
                for(let j=0;j<bdb[i].length;j++){
                    let bkName2find=bdb[i][j];
                    txt = findAndIndicateScriptureRefs(txt,bkName2find);
                }
            }
        }
        /* WRAP SCRIPTURE REFERENCES FOR RIGHT-CLICKING */
        function findAndIndicateScriptureRefs(txt,bkName2find){
            // Wrap scripture references in spans
            let newBkReg = new RegExp(`(?<!ref="${bkName2find}\\.\\d+\\.\\d+([-,]\\d+)*">)(?![^<]*<text[^>]*>)\\b((?<!notes_img\/)(?<!<span [^>]*)(?<!span ref=")${bkName2find})(?:(?:[\\s:;.,-]*(?:(?::*\\s*\\d+(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)+)|(?:(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)|(?:(?<=[:\\d*])\\d+)|(?<=${bkName2find}\\s*)\\d+|\\d+(?!\\s*\\p{L}))))+)(?!">)(?![^<]*<\/text>)(\\s*-\\s*(?<!ref="${bkName2find}\\.\\d+\\.\\d+([-,]\\d+)*">)(?![^<]*<text[^>]*>)\\b((?<!notes_img\/)(?<!<span [^>]*)(?<!span ref=")${bkName2find})(?:(?:[\\s:;.,-]*(?:(?::*\\s*\\d+(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)+)|(?:(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)|(?:(?<=[:\\d*])\\d+)|(?<=${bkName2find}\\s*)\\d+|\\d+(?!\\s*\\p{L}))))+)(?!">)(?![^<]*<\/text>))*`, 'uig');// So as to match ranges accross chapters, e.g., "Gen 6:20 - Gen 7:3"
            txt = txt.replace(newBkReg, function (mtch) {
                mtch = mtch.replace(/(\p{L})(\d)/ug,'$1 $2').replace(/\s*([.:\-,])\s*/g,'$1').replace(/\s*(;)\s*(\w)/g,'$1 $2');//2Cor3.1==>2Cor 3.1
                let xSplit = /;|:|/.test(mtch)?mtch.split(/;|(?<=[a-zA-Z]+\s*\d+(?:\s*,\s*\d+)*),|,(?=\d+\s*:\s*\d+)/):mtch.split(',');//split match by semi-colons
                newBkReg2 = new RegExp(`(?<!span ref=")${bkName2find}`,'i');
                // console.log(xSplit);
                let rtxt = '';
                
                //refs with book names
                let refWithName = xSplit.shift();
                let bkn = refWithName.match(/[iI0-9]*\s*([a-zA-Z]+\s*)/)[0].trim();
                let chptNvrs = refWithName.replace(/[iI0-9]*\s*[a-zA-Z]+\s*/,'').trim();
                
                refWithName = shortenedBookName(refWithName);
                // /:/ vs. /:|(?:(?:\s|\.)\d+\.\d+)/
                rtxt += /:|(?:(?:\s|\.)\d+\.\d+)/.test(refWithName) ? `<span ref="${refWithName.replace(/\s+(?!$)|:/g,'.')}">${refWithName}</span>`: `<span ref="${turnChptOnlyTOFullRef(bkn,chptNvrs).replace(/\s+(?!$)|:/g,'.')}">${refWithName}</span>`;
                
                if(xSplit.length>0) {
                    xSplit.forEach(r => {
                    if (/:/.test(r)) {//if it has colon, then it is has chapter and verse(s) numbers
                        rtxt += `; <span ${/[a-zA-Z]/.test(r) ? '' : 'bkn="'+ bkn +'" '}ref="${bkn}.${r.trim().replace(/:/,'.')}">${r}</span>`;
                    }
                    
                    else {//if it has colon, then it is has chapter and verse(s) numbers
                        //they are chapter numbers (that don't have verse numbers)
                        let chptsOnlyArray = r.split(/(?<!:(?:\d+|[\s,]*)+),/g).filter(item => item !== undefined);
                        chptsOnlyArray.forEach((chpt,i) => {
                            chpt!=undefined?_r():null;
                            function _r() {
                                let chpt_trm = chpt.trim();
                                let wholeChpt = turnChptOnlyTOFullRef(bkn, chpt_trm);
                                rtxt +=  `${i==0?';':','} <span bkn="${bkn}" ref="${wholeChpt}">${chpt}</span>`;
                            };
                        });
                    }
                    });
                }
                //refs without book name
                return rtxt
            })
            // proofEditText ? txt = modifyQuotationMarks(txt) : null;
            
            return txt

            function turnChptOnlyTOFullRef(bkn, chpt_trm) {
                const xr = breakDownRef(`${bkn} ${chpt_trm}`);
                let wholeChpt = `${bkn}.${chpt_trm}.${xr.cv}-${xr.cv2}`;
                return wholeChpt;
            }

            function shortenedBookName(refWithName) {
                if (shortForm) {
                    refWithName = refWithName.replace(/(\p{L}+)\s*(\d+)\s*(:)\s*(\d+)/gui, '$1 $2$3$4')//Replace name ensure space between name and chapter number
                    refWithName = refWithName.replace(newBkReg2, preferredBKabrv).toLowerCase().replace(/\b\d*\s*(\p{L})/ug, function (match) {
                        return match.toUpperCase();
                    });
                }
                return refWithName.replace(/\bSOS\b/gi,'SoS').replace(/\bJb\b/gi,'Job');
            }
        }
        
        proofEditText ? txt = modifyQuotationMarks(txt) : null;
        // Step 3: Restore SVGs
        // txt = txt.replace(/___SVG_PLACEHOLDER_(\d+)___/g, (_, id) => svgPlaceholders[+id]);
        return txt
    }
}

// if(document.body.matches('#homepage')){main.addEventListener("click",showVersenoteToTheRight)}
let lastClickedVerseOBJ;

/* **************************** */
/* DETACH RIGHT SIDE VERSE NOTE */
/* **************************** */
async function verseNoteToRightChecks() {
    // ensure topmost verse is topmost verse
    !lastClickedVerse ? await getHighestVisibleH2() : null;
    const x = lastClickedVerse;
    show_versenote_totheright_check.click();
    show_versenote_totheright_2_check.click();
    modifyRefNavChildrenHeight();
    setTimeout(() => {x.scrollIntoView();}, 5);
}
async function showVersenoteToTheRight(e){
    // ensure topmost verse is topmost verse
    !lastClickedVerse ? await getHighestVisibleH2() : null;
    const x = lastClickedVerse;
    if(!show_versenote_totheright_2_check.checked) {
        show_versenote_totheright_check.checked=true;
        show_versenote_totheright_2_check.checked=true;
        notedetach_check.checked=true;
        detach_versenote_check.checked=true;
        main.querySelectorAll('.verse_note').forEach(vn => {vn.classList.add('versenote_totheright')});
    } else {
        show_versenote_totheright_check.checked=false;
        show_versenote_totheright_2_check.checked=false;
        notedetach_check.checked=false;
        detach_versenote_check.checked=false;
        main.querySelectorAll('.verse_note.versenote_totheright').forEach(vn => {vn.classList.remove('versenote_totheright')});
    }
    setTimeout(()=>{x.scrollIntoView();},5);
}
function detachInlineVerseNote(){
    /* *************************** */
    /* DETACH THE INLINE-VERSENOTE */
    /* *************************** */
    if(!document.head.querySelector('#detached_inlineVerseNote')) {
        notedetach_check.checked=true;
        detach_versenote_check.checked=true;
        modifyRefNavChildrenHeight();
        localStorage.setItem('notedetach_check','true');
        if(mrn=document.querySelector('.most_recent_note')){
            mrn.classList.add('detached_note');
            if(show_versenote_totheright_2_check.checked){
                mrn.classList.add('versenote_totheright');//verseNote to the RightSide
            }
            else {
                enableInteractJSonEl(mrn.querySelector('.notes_ref_head'), mrn)
            }
        }
        main.querySelectorAll('.notes_ref_head').forEach(nrh=>{
            let vnote = nrh.parentElement;
            // let noteTxtDiv = vnote.querySelector('.text_content');
            // let fullRef = `${noteTxtDiv.getAttribute('bk')} ${noteTxtDiv.getAttribute('b_cv')}`;
            // const [bN, bC, cV] = fullRef.split(/[\s\.:]/);
            // nrh.innerHTML=`<span ref="${fullBookName(bN).shortBkn}.${bC}.${cV}">${bN} ${bC}:${cV}</span>`;
            let noteTxtDiv = vnote.querySelector('.notes_ref_head');
            let fullRef = `${noteTxtDiv.getAttribute('ref')}`;
            const shortNameFullRef = breakDownRef(fullRef).shortBknFullRef;
            nrh.innerHTML=`<span ref="${shortNameFullRef}">${shortNameFullRef}</span>`;
        })
        main.classList.add('detached_inlineversenote')
        const styleRule =`/* moved style to bibleApp.css file: .verse_note.detached_note{} */`;
        createNewStyleSheetandRule('detached_inlineVerseNote', styleRule);
    }
    
    /* ****************************************** */
    /* UN-DETACH (RE-ATTACH) THE INLINE-VERSENOTE */
    /* ****************************************** */
    else {
        const currentlyShowingNote = document.querySelector('.most_recent_note.detached_note');
        const vId = currentlyShowingNote ? currentlyShowingNote.id.replace(/note_(\d+)_(\d+)_(\d+)/g,'_$1.$2.$3') : null;
        
        notedetach_check.checked = false;
        detach_versenote_check.checked = false;
        localStorage.setItem('notedetach_check','false');
        detached_inlineVerseNote.remove();
        main.classList.remove('detached_inlineversenote');
        if (vntdrs=document.querySelector('head').querySelector('#vn_totheright_topANDheight')){vntdrs.remove();};

        main.querySelectorAll('.verse_note').forEach(nrh=>{
            if(nrh.matches('.sld_up')){
                nrh.removeAttribute('style')
                nrh.classList.remove('sld_up');
                nrh.style.display='none';
                // slideUpDown(nrh,'show')
                const anim_t = slideUpDown(nrh,'hide');
                dontGetLastVerse=true;
                setTimeout(() => {
                    // getHighestVisibleH2();
                    dontGetLastVerse = false;
                }, anim_t);
            }
            let notes_ref_head;
            notes_ref_head = nrh.querySelector('.notes_ref_head');
            notes_ref_head.innerHTML='';
            nrh.classList.remove('detached_note');

            // Remove the 
            nrh.style.transform = '0';
            notes_ref_head.removeAttribute('data-x');
            notes_ref_head.removeAttribute('data-y');
        })
        
        vId ? document.getElementById(vId).scrollIntoView({behavior: "smooth"}) : null;
    }
}

/* ******************************** */
/* GENERATE MENU OF HEADING IN NOTE */
/* ******************************** */
let h126=function (p){return `${p}>h1,${p}>h2,${p}>h3,${p}>h4,${p}>h5,${p}>h6`};// To get only heading that are direct descendants
function generateNoteMenu(dis,redo) {
    /* **************************************** */
    /* Clones the headers in the .text_content* */
    /* ***** And appeds them to .notemenu ***** */
    /* **************************************** */
    let vnt=dis.closest('.verse_note');
    let notemenu=vnt.querySelector('.notemenu');
    if (redo||!notemenu.classList.contains('g')) {
        notemenu.innerHTML='';
        let vntxt=vnt.querySelector('.text_content');
        let allHs=vntxt.querySelectorAll(h126('.text_content'));
        allHs.forEach(h=>{h=h.cloneNode(true); h.removeAttribute('class'); notemenu.append(h)})
        if(!redo){notemenu.style.display='';}
        else if(redo && !notemenu.matches('.g')){
            slideUpDown(notemenu,'hide');
            notemenu.style.marginTop='-99px';
        }
        notemenu.classList.add('g');
    } else {slideUpDown(notemenu)}
    const textContent=vnt.querySelector('.text_content');
    textContent.focus();
    trackTopmostVisibleHeading(textContent, notemenu);
}
let ignore_trackTopmostVisibleHeading=false;
function goToHeading(){
    /* ******************************************************* */
    /* The headings in .text_content are the same in .notemenu */
    /* Finds the corresponding heading in .text_content ****** */
    /* By the index of the clicked heading in .notemenu ****** */
    /* And then scrolls to it **********************************/
    /* ******************************************************* */
    let h=window.event.target;
    let allH=h.parentElement.querySelectorAll(h126('.notemenu'));
    let hIdx = Array.from(allH).indexOf(h);
    let vntxt=h.closest('.verse_note').querySelector('.text_content');
    let allHs=vntxt.querySelectorAll(h126('.text_content'));
    allHs[hIdx].scrollIntoView({behavior:"smooth"});
    allHs[hIdx].parentElement.scrollTo({left:0,top:allHs[hIdx].offsetTop,behavior:'smooth'});
    const currentActiveH1_6 = h.parentElement.querySelector('.active');
    currentActiveH1_6 ? currentActiveH1_6.classList.remove('active'):null;
    h.classList.add('active');
    ignore_trackTopmostVisibleHeading=true;
    setTimeout(()=>{ignore_trackTopmostVisibleHeading=false;},1000);//to prevent calling menuH1toH6[hIdx].scrollIntoView... because it stops this from finishing
}
// Highlight highest heading in .verse_note
const trackTopmostVisibleHeading = (function() {
    // Track which heading (e.g., <h1> to <h6>) within a scrollable .text_content is currently the most visible and updates the .notemenu to highlight that heading
    // Works with initializeTrackingForTextContents(...,...)
    let observer = null;
    return function (container, menu) {
        if (menu.matches('.sld_up,.displaynone')||ignore_trackTopmostVisibleHeading) {return}
        if (observer) {observer.disconnect();}
        const headings = container.querySelectorAll(h126('.text_content'));
        // Clear previous observers and highlights if container changes
        observer = new IntersectionObserver((entries) => {
          // Sort entries by intersection ratio (visibility) and find the first visible one
          const visibleHeadings = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            
            if (visibleHeadings.length > 0 /* && !ignore_trackTopmostVisibleHeading */) {
                const topHeading = visibleHeadings[0].target;
                const hIdx = Array.from(headings).indexOf(topHeading);
                // Update menu to highlight the corresponding item
                menu.querySelector('.active') ? menu.querySelector('.active').classList.remove('active'):null;
                const menuH1toH6 = menu.querySelectorAll(h126('.notemenu'));
                menuH1toH6[hIdx] ? (menuH1toH6[hIdx].classList.add('active'),menu.scrollTo({left:0,top:menuH1toH6[hIdx].offsetTop,behavior:'smooth'})):null;
            }
        }, {
          root: container,
          threshold: 0.1  // Adjust based on how much should be visible to consider as "in view"
        });
        // Select all heading elements within the container and observe them
        headings.forEach(heading => observer.observe(heading));
    }
})();
const initializeTrackingForTextContents = (function () {
    // used to detect when new .text_content elements are added or removed from the DOM
    // The goal is to track highest visible h1 to h6 to highlight it in the .notemenu of the relevant .verse_note using trackTopmostVisibleHeading(...,...)
    return function () {
        // Function to attach focus and scroll listeners
        const attachListeners = (textContent) => {
            const notemenu = textContent.closest('.verse_note').querySelector('.notemenu');
            textContent.addEventListener('focus', () => {trackTopmostVisibleHeading(textContent, notemenu);});
            textContent.addEventListener('scroll', () => {trackTopmostVisibleHeading(textContent, notemenu);});
        };
    
        // Select all current .text_content elements
        const textContents = document.querySelectorAll('.text_content');
        textContents.forEach(attachListeners);
    
        // MutationObserver to track dynamically added or removed .text_content elements
        const observer = new MutationObserver(() => {
            const updatedTextContents = document.querySelectorAll('.text_content');
            updatedTextContents.forEach((textContent) => {
                // Check if the listener is already attached
                if (!textContent.dataset.listenerAttached) {
                    attachListeners(textContent);
                    textContent.dataset.listenerAttached = true; // Mark listener as attached
                }
            });
        });
    
        // Observe changes in the parent element that contains .text_content
        const parent = document.querySelector('#main'); // Adjust the selector as necessary
        observer.observe(parent, {childList:true, subtree:true // Observe all descendants
        });
    }
})();
if(document.body.matches('#homepage')){initializeTrackingForTextContents();}

/* *** *** ********* ******** ** ***** *** */
/* *** SVG (DRAW.IO) DIAGRAMS IN NOTES *** */
/* *** *** ********* ******** ** ***** *** */
//TO ADD "mouseoverpath" CLASS TO :is(path,rect,circle) ELEMENT (NODES) WHEN MOUSE IS OVER IT AND REMOVE THE CLASS WHEN MOUSE IS NO LONGER OVER IT
document.addEventListener('mouseover', function(event) {
    const arrayOfelementsFromPoint = document.elementsFromPoint(event.clientX, event.clientY);
    const target = Array.from(arrayOfelementsFromPoint).find(x => x.matches('#versenotepage :is(path,rect,circle), .verse_note .text_content :is(path,rect,circle)'));//for main and versenote ('pages:#versenotepage :is(path,rect,circle), .verse_note .text_content :is(path,rect,circle)'). // for other pages: ('body:not(#homepage,#versenotepage) :is(p,div) svg:only-child :is(path,rect,circle)')
    if (highlighted = document.querySelector('.mouseoverpath')) {highlighted.classList.remove('mouseoverpath');}
    if (target && target.matches('#versenotepage :is(path,rect,circle), .verse_note .text_content :is(path,rect,circle)')) {target.classList.add('mouseoverpath');}
});
//TO SELECT AND DESELECT :is(path,rect,circle) ELEMENT (NODES) IN VERSENOTE and OTHER PAGES
document.addEventListener('mousedown', function(e) {
    if(e.target.closest('.context_menu')){return}
    // Check if the clicked element is a :is(path,rect,circle) element
    const arrayOfelementsFromPoint = document.elementsFromPoint(e.clientX, e.clientY);
    let clickedPathElement = Array.from(arrayOfelementsFromPoint).find(x=>x.matches('#versenotepage :is(path,rect,circle), .verse_note .text_content :is(path,rect,circle)'));//for main and versenote ('pages:#versenotepage :is(path,rect,circle), .verse_note .text_content :is(path,rect,circle)'). // for other pages: ('body:not(#homepage,#versenotepage) :is(p,div) svg:only-child :is(path,rect,circle)')
    document.addEventListener('mouseup', selectedClickedPath);
    function selectedClickedPath(ev) {
        // Check if the clicked element is a :is(path,rect,circle) element
        const arrayOfelementsFromPoint = document.elementsFromPoint(ev.clientX, ev.clientY);
        const target = Array.from(arrayOfelementsFromPoint).find(x => x.matches('#versenotepage :is(path,rect,circle), .verse_note .text_content :is(path,rect,circle)'));
        // Check if the click event happens on the same :is(path,rect,circle) element as the mousedown event
        if (target && target === clickedPathElement) {
            if(target.matches('.pathselected')){target.classList.remove('pathselected');}
            else{target.classList.add('pathselected');}
        }
    }
    //TO SIMULATE CLICK (mouseup will only be recognized if it happens within 300ms )
    setTimeout(() => {
        clickedPathElement=null;
        document.removeEventListener('mouseup',selectedClickedPath);
    },300);
});

// FOR ANCHORS TO SMOOTHLY SCROLL TO THE ID ADDRESS/TARGET
document.addEventListener('click', function(e) {
    if (anchor=e.target.closest('.text_content a[href^="#"],.win2_noteholder a[href^="#"]')) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        // const targetElement = anchor.closest('.verse_note').querySelector(targetId);
        const targetElement = document.querySelector(`.text_content ${targetId},.win2_noteholder ${targetId}`);
        if (targetElement) {targetElement.scrollIntoView({behavior:'smooth'});}
    }
});

async function showPrevNextNote(dis,prvV=false) {
    let currentNote = dis.closest('.verse_note');
    let refOfCurrentNote = currentNote.querySelector('.notes_ref_head').getAttribute('ref');
    let allVerseOnPageWithNotes = Array.from(main.querySelectorAll('.vmultiple.noted,.vmultiple.user1note,.vmultiple[ref="'+ refOfCurrentNote +'"]'));
    //find verse in array matching current verse
    let cindx = allVerseOnPageWithNotes.findIndex(v=>v.matches('.vmultiple[ref="'+ refOfCurrentNote +'"]'));
    let cindxLngth = allVerseOnPageWithNotes.length;
    let indxToCheck = prvV==true ? (cindxLngth>0 ? cindx-1 : cindx) : (cindxLngth>cindx ? cindx+1 : cindx);
    let prvNxtRef = allVerseOnPageWithNotes[indxToCheck];
    if (prvNxtRef) {
        const isNotDetachedNote = !currentNote.closest('.detached_note');
        const t = closeNote(currentNote);
        prvNxtRef.scrollIntoView({behavior:'smooth'});
        // prvV==true ? prvNxtRef.scrollIntoView({behavior:'smooth'}):null;
        setTimeout(() => {
            const tt= showVerseNote({"target":prvNxtRef,"callorigin":'n',"type":'click'},null,true);
            const xt = setTimeout(() => {
                // prvV==false ? prvNxtRef.scrollIntoView({behavior:'smooth'}):null;
                prvNxtRef.scrollIntoView({behavior:'smooth'});
                clearTimeout(xt)
            }, isNotDetachedNote ? tt : 0);
        }, isNotDetachedNote ? t : 0);
        lastClickedVerse = prvNxtRef;
    } else {
            const [bN, bC, cV] = refOfCurrentNote.split(/[\s:]/);
        if(ref2go2 = findNextPrevVerse(bN, bC, cV, !prvV)){
            const [bN_,bC_,cV_] = ref2go2;
            const fullRef = `${bN_} ${bC_}:${cV_}`;
            const done = await gotoRef(fullRef);
            const t = setInterval(() => {
                if (done && (v=document.querySelector(`.vmultiple[ref="${fullRef}"]`)) && !document.querySelector('.verse_note:not(#verse_note)')) {
                    // Ensure this check happens only after gotoRef(fullRef) is done
                    showVerseNote({target:v, callorigin:'n', type:'click'});
                    clearInterval(_t);
                }
            }, 10);
        }
    }
    const newDis = prvV==true ? document.querySelector('#main .most_recent_note .prevNoteButton') : document.querySelector('#main .most_recent_note .nextNoteButton');
    newDis ? newDis.focus() : null;
}

async function showNoteForVerseNOTinMainBibleWindow(dis){
    const parentVerse = dis.closest('.verse');
    const [bN, bC, cV] = parentVerse.querySelector('[ref]').getAttribute('ref').split(/[(?<=\s)(?<=:)](?=\d)/);
    const crfnnote = dis.closest('.crfnnote');
    let appendHere = crfnnote.querySelector('.none_mainsection_note');
    if(!appendHere.classList.contains('note_added')){
        await readFromVerseNotesFiles(bN, bC, cV,appendHere);
        appendHere.classList.add('note_added');
        show_crfnnote();
        parentVerse.scrollIntoView({behavior:'smooth',block:'nearest'});
        // clickAllLisOnPage(appendHere);// Click all li's in the VerseNote to collapse them
    }
    else if (appendHere.classList.contains('displaynone')){
        show_crfnnote();
        appendHere.classList.remove('displaynone');
        slideUpDown(appendHere, null, 300);
    } else {
        let anim_t = slideUpDown(appendHere, null, 300);
        if(dis.closest('.context_menu') && !context_menu.matches('.showingXref')){
            const t = setTimeout(() => {
                crfnnote.classList.add('displaynone');
                appendHere.classList.add('displaynone');
                clearTimeout(t)
            }, anim_t);
        }
    }

    function show_crfnnote() {
        crfnnote.closest('.displaynone') ? crfnnote.classList.remove('displaynone') : null;//if .crfnnote is hidden, make it visible so that displayed note can be visible
    }
}

function checkAndIndicateThatVerseHasNote(bookName, chNumInBk, vNumInChpt, span_verse) {
    let notesForVerse = [];
    let markersForVerse = [];
    for (const folderName in allReferencesWithNotes) {
        if (folderName!='markers' && allReferencesWithNotes.hasOwnProperty.call(allReferencesWithNotes, folderName)) {
            const noteStatus = (folderName=='bible_notes') ? 'noted' : 'user1note';
            const notes_folder = allReferencesWithNotes[folderName];
            if ((arwnbk = notes_folder[bookName]) && (arwnbkChptNum = arwnbk[chNumInBk]) && (arwnbkChptNum.includes(Number(vNumInChpt)))){
                if (span_verse) {
                    span_verse.classList.add(noteStatus)
                }
                notesForVerse.push(noteStatus);
            }
        }
    }
    if ('markers' in allReferencesWithNotes) {
        if (allReferencesWithNotes.hasOwnProperty.call(allReferencesWithNotes,'markers')) {
            markersForVerse = allReferencesWithNotes['markers'][bookName];
            if(markersForVerse && markersForVerse[chNumInBk] && (mrks = markersForVerse[chNumInBk][vNumInChpt])){
                markersForVerse = mrks;
                if (span_verse) {mrks.forEach(mrk => {span_verse.classList.add(`marker_${mrk}`)});}
            } else {
                markersForVerse = [];
            }
        }
    }
    return {'notes': notesForVerse, 'markers':markersForVerse};
}

function findNextPrevVerse(bookName, chapternumber, verseNumber, goto_nxtVerse=true) {
    let bookNames = bible.Data.allBooks;
    let currentBookIndex = bookNames.indexOf(bookName);
    if (currentBookIndex === -1) {return null;}// Book not found
    function findInBook(bookName, chapternumber, verseNumber, goto_nxtVerse) {
        let book = combined_referencesWithNotes[bookName];
        if (!book) {return null;}// Book not found

        let chapter = book[chapternumber];
        if (!chapter) {return null;}// Chapter not found

        let sortedVerses = [...chapter].sort((a, b) => a - b);
        let verseIndex = sortedVerses.indexOf(verseNumber);

        if (verseIndex !== -1) {
            if (goto_nxtVerse) {
                if (verseIndex < sortedVerses.length - 1) {
                    return [bookName, chapternumber, sortedVerses[verseIndex + 1]];
                }
            } else if (!goto_nxtVerse) {
                if (verseIndex > 0) {
                    return [bookName, chapternumber, sortedVerses[verseIndex - 1]];
                }
            }
        } else {
            for (let i = 0; i < sortedVerses.length; i++) {
                if (goto_nxtVerse && sortedVerses[i] > verseNumber) {
                    return [bookName, chapternumber, sortedVerses[i]];
                } else if (!goto_nxtVerse && sortedVerses[i] < verseNumber) {
                    return [bookName, chapternumber, sortedVerses[i]];
                }
            }
        }
        return null; // No suitable verse found in the current chapter
    }
    function findInChapters(bookName, chapternumber, goto_nxtVerse) {
        let book = combined_referencesWithNotes[bookName];
        let chapterNumbers = Object.keys(book).map(Number).sort((a, b) => a - b);
        let chapterIndex = chapterNumbers.indexOf(parseInt(chapternumber));

        if (goto_nxtVerse) {
            if (chapterIndex < chapterNumbers.length - 1) {
                let nextChapter = chapterNumbers[chapterIndex + 1];
                let nextChapterVerses = book[nextChapter];
                let nextVerse = Math.min(...nextChapterVerses);
                return [bookName, nextChapter, nextVerse];
            }
        } else if (!goto_nxtVerse) {
            if (chapterIndex > 0) {
                let prevChapter = chapterNumbers[chapterIndex - 1];
                let prevChapterVerses = book[prevChapter];
                let prevVerse = Math.max(...prevChapterVerses);
                return [bookName, prevChapter, prevVerse];
            }
        }
        return null; // No suitable chapter found in the current book
    }
    function findInBooks(bookIndex, chapternumber, verseNumber, goto_nxtVerse) {
        let step = goto_nxtVerse ? 1 : -1;

        while (bookIndex >= 0 && bookIndex < bookNames.length) {
            let currentBookName = bookNames[bookIndex];
            let result = findInChapters(currentBookName, chapternumber, goto_nxtVerse);
            if (result) {
                return result;
            }

            // If no chapter found, move to the next or previous book
            bookIndex += step;
            if (bookIndex >= 0 && bookIndex < bookNames.length) {
                let newBookName = bookNames[bookIndex];
                let newBook = combined_referencesWithNotes[newBookName];
                let chapterNumbers = Object.keys(newBook).map(Number).sort((a, b) => a - b);

                if (goto_nxtVerse) {
                    let firstChapter = chapterNumbers[0];
                    let firstChapterVerses = newBook[firstChapter];
                    if (firstChapterVerses) {
                        let firstVerse = Math.min(...firstChapterVerses);
                        return [newBookName, firstChapter, firstVerse];
                    }
                } else if (!goto_nxtVerse) {
                    let lastChapter = chapterNumbers[chapterNumbers.length - 1];
                    let lastChapterVerses = newBook[lastChapter];
                    if (lastChapterVerses) {
                        let lastVerse = Math.max(...lastChapterVerses);
                        return [newBookName, lastChapter, lastVerse];
                    }
                }
            }
        }
        return null; // No suitable book found
    }

    // First try to find in the current book and chapter
    let result = findInBook(bookName, chapternumber, verseNumber, goto_nxtVerse);
    if (result) {return result;}

    // If not found, try to find in the current book but different chapter
    result = findInChapters(bookName, chapternumber, goto_nxtVerse);
    if (result) {return result;}

    // If not found, try to find in different books
    return findInBooks(currentBookIndex, chapternumber, verseNumber, goto_nxtVerse);
}
//MAKE HTML LISTS COLLAPSIBLE
function slide_OLUL_UpDown(elm, upOrDown){
    // Slides Element UP and Hides It By Changing Its Height
    elm.style.transition = 'all 0.3s ease-in-out';
    if(slideUpDownTimer){clearTimeout(slideUpDownTimer)}
    
    const tMargin = elm.offsetHeight;
    let animDuration = setAnimDurationBasedOnHeight(tMargin);

    let showOrHide;
    // SHOW It If It is Hidden
    if((upOrDown && (upOrDown=='show'||upOrDown=='down'))||(!upOrDown && elm.classList.contains('sld_up'))){
        elm.style.overflow = '';
        elm.style.display = '';
        showOrHide = 'showing';
        setTimeout(() => {
            elm.style.position = '';
            // elm.style.marginTop = '0';
            let oldH = 0, totalHeight = 0;
            if(elm.hasAttribute('hiddingAll')){
                Array.from(elm.children).forEach(child => {
                    let value, child_olul = child.querySelector('ol,ul');
                    child = child_olul?child_olul:child;
                    if (child.hasAttribute('oldHeight')) {value = parseFloat(child.getAttribute('oldHeight'));}
                    else if (child.hasAttribute('oldDerivedHeight')) {value = parseFloat(child.getAttribute('oldDerivedHeight'));}
                    else {value = 0;}
                    totalHeight += value;
                });
            }
            elm.removeAttribute('hiddingAll');

            if (elm.hasAttribute('oldHeight')) {
                oldH = parseInt(elm.getAttribute('oldHeight'));
                oldH = oldH - totalHeight;
                elm.removeAttribute('oldHeight');
            }
            else {
                oldH = parseInt(elm.getAttribute('oldDerivedHeight'));
                oldH = oldH - totalHeight;
            }
            setAnimDurationBasedOnHeight(oldH)
            elm.style.height = oldH+'px';

            elm.hasAttribute('minHeight') ? (elm.style.minHeight = elm.getAttribute('minHeight'),elm.removeAttribute('minHeight')):elm.style.minHeight ='';
            elm.hasAttribute('oldmaxHeight') ? (elm.style.maxHeight = elm.getAttribute('oldmaxHeight'),elm.removeAttribute('oldmaxHeight')):elm.style.maxHeight ='';
        }, 1);
        setTimeout(() => {
            if(elm.hasAttribute('oldDerivedHeight')){
                elm.style.height = '';
                elm.removeAttribute('oldDerivedHeight');
                // change_ancestors_oldDerivedHeight(-1);// not working when hiding, see comment in function for suggestion about possible fix
            };
            elm.hasAttribute('oldTransition') ? (elm.style.transition = '',elm.removeAttribute('oldTransition')):null;
            elm.style.zIndex = '';
            elm.style.transition = '';
            elm.removeAttribute('anim_dur');
            elm.style.cssText==''?elm.removeAttribute('style'):null;
            elm.removeAttribute('overflow');
            elm.removeAttribute('display');
            elm.classList[0]==undefined?elm.removeAttribute('class'):null;
            elm.classList.remove('sld_up');
        }, animDuration + 100);
    }
    // HIDE It If It Is Showing
    else if((upOrDown && (upOrDown=='hide'|| upOrDown=='up'))||(!upOrDown && !elm.classList.contains('sld_up'))) {
        elm.classList.add('sld_up')
        showOrHide = 'hiding';
        elm.style.transition!='' ? elm.setAttribute('oldTransition', elm.style.transition):null;
        let totalHeight = 0;        
        if(elm.style.height!=''){

            elm.hasAttribute('oldDerivedHeight') ? elm.setAttribute('oldHeight', elm.getAttribute('oldDerivedHeight')) : elm.setAttribute('oldHeight', elm.style.height);
        }
        else {
            elm.style.height = tMargin + 'px';
            elm.setAttribute('oldDerivedHeight', tMargin + totalHeight + 'px');
        };
        elm.style.minHeight!='' ? (elm.setAttribute('oldminHeight', elm.style.minHeight),elm.style.minHeight = '0'):null;
        elm.style.maxHeight!='' ? (elm.setAttribute('oldmaxHeight', elm.style.maxHeight),elm.style.maxHeight = '0'):null;
        setTimeout(()=>{elm.style.height='0';},1)
        
        elm.setAttribute('anim_dur', animDuration);
        slideUpDownTimer = setTimeout(() => {
            elm.setAttribute('overflow', elm.style.overflow);
            elm.style.setProperty('overflow', 'hidden', 'important');
        }, animDuration);
        // slideUpDownTimer = setTimeout(() => {
        //     elm.setAttribute('display', elm.style.display);
        //     elm.style.setProperty('display', 'none', 'important');
        // }, animDuration * 1.5);
    }
    return {showOrHide, animDuration}

    function setAnimDurationBasedOnHeight(tMargin) {
        // let animDuration = t ? (t > 300 ? 300 : t) : (tMargin * 0.8);
        // if (animDuration <= 0 && (anim_dur = elm.getAttribute('anim_dur'))){animDuration = parseInt(anim_dur);}
        // else if (animDuration < 300) {animDuration = 300;}

        let animDuration = 150;
        elm.style.transition = 'all ' + animDuration / 1000 + 's ease-in-out';
        return animDuration;
    }
}
function htmlListCollapser(e) {
    let clicked_li = e.target.closest('li');
    let c_li_descendants_olul = clicked_li ? clicked_li.querySelectorAll('li>:is(ol,ul)'):null;
    if (!(clicked_li && c_li_descendants_olul)){return}
    // Check if the clicked element is an `li` item       
    const olOrUl = clicked_li.closest('ul, ol');
    if(wasMarkerClicked()){
        if(e.type=='mousedown'){document.querySelectorAll('#pageEditNsaveBtns').forEach(pEnsB=>pEnsB.remove());return}
        allow_pageEditNsaveBtns = false;
        (e instanceof Event) ? e.preventDefault() : null;
        
        // CLICK
        if(e.type!='contextmenu'){
            // CLICK - CTRL
            if(!e.ctrlKey){
                c_li_descendants_olul.forEach(d_olul => {(d_olul.matches('li>:is(ol,ul)') && d_olul.parentElement==clicked_li) ? slide_OLUL_UpDown(d_olul):null})
            }
            // CLICK + CTRL // hide descendants of li's first generation li descendants
            else {
                c_li_descendants_olul.forEach(d_olul => {
                    if(d_olul.matches('li>:is(ol,ul)') && d_olul.parentElement==clicked_li){
                        let d_olul_descendants_li = d_olul.querySelectorAll('li');
                        let isAnyDescendant_of_d_olul_descendants_li_hidden = Array.from(d_olul_descendants_li).some(d_olul_d_li=>Array.from(d_olul_d_li.children).some(x=>(x.matches('ol.displaynone,ul.displaynone,ol.sld_up,ul.sld_up'))));
                        
                        let olul_children_olul = Array.from(d_olul.querySelectorAll('li>:is(ol,ul)')).reverse();
                        olul_children_olul.forEach((oul,i) => {
                            // isAnyDescendant_of_d_olul_descendants_li_hidden ? oul.classList.remove('displaynone'):oul.classList.add('displaynone')
                            slide_OLUL_UpDown(oul, isAnyDescendant_of_d_olul_descendants_li_hidden ? 'show':'hide');
                        })
                    }
                })
            }
        }
        //RIGHT-CLICK
        else{
            let li_childOLULisHidden = c_li_descendants_olul[0].matches('ol.displaynone,ul.displaynone,ol.sld_up,ul.sld_up');//the first ol or ul should be the direct descendant of clickedLi
            
            // CONTEXTMENU + SHIFT - CTRL // Hide or Show all OLs and Uls in Parent of clicked li
            if(!e.ctrlKey && e.shiftKey){
                let closestOlUl = clicked_li.closest('ol,ul');
                closestOlUl.querySelectorAll('li>:is(ol,ul)').forEach((all_olul_inParentOLUL,i)=>{
                    all_olul_inParentOLUL.setAttribute('hiddingAll','true');
                    
                    let clicked_li_siblings = Array.from(closestOlUl.children);
                    const t = !clicked_li_siblings.includes(all_olul_inParentOLUL) ?  0 : 100; // to stagger all OL/UL's of LI's of the same level as the clicked li 
                    setTimeout(() => {
                        slide_OLUL_UpDown(all_olul_inParentOLUL,li_childOLULisHidden?'show':'hide',undefined,true);
                    }, i*t);
                })
            }
            // CONTEXTMENU - SHIFT - CTRL // Toggle Clicked Li's OL/UL and Hide all Other OLs and Uls in Parent of clicked li
            else if(!e.ctrlKey && !e.shiftKey){
                let closestOlUl = clicked_li.closest('ol,ul');
                let inCM = clicked_li.closest('.context_menu');
                const e2scroll = inCM ? context_menu : closestScrollableAncestors(clicked_li,document.body).elm;
                let o_scroll_d = (clicked_li.getBoundingClientRect().top - (inCM ? e2scroll.querySelector('.cmtitlebar').getBoundingClientRect().bottom : e2scroll.getBoundingClientRect().top));//original_scroll_distance
                let c = closestOlUl.querySelectorAll('li>:is(ol,ul)');

                c.forEach((all_olul_inParentOLUL,i)=>{
                    all_olul_inParentOLUL.setAttribute('hiddingAll','true');
                    
                    let clicked_li_siblings = Array.from(closestOlUl.children);
                    const t = !clicked_li_siblings.includes(all_olul_inParentOLUL) ?  0 : 100; // to stagger all OL/UL's of LI's of the same level as the clicked li 
                    setTimeout(() => {
                        if(all_olul_inParentOLUL.parentElement==clicked_li){slide_OLUL_UpDown(all_olul_inParentOLUL,li_childOLULisHidden?'show':'hide',undefined,true);}
                        else {slide_OLUL_UpDown(all_olul_inParentOLUL,'hide',undefined,true);}
                    }, i*t);
                    if(i==c.length-1){
                        setTimeout(() => {
                            const new_scroll_d = (clicked_li.getBoundingClientRect().top - (inCM ? e2scroll.querySelector('.cmtitlebar').getBoundingClientRect().bottom : e2scroll.getBoundingClientRect().top));
                            const amountOfChange = new_scroll_d - o_scroll_d;
                            amountOfChange < 0 ? e2scroll.scrollBy({ top:amountOfChange, behavior:'smooth'}):null;
                        }, 200)
                    };
                });
            }
            // CONTEXTMENU + CTRL // Hide or Show all OLs and Uls in the Page
            else {
                if (li_childOLULisHidden) {  
                } else {
                }
                // Array.from(document.querySelectorAll('li>ol,li>ul')).reverse().forEach((all_olul_inParentOLUL,i)=>{
                    document.querySelectorAll('li>ol,li>ul').forEach((all_olul_inParentOLUL,i)=>{
                    // li_childOLULisHidden ? all_olul_inParentOLUL.classList.remove('displaynone'):oul.classList.add('displaynone');
                    const t = all_olul_inParentOLUL.parentElement.matches('li > ol > li, li > ul > li') ?  0 : 10; //to stagger direct descendant OL/UL's of the first level LI's on the page
                    setTimeout(() => {
                        slide_OLUL_UpDown(all_olul_inParentOLUL, li_childOLULisHidden?'show':'hide',undefined,true);
                        all_olul_inParentOLUL.setAttribute('hiddingAll','true');
                    }, i*t);
                })
            }
        }
        allow_pageEditNsaveBtns = true;
        if(pageEditNsaveBtns=document.querySelector('#pageEditNsaveBtns')){pageEditNsaveBtns.remove()}
        return
    }
        
    function wasMarkerClicked() {
        if (!olOrUl) return false;
        // doesn't work for nested li's children if ol/ul, li is positioned relative
        const parentOLUL_paddingLeft = parseFloat(window.getComputedStyle(olOrUl).paddingLeft) + parseFloat(olOrUl.getBoundingClientRect().left);// Calculate the padding-left of ul or `ol`
        const li_marginLeft = parseFloat(window.getComputedStyle(clicked_li).marginLeft);// calculate the margin-left of clicked_li
        const clickX = e.clientX;
        const markerBoundary = parentOLUL_paddingLeft + li_marginLeft;// Calculate marker boundary based on combined padding and margin
        const markerWasClicked = clickX <= markerBoundary;// Check if the click falls within the marker boundary
        return markerWasClicked
    }
}
function clickAllLisOnPage(appendHere=document.body) {
    appendHere = appendHere instanceof Event ? document.body : appendHere;
    
    function addStyleToHead() {
        document.getElementById('liOlUlStyle_temporaryStyle') ? liOlUlStyle_temporaryStyle.remove() : null;
        const styleElement = document.createElement('style');
        styleElement.id = 'liOlUlStyle_temporaryStyle';
        styleElement.textContent = 'li>ol,li>ul{opacity:0;}';
        document.head.appendChild(styleElement);
    }
    let isBody = appendHere==document.body;  
    isBody ? addStyleToHead() : null;// make all li>ol,li>ul invisible
    
    let lazyloaderStyle, loadingOverlay;
    // Remove the loading overlay if it exists
    appendHere==document.body ? null : (document.querySelectorAll('#lazyloaderStyle,#loadingOverlay').forEach(x=>{x.remove()}),createAndAddSpinnerAndSpinnerStyle());
    // createAndAddSpinnerAndSpinnerStyle();

    setTimeout(() => {
        if (isBody) {
            clickALlLis();
            setTimeout(() => {
                liOlUlStyle_temporaryStyle ? liOlUlStyle_temporaryStyle.remove() : null;
                // Remove the loading overlay
                document.querySelectorAll('#lazyloaderStyle,#loadingOverlay').forEach(x=>{x.remove()});
                loadingOverlay ? loadingOverlay.remove() : null;
                lazyloaderStyle ? lazyloaderStyle.remove() : null;
                //Hide Everything On Page Load (Because of Opening Files in Church so that they don't read or capture what I don't want them to)
                Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).reverse().forEach(hx=>{toggleH1to6siblings(null,hx)});
            }, 1500);
        } else {
            appendHere.querySelectorAll('li').forEach(function(li) {li.click();});
            let t = 100;
            Array.from(appendHere.querySelectorAll(':is(h1,h2,h3,h4,h5,h6):not(.notemenu *)')).forEach((hx, i) => {
                if (i != 0) t = toggleH1to6siblings(null,hx);
            });
            setTimeout(() => {
                // Remove the loading overlay
                document.querySelectorAll('#lazyloaderStyle,#loadingOverlay').forEach(x=>{x.remove()});
            }, t+100);
        }
    },1500);
    function clickALlLis() {
        appendHere.querySelectorAll('*:not(li):not(ul):not(ol) > :is(ol,ul)').forEach(olUl=>{
            const li = olUl.querySelector('li:has(ol)');
            if (li) {  
                let clientX = parseFloat(window.getComputedStyle(li).paddingLeft) + parseFloat(li.getBoundingClientRect().left)/2;
                htmlListCollapser({type:'contextmenu', ctrlKey:false, shiftKey:false, target:li, clientX})
            }
        })
    }
    function createAndAddSpinnerAndSpinnerStyle() {
        document.getElementById('loadingOverlay') ? document.getElementById('loadingOverlay').remove() : null;
        // Create a loading overlay with a spinner
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        isBody ? loadingOverlay.style.setProperty('position', 'fixed', 'important') : loadingOverlay.style.position = 'absolute';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = isBody ? '100vw' : '100%';
        loadingOverlay.style.height = isBody ? '100vh' : '100%';
        loadingOverlay.style.backgroundColor = 'var(--transparent-ref-img)';
        loadingOverlay.style.zIndex = '1000';
        loadingOverlay.style.setProperty('display', 'flex', 'important');
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';

        // Create a spinner element
        const spinner = document.createElement('div');
        spinner.style.border = '16px solid #f3f3f3';
        spinner.style.borderTop = '16px solid var(--chpt)'; /* #3498db */
        spinner.style.borderRadius = '50%';
        spinner.style.width = '120px';
        spinner.style.height = '120px';
        spinner.style.animation = 'spin 2s linear infinite';
        spinner.id = 'lazyLoaderSpinner';

        // Append the spinner to the loading overlay
        loadingOverlay.appendChild(spinner);

        // Add CSS for the spinner animation
        const lls = document.getElementById('lazyloaderStyle');
        lls ? lls.remove() : null;
        lazyloaderStyle = document.createElement('style');
        lazyloaderStyle.id = 'lazyloaderStyle';
        lazyloaderStyle.innerHTML = `
    .darkmode #loadingOverlay{background:rgba(12,14,18,0.93)!important;}
    .darkmode #lazyLoaderSpinner{background:rgba(12,14,18,0)!important;border:16px solid var(--ref-img)!important;border-top-color:rgb(219, 135, 52)!important;}
    #lazyLoaderSpinner{box-shadow:0px 0px 0.5px var(--sh),0px 0px 0.5px var(--sh) inset!important;}
    @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
    }`;
        lazyloaderStyle.innerHTML += isBody ? 'body {overflow:hidden;position:static!important;} #loadingOverlay{position:fixed;min-height:100vh!important;min-width:100vw!important;}' : `#${appendHere.closest('[id]').id} .text_content {overflow:hidden;position:relative;}`;

        document.head.appendChild(lazyloaderStyle);
        // Append the overlay to the appendHere element
        appendHere.appendChild(loadingOverlay);
    }
}
var _temp = document.getElementById('loadingOverlay');
_temp ? clickAllLisOnPage(_temp.closest('.text_content')) : null;
document.addEventListener('mousedown', htmlListCollapser);
document.addEventListener('click', htmlListCollapser);
document.addEventListener('contextmenu', htmlListCollapser);