/* RIGHT-CLICK MENU */
function add_tooltipContextMenu(e) {
    e.preventDefault();
    // FOR SHOWING AND HIDING THE RIGHTCLICK MENU
    var menusX = e.x;
    if (e.target.matches('.translated, .strnum')) {
        // let context_menu;
        // if(!document.querySelector('#context_menu')){context_menu = document.querySelector('.context_menu').cloneNode(true);
        // context_menu.id='context_menu';}else{context_menu=document.querySelector('#context_menu')}
        // ppp.append(context_menu);
        let originalWord;
        let addquotes = true;
        if (e.target.getAttribute("translation")) {
            originalWord = e.target.getAttribute("translation");
            if (truexlit = e.target.getAttribute("data-true-xlit")) {
                if(elmAhasElmOfClassBasAncestor(e.target, 'rtl')){originalWord = `“${originalWord.trim()} : ”${truexlit}`;}//because of the direction of the text
                else {originalWord = `“${originalWord.trim()}” : ${truexlit}`;}
                addquotes = false;
            }
        } else {
            originalWord = e.target.parentElement.getAttribute("translation")
        }
        let menu_inner;
        if(addquotes){menu_inner = `${e.target.getAttribute('data-title')}<hr>“${originalWord.trim()}”`;}
        else{menu_inner = `${e.target.getAttribute('data-title')}<hr>${originalWord.trim()}`;}
        context_menu.innerHTML = menu_inner + newStrongsDef;
        hideRefNav('show', context_menu)
        context_menu.style.left = menusX + window.scrollX + "px";
        if (window.innerWidth - menusX < context_menu.offsetWidth) {
            menusX = window.innerWidth - context_menu.offsetWidth - 10;
            context_menu.style.left = menusX + window.scrollX + "px";
            // menusX = selectedTextRange.getClientRects()[0].right - menusWidth + 5
        }
        // var menusY = e.y + 10;
        var menusY = e.target.getBoundingClientRect().top + e.target.offsetHeight;
        context_menu.style.top = menusY + window.scrollY + "px";
        if (window.innerHeight - menusY < context_menu.offsetHeight) {
            menusY = e.target.getBoundingClientRect().top - context_menu.offsetHeight;
            context_menu.style.top = menusY + window.scrollY + "px";
        }
    } else {
        hideRefNav('hide', context_menu)
        // context_menu.remove()
    }
}
let newStrongsDef='';
function getCurrentStrongsDef(){
    context_menu.classList.add('rightclicked')
    newStrongsDef='<hr>'+currentStrongsDef;
    toolTipOnOff(false);
}
function add_mouseoverContextMenuEventListner() {
    ppp.addEventListener('mouseover', add_tooltipContextMenu, false);
}
function remove_mouseoverContextMenuEventListner() {
    hideRefNav('hide', context_menu); //In case it is on the screen
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

tool_tip.addEventListener('click',()=>{
    toolTipOnOff();
    toolTipON=ttip_check.checked;
});

let toolTipON=ttip_check.checked;//Is modified by escape or alt + t
document.addEventListener('keydown', evt => {
    if (evt.key === 't' && evt.altKey) {
        toolTipOnOff();
        toolTipON=ttip_check.checked;
    }
});
function toolTipOnOff(x) {
    if (x==false||ttip_check.checked) {
        ttip_check.checked = false;
        tool_tip.classList.remove("active_button");
        remove_mouseoverContextMenuEventListner();
        // add_rClickcontextMenuEventListner();
    } else {
        ttip_check.checked = true;
        tool_tip.classList.add("active_button");
        add_mouseoverContextMenuEventListner();
        // remove_rClickcontextMenuEventListner();
    }
}
//Hide ContextMenu on clicking outside of main window
document.addEventListener('mousedown', function(e){
    if(!(e.target.matches('.context_menu')||elmAhasElmOfClassBasAncestor(e.target,'#main'))){hideRightClickContextMenu()}
})