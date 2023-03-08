function addCSSrulesFromArray(css_rules_array, styleSheetToAddThemTo) {}

function getAllRulesInStyleSheet(styleSheet) {
    if (styleSheet) {
        let allRules = styleSheet.sheet.cssRules;
        let rulesArray = [];
        for (let i = 0; i < allRules.length; i++) {
            rulesArray.push(allRules[i].cssText)
        };
        // console.log(rulesArray)
        return rulesArray
    }
}
//STYLE SHEET MODIFIER
function findCSSRule(mySheet, selector) {
    mySheet=mySheet.sheet;
    let ruleIndex = -1; // Default to 'not found'
    let theRules = mySheet.cssRules ? mySheet.cssRules : mySheet.rules;
    for (i = 0; i < theRules.length; i++) {
        if (theRules[i].selectorText == selector) {
            ruleIndex = i;
            break;
        }
    }
    return ruleIndex;
}
//Random color Alternative
//+'#' + (0x1220000 + Math.random() * 0xFF00FF).toString(16).substr(1,6);
function createNewStyleSheetandRule(styleID, styleRule) {
    if (!document.getElementsByTagName('head')[0].querySelector('#' + styleID)) {
        addNewStyle()
    } else {
        document.getElementsByTagName('head')[0].querySelector('#' + styleID).remove();
        addNewStyle()
    }

    function addNewStyle() {
        let headPart = document.getElementsByTagName('head')[0];
        newStyleInHead = document.createElement('style');
        newStyleInHead.id = styleID;
        newStyleInHead.innerHTML = styleRule;
        headPart.append(newStyleInHead);
    }
}

function addRemoveRuleFromStyleSheet(CS_rule, ruleSelector, targetStyleSheet) {
    let highlightStrongsSheet = targetStyleSheet.sheet;
    let allRules = highlightStrongsSheet.cssRules;
    for (let i = 0; i < allRules.length; i++) {
        //Add rule if it doesn't exist
        if (findCSSRule(targetStyleSheet, ruleSelector) == -1) {
            targetStyleSheet.sheet.insertRule(CS_rule, allRules.length - 1);
            // console.log('RULE ADDED')
        }
        //Remove rule if it already exists
        else {
            highlightStrongsSheet.deleteRule(findCSSRule(targetStyleSheet, ruleSelector));
            //Remove stylesheet if there are no more rules in it
            if (allRules.length == 0) {
                targetStyleSheet.remove()
            }
            // console.log('RULE REMOVED')
        }
        break
    }
}
/* CHANGE ROOT CSS VARIABLES */
//get a variables value
let documentROOT = document.querySelector(':root');
let rootStyles = getComputedStyle(documentROOT)
// rootStyles.getPropertyValue('--buttons')
function changeFontFamily() {
    //change value of variable
    documentROOT.style.setProperty('--main-font', fontchange.value);
    styleLocalstorageSet()
}

function changeFontSize(targetgroup, plusMinus) {
    let currentSize;
    if (targetgroup == 'verse_text') {
        targ = '--fontsize-scripture';
        currentSize = rootStyles.getPropertyValue('--fontsize-scripture');
    }
    if (targetgroup == 'main_font') {
        targ = '--fontsize-main';
        currentSize = rootStyles.getPropertyValue('--fontsize-main');
    }
    if (targetgroup == 'ref_text') {
        targ = '--fontsize-ref';
        currentSize = rootStyles.getPropertyValue('--fontsize-ref');
    }
    if (targetgroup == 'strongs_tooltip') {
        targ = '--fontsize-strongstooltip';
        currentSize = rootStyles.getPropertyValue('--fontsize-strongstooltip');
    }
    if (targetgroup == 'bible_nav') {
        targ = '--fontsize-scripture-nav';
        currentSize = rootStyles.getPropertyValue('--fontsize-scripture-nav');
    }
    if (targetgroup == 'refnsrch') {
        targ = '--fontsize-refnsearch';
        currentSize = rootStyles.getPropertyValue('--fontsize-refnsearch');
    }
    if (targetgroup == 'versionsbuttons') {
        targ = '--fontsize-versionsbuttons';
        currentSize = rootStyles.getPropertyValue('--fontsize-versionsbuttons');
    }
    if (targetgroup == 'widthsidebuttons') {
        targ = '--width-sidebuttons';
        currentSize = rootStyles.getPropertyValue('--width-sidebuttons');
    }
    currentSize = Number(currentSize.split('px')[0].trim())
    if (plusMinus == 'plus') {
        currentSize = (currentSize + 2) + 'px'
    } else if (plusMinus == 'minus') {
        currentSize = (currentSize - 2) + 'px'
    }
    documentROOT.style.setProperty(targ, currentSize);
    styleLocalstorageSet()
}
function changeBackGround(newColor,targetgroup='--ref-img') {
    documentROOT.style.setProperty(targetgroup, newColor);
    styleLocalstorageSet()
}

