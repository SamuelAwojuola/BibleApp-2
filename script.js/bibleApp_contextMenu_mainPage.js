const add_tooltipContextMenu_preventDoublick = debounce(add_tooltipContextMenu, 300);

main.addEventListener('contextmenu', add_tooltipContextMenu, false);
searchPreviewFixed.addEventListener('contextmenu', add_tooltipContextMenu, false);
// searchPreviewFixed.addEventListener('mousedown', add_tooltipContextMenu_preventDoublick, false);

ppp.addEventListener('mouseout', function (e) {
    if (e.target.matches('.translated, .strnum, .crossrefs>span, .verse_note span')) {
        clearTimeout(timer1)
    }
});
main.addEventListener('mouseover', function (e) {
    if (e.target.matches('.translated')) {
        e.preventDefault()
    }
});

// function add_mouseoverContextMenuEventListner() {
//     // searchPreviewFixed.addEventListener('mouseover', add_tooltipContextMenu, false);
//     searchPreviewFixed.addEventListener('click', add_tooltipContextMenu_preventDoublick, false);

//     ppp.addEventListener('mouseover', add_tooltipContextMenu, false);

//     // for strongs number breakdown on click
//     // ppp.addEventListener('click', add_tooltipContextMenu_preventDoublick, false);
// }

// function remove_mouseoverContextMenuEventListner() {
//     // hideRefNav('hide', context_menu); //In case it is on the screen
//     if(document.querySelector('body').matches('#versenotepage')){
//         col2.removeEventListener('mouseover', add_tooltipContextMenu, false);
//     }else {
//         ppp.removeEventListener('mouseover', add_tooltipContextMenu, false);
//         searchPreviewFixed.removeEventListener('click', add_tooltipContextMenu, false);
//     }
// }
let toolTipON = false;
//Hide ContextMenu on clicking outside of main window
main.addEventListener('click', function (e) {
    if (document.querySelector('.context_menu') && (/* !e.target.matches('[strnum]') && */ !e.target.matches('.context_menu') && !elmAhasElmOfClassBasAncestor(e.target, '.context_menu'))) {
        hideRightClickContextMenu()
    }
})

// function updateContextMenuPosition(oldScrollTop) {
//     // console.log(main.scrollHeight)
//     // console.log(oldScrollTop)
//     // console.log(main.scrollTop)
//     // console.log(main.clientHeight)
//     // console.log(main.scrollHeight - main.scrollTop - main.clientHeight)
// }

// function addCMPevtListner() {
//     let scrlT = main.scrollTop;
//     ppp.addEventListener('scroll', updateContextMenuPosition(scrlT))
//     searchPreviewFixed.addEventListener('scroll', updateContextMenuPosition(scrlT))
// }

// function removeCMPevtListner() {
//     ppp.removeEventListener('scroll', updateContextMenuPosition)
//     searchPreviewFixed.removeEventListener('scroll', updateContextMenuPosition)
// }

context_menu.addEventListener("click", codeElmRefClick);

/* FOR SHOWING CROSSREFS AND VERSES NOTES */
ppp.addEventListener("click", codeButtons);
ppp.addEventListener("contextmenu", codeButtons);
ppp.addEventListener("mouseup", codeButtonsRemove);
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
            if (e.target.matches('.verse code') && (e.type == 'click'||'contextmenu')) {
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