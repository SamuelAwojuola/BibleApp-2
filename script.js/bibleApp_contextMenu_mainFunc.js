// Check if device is a mobile device
let isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
/* RIGHT-CLICK MENU */
let timer1, timer2;
let rightClickedElm = null;
let main;
let newStrongsDef = '';

// Check if it is index page or verseNotes page
if(document.querySelector('body').matches('#versenotepage')){
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

        /* getBoundingClientRect()
            The getBoundingClientRect() method returns
                i.  The size of an element and
                ii. Its position relative to the viewport.
                
                Note: The scrolling that has been done is taken into account. This means that the rectangle's edges (top, left, bottom, and right) change their values every time the scrolling position changes.
                
                It returns a DOMRect object with eight properties: left, top, right, bottom, x, y, width, height.
            */

        /* offset... (offsetLeft/offsetRight/offsetWidth/offsetHeight/offsetParent)
                Definition and Usage:
                    i.  The offsetLeft property returns the left position (in pixels) relative to the parent.
                    ii. The returned value includes:
                        a. the left position, and
                        b. margin of the element
                        c. the left padding,
                        d. scrollbar and
                        e. border of the parent
            */
        function timedFUNC() {
            let originalWord, extraLeft = 0, addquotes = true, eParent;
            eTarget = e.target;

        /* -------------------------------- */
            /* WHERE TO APPEND CONTEXT-MENU */
            /* Append to verseNote */
            if (elmAhasElmOfClassBasAncestor(e.target, '.verse_note')) {
                // clog('1')
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
                if (!eParent.querySelector('#context_menu')) {
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
                // clog(eParent)
                if (!eParent.querySelector('#context_menu')) {
                    let clonedContextMenu = main.querySelector('#context_menu').cloneNode(true);
                    main.querySelector('#context_menu').remove()
                    eParent.append(clonedContextMenu)
                    clonedContextMenu.addEventListener("click", codeELmRefClick)
                }
            }
            
            /* If eTraget is a [Translated Strongs Word] or the [Strongs Number] itself */
            if (e.target.matches('.translated, .strnum')) {
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
                if (strnum = e.target.getAttribute('strnum')) {
                    context_menu.setAttribute('strnum', strnum)
                }else{context_menu.removeAttribute('strnum')}
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
                if (strnum = e.target.getAttribute('strnum')) {
                    context_menu.setAttribute('strnum', strnum)
                }else{context_menu.removeAttribute('strnum')}
                hideRefNav('show', context_menu)
            }

        /* ------------------------------------------ */
            /* POSITION & COORDINATES OF CONTEXT MENU */
            eP = eParent;
            let cmMaxWidth;//-->max width of contextMenu
            if(eParent.offsetWidth<1000){cmMaxWidth = 500}else{cmMaxWidth = 600}
            if(eParent.offsetWidth<=500){cmMaxWidth = eParent.offsetWidth}

            // let target_right = e.target.getBoundingClientRect().right;
            let target_right = eParent.offsetWidth - (eTarget.offsetLeft + eTarget.offsetWidth);
            if(target_right<0){target_right=0}// multiline spans at the edge return a very large width
            // let target_left = e.target.offsetLeft.toFixed();
            let target_left = e.target.getBoundingClientRect().left;
            let target_top = e.target.offsetTop;
            // let target_top = e.target.getBoundingClientRect().top;
            if(document.querySelector('body').matches('#versenotepage')){
                target_left = e.target.offsetLeft;
            }

            // let leftCoord = target_left + window.scrollX - extraLeft;
            let leftCoord;
            if(main.matches('#col2')){leftCoord = eTarget.offsetLeft - extraLeft;}
            else{leftCoord = eTarget.getBoundingClientRect().left - extraLeft;}
            let right4rmLeft = target_right;
            // let right4rmLeft = eParent.offsetWidth - (target_right + eParent.offsetLeft);
            // let right4rmLeft = eParent.offsetWidth - (eTarget.offsetLeft + eTarget.offsetWidth);
            let rightCoord = right4rmLeft - window.scrollX;
            
            // aligns to the left by default
            if(leftCoord<0){leftCoord=0}
            context_menu.style.left = '';
            context_menu.style.right = '';
            let subfunct;
            // ContextMenu fit
            let space2dRight = target_right + eTarget.offsetWidth + extraLeft;
            // Width of parent window smaller than context menu
            if (eParent.offsetWidth <= cmMaxWidth) {
                subfunct = 'parentWidth2SMALL';
                // Not enough space to the right for context menu
                context_menu.style.right = 0;
                context_menu.style.left = 0;
                context_menu.style.minWidth = cmMaxWidth + "px"        
                context_menu.style.width = cmMaxWidth + "px" 
            }
            // Not enough space to the right for context menu
            else if (space2dRight <= cmMaxWidth) {
                subfunct = 'Right2Small';
                if(target_left<cmMaxWidth){
                    context_menu.style.right = e.offsetWidth - (target_right + target_left) + "px";
                } else {
                    context_menu.style.right = target_right + "px";
                }
                context_menu.style.left = '';
            }
            else {
                subfunct = 'Left-2-Right';
                if(main.matches('#col2')){
                    if((leftCoord + cmMaxWidth) > eP.offsetWidth){
                        context_menu.style.left = "";
                        context_menu.style.right = 0;
                    }
                    else {
                        context_menu.style.left = leftCoord + "px";
                        context_menu.style.right = "";
                    }
                }
                else{
                    leftCoord = target_left + window.scrollX - extraLeft;
                    context_menu.style.left = leftCoord + "px";
                    context_menu.style.right = "";
                }       
            }
            // console.table({subfunct, ePWidth:eP.offsetWidth, leftCoord, space2dRight,cmMaxWidth})


            //IF CONTEXT MENU IS TOO CLOSE TO THE BOTTOM
            let target_height = e.target.offsetHeight;
            let btnsBarHeight;
            if(top_horizontal_bar_buttons = document.querySelector('#top_horizontal_bar_buttons')){btnsBarHeight = top_horizontal_bar_buttons.getBoundingClientRect().height;}else{btnsBarHeight=0}
            let space_above_target;
            if(eParent){space_above_target = target_top - eParent.scrollTop;}
            else{space_above_target = target_top - e.target.scrollTop}
            let space_below_target = window.innerHeight - btnsBarHeight - space_above_target;

            // Space Below Target Enough for ContextMenu
            if (space_below_target >= context_menu.offsetHeight) {
                // context_menu.style.height = space_below_target - eParent.offsetTop - target_height + "px";
                context_menu.style.top = target_top + target_height + "px";
            }
            // Space Below Target NOT Enough for ContextMenu
            else {
                if (space_below_target >= space_above_target) {
                    context_menu.style.height = space_below_target - eParent.offsetTop - target_height + "px";
                    context_menu.style.top = target_top + target_height + "px";
                } else {
                    if (space_above_target >= context_menu.offsetHeight) {
                        context_menu.style.top = target_top - context_menu.offsetHeight + "px";
                    } else {
                        context_menu.style.height = space_above_target + "px";
                        context_menu.style.top = target_top - context_menu.offsetHeight + "px";
                    }
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