let isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
let bible_nav = document.querySelector('#bible_nav');
let refnav = document.querySelector('#refnav');

let contextMenu_touch="contextmenu";
if(isMobileDevice){
    // contextMenu_touch="touchstart";
}

function clog(x){console.log(x);console.trace(x)}
/* GENERAL HELPER FUNCTIONS */

/* Ensure doublick does not run click eventListner */
function debounce(func, timeout = 300) {
    // function func will only run if it is not clicked twice within 300ms
    var ttt;
    return function () {
        if (ttt) {
            clearTimeout(ttt)
            ttt = undefined;
        } else {
            // console.log('setting Timeout')
            const context = this
            const args = arguments
            ttt = setTimeout(() => {
                func.apply(context, args);
                ttt = undefined;
                // console.log('done & cleared')
            }, timeout)
        }
    }
}

/* ***************************** */
/*       DOM MANIPULATIONS       */
/* ***************************** */
function createNewElement(elmTagName,classIdAttr){
    /*
    This function can take any number of parameters (arguments)
    However, the first one must be the name of the element
    The others will be class name, id, and/or attribute
        * classes must start with a dot ('.')
        * ids must start with a dot ('#')
        * attributes must be enclosed in square brackets ('[]')--[attribute="value"]
    */
    let newElm=document.createElement(elmTagName);

    for (var i = 1; i < arguments.length; i++) {
        let currentParam = arguments[i].trim();
        // Replace Spaces With Underscore
        currentParam = currentParam.replace(/\s+/g,'_');
		// For classes
        if(/^\./.test(currentParam)){
            let className = currentParam.replace(/^\./,'');
            newElm.classList.add(className)
        }
		// For ids
        else if(/^#/.test(currentParam)){
            let iD = currentParam.replace(/^#/,'');
            newElm.id = iD;
        }
		// For Attributes - [attrName=]
        else if(/^\[.+\]/.test(currentParam)){
            let attrNvalue = currentParam.replace(/^\[(.+)\]/,'$1').replace(/(=)\s*["']/g,'$1').replace(/["']\s*(\])/g,'$1');
            let attr = attrNvalue.split('=')[0];
            let val = attrNvalue.split('=')[1];
            newElm.setAttribute(attr,val);
        }
        else if(currentParam!='' && /^[\d-]/.test(currentParam)){
            let className = currentParam;
            newElm.classList.add(className)
        }
	}
    return newElm
}
function elmAhasElmOfClassBasAncestor(a, ancestorsClass, limit = 'BODY') {
    while (a.parentElement && a.parentElement.tagName.toUpperCase() != limit) {
        if (a.parentElement.classList.contains(ancestorsClass) || a.parentElement.matches(ancestorsClass)) {
            return a.parentNode
        }
        a = a.parentElement;
    }
    return false
    
    //The :has() pseudo selector will do this quite easily, but,
    // First: elmA will have to be represented as a css selector, e.g., 'div>.a', and
    // Second: It is not yet supported in Mozilla FireFox
    // E.g: if(querySelector('.ancestorsClass:has(div>.a)'){return true})
}
function hideORshowID(hideOrShow, id) {
    if (hideOrShow.toUpperCase() == 'HIDE') {
        var id2hide = document.querySelectorAll('#' + id);
        id2hide.forEach(el => {
            el.style.display = 'none'
        });
    } else if (hideOrShow.toUpperCase() == 'SHOW') {
        var id2show = document.querySelectorAll('#' + id);
        id2show.forEach(el => {
            el.style.display = ''
        });
    } else {
        id = hideOrShow
        var id2toggle = document.querySelector('#' + id);
        // console.log(id2toggle.style.display)
        if (id2toggle.style.display == "none") {
            id2toggle.style.display = "block";
        } else {
            id2toggle.style.display = "none";
        }
    }
}
function hideORshowClass(hideOrShow, cls) {
    if (hideOrShow.toUpperCase() == 'HIDE') {
        var class2hide = document.querySelectorAll('.' + cls);
        class2hide.forEach(el => {
            el.style.display = 'none'
        });
    } else if (hideOrShow.toUpperCase() == 'SHOW') {
        var class2show = document.querySelectorAll('.' + cls);
        class2show.forEach(el => {
            el.style.display = ''
        });
    }
}
function hideElement(el) {
    el.classList.add("displaynone")
}
function showElement(el) {
    el.classList.remove("displaynone")
}
function toggleClassAndActiveButton(elm,cls,originElm){
    if(Array.isArray(elm)){
        elm.forEach(x=>{
            x.classList.toggle(cls)
        })
    } else {
        elm.classList.toggle(cls)
    }
    if(originElm){originElm.classList.toggle('active_button');}
}
function disableButton(cls, disableValue) {
    var class2toggleAttribute = document.querySelectorAll('.' + cls);
    class2toggleAttribute.forEach(el => {
        el.disabled = disableValue;
        if (disableValue) {
            el.style.pointerEvents = 'none';
            el.style.color = 'grey';
            el.style.fontStyle = 'italic';
        } else if (!disableValue) {
            el.style.pointerEvents = '';
            el.style.color = '';
            el.style.fontStyle = '';
        }
    });
    // Or just create a css style for class, e.g., 'button_disabled',
    // and then add the class to buttons to be disabled
}

// Check or uncheck radio/checkbox input
function checkUncheck(x){
    let arrOfCheckBoxes;
    if(Array.isArray(x)==false){arrOfCheckBoxes=[x]}
    else{arrOfCheckBoxes=x}

    arrOfCheckBoxes.forEach(rcbx => {/* 
        if(rcbx.type=='input'){rcbx.click();}
        else{ */if(rcbx.checked==true){rcbx.checked=false}
        else{rcbx.checked=true}/* } */
    });
}
function unCheckOthers(x,z){
    let arrOfCheckBoxes = x.querySelectorAll('input:checked');
    
    arrOfCheckBoxes.forEach(rcbx => {
        if(rcbx!=z && rcbx.checked==true){rcbx.checked=false}
    });
}
function insertElmAbeforeElmB(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode);
}
function insertElmAafterElmB(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextElementSibling);
}
function relocateElmTo(elm, moveHere) {
    let elmCopy = elm.cloneNode(true);
    elm.remove();
    moveHere.append(elmCopy)
}
function areAllitemsOfAinB(a, b) {
    if (a.every(elem => b.indexOf(elem) > -1)) {
        return true
    } else {
        return false
    }
}


/* ****************************************** */
/*      DOM ANIMATIONS & BEAUTIFICATIONS      */
/* ****************************************** */
function randomColor(brightness) {
    function randomChannel(brightness) {
        var r = 255 - brightness;
        var n = 0 | ((Math.random() * r) + brightness);
        var s = n.toString(16);
    return (s.length == 1) ? '0' + s : s;
    }
    return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
}
/* **************************************** */
/* ****Lighten, Darken or Blend Colors.**** */
/* **https://stackoverflow.com/a/13542669** */
/* **************************************** */
const pSBC=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}
function changeElmTextNodeTo(elm,txt){
    let tnodeValString;
    if(elmLabel = elm.querySelector('label')){
        if(txt){elmLabel.innerText = txt}
        tnodeValString = elmLabel.innerText.textContent;
    }
    else {
        let textNodeValue;
        textNodeValue = Array.from(elm.childNodes).filter(function(x) {
            return x.nodeType == Node.TEXT_NODE;
        })[0];textNodeValue
        tnodeValString = textNodeValue.textContent;
        if(txt){
            textNodeValue.remove();
            elm.append(txt)
        }
    }
    if(txt){checkUncheck(elm.querySelector('input'))}
    return tnodeValString
}
function windowsSelection(){
    const selObj = window.getSelection();
    const selRange = selObj.getRangeAt(0);
    return selRange
}
/* SLIDE UP & SLIDE DOWN */
let slideUpDownTimer;
function slideUpDown(elm, upOrDown){
    elm.style.transition = 'all 0.3s ease-in-out';
    if(slideUpDownTimer){clearTimeout(slideUpDownTimer)}
    
    const tMargin = elm.offsetHeight;
    let animDuration = (tMargin * 0.8);

    if(animDuration<=0){
        if(anim_dur = elm.getAttribute('anim_dur')){
            animDuration = anim_dur;
        }
    }
    if(animDuration<300){
            animDuration = 300;
        }
    elm.style.transition = 'all ' + animDuration/1000 + 's ease-in-out';

    // SHOW It If It is Hidden
    if(upOrDown=='show'|| upOrDown=='down'||elm.classList.contains('sld_up')){
        if(elm.style.zIndex == ''||elm.style.zIndex > '-1'){
            elm.style.zIndex = '-1'
        }
        elm.style.display = '';
        // elm.style.display = elm.getAttribute('display');
        elm.style.opacity = 1;
        setTimeout(() => {
            elm.classList.remove('sld_up')
            elm.style.position = '';
            elm.style.marginTop = '0';
        }, 1);
        setTimeout(() => {
            elm.style.zIndex = '';
        }, animDuration);

    }
    // HIDE It If It Is Showing
    else if((upOrDown && (upOrDown=='hide'|| upOrDown=='up'))||!elm.classList.contains('sld_up')) {
        elm.classList.add('sld_up')
        elm.style.marginTop = '-' + tMargin + 'px';
        elm.style.opacity = 0;
        elm.style.zIndex = -1;
        elm.setAttribute('display', elm.style.display);
        elm.setAttribute('anim_dur', animDuration);
        slideUpDownTimer = setTimeout(() => {
            elm.style.setProperty('display', 'none', 'important');
        }, animDuration);
    }
    return animDuration
}
/* REPLACE ALL CHECKBOXES */
function replaceAllCheckBoxesWithFinnerOnes(cbx){
    if(cbx){
        if(isNaN(cbx.length)){//If it is not an array or NodeList
            singleCheckboxReplace(cbx)
        } else {//If it IS An array or NodeList
            cbx.forEach(cb=>{
                singleCheckboxReplace(cb)
            })
        }
    } else {//If no value is supplied
        let allCheckboxes = document.querySelectorAll("button input[type=checkbox]")
        allCheckboxes.forEach(cbx=>{
            singleCheckboxReplace(cbx)
        })
    }
    function singleCheckboxReplace(cbx){
        let checkboxreplacement = document.createElement('SPAN');
        checkboxreplacement.classList.add('checkboxreplacement');
        insertElmAbeforeElmB(checkboxreplacement, cbx);
        relocateElmTo(cbx, checkboxreplacement);
    }
}
replaceAllCheckBoxesWithFinnerOnes()
/* Markers Input Autocomplete from available markers */
function autocomplete(e) {
    // function autocomplete(input, arr) {
    if(!e.target.matches('.v_markerinputnbtn_holder input')){return}
    //Close the existing list if it is open
    closeList();
    let inputElm=e.target;
    let arr=allVMarkersInAllBooks;
    if(autocomplete_1check.checked){arr=arrOfAllVerseMarkersInBook;}
    else if(autocomplete_2check.checked) {arr=allVMarkersInAllBooks;}
    let currentFocus;
    //If the input is empty, exit the function
    if (!inputElm.value){return}
    currentFocus = -1;

    //Create a autocomplete_items <div> and add it to the element containing the input field
    let autocomplete_items = document.createElement('div');
    autocomplete_items.setAttribute('id', 'autocomplete_items');
    inputElm.parentNode.appendChild(autocomplete_items);

    //Iterate through all entries in the list and find matches
    for (let i=0; i<arr.length; i++) {
        if (arr[i].toUpperCase().includes(inputElm.value.toUpperCase())) {
            //If a match is found, create a suggestion <div> and add it to the autocomplete_items <div>
            suggestion = document.createElement('div');
            suggestion.innerText = arr[i];            
            suggestion.addEventListener('click', function () {
                inputElm.value = this.innerText;
                inputElm.focus();
                closeList();
            });
            autocomplete_items.appendChild(suggestion);
        }
    }


    /*execute a function presses a key on the keyboard:*/
    inputElm.addEventListener("keydown", function(e) {
        let x;
        if (autocomplete_items){x = autocomplete_items.getElementsByTagName("div");}
        // arrow DOWN key
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        }
        // arrow UP key
        else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        }
        // ENTER key
        else if (e.keyCode == 13) {
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /* classify an item as "active":*/
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete_active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete_active");
        }
    }

    
    function closeList() {
        let autocomplete_items = document.getElementById('autocomplete_items');
        if (autocomplete_items)
            autocomplete_items.parentNode.removeChild(autocomplete_items);
    }
}

