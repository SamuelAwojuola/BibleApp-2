/* FOR GENERATING GETTING AND APPENDING CROSSREFERNCES (TSK) OF VERSES THAT HAVE THEM */
let bversionName = 'KJV';//Default bible version
let onChangeOfbversionName = function(new_bversionName) {
  bversionName = new_bversionName;
  setItemInLocalStorage('bversionName',new_bversionName)
};
let moveableBibleVersion = bversionName;
let bversionNameChange = {
  _value: bversionName, // Private variable
  get value() {return this._value;},
  set value(new_bversionName) {
    this._value = new_bversionName;
    onChangeOfbversionName(new_bversionName); // Call the callback function when the value changes
  },
};
//bversionNameChange.value='KJV';

if(document.querySelector('#homepage')){
    document.addEventListener('click', debounce(appendCrossReferences));
    document.addEventListener('dblclick', appendCrossReferences);
    document.addEventListener('contextmenu', appendCrossReferences);
    document.addEventListener('keyup', appendXref_with_keyX);
    searchTSKonX();
    function appendXref_with_keyX(e) {
        let kdwn = !document.querySelector('.keydownready') || document.querySelector('.keydownready:is(.slideoutofview,.displaynone,.slideoutofview *,.displaynone *,:not(:hover))') ? false : true;
        if(e.key=='x' && (!e.ctrlKey && !e.altKey && !e.shiftKey) && !document.activeElement.closest('input, [contenteditable="true"], #context_menu') && !kdwn && lastClickedVerse){
            const prvlastClickedVerse = lastClickedVerse;
            appendCrossReferences({target:lastClickedVerse.matches('.verse')?lastClickedVerse:lastClickedVerse.querySelector('.verse'), callorigin:'x'})
            setTimeout(() => {lastClickedVerse = prvlastClickedVerse;}, 300);
        }
    }
    function searchTSKonX() {
        let vTarg;
        refnav_col2.addEventListener('mouseover', add_TSKbyX);
        refnav_col2.addEventListener('mouseout', remove_TSKbyX);
        function add_TSKbyX(e) {
            if(e.target.closest('.context_menu')){return};
            if(e.target.matches('#searchPreviewWindowFixed .verse, #searchPreviewWindowFixed .verse *, #scriptureCompare_columns_holder .verse, #scriptureCompare_columns_holder .verse *')){
                vTarg = e.target.closest('.verse');
            }
            document.addEventListener('keydown', _TSKbyX);
        }
        function remove_TSKbyX(e) {
            if(e.target.matches('#searchPreviewWindowFixed .verse, #searchPreviewWindowFixed .verse *, #scriptureCompare_columns_holder .verse, #scriptureCompare_columns_holder .verse *')){
                vTarg = e.target.closest('.verse');
            }
            document.removeEventListener('keydown', _TSKbyX);
        }
        function _TSKbyX(e) {
            if(e.key=='x' && (!e.ctrlKey && !e.altKey && !e.shiftKey) && !document.activeElement.matches('input, [contenteditable="true"]')  && vTarg){
                appendCrossReferences({target:vTarg.querySelector('.verse_crossref_button'), callorigin:'x'})
                e.preventDefault();
            }
        }
    }
    /* ****** ******* ***** ******* */
    /* CHANGE CURRENT BIBLE VERSION */
    /* ****** ******* ***** ******* */
    main.addEventListener('mousedown', getCurrentBVN);
    bibleversions_btns.addEventListener('contextmenu', getCurrentBVN, { passive: false });
}
else if(versenotepage = document.querySelector('body#versenotepage')){
    versenotepage.addEventListener('click', appendCrossReferences);
}

