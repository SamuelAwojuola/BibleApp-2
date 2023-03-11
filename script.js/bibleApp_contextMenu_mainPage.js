const add_tooltipContextMenu_preventDoublick = debounce(add_tooltipContextMenu, 300);

pagemaster.addEventListener(contextMenu_touch, add_tooltipContextMenu, false);
// main.addEventListener(contextMenu_touch, add_tooltipContextMenu, false);
// searchPreviewFixed.addEventListener(contextMenu_touch, add_tooltipContextMenu, false);

pagemaster.addEventListener('mouseout', function (e) {
    if (e.target.matches('.translated, .strnum, .crossrefs>span, .verse_note span')) {
        clearTimeout(timer1)
    }
});
pagemaster.addEventListener('mouseover', function (e) {
    if (e.target.matches('.translated')) {
        e.preventDefault()
    }
});
let toolTipON = false;
//Hide ContextMenu on clicking outside of main window
main.addEventListener('mousedown', function (e) {
    if (document.querySelector('.context_menu') && (/* !e.target.matches('[strnum]') && */ !e.target.matches('.context_menu') && !elmAhasElmOfClassBasAncestor(e.target, '.context_menu'))) {
        hideRightClickContextMenu()
    }
})

context_menu.addEventListener("click", codeElmRefClick);

/* FOR SHOWING CROSSREFS AND VERSES NOTES */
pagemaster.addEventListener("click", codeButtons);
pagemaster.addEventListener(contextMenu_touch, codeButtons);
pagemaster.addEventListener("mouseup", codeButtonsRemove);
function codeButtons(e) {
    if(e.target.matches('#ppp .verse code[ref]')) {
        /* *********************************** */
        /* IF IT HAS BEEN REMOVED, RECREATE IT */
        /* *********************************** */
        //It may get removed on loading new reference
        if(document.getElementById('show_crossref_comments')==null){
            let newElm = document.createElement('div');
            newElm.classList.add('displaynone');
            newElm.id='show_crossref_comments';
            newElm.innerHTML=`<button class="buttons" id="verse_marker_button" onclick="show_v_grp(this)">Markers</button><button class="buttons verse_crossref_button" id="verse_crossref_button"><a>TSK</a></button><button class="buttons verse_notes_button" id="verse_notes_button"><a>Note</a></button>
            `;
            ppp.append(newElm);
        }
        /* *********************************** */
        /*  APPEND IT TO THE DESIRED CODE ELM  */
        /* *********************************** */
        if(document.querySelector('#show_crossref_comments')){
            if (e.target.matches('.verse code') && (e.type == 'click'||contextMenu_touch)) {
                relocateElmTo(show_crossref_comments, e.target);
                show_crossref_comments.classList.remove('displaynone');
            } else if (!e.target.matches('.verse code') && (e.type == 'mouseout')) {
                show_crossref_comments.classList.add('displaynone');
            }
        }
    }
}
function codeButtonsRemove(e) {
    if(!e.target.matches('#ppp .verse code[ref], #show_crossref_comments, #show_crossref_comments *')){
        if(document.querySelector('#show_crossref_comments')){
            show_crossref_comments.classList.add('displaynone');
        }
    }
}