function styleLocalstorageSet() {
    let variableArray = [
        ["--ref-img", rootStyles.getPropertyValue('--ref-img')],
        ["--fontsize-scripture", rootStyles.getPropertyValue('--fontsize-scripture')],
        ["--fontsize-ref", rootStyles.getPropertyValue('--fontsize-ref')],
        ["--fontsize-strongstooltip", rootStyles.getPropertyValue('--fontsize-strongstooltip')],
        ["--fontsize-scripture-nav", rootStyles.getPropertyValue('--fontsize-scripture-nav')],
        ["--main-font", rootStyles.getPropertyValue('--main-font')],
        ["--fontsize-refnsearch", rootStyles.getPropertyValue('--fontsize-refnsearch')],
        ["--fontsize-main", rootStyles.getPropertyValue('--fontsize-main')],
        ["--fontsize-versionsbuttons", rootStyles.getPropertyValue('--fontsize-versionsbuttons')],
        ["--width-sidebuttons", rootStyles.getPropertyValue('--width-sidebuttons')]
    ]
    setItemInLocalStorage(fontsizes.value, variableArray);
    setItemInLocalStorage('currentFontSizeSet', fontsizes.value);
    // setItemInLocalStorage('styles_variables', variableArray);
}
function loadfontsizes(){
    if (localStorage.getItem(fontsizes.value)) {
        let stylesVariablesArray = localStorage.getItem(fontsizes.value).split(',');
        stylesVariablesArray.forEach((sVar, i) => {
            j = i + 2;
            if (j % 2 == 0) {
                document.querySelector(':root').style.setProperty(stylesVariablesArray[i], stylesVariablesArray[i + 1]);
            }
        });
    }
    styleLocalstorageSet()
}
if (document.body.matches('#homepage')) {
    eng2grk_sup_table.addEventListener('click',showHideTransliterationSection)
}
function showHideTransliterationSection(e){
    if(elmAhasElmOfClassBasAncestor(e.target,'#eng2grk_sup_table')){
        let eng2grkChkBoxes = eng2grk_sup_table.querySelectorAll('button input');
        let arrOfchkState = [];
        
        for(i=0;i<eng2grkChkBoxes.length;i++){
            let x = eng2grkChkBoxes[i];
            arrOfchkState.push(x.id)
            arrOfchkState.push(x.checked)
        }
        setItemInLocalStorage('eng2grk_sup_checkboxes', arrOfchkState);
    }
}

function darkLightMode(dl) {
    if (dl) {
        if (dl=='lightmode') {
            button_image_color.setAttribute('colormode','darkmode')
            let allBtnImgs = document.querySelectorAll('button > img')
            allBtnImgs.forEach(img=>{
                img.src = img.src.replace(/-DarkMode\.svg/, '.svg')
            })
        } else if(dl=='darkmode'){
            button_image_color.setAttribute('colormode','lightmode')
            let allBtnImgs = document.querySelectorAll('button > img')
            allBtnImgs.forEach(img=>{
                img.src = img.src.replace(/\.svg/, '-DarkMode.svg')
            })
        }
    } else {
        if (document.body.classList.contains('darkmode')) {
            document.body.classList.remove('darkmode')
            darkmodebtn.innerText = '🌤'
            let allBtnImgs = document.querySelectorAll('button > img')
            allBtnImgs.forEach(img=>{
                img.src = img.src.replace(/-DarkMode\.svg/, '.svg')
            })
            localStorage.removeItem('darkmode')
        } else {
            document.body.classList.add('darkmode')
            darkmodebtn.innerText = '🌑';
            let allBtnImgs = document.querySelectorAll('button > img')
            allBtnImgs.forEach(img=>{
                img.src = img.src.replace(/\.svg/, '-DarkMode.svg')
            })
            setItemInLocalStorage('darkmode', 'true')
        }
    }
}

let saved_highlightStrongsSheet;
function hide_strongshighlight() {
    //to be used to restore all the strongsHighlight (not yet implimented)
    saved_highlightStrongsSheet = highlightstrongs;
    highlightstrongs.remove()
}

function showEnglishTranslationOfHGtransliteration(evt) {
    if (evt && (evt.key === 'r'||evt.key === 'R') && evt.altKey) {
        engnXlit_supscript('eng')
    }
    if (evt && (evt.key === 't'||evt.key === 'T') && evt.altKey) {
        engnXlit_supscript('hebgrk')
    }
}

