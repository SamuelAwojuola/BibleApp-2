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
        if (e.target.getAttribute("translation")) {
            originalWord = e.target.getAttribute("translation");
            if (truexlit = e.target.getAttribute("data-true-xlit")) {
                originalWord = `“${originalWord.trim()}” : ${truexlit}`;
            }
        } else {
            originalWord = e.target.parentElement.getAttribute("translation")
        }
        let menu_inner = `${e.target.getAttribute('data-title')}<hr>${originalWord}`;
        context_menu.innerHTML = menu_inner;
        hideRefNav('show', context_menu)
        context_menu.style.left = menusX + window.scrollX + "px";
        if (window.innerWidth - menusX < context_menu.offsetWidth) {
            menusX = window.innerWidth - context_menu.offsetWidth - 10;
            context_menu.style.left = menusX + window.scrollX + "px";
            // menusX = selectedTextRange.getClientRects()[0].right - menusWidth + 5
        }
        var menusY = e.y + 10;
        context_menu.style.top = menusY + window.scrollY + "px";
        if (window.innerHeight - menusY < context_menu.offsetHeight) {
            menusY = e.y - context_menu.offsetHeight - 10;
            context_menu.style.top = menusY + window.scrollY + "px";
        }
    } else {
        hideRefNav('hide', context_menu)
        // context_menu.remove()
    }
}

function add_hoverContextMenuEventListner() {
    // ppp.addEventListener('contextmenu', (e) => {
    ppp.addEventListener('mouseover', add_tooltipContextMenu, false);
}
function remove_hoverContextMenuEventListner() {
    hideRefNav('hide', context_menu); //In case it is on the screen
    ppp.removeEventListener('mouseover', add_tooltipContextMenu, false);
}
function add_rClickcontextMenuEventListner() {
    ppp.addEventListener('contextmenu', add_tooltipContextMenu, false);
}
function remove_rClickcontextMenuEventListner() {
    ppp.removeEventListener('contextmenu', add_tooltipContextMenu, false);
}

add_hoverContextMenuEventListner()

tool_tip.addEventListener('click',()=>{
    toolTipOnOff()
});

document.addEventListener('keydown', evt => {
    if (evt.key === 't' && evt.altKey) {
        toolTipOnOff()
    }
});

function toolTipOnOff() {
    if (ttip_check.checked) {
        ttip_check.checked = false;
        tool_tip.classList.remove("active_button");
        remove_hoverContextMenuEventListner();
        add_rClickcontextMenuEventListner();
    } else {
        ttip_check.checked = true;
        tool_tip.classList.add("active_button");
        add_hoverContextMenuEventListner();
        remove_rClickcontextMenuEventListner();
    }
}