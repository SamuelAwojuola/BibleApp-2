/* BIBLE REFERENCE ABBREVIATIONS */
// var requestURLBibleRefAbr = 'data/key_abbreviations_english.json';
// var ref_abreviations = new XMLHttpRequest();
// ref_abreviations.open('GET', requestURLBibleRefAbr);
// ref_abreviations.responseType = 'json';
// ref_abreviations.send();

let ref_Abrev;
// ref_abreviations.onload = function () {
//     ref_Abrev = ref_abreviations.response;
// }
ref_Abrev = bible.Data.books;
//On enter go to reference
document.addEventListener("keypress", function (event) {
    if(document.activeElement.matches('.reference') && event.key === "Enter") {
        let focusElm = document.activeElement;
        if(focusElm.matches('.homepage')){
            gotoRef(focusElm.value)
        } else {
            getCrossReference(focusElm)
        }
        event.preventDefault();
    }
});

function changeSingleStringToTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}

function gotoRef(ref_to_get, shouldBrowserHistoryBeUpdated=true) {
    // clog(ref_to_get)
    let ref_bkname, ref_chpnVer, ref_chp, ref_ver, refDisplay;
    let ref;
    if(ref_to_get){ref=ref_to_get}else{ref=reference.value;}
    ref = ref.trim();
    if(ref==''){return}
    //convert every none-digit and none-word to space
    ref = ref.replace(/[.,:;_]/g, ' ');
    //ensure every space is a single space
    ref = ref.replace(/\s+/g, ' ');
    //seperate between number and letter
    ref = ref.replace(/(\d)([a-zA-Z]+)/g, '$1 $2');
    ref = ref.replace(/([a-zA-Z]+)(\d)/g, '$1 $2');
    let refArrbySpace = ref.split(" ");

    // Convert Roman Numerals at start of bookName to numbers
    if (refArrbySpace[0].toLowerCase() == 'i') {
        refArrbySpace.splice(0, 1, '1')
    } else if (refArrbySpace[0].toLowerCase() == 'ii') {
        refArrbySpace.splice(0, 1, '2')
    } else if (refArrbySpace[0].toLowerCase() == 'iii') {
        refArrbySpace.splice(0, 1, '3')
    } else if (refArrbySpace[0].toLowerCase() == 'iv') {
        refArrbySpace.splice(0, 1, '4')
    }

    let spaceSepratedRef=refArrbySpace.join(' ')
    if (ref_bknameMatch = spaceSepratedRef.match(/([1-9]*\s*)([a-zA-Z]\s*)+/)) {
        ref_bkname=ref_bknameMatch[0];
        ref_chpnVer=spaceSepratedRef.split(ref_bkname).pop();
        ref_bkname=ref_bkname.trim();
    }
    /* If no bookname */
    else {
        let currentBook = bible_books.querySelector('.ref_hlt');
        ref_bkname = currentBook.getAttribute('bookname');
        ref_chpnVer=spaceSepratedRef.split(ref_bkname).pop();
    }
    
    ref_chp = 1;// default
    ref_ver = 1;// default
    if(ref_chpnVer.trim().length>0){
        let ref_chpnVer_arr=ref_chpnVer.split(' ')
        ref_chp=Number(ref_chpnVer_arr[0].trim());
        if (ref_chpnVer_arr.length>1) {
            ref_ver=Number(ref_chpnVer_arr[1].trim().match(/[1-9]+/)[0]);
        }
    }
 
    // Find id of Book
    ref_Abrev.forEach((ref_, ref_indx) => {
        if (ref_.includes(ref_bkname.toUpperCase())) {
            ref_bkname = bible.Data.bookNamesByLanguage.en[ref_indx]
            let refb = ref_indx;
            if (/* !currentBook ||  */currentBook != refb) {
                // document.querySelector(`[value="book_${refb}"]`).click(); //click on book
                let selected_chapter=document.querySelector(`[value="book_${refb}"]`);
                getBksChptsNum(selected_chapter)
                let chptOption = document.querySelector(`[value="bk${refb}ch${ref_chp-1}"]`);
                getTextOfChapter(chptOption,1,null,true,shouldBrowserHistoryBeUpdated);
            }
            bkXchY = `bk${ref_indx}ch${ref_chp}`;
            ref_chpnVer = (ref_chp - 1) + '.' + (ref_ver - 1);
            let targetVerse = document.getElementById(`_${refb}.${ref_chpnVer}`);
            scrollToVerse(targetVerse)
            return
        }
    });
    refDisplay = ref_bkname + ' ' + (ref_chp) + ':' + (ref_ver);
    reference.value = refDisplay;
}

// TO SHOW BIBLE_NAV ON CLICK OF REFERENCE INPUT
if(document.body.matches('#homepage')){reference.addEventListener('click', showBibleNav)}
function showBibleNav(e) {
    if(isMobileDevice ||showBible_Nav_check.checked){
        hideRefNav("show",bible_nav);
        refCol2showingChild=refnav.querySelector('#refnav_col2');
        refCol2showingChild.querySelector('.bkname.ref_hlt').scrollIntoView({block:"center"});
        refCol2showingChild.querySelector('.chptnum.ref_hlt').scrollIntoView({block:"center"});
    }
    if(isMobileDevice){reference.blur();}
}