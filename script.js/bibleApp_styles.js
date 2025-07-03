// function addCSSrulesFromArray(css_rules_array, styleSheetToAddThemTo) {}
function getAllRulesInStyleSheet(styleSheet) {
    if (styleSheet) {
        let allRules = styleSheet.sheet.cssRules;
        let rulesArray = '';
        for (let i = 0; i < allRules.length; i++) {
            // rulesArray.push(allRules[i].cssText)
            rulesArray=`${rulesArray}${allRules[i].cssText}`
        };
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
    let styleLocation = document.getElementsByTagName('head')[0];
    if (styleLocation.querySelector('#' + styleID)) {
        styleLocation.querySelector('#' + styleID).remove();
    }
    addNewStyle()
    function addNewStyle() {
        newStyleInHead = document.createElement('style');
        newStyleInHead.id = styleID;
        newStyleInHead.innerHTML = styleRule;
        styleLocation.append(newStyleInHead);
    }
}

function addRemoveRuleFromStyleSheet(CS_rule, ruleSelector, targetStyleSheet) {
    let highlightStrongsSheet = targetStyleSheet.sheet;
    let allRules = highlightStrongsSheet.cssRules;
    for (let i = 0; i < allRules.length; i++) {
        //Add rule if it doesn't exist
        if (findCSSRule(targetStyleSheet, ruleSelector) == -1) {
            targetStyleSheet.sheet.insertRule(CS_rule, allRules.length - 1);
        }
        //Remove rule if it already exists
        else {
            highlightStrongsSheet.deleteRule(findCSSRule(targetStyleSheet, ruleSelector));
            //Remove stylesheet if there are no more rules in it
            if (allRules.length == 0) {
                targetStyleSheet.remove()
            }
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

function changeFontSize(targetgroup, plusMinus, dis) {
    const chngrt = 1;//increament and decreament rate
    let currentSize;
    let sizesObj={
        'verse_text':'--fontsize-scripture',
        'main_font':'--fontsize-main',
        'ref_text':'--fontsize-ref',
        'strongs_tooltip':'--fontsize-strongstooltip',
        'bible_nav':'--fontsize-scripture-nav',
        'refnsrch':'--fontsize-refnsearch',
        'versionsbuttons':'--fontsize-versionsbuttons',
        'widthsidebuttons':'--width-sidebuttons',
        'search_n_compare_verses':'--fontsize-sidewindow-verses',
        'versenotes':'--fontsize-versenotes',
        'sub_headings':'--subheadings-fontsize'
    }
    const targ = sizesObj[targetgroup];
    currentSize = rootStyles.getPropertyValue(targ);
    currentSize = Number(currentSize.split('px')[0].trim());
    if (plusMinus == 'plus') {
        currentSize = (currentSize + chngrt);//before adding 'px'
        let decrease_fontsize = dis.closest('tr').querySelector('.decrease_fontsize');
        dis.setAttribute('fontsize',currentSize + chngrt);
        decrease_fontsize.setAttribute('fontsize',currentSize - chngrt);
        currentSize = currentSize + 'px';
    } else if (plusMinus == 'minus') {
        currentSize = (currentSize - chngrt);//before adding 'px'
        let increase_fontsize = dis.closest('tr').querySelector('.increase_fontsize');
        dis.setAttribute('fontsize',currentSize - chngrt);
        increase_fontsize.setAttribute('fontsize',currentSize + chngrt);
        currentSize = currentSize + 'px';
    }
    documentROOT.style.setProperty(targ, currentSize);
    styleLocalstorageSet()
}
function changeBackGround(defaultOrNot,newColor,targetgroup='--ref-img') {
    /* To Apply Color to Multiple CSS Variables */
    let brightnessAmt=0.1; //-1 <-> 1 (0.42==42%)
    /* Default Should Not Reset this  */
    if(document.body.matches('.darkmode') && defaultOrNot && document.head.querySelector('#darkmode')) {
        document.head.querySelector('#darkmode').remove();
    }
    if(document.body.matches('.darkmode') && !defaultOrNot){
        let darkModeElement_style = document.querySelector('.darkmode').style;
        darkModeElement_style.setProperty('--darkmode-bg1color', newColor);
        darkModeElement_style.setProperty('--buttons', pSBC(0.01,newColor));
    } else {
        for (let i = 2; i < arguments.length; i++) {
            if(arguments[i]=='--buttons'){
                documentROOT.style.setProperty(arguments[i], pSBC(brightnessAmt,newColor));
            } else {
                    documentROOT.style.setProperty(arguments[i], newColor);
            }
        }
    }
    styleLocalstorageSet()
}
function setColor(cssvar,c) {
    //BACKGROUND COLOR CHANGE
    if(cssvar=='--ref-img'){
        if(c=='default'){
            changeBackGround('default','url(images/background.jpg)','--ref-img','--buttons','--whitesmoke')
        } else {
            changeBackGround(null,c,'--ref-img','--buttons','--whitesmoke')
        }
        updateColorInColorPicker();
    }
    //OTHER COLORS CHANGE
    else {
        let darkModeElement = document.querySelector('.darkmode');
        if(c=='default'){
            if(darkModeElement){
                darkModeElement.style.removeProperty(cssvar);
            } else {
                documentROOT.style.removeProperty(cssvar, c);
            }
            updateColorInColorPicker();
        }
        else{
            if(darkModeElement){darkModeElement.style.setProperty(cssvar, c);}
            else{
                documentROOT.style.setProperty(cssvar, c);
                //Remove darmode colors which are set inline in the body.darkmode element
                removeDarkModeCssVariablesInBody();
            }
            updateColorInColorPicker();
        }
        styleLocalstorageSet()
    }
}
function checkColorToSet(n,ignore) {
    colorgroups.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active_button');
        btn.querySelector('input').checked = false;
    });
    //Check all others
    n.checked=true;
    n.closest('button').classList.add('active_button');

    /* ************************************************ */
    /* Set the Color of the Color Picker to the Current */
    /* ************************************************ */
    if(!ignore){
        let current_cssvariable_value = n.value;
        let colorValue = !document.body.matches('.darkmode') ? rootStyles.getPropertyValue(current_cssvariable_value):getComputedStyle(document.body).getPropertyValue(current_cssvariable_value);
        setcolor_input.value = (colorValue.startsWith('#')) ? colorValue.slice(0, 7) : rgbToHex(colorValue).slice(0, 7); //.slice(0, 7)--Remove the alpha (transparency), the last two characters
    }
    //Background
    else {
        let lightModeBGcolor = isValidColor(rootStyles.getPropertyValue('--ref-img').slice(0,7)) ? rootStyles.getPropertyValue('--ref-img').slice(0,7):n.getAttribute('default');
        lightModeBGcolor = rgbToHex(!document.body.matches('.darkmode')?lightModeBGcolor : getComputedStyle(document.body).getPropertyValue('--darkmode-bg1color')).slice(0,7);//.slice(0,7)--Remove the alpha (transparency), the last two characters
        setcolor_input.value = lightModeBGcolor;
    }
}
let setSite2Theme=true;
function styleLocalstorageSet() {
    let darkModeElement = document.querySelector('body.darkmode');
    if(darkModeElement){
        let darkmode_variableArray = [
            ['--darkmode-bg1color', darkModeElement.style.getPropertyValue('--darkmode-bg1color')],
            ['--buttons', darkModeElement.style.getPropertyValue('--buttons')]
            // ['--whitesmoke', getComputedStyle(darkModeElement).getPropertyValue('--whitesmoke')]
        ]
        arr_ColorGrpsCSSVariables.forEach(cg => {
            darkmode_variableArray.push([cg, darkModeElement.style.getPropertyValue(cg)])
        });
        setItemInLocalStorage('currentFontSizeSet', fontsizes.value);
        setItemInLocalStorage('darkmode_'+fontsizes.value, darkmode_variableArray);
        setItemInLocalStorage('darkmode_', darkmode_variableArray);
    }
    let variableArray = [
            ["--ref-img", rootStyles.getPropertyValue('--ref-img')],
            ["--fontsize-scripture", rootStyles.getPropertyValue('--fontsize-scripture')],
            ["--fontsize-ref", rootStyles.getPropertyValue('--fontsize-ref')],
            ["--fontsize-strongstooltip", rootStyles.getPropertyValue('--fontsize-strongstooltip')],
            ["--fontsize-scripture-nav", rootStyles.getPropertyValue('--fontsize-scripture-nav')],
            ["--main-font", rootStyles.getPropertyValue('--main-font').replace(/,/g,'|')],
            ["--fontsize-refnsearch", rootStyles.getPropertyValue('--fontsize-refnsearch')],
            ["--fontsize-main", rootStyles.getPropertyValue('--fontsize-main')],
            ["--fontsize-versionsbuttons", rootStyles.getPropertyValue('--fontsize-versionsbuttons')],
            ["--buttons", rootStyles.getPropertyValue('--buttons')],
            ["--width-sidebuttons", rootStyles.getPropertyValue('--width-sidebuttons')],
            ["--fontsize-sidewindow-verses", rootStyles.getPropertyValue('--fontsize-sidewindow-verses')],
            ["--fontsize-versenotes", rootStyles.getPropertyValue('--fontsize-versenotes')],
            ["--subheadings-fontsize", rootStyles.getPropertyValue('--subheadings-fontsize')],
            ["--darkmode-bg1color", rootStyles.getPropertyValue('--darkmode-bg1color')],
            ["--maxwidth-of-verses-per-row", rootStyles.getPropertyValue('--maxwidth-of-verses-per-row')]
        ]
    arr_ColorGrpsCSSVariables.forEach(cg => {variableArray.push([cg, rootStyles.getPropertyValue(cg)])});
    setItemInLocalStorage('currentFontSizeSet', fontsizes.value);

    // This is for site2 to determine the font Theme that is first loaded
    // It is also modifiable by site2 pages
    // So as not to affect whatever Theme has set in the site2 pages
    // BibleApp only modifies it on page load and will not change it every time its font-theme is changed
    // On starting up the app or reloading of BibleApp, all the pages will have the same Theme. However, once any is changed, site2 pages and BibleApp pages will only be in sync if the same Theme is manually selected for both. All site2 pages will, however, remain synced on reload and visiting of new pages.
    setSite2Theme?localStorage.setItem('site2_currentFontSizeSet',fontsizes.value):null;
    setSite2Theme=false;//to ensure it only changes it on page load or reload
    
    setItemInLocalStorage(fontsizes.value,variableArray); 
}
function loadfontsizes(fsIndx){
    if(stylesVariablesArray = localStorage.getItem(fontsizes.value)) {
        stylesVariablesArray = stylesVariablesArray.split(',');
        stylesVariablesArray.forEach((sVar, i) => {
            j = i + 2;
            if (j % 2 == 0) {
                document.querySelector(':root').style.setProperty(stylesVariablesArray[i], stylesVariablesArray[i + 1].replace(/\|/g,','));
            }
        });
    }else {
        colorgroups_SET_DEFAULTS()
    }
    // FOR DARKMODE COLORS
    if (document.body.classList.contains('darkmode')) {
        if (dmfv = localStorage.getItem('darkmode_'+fontsizes.value)) {
            const stylesVariablesArray = dmfv.split(/,(?![^()]*\))/g);// Split on comma, but not inside parentheses because of e.g., rgb(0,7,4)
            stylesVariablesArray.forEach((sVar, i) => {
                j = i + 2;
                if (j % 2 == 0) {
                    document.querySelector('.darkmode').style.setProperty(stylesVariablesArray[i], stylesVariablesArray[i + 1]);
                }
            });
        }
        else {
            colorgroups_SET_DEFAULTS()
        }
    } 
    function colorgroups_SET_DEFAULTS() {
        colorgroups.querySelectorAll('button').forEach(btn => {
            setColor(btn.querySelector('input').value,'default');
        });
    }
    styleLocalstorageSet();
    fontchange.value = documentROOT.style.getPropertyValue('--main-font').replace(/"/g,"'")//make font in fontchange the updated font 
    //Update #quickFontSizesSetChange buttons
    if(!fsIndx) {
        fsIndx = Number(fontsizes.value.replace(/fontsizes_/,'')) - 1;
    }
    if(xArr = document.querySelectorAll('#qfssc_1 .active_button, #qfssc_2 .active_button')){
        xArr.forEach(x => {x.classList.remove('active_button')});
    }
    if(typeof qfssc_1 !== 'undefined'){
        qfssc_1.querySelectorAll('button')[fsIndx].classList.add('active_button');
        qfssc_2.querySelectorAll('button')[fsIndx].classList.add('active_button');
    }
}
if (typeof homepage !== 'undefined') {
    document.addEventListener('keydown', function(evt) {
        if (evt.altKey && (evt.key === 'q'||evt.key === 'Q')) {
            evt.preventDefault();
            darkLightMode('changeTheme');
        }
    });
}
function quickFontSizesChange(n,dis) {
    let e=n;
    // A button in #quickFontSizesSetChange was clicked
    if (n && !e.target) {
        fontsizes.value = fontsizes[n-1].value;
        loadfontsizes(n-1);
    }
    else {
        // neither #togglenavbtn nor #sidemenubtn_rightbottom was right-clicked
        if(e){
            //.quickFontSizesSetChange (qfssc_1 or qfssc_2) was rightClicked, don't hide it
            if(e.button==2 && e.target.closest('.quickFontSizesSetChange')){
                return
            }
            //open bibleapp_cache
            else if((e.button==1 || (e.ctrlKey && e.button==0)) && e.target.closest('.quickFontSizesSetChange') && e.target.matches('.active_button')){hideRefNav(null, bibleapp_cache)}
            //open search window on rightclick of search button or searchsettings button
            else if ([1,2].includes(e.button) && e.target.matches('#titlebar_show_searchsettings,#forwordsearch')){hideRefNav(null, searchPreviewWindowFixed)}
            
            if(typeof qfssc_1 !== 'undefined'){
                qfssc_1.classList.add('displaynone');
                qfssc_2.classList.add('displaynone');
            }
        }
        // #togglenavbtn or #sidemenubtn_rightbottom was right-clicked
        else {
            if((document.activeElement).closest('.quickFontSizesSetChange')){return}
            dis.classList.toggle('displaynone');
            let qfssc_x = dis==qfssc_1?qfssc_2:qfssc_1;
            qfssc_x.classList.add('displaynone');
        }
    }
}
document.addEventListener('mouseup',quickFontSizesChange);
function darkLightMode(dl,skip) {
    if (dl) {
        stopScrolling();
        if (dl=='lightmode') {
            button_image_color.setAttribute('colormode','darkmode')
            let allBtnImgs = document.querySelectorAll('button > img, img.dmalterable')
            allBtnImgs.forEach(img=>{img.src = img.src.replace(/-DarkMode\.svg/, '.svg')})
        } else if(dl=='darkmode'){
            button_image_color.setAttribute('colormode','lightmode')
            let allBtnImgs = document.querySelectorAll('button > img, img.dmalterable')
            allBtnImgs.forEach(img=>{img.src = img.src.replace(/\.svg/, '-DarkMode.svg')})
        }
        else if (dl=='changeTheme'){
            let fontsizes_set = ['fontsizes_1','fontsizes_2','fontsizes_3','fontsizes_4'];
            let currentFontSizeSet = localStorage.getItem('currentFontSizeSet');
            let n = Number(currentFontSizeSet.replace(/fontsizes_/,''));
            n = (n==fontsizes_set.length)?0:n;
            fontsizes.value = fontsizes[n].value;
            loadfontsizes(n);
            modifyRefNavChildrenHeight();
        }
    }
    else {
        stopScrolling();
        if (document.body.classList.contains('darkmode') && !skip) {
            document.body.classList.remove('darkmode')
            typeof darkmodebtn!='undefined'?darkmodebtn.innerText = '🌤':null
            let allBtnImgs = document.querySelectorAll('button > img, img.dmalterable')
            allBtnImgs.forEach(img=>{img.src = img.src.replace(/-DarkMode\.svg/, '.svg')})
            localStorage.removeItem('darkmode');
            //Remove darmode colors which are set inline in the body.darkmode element
            removeDarkModeCssVariablesInBody();
        } else {
            document.body.classList.add('darkmode')
            typeof darkmodebtn!='undefined'?darkmodebtn.innerText = '🌑':null;
            let allBtnImgs = document.querySelectorAll('button > img, img.dmalterable')
            allBtnImgs.forEach(img=>{img.src = img.src.replace(/\.svg/, '-DarkMode.svg')})
            setItemInLocalStorage('darkmode', 'true');
            //Get colors saved for darkmode in localstorage
            if (document.querySelector('.darkmode') && localStorage.getItem('darkmode_'+fontsizes.value)) {
                const stylesVariablesArray = localStorage.getItem('darkmode_'+fontsizes.value).split(/,(?![^()]*\))/g);// Split on comma, but not inside parentheses because of e.g., rgb(0,7,4)
                stylesVariablesArray.forEach((sVar, i) => {
                    j = i + 2;
                    if (j % 2 == 0) {
                        document.querySelector('.darkmode').style.setProperty(stylesVariablesArray[i], stylesVariablesArray[i + 1]);
                    }
                });
            }
        }
        typeof darkmodebtn!='undefined'?updateColorInColorPicker():null;
    }
}
function removeDarkModeCssVariablesInBody() {
    const bodyStyles = document.body.style.cssText.split(';');
    let newStyle='';
    bodyStyles.forEach(styl => {!styl.match(/\s*--/)?(newStyle+=`${styl};`):null;});
    newStyle = newStyle.replace(/;;/,';');
    newStyle = newStyle==';'?'':null;
    // document.body.setAttribute('style',newStyle);
    document.body.style.cssText = newStyle;
}
function updateColorInColorPicker() {colorgroups.querySelector('.active_button').click();}

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
function setMaxNumOfVersesPerRow(n) {
    let n_num = Number(n.id.split('_')[1]);
    const maxWidth = `${100/n_num}%`;
    //Uncheck all others
    columnsperverse.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active_button')
        btn.querySelector('input').checked = false;
    });
    //Check all others
    n.checked=true;
    n.closest('button').classList.add('active_button')
    documentROOT.style.setProperty('--maxwidth-of-verses-per-row', maxWidth);
    styleLocalstorageSet()
}
let arr_ColorGrpsCSSVariables = [];
if (document.body.matches('#homepage')) {
    eng2grk_sup_table.addEventListener('click',showHideTransliterationSection)
    bibleapp_cache.addEventListener('click',toggle_Details)
    function toggle_Details(e) {
        if(e.target.matches('#bibleapp_cache > details summary, #shortcutkeys_list summary')){
            let et = e.target;
            et = et.closest('details');
            if(!et.open){
                bibleapp_cache.querySelectorAll('#bibleapp_cache > details[open], #shortcutkeys_list details[open]').forEach(details => {et!=details ? details.open=false:null;});
            }
        }
    }
    colorgroups.querySelectorAll('button').forEach(btn => {
        btn.matches('.ignore') ? null : arr_ColorGrpsCSSVariables.push(btn.querySelector('input').value);
    });
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
function engnXlit_supscript(x) {
    if (x == 'eng') {
        let eng2grk_style = `.verse:not(.v_accented) .eng2grk::after{
            content: attr(translation);
            font-size: 75%;
            line-height: 0;
            position: relative;
            vertical-align: baseline;
            top: -0.35em;
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
            changeElmTextNodeTo(show_hebgrk_superscript,'OFF');
        } else {
            createNewStyleSheetandRule('xlitofhebngrk', eng2grk_style);
            changeElmTextNodeTo(show_hebgrk_superscript,'ON');
        }
    }
}
// document.addEventListener('keydown', showEnglishTranslationOfHGtransliteration);

/* \/\/\/\\/\/\/\/\/\/\\/\/\/\/\/\/\/\//\/\/\/\/\/\/\/\/\/\/\/\/\/\\/\/\/\ */
/* \/\/\/\\/\/\/\/\/\/\\/\/\/\/\/ BOOK MARKS /\/\/\/\/\/\/\/\/\/\/\\/\/\/\ */
/* \/\/\/\\/\/\/\/\/\/\\/\/\/\/\/\/\/\//\/\/\/\/\/\/\/\/\/\/\/\/\/\\/\/\/\ */
if(document.body.matches('#homepage')){
    pagemaster.addEventListener("dblclick",highlight_N_bookmark_verse);
    bookmarks_holder.addEventListener("click",getBookmarkRef)
}
let bookMarkedVersesArr=[];
function highlight_N_bookmark_verse(e){
    if (e.target.matches('.vmultiple .verse')) {
        if(e.target.parentElement.matches('.vmultiple:not(.v_dblclckd)')){
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
            bookMarkedVersesArr.push(vref);//remove ref from array
            setItemInLocalStorage('bookmarks',bookMarkedVersesArr)
            // bookmarks_holder.classList.remove('displaynone');
        } else if(e.target.parentElement.matches('.v_dblclckd')){
            e.target.parentElement.classList.remove('v_dblclckd');
            /* **************** */
            /* Remove Book Mark */
            /* **************** */
            let vref=e.target.querySelector('code[ref]').getAttribute('ref');
            bookmark_content.querySelector(`[ref="${vref}"]`).remove();
            bookMarkedVersesArr.splice(bookMarkedVersesArr.indexOf(vref),1);//remove ref from array
            setItemInLocalStorage('bookmarks',bookMarkedVersesArr);
        }
        // loadBookmarksFromCache(bookMarkedVersesArr)
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
document.addEventListener('click', function (e) {
    if(!e.target.matches('#bookmarks_holder, #bookmarks_holder *') && document.querySelector('#bookmark_content') && bookmark_content.matches('.displayblock')){
        bookmark_content.classList.remove('displayblock')
        bookmarks_holder.classList.remove('showing_bookmarks');
    } 
})

function loadBookmarksFromCache(arr){
    bookMarkedVersesArr=arr;
    //reverse the arr to start from the most recently added bookmark to the oldest
    bookmark_content.innerHTML='';
    arr.forEach(vref => {
        let newBookMark=createNewElement('li');
        newBookMark.setAttribute('ref',vref);
        newBookMark.innerText=vref;
        bookmark_content.prepend(newBookMark);
    });
}