/* ****************************** */
/*    DOM EXPLORATIONS/QUERIES    */
/* ****************************** */
function getBoxShadowColor(elm){
    // GET FIRST SHADOW COLOR
    // Even if element has more than one box-shadow color, it will only get the first one
    let boxShadowOfElem = window.getComputedStyle(elm, null).getPropertyValue("box-shadow");
    return boxShadowOfElem.split('px')[0].replace(/^.*(rgba?\([^)]+\)).*/,'$1')
}
function X_hasNoSibling_Y_b4_Z(x, y, z) {
    let a = x,
        yes_no = false,
        Y = null,
        Z = null,
        elm2appendAfter = x;
    while (a.nextElementSibling) {
        if (a.nextElementSibling.matches(z)) {
            Z = a.nextElementSibling;
            elm2appendAfter = x;
            yes_no = true;
            break
        } else if (a.nextElementSibling.matches(y)) {
            Y = a.nextElementSibling;
            elm2appendAfter = Y;
            aa = Y.nextElementSibling;
            yes_no = false;
            while (aa) {
                if (aa.matches(z)) {
                    Z = aa;
                    break
                }
                aa = aa.nextElementSibling;
            }
            break
        } else {
            a = a.nextElementSibling;
        }
    }
    return {
        elm2appendAfter: elm2appendAfter,
        yes_no: yes_no,
        elmY: Y,
        elmZ: Z
    }
}
function getSibling_Y_of_X_b4_Z(x, y, z) {}

