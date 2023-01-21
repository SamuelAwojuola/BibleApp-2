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

function add_mouseoverContextMenuEventListner() {
    // searchPreviewFixed.addEventListener('mouseover', add_tooltipContextMenu, false);
    searchPreviewFixed.addEventListener('click', add_tooltipContextMenu_preventDoublick, false);

    ppp.addEventListener('mouseover', add_tooltipContextMenu, false);

    // for strongs number breakdown on click
    // ppp.addEventListener('click', add_tooltipContextMenu_preventDoublick, false);
}

function remove_mouseoverContextMenuEventListner() {
    // hideRefNav('hide', context_menu); //In case it is on the screen
    if(document.querySelector('body').matches('#versenotepage')){
        col2.removeEventListener('mouseover', add_tooltipContextMenu, false);
    }else {
        ppp.removeEventListener('mouseover', add_tooltipContextMenu, false);
        searchPreviewFixed.removeEventListener('click', add_tooltipContextMenu, false);
    }
}
add_mouseoverContextMenuEventListner()

tool_tip.addEventListener('click', () => {
    toolTipOnOff();
    toolTipON = ttip_check.checked;
});

let toolTipON = ttip_check.checked; //Is modified by escape or alt + t
document.addEventListener('keydown', evt => {
    if ((evt.key === 'y'||evt.key === 'Y') && evt.altKey) {
        toolTipOnOff();
        toolTipON = ttip_check.checked;
    }
    if (evt.key === 'Escape' && document.querySelector('#context_menu')) {
        hideRightClickContextMenu()
        // hideRefNav('hide', context_menu);
        // interact('.cmtitlebar').unset();
        // console.log('interact');
        // context_menu.innerHTML = '';
    }
});

function toolTipOnOff(x) {
    if (x == false || ttip_check.checked) {
        ttip_check.checked = false;
        tool_tip.classList.remove("active_button");
        remove_mouseoverContextMenuEventListner();
        // add_rClickcontextMenuEventListner();
        // removeCMPevtListner();
    } else {
        ttip_check.checked = true;
        tool_tip.classList.add("active_button");
        add_mouseoverContextMenuEventListner();
        // remove_rClickcontextMenuEventListner();
    }
}
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

context_menu.addEventListener("click", codeELmRefClick);

/* FOR SHOWING CROSSREFS AND VERSES NOTES */
ppp.addEventListener("mouseover", codeButtons);
function codeButtons(e) {
    if(document.getElementById('show_crossref_comments')==null){ //It may get removed on loading new reference
        let newElm = document.createElement('div');
        newElm.classList.add('displaynone');
        newElm.id='show_crossref_comments';
        newElm.innerHTML=`<button class="buttons verse_crossref_button" id="verse_crossref_button"><a>TSK</a></button><button class="buttons verse_notes_button" id="verse_notes_button"><a>Note</a></button>`;
        ppp.append(newElm);
    } else if(show_crossref_comments){
        if (e.target.matches('.verse code') && (e.type == 'mouseover')) {
            relocateElmTo(show_crossref_comments, e.target);
            show_crossref_comments.classList.remove('displaynone');
        } else if (!e.target.matches('.verse code') && (e.type == 'mouseout')) {
            show_crossref_comments.classList.add('displaynone');
        }
    }
}