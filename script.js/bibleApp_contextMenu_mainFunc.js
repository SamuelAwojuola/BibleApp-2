let formerContextMenu_Coordinates = {};
/* RIGHT-CLICK MENU */
let timer1, timer2;
let rightClickedElm = null;
let newStrongsDef = '';
let append2BottomOfTarget = 0;
function createNewContextMenu(){
    // If there isn't a contextMenu already, create one
    if (!document.querySelector('#context_menu')) {
        let context_menu_replacement = document.createElement('div');
        context_menu_replacement.id = 'context_menu';
        context_menu_replacement.classList.add('context_menu');
        context_menu_replacement.classList.add('slideoutofview');
        main.prepend(context_menu_replacement);
        context_menu.addEventListener("click", codeElmRefClick);
    }
}
// Check if it is index page or verseNotes page
if (document.querySelector('body').matches('#versenotepage')) {
    append2BottomOfTarget = 1;
} else {
    main = document.querySelector('#main');
}
enableInteractJSonEl('.cmtitlebar', context_menu);

// let context_menu = document.querySelector('#context_menu');
function add_tooltipContextMenu(e) {
    e.preventDefault();
    parentIsContextMenu = 0;
    createNewContextMenu();
    formerContextMenu_Coordinates.transform = context_menu.style.transform;
    const interactEnabled = context_menu.matches('.slideintoview');
    
    // If the traget is a strong's number
    if (e.target.getAttribute('strnum') && !e.target.matches('.context_menu')) {
        rightClickedElm = e.target;
        firstShadowColorOfElem = getBoxShadowColor(rightClickedElm);
    }

    // FOR SHOWING AND HIDING THE RIGHTCLICK MENU
    if (e.target.matches('.translated, .strnum, .crossrefs>span, .verse_note span, .win2_noteholder span, #versenote_totheright, #versenote_totheright *')) {
        getCurrentStrongsDef(e);
        clearTimeout(timer1);
        clearTimeout(timer2);
        timedFUNC();

        function timedFUNC() {
            let originalWord, extraLeft = 0,
            addquotes = true,
            eParent;
            eTarget = e.target;

            /* ********************************** */
            /* ** WHERE TO APPEND CONTEXT-MENU ** */
            /* ********************************** */
            function get_eParent() {
                /* ||||||||||||||||||||||| */
                /* ||Append to verseNote|| */
                /* ||||||||||||||||||||||| */
                if (elmAhasElmOfClassBasAncestor(e.target, '.verse_note')) {
                    eParent = elmAhasElmOfClassBasAncestor(e.target, '.verse_note').querySelector('.text_content');
                    if (!eParent.querySelector('#context_menu')) {
                        //move the #context_menu from #main to #searchPreviewFixed
                        let clonedContextMenu = document.querySelector('#context_menu').cloneNode(true);
                        document.querySelector('#context_menu').remove()
                        eParent.append(clonedContextMenu)
                        clonedContextMenu.addEventListener("click", codeElmRefClick)
                    }
                }
                /* ||||||||||||||||||| */
                /* ||Append to verse|| */
                /* ||||||||||||||||||| */
                else if (elmAhasElmOfClassBasAncestor(e.target, '#main')) {
                    eParent = document.querySelector('#main');
                    if (eParent.offsetLeft != 0) {
                        extraLeft = eParent.offsetLeft;
                    }
                    if (!eParent.querySelector('#context_menu') || main.querySelector('.verse_note #context_menu')) {
                        //if the #context_menu is not in #main, then it must be in #searchPreviewFixed
                        //move the #context_menu from #searchPreviewFixed to #main
                        let clonedContextMenu = document.querySelector('#context_menu').cloneNode(true);
                        document.querySelector('#context_menu').remove()
                        main.append(clonedContextMenu)
                    }
                }
                /* ||||||||||||||||||||||||||||||||| */
                /* ||Append to #searchPreviewFixed|| */
                /* ||||||||||||||||||||||||||||||||| */
                else if (elmAhasElmOfClassBasAncestor(e.target, '#searchPreviewFixed')) {
                    eParent = document.querySelector('#searchPreviewFixed');
                    if (!searchPreviewWindowFixed.querySelector('#context_menu')) {
                        // if the #context_menu is not in #searchPreviewFixed, then it must be in #main 
                        // move the #context_menu from #main to #searchPreviewFixed
                        let clonedContextMenu = pagemaster.querySelector('#context_menu').cloneNode(true);
                        pagemaster.querySelector('#context_menu').remove()
                        searchPreviewFixed.append(clonedContextMenu)
                    }
                }
                /* ||||||||||||||||||||||||||||||||||| */
                /* ||Append to #versenote_totheright|| */
                /* ||||||||||||||||||||||||||||||||||| */
                else if (elmAhasElmOfClassBasAncestor(e.target, '#versenote_totheright')) {
                    eParent = elmAhasElmOfClassBasAncestor(e.target, '#versenote_totheright');
                    if (!eParent.querySelector('#context_menu')) {
                        let clonedContextMenu = pagemaster.querySelector('#context_menu').cloneNode(true);
                        pagemaster.querySelector('#context_menu').remove()
                        eParent.append(clonedContextMenu)
                        clonedContextMenu.addEventListener("click", codeElmRefClick)
                    }
                }
                /* |||||||||||||||||||||||||||||| */
                /* ||Append to #win2_noteholder|| */
                /* |||||||||||||||||||||||||||||| */
                else if (elmAhasElmOfClassBasAncestor(e.target, '.win2_noteholder')) {
                    eParent = elmAhasElmOfClassBasAncestor(e.target, '.win2_noteholder');
                    if (!eParent.querySelector('#context_menu')) {
                        let clonedContextMenu = pagemaster.querySelector('#context_menu').cloneNode(true);
                        pagemaster.querySelector('#context_menu').remove()
                        eParent.append(clonedContextMenu)
                        clonedContextMenu.addEventListener("click", codeElmRefClick)
                    }
                }
                
            }
            get_eParent()
            
            /* ********************************** */
            /* ** WHERE TO APPEND CONTEXT-MENU ** */
            /* ********************************** */
            ifForStrongsNumberORforCrossRef()
            function ifForStrongsNumberORforCrossRef() {
                if (elmAhasElmOfClassBasAncestor(e.target, '.context_menu')) {
                    parentIsContextMenu = 1;
                }
                /* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */
                /* || If eTraget is a [Translated Strongs Word] or the [Strongs Number] itself || */
                /* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */
                if (e.target.matches('.translated, .strnum')) {
                    // On Mobile Devices
                    if (isMobileDevice && contextMenu_touch!="touchstart") {
                        // remove windows selection
                        // (because on mobile, the user has to press and hold for contextmenu which also selects the text)
                        window.getSelection().removeRange(window.getSelection().getRangeAt(0))
                    }
                    if (e.target.getAttribute("translation")) {
                        originalWord = e.target.getAttribute("translation");
                        if (truexlit = e.target.getAttribute("data-true-xlit")) {
                            if (elmAhasElmOfClassBasAncestor(e.target, 'rtl')) {
                                originalWord = `“${originalWord.trim()} : ”${truexlit}`;
                            } //because of the direction of the text
                            else {
                                originalWord = `“${originalWord.trim()}” : ${truexlit}`;
                            }
                            addquotes = false;
                        }
                    } else {
                        originalWord = e.target.parentElement.getAttribute("translation")
                    }
                    let menu_inner;
                    let arrOfStrnums = e.target.getAttribute('strnum').split(' ');
                    let searchicon = 'search-svgrepo-com(2).svg';
                    if(document.body.matches('.darkmode')){
                        searchicon = 'search-svgrepo-com(2)-DarkMode.svg';
                    }
                    if (originalWord) {
                        let xlitNlemma = '',
                        br = '';
                        for (let i = 0; i < arrOfStrnums.length; i++) {
                            br = '', st = '';
                            if(i==arrOfStrnums.length-1){br = '<br>'}
                            let sn = arrOfStrnums[i];
                            let srchBtn = `<button class="cmenusrchbtn" onclick="wordsearch.value='${sn}'; runWordSearch()"><img src="images/${searchicon}" alt="&#128270;"></button>`;
                            // let srchBtn = `<button class="cmenusrchbtn" onclick="wordsearch.value='${sn}'; runWordSearch()"><div class="magnifyingglass"></div></button>`;
                            xlitNlemma = `${xlitNlemma}${br}<code>${srchBtn}${sn}/${getsStrongsLemmanNxLit(sn).xlit}/${getsStrongsLemmanNxLit(sn).lemma}</code>`
                        }
                        if (addquotes) {
                            // menu_inner = `${e.target.getAttribute('data-title')}<br>“${originalWord.trim()}”`;
                            menu_inner = `${xlitNlemma}<hr>“${originalWord.trim()}”`;
                        } else {
                            // menu_inner = `${e.target.getAttribute('data-title')}<br>${originalWord.trim()}`;
                            menu_inner = `${xlitNlemma}<hr>${originalWord.trim()}`;
                        }
                        context_menu.innerHTML = `<div class="cmtitlebar">${menu_inner}<button class="closebtn cmenu_closebtn" onclick="hideRightClickContextMenu()"></button></div>${newStrongsDef}`;
                    } else if (e.type == contextMenu_touch) { // For strongs number in verseNote
                        let srchBtn = `<code><button class="cmenusrchbtn" onclick="wordsearch.value='${arrOfStrnums}'; runWordSearch()"><img src="images/${searchicon}" alt="&#128270;"></button>${arrOfStrnums}/${getsStrongsLemmanNxLit(arrOfStrnums).xlit}/${getsStrongsLemmanNxLit(arrOfStrnums).lemma}</code>`;
                        context_menu.innerHTML = `<div class="cmtitlebar">${srchBtn}<button class="closebtn cmenu_closebtn" onclick="hideRightClickContextMenu()"></button></div>${newStrongsDef}</div>`;
                    }
                    if (strnum = e.target.getAttribute('strnum')) {
                        context_menu.setAttribute('strnum', strnum)
                    } else {
                        context_menu.removeAttribute('strnum')
                    }
                    hideRefNav('show', context_menu)
                }
            
                /* ||||||||||||||||||||||||||||||||||||||||| */
                /* || If eTarget is a Scripture Reference || */
                /* ||||||||||||||||||||||||||||||||||||||||| */
                else {
                    context_menu.innerText = null;
                    context_menu.classList.add('win2');
                    if (e.target.matches('.crossrefs>span, span[ref]')) {
                        let cmtitlebar = document.createElement('div');
                        cmtitlebar.classList.add('cmtitlebar');
                        let cmtitletext;
                        if (bkn = e.target.getAttribute('bkn')) {
                            cmtitletext = bkn + ' ' + e.target.innerText;
                        } else {
                            cmtitletext = e.target.innerText;
                        }
                        cmtitletext = cmtitletext + ' [' + bversionName + ']';
                        // cmtitlebar.innerText=e.target.innerText;
                        cmtitlebar.innerHTML = cmtitletext + `<button class="closebtn cmenu_closebtn" onclick="hideRightClickContextMenu()"></button>`;
                        context_menu.append(cmtitlebar);
                    }
                    let vHolder = getCrossReference(e.target);
                    /* FOR CROSS-REFS & NOTES IN SEARCH WINDOW */
                    if(crossRefinScriptureTooltip_check.checked){
                        vHolder.querySelectorAll('span.verse').forEach(spanVerse=>{spanVerse.append(crfnnote_DIV(spanVerse))});
                    }

                    context_menu.append(vHolder);
                    // context_menu.append(getCrossReference(e.target));
                    
                    if (strnum = e.target.getAttribute('strnum')) {
                        context_menu.setAttribute('strnum', strnum)
                    } else {
                        context_menu.removeAttribute('strnum')
                    }
                    hideRefNav('show', context_menu)
                    transliterateAllStoredWords()
                }
            }
            context_menu.style.left = null;
            context_menu.style.right = null;
            context_menu.style.top = null;
            context_menu.style.bottom = null;
            context_menu.style.height = null;
            context_menu.style.width = null;
            context_menu.style.transform = null;
            /* ------------------------------------------ */
            /* POSITION & COORDINATES OF CONTEXT MENU */
            eP = eParent;
            parentElement = eParent;

            // Get the position of the child element that was right-clicked
            eTarget = e.target;
            eTargetRect = eTarget.getBoundingClientRect();
            eTargetTop = eTargetRect.top;
            eTargetBottom = eTargetRect.bottom;
            eTargetLeft = eTargetRect.left;
            eTargetRight = eTargetRect.right;
            eTargetWidth = eTargetRect.width;
            eTargetHeight = eTargetRect.height;

            // Get the boundaries of the parent element
            parentElementRect = parentElement.getBoundingClientRect();
            parentElementTop = parentElementRect.top;
            parentElementLeft = parentElementRect.left;
            parentElementWidth = parentElementRect.width;
            parentElementHeight = parentElementRect.height;

            // Get the scrolled position of the parent element
            parentElementScrollTop = parentElement.scrollTop;
            parentElementScrollLeft = parentElement.scrollLeft;

            // Calculate the position of the menu
            menuTop = eTargetTop - parentElementTop + eTargetHeight + parentElementScrollTop;
            menuBottom = eTargetTop - parentElementTop + parentElementScrollTop;
            menuLeft = eTargetLeft - parentElementLeft + parentElementScrollLeft;
            menuRight = parentElementWidth - eTargetRight - parentElementScrollLeft - 7.5;

            // Space above and below target
            spaceAbove = eTargetTop - parentElementTop + parentElementScrollTop;
            spaceBelow = parentElementHeight - eTargetBottom + parentElementScrollTop + parentElementTop;

            function appendLeft() {menuRight = '';
                context_menu.style.right = menuRight;
                context_menu.style.left = menuLeft + 'px';
                formerContextMenu_Coordinates.right = menuRight;
                formerContextMenu_Coordinates.left = menuLeft + 'px';
            }

            function appendRight() {if (menuRight - context_menu.offsetWidth > parentElementLeft + parentElementScrollLeft) {
                    context_menu.style.right = menuRight + 'px';
                    formerContextMenu_Coordinates.right = menuRight + 'px';
                } else {
                    context_menu.style.right = '0px';
                    formerContextMenu_Coordinates.right = '0px';
                }
                menuLeft = '';
                context_menu.style.left = menuLeft;
                formerContextMenu_Coordinates.left = menuLeft;
            }

            function appendAbove() {
                if(crefs_holder = elmAhasElmOfClassBasAncestor(eTarget,'.chptverses .crossrefs')){
                    /* --------------------------------------------------------- */
                    /* Remove position RELATIVE from .crossrefs holding crossref */
                    /* ------ It affects the determination of the position ----- */
                    /* --------------------------------------------------------- */
                    crefs_holder.style.position="static";
                }

                menuBottom = parentElementHeight - eTarget.offsetTop + 'px';
                menuTop = '';

                context_menu.style.top = menuTop;
                context_menu.style.bottom = menuBottom;

                formerContextMenu_Coordinates.top = menuTop;
                formerContextMenu_Coordinates.bottom = menuBottom;

                //To always appendBelow in verseNotesPage
                if (append2BottomOfTarget) {
                    let newHeight = eTarget.offsetTop + parentElement.offsetTop;
                    context_menu.style.maxHeight = col2.getBoundingClientRect().height / 2 + 'px';
                    if (context_menu.getBoundingClientRect().height > newHeight) {
                        context_menu.style.height = newHeight + 'px';
                    }
                }
                if(crefs_holder = elmAhasElmOfClassBasAncestor(eTarget,'.chptverses.crossrefs')){
                    /* --------------------------------------------------------- */
                    /* Remove position STATIC from .crossrefs holding crossref */
                    /* --------------------------------------------------------- */
                    crefs_holder.style.position="";
                }
            }

            function appendBelow() {
                menuBottom = '';
                menuTop = eTargetBottom - parentElementTop + parentElementScrollTop + 'px';

                context_menu.style.top = menuTop;
                context_menu.style.bottom = '';

                formerContextMenu_Coordinates.bottom = menuBottom;
                formerContextMenu_Coordinates.top = menuTop;
            }

            // If the eTarget is in the contextMenu, create a new context menu using the coordinates of the present one
            if (parentIsContextMenu) {
                context_menu.style.top = formerContextMenu_Coordinates.top;
                context_menu.style.bottom = formerContextMenu_Coordinates.bottom;
                context_menu.style.left = formerContextMenu_Coordinates.left;
                context_menu.style.right = formerContextMenu_Coordinates.right;
                context_menu.style.transform = formerContextMenu_Coordinates.transform
                context_menu.querySelector('details').open = true;
            } else {
                // TOP & BOTTOM
                if((!parentElement.matches('.text_content')) && parentElement.matches('#searchPreviewFixed')){
                    appendBelow();
                }
                else if ((!parentElement.matches('.text_content')) &&
                    /* (parentElementHeight <= context_menu.offsetHeight)|| */
                    (eTargetBottom - parentElementTop + context_menu.offsetHeight > parentElementHeight) &&
                    (spaceAbove > spaceBelow)) {
                    // If there is not enough space below the child element, show the menu above it
                    // If it is in a versnote div, it will always be appended to the bottom of the eTarget
                    // clog('appendAbove')
                    appendAbove()
                } else {
                    // clog('appendBelow')
                    appendBelow()
                }
                // LEFT & RIGHT
                if ((menuLeft + context_menu.offsetWidth > parentElementWidth)) {
                    // If there is not enough space to the right of the child element, show the menu to the left of it
                    // clog('appendRight')
                    appendRight()
                } else {
                    // clog('appendLeft')
                    appendLeft()
                }

                // Ensure Context Menu Is Not Wider than ParentElement
                if ((context_menu.style.right == '0px' && context_menu.getBoundingClientRect().x < 0) || (context_menu.style.left == '0px' && context_menu.offsetWidth > parentElementWidth)) {
                    context_menu.style.width = '100%';
                }
            }
            // Make Context Menu Draggable
            if(parentElement.matches('#searchPreviewFixed') && !isFullyScrolledIntoView(context_menu)){
                setTimeout(()=>{context_menu.scrollIntoView({behavior:"smooth",block:"nearest"})},10)
            }
        }
        context_menu.scrollTop = 0; //scroll contextMenu back to top incase it has been srolled
        if (interactEnabled == false) {
            enableInteractJSonEl('.cmtitlebar', context_menu)
        }
    } else if (context_menu.matches('.slideintoview') && !(e.target.matches('#context_menu') || elmAhasElmOfClassBasAncestor(e.target, '.context_menu'))) {
        function removeContextMenu() {
            hideRightClickContextMenu()
            context_menu.removeAttribute('strnum');
            context_menu.innerHTML = '';
        }
        removeContextMenu();
    }
}