function arrayOfNodesBetween(a, b) {
    //first check if they have the same parent
    let a_b_parent = a.parentNode;
    if (a_b_parent != b.parentNode) {
        return {
            array: [],
            indexOfA: -1,
            indexOfA: -1,
            length: 0
        }
    }
    let childNodesArr = a_b_parent.childNodes;
    let aIndx = null;
    let bIndx = null;
    //find their respective positions in their parent
    for (i = 0; i < childNodesArr.length; i++) {
        let cnode = childNodesArr[i];
        if (cnode == a) {
            aIndx = i
        }
        if (cnode == b) {
            bIndx = i
        }
        //no need to loop through every node once we have the indexes of a and b
        if (aIndx != null && bIndx != null) {
            return allnodesbtwAnB(childNodesArr, aIndx, bIndx)
        }
    };

    function allnodesbtwAnB(childNodesArr, aIndx, bIndx) {
        let arrOfNodesInbetween = [];
        if (aIndx == bIndx) {
            return arrOfNodesInbetween
        }
        let n1 = null,
            n2 = null;
        if (aIndx < bIndx) {
            n1 = aIndx;
            n2 = bIndx
        } else {
            n1 = bIndx;
            n2 = aIndx
        }
        for (j = n1 + 1; j < n2; j++) {
            arrOfNodesInbetween.push(childNodesArr[j])
        }
        return {
            arr: arrOfNodesInbetween,
            indexOfA: aIndx,
            indexOfA: bIndx,
            length: arrOfNodesInbetween.length
        }
    }
}
function arrayOfElementsBetween(a, b) {
    //first check if they have the same parent
    let a_b_parent = a.parentElement;
    if (a_b_parent != b.parentElement) {
        return {
            array: [],
            indexOfA: -1,
            indexOfA: -1,
            length: 0
        }
    }
    let childrenArr = a_b_parent.children;
    let aIndx = null;
    let bIndx = null;
    //find their respective positions in their parent
    for (i = 0; i < childrenArr.length; i++) {
        let cElm = childrenArr[i];
        if (cElm == a) {
            aIndx = i
        }
        if (cElm == b) {
            bIndx = i
        }
        //no need to loop through every element once we have the indexes of a and b
        if (aIndx != null && bIndx != null) {
            return allElementsbtwAnB(childrenArr, aIndx, bIndx)
        }
    };

    function allElementsbtwAnB(childrenArr, aIndx, bIndx) {
        let arrOfNodesInbetween = [];
        if (aIndx == bIndx) {
            return arrOfNodesInbetween
        }
        let n1 = null,
            n2 = null;
        if (aIndx < bIndx) {
            n1 = aIndx;
            n2 = bIndx
        } else {
            n1 = bIndx;
            n2 = aIndx
        }
        for (j = n1 + 1; j < n2; j++) {
            arrOfNodesInbetween.push(childrenArr[j])
        }
        return {
            array: arrOfNodesInbetween,
            indexOfA: aIndx,
            indexOfA: bIndx,
            length: arrOfNodesInbetween.length
        }
    }
}

