
main.addEventListener("click", appendCrossReferences);
let bversionName = 'KJV';
function appendCrossReferences(e){
    let refCode = null;
    let vHolder = null;
    function getBVN(classesOfe){
        classesOfe.forEach(cl => {
            if(cl.startsWith('v_')){bversionName=cl.split('v_')[1]; return}
        });
    }
    if(e.target.matches('.verse')){
        let classesOfe=e.target.classList;
        getBVN(classesOfe)
        // console.log(bversionName);
    }else if (classesOfe = elmAhasElmOfClassBasAncestor(e.target,'verse')){
        classesOfe=classesOfe.classList;
        getBVN(classesOfe);
        // console.log(bversionName);
    }
    let versionVerse;
    if(e.target.matches('.vmultiple [ref]')&&!elmAhasElmOfClassBasAncestor(e.target,'vmultiple').nextElementSibling.matches('.crossrefs')){
        refCode = e.target.getAttribute('ref');
        vHolder = elmAhasElmOfClassBasAncestor(e.target,'vmultiple');
        versionVerse=vHolder.querySelector('.v_KJV');
    }
    // if(e.target.matches('.vmultiple')&&!e.target.nextElementSibling.matches('.crossrefs')){
    //     vHolder=e.target;
    //     versionVerse=vHolder.querySelector('.v_KJV');
    //     refCode = e.target.querySelector('code').getAttribute('ref');
    // } else if (vHolder = elmAhasElmOfClassBasAncestor(e.target,'vmultiple')){
    //     if(e.target.matches('.verse')){versionVerse=e.target;}
    //     else {
    //         versionVerse=elmAhasElmOfClassBasAncestor(e.target,'verse');
    //     }
    //     if (!vHolder.nextElementSibling.matches('.crossrefs')){
    //         refCode = vHolder.querySelector('code').getAttribute('ref');
    //     }
    // }
    if(refCode){
        refCode = refCode.replace(/(\w)\s([0-9]+)/g, '$1.$2');
        refCode = refCode.replace(/:/g, '.');
        let crossRef = crossReferences_fullName[refCode];
        function parseCrossRef(crossRef,refCode){
            let crfFrag=new DocumentFragment();
            crossRef.forEach(crf => {
                let crfSpan = document.createElement('SPAN');
                crfSpan.innerText = crf;
                crfFrag.append(crfSpan);
                crfFrag.append('; ');
            });
            let crfDiv = document.createElement('DIV');
            crfDiv.append(crfFrag);
            crfDiv.classList.add('crossrefs');
            vHolder.parentNode.insertBefore(crfDiv, vHolder.nextSibling);
            // versionVerse.append(crfDiv);
            return crfDiv
        }
        parseCrossRef(crossRef,refCode);
        crossReferences_fullName[refCode];
    }
}
function getCrossReference(x){
    // if(e.target.matches('.crossrefs>span')){
        // let crf2get = e.target.innerText;
        let crf2get = x.innerText;
        let bk=crf2get.split('.')[0]
        let chp1=Number(crf2get.split('.')[1]);
        let vrs1=Number(crf2get.split('.')[2]);
        let chp2=chp1;
        let vrs2=vrs1;
        let fullBkn;
        bible.Data.books.forEach((ref_, ref_indx) => {
            if (ref_.includes(bk.toUpperCase())) {
                fullBkn = bible.Data.bookNamesByLanguage.en[ref_indx];
                return
            }
        });
        if(crf2get.includes('-')){//MORE THAN ONE VERSE
            vrs1=Number(crf2get.split('-')[0].split('.')[2]);
            chp2=Number(crf2get.split('-')[1].split('.')[1]);
            vrs2=Number(crf2get.split('-')[1].split('.')[2]);
        }
        let refVrsArr=[];
        let vHolder = new DocumentFragment();
        let br='';
        for(i=vrs1;i<vrs2+1;i++){
            let verseSpan = document.createElement('span');
            function vNum(){
                let verseNum = document.createElement('code');
                verseNum.setAttribute('ref', bk + ' ' + (chp1) + ':' + i);
                verseNum.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
                verseNum.prepend(document.createTextNode(`[${(bk)}.${(chp1)}:${i}]`));
                verseNum.title=bversionName+' '+bookName;
                verseSpan.prepend(verseNum);
                // if(br){
                    verseSpan.innerHTML=br+verseSpan.innerHTML;
                // }
                // else{verseSpan.innerHTML='<div></div>'+verseSpan.innerHTML;}
            }
            vNum();
            let vText = window[bversionName][fullBkn][chp1-1][i-1]
            // console.log(parseVerseText(vText, verseSpan));
            vHolder.append(parseVerseText(vText, verseSpan));
            br='<br>';
        }
        return vHolder;
}

// main.addEventListener("click", searchPreviewRefClick)