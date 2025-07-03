//For Forward and Backward refNavigation
let browserHistory_lastRef, hll=200//HistoryListLength;
// let visitedRefsBack=[];
// let visitedRefsFront=[];
let currentRef=null;
let updateRefBrowserHistory = (ref,clrRefFront) => {
    // if(e.state.ref&&e.state.ref==ref){return}
    browserHistory_lastRef = ref;
    let vrF=''; vrB='';
    // if (ref && (window.location.hash==''||ref!=window.location.hash.split('%20').join(' '))) {
    if (ref) {
        // update the URL
        // const entry = `index.html#${ref}`; //const entry = `#${ref}`;
        // history.pushState({ref},"",entry);
        if(clrRefFront){// If it is a new reference
            visitedRefsFront=[];
            refhistoryfront.disabled = true;
            vrB = visitedRefsBack[0] ? visitedRefsBack[0] : '';
            vrF = visitedRefsFront[0] ? visitedRefsFront[0] : '';
            refhistoryfront.title=vrF;
            refhistoryback.title=vrB;
            setItemInLocalStorage('visitedRefsFront', '');
        }
        if(currentRef && currentRef!=ref && visitedRefsBack[0]!=currentRef){
            visitedRefsBack.unshift(currentRef);// add to start of array
            refhistoryback.disabled = false;
            vrB = visitedRefsBack[0] ? visitedRefsBack[0] : '';
            vrF = visitedRefsFront[0] ? visitedRefsFront[0] : '';
            refhistoryfront.title=vrF;
            refhistoryback.title=vrB;
            setItemInLocalStorage('visitedRefsBack', visitedRefsBack.toString());
            setItemInLocalStorage('visitedRefsFront', visitedRefsFront.toString());
        }
        currentRef = ref;
    }
    reference.value=ref;
};
// Native Browser History
// addEventListener("popstate", function (e) {
//     if (e.state.ref !== null) {gotoRef(e.state.ref, false)}//'false' is so it won't register it in the browser history
//     else {gotoRef(defaultReference, false)}
// });
let firstRefinArr;
function refHistoryNavigate(backFront=null, positionInArray=1){

    //First, hide the lists if showing
    refhistorylist_back.classList.add('displaynone');
    refhistorylist_front.classList.add('displaynone');
    
    //Then navigate
    positionInArray=Number(positionInArray);
    firstRefinArr=null;
    if(backFront=='back' && visitedRefsBack.length!=0){
        for (let q = 0; q < positionInArray; q++){
            firstRefinArr = visitedRefsBack.shift();
            visitedRefsFront.unshift(currentRef)// add to the start of the other array
            currentRef = firstRefinArr;
        }
        if(visitedRefsFront.length>hll){visitedRefsFront.length=hll}//Limit history to 200 references
        gotoRef(firstRefinArr,false);
    }
    else if(backFront=='front' && visitedRefsFront.length!=0){
        for (let q = 0; q < positionInArray; q++) {
            firstRefinArr = visitedRefsFront.shift();
            visitedRefsBack.unshift(currentRef)// add to the start of the other array
            currentRef = firstRefinArr;
        }
        if(visitedRefsBack.length>hll){visitedRefsBack.length=hll}//Limit history to 200 references
        gotoRef(firstRefinArr,false);
    } else {
        refHistoryBtnsUpdate();
        return
    }

    refHistoryBtnsUpdate();//Disable or Enable refhistory buttons
    setItemInLocalStorage('visitedRefsBack',visitedRefsBack.toString());
    setItemInLocalStorage('visitedRefsFront',visitedRefsFront.toString());
    function refHistoryBtnsUpdate() {
        //Disable or Enable refhistory buttons
        let vrF=''; vrB='';
        if(visitedRefsBack.length>0){
            refhistoryback.disabled = false;
            vrB=visitedRefsBack[0];
        }
        else {refhistoryback.disabled = true;}
        if(visitedRefsFront.length>0){
            refhistoryfront.disabled = false;
            vrF=visitedRefsFront[0];
        }
        else {refhistoryfront.disabled = true;}
        refhistoryfront.title=vrF;
        refhistoryback.title=vrB;
        if(firstRefinArr){setTimeout(()=>{reference.value=firstRefinArr},0);}
    }
}
document.addEventListener('keydown', refHistoryNavEListner);
function refHistoryNavEListner(e) {
    if (e.shiftKey || (document.body.classList.contains('cke_dialog_open') && document.activeElement.closest('.cke_dialog_body'))){return}
    let key_code = e.which || e.keyCode;
    switch (key_code) {
        case e.altKey && 37: //left arrow key
            refHistoryNavigate('back')
            break;
        case e.altKey && 39: //right arrow key
            refHistoryNavigate('front')
            break;
    }
}

