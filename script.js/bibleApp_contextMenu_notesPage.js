const add_tooltipContextMenu_preventDoublick = debounce(add_tooltipContextMenu, 300);

col2.addEventListener('contextmenu', add_tooltipContextMenu, false);

col2.addEventListener('mouseout', function (e) {
    if (e.target.matches('.translated, .strnum, .crossrefs>span, .verse_note span')) {
        clearTimeout(timer1)
    }
});
col2.addEventListener('mouseover', function (e) {
    if (e.target.matches('.translated')) {
        e.preventDefault()
    }
});

function remove_mouseoverContextMenuEventListner() {
    //In case it is on the screen
    // context_menu.classList.remove('slidein');
    // context_menu.classList.add('slideout');
    interact('.cmtitlebar').unset();
    console.log('interact');
    col2.removeEventListener('mouseover', add_tooltipContextMenu, false);
    col2.removeEventListener('mouseover', add_tooltipContextMenu, false);
}
// add_mouseoverContextMenuEventListner()

// let toolTipON = ttip_check.checked; //Is modified by escape or alt + t
document.addEventListener('keydown', evt => {
    if ((evt.key === 'y'||evt.key === 'Y') && evt.altKey) {
        // toolTipOnOff();
        // toolTipON = ttip_check.checked;
    }
    if (evt.key === 'Escape' && document.querySelector('#context_menu')) {
        context_menu.innerHTML = '';
    }
});

//Hide ContextMenu on clicking outside of col2 window
document.addEventListener('click', function (e) {
    if (document.querySelector('.context_menu') && (!e.target.matches('[strnum]') && !e.target.matches('.context_menu') && !elmAhasElmOfClassBasAncestor(e.target, '.context_menu'))) {
        hideRightClickContextMenu()
    }
})

context_menu.addEventListener("click", codeELmRefClick);

/* FOR SHOWING CROSSREFS AND VERSES NOTES */
col2.addEventListener("mouseover", codeButtons);
function codeButtons(e) {
    if(document.getElementById('show_crossref_comments')==null){ //It may get removed on loading new reference
        let newElm = document.createElement('div');
        newElm.classList.add('slideout');
        newElm.id='show_crossref_comments';
        newElm.innerHTML=`<button class="buttons verse_crossref_button" id="verse_crossref_button"><a>TSK</a></button><button class="buttons verse_notes_button" id="verse_notes_button"><a>Note</a></button>`;
        col2.append(newElm);
    } else if(show_crossref_comments){
        if (e.target.matches('.verse code') && (e.type == 'mouseover')) {
            relocateElmTo(show_crossref_comments, e.target);
            show_crossref_comments.classList.remove('slideout');
            show_crossref_comments.classList.add('slidein');
        } else if (!e.target.matches('.verse code') && (e.type == 'mouseout')) {
            show_crossref_comments.classList.remove('slidein');
            show_crossref_comments.classList.add('slideout');
        }
    }
}