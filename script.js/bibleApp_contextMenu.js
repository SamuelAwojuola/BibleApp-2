/* RIGHT-CLICK MENU */
ppp.addEventListener('contextmenu', (e) => {
    // ppp.addEventListener('mouseover', (e) => {
    e.preventDefault();
    // FOR SHOWING AND HIDING THE RIGHTCLICK MENU
    var menusX = e.x;
    if (e.target.matches('.translated, .strnum')) {
        // let context_menu;
        // if(!document.querySelector('#context_menu')){context_menu = document.querySelector('.context_menu').cloneNode(true);
        // context_menu.id='context_menu';}else{context_menu=document.querySelector('#context_menu')}
        // ppp.append(context_menu);
        var menusWidth = context_menu.offsetWidth;
        context_menu.innerText = e.target.getAttribute('data-title');
        hideRefNav('show', context_menu)
        if (window.innerWidth - menusX+10 < menusWidth) {
            menusX = window.innerWidth - menusWidth - 10
            // menusX = selectedTextRange.getClientRects()[0].right - menusWidth + 5
        }
        var menusHeight = context_menu.offsetHeight;
        var menusY = e.y + 10;
        if (window.innerHeight - menusY < menusHeight) {
            menusY = e.y - menusHeight - 10
        }
        context_menu.style.left = menusX + window.scrollX + "px";
        context_menu.style.top = menusY + window.scrollY + "px";
    } else {
        hideRefNav('hide', context_menu)
        // context_menu.remove()
    }
}, false);
// main.addEventListener('mousedown', function(){hideRefNav('hide', context_menu)})