function getCurrentBVN(e) {
    let eTarget = e.target;
    let classesOfe = null;
    //right-clicked on a version button
    if (etBV=eTarget.getAttribute('bversion')){
        bversionNameChange.value=etBV;// getBVN
    }
    //clicked on a verse
    else if (et=eTarget.closest('.verse')){
        classesOfe = et.classList;
        bversionNameChange.value=Array.from(classesOfe).find(c=>c.startsWith('v_')).replace(/v_/,'');// getBVN
    }

    if(versionsToShow2.includes(bversionNameChange.value)){moveableBibleVersion=bversionNameChange.value;}

}
let showXrefSections=true;
function showORdisplaynoneXrefSections(xrf,isC) {
    if(arguments.length==2){
        !isC ? xrf.classList.add('displaynone') : xrf.classList.remove('displaynone');
    } else {
        showXrefSections ? xrf.classList.remove('displaynone','ignore_displaynone') : xrf.classList.add('displaynone');
    }
    return xrf
}
function appendCrossReferences(e) {
    /* On rightclick of xref button in code, toggle showXrefSections */
    if(e.type=='contextmenu' && e.target.closest('.verse code[ref] #verse_crossref_button')){
        showXrefSections==true?showXrefSections=false:showXrefSections=true;
        refnav.querySelectorAll('.verse:not(.contextmenu .verse) .crfnnote').forEach(crfnnoteDIV => {showORdisplaynoneXrefSections(crfnnoteDIV);});
        return
    }
    if(e.type=='contextmenu' && !e.target.matches('.vmultiple code[ref]') && !e.target.closest('#refnav')){return}
    if (!e.target || e.target.matches('#singleverse_compare_menu button') || (!e.target.matches('[bversion], #verse_crossref_button, .verse_crossref_button') && !((e.shiftKey||e.callorigin=='x') && e.target.matches('.verse, .crfnnote *'))) && !((e.type=='dblclick' && e.target.matches('.verse code[ref]')) || (e.type && !!windowsSelection()?.collapsed) && e.target.matches('.context_menu .verse code[ref]')) && !(e.type=='contextmenu' && e.target.matches('.vmultiple code[ref]'))) {
        return
    }

    if(e.target.closest('.context_menu code[ref], .context_menu code[ref] .verse_crossref_button') || (e.type=='dblclick' && e.target.matches(':is(.context_menu,#refnav) .verse code[ref]'))){
        const crfnnote = e.target.closest('.verse').querySelector('.crfnnote');
        const crfnnote_displayedNone = crfnnote.classList.contains('displaynone');
        const xrefs_sld_up = (!crfnnote.querySelector('.crossrefs') || crfnnote.querySelector('.crossrefs.sld_up'));
        
        if(crfnnote_displayedNone){//show [xref btn, notebtn and versions btns] and [crossrefs div]
            crfnnote.classList.remove('displaynone');//show cmenu xref section
            if (e.type=='dblclick') {
                const vcb = crfnnote.querySelector('.verse_crossref_button');
                // xrefs_sld_up ? vcb.click() : null;
                xrefs_sld_up ? vcb.dispatchEvent(new MouseEvent('dblclick', {bubbles: true,cancelable: true,view: window})) : null;
            }
            return
        }
        else if (xrefs_sld_up){//show [crossrefs div] if [xref btn, notebtn and versions btns] is showing
            if (e.type=='click'){//show [crossrefs div] if [xref btn, notebtn and versions btns] is showing
                crfnnote.classList.add('displaynone');
            }
            else if (e.type=='dblclick'){//show [crossrefs div] if [xref btn, notebtn and versions btns] is showing
                const vcb = crfnnote.querySelector('.verse_crossref_button');
                // vcb.click();
                vcb.dispatchEvent(new MouseEvent('dblclick', {bubbles: true,cancelable: true,view: window}));
            }
        }
        else {
            const anim_t = slideUpDown(crfnnote.querySelector('.crossrefs'));
            // if(e.type=='dblclick' && typeof context_menu !== 'undefined' && !context_menu.matches('.showingXref')){
            //     const t = setTimeout(() => {crfnnote.classList.add('displaynone'); clearTimeout(t)}, anim_t+50);
            // }
        }
        
        return
    }
    let eTarget;//Holds the 'ref' attribute;
    let masterVerseHolder; //For indicating if crossrefs are being shown and for finding nextSibling to append the crossrefs to
    let refCode;
    let vHolder; //Element to append after
    const vRcRbT = e.target.closest('#verse_crossref_button');
    let crfnnoteHolder = e.target.closest('.crfnnote');
    
    crfnnoteHolder = crfnnoteHolder ? crfnnoteHolder : (vRcRbT ? vRcRbT.closest('.vmultiple,.verse').querySelector('.verse .crfnnote'):null);
    
    if(mVH=e.target.closest('.vmultiple')){
        const prvlastClickedVerse = lastClickedVerse;
        masterVerseHolder = mVH;
        eTarget = mVH.hasAttribute('ref') ? mVH : mVH.querySelector('[ref]');//What I need is the ref
        /* if(e.target.matches('#verse_crossref_button')){eTarget = e.target.parentNode.parentNode;}
        else if(e.target.matches('#verse_crossref_button a')){eTarget = e.target.parentNode.parentNode.parentNode;}
        else if(e.shiftKey && e.target.matches('.vmultiple .verse')){eTarget=e.target.querySelector('code[ref]')}
        else if(e.callorigin&&e.callorigin=='x'){eTarget=e.target.querySelector('code[ref]');} */
        refCode = eTarget.getAttribute('ref');
        
        let siblingCrossREF = masterVerseHolder.nextElementSibling;
        let anim_t;
    
        //Only Append Crossrefs If It Doesn't Already Have Crossrefs
        if (siblingCrossREF==null || siblingCrossREF==undefined || !siblingCrossREF.matches('.crossrefs, .crossrefs_holder')) {
            masterVerseHolder.classList.add('showing_crossref')
            vHolder = masterVerseHolder;
            if (refCode){
                siblingCrossREF = generateCrossRefsFromRefCode(refCode);
                const crossrefs = siblingCrossREF;
                if(!siblingCrossREF){return}
                // Create the new parent element
                var crossrefs_holder = document.createElement('div');
                crossrefs_holder.classList.add('crossrefs_holder');
                siblingCrossREF.parentNode.replaceChild(crossrefs_holder, siblingCrossREF);// Replace the original element with the new parent element in the DOM
                crossrefs_holder.appendChild(siblingCrossREF);// Append the original element to the new parent element
                siblingCrossREF.style.zIndex = -1;
                dontGetLastVerse=true;
                setTimeout(() => {anim_t = slideUpDown(crossrefs)}, 1);
                setTimeout(()=>{
                    crossrefs.scrollIntoView({behavior:"smooth",block:"nearest"});
                    dontGetLastVerse=false;
                },300);
            }
        } else {
            dontGetLastVerse=true;
            anim_t = slideUpDown(siblingCrossREF.querySelector('.crossrefs'));
            setTimeout(() => {
                masterVerseHolder.classList.remove('showing_crossref');
                siblingCrossREF.matches('.crossrefs, .crossrefs_holder') ? siblingCrossREF.remove() : null;
            }, 300);
            
        }
        setTimeout(() => {
            lastClickedVerse = prvlastClickedVerse;
            // getHighestVisibleH2();
            dontGetLastVerse=false;
        }, anim_t>300?anim_t:300);
    }
    /* FOR SEARCHRESULT WINDOW */
    else if (crfnnoteHolder){
        if (e.target.closest('.crfnnote') && crfnnoteHolder.classList.contains('displaynone')) {crfnnoteHolder.classList.add('ignore_displaynone');}else if(e.target.closest('#verse_crossref_button')){setTimeout(() => {crfnnoteHolder.classList.remove('ignore_displaynone')}, 100);}
        verseInSearchWindow = e.target.closest('.verse');
        refCode = verseInSearchWindow.querySelector('[ref]').getAttribute('ref');
        vHolder = crfnnoteHolder.querySelector('.crfnnote_btns');
        if(siblingCrossREF = crfnnoteHolder.querySelector('.crossrefs')){
            // If hidden show it
            if(!e.ctrlKey && siblingCrossREF.classList.contains('sld_up')){
                slideUpDown(siblingCrossREF, 'show')
                verseInSearchWindow.classList.add('showing_crossref')
                siblingCrossREF.scrollIntoView({behavior:"smooth",block:"nearest"});
            }
            // If showing, hide it
            else {
                slideUpDown(siblingCrossREF);
                verseInSearchWindow.classList.remove('showing_crossref');
                if (e.ctrlKey) {
                    siblingCrossREF.style.display='none';
                    setTimeout(() => {
                        siblingCrossREF.classList.add('sld_up');
                        crfnnoteHolder.classList.add('ignore_displaynone'); 
                    }, 100);
                }
            }
        }
        else {
            verseInSearchWindow.classList.add('showing_crossref');
            generateCrossRefsFromRefCode(refCode, 1);
            siblingCrossREF = crfnnoteHolder.querySelector('.crossrefs');
            setTimeout(()=>{slideUpDown(siblingCrossREF)},1);
        }
    }
    function generateCrossRefsFromRefCode(refCode, transition){
        // refCode, i.e., clicked verse
        refCode = refCode.replace(/(\w)\s([0-9]+)/g, '$1.$2'); //Romans 2:3==>Romans.2:3
        refCode = refCode.replace(/:/g, '.'); //Romans.2:3==>Romans.2.3

        let generatedXref;
        let crfDiv = document.createElement('DIV');
        crfDiv.classList.add('crossrefs');
        
        // if(transition){
            /* So I can get its height */
            crfDiv.style.position = 'absolute';
            crfDiv.style.opacity = 0;
        // }
        // if(transition){
            // crfDiv = vHolder.parentNode.querySelector('.crossrefs');
            crfDiv.style.position = '';
            crfDiv.style.marginTop = '-' + crfDiv.offsetHeight + 'px';
            crfDiv.classList.add('sld_up');// for the slideUpDown(elm) function
        // }
        let tskRefs=[];

        [[TSK,'TSK'],[crossReferences_fullName,'Others']].forEach(xRef=>{
            // Get crossreferences array for clicked verse
            // let crossRef = crossReferences_fullName[refCode];
            // let crossRef = TSK[refCode];
            let crossRef = xRef[0][refCode];
            currentVerseCrossRefrence=crossRef;
            if (!crossRef) {return}
            let narr=[]
            crossRef.forEach(cf=>{
                if(cf[0] instanceof Array){
                    cf.forEach((cfL1,i)=>{
                        if(i==0){narr.push(cfL1)}
                        else {
                            cfL1.forEach(cfL2=>{
                                cfL2 = refineCrossrefCode(cfL2)
                                narr.push(cfL2)
                            })
                        }
                    })
                }
                else {
                    cf = refineCrossrefCode(cf);
                    narr.push(cf)
                }
            })
            crossRef=narr;
            generatedXref = parseCrossRef(crossRef,crfDiv,xRef[1]);
        })
        generatedXref.style.position = 'absolute';//temporary--to get height
        generatedXref.style.marginTop = (-1 * crfDiv.offsetHeight) + 'px';
        generatedXref.classList.add('sld_up');
        generatedXref.style.position = '';
        generatedXref.focus();
        return generatedXref
        function parseCrossRef(crossRef,crfDiv,sumtext) {
            let crfFrag = new DocumentFragment();
            // let details = document.createElement('DETAILS');
            // let summary = document.createElement('SUMMARY');
            // summary.innerText = sumtext;
            // details.append(summary);
            let appendSumtext=false;
            crossRef.forEach((crf,i) => {
                let divider = document.createElement('i');
                divider.style.fontStyle = 'normal';
                if(crf instanceof Array){
                    if(i>0){
                        if (crfFrag.lastChild.nodeType === Node.TEXT_NODE) {crfFrag.removeChild(crfFrag.lastChild);}
                        let br = document.createElement('BR');
                        crfFrag.append(br);
                    }
                    let crfBold = document.createElement('B');
                    crfBold.innerText = crf;
                    if(sumtext=='TSK'){tskRefs.push(crf);}
                    crfBold.style.fontStyle = 'italic';
                    crfBold.classList.add('notref');
                    crfFrag.append(crfBold);
                    divider.innerText = ': ';
                    crfFrag.append(divider);
                }
                else {
                    let unComma = crf.replace(/-/,',');
                    if(sumtext=='Others' && (tskRefs.indexOf(crf)>-1||tskRefs.indexOf(unComma)>-1)){return}
                    appendSumtext=true;
                    let crfSpan = document.createElement('SPAN');
                    crfSpan.setAttribute('tabindex',0);
                    crfSpan.innerText = crf;
                    if(sumtext=='TSK'){tskRefs.push(crf);}
                    crfFrag.append(crfSpan);
                    divider.innerText = '; ';
                    if(i!=crossRef.length-1){crfFrag.append(divider)}
                }
            });
            if(sumtext=='TSK'||appendSumtext==true){
                let H3 = document.createElement('H5');
                H3.innerText = sumtext;
                crfFrag.prepend(H3);
                if (crfFrag.lastChild.nodeType === Node.TEXT_NODE) {
                    crfFrag.removeChild(crfFrag.lastChild);
                }
            }
                    
            crfDiv.append(crfFrag);
            vHolder.parentNode.insertBefore(crfDiv, vHolder.nextSibling);
            if (sumtext=='Others') {    
            }
            return crfDiv
        }
    }
}