/* ********************************************* */
/* LIGHTCITY BIBLE APP SPECIFIC HELPER FUNCTIONS */
/* ********************************************* */
function codeElmRefClick(e) {
    if (e.target.tagName == "CODE" && !e.target.matches('.cmtitlebar>code')) {
        let codeElm = e.target;
        
        // If it is the verseNotePage and not the index.html.
        if(document.querySelector('body').matches('#versenotepage')){
            
            let col2 = document.querySelector('#col2');
            col2.innerHTML = `<div id="context_menu" class="context_menu slideoutofview"></div><details open><summary><div class='openCloseIconHolder'></div><h1 class="win2_bcv_ref">${codeElm.getAttribute('ref')}</h1></summary><div class="win2_noteholder"><em>loading...</em></div></details>`;
            
            win2_noteholder = col2.querySelector('.win2_noteholder')

            let refDetails = refDetails4rmCodeElm(codeElm);
            // clog({bN, bC, cV,win2_noteholder})
            bN = refDetails.bookName;
            bC = refDetails.bookChapter;
            cV = refDetails.chapterVerse;
            bookName = bN;
            chapternumber = bC;
            verseNumber = cV;
            readFromVerseNotesFiles(bN, bC, cV,win2_noteholder)
        }
        else{
            gotoRef(codeElm.getAttribute('ref'))
        }
        e.preventDefault();
    }
}
function refDetails4rmCodeElm(codeElm){
    let bC=codeElm.getAttribute('chpt').trim();
    let bkNvrs=codeElm.getAttribute('ref').split(' ' + bC + ':');
    let bN=bkNvrs[0].trim();
    let cV=bkNvrs[1].trim();
    return {
        bookName:bN,
        bookChapter:bC,
        chapterVerse:cV
    }
}