function capitalizeFirstAlphabetCharacter(string) {
    // Return empty string or non-string values as is
    if (!string || !string.trim()) {return string;}
    for (let i = 0; i < string.length; i++) {
        if (/^[a-zA-Z]+$/.test(string[i])) {
            return string.substring(0, i) + string[i].toUpperCase() + string.substring(i + 1);
        }
    }
    return string; // Return the string as is if no alphabet character is found
}
function refHistoryListClicked(e) {
    let et = e.target;

    function shortenedRef(ref) {
        // return ref
        let refMatch = ref.match(/(.{2}[^\d]*)(.*)/)
        let bknm = refMatch[1].trim();
        let bknm_reg = new RegExp('^' + bknm, 'i'); // make case insensitive (instead of using bknm.toUpperCase())
        let chptvrs = refMatch[2];
        // let shrtBknm = bible.Data.books[bible.Data.bookNamesByLanguage.en.indexOf(bknm)][1];
        // Matches Standard Book Names Abbreviations. If No Match, Checks For Partial Spelling Match 
        let shrtBknm = bible.Data.books.find(x=>{return x.includes(bknm.toUpperCase())}) ? bible.Data.books.find(x=>{return x.includes(bknm.toUpperCase())})[1] : (bible.Data.books.find(x=>{return x.find(y=>{return y.match(bknm_reg)})}) ? bible.Data.books.find(x=>{return x.find(y=>{return y.match(bknm_reg)})})[1] : null);
        shrtBknm ? shrtBknm = capitalizeFirstAlphabetCharacter(shrtBknm.toLowerCase()) : null;

        return `${shrtBknm} ${chptvrs}`
        
    }
    if(e.type=='contextmenu'){
        if(et.matches('#refhistoryback:not(#refhistoryback:disabled)')){
            refhistorylist_back.innerHTML = '';
            //Populate the list
            visitedRefsBack.forEach((ref,i) => {refhistorylist_back.innerHTML += `<button indx="${i+1}">${shortenedRef(ref)}</button>`;});
            refhistorylist_back.classList.remove('displaynone');
            refhistorylist_front.classList.add('displaynone');
        }
        else if(et.matches('#refhistoryfront:not(#refhistoryfront:disabled)')){
            refhistorylist_front.innerHTML = '';
            //Populate the list
            visitedRefsFront.forEach((ref,i) => {refhistorylist_front.innerHTML += `<button indx="${i+1}">${shortenedRef(ref)}</button>`;});
            refhistorylist_front.classList.remove('displaynone');
            refhistorylist_back.classList.add('displaynone');
        }
        else {
            refhistorylist_back.classList.add('displaynone');
            refhistorylist_front.classList.add('displaynone');
        }
    }
    
    else if(e.type=='click'){
        let indx;
        if(et.matches('#refhistorylist_back>*')){
            indx = et.getAttribute('indx');
            refHistoryNavigate('back', indx)
        }
        else if(et.matches('#refhistorylist_front>*')){  
            indx = et.getAttribute('indx');
            refHistoryNavigate('front', et.getAttribute('indx'))
        }
        else {
            refhistorylist_back.classList.add('displaynone');
            refhistorylist_front.classList.add('displaynone');
        }
    }
}
document.addEventListener('contextmenu', refHistoryListClicked);
document.addEventListener('click', refHistoryListClicked);