function refineCrossrefCode(cf) {
    let cfr = cf.split('.');
    let cv = cfr[0] + '.' + cfr[1] + '.'; // first bk and chpt in reference (some have two chapters)
    cf = cfr[0] + '.' + cfr[1] + '.' + cf.split(cv).join(''); // Isa.6:1-Isa.6.3 => Isa.6:1-3
    cf = cf.replace(/(\w)\.([0-9]+)/g, '$1 $2');
    cf = cf.replace(/\./g, ':');
    return cf;
}

/* FOR GETTING THE ACTUAL BIBLE TEXT OF A CROSS-REFERENCE */
function getCrossReference(x,bkn,bvName) {
    // x is the ref as a string or the code elm itself
    let crf2get,prv_i;
    if(typeof (x)=='string'){
        crf2get = x.replace(/\s+/ig, ' ').replace(/\s*([:;,.-])\s*/ig, '$1').replace(/\bI\s/i, 1).replace(/\bII\s/i, 2).replace(/\bIII\s/i, 3).replace(/\bIV\s/i, 4).replace(/\bV\s/i, 5);
    }
    else {
        if(x.hasAttribute('ref')){
            crf2get = refineCrossrefCode(x.getAttribute('ref'));
        }
        else if(x.matches('.reference')){
            //refine the reference
            let bkname=x.value;
            bkname.replace(/([a-zA-Z])(\d)/ig, '$1 $2'); // Rom1 => Rom 1
            let bkNchv=bkname.split(/(?<=[a-zA-Z])\s+(?=\d)/ig);// 1 Cor 2:14-16 => ['1 Cor','2:14-16']
            let bk=bkNchv[0].replace(/i\s/i, '1').replace(/ii\s/, '2').replace(/\s+/, '');
            crf2get=bk+bkNchv[1];
        }
        else {
            crf2get = x.innerText.replace(/\s+/ig, ' ').replace(/\s*([:;,.-])\s*/ig, '$1');
        }
    }
    // Requires that book name not have space: Not Valid: '1 Cor'. Valid: '1Cor'
    crf2get = crf2get.split((/(?:\s+(?=\d))|:/)).join('.');
    let bk = crf2get.split('.')[0]
    // let chp1 = Number(crf2get.split('.')[1]);
    let chp1 = bible.parseReference(bk + ' ' + Number(crf2get.split('.')[1])).chapter1;//if the chapter is more than number of chapters in book, will return the last chapter in book
    let vrs1 = Number(crf2get.split('.')[2]);
    let chp2 = chp1;
    let vrs2 = vrs1;
    let fullBkn;
    let bibleDataBkIndx;
    bible.Data.books.forEach((ref_, ref_indx) => {
        if (ref_.includes(bk.toUpperCase())) {
            fullBkn = bible.Data.bookNamesByLanguage.en[ref_indx];
            bibleDataBkIndx = ref_indx;
        }
    });
    let vHolder = new DocumentFragment();
    let br = '';
    if (/\s*,\s*/.test(crf2get)) {
        let vrsGrpsByCommas = crf2get.split(/\s*,\s*/);
        let grp1 = vrsGrpsByCommas.shift(); // Will contain a full reference, c.g., Gen 2:16-17
        let vRange1 = verseRange(grp1);
        getVersesInVerseRange(Object.values(vRange1)[0]);
        let vRanges = []; // populated by getVranges(vg)
        vrsGrpsByCommas.forEach(vg=>getVranges(vg))
        vRanges.forEach((vR,j)=>{
            br=`<hr vrange="${bk} ${chp1}:${vrsGrpsByCommas[j]}">`
            getVersesInVerseRange(vR)
        })
        function getVranges(vg){
            if(vg.split('-').length>1){ // it is a range, e.g., 5-13
                vRanges.push([Number(vg.split('-')[0]), Number(vg.split('-')[1])])
            } else { // it is a single number
                vRanges.push([Number(vg),Number(vg)])
            }
        }
    }else {
        vRange = verseRange(crf2get);
        // getVersesInVerseRange(vRange);
        const vRangeKeys = Object.keys(vRange)
        for (let i = 0; i < vRangeKeys.length; i++) {
            chp1=Number(vRangeKeys[i]);
            const vr = Object.values(vRange)[i];
            getVersesInVerseRange(vr);
        }
    }
    function verseRange(crf2get){
        if (/\s*-\s*/.test(crf2get)) { //MORE THAN ONE VERSE
            vrs1 = Number(crf2get.split(/\s*-\s*/)[0].split('.')[2]);
            let ref_secondHalf = crf2get.split(/\s*-\s*/)[1].split('.');
            
            //e.g., Gen.1.3-Gen.1.6
            if (ref_secondHalf.length > 1) {
                chp2 = Number(ref_secondHalf[1]);
                vrs2 = Number(ref_secondHalf[2]);
                chpRange = Array.from({length: chp2 - chp1 + 1 }, (_, i) => i + chp1);
                const chpVrsRanges = {};
                chpRange.forEach((cv,i)=>{
                    if(cv==chp1){chpVrsRanges[cv]=[vrs1,bible.Data.verses[bibleDataBkIndx][cv-1]]}
                    else if(cv==chp2){chpVrsRanges[cv]=[1,vrs2]}
                    else {chpVrsRanges[cv]=[1,bible.Data.verses[bibleDataBkIndx][cv-1]]}
                })
                return chpVrsRanges
            }
            //e.g., Gen.1.3-6
            else {
                chp2 = chp1;
                vrs2 = Number(ref_secondHalf[0]);
            }
        } else {// If it is a single verse
            vrs1 = Number(crf2get.split('-')[0].split('.')[2]);
            vrs2 = vrs1;
        }
        return {[chp1]:[vrs1,vrs2]}
        // return [vrs1,vrs2]
    }
    function getVersesInVerseRange(vRange){
        let vrs1 = vRange[0];
        let vrs2 = vRange[1];
        if(bkn){bookName=bkn;}
        let b_vn='';
        if(bvName){b_vn=`-${bvName}`;}
        let verseSpan;
        // e.g., 11-28
        if (vrs1 <= vrs2) {
            for (i = vrs1; i < vrs2 + 1; i++) {
                verseSpan = document.createElement('span');
                vNum(i);
            }
        }
        // e.g., 28-11
        else if (vrs1 > vrs2){
            for (i = vrs1; i > vrs2 - 1; i--) {
                verseSpan = document.createElement('span');
                vNum(i);
            }
        }
        function vNum(i) {
            const verifiedRef = bible.parseReference(bk + ' ' + chp1 + ':' + i);
            chp1 = verifiedRef.chapter1;
            const _i = verifiedRef.verse1;
            if(prv_i==_i){return}
            prv_i = _i;
            
            let verseNum = document.createElement('code');
            verseNum.setAttribute('ref', fullBkn + ' ' + (chp1) + ':' + _i);
            verseNum.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
            verseNum.prepend(document.createTextNode(`[${(bk)} ${(chp1)}:${_i}${b_vn}]`))
            // verseNum.title = b_v + ' ' + fullBkn + chp1 + ':' + i;
            verseSpan.classList.add('verse');

            let vText;
            const _bvnm = bvName ? bvName : bversionName;
            vText = window[_bvnm][fullBkn][chp1-1][_i-1]
            verseSpan.classList.add('v_'+_bvnm);
            // if(bvName){
            //     // if(window[bvName]){loadVersion(bvName)}
            //     vText = window[bvName][fullBkn][chp1-1][_i-1]
            //     verseSpan.classList.add('v_'+bvName);
            // } else {
            //     // if(window[bversionName]){loadVersion(bversionName)}
            //     vText = window[bversionName][fullBkn][chp1-1][_i-1]
            //     verseSpan.classList.add('v_'+bversionName);
            // }
            if(vText){
                if (bible.isRtlVersion(bversionName,fullBkn)==true) {
                    verseSpan.classList.add('rtl');
                }
                vHolder.append(parseVerseText(vText, verseSpan));
                verseSpan.prepend(' ');
                verseSpan.prepend(verseNum);
                // if(br){
                verseSpan.innerHTML = br + verseSpan.innerHTML;
                // br = '<br>';
                br='';//Divider is only added at the start of the comma separated group, so once added, remove it
            }
        }
    }
    createTransliterationAttr(vHolder);
    return vHolder;
}
/* TO CHANGE LOADED VERSION WITH CTRL + CLICK */
pagemaster.addEventListener('keydown',compareThisSearchVerse)
/* COMPARE THIS SEARCH VERSE */
function compareThisSearchVerse(e){
    if (![0,1,2].includes(e.button)) {return}
    // delay loading of new verse to avoid unintentionally rightclicking on the newverse (to avoid contextmenu on strongs word in new verse or appending singleverse_compare_menu)
    setTimeout(() => {
        let dis = e.target;
        let v = elmAhasElmOfClassBasAncestor(dis,'.verse');
        let bvNme = dis.getAttribute('b_version');
    
        // middleMouseButton or Right-click event (change the bible version)
        if (e.button==1 || (!e.ctrlKey && e.button==2)) {changeLoadedVersion(v,dis)}
        // Ctrl + Right-click (change just the verse)
        else if (e.ctrlKey && e.button==2) {changeLoadedVersion(v,dis,true)}
        // Left-click event with NO ctrlkey (show the compare verse for just this verse)
        else if (!e.ctrlKey && e.button==0) {
            singleVerse(v,dis);
        }
        // Ctrl + left-click (show all compare verses for clicked bible version)
        else if (e.ctrlKey && e.button==0) {
            //get all the verses in parent window
            let parentWindow = dis.closest('#context_menu');
            if(!parentWindow){parentWindow = dis.closest('#searchPreviewFixed, .compare_verses')}
            let versionCompareBtns = parentWindow.querySelectorAll('.compare_withinsearchresult_button[b_version='+bvNme+']')
            let addORremove = 'add';
            if(dis.classList.contains('green_active')){addORremove = 'remove';}// Remove all
            versionCompareBtns.forEach((cmpBtn,i) => {
                let run_twordsArr = (i==versionCompareBtns.length-1)?true:false;
                let v = elmAhasElmOfClassBasAncestor(cmpBtn,'.verse');
                singleVerse(v,cmpBtn,addORremove,run_twordsArr);
            });
        }
    }, 2);

    function changeLoadedVersion(v,dis,just1verse){
        let vParent = v.parentElement;
        let bvNme = dis.getAttribute('b_version');
        localStorage.setItem('bversionName',bversionName);
        let nonCompVerses = [v];
        let vIndx = Array.from(vParent.querySelectorAll('[class*=v_].verse')).indexOf(v);
        if (!just1verse) {
            nonCompVerses = vParent.querySelectorAll('span.verse:not(.verse_compare):not(details):not(.resultsummary)');//get all verses that are not compare verses
        }
        nonCompVerses.forEach(v => {
            const oldcrfnnote = v.querySelector('.crfnnote').cloneNode(true);//get the crfnnote
            oldcrfnnote.querySelector('.cbv').classList.remove('cbv');//former cbv (current bible version)
            oldcrfnnote.querySelector(`[b_version="${bvNme}"]`).classList.add('cbv');//former cbv (current bible version)
            const vccls = v.classList.contains('verse_compare');//check if v has verse_compare class
            const vref = v.querySelector('code[ref]').getAttribute('ref');
            const newVerse = createSingleVerseFromREFandVERSION(vref,bvNme);
            vccls ? newVerse.classList.add('verse_compare') : null;
            let vinfrag = newVerse.querySelector('.verse');
            Array.from(v.classList).forEach(c=>{if(!/v_/.test(c)){vinfrag.classList.add(c)}})//get all the classes of v and assign to newVerse (to ensure displaynone class is not removed from newverse if it is present in old v)
            vinfrag.append(oldcrfnnote)//append old crfnnote to new v
            let refcodeinv = vinfrag.querySelector('[ref]');
            refcodeinv.innerText = `(${bvNme})${refcodeinv.innerText}`;//add version to reference text
            vParent.insertBefore(newVerse,v);//replace old v with new verse
            
            // prevent contextmenu on strong's word in new verse
            vParent.classList.add('ignorecmenu');
            setTimeout(() => {vParent.classList.remove('ignorecmenu');}, 150);
            v.remove()//remove old verse
            //If it is context menu, replace the version name of the reference
            if((!just1verse && vParent.closest('#context_menu')) && !vParent.querySelector(`.verse:not(.verse_compare):not(.v_${bvNme})`)){
                let cmtitlebarTextNode = context_menu.querySelector('.cmtitlebar').childNodes[0];
                cmtitlebarTextNode.textContent = cmtitlebarTextNode.textContent.replace(/\s*\[[^\]]+\]/,` [${bvNme}]`)
            }
            //change the general book version
            if (!just1verse) {
                bversion=bvNme;
                bversionNameChange.value=bvNme;
            }
        });
        if (just1verse) {vParent = Array.from(vParent.querySelectorAll('[class*=v_].verse'))[vIndx]}
        createTransliterationAttr(vParent);
        transliteratedWords_Array.forEach(storedStrnum=>{showTransliteration(storedStrnum,vParent)});
    }
    function singleVerse(v,dis2,addORremove,run_twordsArr=true){
        let vref = v.querySelector('code[ref]').getAttribute('ref');
        let bvNme = dis2.getAttribute('b_version');
        let vrefModified = vref.replace(/[:.]+/,'_');

        // Check if current Bible Version has already been compared
        const prevComparedVerse = v.parentElement.querySelector('.verse_compare[ref="' + vrefModified + ' ' + bvNme + '"]')
        if(((addORremove && addORremove=='remove') || !addORremove) && prevComparedVerse){
            if(addORremove && addORremove=='add'){return}
            prevComparedVerse.remove();
            dis2.classList.remove('green_active');
            if(!v.nextElementSibling || !v.nextElementSibling.matches('.verse_compare')){v.classList.remove('vrs_bein_comp')};
            return
        } else if(addORremove && addORremove=='remove'){return}

        let newVerse = createSingleVerseFromREFandVERSION(vref, bvNme);
        newVerse = createTransliterationAttr(newVerse);
        let newVerseInner = newVerse.querySelector('.verse');
        newVerseInner.prepend(createNewElement('button','.closebtn','.cmenu_closebtn', '[onclick=removeCompareVerse(this)]'));
        newVerseInner.classList.add('verse_compare');
        newVerseInner.setAttribute('ref', vrefModified + ' ' + bvNme);
        newVerseInner.querySelector('code[ref]').innerText=newVerseInner.querySelector('code[ref]').innerText.replace(/\[/,`[${bvNme} `);
        insertElmAafterElmB(newVerse, v);
        if (run_twordsArr) {
            transliteratedWords_Array.forEach(storedStrnum=>{showTransliteration(storedStrnum)});
        }
        dis2.classList.add('green_active');
        v.classList.add('vrs_bein_comp');
        if(v.matches('.displaynone')){newVerseInner.classList.add('displaynone')}
        return newVerseInner;
    }
    function createSingleVerseFromREFandVERSION(vref, bvNme) {
        let vrefObj = breakDownRef(vref);
        let new_bk = vrefObj.bn;
        let new_chp = vrefObj.bc;
        let new_vn = vrefObj.cv;
        let fullBkn = fullBookName(new_bk).fullBkn;
        newRef2get = `${new_bk} ${new_chp}:${new_vn}`;
        let newVerse = createSingleVerse(new_bk, new_chp, new_vn, fullBkn, bvNme);
        return newVerse;
    }
}
/* GETTING PREVIOUS OR NEXT VERSE */
function cmenu_goToPrevOrNextVerse(prvNxt, searchWindowVerse, shiftKey, makeVeryLast){
    let new_bk, new_chp, new_vn, fullBkn, b_version_n;
    let allcmVerses, isC=0, ignoreDisplayNone=0;
    
    if (!searchWindowVerse || searchWindowVerse && searchWindowVerse[0].closest('#context_menu')) {// searchWindowVerse = context_menu;
        allcmVerses = Array.from(context_menu.querySelectorAll('.verse:not(.verse_compare)'));
        //is there any crfnnote showing or not
        // isC = !context_menu.querySelector('.crfnnote:not(.displaynone)');
        isC = context_menu.classList.contains('showingXref');        
    } else {
        allcmVerses = Array.from(searchWindowVerse);
        //is there any crfnnote showing or not
        // isC = !allcmVerses.find(x=>{return x.querySelector('.crfnnote:not(.displaynone)')});
        isC = !allcmVerses.find(x=>{return x.querySelector('.crfnnote.displaynone')});
        
        allcmVerses.length==1 ? (allcmVerses[0].querySelector('.crfnnote.ignore_displaynone') ? ignoreDisplayNone=1:null):null//is the verse ignoring crf displaynone
    }
    /* replace the topmost verse */
    let v;
    
    if (prvNxt=='prev') {
        v = allcmVerses[0];
        let vref = v.querySelector('code[ref]').getAttribute('ref');
        let vrefObj = breakDownRef(vref);
        let newRef2get;
        /* Not the First Verse */
        if(vrefObj.cv>1){
            new_bk=vrefObj.bn;
            new_chp=vrefObj.bc;
            new_vn=vrefObj.cv-1;
            fullBkn=fullBookName(new_bk).fullBkn;
            newRef2get=`${new_bk} ${new_chp}:${new_vn}`;
        }
        /* *********************** IF FIRST VERSE ********************** */
        /* Go to last verse in previous chapter if it is not chapter one */
        /* ************************************************************* */
        else if(vrefObj.cv==1 && vrefObj.bc>1){
            new_bk=vrefObj.bn;
            new_chp=vrefObj.bc-1;
            new_vn=lastVerseInPrevChpt(new_chp);
            fullBkn=fullBookName(new_bk).fullBkn;
            newRef2get=`${new_bk} ${new_chp}:${new_vn}`;
        }
        /* **************** IF FIRST CHAPTER *************** */
        /* Go to last verse in last chapter of previous book */
        /* ************************************************* */
        else if(vrefObj.cv==1 && vrefObj.bc==1){
            let prvBk;
            let bkIndx=fullBookName(vrefObj.bn).bkIndex;
            if (bkIndx>1) {// Not Genesis
                prvBk=bible.Data.bookNamesByLanguage.en[bkIndx-1];
                bkIndx=bkIndx-1
            } else {return}
            let lastChptInBk = bible.Data.verses[bkIndx].length;
            let lastVerseInlastChptInBk = bible.Data.verses[bkIndx][lastChptInBk-1];
            new_bk=prvBk;
            new_chp=lastChptInBk;
            new_vn=lastVerseInlastChptInBk;
            fullBkn=fullBookName(new_bk).fullBkn;
            newRef2get=`${new_bk} ${new_chp}:${new_vn}`;
        }
        function lastVerseInPrevChpt(chpt){
            return bible.Data.verses[fullBookName(vrefObj.bn).bkIndex][chpt-1]
        }
    }
    else if(prvNxt=='next'){
        v = allcmVerses[allcmVerses.length-1];
        let vref = v.querySelector('code[ref]').getAttribute('ref');
        let vrefObj = breakDownRef(vref);
        let currentBookIndx = fullBookName(vrefObj.bn).bkIndex;
        let lastVerseInChapter=bible.Data.verses[currentBookIndx][vrefObj.bc-1];
        let lastChapterInBook=bible.Data.verses[currentBookIndx].length;
        /* ************************************************* */
        /* ******* Go to the next verse in chapter  ******** */
        /* ******* If Not the Last Verse in Chapter ******** */
        /* ************************************************* */
        if(vrefObj.cv < lastVerseInChapter){
            new_bk=vrefObj.bn;
            new_chp=vrefObj.bc;
            new_vn=vrefObj.cv+1;
            fullBkn=fullBookName(new_bk).fullBkn;
        }
        /* ************************************************ */
        /* ******* Go to first verse in next chapter ****** */
        /* If this is the last verse in the current chapter */
        /* ************************************************ */
        else if(vrefObj.cv == lastVerseInChapter){
            if(vrefObj.bc < lastChapterInBook){
                new_bk=vrefObj.bn;
                new_chp=vrefObj.bc+1;
                new_vn=1;
                fullBkn=fullBookName(new_bk).fullBkn;
            }
            /* Go to the next book */
            else if(vrefObj.bc == lastChapterInBook){
                let nextBookIndx = currentBookIndx + 1;
                // If it is not Revelation
                if (nextBookIndx < 65) {
                    new_bk=bible.Data.bookNamesByLanguage.en[nextBookIndx];
                    new_chp=1;
                    new_vn=1;
                    fullBkn=fullBookName(new_bk).fullBkn;
                }
                else {return}
            }
        }
    }
    // Generate the Verse to be added
    b_version_n=Array.from(v.classList).find(c=>c.startsWith('v_')).replace(/v_/,'');
    if(!b_version_n){b_version_n=bversionName}
    let newVerseDocFrag=createSingleVerse(new_bk,new_chp,new_vn,fullBkn,b_version_n);
    createTransliterationAttr(newVerseDocFrag);
    
    // Add CrossRef to the newly created verse
    let tskHolder=crfnnote_DIV(newVerseDocFrag);
    showORdisplaynoneXrefSections(tskHolder, isC);
    if(ignoreDisplayNone){tskHolder.classList.add('ignore_displaynone');}
    newVerse=newVerseDocFrag.querySelector('span.verse');
    newVerse.append(tskHolder);
    // Copy all the classes of the former verse
    newVerse.setAttribute('class',v.getAttribute('class').replace(/noted\s*|user1note\s*|vrs_bein_comp\s*/g,''));
    // Check if Verse Has Note;
    checkAndIndicateThatVerseHasNote(fullBkn, new_chp, new_vn, newVerse);

    // Add bible version to code ref text
    let vrefModified = newVerse.querySelector('code[ref]').getAttribute('ref').replace(/[:.]+/,'_');
    if(newVerse.classList.contains('verse_compare')){
        newVerse.setAttribute('ref', vrefModified + ' ' + b_version_n);
    }
    // newVerse.querySelector('code[ref]').innerText=newVerse.querySelector('code[ref]').innerText.replace(/\[/,'('+b_version_n+')[');
        
    // Add verse removal button
    let vcdRef = newVerse.querySelector('code[ref]');
    (searchWindowVerse || shiftKey || v.querySelector('code .closebtn')) ? (vcdRef.prepend(createNewElement('button', '.closebtn', '.cmenu_closebtn', '[onclick=removeCompareVerse(this)]'))) : null;//Let closeBtn inside codeRef

    if (prvNxt=='prev') {
        // Prepend New Verse Above Highest Verse
        insertElmAbeforeElmB(newVerse, v);
        // Remove the Last Verse in the ContextMenu
        let lastVerse=allcmVerses[allcmVerses.length-1];
        // Remove all verse_compare that are attached to the verse to be removed
        if(isC && !shiftKey && !lastVerse.matches('.verse_compare')){
            while(lastVerse.nextElementSibling && lastVerse.nextElementSibling.matches('.verse_compare')){lastVerse.nextElementSibling.remove()}
        }
        !shiftKey ? lastVerse.remove() : null;
    }
    else if(prvNxt=='next'){
        // Append New Verse After Lowest Verse
        if (makeVeryLast) {
            while(v.nextElementSibling && v.nextElementSibling.matches('.verse')){v=v.nextElementSibling}
        } else if(isC){
            while(v.nextElementSibling && v.nextElementSibling.matches('.verse_compare')){v=v.nextElementSibling}
        }
        insertElmAafterElmB(newVerse, v);
        // Remove the first Vere in the ContextMenu
        let firstVerse=allcmVerses[0];
        // Remove all verse_compare that are attached to the verse to be removed
        if(isC && !shiftKey && !firstVerse.matches('.verse_compare')){
            while(firstVerse.nextElementSibling && firstVerse.nextElementSibling.matches('.verse_compare')){firstVerse.nextElementSibling.remove()}
        }
        !shiftKey ? firstVerse.remove() : null;
    }
    // newVerse.scrollIntoView({'behavior':'smooth'});
    // newVerse.scrollIntoViewIfNeeded();
    /* ************************* */
    /* Show Transliterated Words */
    /* ************************* */
    transliteratedWords_Array.forEach(storedStrnum=>{showTransliteration(storedStrnum/* ,searchWindowVerse */)});
    // createTransliterationAttr(newVerse)
}
function createSingleVerse(bk,chp,vn,fullBkn,bversionName){
    let vHolder = new DocumentFragment();
    let verseNum = document.createElement('code');
    let verseSpan = document.createElement('span');
    let vText;
    verseNum.setAttribute('ref', fullBkn + ' ' + (chp) + ':' + vn);
    verseNum.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
    // Get BookName Abreviation
    let bkShort = fullBookName(fullBkn).shortBkn;
    verseNum.prepend(document.createTextNode(`[${(bkShort)} ${(chp)}:${vn}]`));
    verseSpan.classList.add('verse');
    if(!window[bversionName]){loadVersion(bversionName)};
    vText = window[bversionName][fullBkn][chp - 1][vn - 1];
    verseSpan.classList.add('v_'+bversionName);
    if (bible.isRtlVersion(bversionName,fullBkn)==true) {
        verseSpan.classList.add('rtl');
        // verseNum.prepend(document.createTextNode(`[${vn}:${(chp)} ${(bkShort)}]`));
    }
    // else{verseNum.prepend(document.createTextNode(`[${(bkShort)} ${(chp)}:${vn}]`))}
    vHolder.append(parseVerseText(vText, verseSpan));
    verseSpan.prepend(' ');
    verseSpan.prepend(verseNum);
    return vHolder
}