/* WATCH FOR INACTIVITY IN ELM AND RUN FUNCTION AFTER SET-TIME */
// https://www.brcline.com/blog/detecting-inactivity-in-javascript
function runFuncAfterSetTimeInactivityInElm(elm2Watch, timeoutInMiliseconds = 60000, func2run){
    var timeoutId;

    function resetTimer() { 
        window.clearTimeout(timeoutId)
        startTimer();
    }
      
    function startTimer() {
        // window.setTimeout returns an Id that can be used to start and stop a timer
        timeoutId = window.setTimeout(doInactive, timeoutInMiliseconds)
    }
      
    function doInactive() {
        // Clear the eventListeners
        elm2Watch.removeEventListener("mousemove", resetTimer, false);
        elm2Watch.removeEventListener("mousedown", resetTimer, false);
        elm2Watch.removeEventListener("keypress", resetTimer, false);
        elm2Watch.removeEventListener("touchmove", resetTimer, false);
        // if(searchsettings.classList.contains('active_button')){searchsettings.click()}
        // totalfound.innerHTML='Search Cleared';
        func2run()
    }
     
    // function setupTimers () {
        elm2Watch.addEventListener("mousemove", resetTimer, false);
        elm2Watch.addEventListener("mousedown", resetTimer, false);
        elm2Watch.addEventListener("keypress", resetTimer, false);
        elm2Watch.addEventListener("touchmove", resetTimer, false);
         
        startTimer();
    // }
}

/* FOR CROSS-REFS & NOTES IN SEARCH WINDOW */
function crfnnote_DIV(vHolder){
    let crfnnote_DIV = document.createElement('DIV');
    crfnnote_DIV.classList.add('crfnnote');
    const tskBtn = '<button class="buttons verse_crossref_button">TSK</button>';
    // const noteBtn = '<button class="buttons verse_notes_button">Note</button>';
    const noteBtn = '';
    
    if (vHolder && crossReferences_fullName[vHolder.querySelector('code[ref]').getAttribute('ref').replace(/(\w)\s([0-9]+)/g, '$1.$2').replace(/:/g, '.')]) {
        crfnnote_DIV.innerHTML = `<div class="crfnnote_btns">${tskBtn}${noteBtn}</div>`;
    } else if (vHolder){
        crfnnote_DIV.innerHTML = `<div class="crfnnote_btns" title="Not Crossreferenced"><button class="verse_crossref_button" style="display:none;">TSK</button>${noteBtn}<i style="font-size:0.55em;color:red;">Not Crossreferenced</i></div>`;
    } else {
        crfnnote_DIV.innerHTML = `<div class="crfnnote_btns">${tskBtn}${noteBtn}</div>`;
    }
    // if(vHolder){vHolder.classList.add('verse');}
    return crfnnote_DIV
}

/* CHECK IF DEVICE IS A MOBILE DEVICE */
// window.addEventListener("load", () => {
//     // (A) CHECK FOR MOBILE
//     isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
   
//     // (B) DO SOMETHING...
//     if (isMobile) { console.log("Is mobile device"); }
//     else { console.log("Not mobile device"); }
//   });

