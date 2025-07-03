let showing_show_crossref_comments = false;
const add_tooltipContextMenu_preventDoublick = debounce(add_tooltipContextMenu, 300);

pagemaster.addEventListener(contextMenu_touch, add_tooltipContextMenu, false);
// main.addEventListener(contextMenu_touch, add_tooltipContextMenu, false);
// searchPreviewFixed.addEventListener(contextMenu_touch, add_tooltipContextMenu, false);

pagemaster.addEventListener('mouseout', function (e) {
    if (e.target.matches('.translated, .strnum, .crossrefs>span, .verse_note span')) {
        clearTimeout(timer1)
    }
});
pagemaster.addEventListener('mouseover',mouseOverMarker);
function mouseOverMarker(e) {
    // e.preventDefault();
    if (e.target.matches('h1,h2,h3,h4,h5,h6')) {
        mouseOverMarker_inner(e);
        e.target.addEventListener('mousemove', mouseOverMarker_inner);
        e.target.addEventListener('mouseout', restoreDefaultCursor);
        
        function mouseOverMarker_inner(ev) {
            if (wasMarkerClicked(ev,ev.target)) {
                ev.target.classList.add('cursor_pointer');
                ev.target.addEventListener('mouseout',restoreDefaultCursor);
            }
            else {ev.target.classList.remove('cursor_pointer');}
        }
    }
    function restoreDefaultCursor(ev) {
        ev.target.classList.remove('cursor_pointer');
        ev.target.removeEventListener('mouseout',restoreDefaultCursor);
        ev.target.removeEventListener('mousemove', mouseOverMarker_inner);
    }
}
let toolTipON = false,clickTimeStamp=0;
//Hide ContextMenu on clicking outside of main window
pagemaster.addEventListener('mousedown', function (e) {
    if(e.target.closest('.verses_input,#btns_compareWindow_totheright,#searchparameters,#closebtn_searchPreviewWindowFixed, /*[strnum], [ref],*/ .crossrefs [tabindex]')){return}
    if (e.target.closest('#main, #refnav_col2, #versenote_totheright') && !e.target.closest('#bibleapp_cache') && document.querySelector('.context_menu.slideintoview') && !e.target.closest('.context_menu')) {
        // If there is context_menu, then clicking on a verse will not bring up the versenote
        // clickTimeStamp will indicate if the menu was just hidden
        // Only register clickTimeStamp if #main > #context_menu and not out of view
        pagemaster.querySelector("#main > #context_menu:not(.displaynone):not(.slideoutofview)") && isFullyScrolledIntoView(context_menu,main,true) ? main.addEventListener('mouseup',mouseUpTimeStamp):null;
        function mouseUpTimeStamp(e){clickTimeStamp=e.timeStamp;main.removeEventListener('mouseup',mouseUpTimeStamp);}
        //To hide cmenu if the mousedown is left-mouse-click or if cmenu is being changed from inside versenote to outside it or vice versa (so that it doesn't try to animate the change in position of cmenu) 
        const cmenuPossibleParents = '.text_content, #searchPreviewFixed, #versenote_totheright, .win2_noteholder, #scriptureCompareWindow, #main';// #main has to be the last
        if (e.button==0 || (e.button==2 && context_menu && !e.target.matches('.strnum, [strnum], :is(.crossrefs_holder,.crfnnote) > crossrefs span[tabindex]') && (((cmenuPrnt=context_menu.closest(cmenuPossibleParents))&&cmenuPrnt!=e.target.closest(cmenuPossibleParents))))){
            hideRightClickContextMenu();
        }
    }
})

context_menu.addEventListener("mouseup", codeElmRefClick);

