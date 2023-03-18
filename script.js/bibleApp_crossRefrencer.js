/* FOR GENERATING GETTING AND APPENDING CROSSREFERNCES (TSK) OF VERSES THAT HAVE THEM */
bversionName = 'KJV';
if(document.querySelector('#homepage')){
    document.addEventListener('click', appendCrossReferences);
    main.addEventListener('mousedown', getCurrentBVN)
}
else if(versenotepage = document.querySelector('body#versenotepage')){
    versenotepage.addEventListener('click', appendCrossReferences);
}

function getCurrentBVN(e) {
    let eTarget = e.target;
    let classesOfe = null;
    if (eTarget.matches('.verse')) {
        classesOfe = eTarget.classList;
    } else if (eTarget = elmAhasElmOfClassBasAncestor(eTarget, '.verse')) {
        classesOfe = eTarget.classList;
    }
    if (classesOfe) {
        getBVN(classesOfe)
    }

    function getBVN(classesOfe) {
        for (q = 0; q < classesOfe.length; q++) {
            let cl = classesOfe[q]
            if (cl.startsWith('v_')) {
                bversionName = cl.split('v_')[1];
                return
            }
        };
    }
}

function appendCrossReferences(e) {
    if (!e.target.matches('[bversion], #verse_crossref_button, .verse_crossref_button')&&!e.target.parentNode.matches('#verse_crossref_button')) {
        return
    }
    let eTarget;//Holds the 'ref' attribute;
    let masterVerseHolder; //For indicating if crossrefs are being shown and for finidng nextSibling to append the crossrefs to
    let refCode;
    let vHolder; // Element to append after
    
    if(elmAhasElmOfClassBasAncestor(e.target, 'vmultiple')){
            if(e.target.matches('#verse_crossref_button')){eTarget = e.target.parentNode.parentNode}
            else if(e.target.matches('#verse_crossref_button a')){eTarget = e.target.parentNode.parentNode.parentNode}
            masterVerseHolder = elmAhasElmOfClassBasAncestor(eTarget, '.vmultiple');
            refCode = eTarget.getAttribute('ref');
            let siblingCrossREF = masterVerseHolder.nextElementSibling;
        
            //Only Append Crossrefs If It Doesn't Have Already
            if (siblingCrossREF==null || siblingCrossREF==undefined || !siblingCrossREF.matches('.crossrefs')) {
                masterVerseHolder.classList.add('showing_crossref')
                vHolder = masterVerseHolder;
                if (refCode){
                    siblingCrossREF = generateCrossRefsFromRefCode(refCode);
                    if(!siblingCrossREF){return}
                    siblingCrossREF.style.zIndex = -1;
                    setTimeout(() => {slideUpDown(siblingCrossREF)}, 1);
                    setTimeout(()=>{siblingCrossREF.scrollIntoView({behavior:"smooth",block:"nearest"})},300)
                }
            } else {
                slideUpDown(siblingCrossREF);
                setTimeout(() => {
                    masterVerseHolder.classList.remove('showing_crossref');
                    siblingCrossREF.remove()
                }, 300);
                
            }
    }
    /* FOR SEARCHRESULT WINDOW */
    else if (crfnnoteHolder = elmAhasElmOfClassBasAncestor(e.target, '.crfnnote')){
        verseInSearchWindow = elmAhasElmOfClassBasAncestor(e.target, '.verse')
        refCode = verseInSearchWindow.querySelector('[ref]').getAttribute('ref');
        vHolder = e.target.parentNode;
        if(siblingCrossREF = crfnnoteHolder.querySelector('.crossrefs')){
            // If hidden show it
            if(siblingCrossREF.classList.contains('sld_up')){
                slideUpDown(siblingCrossREF, 'show')
                verseInSearchWindow.classList.add('showing_crossref')
                siblingCrossREF.scrollIntoView({behavior:"smooth",block:"nearest"});
            }
            // If showing, hide it
            else {
                slideUpDown(siblingCrossREF)
                verseInSearchWindow.classList.remove('showing_crossref')
            }
        }
        else {
            verseInSearchWindow.classList.add('showing_crossref')
            generateCrossRefsFromRefCode(refCode, 1)
            siblingCrossREF = crfnnoteHolder.querySelector('.crossrefs')
            setTimeout(()=>{slideUpDown(siblingCrossREF)},1);
        }
    }
    function generateCrossRefsFromRefCode(refCode, transition){
        refCode = refCode.replace(/(\w)\s([0-9]+)/g, '$1.$2'); //Romans 2:3==>Romans.2:3
        refCode = refCode.replace(/:/g, '.'); //Romans.2:3==>Romans.2.3
        let crossRef = crossReferences_fullName[refCode];
        currentVerseCrossRefrence=crossRef;
        if (!crossRef) {return}
        let narr=[]
        crossRef.forEach(cf=>{
            let cfr=cf.split('.')
            let cv = cfr[0] + '.' + cfr[1] + '.'
            cf = cfr[0] + '.' + cfr[1] + '.' + cf.split(cv).join('')
            cf = cf.replace(/(\w)\.([0-9]+)/g, '$1 $2');
            cf = cf.replace(/\./g, ':');
            narr.push(cf)
        })
        crossRef=narr;
        return parseCrossRef(crossRef);
        
        function parseCrossRef(crossRef) {
            let crfFrag = new DocumentFragment();
            crossRef.forEach(crf => {
                let crfSpan = document.createElement('SPAN');
                crfSpan.innerText = crf;
                crfFrag.append(crfSpan);
                crfFrag.append('; ');
            });
            let crfDiv = document.createElement('DIV');
            crfDiv.append(crfFrag);
            crfDiv.classList.add('crossrefs');
            
            // if(transition){
                /* So I can get its height */
                crfDiv.style.position = 'absolute';
                crfDiv.style.opacity = 0;
            // }
            
            vHolder.parentNode.insertBefore(crfDiv, vHolder.nextSibling);
            
            // if(transition){
                // crfDiv = vHolder.parentNode.querySelector('.crossrefs');
                crfDiv.style.position = '';
                crfDiv.style.marginTop = '-' + crfDiv.offsetHeight + 'px';
                crfDiv.classList.add('sld_up');// for the slideUpDown(elm) function
            // }
            return crfDiv
        }
    }
}