/* ************************** */
/* FOR VERSE COMPARE CLOSEBTN */
/* ************************** */
function removeCompareVerse(clsBtn){
    let t_v = clsBtn.closest('.verse');//target verse to delete
    if(t_v.matches('.verse:not(.verse_compare), .verse.vrs_bein_comp')){
        if(t_v.querySelector('.green_active')){
            // t_v.querySelectorAll('*:not(:is(.closebtn,.crfnnote,.crfnnote>*))').forEach(el=>{el.remove()});
            let t_v_clsCrf = t_v.querySelectorAll('.closebtn,.crfnnote,code[ref]');
            t_v.innerHTML='';
            t_v_clsCrf.forEach(el=>{t_v.append(el)});
            t_v.classList.add('to_be_deleted');
        }//is it showing an compareverse
        else{t_v.remove();}
        return
    }

    let vCl=Array.from(t_v.classList).find(c=>c.startsWith('v_')).replace(/v_/,'');//version, e.g., 'v_ESV'=>'ESV'
    let v_o=t_v.previousElementSibling;//v_origin
    while(v_o && v_o.matches('.verse')){
        if(v_o.querySelector(`[b_version=${vCl}].green_active`)){break}
        else{v_o=v_o.previousElementSibling}
    }
    
    const _vo = v_o.querySelector(`button.compare_withinsearchresult_button[b_version=${vCl}]`);
    _vo?_vo.classList.remove('green_active'):null;
    t_v.remove();// remove comp verse
    (v_o.querySelectorAll('.green_active').length==0 && v_o.classList.contains('to_be_deleted'))?v_o.remove():null;
}