/* ***************************************** */
/*                   REGEX                   */
/* ***************************************** */
function modifyQuotationMarks(txt){
    txt = txt.replace(/&nbsp;/ig, ' ');
    // Modify Opening Quotation Marks
    txt = txt.replace(/<\/em><em>/ig, '');
    txt = txt.replace(/(?<!<[^>]*)(.)\.\.\./ig, '$1…');
    txt = txt.replace(/”…/ig, '“…');
    txt = txt.replace(/(?<!<[^>]*)([\d\w])['‘]([\w…])/ig, '$1’$2');
    txt = txt.replace(/(?<!<[^>]*)(^|[\b\s‘])"/ig, '$1“');
    txt = txt.replace(/(?<!<[^>]*)"([\d\w…‘])/ig, '“$1');
    txt = txt.replace(/(?<!<[^>]*)"([\s.,’])/ig, '”$1');
    txt = txt.replace(/(?<!<[^>]*)([\w\d.,…’])"/ig, '$1”');
    // Modify Closing Quotation Marks 
    txt = txt.replace(/!"/g, '!”');
    txt = txt.replace(/(?<!<[^>]*)(^|[\b\s“])'/ig, '$1‘');
    txt = txt.replace(/(?<!<[^>]*)'([\d\w…“])/ig, '‘$1');
    txt = txt.replace(/(?<!<[^>]*)'([\s.,”])/ig, '’$1');
    txt = txt.replace(/(?<!<[^>]*)([\w\d.,…”])'/ig, '$1’');
    txt = txt.replace(/--/g, '—');
    // Remove <br> that comes before block element closing tag
    txt = txt.replace(/<br>(<\/(p|h\d)>)/ig, '$1');
    txt = txt.replace(/(?<!<[^>]*)(\s+([.,]))/ig, '$2');
    txt = txt.replace(/<span[\s=\":#\w\d]*\">[↵]*<\/span>/ig, '');
    txt = txt.replace(/<(?<tagname>[\w\d]+)><\/\k<tagname>>/ig,'');// Remove empty html elements
    txt = txt.replace(/<span contenteditable="false" data-cke-magic-line="\d+" style="height: \d+px; padding: \d+px; margin: \d+px; display: block; z-index: \d+; color: rgb(\d+, \d+, \d+); font-size: \d+px; line-height: 0px; position: absolute; border-top: \d+px dashed rgb(\d+, \d+, \d+); user-select: none; left: \d+px; right: \d+px; top: \d+px;">  \s*↵\s*<\/span>/ig, '');
    return txt
}

/* FOR CHECKING IF TRANSLATION HAS ANY ISSUE AND WHERE THE ISSUES ARE */
function findMissingIncompleteChapters(translation){
    let reportOBJ={};
    let inCompleteChapters={};
    // Loop through all bible books
    bible.Data.allBooks.forEach((bibleBook,bbkIndx) => {
        let bkchptVdata = bible.Data.verses[bbkIndx];
        let numOfChptsInBk = window[translation][bibleBook].length;
        let expectedNumOfChptsInBk = bkchptVdata.length;
        inCompleteChapters[bbkIndx+'_'+bibleBook]={};

        // Incomplete books
        if(numOfChptsInBk!=expectedNumOfChptsInBk){
            console.log('?Bk?: ' + bibleBook + ':' + numOfChptsInBk +' :insteadOf: ' + expectedNumOfChptsInBk)
        }

        // Complete Books
        // if book has complete number of chapters, check each chapter to see it has complete number of verses
        // window[translation][bibleBook][chNumInBk - 1][vNumInChpt - 1]
        window[translation][bibleBook].forEach((chapt,chpIndx)=>{
            let numOfVrsInChpt = chapt.length;
            let expectedNumOfVrsInChpt = bkchptVdata[chpIndx];
            if(numOfVrsInChpt!=expectedNumOfVrsInChpt){
                inCompleteChapters[bbkIndx+'_'+bibleBook][chpIndx+1]=numOfVrsInChpt + ' :vs: ' + expectedNumOfVrsInChpt
                reportOBJ[bbkIndx+'_'+bibleBook]=inCompleteChapters[bbkIndx+'_'+bibleBook];
            }
        })
    });
    if(Object.keys(reportOBJ).length === 0){
        return "No Issue With Translation: Correct Number of Chapters in Books and Correct Number of Verses in Chpaters"
    }else{
        return reportOBJ
    }
}

/* Check If element is in view on page */
function isFullyScrolledIntoView(el) {
    var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    // Only completely visible elements return true:
    var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
    return isVisible;
}
function isPartiallyScrolledIntoView(el) {
    var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;
    // Partially visible elements return true:
    isVisible = elemTop < window.innerHeight && elemBottom >= 0;
    return isVisible;
}

// https://stackoverflow.com/a/37285344
function ensureInView(container, element) {
    //Determine container top and bottom
    let cTop = container.scrollTop;
    let cBottom = cTop + container.clientHeight;

    //Determine element top and bottom
    let eTop = element.offsetTop;
    let eBottom = eTop + element.clientHeight;

    //Check if out of view
    if (eTop < cTop) {
      container.scrollTop -= (cTop - eTop);
    }
    else if (eBottom > cBottom) {
      container.scrollTop += (eBottom - cBottom);
    }
}
/* ***************************************************** */
/* USING THE FILE SYSTEM ACCESS API --(WORKS ONLY IN CHROMIUM BASED BROWSERS, E.G., EDGE, CHROME)*/
let prevBknAndFilehandle={"bkn":null,"filehandle":null}
async function saveToLocalDrive(file_text_content, fileName, format='json') {
    lifeIsGood = false;
    if (!file_text_content.replace(/\s\n\r/g, '').length){
        // I am trying to prevent it from saving an empty file
        // It will only work if the "file_text_content" being empty is what makes it to sometimes save empty files 
        alert ("Error: Empty File.\nPlease Try Again");
        return
    }
    // store a reference to file handle
    let fileHandle;
    if(!fileName){
      // It works by default for saving verseNotes 
      fileName = `notes_${currentBookName}.json`; //File name should be bookName with .json extension, e.g., Romans.json
    }
    const pickerOpts = {
      suggestedName: fileName, // `note_Romans.json`
      // startIn: 'C:\/Users\/samue\/OneDrive\/Desktop\/Folders on Desktop\/LC Apps\/LC BibleApp 2.0\/bible_notes',
      types: [{
        description: 'Text Files',
        accept: {
          'text/plain': [`.${format}`],
        }
      }, ],
      excludeAcceptAllOption: true,
      multiple: false
    };
    
    //Get file
    async function getFileToSaveTo() {
      [fileHandle] = await window.showOpenFilePicker(pickerOpts);
      let fileData = await fileHandle.getFile();
      let fileText = await file_text_content;
    }

    // Save to file
    async function saveFile() {
        if ((prevBknAndFilehandle.bkn != currentBookName)||(prevBknAndFilehandle.filehandle==null)) {
            let successStatus = await saveFileAs();
            console.log(successStatus)
            if(successStatus==false){
                return false
            }
        } else {actualSaveFile()}
        
        async function actualSaveFile(){
            fileHandle=prevBknAndFilehandle.filehandle;
            let stream = await fileHandle.createWritable(pickerOpts);
            await stream.write(file_text_content);
            await stream.close();
            console.log('SaveFile Complete')
            return true
        }

        async function saveFileAs() {
            try {
                fileHandle = await window.showSaveFilePicker(pickerOpts);
                // Save the filehandle against its bookName
                prevBknAndFilehandle.bkn=currentBookName;
                prevBknAndFilehandle.filehandle=fileHandle;
                console.log(fileHandle);
                if(await fileHandle){actualSaveFile()}
                // saveFile()
                return true
            } catch (ex) {
                if (ex.name === 'AbortError') {
                    console.log('🔔 Save Operation Aborted!');
                    // alert('🔔 Save Operation Aborted!');
                    return false
                }
                const msg = 'An error occured trying to open the file.';
                console.error(msg, ex);
                alert(msg);
            }
        }
    }
        
    return await saveFile()
}
/* DOWNLOAD MODIFIED JSON FILE */
/* function downloadFile(text_data, name = "myData", format = "json") {
  // const blob = new Blob([JSON.stringify(obj, null, 2)], {
  //     type: "application/json",
  //   });
  console.log(name)
  const blob = new Blob([text_data], {
      type: "application/octet-stream",
  });
  const href = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
      href,
      styles: "display:none",
      download: `${name}.${format}` // myData.json
  })
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(href);
  a.remove(a);
} */
/* https://www.youtube.com/watch?v=io2blfAlO6E */
/* ***************************************************** */

// CONVERT DOCUMENT FRAGMENT INTO STRING
function docFrag2String(dfrg){
    const serializer = new XMLSerializer();
    const document_fragment_string = serializer.serializeToString(dfrg);
    const xmlnAttribute = ' xmlns="http://www.w3.org/1999/xhtml"';
    const regEx = new RegExp(xmlnAttribute, 'g');
    return document_fragment_string.replace(regEx, '')
}


/* **************************************** */
/*        Objects & Arrays & Strings        */
/* **************************************** */

/* ARRAYS */
function removeItemFromArray(n, array) {
    if(Array.isArray(n)){
        array.forEach((nArr,i) => {
            if(Array.isArray(nArr) && nArr[0]==n[0]){array.splice(i, 1);}
        });
    } else {
        const index = array.indexOf(n);
        // if the element is in the array, remove it
        if (index > -1) {
            // remove item
            array.splice(index, 1);
        }
    }
    return array;
}
function isAsubArrayofB(a, b) {
    let aL = a.length;
    let bL = b.length;
    //b cannot contain a if a is longer
    if (bL >= aL) {
        // start comparison where at the last possible starting point of a in b.
        // E.g., if aL is 3 and bL is 5, then the last possible starting point of a in b is 2
        let lastPossibleStartIndex = bL - aL;
        let lind = lastPossibleStartIndex;
        while (lind >= 0) {
            let i = 0,
            j = lind;
            while (a[i] == b[j]) {
                if (i == aL - 1) {
                    return true
                }
                i++;
                j++;
            }
            lind--; //move backwards in b array from last possible index to the start of b
        }
        return false
    }
    return false
}
function findMatch(array, value){
    return array.find(element => element === value);
}

/* OBJECTS  [DEEP COPY OBJECTS | SORT OBJECTS] */
function isObject(objValue) {
    return objValue && typeof objValue === 'object' && objValue.constructor === Object;
}
function deepCopyObj(obj){
    return JSON.parse(JSON.stringify(obj));
}
function sortObj(obj) {
    return Object.keys(obj).sort((b, a) => b.localeCompare(a)).reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}
/* Remove single string or array of strings from a string */
function removeStringFromString(xh, str) {
    if (typeof xh === 'string' || xh instanceof String) {return str.split(xh).join('')}
    //An array of characters to remove from the string,
    // e.g., "['.',',','lk']"
    else if (Array.isArray(xh)){
        xh.forEach(xh_i=>{str.split(xh_i).join('')});
        return str
    }
}

/* ************************************* */
/*             Verse Markers             */
/* ************************************* */
let allVMarkersInAllBooks;
let addKeyToArrayOfAllVerseMarkers = addKeys2arroaVM();
function addKeys2arroaVM(){
    let arrOfAllVerseMarkersInBibleNotes=[];
    return function(key) {
        if(arrOfAllVerseMarkersInBibleNotes.indexOf(key)==-1){
            arrOfAllVerseMarkersInBibleNotes.push(key);
            arrOfAllVerseMarkersInBibleNotes.sort((b, a) => b.localeCompare(a))
        }
        return arrOfAllVerseMarkersInBibleNotes
    }
}
function appendMarkersToSideBar(){
    if(!document.querySelector('#currentbook_versemarkers_list')){return}
    currentbook_versemarkers_list.setAttribute('empty_txt',`No Markers in ${bookName}`);
    otherbooks_versemarkers_list.setAttribute('empty_txt',`Same As Above`);
    if(allVMarkersInAllBooks){
        // Empty the Marker Sections
        currentbook_versemarkers_list.innerHTML = '';
        otherbooks_versemarkers_list.innerHTML = '';
        allVMarkersInAllBooks.forEach(vm=>{
            let vmHolder=createNewElement('DIV','.vm_btns',`#vm_${vm}`,`[markerfor=marker_${vm}]`);
            let btnPrevious=createNewElement('BUTTON','.vmbtnprevious');
            let btnNext=createNewElement('BUTTON','.vmbtnnext');
            let vmMainBtn = createNewElement('button','.vm',`#marker_${vm}`,`[markerfor=marker_${vm}]`,'[onclick=unCheckOthers(combinedVersemarkers_list,this),checkUncheck(this.querySelector(\'input\'))]');
            let tschk=createNewElement('SPAN','.checkboxreplacement');
            tschk.innerHTML='<input type="checkbox" id="case_sensitive" name="case_sensitive" value="case_sensitive">';
            let tsdiv=createNewElement('DIV');
            tsdiv.innerText=vm;
            vmMainBtn.append(tschk);
            vmMainBtn.append(tsdiv);
            vmHolder.append(vmMainBtn);
            vmHolder.append(btnPrevious);
            vmHolder.append(btnNext);
            if(allBibleMarkersOBJ[bookName] && allBibleMarkersOBJ[bookName].includes(vm)){
                currentbook_versemarkers_list.append(vmHolder)
                currentbook_versemarkers_list.setAttribute('empty_txt',`Markers for ${bookName}`);
            } else {
                otherbooks_versemarkers_list.append(vmHolder)
                otherbooks_versemarkers_list.setAttribute('empty_txt',`Markers for Other Books`);
            }
        })
    }
}

/* ******************************** */
/* *** SCRIPTURE COMPARE WINDOW *** */
/* ******************************** */
function fill_Compareverse(x){
    const x_p = x.parentElement;
    const x_input = x_p.querySelector('.verses_input');
    const ref = x_input.value.replace(/\s+/ig, ' ').replace(/\s*([:;,.-])\s*/ig, '$1');
    x_input.value = ref;
    x_p.nextElementSibling.innerHTML="";
    const vHolder = getCrossReference(ref);
    /* FOR CROSS-REFS & NOTES IN SEARCH WINDOW */
    transliterateAllStoredWords(vHolder)
    let vHolderSpanVerses=vHolder.querySelectorAll('span.verse');
    if(crossRefinScriptureTooltip_check.checked){
        vHolderSpanVerses.forEach(spanVerse=>{
            const tskHolder=crfnnote_DIV(spanVerse);
            // tskHolder.classList.add('displaynone');
            spanVerse.append(tskHolder);
        });
    }
    // Append Version Name
    vHolderSpanVerses.forEach(spanVerse=>{
        spanVerseCode=spanVerse.querySelector('code[ref]');
        spanVerseCode.innerText=`(${bversionName})-${spanVerseCode.getAttribute('ref')}`; 
    });
    x_p.nextElementSibling.append(vHolder);
    
}
function add_verseCompColumn(x){
    let scriptureCompare_columns = elmAhasElmOfClassBasAncestor(x,'.scriptureCompare_columns');
    let newCompareColumn = createNewElement('DIV', '.scriptureCompare_columns');
    newCompareColumn.innerHTML = `<div class="input_n_btn"><input class="verses_input" placeholder="Enter Bible Reference"></input><button onclick="fill_Compareverse(this)">GO</button><button onclick="delete_verseCompColumn(this)">-</button><button onclick="add_verseCompColumn(this)">+</button></div>
    <div class="compare_verses"></div>`;
    insertElmAafterElmB(newCompareColumn, scriptureCompare_columns)
}
function delete_verseCompColumn(x){
    let scriptureCompare_columns = elmAhasElmOfClassBasAncestor(x,'.scriptureCompare_columns');
    if(scriptureCompare_columns_holder.querySelectorAll('.scriptureCompare_columns').length>1){
        scriptureCompare_columns.remove()
    } else {scriptureCompare_columns.querySelector('.compare_verses').innerHTML='';}
}