/* FOR GETTING THE ACTUAL BIBLE TEXT OF A CROSS-REFERENCE */
function getCrossReference(x,bkn,bvName) {
    // x is the ref as a string or the code elm itself
    let crf2get;
    if(typeof (x)=='string'){
        crf2get = x.replace(/\s+/ig, ' ').replace(/\s*([:;,.-])\s*/ig, '$1').replace(/\bI\s/i, 1).replace(/\bII\s/i, 2).replace(/\bIII\s/i, 3).replace(/\bIV\s/i, 4).replace(/\bV\s/i, 5);
    }
    else {
            if(x.hasAttribute('ref')){
            crf2get = x.getAttribute('ref');
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
    crf2get = crf2get.split(' ').join('.').split(':').join('.');
    let bk = crf2get.split('.')[0]
    let chp1 = Number(crf2get.split('.')[1]);
    let vrs1 = Number(crf2get.split('.')[2]);
    let chp2 = chp1;
    let vrs2 = vrs1;
    let fullBkn;
    bible.Data.books.forEach((ref_, ref_indx) => {
        if (ref_.includes(bk.toUpperCase())) {
            fullBkn = bible.Data.bookNamesByLanguage.en[ref_indx];
        }
    });
    let vHolder = new DocumentFragment();
    let br = '';
    if (crf2get.includes(',')) {
        let vrsGrpsByCommas = crf2get.split(',');
        let grp1 = vrsGrpsByCommas.shift(); // Will contain a full reference, c.g., Gen 2:16-17
        let vRange1 = verseRange(grp1);
        getVersesInVerseRange(vRange1);
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
        getVersesInVerseRange(vRange);
    }
    function verseRange(crf2get){
        if (crf2get.includes('-')) { //MORE THAN ONE VERSE
            vrs1 = Number(crf2get.split('-')[0].split('.')[2]);
            let ref_secondHalf = crf2get.split('-')[1].split('.')

            //e.g., Gen.1.3-Gen.1.6
            if (ref_secondHalf.length > 1) {
                chp2 = Number(ref_secondHalf[1]);
                vrs2 = Number(ref_secondHalf[2]);
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
        return [vrs1,vrs2]
    }
    function getVersesInVerseRange(vRange){
        let vrs1 = vRange[0];
        let vrs2 = vRange[1];
        if(bkn){bookName=bkn;}
        let b_vn='';
        let b_v='';
        // if(!bvName){bvName=bversionName;}
        // else 
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
            let verseNum = document.createElement('code');
            verseNum.setAttribute('ref', fullBkn + ' ' + (chp1) + ':' + i);
            verseNum.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
            verseNum.prepend(document.createTextNode(`[${(bk)} ${(chp1)}:${i}${b_vn}]`));
            verseNum.title = b_v + ' ' + fullBkn + chp1 + ':' + i;
            verseSpan.classList.add('verse');
            let vText;
            if(bvName){
                vText = window[bvName][fullBkn][chp1 - 1][i - 1]
                verseSpan.classList.add('v_'+bvName);
            } else {
                vText = window[bversionName][fullBkn][chp1 - 1][i - 1]
                verseSpan.classList.add('v_'+bversionName);
            }
            if(vText){
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
    createTransliterationAttr(vHolder)
    return vHolder;
}


/* GETTING PREVIOUS OR NEXT VERSE */
function cmenu_goToPrevOrNextVerse(prvNxt){
    let new_bk,new_chp,new_vn,fullBkn,bversionName;
    let allcmVerses = context_menu.querySelectorAll('.verse');
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
        /* ******************************** */
        /* Go to the next verse in chapter  */
        /* If Not the Last Verse in Chapter */
        /* ******************************** */
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
    function fullBookName(bkn) {
        let fullBkn;
        let bkIndex;
        bible.Data.books.forEach((bkAbrv, ref_indx) => {
            if (bkAbrv.includes(bkn.toUpperCase())) {
                fullBkn = bible.Data.bookNamesByLanguage.en[ref_indx];
                bkIndex = ref_indx;
            }
        });
        return {fullBkn, bkIndex}
    }
    v.classList.forEach(c=>{if(c.startsWith('v_')){bversionName=c.replace(/v_/,'')}});
    let newVerse=createSingleVerse(new_bk,new_chp,new_vn,fullBkn,bversionName);
    /* ************ */
    /* Add CrossRef */
    /* ************ */
    let tskHolder=crfnnote_DIV(newVerse);
    tskHolder.classList.add('displaynone');
    newVerse.querySelector('span.verse').append(tskHolder);
    if (prvNxt=='prev') {
        // Prepend New Verse Above Highest Verse in ContextMenu
        insertElmAbeforeElmB(newVerse, v)
        // Remove the Last Vere in the ContextMenu
        allcmVerses[allcmVerses.length-1].remove()
    }
    else if(prvNxt=='next'){
        // Append New Verse After Lowest Verse in ContextMenu
        insertElmAafterElmB(newVerse, v)
        // Remove the first Vere in the ContextMenu
        allcmVerses[0].remove()
    }
}
function breakDownRef(ref){
    ref=ref.replace(/\s+/ig,' ').replace(/\s*([:;,.-])\s*/ig,'$1').replace(/\bI\s/i,1).replace(/\bII\s/i,2).replace(/\bIII\s/i,3).replace(/\bIV\s/i,4).replace(/\bV\s/i,5);
    ref=ref.replace(/:([0-9]+)/,'.$1').replace(/(\w)[\s*]([0-9]+)/,'$1.$2').split('.');
    let bn=ref[0];
    let bc=Number(ref[1]);
    let cv=Number(ref[2]);
    return {bn,bc,cv}
}

function createSingleVerse(bk,chp,vn,fullBkn,bversionName){
    let vHolder = new DocumentFragment();
    let verseNum = document.createElement('code');
    let verseSpan = document.createElement('span');
    let vText;
    verseNum.setAttribute('ref', fullBkn + ' ' + (chp) + ':' + vn);
    verseNum.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
    verseNum.prepend(document.createTextNode(`[${(bk)} ${(chp)}:${vn}]`));
    verseNum.title = bversionName + ' ' + fullBkn + chp + ':' + i;
    verseSpan.classList.add('verse');
    vText = window[bversionName][fullBkn][chp - 1][vn - 1]
    verseSpan.classList.add('v_'+bversionName);
    vHolder.append(parseVerseText(vText, verseSpan));
    verseSpan.prepend(' ');
    verseSpan.prepend(verseNum);
    verseSpan.innerHTML = verseSpan.innerHTML;
    createTransliterationAttr(vHolder)
    return vHolder
}

/* *********************************** */
/* Change Verse on Scroll Over CodeRef */
/* *********************************** */
pagemaster.addEventListener("wheel", wheelDirection, { passive: false });
function wheelDirection(e) {
    if(e.target.matches('#context_menu:not([strnum]) code[ref]')){
        e.preventDefault();
        if(e.deltaY<0){cmenu_goToPrevOrNextVerse('prev')}
        else if(e.deltaY>0){cmenu_goToPrevOrNextVerse('next')}
    }
}