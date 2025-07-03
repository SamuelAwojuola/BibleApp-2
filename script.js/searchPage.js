const searchBar = document.createElement('div');
searchBar.id = "searchInPageInputnBtnHolder";
searchBar.style.cssText = 'display: none; position: fixed; top: 0; right: 0; z-index: 9999; transition-duration: 0.3s;padding:4px;border-radius:2px;border:1px solid #ccc;background-color!important:#3a88833d;box-shadow: 5px 1px 2px 0px;align-items:center;';
document.body.prepend(searchBar);
searchBar.innerHTML = `
    <div id="inputncountholder" style="position:relative">
      <input id="searchInPageInput" type="text" placeholder="Search on page...">
      <div id="searchedWordsCount" style="position:absolute;right:0;top:3px;padding:0 5px;font-style:italic;color:grey;font-size:0.8em;"></div>
    </div>
    <button id="searchInPageInputBtn">&#129131;</button>
    <button id="searchInPageInputBtn_UP">&#129129</button>
    <button id="searchCloseBtn">&#10006;</button>
`;

const searchInput = document.getElementById("searchInPageInput");
const searchBtn = document.getElementById("searchInPageInputBtn");
const searchBtnUp = document.getElementById("searchInPageInputBtn_UP");
const closeBtn = document.getElementById("searchCloseBtn");
const countDisplay = document.getElementById("searchedWordsCount");

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debouncedsearchInPage = debounce(searchInPage, 300); // Adjust delay as needed

window.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        append_createStyleForSearchInHead_style();
        // Get the currently selected text (if any)
        const selection = window.getSelection();
        const selectionTrimed = selection.toString().trim();
        if (selectionTrimed) {
            searchInput.value = selectionTrimed;
            const range = selection.getRangeAt(0);
            const newNode = document.createElement('span');
            newNode.id='selectedText';
            newNode.appendChild(range.extractContents());
            range.insertNode(newNode);
        }
        showSearch();
        debouncedsearchInPage(null, true); // Trigger the search
    }
});

let prevSearchText = '';
let searchIndex = -1;

function highlightText(searchText) {
    //unhighlight previous highlights
    const slct = searchText==''?'mark, span#selectedText':'mark';
    document.body.querySelectorAll(slct).forEach(mark=>{mark.outerHTML=mark.innerText});
    if (searchText=='') {return}

    const regex = new RegExp(`(?:(?!<[^>]*>)(${searchText}))(?![^<]*>)`, "gi");
    const elements = document.body.querySelectorAll("*:not(script):not(style):not(input):not(button):not(#searchInPageInputnBtnHolder *):not(#searchInPageInputnBtnHolder)"); // Exclude search bar elements

    elements.forEach(el=>{
        // Handle search bar buttons separately (optional)
        if (el.id==="searchInPageInputBtn" || el.id==="searchInPageInputBtn_UP" || el.id==="searchCloseBtn") {
            el.textContent = el.textContent.replace(regex, match => `<mark>${match}</mark>`);
        } else {
            el.innerHTML = el.innerHTML.replace(regex, match => `<mark>${match}</mark>`);
        }
    });
}

function searchInPage(upOrDown = null, initialSearch = false) {
    const searchText = searchInput.value.trim();

    if (!searchText) {
        countDisplay.textContent = '';
        document.body.querySelectorAll('mark, span#selectedText').forEach(el => el.outerHTML = el.innerText); // Clear highlights
        searchIndex = -1;
        prevSearchText = '';
        return;
    }
    
    if (searchText !== prevSearchText) {
        highlightText(searchText);
        searchIndex = -1;
    }
    
    const markers = document.body.querySelectorAll(`mark`);
    if (initialSearch) {
        const viewportHeight = window.innerHeight;
        if(selectedMarker = document.querySelector('#selectedText mark')){
            searchIndex = Array.prototype.indexOf.call(markers, selectedMarker);
        } else {
            for (let i = 0; i < markers.length; i++) {
                const elementRect = markers[i].getBoundingClientRect();
                if (elementRect.top >= -1*(markers[i].offsetHeight/2) && elementRect.bottom <= viewportHeight) {
                    searchIndex = i;
                    break; // Found the first match in the viewport
                }
            }
        }
    }
    else if (upOrDown) {searchIndex = (searchIndex - 1 + markers.length) % markers.length;}
    else {searchIndex = (searchIndex + 1) % markers.length;}
    if (markers[searchIndex]) {
        const prev_current_search_marker = document.querySelector('.current_search_marker');
        prev_current_search_marker ? prev_current_search_marker.classList.remove('current_search_marker') : null;

        markers[searchIndex].classList.add('current_search_marker')
        markers[searchIndex].scrollIntoView({behavior:'smooth',block:'center'});
        countDisplay.textContent = `${searchIndex + 1}/${markers.length}`;
    } else {
        countDisplay.textContent = "0/0";
    }
    prevSearchText = searchText;
}

searchInput.addEventListener('input', () => debouncedsearchInPage(null, true));
searchBtn.addEventListener('click', () => searchInPage());
searchBtnUp.addEventListener('click', () => searchInPage(true));

closeBtn.addEventListener('click', () => {
    searchBar.style.display = 'none';
    searchInput.value = '';
    document.body.querySelectorAll('mark, span#selectedText').forEach(m=>{m.outerHTML=m.innerHTML});// Clear highlights
    document.body.querySelectorAll('#createStyleForSearchInHead_style').forEach(c=>{c.remove()}); // Clear highlights
    prevSearchText = '';
});

function showSearch() {
    searchBar.style.display = 'flex';
    searchInput.focus();
}

document.addEventListener("keydown", function (e) {
    if (searchBar.style.display === 'flex') {
        if (e.key === "Escape") {closeBtn.click();}
        else if (e.key === "Enter") {
            if (e.shiftKey) {searchInPage(true);}
            else {searchInPage();}
        }
    }
});
function append_createStyleForSearchInHead_style() {
    const searchBarStyle = document.createElement('style');
    searchBarStyle.id='createStyleForSearchInHead_style';
    searchBarStyle.textContent = `
    #searchInPageInputnBtnHolder{background-color:#f0f0f0;border:1px solid #ddd;padding:15px;}
    #searchInPageInputnBtnHolder button{padding:0.8px 12px;height:fit-content;}
    #searchInPageInputnBtnHolder :is(button,#searchedWordsCount){font-size:0.9em;}
    #searchInPageInput {display:block;font-size:var(--fontsize-main);border:none;box-shadow: 0px 0.5px 1.5px inset; padding-left:0.3em;padding-right:1.5em;}
    mark {background-color:#a8e4d345;}.current_search_marker{background-color:yellow;}
    body.darkmode mark:not(.current_search_marker){background-color:#a8e4d970!important;color:black!important;}body.darkmode .current_search_marker{background-color:yellow!important;color:black!important;}body.darkmode #searchInPageInputnBtnHolder{box-shadow:5px 10px 15px 1px black!important;}`;
    document.head.appendChild(searchBarStyle);
}