/* RIGHT-CLICK MENU */
let ttimer;
function add_tooltipContextMenu(e) {
    e.preventDefault();
    // FOR SHOWING AND HIDING THE RIGHTCLICK MENU
    var menusX = e.x;
    if (e.target.matches('.translated, .strnum, .crossrefs>span')) {
        function timedFUNC(){
            let target_right = e.target.getBoundingClientRect().right;
            // let target_left = e.target.offsetLeft;
            let target_left = e.target.getBoundingClientRect().left;
            let target_top = e.target.offsetTop;
            // let target_top = e.target.getBoundingClientRect().top;
            let target_bottom = e.target.getBoundingClientRect().bottom;
            let target_width = e.target.offsetWidth;
            let originalWord;
            let addquotes = true;
            if(e.target.matches('.translated, .strnum')){
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
                if (addquotes) {
                    menu_inner = `${e.target.getAttribute('data-title')}<hr>“${originalWord.trim()}”`;
                } else {
                    menu_inner = `${e.target.getAttribute('data-title')}<hr>${originalWord.trim()}`;
                }
                context_menu.innerHTML = menu_inner + newStrongsDef;
                context_menu.removeAttribute('style');
                hideRefNav('show', context_menu)
            } else if(e.type=='contextmenu'||e.type=='mouseover') {
                context_menu.innerText=null;
                context_menu.append(getCrossReference(e.target));
                context_menu.removeAttribute('style');
                hideRefNav('show', context_menu)
            }
            /* POSITION MENU */
            let cmH = context_menu.offsetHeight;
            context_menu.style.left = menusX + window.scrollX + "px";
            let target_height = e.target.offsetHeight;
            if (window.innerWidth - target_left <= 300) {
                context_menu.style.right = window.innerWidth - target_right - window.scrollX + "px";
                context_menu.style.left = "";
            } else {
                context_menu.style.left = target_left + window.scrollX + "px";
                context_menu.style.right = "";
            }
            // var menusY = e.y + 10;
            let menusY = e.target.getBoundingClientRect().top + e.target.offsetHeight + window.scrollY;
            context_menu.style.top = menusY + "px";
            //IF CONTEXT MENU IS TO CLOSE TO THE BOTTOM
            let btnsBarHeight = document.querySelector('#pagemaster>.buttons').getBoundingClientRect().height;
            let space_above_target = target_top - btnsBarHeight - main.scrollTop;
            let space_below_target = window.innerHeight - target_bottom - main.scrollTop;
            if (window.innerHeight - target_bottom <= context_menu.offsetHeight) {
                context_menu.style.top = menusY - e.target.offsetHeight - context_menu.offsetHeight + "px";
                let context_menu_top = target_top - context_menu.offsetHeight - main.scrollTop;
                context_menu.style.top = context_menu_top + "px";
                if (context_menu_top < btnsBarHeight + main.scrollTop) {
                    if (space_below_target <= space_above_target) {
                        console.log('one')
                        let menuHeight;
                        if (space_above_target < context_menu.offsetHeight) {
                            context_menu.style.height = space_above_target + "px";
                            context_menu.style.top = btnsBarHeight + "px";
                        }
                    } else {
                        console.log('two')
                        if (space_below_target < context_menu.offsetHeight) {
                            console.log('three')
                            context_menu.style.height = space_below_target + "px";
                        }
                        context_menu.style.top = target_bottom + "px";
                    }
                } else{
                    console.log('four')
                    context_menu.style.top = target_bottom - target_height - cmH - window.scrollY + "px";
                }
            } else {
                context_menu.style.top = target_bottom + window.scrollY + "px";
            }
            addCMPevtListner()
        }
        if(e.type=='mouseover'){ttimer = setTimeout(function() {
            timedFUNC()
        }, 1000)}
        else{timedFUNC()}
    } else if(!e.target.matches('#context_menu')&&!elmAhasElmOfClassBasAncestor(e.target,'.context_menu')){
        hideRefNav('hide', context_menu, removeCMPevtListner());
        context_menu.innerHTML='';
    }
}
let newStrongsDef = '';

function getCurrentStrongsDef(e) {
    if (strnum = e.target.getAttribute('strnum')) {
        strnum = strnum.split(' ');
        getsStrongsDefinition(strnum);
    }
    context_menu.classList.add('rightclicked')
    context_menu.removeAttribute('strnum')
    context_menu.setAttribute('strnum', strnum)
    newStrongsDef = '<hr>' + currentStrongsDef;
    toolTipOnOff(false);
}

ppp.addEventListener('mouseout', function (e){
    if(e.target.matches('.translated, .strnum, .crossrefs>span')){clearTimeout(ttimer)}
});
function add_mouseoverContextMenuEventListner() {
    ppp.addEventListener('mouseover', add_tooltipContextMenu, false);
    main.addEventListener("click", add_tooltipContextMenu, false);
}

function remove_mouseoverContextMenuEventListner() {
    hideRefNav('hide', context_menu, removeCMPevtListner()); //In case it is on the screen
    ppp.removeEventListener('mouseover', add_tooltipContextMenu, false);
}
// function add_rClickcontextMenuEventListner() {
//     ppp.addEventListener('contextmenu', add_tooltipContextMenu, false);
// }
// function remove_rClickcontextMenuEventListner() {
//     ppp.removeEventListener('contextmenu', add_tooltipContextMenu, false);
// }
ppp.addEventListener('contextmenu', getCurrentStrongsDef, false);
ppp.addEventListener('contextmenu', add_tooltipContextMenu, false);

add_mouseoverContextMenuEventListner()

tool_tip.addEventListener('click', () => {
    toolTipOnOff();
    toolTipON = ttip_check.checked;
});

let toolTipON = ttip_check.checked; //Is modified by escape or alt + t
document.addEventListener('keydown', evt => {
    if (evt.key === 't' && evt.altKey) {
        toolTipOnOff();
        toolTipON = ttip_check.checked;
    }
});

function toolTipOnOff(x) {
    if (x == false || ttip_check.checked) {
        ttip_check.checked = false;
        tool_tip.classList.remove("active_button");
        remove_mouseoverContextMenuEventListner();
        // add_rClickcontextMenuEventListner();
        removeCMPevtListner();
    } else {
        ttip_check.checked = true;
        tool_tip.classList.add("active_button");
        add_mouseoverContextMenuEventListner();
        // remove_rClickcontextMenuEventListner();
    }
}
//Hide ContextMenu on clicking outside of main window
document.addEventListener('mousedown', function (e) {
    // if(!(e.target.matches('.context_menu')||elmAhasElmOfClassBasAncestor(e.target,'#main'))){hideRightClickContextMenu()}
    if (!(e.target.matches('.context_menu') || elmAhasElmOfClassBasAncestor(e.target, 'context_menu'))) {
        hideRightClickContextMenu()
    }
})

function updateContextMenuPosition(oldScrollTop){
    // console.log(main.scrollHeight)
    // console.log(oldScrollTop)
    // console.log(main.scrollTop)
    // console.log(main.clientHeight)
    // console.log(main.scrollHeight - main.scrollTop - main.clientHeight)
}

function addCMPevtListner() {
    let scrlT=main.scrollTop;
    main.addEventListener('scroll', updateContextMenuPosition(scrlT))
}

function removeCMPevtListner() {
    main.removeEventListener('scroll', updateContextMenuPosition)
}