/* *********************************** */
/* Change Verse on Scroll Over CodeRef */
/* *********************************** */

let d_timer = null, seconds = 0;
function roundDownToNearest100(number) {return Math.floor(number / 25) * 25;}
pagemaster.addEventListener('wheel', scrollingWithMouseWheelAndTouchPad, { passive: false })
function scrollingWithMouseWheelAndTouchPad(e) {
    if(e.target.matches('#context_menu:not([strnum]) .verse:not(.verse_compare) code[ref], #searchPreviewFixed > .verse code[ref], #context_menu:not([strnum]) .verse.verse_compare code[ref], #scriptureCompare_columns_holder .verse.verse_compare code[ref], #scriptureCompare_columns_holder .compare_search .verse code[ref], #scriptureCompare_columns_holder .verse code[ref]')){
        e.preventDefault();
    }    
    let deltaY = e.deltaY, currentdate = new Date();
    // For MouseWheel, e.deltaY >= 125
    // For TouchPad, except when scrolled very fast, e.deltaY < 125  

    if (Math.abs(deltaY)<125) {
        const currentMilliseconds = roundDownToNearest100(currentdate.getMilliseconds());
        if (seconds!=currentMilliseconds) {
            reversed = -e.deltaY;//reverse deltaY so that scrolling down will increase...
            wheelDirection(e,reversed);
            seconds = currentMilliseconds;
        }
    } else {
        wheelDirection(e);
    }
}