function getCurrentStrongsDef(e) {
    let approvedStrnum=[];
    if (strnum = e.target.getAttribute('strnum')) {
        strnum = strnum.split(' ');
        strnum.forEach(s => {
            if(/^[HGhg]\d+/.test(s)){
                approvedStrnum.push(s)
            }
        });
        strnum=approvedStrnum;
        getsStrongsDefinition(strnum);
    }
    if (e.type == contextMenu_touch) {
        context_menu.classList.add('rightclicked');
        context_menu.removeAttribute('strnum');
        if (strnum) {
            context_menu.setAttribute('strnum', strnum);
        }
        newStrongsDef = currentStrongsDef;
    } else if (e.type != contextMenu_touch) {
        newStrongsDef = '';
    }
}

//Hide RightClickContextMenu
function hideRightClickContextMenu() {
    if (context_menu.matches('.slideintoview')) {
        context_menu.classList.add('displaynone')
        hideRefNav('hide', context_menu);
        //for dragging eventListner to be removed
        interact('.cmtitlebar').unset();
        newStrongsDef = '';
        // context_menu.innerHTML = '';
        context_menu.style.right = null;
        if(!document.querySelector('#versenotepage') && toolTipON==true){toolTipOnOff();}
    }
}

/* MAKING CONTEXT_MENU DRAGGABLE */
// target elements with the "draggable" class
function enableInteractJSonEl(dragTarget, elmAffected) {
    interact(dragTarget).draggable({
        // enable inertial throwing
        inertia: true,
        // keep the element within the area of it's parent
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ],
        // enable autoScroll
        autoScroll: true,

        listeners: {
            // call this function on every dragmove event
            move: dragMoveListener,

            // call this function on every dragend event
            // end (event) {
            //   // var textEl = event.target.querySelector('p')
            //   var xdx = (event.pageX - event.x0).toFixed(2);
            //   var ydy = (event.pageY - event.y0).toFixed(2);
            // }
        }
    })
    /* // To Make Context Menu Resizable
    interact('#context_menu').resizable({
        // resize from all edges and corners
        edges: { left: true, right: true, bottom: true, top: true },
    
        listeners: {
          move (event) {
            var target = event.target
            var x = (parseFloat(target.getAttribute('data-x')) || 0)
            var y = (parseFloat(target.getAttribute('data-y')) || 0)
    
            // update the element's style
            target.style.width = event.rect.width + 'px'
            target.style.height = event.rect.height + 'px'
    
            // translate when resizing from top or left edges
            x += event.deltaRect.left
            y += event.deltaRect.top
    
            target.style.transform = 'translate(' + x + 'px,' + y + 'px)'
    
            target.setAttribute('data-x', x)
            target.setAttribute('data-y', y)
            // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
          }
        },
        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({
            outer: 'parent'
          }),
    
          // minimum size
          interact.modifiers.restrictSize({
            min: { width: 100, height: 50 }
          })
        ],
    
        inertia: true
    }) */
    function dragMoveListener(event) {
        var target = event.target
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy        
        // Always Make ContextMenu translateX Equal ZERO While in #searchPreviewFixed 
        if(elmAhasElmOfClassBasAncestor(elmAffected,'#searchPreviewFixed')){x=0}
        // translate the element
        elmAffected.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

        // update the posiion attributes
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
    }
}