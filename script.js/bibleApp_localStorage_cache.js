//Settings under refnav.
// cache_strongs.addEventListener('change', function () {
//     if (this.checked) {
//         localStorage.removeItem('transliteratedWords')
//     }
// });
// cache_higlights.addEventListener('change', function () {
//     if (this.checked) {
//         localStorage.removeItem('strongsHighlightStyleSheet')
//     }
// });
let defaultReference; //For browser history
versionsToBeLoaded = ['KJV','ESV','NIV84','ABP-en','ABP-gr','NKJV','NET'];

function cacheFunctions() {
    versionsToShow2 = versionsToShow;
    if (localStorage.getItem('versionsToShow')) {
        let versionsToDisplay = localStorage.getItem('versionsToShow').split(',');
        versionsToShow = versionsToDisplay;
        versionsToShow2 = versionsToShow;
    }
    else if(pppVM=ppp.querySelector('.vmultiple')){

        // If there is a loaded page already
        versionsToShow = [];
        pppVM.querySelectorAll('.vmultiple .verse:not(._localcompare_v)').forEach(bv=>{
            let vCls = bv.classList;
            for (var i = 0; i < vCls.length; i++) {
                if (vCls[i].startsWith("v_")) {
                    const versionName = vCls[i].substring(2);
                    allLoadableVersions.includes(versionName) ? versionsToShow.push(versionName) : null;
                }
            }
        })
        versionsToShow2 = versionsToShow;
    }
    else {
        versionsToShow = ['KJV','ESV'];
        versionsToShow2 = versionsToShow;
    }
    versionsToShow = versionsToShow.filter(item => allLoadableVersions.includes(item));
    versionsToShow2 = versionsToShow;
    /* LOAD SAVED BIBLE VERSIONS */
    if (localStorage.getItem('loadedBibleVersions')) {
        let versionsToBeLoaded = removeDuplicatesIgnoreCase(localStorage.getItem('loadedBibleVersions').replace(/NIV.84/,'NIV84').split(',').concat(versionsToShow)).filter(item => allLoadableVersions.includes(item));
        localStorage.getItem('loadedBibleVersions',versionsToBeLoaded);
        versionsToBeLoaded.forEach(version => {
            versionID = version + '_version';
            //To indicate the book has been loaded
            document.querySelector('#' + versionID).checked = true;
            loadVersion(version); //To load the book
        });
    }
    /* Load the versions in "versionsToShow" as default translation(s) if there is no previously selected version */
    else {
        //To indicate the book has been loaded
        //To load the book
        versionsToBeLoaded = removeDuplicatesIgnoreCase(versionsToBeLoaded.concat(versionsToShow));
        localStorage.getItem('loadedBibleVersions',versionsToBeLoaded);
        versionsToBeLoaded.forEach((versionName,i)=>{
            if(allLoadableVersions.includes(versionName)){
                document.querySelector(`#${versionName}_version`).checked = true;
                loadVersion(versionName);
            } else {
                versionsToBeLoaded.splice(i, 1);
                localStorage.setItem('loadedBibleVersions',versionsToBeLoaded);
            }
        });
    }
    if (shstylsht = localStorage.getItem('strongsHighlightStyleSheet')) {
        let headPart = document.getElementsByTagName('head')[0];
        newStyleInHead = document.createElement('style');
        newStyleInHead.id = 'highlightstrongs';
        // shstylsht = shstylsht.replace(/0px\s*1px\s*6px\s*-2px\s*!\s*important/g,'0 0 1px') 
        // shstylsht = shstylsht.replace(/box-shadow:\s*0(?:px)*\s*0(?:px)*\s*1px\s*(?:!important)*/g,'box-shadow:0 0 1px!important') 
        newStyleInHead.innerHTML = shstylsht;
        headPart.append(newStyleInHead);
    }
    if (localStorage.getItem('showVersesInSearch')) {
        let showVerseCheck = localStorage.getItem('showVersesInSearch');
        if (showVerseCheck == 'yes') {
            showreturnedverses.check = true
        } else if (showVerseCheck == 'no') {
            showreturnedverses.checked = false
        }
    }

    if (localStorage.getItem('currentFontSizeSet')&&localStorage.getItem(localStorage.getItem('currentFontSizeSet'))) {
        fontsizes.value = localStorage.getItem('currentFontSizeSet');
        loadfontsizes();
        cache_table.querySelectorAll('td > button').forEach(btn => {btn.click()});
    }
    /* THIS WILL ONLY RUN THE FIRST TIME THE APP IS EVER RUN */
    /* It will set default Themes */
    if(!localStorage.getItem('defaultThemesAllSet')) {
        // See also "api.getSavedPageContent()"
        const fs1 = '--ref-img,#fbf7ef,--fontsize-scripture,28px,--fontsize-ref,23px,--fontsize-strongstooltip,35px,--fontsize-scripture-nav,18px,--main-font,Calibri| sans-serif,--fontsize-refnsearch,12px,--fontsize-main,15px,--fontsize-versionsbuttons,20px,--buttons,#e9e5df,--width-sidebuttons,40px,--fontsize-sidewindow-verses,26px,--fontsize-versenotes,28px,--darkmode-bg1color,#000000,--maxwidth-of-verses-per-row,25%,--vhlt3,#fff6aa,--vhlt4,#fffac884,--chpt,#e6d7b7,--translated-word,#471d00';
        const fs2 = '--ref-img,#f0f3f4,--fontsize-scripture,39px,--fontsize-ref,19px,--fontsize-strongstooltip,27px,--fontsize-scripture-nav,15px,--main-font,Calibri| sans-serif,--fontsize-refnsearch,9px,--fontsize-main,16px,--fontsize-versionsbuttons,16px,--buttons,#dbd6c8,--width-sidebuttons,29px,--fontsize-sidewindow-verses,38px,--fontsize-versenotes,39px,--darkmode-bg1color,#020717,--maxwidth-of-verses-per-row,25%,--vhlt3,#fff6aa,--vhlt4,#fffac884,--chpt,#d7ccc8,--translated-word,#5c2e2e';
        const fs3 = '--ref-img,#f7f7e8,--fontsize-scripture,23px,--fontsize-ref,17px,--fontsize-strongstooltip,21px,--fontsize-scripture-nav,17px,--main-font,Cambria|Cochin|Times|"Times New Roman"|serif,--fontsize-refnsearch,10px,--fontsize-main,16px,--fontsize-versionsbuttons,14px,--buttons,#e5ddd4,--width-sidebuttons,26px,--fontsize-sidewindow-verses,18px,--fontsize-versenotes,23px,--darkmode-bg1color,#0a0a0a,--maxwidth-of-verses-per-row,25%,--vhlt3,#fff6aa,--vhlt4,#fffac884,--chpt,#d0b290,--translated-word,#01003d';
        const fs4 = '--ref-img,url(images/background.jpg),--ref-img,#ebecef,--fontsize-scripture,21px,--fontsize-ref,13px,--fontsize-strongstooltip,21px,--fontsize-scripture-nav,16px,--main-font,system-ui| -apple-system| BlinkMacSystemFont| "Segoe UI"| Roboto| Oxygen| Ubuntu| Cantarell| "Open Sans"| "Helvetica Neue"| sans-serif,--fontsize-refnsearch,11px,--fontsize-main,19px,--fontsize-versionsbuttons,18px,--buttons,#f8f8f8,--width-sidebuttons,33px,--fontsize-sidewindow-verses,21px,--fontsize-versenotes,21px,--darkmode-bg1color,#0a0005,--maxwidth-of-verses-per-row,25%,--vhlt3,#fff6aa,--vhlt4,#fffac884,--chpt,#d7ccc8,--translated-word,#211d1c';
        const fs1_drk = '--darkmode-bg1color,,--buttons,,--vhlt3,rgb(8,4,0),--vhlt4,#0f0f10,--chpt,#08443d,--translated-word,';
        const fs2_drk = '--darkmode-bg1color,#0a0a0b,--buttons,#1b1b1c,--vhlt3,rgb(8,4,0),--vhlt4,#2a323fed,--chpt,,--translated-word,';
        const fs3_drk = '--darkmode-bg1color,#1b1918,--buttons,#252423,--vhlt3,#000000,--vhlt4,#12161c,--chpt,#27282b,--translated-word,';
        const fs4_drk = '--darkmode-bg1color,#000000,--buttons,#1a1a1a,--vhlt3,rgb(8,4,0),--vhlt4,#111318,--chpt,#5d4037,--translated-word,';
        const themes_sets = {'fontsizes_1':fs1,'fontsizes_2':fs2,'fontsizes_3':fs3,'fontsizes_4':fs4,'darkmode_fontsizes_1':fs1_drk,'darkmode_fontsizes_2':fs2_drk,'darkmode_fontsizes_3':fs3_drk,'darkmode_fontsizes_4':fs4_drk,'currentFontSizeSet':'fontsizes_4'}
        for (const fs in themes_sets) {if(!localStorage.getItem(fs)){localStorage.setItem(fs,themes_sets[fs])};}//Done this way because of those who already have the app installed and may already have some theme set
        localStorage.setItem('defaultThemesAllSet', 'true');
    }
    if (kso=localStorage.getItem('keepsearchopen')) {
        keepsearchopen.checked=kso;
    }
    if (bkm_arr=localStorage.getItem('bookmarks')) {
        bkm_arr=bkm_arr.split(',');
        // if(bkm_arr.length>0){bookmarks_holder.classList.remove('displaynone');}
        loadBookmarksFromCache(bkm_arr);
    }
    if (defNotesFolder=localStorage.getItem('default_notes_folder')) {
        notesFolder=defNotesFolder;
        if(defNotesFolder=='bible_notes'){
            nfolder_psam_check.checked=true;
            notesFolder='bible_notes';
            setDefVNFolder('psam')
        }
        else{
            nfolder_user1_check.checked=true;
            notesFolder='bible_notes_user1';
            setDefVNFolder('user1')
        }
    } else {
        notesFolder='bible_notes';
        nfolder_psam_check.checked=true;
        setDefVNFolder('psam')
    }
    findAllBookChptnVersesWithNote()
    
    if (strongsAnalysisOnly_cache = localStorage.getItem('strongsAnalysisOnly_cache')) {
        strongsAnalysisOnly.checked = strongsAnalysisOnly_cache=='true' ? true : false;
        t_strongsAnalysisOnly.checked = strongsAnalysisOnly_cache=='true' ? true : false;
    }
    if (bvn=localStorage.getItem('bversionName')) {bversionName=bvn;}
    if (localStorage.getItem('eng2grk_sup_checkboxes')) {
        const eng2grk_sup_checkboxes = localStorage.getItem('eng2grk_sup_checkboxes').split(',');
        eng2grk_sup_checkboxes.forEach((x,i)=>{
            if((i==0)||(i%2==0)){
                let currentChkbx = document.querySelector('#'+x);
                if((eng2grk_sup_checkboxes[i+1]=='true')){
                    const parentBtn=elmAhasElmOfClassBasAncestor(currentChkbx, 'button');
                    parentBtn.classList.add('active_button');
                    if(parentBtn==show_eng_superscript){engnXlit_supscript('eng')}
                    else if(parentBtn==show_hebgrk_superscript){engnXlit_supscript('hebgrk')}
                    else if(parentBtn==center_settings_h){centerNavigationAndOtherSettings('h')}
                    else if(parentBtn==center_settings_v){centerNavigationAndOtherSettings('v')}
                    else if(parentBtn==center_settings_r){centerNavigationAndOtherSettings('r')}
                    else if(parentBtn==center_settings_o){centerNavigationAndOtherSettings('o')}
                    else if(parentBtn==center_settings_b){centerNavigationAndOtherSettings('b')}
                    else if(currentChkbx==show_versenote_totheright_check){
                        show_versenote_totheright_check.checked=true;
                        show_versenote_totheright_2_check.checked=true
                        setTimeout(() => {modifyRefNavChildrenHeight()}, 100);
                    }
                    else if (parentBtn==hl_hoveredversion || parentBtn==hl_highlightwordswithsamestrongs){
                        setTimeout(() => {parentBtn.click()}, 200);
                    }
                    else {currentChkbx.checked=true;}
                }
                else {
                    currentChkbx.checked=false;
                    parentBtn=elmAhasElmOfClassBasAncestor(currentChkbx, 'button');
                    parentBtn.classList.remove('active_button');
                    // parentBtn.click()
                }
            }
        })    
    } else {
        if(isMobileDevice){
            center_settings_v_check.checked=true;
            centerNavigationAndOtherSettings('v')
        }
        setTimeout(() => {hl_highlightwordswithsamestrongs.click()}, 200); // if first time running window, enable highlighting of same strong's numbers
    }
    // For Darkmode
    if (localStorage.getItem('darkmode')) {document.body.matches('.darkmode')?(darkLightMode(),darkLightMode()):darkLightMode();}
    else {updateColorInColorPicker()}
    if (document.querySelector('.darkmode') && localStorage.getItem('darkmode_'+fontsizes.value)) {
        const stylesVariablesArray =localStorage.getItem('darkmode_'+fontsizes.value).split(/,(?![^()]*\))/g); // Split on comma, but not inside parentheses
        stylesVariablesArray.forEach((sVar, i) => {
            j = i + 2;
            if (j % 2 == 0) {document.querySelector('.darkmode').style.setProperty(stylesVariablesArray[i], stylesVariablesArray[i + 1]);}
        });
    }
    // Note Detaching
    if((ndc = localStorage.getItem('notedetach_check')) && ndc=='true'){detachInlineVerseNote()}
}

