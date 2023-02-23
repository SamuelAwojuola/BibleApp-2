var main=document.querySelector('#col2')
// Load KJV bible for scripture tooltip
var KJV;
window.onload = function () {
    var request_KJV_URL = 'bibles/KJV.json';
    var kjvBible = new XMLHttpRequest();
    kjvBible.open('GET', request_KJV_URL);
    kjvBible.responseType = 'json';
    kjvBible.send();
    kjvBible.onload = function () {
        let booksChaptersAndVerses = kjvBible.response;
        KJV = booksChaptersAndVerses['books'];
    }
    // Get Highlighted StrongsNmbers from Cached on page load
    if (localStorage.getItem('strongsHighlightStyleSheet')) {
        let hlstrngCSS = localStorage.getItem('strongsHighlightStyleSheet');
        let headPart = document.getElementsByTagName('head')[0];
        newStyleInHead = document.createElement('style');
        newStyleInHead.id = 'highlightstrongs';
        newStyleInHead.innerHTML = hlstrngCSS.split(',').join('');
        headPart.append(newStyleInHead);
        // hlstrngCSS = hlstrngCSS.split(',').join('');
    }
    if (localStorage.getItem('transliteratedWords')) {
        transliteratedWords_Array = localStorage.getItem('transliteratedWords').split(',');
        transliteratedWords_Array.forEach(storedStrnum => {
            if(/G|H\d+/i.test(storedStrnum)){
                showTransliteration(storedStrnum)
            }
        });
    }
}
// TOGGLE COL2 ON PRESS OF ESCAPE BUTTON
pagemaster = versenotepage;
main = col2;
document.addEventListener('keydown', evt => {
    if (evt.key === 'Escape' && !document.querySelector('#context_menu.slideintoview')) {
        toggleCol2()
        transliteratedWords_Array.forEach(storedStrnum => {
            showTransliteration(storedStrnum)
        });
    }
});