function engnXlit_supscript(x) {
    if (x == 'eng') {
        let eng2grk_style = `.verse:not(.v_accented) .eng2grk::after{
            content: attr(translation);
            font-size: 75%;
            line-height: 0;
            position: relative;
            vertical-align: baseline;
            top: -0.5em;
            font-style: italic;
            color:crimson;
        }`;

        // Toggle the stylesheet :::: add/remove
        if (engofgrknhb = document.querySelector('head').querySelector('#engofgrknhb')) {
            engofgrknhb.remove();
            changeElmTextNodeTo(show_eng_superscript,'OFF');
        } else {
            createNewStyleSheetandRule('engofgrknhb', eng2grk_style)
            changeElmTextNodeTo(show_eng_superscript,'ON');
        }
    }
    if (x == 'hebgrk') {
        let eng2grk_style = `
        .verse:not(.v_accented) .translated:not(.eng2grk)::after {
                content: attr(data-xlit)
            }
        .verse.v_accented .translated:not(.eng2grk)::after {
                content: attr(data-true-xlit)
            }
            .verse .translated:not(.eng2grk)::after {
                font-size: 75%;
                line-height: 0;
                position: relative;
                vertical-align: baseline;
                top: -0.5em;
                font-style: italic;
                color:darkslategrey;
            }`;

        // Toggle the stylesheet :::: add/remove
        if (xlitofhebngrk = document.querySelector('head').querySelector('#xlitofhebngrk')) {
            xlitofhebngrk.remove();
            changeElmTextNodeTo(show_hebgrk_superscript,'OFF')
        } else {
            createNewStyleSheetandRule('xlitofhebngrk', eng2grk_style)
            changeElmTextNodeTo(show_hebgrk_superscript,'ON')
        }
    }
}
// console.log("HELP:: press 'alt+r' to toggle original english translation of transliterated Hebrew or Greek words as a superscript ")

document.addEventListener('keydown', showEnglishTranslationOfHGtransliteration);

/* \/\/\/\\/\/\/\/\/\/\\/\/\/\/\/\/\/\//\/\/\/\/\/\/\/\/\/\/\/\/\/\\/\/\/\ */
/* \/\/\/\\/\/\/\/\/\/\\/\/\/\/\/ BOOK MARKS /\/\/\/\/\/\/\/\/\/\/\\/\/\/\ */
/* \/\/\/\\/\/\/\/\/\/\\/\/\/\/\/\/\/\//\/\/\/\/\/\/\/\/\/\/\/\/\/\\/\/\/\ */
pagemaster.addEventListener("dblclick",highlight_N_bookmark_verse);
bookmarks_holder.addEventListener("click",getBookmarkRef)
let bookMarkedVersesArr=[];
function highlight_N_bookmark_verse(e){
    if(e.target.matches('.verse') && e.target.parentElement.matches('.vmultiple:not(.v_dblclckd)')){
        /* Change Background Color */
        e.target.parentElement.classList.add('v_dblclckd');

        /* **************** */
        /* Create Book Mark */
        /* **************** */
        let vref=e.target.querySelector('code[ref]').getAttribute('ref');
        let newBookMark=createNewElement('li');
        newBookMark.setAttribute('ref',vref);
        newBookMark.innerText=vref;
        bookmark_content.prepend(newBookMark);
        bookMarkedVersesArr.push(vref);
        setItemInLocalStorage('bookmarks',bookMarkedVersesArr)
        bookmarks_holder.classList.remove('displaynone');
    } else if(e.target.matches('.verse') && e.target.parentElement.matches('.v_dblclckd')){
        e.target.parentElement.classList.remove('v_dblclckd');
        /* **************** */
        /* Remove Book Mark */
        /* **************** */
        let vref=e.target.querySelector('code[ref]').getAttribute('ref');
        bookmark_content.querySelector(`[ref="${vref}"]`).remove();
        bookMarkedVersesArr.splice(bookMarkedVersesArr.indexOf(vref),1);
        setItemInLocalStorage('bookmarks',bookMarkedVersesArr);
        if(bookMarkedVersesArr.length==0){
            bookmarks_holder.classList.add('displaynone');
        }
    }
}
function getBookmarkRef(e){
    if(e.target.parentElement==bookmark_content){
        gotoRef(e.target.getAttribute('ref'))
    }
    /* Clicking on the bookmark_head */
    else if(e.target==bookmark_head) {
        bookmark_content.classList.toggle('displayblock')
        bookmarks_holder.classList.toggle('showing_bookmarks');
    }
}
main.addEventListener('click', function (e) {
    if(!e.target.matches('#bookmarks_holder, #bookmarks_holder *') && document.querySelector('#bookmark_content') && bookmark_content.matches('.displayblock')){
        bookmark_content.classList.remove('displayblock')
        bookmarks_holder.classList.remove('showing_bookmarks');
    } 
})

function loadBookmarksFromCache(arr){
    bookMarkedVersesArr=arr;
    arr.forEach(vref => {
        let newBookMark=createNewElement('li');
        newBookMark.setAttribute('ref',vref);
        newBookMark.innerText=vref;
        bookmark_content.append(newBookMark);
    });
}