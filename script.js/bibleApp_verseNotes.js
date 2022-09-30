ppp.addEventListener("click", showVerseNote);

function showVerseNote(e) {
    if (e.target.matches('#verse_notes_button') || e.target.parentNode.matches('#verse_notes_button')) {
        appendVerseNote(e);
    }
    if (e.target.matches('.note_edit_button')) {
        editVerseNote(eTarget = e.target, e);
    }
    if (e.target.parentNode.matches('.note_edit_button')) {
        editVerseNote(eTarget = e.target.parentNode, e);
    }
}

function appendVerseNote(e) {
    let eTarget;
    if (e.target.matches('#verse_notes_button')) {
        eTarget = e.target
    } else if (e.target.matches('#verse_notes_button a')) {
        eTarget = e.target.parentNode
    }
    let siblingVersenote;
    let masterVerseHolder = elmAhasElmOfClassBasAncestor(e.target, '.vmultiple');


    //Make notes always come after crossref
    let whereTOappend = undefined;
    whereTOappend = X_hasNoSibling_Y_b4_Z(masterVerseHolder, '.crossrefs', '.vmultiple').elm2appendAfter;
    // if (X_hasNoSibling_Y_b4_Z(masterVerseHolder,'.crossrefs','.vmultiple').yes_no) {
    // }

    //If verse_note is not already attached to verse
    if (!masterVerseHolder.classList.contains('showing_versenote')) {
        let verseNoteDiv = new DocumentFragment();
        let newVerseNote = verse_note.cloneNode(true);
        newVerseNote.id = 'xxxxxxxxx'
        verseNoteDiv.append(newVerseNote);

        whereTOappend.parentNode.insertBefore(verseNoteDiv, whereTOappend.nextSibling);
        masterVerseHolder.classList.add('showing_versenote');
        eTarget.querySelector('a').setAttribute('href', '#xxxxxxxxx');
        siblingVersenote = X_hasNoSibling_Y_b4_Z(masterVerseHolder, '.verse_note', '.vmultiple').elmY;
        setTimeout(() => {
            siblingVersenote.classList.remove('slideup');
        }, 1);

    } else {
        siblingVersenote = X_hasNoSibling_Y_b4_Z(masterVerseHolder, '.verse_note', '.vmultiple').elmY;
        siblingVersenote.classList.add('slideup');
        setTimeout(() => {
            siblingVersenote.remove();
            masterVerseHolder.classList.remove('showing_versenote');
        }, 100);
    }
}

function editVerseNote(eTarget, e) {
    let eTargets_note = eTarget.parentNode.querySelector('.text_content');
    editNotez = eTargets_note;
    console.log(eTargets_note.contentEditable)
    if (eTargets_note.contentEditable == 'false') {
        eTargets_note.contentEditable = 'true';
        eTarget.style.backgroundColor='crimson';
        eTargets_note.id='noteEditingTarget'
        enableTextEditor()
    } else if (eTargets_note.contentEditable == 'true') {
        console.log('edit false')
        eTargets_note.contentEditable = 'false';
        eTarget.style.backgroundColor='';
    }
}

function enableTextEditor(){
}