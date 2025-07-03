let formerContextMenu_Coordinates = {};
/* RIGHT-CLICK MENU */
let timer1, timer2;
let rightClickedElm = null;
let newStrongsDef = '';
let append2BottomOfTarget = 0;
let cmenu_backwards_navigation_arr=[];
let prev_contextmenu;
let cmenuVerseTiling = false;
addEventlistenersToContextMenu();
document.addEventListener('click', (e)=>{toggleH1to6siblings(e,null,'.crossrefs,h1,h2,h3,h4,h5,h6')});
document.addEventListener('contextmenu', (e)=>{toggleH1to6siblings(e,null,'.crossrefs,h1,h2,h3,h4,h5,h6')});
document.addEventListener('keydown', (e)=>{toggleH1to6siblings(e,null,'.crossrefs,h1,h2,h3,h4,h5,h6')});
function addEventlistenersToContextMenu() {
    createNewContextMenu();//only creates contextMenu when there is none
    context_menu.removeEventListener("mouseup", codeElmRefClick);
    context_menu.addEventListener("mouseup", codeElmRefClick);
}
localStorage['showingXref']=='true'?toggleCMenuTSK():null;
function createNewContextMenu(){
    // If for whatever reason there is more than one cmenu, remove all of them
    if ((allCM = document.querySelectorAll('#context_menu')) && allCM.length > 1) {
        allCM.forEach((cmenu,i) => {cmenu.remove()});
    }
    // If there isn't a contextMenu already, create one
    if (!document.querySelector('#context_menu')) {
        let context_menu_replacement = document.createElement('div');
        context_menu_replacement.id = 'context_menu';
        context_menu_replacement.classList.add('context_menu');
        context_menu_replacement.classList.add('slideoutofview');
        cmenuVerseTiling?context_menu_replacement.classList.add('versestiled'):null;
        context_menu_replacement.contentEditable = false;
        context_menu_replacement.tabIndex = 1;
        main.prepend(context_menu_replacement);
        localStorage['showingXref']=='true'?toggleCMenuTSK():null;
    }
}
// Check if it is index page or verseNotes page
if(document.querySelector('body').matches('#versenotepage')){append2BottomOfTarget=1;}
else{main = document.querySelector('#main');}
enableInteractJSonEl('.cmtitlebar', context_menu);
enableInteractJSonEl('.bottombar', context_menu);
let generatingContextMenu=false;
async function add_tooltipContextMenu(e,fill_screen) {
    e.preventDefault();
    if (e.target.closest('.ignorecmenu')) {return}
    parentIsContextMenu = 0;
    // indicate right-clicked [ref] to go back to it for quick tabbing
    if(e.target.closest('#context_menu .crossrefs')){
        if(lsf=context_menu.querySelector('.lastSelectedRef')){lsf.classList.remove('lastSelectedRef')}
        e.target.classList.add('lastSelectedRef')
    }
    createNewContextMenu();
    let prv_indx='',currentContextMenu_style,cmenu_cmt_dX, cmenu_cmt_dY, cmenu_dX,cmenu_dY, prv_cmenuIndx=false, prv_title='',cmenu_tsk_display='displaynone',dzabled='disabled';
    formerContextMenu_Coordinates.transform = context_menu.style.transform;
    let oldcMenuHeight = null,initialParentScrollHeight;
    prev_contextmenu=context_menu.cloneNode(true);
    if(prvBtnIndx=context_menu.querySelector('.cmtitlebar .prv')){
        if(prvBtnIndx.hasAttribute('indx')){
            prv_cmenuIndx=parseInt(prvBtnIndx.getAttribute('indx'));
        }
    }
    let interactEnabled = context_menu.matches('.slideintoview');
    
    // If the traget is a strong's number
    if (e.target.getAttribute('strnum') && !e.target.matches('.context_menu')) {
        rightClickedElm = e.target;
        firstShadowColorOfElem = getBoxShadowColor(rightClickedElm);
    }
    
    // FOR SHOWING AND HIDING THE RIGHTCLICK MENU
    if (!e.target.matches('.verse') && e.target.matches('.translated, span[ref], .strnum, .crossrefs>span:not(.notref), .verse_note span, .win2_noteholder span, #versenote_totheright, #versenote_totheright span')) {
        e.target.scrollIntoView({behavior:'smooth', block:'nearest'});
        setTimeout(async () => {//let etarget scroll into view before running the rest of the function.
            await getCurrentStrongsDef(e);
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
                    if (ep = e.target.closest('.verse_note,#main,#searchPreviewFixed,#scriptureCompareWindow,#versenote_totheright,.win2_noteholder')) {
                        eParent = ep.matches('.verse_note') ? ep.querySelector('.text_content') : ep;
                        initialParentScrollHeight = eParent.scrollHeight;
                        initialParentScrollWidth = eParent.scrollWidth;
                        if (eParent.offsetLeft != 0) {extraLeft = eParent.offsetLeft;}
                        innerFunc_get_eParent();//ensure cmenu is positioned in eParent
                    }
                    function innerFunc_get_eParent(){                        
                        if (ancestorWithPositionRelative(context_menu)!=eParent || !eParent.querySelector('#context_menu')) {
                            let clonedContextMenu = pagemaster.querySelector('#context_menu').cloneNode(true);
                            pagemaster.querySelector('#context_menu').remove();
                            eParent.append(clonedContextMenu);
                            clonedContextMenu.addEventListener("mouseup", codeElmRefClick);
                            return clonedContextMenu
                        }
                    }
                }
                // const eTargetOffset = getClickedClientRect(eTarget, e);
                get_eParent();
                
                /* ********************************** */
                /* ** WHERE TO APPEND CONTEXT-MENU ** */
                /* ********************************** */
                ifForStrongsNumberORforCrossRef();
                function ifForStrongsNumberORforCrossRef() {
                    /* ||||||||||||||||||||||||||||||||||||||||||||||| */
                    /* || FOR WHEN IT IS CALLED FROM A CONTEXT-MENU || */
                    /* ||||||||||||||||||||||||||||||||||||||||||||||| */
                    if (e.target.closest('.context_menu')) {
                        parentIsContextMenu = 1;
                        oldcMenuHeight=context_menu.getBoundingClientRect().height;
                        
                        /* Store the old cmenu to go back to it */
                        currentContextMenu_style = context_menu.getAttribute('style');
                        cmenu_cmt_dX = context_menu.querySelector('.cmtitlebar').getAttribute('data-x');
                        cmenu_cmt_dY = context_menu.querySelector('.cmtitlebar').getAttribute('data-y');
                        cmenu_dX = context_menu.getAttribute('data-x');
                        cmenu_dY = context_menu.getAttribute('data-y');
                        if(typeof prv_cmenuIndx === 'number'){
                            /* For contextMenu whose parent was contextMenu: In case it is one that is called from the array and there are other saved cmenus in the array */
                            // cmenu_backwards_navigation_arr.splice(prv_cmenuIndx+1,0,prev_contextmenu);
                            cmenu_backwards_navigation_arr.splice(prv_cmenuIndx + 1, 0, {
                                menu: prev_contextmenu,
                                scrollTop: context_menu.scrollTop
                            });
                            cmenu_backwards_navigation_arr.length=prv_cmenuIndx+2;
                            prv_indx=`indx="${prv_cmenuIndx+1}"`;
                            dzabled='';
                        }
                        else {
                            // cmenu_backwards_navigation_arr.push(prev_contextmenu);
                            cmenu_backwards_navigation_arr.push({
                                menu: prev_contextmenu,
                                scrollTop: context_menu.scrollTop
                            });
                            prv_indx=`indx="${cmenu_backwards_navigation_arr.length-1}"`;
                            dzabled='';
                            let codeChildren = context_menu.querySelector('.cmtitlebar, .cmtitlebar code').childNodes;
                            for(let i=0;i<codeChildren.length;i++){
                                let codetxt=codeChildren[i];
                                if(codetxt.nodeType==3){
                                    prv_title=`title="${codetxt.wholeText}"`;
                                    break
                                }    
                            }
                        }
                    }
                    else {cmenu_backwards_navigation_arr=[]}
                    //if disabled, will show .crfnnote_btns once it was displayed in any .context_menu until it is hidden again
                    // else {context_menu.classList.remove('showingXref')}
                    /* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */
                    /* || If eTarget is a [Translated Strongs Word] or the [Strongs Number] itself || */
                    /* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */
                    if (e.target.matches('.translated, .strnum, [strnum]')) {
                        // On Mobile Devices
                        if (isMobileDevice && contextMenu_touch!="touchstart") {
                            // remove windows selection
                            // (because on mobile, the user has to press and hold for contextmenu which also selects the text)
                            window.getSelection().removeRange(window.getSelection().getRangeAt(0))
                        }
                        if (e.target.getAttribute("translation")) {
                            originalWord = e.target.getAttribute("translation");
                            if (truexlit = e.target.getAttribute("data-true-xlit")) {
                                if (elmAhasElmOfClassBasAncestor(e.target, '.rtl')) {
                                    originalWord = `“${originalWord.trim()} : ”${truexlit}`;
                                } //because of the direction of the text
                                else {
                                    originalWord = `“${originalWord.trim()}” : ${truexlit}`;
                                }
                                addquotes = false;
                            }
                        } else {
                            originalWord = e.target.parentElement.getAttribute("translation");
                        }
                        let menu_inner;
                        let arrOfStrnums = e.target.getAttribute('strnum').split(' ');
                        let searchicon = document.body.matches('.darkmode') ? 'search-svgrepo-com(2)-DarkMode.svg' : 'search-svgrepo-com(2).svg';
                        let copyicon = document.body.matches('.darkmode') ? 'copy-svgrepo-com-DarkMode.svg' : 'copy-svgrepo-com.svg';
                        if (originalWord) {
                            let xlitNlemma = '',
                            br = '';
                            for (let i = 0; i < arrOfStrnums.length; i++) {
                                br = '', st = '';
                                if(i==arrOfStrnums.length-1){br = '<br>'}
                                let sn = arrOfStrnums[i];
                                if(!/[GHgh]\d+/.test(sn)){continue}
                                let srchBtn = `<button class="cmenusrchbtn" onmouseup="searchInputsValueChange(event,'${sn}')"><img src="images/${searchicon}" alt="&#128270;"></button><button class="cmenucopyhbtn" onmouseup="api.copyTextSelection('(${getsStrongsLemmanNxLit(sn).lemma}, ${getsStrongsLemmanNxLit(sn).xlit}, ${sn})')"><img src="images/${copyicon}" alt="c"></button>`;                                
                                xlitNlemma = `${xlitNlemma}${br}<code>${srchBtn}${sn} (${getsStrongsLemmanNxLit(sn).lemma}, ${getsStrongsLemmanNxLit(sn).xlit})</code>`
                            }
                            menu_inner = `${xlitNlemma}<hr>${addquotes?'“':''}${originalWord.trim()}${addquotes?'”':''}`;
                            // menu_inner = `<div class="refholder">${menu_inner}</div>`;

                            context_menu.innerHTML = `<div class="cmtitlebar">${menu_inner}<div class="cmenu_navnclose_btns"><button class="cmenu_tsk ${cmenu_tsk_display}" onclick="toggleCMenuTSK(this)">TSK</button><button class="prv" ${prv_indx} ${prv_title} onclick="cmenu_goBackFront(this)" ${dzabled}></button><button class="nxt" onclick="cmenu_goBackFront(this)" disabled></button><button class="fillscreen_btn" title="[1]" onclick="context_menu.classList.toggle('fillscreen')"></button><button class="closebtn cmenu_closebtn" onclick="hideRightClickContextMenu()" title="[Escape]"></button></div></div>${newStrongsDef}`;
                        } else if (e.type == contextMenu_touch) { // For strongs number in verseNote
                            let srchBtn = `<code><button class="cmenusrchbtn" onmouseup="searchInputsValueChange(event,'${arrOfStrnums}')"><img src="images/${searchicon}" alt="&#128270;"></button><button class="cmenucopyhbtn" onmouseup="api.copyTextSelection('(${getsStrongsLemmanNxLit(arrOfStrnums).lemma}, ${getsStrongsLemmanNxLit(arrOfStrnums).xlit}, ${arrOfStrnums})')"><img src="images/${copyicon}" alt="c"></button>${arrOfStrnums} (${getsStrongsLemmanNxLit(arrOfStrnums).lemma}, ${getsStrongsLemmanNxLit(arrOfStrnums).xlit})</code>`;
                            // srchBtn = `<div class="refholder">${srchBtn}</div>`;
                            context_menu.innerHTML = `<div class="cmtitlebar">${srchBtn}<div class="cmenu_navnclose_btns"><button class="cmenu_tsk ${cmenu_tsk_display}" onclick="toggleCMenuTSK(this)">TSK</button><button class="prv" ${prv_indx} ${prv_title} onclick="cmenu_goBackFront(this)" ${dzabled}></button><button class="nxt" onclick="cmenu_goBackFront(this)" disabled></button><button class="fillscreen_btn" title="[1]" onclick="context_menu.classList.toggle('fillscreen')"></button><button class="closebtn cmenu_closebtn" onclick="hideRightClickContextMenu()" title="[Escape]"></button></div></div>${newStrongsDef}</div>`;
                        }
                        if (strnum = e.target.getAttribute('strnum')) {
                            context_menu.setAttribute('strnum', strnum);
                            context_menu.innerHTML += `<div class="bottombar" style="width: 100%;"><div class="cmenu_navnclose_btns"><button class="cmenu_tsk ${cmenu_tsk_display}" onclick="toggleCMenuTSK(this)">TSK</button><button class="prv" ${prv_indx} ${prv_title} onclick="cmenu_goBackFront(this)" ${dzabled}></button><button class="nxt" onclick="cmenu_goBackFront(this)" disabled></button><button class="middle_cmenu" onclick="document.body.classList.toggle('middleContextMenu')"
                            title="[/]"></button><button class="fillscreen_btn" title="[1]" onclick="context_menu.classList.toggle('fillscreen')"></button><button class="closebtn cmenu_closebtn" onclick="hideRightClickContextMenu()" title="[Escape]" title="[Escape]"></button></div>`
    
                        }
                        else {context_menu.removeAttribute('strnum');}
                        typeof context_menu!="undefined"?setTimeout(()=>{hideRefNav('show',context_menu)},1):null;
                    }
                
                    /* ||||||||||||||||||||||||||||||||||||||||| */
                    /* || If eTarget is a Scripture Reference || */
                    /* ||||||||||||||||||||||||||||||||||||||||| */
                    else {
                        // if (crossRefinScriptureTooltip_check.checked) {
                            cmenu_tsk_display="";
                        // }
                        context_menu.innerText = null;
                        context_menu.classList.add('win2');
                        if (e.target.matches('.crossrefs>span,span[ref]')) {
                            let cmtitlebar = document.createElement('div');
                            cmtitlebar.classList.add('cmtitlebar');
                            let cmtitletext;
                            if (bkn = e.target.getAttribute('bkn')) {
                                cmtitletext = bkn + ' ' + e.target.innerText;
                            } else {
                                cmtitletext = e.target.hasAttribute('ref') ? e.target.getAttribute('ref') : e.target.innerText;
                            }
                            cmtitletext = `<div class="refholder">${breakDownRef(cmtitletext).standardizedfullref} [${bversionName}]</div>`;
                            // cmtitlebar.innerText=e.target.innerText;
                            cmtitlebar.innerHTML = cmtitletext + `<div class="cmenu_navnclose_btns"><button class="" onclick="tileVerses(this)" title="Tile Verses"></button><button class="prv_verse" onclick="cmenuprvNxtverse(event, 'prev')"></button><button class="nxt_verse" onclick="cmenuprvNxtverse(event, 'next')"></button><button class="cmenu_tsk ${cmenu_tsk_display}" onclick="toggleCMenuTSK(this)">TSK</button><button class="prv" ${prv_indx} ${prv_title} onclick="cmenu_goBackFront(this)" ${dzabled}></button><button class="nxt" onclick="cmenu_goBackFront(this)" disabled></button><button class="fillscreen_btn" title="[1]" onclick="context_menu.classList.toggle('fillscreen')"></button><button class="closebtn cmenu_closebtn" onclick="hideRightClickContextMenu()" title="[Escape]"></button></div></div>`;
                            context_menu.append(cmtitlebar);
                        }
                        let vHolder = getCrossReference(e.target);
                        /* FOR CROSS-REFS & NOTES IN SEARCH WINDOW */
                        // if(crossRefinScriptureTooltip_check.checked){
                            vHolder.querySelectorAll('span.verse').forEach(spanVerse=>{
                                const [bN, bC, cV] = spanVerse.querySelector('[ref]').getAttribute('ref').split(/[(?<=\s)(?<=:)](?=\d)/);
                                checkAndIndicateThatVerseHasNote(bN, bC, cV, spanVerse);// Check if Verse Has Note;
                                let tskHolder=crfnnote_DIV(spanVerse);
                                context_menu.matches('.showingXref')?null:tskHolder.classList.add('displaynone');
                                spanVerse.append(tskHolder);
                            });
                        // }
                        context_menu.append(vHolder);                        
                        // context_menu.append(getCrossReference(e.target));
                        
                        if (strnum = e.target.getAttribute('strnum')) {
                            context_menu.setAttribute('strnum', strnum);
                        } else {
                            context_menu.removeAttribute('strnum');
                            context_menu.innerHTML += `<div class="bottombar" style="width: 100%;"><div class="cmenu_navnclose_btns"><button class="" onclick="tileVerses(this)" title="Tile Verses"></button><button class="prv_verse" onclick="cmenuprvNxtverse(event, 'prev')"></button><button class="nxt_verse" onclick="cmenuprvNxtverse(event, 'next')"></button><button class="cmenu_tsk ${cmenu_tsk_display}" onclick="toggleCMenuTSK(this)">TSK</button><button class="prv" ${prv_indx} ${prv_title} onclick="cmenu_goBackFront(this)" ${dzabled}></button><button class="nxt" onclick="cmenu_goBackFront(this)" disabled></button><button class="middle_cmenu" onclick="document.body.classList.toggle('middleContextMenu')" title="[/]"></button><button class="fillscreen_btn" title="[1]" onclick="context_menu.classList.toggle('fillscreen')"></button><button class="closebtn cmenu_closebtn" onclick="hideRightClickContextMenu()" title="[Escape]"></button></div></div></div>`;
                        }
                        typeof context_menu!="undefined"?setTimeout(()=>{hideRefNav('show',context_menu)},1):null;
                        transliterateAllStoredWords();
                    }
                }
                if (parentIsContextMenu) {return}
                context_menu.style.transform = 'translate(0,0)';
                /* ------------------------------------------ */
                /* POSITION & COORDINATES OF CONTEXT MENU
                    // Take note that //context_menu has already been appended to its eParent
                    // We only now esure it is properly positioned
                */
                parentElement = eParent;
                eTarget = e.target;
                eTarget_bcRect = eTarget.getBoundingClientRect();//BoundingClientRect of eTarget
                parentElementRect = parentElement.getBoundingClientRect();//BoundingClientRect of parentElement
                parentElementScrollTop = parentElement.scrollTop;
                parentElementScrollLeft = parentElement.scrollLeft;
                let contextMenuRect = context_menu.getBoundingClientRect();
    
                // Calculate the position of the menu
                const ancestorPadding = paddingDistanceOfChildToAncestor(eTarget,parentElement,['ol','ul']);
                const ancestorPadding_left = parseFloat(ancestorPadding.left);
                const ancestorPadding_top = parseFloat(ancestorPadding.top);
                const eTargetOffset = getClickedClientRect(eTarget, e);//moved before get_eParent()
                // menuTop = eTargetOffset.top + eTargetOffset.height;
                menuTop = eTargetOffset.rect.top - parentElementRect.top + eTargetOffset.rect.height + parentElementScrollTop;
                menuBottom = 'auto';
                menuLeft = eTargetOffset.rect.left - parentElementRect.left + parentElementScrollLeft;
                menuRight = 'auto';
                const computedWidth = parseFloat(window.getComputedStyle(parentElement).width);
                const computedHeight = parseFloat(window.getComputedStyle(parentElement).height);
                // Chose the greater of the two. Why consider the computedHeight/Width?
                initialParentScrollWidth = initialParentScrollWidth > computedWidth ? initialParentScrollWidth : computedWidth;
                initialParentScrollHeight = initialParentScrollHeight > computedHeight ? initialParentScrollHeight : computedHeight;
    
                /* HORIZONTAL POSITIONING */
                if((menuLeft + contextMenuRect.width) > initialParentScrollWidth){//if cmenu's right exceeds parent's right
                    if ((contextMenuRect.left - eTargetOffset.rect.width - contextMenuRect.width) < (parentElementRect.left + ancestorPadding_left)) {//check if cmenu can fit to the right of eTarget (with right sides aligned)
                        menuLeft = menuLeft + eTargetOffset.rect.width - contextMenuRect.width;//match right sides of eTarget and context_menu
                    } else {//align cmenu right to parentElement right
                        menuLeft = menuLeft - ((menuLeft + contextMenuRect.width) - initialParentScrollWidth) - ancestorPadding_left; //adjust it so that its right side is inside the parentElement
                    }
                }
                //if cmenu's left exceeds parent's left
                if(menuLeft < 0){menuLeft = ancestorPadding_left;}
                // Ensure Context Menu Is Not Wider than ParentElement
                if ((parentElement.offsetWidth - (ancestorPadding_left*2)) < context_menu.offsetWidth) {
                    context_menu.style.width = parentElementRect.width - (ancestorPadding_left*2) + 'px';
                };
                
                /* VERTICAL POSITIONING */
                //if cmenu's bottom exceeds parent's bottom                   
                if((menuTop + contextMenuRect.height) > initialParentScrollHeight){
                    const new_cmenuTop = menuTop - eTargetOffset.rect.height - contextMenuRect.height;
                    //check if cmenu can fit to the top of eTarget (with bottom of cmenu aligned to eTarget top)
                    if(new_cmenuTop < 0){
                        //difference between cmenu bottom and parentElement bottom
                        const bottom_diff = (eTargetOffset.rect.top + eTargetOffset.rect.height + contextMenuRect.height) - (parentElementRect.top + initialParentScrollHeight);
                        menuTop = menuTop - bottom_diff;
                        // Try to scroll eTarget into view so that cmenu does not cover it
                        const e2scroll = closestScrollableAncestors(eTarget,parentElement).y;
                        e2scroll ? setTimeout(() => {e2scroll.scrollBy({ top:bottom_diff, behavior:'smooth'})}, 500) : null;
                    }
                    else {menuTop = new_cmenuTop;}//match cmenu bottom to eTarget top
                }
                if(menuTop < 0){menuTop = ancestorPadding_top;}//if cmenu's top exceeds parent's top

                [menuTop,menuLeft] = [menuTop,menuLeft].map(mp=>{return parseFloat(mp) + 'px'});// Ensure menu coordinates are not empty strings
                context_menu.style.left = menuLeft;
                context_menu.style.right = menuRight;
                context_menu.style.top = menuTop;
                context_menu.style.bottom = menuBottom;
            }
            if (e.ctrlKey||e.shiftKey||e.button==1||fill_screen) {
                e.preventDefault();
                context_menu.classList.add('fillscreen');
            }
            context_menu.scrollTop = 0;//scroll contextMenu back to top incase it has been scrolled
            // if (interactEnabled == false) {
                enableInteractJSonEl('.cmtitlebar', context_menu);
                enableInteractJSonEl('.bottombar', context_menu);
            // }
            context_menu.addEventListener('mouseover', add_cMenuNavigationByKeys);
            context_menu.addEventListener('mouseout', remove_cMenuNavigationByKeys);
            addEventlistenersToContextMenu();
            
            oldcMenuHeight?cmenuChangeOfHeightAnimation(oldcMenuHeight):null;
            setTimeout(() => {context_menu.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })},205);// Ensure context menu is fully visible
            // document.activeClickedElement = context_menu;
        }, 100);
    }
}
document.addEventListener('mouseover', function(e) {
    if(!e.target.closest('.context_menu')){
        remove_cMenuNavigationByKeys();
        return
    }
});
function cmenuprvNxtverse(e, prvNxt) {
    let oldcMenuHeight = context_menu.getBoundingClientRect().height;
    cmenu_goToPrevOrNextVerse(prvNxt,undefined,e.shiftKey);
    cmenuChangeOfHeightAnimation(oldcMenuHeight);
}
function cmenuChangeOfHeightAnimation(oldcMenuHeight) {
    let newcMenuHeight = context_menu.getBoundingClientRect().height;
    context_menu.style.height = `${oldcMenuHeight}px`;
    document.body.style.pointerEvents='none';//if this is not reversed in setTimeout below, the window will seem to have hanged because there will be no pointer-events possible
    
    // TO BE FIXED: For some reason when the contextMenu top part is off screen, the window hangs and the setTimeout function below does not run
    // I think I have fixed it. Separated the nested setTimeout functions so that any issue with any of them will not stop the pointer-events from being re-enabled
    setTimeout(() => {
        context_menu ? null : (context_menu = document.querySelector('#context_menu'));//context_menu was sometime removed from dom before this point and this made the function not run
        context_menu ? context_menu.style.height=`${newcMenuHeight}px` : null;
    }, 100);
    // setTimeout(() => { bottombar.style.position = ''; }, 370);
    setTimeout(() => {
        context_menu ? null : (context_menu = document.querySelector('#context_menu'));//context_menu was sometime removed from dom before this point and this made the function not run
        context_menu ? context_menu.style.height = '' : null;
    }, 600);
    setTimeout(() => {document.body.style.pointerEvents='';}, 630);
}
async function getCurrentStrongsDef(e) {
    let approvedStrnum=[];
    if (strnum = e.target.getAttribute('strnum')) {
        strnum = strnum.split(' ');
        strnum.forEach(s => {
            if(/^[HGhg]\d+/.test(s)){
                approvedStrnum.push(s)
            }
        });
        strnum=approvedStrnum;
        await getsStrongsDefinition(strnum);
    }
    if (e.type == contextMenu_touch || e.button == 1) {
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

/* C-Menu History Navigation */
function cmenu_goBackFront(x){
    let indx = parseInt(x.getAttribute('indx'));
    let calledByPrv = x.classList.contains('prv');
    let calledByNxt = x.classList.contains('nxt');
    let prvTitle;
    /* GET PRESENT TRANSFORM */
    let cmenu_cmt_dX = context_menu.querySelector('.cmtitlebar').getAttribute('data-x');
    let cmenu_cmt_dY = context_menu.querySelector('.cmtitlebar').getAttribute('data-y');
    let fillScreen = context_menu.classList.contains('fillscreen');
    let cmenu_dX = context_menu.getAttribute('data-x');
    let cmenu_dY = context_menu.getAttribute('data-y');
    let oldcMenuHeight = context_menu.getBoundingClientRect().height;//For change of height animation
    let currentContextMenu_style = context_menu.getAttribute('style');
    /* Replace the context menu with the saved one */
    let cMenuParent = context_menu.parentNode;
    let prev_contextmenu=context_menu;

    if (calledByPrv) {
        // Modify the current cmenu and save it in its position in the cmenu_backwards_navigation_arr
        cmenu_backwards_navigation_arr.splice(indx+1 , 1, {
            menu: prev_contextmenu,
            scrollTop: context_menu.scrollTop
        });
        prvTitle=prev_contextmenu.querySelector('.cmtitlebar button.prv').getAttribute('title')
    }
    else if (calledByNxt) {
        // Modify the current cmenu and save it in its position in the cmenu_backwards_navigation_arr
        cmenu_backwards_navigation_arr.splice(indx-1 , 1, {
            menu: prev_contextmenu,
            scrollTop: context_menu.scrollTop
        });
    }
    const prvScrollPosition = cmenu_backwards_navigation_arr[indx].scrollTop;
    cMenuParent.replaceChild(cmenu_backwards_navigation_arr[indx].menu, context_menu);
    context_menu.scrollTop = prvScrollPosition;
    context_menu.setAttribute('style',currentContextMenu_style);
    context_menu.querySelector('.cmtitlebar').setAttribute('data-x',cmenu_cmt_dX);
    context_menu.querySelector('.cmtitlebar').setAttribute('data-y',cmenu_cmt_dY);
    context_menu.querySelector('.bottombar').setAttribute('data-x',cmenu_cmt_dX);
    context_menu.querySelector('.bottombar').setAttribute('data-y',cmenu_cmt_dY);
    context_menu.setAttribute('data-x',cmenu_dX);
    context_menu.setAttribute('data-y',cmenu_dY);
    enableInteractJSonEl('.cmtitlebar', context_menu);
    enableInteractJSonEl('.bottombar', context_menu);
    
    fillScreen ? context_menu.classList.add('fillscreen') : context_menu.classList.remove('fillscreen');//for fillscreen class
    
    if(calledByPrv){
        let nxtBtnZ=context_menu.querySelectorAll('.nxt');
        nxtBtnZ.forEach(nxtBtn => {
            nxtBtn.setAttribute('indx',indx+1);
            nxtBtn.setAttribute('title',prvTitle);
            nxtBtn.removeAttribute('disabled');    
        });
    }
    /* For Height Change Animation */
    cmenuChangeOfHeightAnimation(oldcMenuHeight);
    addEventlistenersToContextMenu();
    if(lsf=context_menu.querySelector('.lastSelectedRef')){lsf.focus()}
}

//Hide RightClickContextMenu
function hideRightClickContextMenu() {
    if (context_menu.matches('.slideintoview')) {
        context_menu.classList.add('displaynone');
        hideRefNav('hide', context_menu);
        //for dragging eventListner to be removed
        // interact('.cmtitlebar').unset();
        newStrongsDef = '';
        // context_menu.innerHTML = '';
        context_menu.style.right = 'auto';
        if(!document.querySelector('#versenotepage') && toolTipON==true){toolTipOnOff();}
    }
}

/* To Toggle TSK in CMenu When Present */
function toggleCMenuTSK(){
    const allXrefShowing_inCMenu = context_menu.classList.toggle('showingXref');
    context_menu.querySelectorAll('.crfnnote').forEach(crfn=>{
        allXrefShowing_inCMenu ? crfn.classList.remove('displaynone') : crfn.classList.add('displaynone');
    });
    localStorage['showingXref']=allXrefShowing_inCMenu;
}
let mouseOverCMenu;
function add_cMenuNavigationByKeys(e) {    
    if(keydownready=document.querySelector('.keydownready')){keydownready.classList.remove('keydownready');}
    mouseOverCMenu = true;
    context_menu.classList.add('keydownready');
    document.addEventListener('keydown', cMenuNavigationByKeys);
}
function remove_cMenuNavigationByKeys(e) {
    mouseOverCMenu = false;
    if(!e || !e.target.closest('.context_menu')){return}
    context_menu.classList.remove('keydownready');
    document.removeEventListener('keydown', cMenuNavigationByKeys);
}
function cMenuNavigationByKeys(e) {
    let cmenu_navnclose_btns = (typeof context_menu!='undefined' && !context_menu.matches('.displaynone')) ? context_menu.querySelector('.cmenu_navnclose_btns') : null;
    
    if (!cmenu_navnclose_btns || document.activeElement.closest('input, [contenteditable="true"] /*, #context_menu*/, .cke_dialog_body') || document.body.classList.contains('cke_dialog_open')) {return}
    
    let key_code = e.key || e.keyCode || e.which;
    switch (key_code) {
        case 'ArrowLeft'||37: //left arrow key
            const previous = cmenu_navnclose_btns.querySelector('.prv');
            if(!previous.disabled){
                cmenu_goBackFront(previous);
                e.preventDefault();
            }
            break;
        case 'ArrowRight'||39: //right arrow key
            const next = cmenu_navnclose_btns.querySelector('.nxt');
            if(!next.disabled){
                cmenu_goBackFront(next);
                e.preventDefault();
            }
            break;
        case (e.altKey && ('ArrowUp'||38)) || (!e.ctrlKey && '-'): //Up arrow key
            if(cmenu_navnclose_btns.querySelector('.prv_verse')){
                cmenu_goToPrevOrNextVerse('prev',[context_menu.querySelector('.verse')],e.shiftKey);
                e.preventDefault();
            }
            break;
        case (e.altKey && ('ArrowDown'||40)) || (!e.ctrlKey && '+'): //down arrow key
            if(cmenu_navnclose_btns.querySelector('.nxt_verse')){
                const cv = context_menu.querySelectorAll('.verse:not(.verse_compare)');
                cmenu_goToPrevOrNextVerse('next',[cv[cv.length-1]],e.shiftKey, true);
                e.preventDefault();
            }
            break;
        case 'x'||88: //x key
            // For opening xRef that is not in context_menu, see (function) appendXref_with_keyX(e)
            if(cmenu_tsk = cmenu_navnclose_btns.querySelector('.cmenu_tsk')){
                toggleCMenuTSK(cmenu_tsk);
                e.preventDefault();
            }
            break;
    }
}
/* For ContextMenu on Enter or SpaceBar on selected Ref within contextMenu */
document.addEventListener('keydown',function(e){
    if (['Enter', ' '].includes(e.key) && e.target.matches('.crossrefs [tabindex]')) {        
        e.preventDefault();
        e.target.addEventListener('keyup', cmenuOnEnterOfxRef);
    }
    function cmenuOnEnterOfxRef(evt) {
        if (['Enter', ' '].includes(e.key)){
            evt.preventDefault();
            add_tooltipContextMenu(evt);
        }
    }
});
document.addEventListener('mouseup',function(e){if (e.button == 1) {add_tooltipContextMenu(e); document.body.classList.add('middleContextMenu')}});
(function setupMouseComboListener() {
  let state = {
    leftDown: false,
    rightDown: false
  };

  function onMouseDown(e) {
    if (e.button === 0) state.leftDown = true;
    if (e.button === 2) state.rightDown = true;
  }

  function onMouseUp(e) {
    if (e.button === 2) {
        if (state.leftDown && state.rightDown) {
            if(!e.target.closest('.context_menu')){
                add_tooltipContextMenu(e,true);
            }
            else if(e.target.closest('.context_menu:not(.fillscreen)')){
                context_menu.classList.add('fillscreen');
            }
      }
      state.rightDown = false;
    }

    if (e.button === 0) {
      state.leftDown = false;
    }
  }
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('contextmenu', e => e.preventDefault()); // optional
})();

/* MAKING CONTEXT_MENU DRAGGABLE */
// target elements with the "draggable" class
function enableInteractJSonEl(dragTarget, elmAffected) {
    let dt=typeof dragTarget=='string' ? elmAffected.querySelector(dragTarget):dragTarget;
    dt?(dt.style.touchAction = 'none'):null;//to enable dragging by touch
    interact(dragTarget)
        .draggable({
            inertia: true,// enable inertial throwing
            autoScroll: true,// enable autoScroll
            // keep the element within the area of it's parent
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            listeners: {
                // call this function on every dragmove event
                move: dragMoveListener.bind(null,'drag',dragTarget,elmAffected),
            }
        })
}
function dragMoveListener(moveType,dragTarget,elmAffected,event) {
    var target = event.target;
    if(document.activeElement.matches('input') || elmAffected.matches('#main.detached_inlineversenote.maximizeHorizontal .verse_note, #main.maximizeHorizontal .verse_note.detached_note')){return};//so as to make possible higlighting of text in input in dragTarget
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    // if(elmAffected.closest('#searchPreviewFixed, #cke_noteEditingTarget')){x=0}//no translation in the x direction
    // translate the element
    elmAffected.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
    // update the position attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    elmAffected.setAttribute('data-x', x);
    elmAffected.setAttribute('data-y', y);

    //In case it is contextmenu Update both bottombar and cmtitlebar
    let target_2;
    if(target.closest('#context_menu')){
        if(target.closest('.cmtitlebar')){target_2=context_menu?.querySelector('.bottombar');}
        else if(target.closest('.bottombar')){target_2=context_menu?.querySelector('.cmtitlebar');}
        target_2 ? (target_2.setAttribute('data-x', x),target_2.setAttribute('data-y', y)) : null;
    }
    else if (target_vnote = target.closest('.verse_note')){
        //Change Transform of all verse_notes on page
        document.querySelectorAll('.verse_note').forEach(vnt => {
            vnt.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            vnt.setAttribute('data-x', x);
            vnt.setAttribute('data-y', y); 
            let nrefinh = vnt.querySelector('.notes_ref_head');
            nrefinh.setAttribute('data-x', x);
            nrefinh.setAttribute('data-y', y); 
        });

    }
}
/* Maximize / Minimize Refnav and ContextMenu */
document.addEventListener('keyup', function(e){
    const docActElm = document.activeClickedElement;
    let acceptedKesPressed = ['Digit1','Digit2','Digit3'].includes(e.code) ||e.key=='*' || e.key=='/';
    if(!acceptedKesPressed || (acceptedKesPressed && document.activeElement.closest('input,[contenteditable="true"]') /* && document.querySelector('#context_menu.slideintoview') */)) {return}
    if (e.code=='Digit1' && document.querySelector('#context_menu.slideintoview')) {
        context_menu.classList.toggle('fillscreen')
    }
    else if (e.code=='Digit2' && document.querySelector('.note_temp_holder:not(.versenote_hidden)')) {
        toggleMaximize(null,['maximizeVertical','maximizeHorizontal'])
    }
    else if (e.code=='Digit3' && (rfnvCol2Div = document.querySelector('#refnav_col2 > div:has(.fillscreen_btn).slideintoview'))) {
        rfnvCol2Div.classList.toggle('fillscreen');
    }
    else if (e.key=='*') {
        if (docActElm.closest('#context_menu')) {
            context_menu.classList.toggle('fillscreen')
        } else if (docActElm.closest('.verse_note')) {
            toggleMaximize(null,['maximizeVertical','maximizeHorizontal'])
        } else if (rfnvCol2Div = docActElm.closest('#refnav_col2 > div')) {
            rfnvCol2Div.classList.toggle('fillscreen');
        }
    }//toggle fillscreen
    else if (e.key=='/'){
        document.body.classList.toggle('middleContextMenu')
    }//toggle context_menu fillscreen
    
})

// HOVERED VERSE SLIDER INDICATOR
// Div overlays hovered verse
// if(document.querySelector('#main')){
//     let v_xy = main.querySelector('#v_xy');
//     let v_xyPositioning = (function(){
//         let et;
//         return function (e) {
//             if(!hl_hverse_check.checked){
//             if(main.querySelector('#v_xy')){v_xy.remove}
//                 return
//             }
//             if (e.type == 'mouseover') {et = e.target.closest('.vmultiple .verse');}
//             if (et) {
//                 if (!v_xy) {
//                     v_xy = createNewElement('div', '#v_xy');
//                     main.append(v_xy);
//                 }
//                 let {width, height, left, top} = et.getBoundingClientRect();
//                 v_xy.style.height = height + 'px';
//                 v_xy.style.width = width + 'px';
//                 v_xy.style.left = left + 'px';
//                 v_xy.style.top = top + 'px';
//             }
//         }
//     })();
    
//     document.addEventListener('mouseover', v_xyPositioning);
//     main.addEventListener('scroll', v_xyPositioning);
// }