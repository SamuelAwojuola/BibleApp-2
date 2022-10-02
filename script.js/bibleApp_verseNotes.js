ppp.addEventListener("click", showVerseNote);

function showVerseNote(e, x) {
    if (e) {
        if (e.target.matches('#verse_notes_button') || e.target.parentNode.matches('#verse_notes_button')) {
            appendVerseNote(e);
        }
        if (e.target.matches('.note_edit_button')) {
            editVerseNote(eTarget = e.target, e);
        }
        if (e.target.parentNode.matches('.note_edit_button')) {
            editVerseNote(eTarget = e.target.parentNode, e);
        }
    } else {
        editVerseNote(x);
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
        let noteID = 'note' + masterVerseHolder.id.replaceAll(".", "_");
        let chapterHolder = elmAhasElmOfClassBasAncestor(masterVerseHolder, '.chptverses');
        console.log(chapterHolder)
        console.log(noteID)
        if (vnt = chapterHolder.querySelector('#' + noteID)) {
            vnt.style.display = '';
            vnt.classList.remove('slideup');
            masterVerseHolder.classList.add('showing_versenote');
        } else {
            let verseNoteDiv = new DocumentFragment();

            let newVerseNote = verse_note.cloneNode(true);
            newVerseNote.id = noteID;
            verseNoteDiv.append(newVerseNote);

            whereTOappend.parentNode.insertBefore(verseNoteDiv, whereTOappend.nextSibling);
            masterVerseHolder.classList.add('showing_versenote');
            eTarget.querySelector('a').setAttribute('href', '#' + noteID);
            siblingVersenote = X_hasNoSibling_Y_b4_Z(masterVerseHolder, '.verse_note', '.vmultiple').elmY;
            setTimeout(() => {
                siblingVersenote.classList.remove('slideup');
            }, 1);
        }
    } else {
        siblingVersenote = X_hasNoSibling_Y_b4_Z(masterVerseHolder, '.verse_note', '.vmultiple').elmY;
        siblingVersenote.classList.add('slideup');
        setTimeout(() => {
            // siblingVersenote.remove();
            siblingVersenote.style.display = 'none';
            masterVerseHolder.classList.remove('showing_versenote');
        }, 100);
    }
}

function editVerseNote(eTarget, e) {
    let eTargets_note = eTarget.parentNode.querySelector('.text_content');
    editNotez = eTargets_note;
    if (eTargets_note.contentEditable == 'false') {
        //before this new button click check if another wasn't clicked before it.
        if(oldeditbtn=ppp.querySelector('.note_edit_button.active')){
            let oldeditbtn_note = oldeditbtn.parentNode.querySelector('.text_content');
            oldeditbtn_note.contentEditable = 'false';
            oldeditbtn.style.backgroundColor = '';
            oldeditbtn.classList.remove('active');
            disableCKEditor()
            noteEditingTarget.id = '';
        }

        eTargets_note.contentEditable = 'true';
        eTargets_note.id = 'noteEditingTarget'
        eTarget.style.backgroundColor = 'pink';
        eTarget.classList.add('active');

        enableCKEditor('noteEditingTarget', eTarget)
    } else if (eTargets_note.contentEditable == 'true') {
        eTargets_note.contentEditable = 'false';
        eTarget.style.backgroundColor = '';
        disableCKEditor()
        noteEditingTarget.id = '';
    }
}

// function disablePreviousNoteEditing(){
//     eTargets_note.contentEditable = 'false';
//     eTarget.style.backgroundColor = '';
//     disableCKEditor()
//     noteEditingTarget.id = '';
// }

function enableCKEditor(ID) {
    disableCKEditor()
    CKEDITOR.inline(ID, {
        // Allow some non-standard markup that we used in the introduction.
        extraAllowedContent: 'a(documentation);abbr[title];code',
        removePlugins: 'stylescombo',
        extraPlugins: 'sourcedialog',
        removeButtons: 'PasteFromWord',
        // Show toolbar on startup (optional).
        startupFocus: true
    });
}

function disableCKEditor() {
    for (k in CKEDITOR.instances) {
        var instance = CKEDITOR.instances[k];
        instance.destroy();
    }
}