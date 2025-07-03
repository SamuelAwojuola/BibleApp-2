function versionHighlighting_ON_OFF(x) {
    //Turn off versions_highlighting
    if (x == false||x == 'false') {
        hoveredVersionHiglighting(false)
    }
    else if (hl_hversion_check.checked==true) {
        hoveredVersionHiglighting(false)
    }
    //Turn on versions_highlighting
    else {
        hoveredVersionHiglighting(true)
    }
}

//Is modified by escape or ALT + H
document.addEventListener('keydown', evt => {
    if ((evt.key === 'h' || evt.key === 'H')){
        if (evt.altKey && evt.shiftKey) {hl_hoveredverse_row.click();}
        else if (evt.altKey && !evt.shiftKey) {versionHighlighting_ON_OFF();}
        else if (evt.ctrlKey || !document.activeElement.matches('input,[contenteditable="true"]') && !document.activeClickedElement.closest('[contenteditable="true"],input') && !evt.shiftKey){hl_hoveredverse.click();}
    }
    else if ((evt.key === 'd' || evt.key === 'D') && evt.altKey) {
        evt.preventDefault()
        darkLightMode();
    }
});

function hoveredVersionHiglighting(on_off) {
    if (on_off == true) {
        // setItemInLocalStorage('versionHighlightingOnHover', true)
        hl_hversion_check.checked = true;
        hl_hoveredversion.classList.add("active_button");
        main.addEventListener('mouseover', versionHiglightingOnHover, false)
        main.addEventListener('mouseout', function (){
            if (vvH = document.getElementById('version_verses_highlightall')) {
                vvH.remove();
            }
        })
    } else if (on_off == false) {
        // setItemInLocalStorage('versionHighlightingOnHover', false)
        hl_hversion_check.checked = false;
        hl_hoveredversion.classList.remove("active_button");
        main.removeEventListener('mouseover', versionHiglightingOnHover, false)
        main.removeEventListener('mouseout', function (){
            if (vvH = document.getElementById('version_verses_highlightall')) {
                vvH.remove();
            }
        })
        // remove the style sheet for it if present
        if (vvH = document.getElementById('version_verses_highlightall')) {
            vvH.remove();
        }
    }
}
function versionHiglightingOnHover(e) {
    // e.preventDefault();
    let currentVversion = null;
    if (e.target.matches('[class^=v_].verse')) {
        currentVversion = e.target;
    } else {
        currentVversion = elmAhasElmOfClassBasAncestor(e.target, '[class^=v_].verse')
    }
    if (currentVversion) {
        v_version = currentVversion.classList.forEach(cvinv => {
            if (cvinv.startsWith('v_')) {
                return currentVversion = cvinv
            }
        })
        let headPart = document.getElementsByTagName('head')[0];

        function appendVersionHighlightStyle() {
            let newStyleInHead = document.createElement('style');
            newStyleInHead.id = 'version_verses_highlightall';
            newStyleInHead.classList.add(currentVversion);
            newStyleInHead.innerHTML = `
    .${currentVversion}:not(:only-child){background: var(--vhlt4)!important;box-shadow:var(--verse-column)!important;z-index:2;}
    /* .vmultiple:first-of-type .${currentVversion} {box-shadow:var(--verse-column-highest)!important;}.vmultiple:last-of-type .${currentVversion} {box-shadow:var(--verse-column-lowest)!important;} */
    
    .darkmode .${currentVversion}:not(:only-child){background:var(--vhlt4)!important;box-shadow:var(--verse-column)!important;
    }.darkmode .vmultiple:first-of-type .${currentVversion} {box-shadow:var(--verse-column-highest)!important;
    }.darkmode .vmultiple:last-of-type .${currentVversion} {box-shadow:var(--verse-column-lowest)!important;

    }#bibleversions_btns [bversion=${currentVversion.replace(/v_/,'')}]{transform:scale(1.2);box-shadow: inset 1px 1px var(--grey), inset -1px -1px var(--grey);border-radius: 2px;background:var(--vhlt3)!important;z-index:2;
    }.darkmode #bibleversions_btns [bversion=${currentVversion.replace(/v_/,'')}]{background: palegoldenrod!important;color: black!important;box-shadow: inset 1px 1px grey, inset -1px -1px grey;
        `;
            headPart.append(newStyleInHead);
        }
        if (vvH = document.getElementById('version_verses_highlightall')) {
            if (!vvH.classList.contains(currentVversion)) {
                vvH.remove();
            }
        }
        if (!headPart.querySelector(`#version_verses_highlightall.${currentVversion}`)) {
            appendVersionHighlightStyle();
        }
    }
}
// main.addEventListener('mouseout', function (e) {
//     if (vvH = document.getElementById('version_verses_highlightall')) {
//         vvH.remove();
//     }
// })
// Scroll VMultiple That Is Partially Showing At the Top or Bottom into View On Mouseover
// main.addEventListener('mouseover', autoScrollOutOfViewVmultipleOnHoverIntoView)
// function autoScrollOutOfViewVmultipleOnHoverIntoView(e) {
//     if(scrollToVerseBtn_check.checked==true){
//         let et=e.target.closest('#ppp>.chptverses>.vmultiple')?e.target.closest('#ppp>.chptverses>.vmultiple'):null;
//         if (et && !isFullyScrolledIntoView(et)) {
//             let hsw=false;
//             if(hl_highlightwordswithsamestrongs_check.checked){
//                 hsw=true;
//                 hl_highlightwordswithsamestrongs_check.checked=false;
//             }
//             setTimeout(() => {
//                 et.scrollIntoView({behavior: "smooth",block:"nearest"})
//             }, 100);
//             setTimeout(() => {
//                 if(hsw){hl_highlightwordswithsamestrongs_check.checked=true;}
//             }, 200);
//         }
//     }
// }

/* ********************************** */