let visitedRefsBack=[];
let visitedRefsFront=[];

async function cacheFunctions2() {
    runCacheFunc2 = false;
    for (let i = 0; i < versionsToShow.length; i++) {
        const versionName = versionsToShow[i];
        let bv = document.querySelector('[bversion="' + versionName + '"]');
        !lastClickedVerse ? await getHighestVisibleH2() : null;
        bv.classList.add('activationDeactivationReady');
        setActiveBibleVersionsasync({target:bv});
    }
    if(lastRef=localStorage.getItem('lastRef')){
        if(!ignoreLastRef){gotoRef(lastRef,false)};
        currentRef=lastRef;
        reference.value=lastRef;
        if(vrefBack=localStorage.getItem('visitedRefsBack')){
            visitedRefsBack=vrefBack.split(',');
        }
        if(vrefFront=localStorage.getItem('visitedRefsFront')){
            visitedRefsFront=vrefFront.split(',');
        }
        refHistoryNavigate();//Disable or Enable refhistory buttons (when no parameter is supplied)
    }
    else {if (localStorage.getItem('lastBookandChapter')) {
        lastOpenedBook = localStorage.getItem('lastBookandChapter').split(',')[0];
        lastOpenedChapter = localStorage.getItem('lastBookandChapter').split(',')[1];
    }
    /* Default chapter Gen 1 */
    else {
        lastOpenedBook = 'book_1';
        lastOpenedChapter = 'bk1ch1';
    }
    document.querySelector('.bkname[value="' + lastOpenedBook + '"]').click()
    getTextOfChapter(bible_chapters.querySelector('.chptnum[value="' + lastOpenedChapter + '"]'));
    defaultReference = lastOpenedBook + ' ' + lastOpenedChapter;}
    if (localStorage.getItem('transliteratedWords')) {
        transliteratedWords_Array = localStorage.getItem('transliteratedWords').split(',');
        transliteratedWords_Array.forEach(storedStrnum => {
            if(/G|H\d+/i.test(storedStrnum)){
                showTransliteration(storedStrnum)
            }
        });
    }
    // if( x = localStorage.getItem('cmenu_backwards_navigation_arr')){
    //     cmenu_backwards_navigation_arr
    // }
}

function setItemInLocalStorage(name, nValue) {
    let cache_strongs=document.querySelector('#cache_strongs');
    let cache_higlights=document.querySelector('#cache_higlights');
    if (name == 'transliteratedWords' && (!cache_strongs||!cache_strongs.checked)) { //check if in the settings saving to cache for the transliteration words is selected
        localStorage.setItem(name, nValue);
    } else if (name == 'strongsHighlightStyleSheet' && (!cache_higlights||!cache_higlights.checked)) {
        localStorage.setItem(name, nValue);
    } else {
        localStorage.setItem(name, nValue);
    }
}
// Get LocalStorage Data as JSON to Transfer LocalStorage To App in Another Browser
// var parsedData = JSON.parse(data);
// for(var key in parsedData){localStorage.setItem(key,parsedData[key]);}