function wheelDirection(e,eDelta=e.deltaY) {
    // VERSE(S) IN CONTEXTMENU
    let oldBversion = bversionName;
    if(e.target.matches('#context_menu:not([strnum]) .verse:not(.verse_compare) code[ref]')){
        e.preventDefault();
        versesVersion()
        if(eDelta<0){cmenu_goToPrevOrNextVerse('prev',undefined,e.shiftKey)}
        else if(eDelta>0){cmenu_goToPrevOrNextVerse('next',undefined,e.shiftKey)}
    }
    // VERSE (SINGLE) IN SEARCH WINDOW OR TRANSLATION_COMPARE
    else if(e.target.matches('#searchPreviewFixed > .verse code[ref], #context_menu:not([strnum]) .verse.verse_compare code[ref], #scriptureCompare_columns_holder .verse.verse_compare code[ref], #scriptureCompare_columns_holder .compare_search .verse code[ref]')){
        e.preventDefault();
        versesVersion()
        let targetVerseInsearchWindow = [elmAhasElmOfClassBasAncestor(e.target,'.verse')];
        if(eDelta<0){cmenu_goToPrevOrNextVerse('prev',targetVerseInsearchWindow,e.shiftKey)}
        else if(eDelta>0){cmenu_goToPrevOrNextVerse('next',targetVerseInsearchWindow,e.shiftKey)}
    }
    // VERSE (ONE OR MORE) IN COMPARE SECTION
    else if(e.target.matches('#scriptureCompare_columns_holder .verse code[ref]')){
        e.preventDefault();
        versesVersion()
        let parentCopareVersesDiv = e.target.closest('.notfromsearch,.compare_verses');
        let allVersesInCompareDiv = parentCopareVersesDiv.querySelectorAll('.verse')
        let targetVerseInsearchWindow = allVersesInCompareDiv;
        if(eDelta<0){cmenu_goToPrevOrNextVerse('prev',targetVerseInsearchWindow,e.shiftKey)}
        else if(eDelta>0){cmenu_goToPrevOrNextVerse('next',targetVerseInsearchWindow,e.shiftKey)}
    }
    bversionNameChange.value = oldBversion;//Restore the bversionName
    function versesVersion() {
        // Temporarily change the bversionName to that of the verse to ensure highlighted compare version matches it
        bversionNameChange.value = Array.from(e.target.closest('.verse').classList).find(cl=>cl.startsWith('v_')).replace('v_','')
    }
}