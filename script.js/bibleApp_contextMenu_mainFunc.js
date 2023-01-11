// Check if device is a mobile device
let formerContextMenu_Coordinates={};
let isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
/* RIGHT-CLICK MENU */
let timer1, timer2;
let rightClickedElm = null;
let main;
let newStrongsDef = '';
let append2BottomOfTarget = 0;

// Check if it is index page or verseNotes page
if(document.querySelector('body').matches('#versenotepage')){
    append2BottomOfTarget = 1;
    main=document.querySelector('#col2')
    // Load KJV bible for scripture tooltip
    var KJV;
    // window.onload = function () {
        var request_KJV_URL = 'bibles/KJV.json';
        var kjvBible = new XMLHttpRequest();
        kjvBible.open('GET', request_KJV_URL);
        kjvBible.responseType = 'json';
        kjvBible.send();
        kjvBible.onload = function () {
            let booksChaptersAndVerses = kjvBible.response;
            KJV = booksChaptersAndVerses['books'];
            // cacheFunctions() //GET TRANSLITERATED ARRAY FROM CACHE
        }
    // }
}else{main=document.querySelector('#main');}

// let context_menu = document.querySelector('#context_menu');
function add_tooltipContextMenu(e) {
    e.preventDefault();
    parentIsContextMenu = 0;

    // clog('CMENU')
    // If there isn't a contextMenu already, create one
    if(!document.querySelector('#context_menu')){
        let context_menu_replacement=document.createElement('div');
        context_menu_replacement.id = 'context_menu';
        context_menu_replacement.classList.add('context_menu');
        context_menu_replacement.classList.add('slideout');
        main.prepend(context_menu_replacement);
        context_menu.addEventListener("click", codeELmRefClick);
    }

    // If the traget is a strong's number
    if(e.target.getAttribute('strnum')&&!e.target.matches('.context_menu')){
        rightClickedElm = e.target;
        firstShadowColorOfElem=getBoxShadowColor(rightClickedElm);
    }
    
    // FOR SHOWING AND HIDING THE RIGHTCLICK MENU
    if (e.target.matches('.translated, .strnum, .crossrefs>span, .verse_note span, .win2_noteholder span')){
        getCurrentStrongsDef(e);
        clearTimeout(timer1);
        clearTimeout(timer2);
        let currentEt=e.target;


        if (e.type == 'mouseover') {
            clearTimeout(timer1);

            if ((!currentEt.matches('.strnum') && context_menu.getAttribute('strnum') != currentEt.getAttribute('strnum'))) {
                timer1 = setTimeout(function () {
                    timedFUNC();
                }, 300)
            } else if (!currentEt.matches('.strnum')) {
                timer1 = setTimeout(function () {
                    timedFUNC();
                }, 300)
            }

        } else {
            timedFUNC()
        }

        function timedFUNC() {
            let originalWord, extraLeft = 0, addquotes = true, eParent;
            eTarget = e.target;

        /* -------------------------------- */
            /* WHERE TO APPEND CONTEXT-MENU */
            /* Append to verseNote */
            if (elmAhasElmOfClassBasAncestor(e.target, '.verse_note')) {
                eParent = elmAhasElmOfClassBasAncestor(e.target, '.verse_note').querySelector('.text_content');
                if (!eParent.querySelector('#context_menu')) {
                    //move the #context_menu from #main to #searchPreviewFixed
                    let clonedContextMenu = main.querySelector('#context_menu').cloneNode(true);
                    main.querySelector('#context_menu').remove()
                    eParent.append(clonedContextMenu)
                    clonedContextMenu.addEventListener("click", codeELmRefClick)
                }
            }
            /* Append to verse */
            else if (elmAhasElmOfClassBasAncestor(e.target, '#main')) {
                eParent = document.querySelector('#main');
                if (eParent.offsetLeft != 0) {
                    extraLeft = eParent.offsetLeft;
                }
                if (!eParent.querySelector('#context_menu')||main.querySelector('.verse_note #context_menu')) {
                    //if the #context_menu is not in #main, then it must be in #searchPreviewFixed
                    //move the #context_menu from #searchPreviewFixed to #main
                    let clonedContextMenu = document.querySelector('#context_menu').cloneNode(true);
                    document.querySelector('#context_menu').remove()
                    main.append(clonedContextMenu)
                }
            }
            /* Append to #searchPreviewFixed */
            else if (elmAhasElmOfClassBasAncestor(e.target, '#searchPreviewFixed')) {
                eParent = document.querySelector('#searchPreviewFixed');
                if (!searchPreviewWindowFixed.querySelector('#context_menu')) {
                    // if the #context_menu is not in #searchPreviewFixed, then it must be in #main 
                    // move the #context_menu from #main to #searchPreviewFixed
                    let clonedContextMenu = main.querySelector('#context_menu').cloneNode(true);
                    main.querySelector('#context_menu').remove()
                    searchPreviewFixed.append(clonedContextMenu)
                }
            }
            /* Append to #win2_noteholder */
            else if (elmAhasElmOfClassBasAncestor(e.target, '.win2_noteholder')) {
                eParent = elmAhasElmOfClassBasAncestor(e.target, '.win2_noteholder');
                if (!eParent.querySelector('#context_menu')) {
                    let clonedContextMenu = main.querySelector('#context_menu').cloneNode(true);
                    main.querySelector('#context_menu').remove()
                    eParent.append(clonedContextMenu)
                    clonedContextMenu.addEventListener("click", codeELmRefClick)
                }
            }
        
        /* If eTraget is a [Translated Strongs Word] or the [Strongs Number] itself */
        if (e.target.matches('.translated, .strnum')) {
            if(elmAhasElmOfClassBasAncestor(e.target, '.context_menu')){parentIsContextMenu=1;}
            // On Mobile Devices
            if (isMobileDevice) {
                // remove windows selection
                window.getSelection().removeRange(window.getSelection().getRangeAt(0))
                // (because on mobile, the user has to press and hold for contextmenu which also selects the text)
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
            if(originalWord){
                let arrOfStrnums=e.target.getAttribute('strnum').split(' ');
                let xlitNlemma='',br='';
                arrOfStrnums.forEach((sn,i) => {
                    br='</code>',st='';
                    if(arrOfStrnums.length>i+1){br=`</code><br><code><div>&#9726;</div> `}// if it is not the last (or only) strnums
                    if(i==0){st=`<code><div>&#9726;</div> `}
                    xlitNlemma=`${st}${xlitNlemma}${sn}/${getsStrongsLemmanNxLit(sn).xlit}/${getsStrongsLemmanNxLit(sn).lemma}${br}`
                });
                if (addquotes) {
                    // menu_inner = `${e.target.getAttribute('data-title')}<br>“${originalWord.trim()}”`;
                    menu_inner = `${xlitNlemma}<hr>“${originalWord.trim()}”`;
                } else {
                    // menu_inner = `${e.target.getAttribute('data-title')}<br>${originalWord.trim()}`;
                    menu_inner = `${xlitNlemma}<hr>${originalWord.trim()}`;
                }
                context_menu.innerHTML = `<div class="cmtitlebar">${menu_inner}</div>${newStrongsDef}`;
            } else if (e.type=='contextmenu'){// For strongs number in verseNote
                context_menu.innerHTML = newStrongsDef;
                // context_menu.querySelector('hr').remove();
                let h2relocate = context_menu.querySelector('h2');
                let h2clone = h2relocate.cloneNode(true);
                h2relocate.remove();
                context_menu.querySelector('.strngsdefinition').prepend(h2clone)
            }
            context_menu.style.height = null;
            context_menu.style.left = null;
            context_menu.style.width = null;
            if (strnum = e.target.getAttribute('strnum')) {
                context_menu.setAttribute('strnum', strnum)
            } else {context_menu.removeAttribute('strnum')}
            hideRefNav('show', context_menu)
        }
        /* If eTarget is a Scripture Reference */
        else {
            context_menu.innerText = null;
            context_menu.classList.add('win2');
            if (e.target.matches('.crossrefs>span, span[ref]')) {
                let cmtitlebar = document.createElement('div');
                cmtitlebar.classList.add('cmtitlebar');
                let cmtitletext;
                if(bkn=e.target.getAttribute('bkn')){
                    cmtitletext = bkn + ' ' + e.target.innerText;
                }
                else{cmtitletext = e.target.innerText;}
                cmtitletext = cmtitletext + ' [' + bversionName + ']';
                // cmtitlebar.innerText=e.target.innerText;
                cmtitlebar.innerText = cmtitletext;
                context_menu.append(cmtitlebar);
            }
            context_menu.append(getCrossReference(e.target));
            context_menu.style.height = null;
            context_menu.style.left = null;
            context_menu.style.width = null;
            if (strnum = e.target.getAttribute('strnum')) {
                context_menu.setAttribute('strnum', strnum)
            }else{context_menu.removeAttribute('strnum')}
            hideRefNav('show', context_menu)
        }

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
            
            function appendLeft(){
                menuRight = '';
                context_menu.style.right = menuRight;
                context_menu.style.left = menuLeft + 'px';
                formerContextMenu_Coordinates.right=menuRight;
                formerContextMenu_Coordinates.left=menuLeft + 'px';
            }
            function appendRight(){
                if (menuRight - context_menu.offsetWidth > parentElementLeft + parentElementScrollLeft){
                    context_menu.style.right = menuRight + 'px';
                    formerContextMenu_Coordinates.right=menuRight + 'px';
                } else {
                    context_menu.style.right = '0px';
                    formerContextMenu_Coordinates.right='0px';
                }
                menuLeft = '';
                context_menu.style.left = menuLeft;
                formerContextMenu_Coordinates.left=menuLeft;
            }
            function appendAbove(){
                
                // else {
                    menuBottom = parentElementHeight - eTarget.offsetTop + 'px';
                    menuTop = '';
                    
                    context_menu.style.top = menuTop;
                    context_menu.style.bottom = menuBottom;
                    
                    formerContextMenu_Coordinates.top=menuTop;
                    formerContextMenu_Coordinates.bottom=menuBottom;
                // }
                //To always appendBelow in verseNotesPage
                if(append2BottomOfTarget){
                    let newHeight = eTarget.offsetTop + parentElement.offsetTop;
                    context_menu.style.maxHeight = col2.getBoundingClientRect().height/2 + 'px';
                    if(context_menu.getBoundingClientRect().height > newHeight){
                        context_menu.style.height = newHeight + 'px';
                    }
                    // appendBelow()
                }
            }
            function appendBelow(){
                menuBottom = '';
                menuTop = eTargetBottom - parentElementTop + parentElementScrollTop + 'px';

                context_menu.style.top = menuTop;
                context_menu.style.bottom = '';

                formerContextMenu_Coordinates.bottom=menuBottom;
                formerContextMenu_Coordinates.top=menuTop;
            }

            // If the eTarget is in the contextMenu, create a new context menu using the coordinates of the present one
            if(parentIsContextMenu){
                // console.log('parent is ContextMenu');
                context_menu.style.top = formerContextMenu_Coordinates.top;
                context_menu.style.bottom = formerContextMenu_Coordinates.bottom;
                context_menu.style.left = formerContextMenu_Coordinates.left;
                context_menu.style.right = formerContextMenu_Coordinates.right;
                context_menu.querySelector('details').open = true;
            } else {
                // console.log('parent is NOT ContextMenu');
                // TOP & BOTTOM
                if ((!parentElement.matches('.text_content')) 
                    && /* (parentElementHeight <= context_menu.offsetHeight)|| */
                    (eTargetBottom - parentElementTop + context_menu.offsetHeight > parentElementHeight)
                    &&
                    (spaceAbove > spaceBelow) ) {
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
                }else{
                    // clog('appendLeft')
                    appendLeft()
                }
                
                // Ensure Context Menu Is Not Wider than ParentElement
                if((context_menu.style.right=='0px' && context_menu.getBoundingClientRect().x<0)||(context_menu.style.left=='0px' && context_menu.offsetWidth>parentElementWidth)){
                    context_menu.style.width = '100%';
                }
            }
        }
        context_menu.scrollTop = 0;//scroll contextMenu back to top incase it has been srolled
    } else if (context_menu.matches('.slidein') && !(e.target.matches('#context_menu') || elmAhasElmOfClassBasAncestor(e.target, '.context_menu'))) {
        function removeContextMenu() {
            hideRefNav('hide', context_menu);
            // hideRefNav('hide', context_menu, removeCMPevtListner());
            context_menu.removeAttribute('strnum');
            context_menu.innerHTML = '';
        }
        removeContextMenu();
    }
}

function getCurrentStrongsDef(e) {
    if (strnum = e.target.getAttribute('strnum')) {
        strnum = strnum.split(' ');
        getsStrongsDefinition(strnum);
    }
    if (e.type == 'contextmenu') {
        context_menu.classList.add('rightclicked');
        context_menu.removeAttribute('strnum');
        if(strnum){context_menu.setAttribute('strnum', strnum);}
        newStrongsDef = currentStrongsDef;
        if(!document.querySelector('body').matches('#versenotepage')){
            toolTipOnOff(false);
        }
    } else if (e.type != 'contextmenu') {
        newStrongsDef = '';
    }
}