/* FOR SHOWING CROSSREFS AND VERSES NOTES */
pagemaster.addEventListener("click", debounce(codeButtons));
pagemaster.addEventListener("contextmenu", codeButtons);
pagemaster.addEventListener(contextMenu_touch, codeButtons);
pagemaster.addEventListener("mouseup",codeButtonsRemove);
function codeButtons(e) {
    if((e.type=='click' && e.target.matches('.context_menu .verse code[ref]')) || !(e.type=='click' && e.target.matches('/*#main*/ .verse code[ref]')) && !(e.type=='contextmenu' && e.target.matches('#ppp .verse'))) {
        return
    }

    /* *********************************** */
    /* IF IT HAS BEEN REMOVED, RECREATE IT */
    /* *********************************** */
    // It may get removed on loading new reference
    if(document.getElementById('show_crossref_comments')==null){
        let newElm = document.createElement('div');
        newElm.classList.add('displaynone');
        newElm.id='show_crossref_comments';
        newElm.innerHTML=`<button class="buttons" id="inline_versions_buttons" onclick="toggleInlineVerseCompareContextMenu(this)" style="font-style:normal!important;">Versions&#x25B6;</button><button class="buttons" id="verse_marker_button" onclick="show_v_grp(this)">Markers</button><button class="buttons verse_crossref_button" id="verse_crossref_button">x_Ref</button><button class="buttons verse_notes_button" id="verse_notes_button">Note</button>`;//<a>TSK</a>
        ppp.append(newElm);
        showing_show_crossref_comments=true;
    }
    inline_versions_buttons.innerHTML='Versions &#x25B6;';
    /* *********************************** */
    /*  APPEND IT TO THE DESIRED CODE ELM  */
    /* *********************************** */
    if(document.querySelector('#show_crossref_comments')){
        if (e.target.matches('.verse, .verse code') && (['click','contextmenu',contextMenu_touch].includes(e.type))) {
            let et;
            if (e.target.matches('.verse code')){et=e.target}
            else if (!mouseHasMoved) {
                if (e.target.closest('.vmultiple')){et=e.target.closest('.vmultiple');}
                else{et=e.target.closest('.verse');}
            }
            else {return}

            let eT_classes = e.target.closest('.verse') ? '.' + e.target.classList.value.split(' ').join(',.'):null;
            show_crossref_comments.setAttribute('clickedVerse',eT_classes);
    
            et.appendChild(show_crossref_comments);
            show_crossref_comments.classList.remove('displaynone');
            showing_show_crossref_comments = true;    
            // show_crossref_comments.style.position = '';//remove fixed position in case it is for appending to code element
            show_crossref_comments.removeAttribute('style');
            if (e.type=='contextmenu') {
                let et_Rect = et.getBoundingClientRect();
                let _left = e.clientX - et_Rect.left;
                let _top = e.clientY - et_Rect.top;
                let lr = 1;
                show_crossref_comments.style.position = 'absolute';
                show_crossref_comments.style.top = _top + 'px';
                show_crossref_comments.style.left = _left + 'px';
                show_crossref_comments.style.flexDirection = 'column';
                let et_rightMostEdge = et_Rect.left + et.offsetWidth;
                let et_topMostEdge = et_Rect.top + et.offsetHeigth;
                if ((rightSide = e.clientX + show_crossref_comments.offsetWidth) > (et_rightMostEdge)) {
                    _left = e.clientX - (rightSide - et_rightMostEdge) + 5;
                    show_crossref_comments.style.left = _left + 'px';
                    x();
                }
                if ((bottomSide = e.clientY + show_crossref_comments.offsetHeigth) > et_topMostEdge) {
                    _top = e.clientY - (bottomSide - et_topMostEdge);
                    show_crossref_comments.style.top =  _top + 'px';
                }
                if ((e.clientX + 95) > et_rightMostEdge) {x();}
                function x(){lr=-1; inline_versions_buttons.innerHTML='&#x25C4;Versions';}

                //SINGLE VERSE COMPARE MENU
                setTimeout(() => {
                    if(!document.querySelector('#singleverse_compare_menu')){
                        addLocalVersionsLoaderButtons(e);
                    }
                    singleverse_compare_menu.style.display = 'flex';
                    singleverse_compare_menu.style.flexWrap = 'wrap';
                    singleverse_compare_menu.style.flexDirection = 'column';
                    singleverse_compare_menu.style.position = 'absolute';
                    singleverse_compare_menu.style.width = '90px';
                    _left = _left + (lr * 3) + (lr * show_crossref_comments.offsetWidth) + 'px';
                    singleverse_compare_menu.style.left = _left;
                    singleverse_compare_menu.style.top =  _top + 'px';
                    inline_versions_buttons.setAttribute('top', _top + 'px');
                    inline_versions_buttons.setAttribute('left', _left);
                }, 10);
            }
        } else if (!e.target.matches('.verse code') && (e.type == 'mouseout')) {
            show_crossref_comments.classList.add('displaynone');
            setTimeout(() => {showing_show_crossref_comments = false;}, 0);
        }
    }
    showing_show_crossref_comments = true;
    setTimeout(() => {typeof singleverse_compare_menu != 'undefined' && !singleverse_compare_menu.classList.contains('show') && show_crossref_comments.getAttribute('clickedverse').match(/.verse/g) ? inline_versions_buttons.click() : null;}, 10);

}
function codeButtonsRemove(e) {
    if(!e.target.closest('#singleverse_compare_menu, #show_crossref_comments')){
        if(document.querySelector('#show_crossref_comments')){
            show_crossref_comments.classList.add('displaynone');
            // showing_show_crossref_comments = true;
            setTimeout(() => {showing_show_crossref_comments = false;}, 0);
            if(document.querySelector('#singleverse_compare_menu')){
                singleverse_compare_menu.remove();
            }
        }
    }
    if(e.target.closest('#inline_versions_buttons') && e.target.parentElement.querySelector('#singleverse_compare_menu:not(.show)')){
        singleverse_compare_menu.remove();
    }
}