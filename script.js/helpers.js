let isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
let bible_nav = document.querySelector('#bible_nav');
let refnav = document.querySelector('#refnav');

let contextMenu_touch="contextmenu";
if(isMobileDevice){
    // contextMenu_touch="touchstart";
}

function clog(x){console.log(x);console.trace(x)}
/* GENERAL HELPER FUNCTIONS */

/* Ensure doubleclick does not run click eventListner */
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
/* ********************************* */
/* ***** BIBLE VERSIONS LOADER ***** */
/* ********************************* */
function loadVersion(versionName) {
    let request_Version_URL = `bibles/${versionName}.json`;
    let bibleVersion = new XMLHttpRequest();
    bibleVersion.open('GET', request_Version_URL);
    bibleVersion.responseType = 'json';
    bibleVersion.send();

    let newVersion;

    bibleVersion.onload = function () {
        let booksChaptersAndVerses = bibleVersion.response;
        newVersion = booksChaptersAndVerses['books'];
        window[versionName] = newVersion; //For automatically assigning values to the variables        
        /* TO ENSURE THE BOOKS ARE ONLY DISPLAYED AFTER THEY HAVE BEEN LOADED */
        if (document.body.matches('#homepage') && runCacheFunc2) {
            if (versionsToShow.includes(versionName.toString())) {
                bibleVersionsLoadedFromCACHE.push(versionName);
            }
            if (versionsToShow2.length == bibleVersionsLoadedFromCACHE.length) {
                cacheFunctions2()
            }
        }
    }
    if (document.body.matches('#homepage')) {
        const svcmp_menu = main.querySelector(':is(.verse,.vmultimple) #singleverse_compare_menu');
        svcmp_menu ? svcmp_menu.remove():null;//remove #singleverse_compare_menu that has been cloned on page load

        let bvInpt = document.createElement('INPUT');
        bvInpt.setAttribute('type', 'checkbox');
        let bvBtn = document.createElement('BUTTON');
        bvBtn.setAttribute('bversion', versionName);
        bvBtn.append(bvInpt);
        bvBtn.innerHTML = bvBtn.innerHTML + versionName;
        bibleversions_btns.append(bvBtn);
        //if there is more than one singleverse_compare_menu
        const x = Array.from(document.querySelectorAll('#singleverse_compare_menu'));
        if(x.length > 0){x.forEach((s,i) => {if(i>0){s.remove()}});}
        singleverse_compare_menu = document.getElementById('singleverse_compare_menu');
        singleverse_compare_menu?.append(bvBtn.cloneNode(true));
        if (unwantedInputs = singleverse_compare_menu?.querySelectorAll('input')) {
            unwantedInputs.forEach(unw => {unw.remove()})
        }
        if (loadedBibleVersions.indexOf(versionName) == -1) {
            loadedBibleVersions.push(versionName)
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
    // while (a.parentElement && a.parentElement.tagName.toUpperCase() != limit) {
    //     if (a.parentElement.classList.contains(ancestorsClass) || a.parentElement.matches(ancestorsClass)) {
    //         return a.parentNode
    //     }
    //     a = a.parentElement;
    // }
    // return false
    // let ancestorOfClass = a.closest(ancestorsClass);
    // return ancestorOfClass ? ancestorOfClass : a.closest('.'+ancestorsClass);
    return a?a.closest(ancestorsClass):null;
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
function hideElement(el) {el.classList.add("displaynone")}
function showElement(el) {el.classList.remove("displaynone")}
function toggleClassAndActiveButton(elm,cls,originElm){
    if(Array.isArray(elm)){
        elm.forEach(x=>{
            const addORremove = x.classList.toggle(cls)
            if(cls=='slideup'){tabIndexChangeHideORshow(x,addORremove < 1)}
        })
    } else {
        if(cls!='displaynone' && cls=='slideup' && elm.matches('.displaynone') && elm.matches('.slideup')){elm.classList.remove('displaynone')}// Add this particularly because of titlebarsearchparameters because of tab selection
        const addORremove = elm.classList.toggle(cls)
        if(cls=='slideup'){tabIndexChangeHideORshow(elm,addORremove < 1)}
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
function ancestorWithPositionRelative(a,pos='relative'){
    while (a.parentElement && a.parentElement.tagName.toUpperCase() != 'HTML') {
        if (getComputedStyle(a.parentElement).position==pos) {
            return a.parentNode
        }
        a = a.parentElement;
    }
    return false
}

// Check or uncheck radio/checkbox input;
function checkUncheck(x){
    let arrOfCheckBoxes;
    if(Array.isArray(x)==false){arrOfCheckBoxes=[x]}
    else{arrOfCheckBoxes=x}
    if(arrOfCheckBoxes.every(x=>x.getAttribute('type')=="radio" && x.checked==true)){return}//ensure clicking on a checked radio input does not uncheck it
    arrOfCheckBoxes.forEach(rcbx => {
        let rcbx_btn=rcbx.closest('button');
        if(rcbx.checked==true){
            rcbx.checked=false
            rcbx_btn?rcbx_btn.classList.remove('active_button'):null;
        }
        else{
            rcbx.checked=true
            rcbx_btn?rcbx_btn.classList.add('active_button'):null;
        }
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
    moveHere.appendChild(elm);
    return elm
}
function areAllitemsOfAinB(a, b) {
    if (a.every(elem => b.indexOf(elem) > -1)) {
        return true
    } else {
        return false
    }
}
function changeElementType(element, newType) {
    // Create a new element with the new type
    let newElement = document.createElement(newType);

    // Copy all attributes from the old element to the new one
    for (let attribute of element.attributes) {
        newElement.setAttribute(attribute.name, attribute.value);
    }

    // Move all children to the new element
    while (element.firstChild) {
        newElement.appendChild(element.firstChild);
    }

    // Replace the old element with the new one
    element.parentNode.replaceChild(newElement, element);

    return newElement;
}


/* ****************************************** */
/*      DOM ANIMATIONS & BEAUTIFICATIONS      */
/* ****************************************** */
function randomColor(brightness,minBrightness=150) {
    function randomChannel(brightness) {
        var r = 255 - Math.max(brightness, minBrightness);
        var n = 0 | ((Math.random() * r) + Math.max(brightness, minBrightness));
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
function isValidColor(str) {
    let cssColorsArray = ["Black","Navy","DarkBlue","MediumBlue","Blue","DarkGreen","Green","Teal","DarkCyan","DeepSkyBlue","DarkTurquoise","MediumSpringGreen","Lime","SpringGreen","Aqua","Cyan","MidnightBlue","DodgerBlue","LightSeaGreen","ForestGreen","SeaGreen","DarkSlateGray","LimeGreen","MediumSeaGreen","Turquoise","RoyalBlue","SteelBlue","DarkSlateBlue","MediumTurquoise","Indigo","DarkOliveGreen","CadetBlue","CornflowerBlue","MediumAquaMarine","DimGray","SlateBlue","OliveDrab","SlateGray","LightSlateGray","MediumSlateBlue","LawnGreen","Chartreuse","Aquamarine","Maroon","Purple","Olive","Gray","SkyBlue","LightSkyBlue","BlueViolet","DarkRed","DarkMagenta","SaddleBrown","DarkSeaGreen","LightGreen","MediumPurple","DarkViolet","PaleGreen","DarkOrchid","YellowGreen","Sienna","Brown","DarkGray","LightBlue","GreenYellow","PaleTurquoise","LightSteelBlue","PowderBlue","FireBrick","DarkGoldenRod","MediumOrchid","RosyBrown","DarkKhaki","Silver","MediumVioletRed","IndianRed","Peru","Chocolate","Tan","LightGrey","PaleVioletRed","Thistle","Orchid","GoldenRod","Crimson","Gainsboro","Plum","BurlyWood","LightCyan","Lavender","DarkSalmon","Violet","PaleGoldenRod","LightCoral","Khaki","AliceBlue","HoneyDew","Azure","SandyBrown","Wheat","Beige","WhiteSmoke","MintCream","GhostWhite","Salmon","AntiqueWhite","Linen","LightGoldenRodYellow","OldLace","Red","Fuchsia","Magenta","DeepPink","OrangeRed","Tomato","HotPink","Coral","Darkorange","LightSalmon","Orange","LightPink","Pink","Gold","PeachPuff","NavajoWhite","Moccasin","Bisque","MistyRose","BlanchedAlmond","PapayaWhip","LavenderBlush","SeaShell","Cornsilk","LemonChiffon","FloralWhite","Snow","Yellow","LightYellow","Ivory","White"];
    // Check if the computed color is a valid color value
    const colorRegex = /^(#([0-9a-fA-F]{3}){1,2}|(rgba?|hsla?)\((\d+%?,\s*){2,3}[\d.]+%?(,\s*[\d.]+\s*)?\))$/;//test for common color formats
    return colorRegex.test(str) || cssColorsArray.some(item => item.toLowerCase() === str.toLowerCase());
}
function rgbToHex(rgbString) {
    // Extract the individual color components (r, g, b)
    const match = rgbString.match(/\d+/g);
    if (!match || match.length !== 3) {
        return rgbString;// Invalid input, return null or handle the error as needed
    }
    const r = parseInt(match[0]);
    const g = parseInt(match[1]);
    const b = parseInt(match[2]);
    // Convert to hexadecimal format
    const hex = `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;   
    return hex;
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
function windowsSelection() {
  const selObj = window.getSelection();
  if (selObj && selObj.rangeCount > 0) {
    return selObj.getRangeAt(0);
  }
  return null;
}
function selectElmContent(elm){
    const range = document.createRange();
    range.selectNodeContents(elm);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}
/* SLIDE UP & SLIDE DOWN */
let slideUpDownTimer;
function slideUpDown(elm, upOrDown, t){
    // Hides Elements By Changing Top Margin
    elm.style.transition = 'all 0.3s ease-in-out';
    if(slideUpDownTimer){clearTimeout(slideUpDownTimer)}
    
    const tMargin = elm.offsetHeight;
    let animDuration = t ? (t>300?300:t) : (tMargin * 0.8);

    if(animDuration<=0 && (anim_dur = elm.getAttribute('anim_dur'))){animDuration = anim_dur;}
    else if(animDuration<300){animDuration = 300;}
    elm.style.transition = 'all ' + animDuration/1000 + 's ease-in-out';

    // SHOW It If It is Hidden
    if((upOrDown && (upOrDown=='show'|| upOrDown=='down'))||elm.classList.contains('sld_up')){
        if(elm.style.zIndex == ''||elm.style.zIndex > '-1'){elm.style.zIndex = '-1';}
        elm.style.display = '';
        // elm.style.display = elm.getAttribute('display');
        elm.style.opacity = 1;
        setTimeout(() => {
            elm.classList.remove('sld_up')
            elm.style.position = '';
            elm.style.marginTop = '0px';
        }, 1);
        setTimeout(() => {elm.style.zIndex = '';}, animDuration);

    }
    // HIDE It If It Is Showing
    else if((upOrDown && (upOrDown=='hide'|| upOrDown=='up'))||!elm.classList.contains('sld_up')) {
        elm.matches('#top_horizontal_bar_buttons') ? documentROOT.style.setProperty('--topbar-height', tMargin+'px'):null;
        elm.classList.add('sld_up');
        elm.style.marginTop = (tMargin * -1) + 'px';
        if(elm.closest('.verse_note')){
            elm.setAttribute('style', `margin-top: calc((var(--topbar-height) + ${-1 * parseInt(elm.style.marginTop)}px) * -1)!important; ${elm.style.cssText.replace(/margin-top[^;]*;*\s*/,'')}`);
        } else {
            elm.style.marginTop = `calc((var(--topbar-height) * -1))`;
        }
        elm.closest('#context_menu,.crossrefs,.crfnnote,.text_content,.notemenu') ? elm.style.marginTop = (-1 * tMargin) + 'px' : elm.style.zIndex = -1;
        // elm.style.opacity = 0;
        // elm.style.zIndex = -1;
        elm.setAttribute('display', elm.style.display);
        elm.setAttribute('anim_dur', animDuration);
        slideUpDownTimer = setTimeout(() => {
            // elm.style.opacity = 0;
            elm.style.setProperty('display', 'none', 'important');
        }, animDuration);
    }
    return animDuration
}
function tabIndexChangeHideORshow(elm,hs){
    if(hs=='show'||hs==true){
        // Make TabIndex Positive
        elm.querySelectorAll('button,select,input').forEach(btn=>{
            if(oldtabindex = btn.getAttribute("oldtabindex")){
                btn.tabIndex = (Number(oldtabindex)*-1)-1;
            }
        })
    }
    // Make TabIndex Negative
    else if(hs=='hide'||hs==false){
        elm.querySelectorAll('button,select,input').forEach(btn=>{
            if(btn.tabIndex>-1){
                const oldtabindex=(Number(btn.tabIndex)+1) * -1;
                btn.tabIndex = oldtabindex;
                btn.setAttribute('oldtabindex',oldtabindex)
            }
        })
    }
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
        cbx.tabIndex=-1;
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
        if (autocomplete_items){autocomplete_items.parentNode.removeChild(autocomplete_items);}
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
function caretXY_VS_mouseDownXY(event) {
    /*  GETS CARETS POSITION SO AS
        TO KNOW WHETHER, e.g., MOUSEDOWN IS ON A WORD OR NOT
    */
    let div3;
    const div = document.createElement("div");
    const fSz = 10;// should be font-size of element
    const maxDistance = Math.sqrt(fSz*fSz + fSz*fSz);
    const x = event.clientX;
    const y = event.clientY;

    createDiv2(x, y);

    return getCaretCoordinates().then(caretCoordinates => logAndCompareCoordinates(caretCoordinates, x, y));

    function createDiv2(x, y) {
        const div2 = document.createElement("div");
        div2.id = "_div2";
        div2.style.position = "absolute";
        div2.style.display = "block";
        div2.style.width = "20px";
        div2.style.height = "20px";
        div2.style.left = x - 10 + "px";
        div2.style.top = y - 10 + "px"; // changed from 'right' to 'top'
        div2.style.zIndex = 100000;
        div2.style.backgroundColor = "orange";
        
        document.body.append(div2);
        document.addEventListener("mouseup", removeDIV);

        function removeDIV() {
            div.remove(); div2.remove(); div3.remove();
            document.removeEventListener("mouseup", removeDIV);
        }
    }

    function getCaretCoordinates() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const sel = window.getSelection();
                if (sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0).cloneRange();
                    div.style.display = "inline-block"; // Ensures it shows up inline if needed
                    div.innerHTML = "|"; // Ensure it's empty
                    div.id = "_div1";

                    range.insertNode(div);

                    // Move the caret after the inserted div
                    range.setStartAfter(div);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);

                    // Get coordinates
                    const divRect = div.getBoundingClientRect();
                    const caretX = divRect.left;
                    const caretY = divRect.top + 10;
                    
                    // TO VISUALIZE POSITION OF CURSOR
                    div3 = document.createElement("div");
                    div3.id = "_div2";
                    div3.style.position = "absolute";
                    div3.style.display = "block";
                    div3.style.width = "20px";
                    div3.style.height = "20px";
                    div3.style.zIndex = 100000;
                    div3.style.left = caretX + "px";
                    div3.style.top = caretY + "px"; // changed from 'right' to 'top'
                    div3.style.backgroundColor = "pink";
                    document.body.append(div3);

                    // div.remove();//remove div
                    resolve({ x: caretX, y: caretY });
                } else {
                    reject(new Error("No selection range found"));
                }
            }, 1);
        });
    }

    function logAndCompareCoordinates(caretXY, x, y) {
        // console.log({x,"caretX":caretXY.x,y,"caretY":caretXY.y})
        const dx = x - caretXY.x;
        const dy = y - caretXY.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        console.log({distance});
        console.log(distance <= maxDistance);
        return (distance <= maxDistance);
    }
}


/* ********************************************* */
/* ********************************************* */
/* LIGHTCITY BIBLE APP SPECIFIC HELPER FUNCTIONS */
/* ********************************************* */
/*              Scripture Reference              */
/* ********************************************* */
/* ********************************************* */
document.addEventListener('keydown', codeElmRefClick);
async function codeElmRefClick(e) {
    //e.button==2 is right click
    if (![0,2].includes(e.button) || e.target.tagName!="CODE" || e.target.matches('.cmtitlebar>code')) {return}
    e.preventDefault();
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
        readFromVerseNotesFiles(bN, bC, cV,win2_noteholder);
    }
    else{
        // require press of ctrlKey + click for code[ref] in #scriptureCompareWindow 
        // if(codeElm.matches('.compare_verses .verse code') && !e.ctrlKey){return}
        // require press of ctrlKey + click for all
        if(e.ctrlKey||codeElm.matches('#biblenotes_nav code[ref]')||e.button==2){
            let hideTime=0;
            let clickedRef = codeElm.getAttribute('ref');
            // Add current topmost visible verse on page to history automatically
            if (e.button==2) {
                let topmostVerseRef = await getHighestVisibleH2(false);
                topmostVerseRef = topmostVerseRef.highestVerse.getAttribute('ref');
                updateRefBrowserHistory(topmostVerseRef);
                if (!e.target.closest('#context_menu') && !e.ctrlKey) {
                    if(gotoRef(clickedRef)){
                        setTimeout(() => {
                            hideRefNav('hide', e.target.closest('#refnav_col2 > div'));
                        }, 1000);
                    }
                }
                else {gotoRef(clickedRef);}
                return
            }
            updateRefBrowserHistory(clickedRef);
            gotoRef(clickedRef);
        }
    }
}
function refDetails4rmCodeElm(codeElm){
    const ref = codeElm.getAttribute('ref');
    let bC=ref.replace(/[\[\]]+/g,'').replace(/\d*(?:\s*\p{L}+)*[\s.]*(\d+)(:\d+\s*)*/gu,'$1');
    bC = bC.match(/\d+/) ? bC : codeElm.getAttribute('chpt').trim();
    let bkNvrs=ref.split(' ' + bC + ':');
    let bN=bkNvrs[0].trim();
    let cV=bkNvrs[1].trim();
    return { bookName:bN, bookChapter:bC, chapterVerse:cV }
}
function breakDownRef(ref){
    ref=ref.replace(/(\p{L})(\d)/ug,'$1 $2');
    let originalRef = ref;
    ref=ref.replace(/[\[\]]+/g,'');
    ref=ref.replace(/\s+/ig,' ').replace(/\s*([:;,.-])\s*/ig,'$1').replace(/\bI\s/i,1).replace(/\bII\s/i,2).replace(/\bIII\s/i,3).replace(/\bIV\s/i,4).replace(/\bV\s/i,5);
    ref=ref.replace(/:([0-9]+)/,'.$1').replace(/(\w)[\s*]([0-9]+)/,'$1.$2').split('.');
    let bn=ref[0];
    let bc=Number(ref[1]);
    let v=ref.length>2 ? ref[2].split(/\s*-\s*/) : [1,bible.Data.verses[bible.parseReference(bn).bookID - 1][bc-1]];//If the ref contains only chapter, make the verse range all the verses in the chapter
    let cv=Number(v[0]);
    let cv2=Number(v[1])?Number(v[1]):null;
    let fullBkn = fullBookName(bn).fullBkn;
    bn = fullBookName(bn).shortBkn;
    let bn_reg = new RegExp(`${bn}`,'ig');
    let fullChpt = !/:|(?:(?:\s|\.)\d+\.\d+)/.test(originalRef) ? `${bn} ${bc}:${cv}-${cv2}` : originalRef.replace(bn_reg,bn);
    fullChpt = fullChpt.trim();
    let standardizedfullref = fullChpt.replace(/[.\s+](\d+)\.(\d+)/g,' $1:$2');
    let shortBknFullRef = standardizedfullref.replace(/\b[^\d]+(.+)/, bn+' $1')
    return {bn,bc,cv,cv2,fullBkn,fullChpt,standardizedfullref,shortBknFullRef}
}
function fullBookName(bkn) {
    let fullBkn;
    let bkIndex;
    let shortBkn;
    bible.Data.books.forEach((bkAbrv, ref_indx) => {
        if (bkAbrv.includes(bkn.toUpperCase())) {
            fullBkn = bible.Data.bookNamesByLanguage.en[ref_indx];
            shortBkn = bkAbrv[0]=='JOB'? 'Job' : bkAbrv[1].toLowerCase().replace(/[0-9]*\s*([a-z])/, (v)=>{return v.toUpperCase()});//Make lowerCase then make first alphabet upperCase
            bkIndex = ref_indx;
        }
    });
    return {fullBkn, bkIndex, shortBkn}
}
function modifyBkNmeOfRef(ref) {
    let full = ref.replace(/([0-9]*\s*[a-zA-Z]*\s*[a-zA-Z])/, (nm)=>{return fullBookName(nm).fullBkn});
    let short = ref.replace(/([0-9]*\s*[a-zA-Z]*\s*[a-zA-Z])/, (nm)=>{return fullBookName(nm).shortBkn})
    return {full,short}
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
    const tskBtn = '<button class="buttons verse_crossref_button">x-Ref</button>';
    let compareBtn='';
    bibleversions_btns.querySelectorAll('[bversion]').forEach(bversion => {
        bversion = bversion.getAttribute('bversion');
        bclass = 'class="buttons compare_withinsearchresult_button"'
        if (bversion==bversionName) {
            bclass = 'class="buttons cbv compare_withinsearchresult_button"'
            bversion=`${bversionName}`
        }
        compareBtn += `<button ${bclass} onmouseup="compareThisSearchVerse(event)" b_version="${bversion}">${bversion}</button>`;
    });
    const noteBtn = '<button class="buttons verse_notes_button" onclick="showNoteForVerseNOTinMainBibleWindow(this)">Note</button>';
    // const noteBtn = '';
    const refval = vHolder.querySelector('code[ref]').getAttribute('ref').replace(/(\w)\s([0-9]+)/g, '$1.$2').replace(/:/g, '.');
    if (vHolder && (crossReferences_fullName[refval] || TSK[refval])) {
        crfnnote_DIV.innerHTML = `<div class="crfnnote_btns">${tskBtn}${noteBtn}${compareBtn}</div>`;
    } else if (vHolder){
        crfnnote_DIV.innerHTML = `<div class="crfnnote_btns" title="Not Crossreferenced"><button class="verse_crossref_button cancel" style="font-size:0.55em;color:red;font-style:italic;">x-Ref</button>${noteBtn}${compareBtn}</div>`;
    } else {
        crfnnote_DIV.innerHTML = `<div class="crfnnote_btns">${tskBtn}${noteBtn}${compareBtn}</div>`;
    }
    crfnnote_DIV.innerHTML += `<div class="none_mainsection_note"></div>`;
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
    // txt = txt.replace(/(<(?:ol|ul)[^>]*?)\s+(class|id|data-[\w-]+)\s*=\s*"(?:[^"]*)"(.*?)>/g, '$1$3>');
    txt = txt.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');// Remove all none breaking spaces
    txt = txt.replace(/<p>&nbsp;<\/p>/ig,'');// Remove empty html elements
    txt = txt.replace(/(<(?:ol|ul)[^>]*?)[^>]*>/g, '$1>');//remove everything inside ol|ul opening tag
    txt = txt.replace(/\((\d+)\/(\d+)\)/ig, '<sup>$1</sup>&frasl;</sus>$2</sus>');//change to fractions
    txt = txt.replace(/displaynone|sld_up/ig, '');
    txt = txt.replace(/class\s*=\s*"\s*"/ig, '');
    // txt = txt.replace(/(?<=<[^>]+)class\s*(?:[\w>])/ig, '');
    txt = txt.replace(/(?<=<[^>]+)\s*\bclass\b(?:\s*=*\s*(?:(?:'\s*')|(?:"\s*")))*\s*(?=\s*(?:>|\s+))/ig, '');//remove empty classes
    txt = txt.replace(/(?<=<[^>]+)\s*(?:oldHeight|minHeight|oldmaxHeight|hiddingAll)(?:\s*=\s*(['"]).*?\1)?/ig, '');
    txt = txt.replace(/<span style="color:#\w+; font-size:\d+px">(&crarr;)*<\/span>/ig, '');
    txt = txt.replace(/&nbsp;/ig, ' ');
    txt = txt.replace(/<\/em><em>/ig, '');
    // Modify Opening Quotation Marks
    txt = txt.replace(/(?<!<[^>]*)(.)\.\.\./ig, '$1…');
    txt = txt.replace(/”…/ig, '“…');
    txt = txt.replace(/(?<!<[^>]*)([\d\w])['‘]([\w…])/ig, '$1’$2');
    txt = txt.replace(/(?<!<[^>]*)(^|[\b\s‘])"/ig, '$1“');
    txt = txt.replace(/(?<!<[^>]*)"([\d\w…‘])/ig, '“$1');
    txt = txt.replace(/(?<!<[^>]*)"([\s.,’])/ig, '”$1');
    txt = txt.replace(/(?<!<[^>]*)([\w\d.,…’])"/ig, '$1”');
    // Modify Closing Quotation Marks 
    txt = txt.replace(/(?<!<[^>]*)([\w\d.,…!”])'/ig, '$1’');
    txt = txt.replace(/!"/g, '!”');
    txt = txt.replace(/!'/g, '!’');
    txt = txt.replace(/(?<!<[^>]*)(^|[\b\s“])'/ig, '$1‘');
    txt = txt.replace(/(?<!<[^>]*)'([\d\w…“])/ig, '‘$1');
    txt = txt.replace(/(?<!<[^>]*)'([\s.,”])/ig, '’$1');
    txt = txt.replace(/(?<!<[^>]*)([\w\d.,…”])'/ig, '$1’');
    txt = txt.replace(/(?<!<[^>]+?)(?:""|“"|"”)/g, '“”');
    txt = txt.replace(/(?<!<[^>]*)--(?!>)/ig, '—');
    txt = txt.replace(/<br data-mce-bogus="\d*">/g, '');
    // Remove <br> that comes before block element closing tag
    txt = txt.replace(/<br>(<\/(p|h\d)>)/ig, '$1');
    txt = txt.replace(/(?<!<[^>]*)(\s+([.,]))/ig, '$2');
    txt = txt.replace(/<span[\s=\":#\w\d]*\">[↵]*<\/span>/ig, '');
    txt = txt.replace(/<(?!rect|circle|ellipse|line|polyline|polygon|text|tspan|textPath|defs|g|use|symbol|marker|pattern|clipPath|mask|filter|foreignObject|td)(\w+)><\/\1>/ig, '');// Remove empty html elements (td is not included)
    // txt = txt.replace(/<(?<tagname>[\w\d]+)><\/\k<tagname>>/ig,'');// Remove empty html elements
    txt = txt.replace(/<span contenteditable="false" data-cke-magic-line="\d+" style="height: \d+px; padding: \d+px; margin: \d+px; display: block; z-index: \d+; color: rgb(\d+, \d+, \d+); font-size: \d+px; line-height: 0px; position: absolute; border-top: \d+px dashed rgb(\d+, \d+, \d+); user-select: none; left: \d+px; right: \d+px; top: \d+px;">  \s*↵\s*<\/span>/ig, '');
    txt = txt.replace(/([^\s>]+)\s*\n*\s+([^\s<]+)/g, '$1 $2').replace(/(“)\s+/g, '$1').replace(/\s+(”)/g, '$1').replace(/\s+([\d\w])/g, ' $1');
    txt = wrapTablesWithRegex(txt);
    
    return txt

    function wrapTablesWithRegex(html) {
        // Regex to find <table> tags not already wrapped in a direct parent <div>
        const tableRegex = /(?<!<div[^>]*>\s*)(<table\b[^>]*>.*?<\/table>)(?!\s*<\/div>)/gs;
    
        // Replace unmatched <table> tags with a wrapped version
        return html.replace(tableRegex, '<div class="table-wrapper">$1</div>');
    }
}
function removeClasses(htmlString, classNames) {
    // Join the class names into a single regex pattern
    const classPattern = classNames.map(className => `\\b${className.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`).join('|');
    // Regex pattern to match and replace the specific class names
    const classRegex = new RegExp(`class\\s*=\\s*["']([^"']*)["']`, 'g');
    // Replace the class names in the matched class attribute
    return htmlString.replace(classRegex, (match, p1) => {
        let classList = p1.split(/\s+/).filter(cls => !classNames.includes(cls));
        return `class="${classList.join(' ').trim()}"`;
    }).replace(/\sclass\s*="\s*"/g,''); // Remove empty class attributes
}

/* Check If element is in view on page */
/* function isFullyScrolledIntoView(el,parentElement,partial,tolerance=10) {
    const t = tolerance, pE = parentElement;
    var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    // Only completely visible elements return true:
    const fullyVisible = !pE ? ((elemTop >= 0) && (elemBottom <= window.innerHeight)) : (el.getBoundingClientRect().top >= pE.getBoundingClientRect().top && el.getBoundingClientRect().bottom <= pE.getBoundingClientRect().bottom);
    
    // Partially visible elements return true:
    const partiallyVisible = !pE ? (elemTop < window.innerHeight && elemBottom >= 0) : (el.getBoundingClientRect().top + t < pE.getBoundingClientRect().bottom && el.getBoundingClientRect().bottom - t > pE.getBoundingClientRect().top);
    
    const isVisible = partial ? partiallyVisible:fullyVisible;
    return isVisible;
} */
function isFullyScrolledIntoView(el, parentElement, partial = false, tolerance = 10) {
    const t = tolerance, pE = parentElement;
    const rect = el.getBoundingClientRect();
    const parentRect = pE ? pE.getBoundingClientRect() : { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth };

    const elemTop = rect.top;
    const elemBottom = rect.bottom;
    const elemLeft = rect.left;
    const elemRight = rect.right;

    // Only completely visible elements return true:
    const fullyVisible = (elemTop >= parentRect.top) && 
                         (elemBottom <= parentRect.bottom) && 
                         (elemLeft >= parentRect.left) && 
                         (elemRight <= parentRect.right);

    // Partially visible elements return true:
    const partiallyVisible = (elemTop < parentRect.bottom - t) && 
                             (elemBottom > parentRect.top + t) && 
                             (elemLeft < parentRect.right - t) && 
                             (elemRight > parentRect.left + t);

    const isVisible = partial ? partiallyVisible : fullyVisible;

    // Check display and opacity
    const style = window.getComputedStyle(el);
    const isDisplayed = style.display !== 'none';
    const isOpaque = parseFloat(style.opacity) > 0;

    return isVisible && isDisplayed && isOpaque;
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
async function saveToLocalDrive(file_text_content, fileName, format='json',userFolder) {
    // store a reference to file handle
    let fileHandle;
    if (!file_text_content.replace(/\s\n\r/g, '').length){
        // I am trying to prevent it from saving an empty file
        // It will only work if the "file_text_content" being empty is what makes it to sometimes save empty files 
        alert ("Error: Empty File.\nPlease Try Again");
        return
    }
    if(!userFolder){userFolder=currentDefaultFolder}
    if(!fileName){
      // It works by default for saving verseNotes 
      fileName = `notes_${currentBookName}.json`; //File name should be bookName with .json extension, e.g., Romans.json
    }
    if(api.isElectron){
        const data = {file_name:fileName,file_content:file_text_content,folder_name:userFolder}
        api.createNote(data);
        return
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
async function setDefVNFolder(x,dis){
    if(x=='psam'){//Pastor Sam -- Main Note
        nfolder_psam_check.checked=true;
        nfolder_user1_check.checked=false;
        notesFolder='bible_notes';
        localStorage.setItem('default_notes_folder','bible_notes');
        findAllBookChptnVersesWithNote();
        document.querySelectorAll('.verse_note .t2.text_content').forEach(t=>{t.classList.remove('text_content')/* ; t.id=null */});
        document.querySelectorAll('.verse_note .t1:not(.text_content)').forEach(t=>{t.classList.add('text_content')})

        getNoteForSelectedUser();

        document.querySelectorAll('.verse_note .user1_vn_check').forEach(cb=>{cb.checked=false});
        document.querySelectorAll('.verse_note .notes_ref_head').forEach(t=>{t.classList.remove('user1')});
        document.querySelectorAll('.verse_note .defnotefolder').forEach(t=>{t.classList.remove('active_button')});
    }

    else if(x=='user1'){
        nfolder_user1_check.checked=true;
        nfolder_psam_check.checked=false;
        notesFolder='bible_notes_user1';
        localStorage.setItem('default_notes_folder','bible_notes_user1');
        findAllBookChptnVersesWithNote()
        document.querySelectorAll('.verse_note .t1.text_content').forEach(t=>{t.classList.remove('text_content')/* ; t.id=null */});
        document.querySelectorAll('.verse_note .t2:not(.text_content)').forEach(t=>{t.classList.add('text_content')});
        
        getNoteForSelectedUser();

        document.querySelectorAll('.verse_note .user1_vn_check').forEach(cb=>{cb.checked=true});
        document.querySelectorAll('.verse_note .notes_ref_head').forEach(t=>{t.classList.add('user1')});
        document.querySelectorAll('.verse_note .defnotefolder').forEach(t=>{t.classList.add('active_button')});
    }
    
    else if (x=='user1noteToggle') {
        stop_note_editing(main.querySelector('#noteEditingTarget'));//properly close currently edited note if any
        let verseNoteDiv = dis.closest('.verse_note')
        let editBtn = verseNoteDiv.querySelector('.note_edit_button');
        let saveBtn = verseNoteDiv.querySelector('.note_save_button');
        
        let currentDefaultFolder=notesFolder;
        let vNote = elmAhasElmOfClassBasAncestor(dis,'.verse_note');
        if (vNotet1 = vNote.querySelector('.t1.text_content')) {
            vNotet1.contentEditable = 'false';
            // vNotet1.id='';
            vNotet1.classList.remove('text_content');
            vNote.querySelector('.t2:not(.text_content)').classList.add('text_content');
            vNote.querySelector('.user1_vn_check').checked=true;
            vNote.querySelector('.notes_ref_head').classList.add('user1');
            dis.classList.add('active_button')
            saveBtn.disabled = true;
            notesFolder='bible_notes_user1';    
        }
        else{
            let vNotet2 = vNote.querySelector('.t2.text_content')
            vNotet2.contentEditable = 'false';
            // vNotet2.id='';
            vNotet2.classList.remove('text_content');
            vNote.querySelector('.t1:not(.text_content)').classList.add('text_content')
            vNote.querySelector('.user1_vn_check').checked=false;
            vNote.querySelector('.notes_ref_head').classList.remove('user1');
            dis.classList.remove('active_button')
            saveBtn.disabled = true;
            notesFolder='bible_notes';
        }
        let vntc=vNote.querySelector('.text_content');
        if (vntc.matches('.text_content:empty')) {
            let bN=vntc.getAttribute('bk');
            let bC=vntc.getAttribute('b_cv').split('.')[0];
            let cV=vntc.getAttribute('b_cv').split('.')[1];
            await readFromVerseNotesFiles(bN,bC,cV,vntc);
            notesFolder=currentDefaultFolder;
        }
        else{notesFolder=currentDefaultFolder;}
        // editVerseNote(editBtn, {type:'click'}, saveBtn);//will open in edit mode
    }
    
    function getNoteForSelectedUser() {
        document.querySelectorAll('.verse_note:not(#verse_note) .text_content:empty').forEach(t => {
            let bN=t.getAttribute('bk');
            let bC=t.getAttribute('b_cv').split('.')[0];
            let cV=t.getAttribute('b_cv').split('.')[1];
            readFromVerseNotesFiles(bN,bC,cV,t);
        });
    }
    if(dis){
        const save_edit_btns_holder = dis.closest('.save_edit_btns_holder');
        const notemenubtn = save_edit_btns_holder.querySelector('.notemenubtn');
        const notemenu = save_edit_btns_holder.parentElement.querySelector('.notemenu.g:not(.sld_up)');
        if(notemenu){generateNoteMenu(notemenubtn,true)}
    }
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
function areAllitemsOfAinB_1(a, b) {
    a=Array.isArray(a)?a:[a];
    if (Array.isArray(b)){return areAllitemsOfAinB(a, b)}
    else if (a instanceof RegExp && a.test(b)) {return true}
    else if (a.every(elem => b.match(elem))) {return true}
    else {return false}
}
function isAsubArrayofB(a, b, isExactMatch = false) {
    const aL = a.length;
    const bL = b.length;
    if (bL < aL){return false;}// if b is shorter than a, it can't contain a

    for (let i = 0; i <= bL - aL; i++) {
        let isSubArray = true;
        for (let j = 0; j < aL; j++) {
            if (typeof a[j] === 'string' && typeof b[i + j] === 'string') {
                if (isExactMatch) {
                    if (a[j] !== b[i + j]) {
                        isSubArray = false;
                        break;
                    }
                } else {
                    // if (!b[i + j].includes(a[j])) {
                    // if (!bijReg.test(ajReg)) {
                    if (!JSON.stringify(b[i + j]).match(new RegExp(a[j]))) {
                        isSubArray = false;
                        break;
                    }
                }
            } else {
                if (a[j] !== b[i + j]) {
                    isSubArray = false;
                    break;
                }
            }
        }
        if (isSubArray) {
            return true; // subarray found
        }
    }
    return false; // no subarray found
}
function findMatch(array, value){
    return array.find(element => element === value);
}
function removeDuplicatesIgnoreCase(array) {
    const uniqueValues = new Set();
    const caseMap = new Map();
    const result = [];
    for (const item of array) {
        const lowerCaseItem = item.toLowerCase();   
        if (!uniqueValues.has(lowerCaseItem)) {
            uniqueValues.add(lowerCaseItem);
            caseMap.set(lowerCaseItem, item);
        }
    }
    for (const lowerCaseItem of uniqueValues) {
        result.push(caseMap.get(lowerCaseItem));
    }   
    return result;
}
function filterStringsContainingSubstring(array, substring) {
    substring = substring.replace(/([\[\]\(\)*])/g,'\\$1');
    var regex = new RegExp(substring, 'i'); // 'i' flag for case-insensitivity
    return array.filter(function(str) {
        return regex.test(str);
    });
}

/* OBJECTS  [DEEP COPY OBJECTS | SORT OBJECTS] */
function isObject(objValue) {
    return objValue && typeof objValue === 'object' && objValue.constructor === Object;
}
function deepCopyObj(obj){
    return JSON.parse(JSON.stringify(obj));
}
// function sortObj(obj) {
//     return Object.keys(obj).sort((b, a) => b.localeCompare(a)).reduce(function (result, key) {
//         result[key] = obj[key];
//         return result;
//     }, {});
// }
function sortObj(obj) {
    return Object.keys(obj)
        .sort((a, b) => {
            // Extract letter and number parts from keys
            const [aLetters, aNumbers] = splitLettersAndNumbers(a);
            const [bLetters, bNumbers] = splitLettersAndNumbers(b);
            
            // Compare letter parts first
            const letterComparison = aLetters.localeCompare(bLetters);
            if (letterComparison !== 0) {
                return letterComparison;
            }
            
            // If letter parts are equal, compare number parts
            return parseInt(aNumbers) - parseInt(bNumbers);
        })
        .reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
        // Function to split letters and numbers in a string
    function splitLettersAndNumbers(str) {
        const match = str.match(/([a-zA-Z]+)(\d+)/);
        if (match) {
            const [, letters, numbers] = match;
            return [letters, numbers];
        }
        return [str, ''];
    }
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
async function appendMarkersToSideBar(){
    if(typeof bookName=='undefined'){
        //quick fix for bookname sometimes being undefined because of issues with the reload of the page because of the electronJS code for closing the page
        bookName=await getHighestVisibleH2(false);
        bookName=bookName.highestChptHeading.getAttribute('bookname');
    }
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
            let vmMainBtn = createNewElement('button','.vm',`#marker_${vm}`,`[markerfor=marker_${vm}]`,'[onclick=checkUncheck(this.querySelector(\'input\'))unCheckOthers(combinedVersemarkers_list,this)]');
            let tschk=createNewElement('SPAN','.checkboxreplacement');
            tschk.innerHTML='<input type="checkbox" tabindex="-1">';
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
/* *** ************************** *** */
/* *** Go to Page If Already Open *** */
/* *** ************************** *** */
function openWindow(url, windowName) {
    var w = window.open('', windowName);
    if (w.location.href === 'about:blank') {w.location.href = url;}// Open the window and set its URL
    w.focus();
}
/* ******************************** */
/* ** CKEditor Related Functions ** */
/* ******************************** */
function enableCKEditor(ID){
    disableCKEditor()
    document.querySelector('#'+ID).setAttribute('contenteditable', true);
    CKEDITOR.inline(ID, {
        allowedContent:true,
        extraAllowedContent: 'a(documentation);abbr[title];code;svg(*)[*];path(*)[*];rect(*)[*];circle(*)[*];ellipse(*)[*];line(*)[*];polyline(*)[*];polygon(*)[*];text(*)[*];tspan(*)[*];textPath(*)[*];defs(*)[*];g(*)[*];use(*)[*];image(*)[*];symbol(*)[*];marker(*)[*];pattern(*)[*];clipPath(*)[*];mask(*)[*];filter(*)[*];foreignObject(*)[*];def(*)[*];feDropShadow;feDropShadow(*)[*]',
        removePlugins: 'stylescombo',
        extraPlugins: 'sourcedialog',
        removeButtons: 'PasteFromWord',
        // Show toolbar on startup (optional).
        startupFocus: true
    }).on('instanceReady', function(event) {
        if (document.body.matches('.darkmode')) {
            document.querySelectorAll('.cke_button_icon').forEach(cke=>{
                cke.style.backgroundImage=cke.style.backgroundImage.replace(/plugins/,'skins/moono-dark');
            })
        }
        //Remove Title added by ckeditor (title is quite annoying)
        let eTargets_note=document.getElementById(ID);
        eTargets_note?(eTargets_note.removeAttribute('title'),eTargets_note.removeAttribute('aria-label')):null;
        enableInteractJSonEl('.cke_inner .cke_top .cke_toolbox', cke_noteEditingTarget)//make it draggable
        //enable default chrome spellchecking to indicate mispelled words
        eTargets_note.setAttribute('spellcheck', true);
        eTargets_note.querySelectorAll('path, rect, circle').forEach(svgElm => {svgElm.innerHTML='';});
        
        // eTargets_note.querySelectorAll('p').forEach(p => {if (p.innerHTML === ' ' || /^\s*(<br\s*\/?>\s*)+$/.test(p.innerHTML)) {console.log(p);p.remove();}})
        eTargets_note.innerHTML = eTargets_note.innerHTML.replace(/<p>\s*(&nbsp;| )\s*<\/p>/ig, '').replace(/<p>\s*(<br\s*\/?>\s*)+<\/p>/ig, '');
    });
}
function disableCKEditor() {
    if(typeof CKEDITOR == 'undefined'){return}
    for (k in CKEDITOR.instances) {
        var instance = CKEDITOR.instances[k];
        instance.element.$.contentEditable=false;
        instance.destroy();
    }
}
function findTextNodesWithPattern(root = document.body) {
    //Instead of generateRefsInNote for the whole document.body,
    //I use this to find all text nodes that contain a word followed by a number that are not children of [ref] and generateRefsInNote for them
    if (!(root instanceof Element)) {
        return [];
        throw new Error("The root must be a valid Element.");
    }

    const regex = /(?:\p{L}{2,}\s*[0-9](?:[;:,\-.\s0-9])*)|(?:[GHgh][0-9])/u; // Unicode regex for word followed by a number
    let results = new Set();

    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (regex.test(node.textContent) && !(node.parentElement?.closest('[ref]'))) {
                
                results.add(node.parentElement);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (let child of node.childNodes) {
                traverse(child);
            }
        }
    }

    replaceNbsp(root);
    traverse(root);
    return Array.from(results).filter(Boolean); // Convert Set to an array and remove null values

    function replaceNbsp(root) {
        //to replace &nbsp; and \s+ with a single ' '
        //to replace &zeroWidthSpace with ''
        if (root.nodeType === Node.ELEMENT_NODE) {
            root.normalize(); // Merge adjacent text nodes
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
            let node;
            while ((node = walker.nextNode())) {
                node.nodeValue = node.nodeValue.replace(/\u200B/g, '').replace(/\u00A0|\s+/g, ' '); // Replace non-breaking spaces
            }
        }
    }
}
// function handleSmartQuotesAndDashes(event) {
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const node = range.startContainer;
//     let offset = range.startOffset;

//     if (node.nodeType !== Node.TEXT_NODE) return;

//     let text = node.textContent;
    
//     // Handle -- to —, and ... to …
//     if ((event.key === "-"||event.key === ".") && offset > 0) {
//         if (text[offset - 1] == "-") {
//             event.preventDefault();
//             // Replace last hyphen with em dash
//             node.textContent = text.slice(0, offset - 1) + "—" + text.slice(offset);
//             restorCPos();
//             return;
//         }
//         else if (text[offset - 1] === "." && text[offset - 2] === ".") {
//             event.preventDefault();

//             // Replace last hyphen with em dash
            
//             node.textContent = text.slice(0, offset - 2) + "…" + text.slice(offset);
//             offset -= 1;
//             restorCPos();
//             return;
//         }
//         function restorCPos() {
//             // Restore cursor position
//             range.setStart(node, offset);
//             range.setEnd(node, offset);
//             selection.removeAllRanges();
//             selection.addRange(range);
//         }
//     }

//     // Handle smart quotes
//     else if (event.key === "'" || event.key === '"') {
//         event.preventDefault();

//         const isDouble = event.key === '"';
//         const textBefore = text.slice(0, offset);
//         const smartQuote = getQuoteType(textBefore, isDouble);

//         // Insert the smart quote at the cursor position
//         node.textContent = textBefore + smartQuote + text.slice(offset);
        
//         // Restore cursor position after inserted character
//         range.setStart(node, offset + 1);
//         range.setEnd(node, offset + 1);
//         selection.removeAllRanges();
//         selection.addRange(range);
//     }

//     function getQuoteType(textBefore, isDouble) {
//         // Regex to detect if the last character is a word character or closing punctuation
//         const closingContext = /[\w\p{L}\p{N}\)»“‘”’.…!\?]$/u;        
//         if (closingContext.test(textBefore)) {
//             return isDouble ? "”" : "’"; // Closing quote
//         } else {
//             return isDouble ? "“" : "‘"; // Opening quote
//         }
//     }
// }
function handleSmartQuotesAndDashes(event) {
    // SHIFT + ALT + ARROW RIGHT/LEFT to convert heading to h1, h2, h3, h4, h5, h6
    if (event.altKey && event.shiftKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        return autoHeadingConverter(event)
    }
        
    setTimeout(() => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        let offset = range.startOffset;

        if (node.nodeType !== Node.TEXT_NODE) return;

        let text = node.textContent;

        function restoreCursorPosition() {
            range.setStart(node, offset);
            range.setEnd(node, offset);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Handle -- to —, and ... to …
        if ((event.key === "-" || event.key === ".") && offset > 0) {
            if (text[offset - 2] === "-" && text[offset - 1] === "-") {
                node.textContent = text.slice(0, offset - 2) + "—" + text.slice(offset);
                offset -= 1;
                restoreCursorPosition();
            } else if (text[offset - 3] === "." && text[offset - 2] === "." && text[offset - 1] === ".") {
                node.textContent = text.slice(0, offset - 3) + "…" + text.slice(offset);
                offset -= 2;
                restoreCursorPosition();
            }
        }

        // Handle smart quotes
        else if (event.key === "'" || event.key === '"') {
            const isDouble = event.key === '"';
            const textBefore = text.slice(0, offset - 1);
            const smartQuote = getQuoteType(textBefore, isDouble);

            node.textContent = textBefore + smartQuote + text.slice(offset);
            restoreCursorPosition();
        }

        // Handle numbered/lettered lists
        else if (event.key === " "/*  || event.key === "Enter" */) {
            checkForListConversion();
        }

    }, 0); // Run after keypress event to allow undo
    
    function getQuoteType(textBefore, isDouble) {
        const closingContext = /[\w\p{L}\p{N}\)»“‘”’.…!\?]$/u;
        return closingContext.test(textBefore) ? (isDouble ? "”" : "’") : (isDouble ? "“" : "‘");
    }
    
    // Function to check if a list needs to be created
    function checkForListConversion() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
    
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
    
        if (node.nodeType !== Node.TEXT_NODE) return;
    
        let text = node.textContent;
    
        // Convert non-breaking space to normal space (browser quirk fix)
        text = text.replace(/\u00A0/g, " "); // \u00A0 is &nbsp;
    
        // Match patterns like "1. ", "a. ", "i. ", "A. ", "I. ", "* "
        // const listMatch = text.match(/^(\d+|[a-z]|i{1,3})\.\s$/i);
        const listMatch = text.match(/^([1aiAI\*])\.\s$/i);
        if (!listMatch) return;
    
        const listType = listMatch[1];
    
        // Determine the ordered list type
        let olType = "";
        let ul_ol = "ol";
        // if (/^\d+$/.test(listType)) {olType = "";} // Default (1,2,3)
        // else if (/^[a-hj-z]$/i.test(listType)) {olType = "a";}// a, b, c...
        // else if (/^i{1,3}$/i.test(listType)) {olType = "i";}// i, ii, iii...
        if (/^1$/.test(listType)) {olType = "";} // Default (1,2,3)
        else if (/^a$/.test(listType)) {olType = "a";}// a, b, c...
        else if (/^i$/.test(listType)) {olType = "i";}// i, ii, iii...
        else if (/^A$/.test(listType)) {olType = "A";}// A, B, C...
        else if (/^I$/.test(listType)) {olType = "I";}// I, II, III...
        else if (/^\*$/.test(listType)) {ul_ol = "ul";}
    
        // Create the ordered list
        const ol = document.createElement(ul_ol);
        if (olType) ol.setAttribute("type", olType);
    
        const li = document.createElement("li");
        ol.appendChild(li);
    
        // If the text is inside a paragraph, replace it
        const parent = node.parentNode;
        if (parent.nodeName === "P") {
            parent.replaceWith(ol);
        } else {
            // Otherwise, insert the list at the cursor position
            node.textContent = ""; // Clear text
            range.insertNode(ol);
        }
    
        // Place cursor inside the new list item
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.setEnd(li, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    // Auto Headings with SHIFT + ALT + LEFT/RIGHT ARROW
    function autoHeadingConverter(event) {
        if (event.altKey && event.shiftKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
            event.preventDefault(); // Prevent default browser behavior
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            let node = range.startContainer;
            
            // Ensure we target the element node (not text node)
            while (node.nodeType !== Node.ELEMENT_NODE) {
                node = node.parentNode;
            }
            
            let tagName = node.tagName.toLowerCase();
            
            if (event.key === "ArrowRight") {
                promoteHeading(node, tagName);
            } else if (event.key === "ArrowLeft") {
                demoteHeading(node, tagName);
            }
        }
        function promoteHeading(node, tagName) {
            if (tagName === "p") {
                replaceTag(node, "h1"); // Convert <p> to <h1>
            } else if (/^h[1-5]$/.test(tagName)) {
                const nextLevel = parseInt(tagName[1]) + 1;
                replaceTag(node, `h${nextLevel}`); // h1 → h2, h2 → h3, ..., h5 → h6
            }
            // If h6, do nothing (limit reached)
        }
        
        function demoteHeading(node, tagName) {
            if (tagName === "h1") {
                replaceTag(node, "p"); // Convert <h1> back to <p>
            } else if (/^h[2-6]$/.test(tagName)) {
                const prevLevel = parseInt(tagName[1]) - 1;
                replaceTag(node, `h${prevLevel}`); // h6 → h5, h5 → h4, ..., h2 → h1
            }
            // If already <p>, do nothing (limit reached)
        }
        
        function replaceTag(oldNode, newTag) {
            const newNode = document.createElement(newTag);
            newNode.innerHTML = oldNode.innerHTML;
        
            // Replace old node with new one
            oldNode.replaceWith(newNode);
        
            // Restore cursor position
            placeCursorAtEnd(newNode);
        }
        
        function placeCursorAtEnd(node) {
            const range = document.createRange();
            const selection = window.getSelection();
        
            range.setStart(node, node.childNodes.length);
            range.setEnd(node, node.childNodes.length);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}


/* ** ******************************* ** */
/* ** GET AND RESTORE CURSOR POSITION ** */
/* ** ******************************* ** */
function getCursorPosition(editableElement) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return 0;

    const range = selection.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(editableElement);
    preRange.setEnd(range.startContainer, range.startOffset);

    return preRange.toString().length; // Cursor position as character offset
}
function restoreCursorPosition(editableElement, savedPosition) {
    const selection = window.getSelection();
    const range = document.createRange();
    let charCount = 0;

    function traverseNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const nextCharCount = charCount + node.length;
            if (charCount <= savedPosition && nextCharCount >= savedPosition) {
                range.setStart(node, savedPosition - charCount);
                range.collapse(true);
                return true;
            }
            charCount = nextCharCount;
        } else {
            for (let i = 0; i < node.childNodes.length; i++) {
                if (traverseNodes(node.childNodes[i])) return true;
            }
        }
        return false;
    }

    traverseNodes(editableElement);
    selection.removeAllRanges();
    selection.addRange(range);
}

function saveSelectionWithMarkers() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Create markers
    const startMarker = document.createElement("span");
    startMarker.id = "selection_start";
    startMarker.style.display = "inline-block";
    startMarker.style.width = "0px";
    startMarker.style.height = "0px";
    startMarker.innerText = ".";//added because empty elements will be removed

    const endMarker = document.createElement("span");
    endMarker.id = "selection_end";
    endMarker.style.display = "inline-block";
    endMarker.style.width = "0px";
    endMarker.style.height = "0px";
    endMarker.innerText = ".";//added because empty elements will be removed

    // Insert them
    const rangeClone = range.cloneRange();
    rangeClone.collapse(true);
    rangeClone.insertNode(startMarker);

    if (!range.collapsed) {
        const rangeClone2 = range.cloneRange();
        rangeClone2.collapse(false);
        rangeClone2.insertNode(endMarker);
    }
}
function restoreSelectionFromMarkers() {
    const startMarker = document.getElementById("selection_start");
    const endMarker = document.getElementById("selection_end");

    if (!startMarker) return;
    
    startMarker.innerHTML = "";
    
    const range = document.createRange();
    const selection = window.getSelection();
    
    range.setStartBefore(startMarker);
    
    if (endMarker) {
        endMarker.innerHTML = "";
        range.setEndBefore(endMarker);
    }
    else {range.collapse(true);}

    selection.removeAllRanges();
    selection.addRange(range);

    // Cleanup markers
    startMarker.remove();
    if (endMarker) endMarker.remove();
}

function saveSelectionByCoordinates() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return null;
    const rects = range.getClientRects();

    // Save first and last rects (start and end of selection)
    const startRect = rects[0];
    const endRect = rects[rects.length - 1];

    return {
        startX: startRect.left + 1,
        startY: startRect.top + 1,
        endX: endRect.right - 1,
        endY: endRect.bottom - 1
    };
}
function restoreSelectionByCoordinates(coords) {
    if (!coords) return;

    const sel = window.getSelection();
    sel.removeAllRanges();

    const startRange = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(coords.startX, coords.startY)
        : document.caretPositionFromPoint(coords.startX, coords.startY);

    const endRange = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(coords.endX, coords.endY)
        : document.caretPositionFromPoint(coords.endX, coords.endY);

    if (startRange && endRange) {
        const range = document.createRange();
        range.setStart(startRange.startContainer || startRange.offsetNode, startRange.startOffset || startRange.offset);
        range.setEnd(endRange.startContainer || endRange.offsetNode, endRange.startOffset || endRange.offset);
        sel.addRange(range);
    }
}
/* ** ******************************* ** */
/* ** OBSERVE CHANGES TO REF ELEMENTS ** */
/* ** ******************************* ** */
const observedElements = new Set();
let changedRefElements = [];
// Main observer for detecting new elements with ref attributes
const refObserver = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
        addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if element has ref attribute
                if (node.matches('.text_content [ref]')) {
                    setupTextNodeObserver(node);
                }
                // Check children of added nodes
                node.querySelectorAll('[ref]').forEach(setupTextNodeObserver);
            }
        });
    });
});
  
// Observer setup for text node changes
function setupTextNodeObserver(element) {
    if (observedElements.has(element)) return;

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'characterData') {
                handleTextChange(element);
            }
        });
    });
    
    observer.observe(element, {
        characterData: true,
        subtree: true,
        childList: true
    });
    
    observedElements.add(element);
}
  
// Handle text changes and maintain unique array
function handleTextChange(element) {
    if (!changedRefElements.includes(element)) {
        changedRefElements.push(element);
    }
}
// Disconnect all observers
function cleanupObservers() {
    refObserver.disconnect();
    observedElements.forEach(el => {
        el._textObserver?.disconnect();
    });
    observedElements.clear();
}
/* ************************************ */
/* H1 - H6 TO TOGGLE NON-H1-H6 SIBLINGS */
/* ************************************ */
function toggleH1to6siblings(e, eTarget, mustMatch){

    if((e && (!e.target.closest('H1,H2,H3,H4,H5,H6') || e.target.closest('.verse_note .notemenu') || (e.target.closest('#searchPreviewFixed,#scriptureCompareWindow') && !e.target.closest('.context_menu,.crossrefs,.none_mainsection_note')) || (e.type=='contextmenu' && e.target.closest(':is([ref],.strnum,[strnum]):not(.context_menu)')))) || (mustMatch && !e.target.closest(mustMatch))){return}

    let hElm, hTag;
    const h1to6arr = ['H1','H2','H3','H4','H5','H6'];
    if(e){
        if(isMouseOverHighlightedText()){mouseDownTimeStamp = null;return}// If mouse is over highlighted text, the assumption is that the intention is to copy the text
        else if(e.target.matches('[strnum]')){return}
        // hElm = e.target or closest heading ancestor;
        hElm = h1to6arr.includes(e.target.tagName.toUpperCase())==true ? e.target : (e.target.closest('h1,h2,h3,h4,h5,h6') ? e.target.closest('h1,h2,h3,h4,h5,h6') : e.target)
        if(e.key==2){e.preventDefault();}
    } else {hElm = eTarget}
    hTag = hElm.tagName;
    const hElmHidingSiblings = hElm.classList.contains('hidingsibs');
    const eTargetParent = hElm.parentElement;
    if(!h1to6arr.includes(hTag.toUpperCase()) || eTargetParent.contentEditable=='true' && e && !wasMarkerClicked(e,hElm)){return}

    function unhideAllH1to6() {
        eTargetParent.querySelectorAll('.hidingsibs').forEach(x => {x.classList.remove('hidingsibs');})
        h1to6arr.forEach(x=>{
            eTargetParent.querySelectorAll('.hidby_'+ x).forEach(y=>{y.classList.remove('hidby_'+ x);})
        })
    }
    if(!h1to6arr.includes(hTag.toUpperCase())){return}      
    if(e?.type=='contextmenu' && ![1,3].includes(e.buttons)){
        e.preventDefault();
        let hElm_hNum = Number(hElm.tagName.replace(/h/i,''));
        let queryString = '1,2,3,4,5,6'.split(hElm_hNum+1)[0].replace(/,\s*$/g,'').replace(/(\d)/g,'h$1:not(.hidingsibs)'); // '6,5,4,3,2,1' reverse
        const othersH1to6showing = Array.from(eTargetParent.querySelectorAll(queryString));// It MUST target only the open ones

        let prev_highest_hNum = hElm_hNum;//prev_highest_pseudoAncestor_hNum
        //hide siblings of any whose siblings are showing, if any
        function limitedToggle(array,y=false) {
            let allFamily = Array.from(eTargetParent.children);
            let ancestors2ignore = [];
            // go backwards and find pseudo ancestors that should not be toggled
            for (let i = allFamily.indexOf(hElm); i > -1; i--) {
                const elm = allFamily[i];
                if(elm.matches('h1,h2,h3,h4,h5,h6')){
                    const elm_hNum = Number(elm.tagName.replace(/h/i,''));
                    elm_hNum < prev_highest_hNum ? ancestors2ignore.push(elm) : null;
                    elm_hNum < prev_highest_hNum ? prev_highest_hNum = elm_hNum : null;
                }
            }
            for (let i = allFamily.indexOf(hElm); i < allFamily.length; i++) {
                const elm = allFamily[i];
                if(elm.matches('h1,h2,h3,h4,h5,h6')){
                    const elm_hNum = Number(elm.tagName.replace(/h/i,''));
                    if (elm_hNum < hElm_hNum) {break} 
                    elm_hNum >= hElm_hNum ? ancestors2ignore.push(elm) : null;
                }
            }
            let hid_something;
            (!y ? array : array.length > 0) ? array.forEach(x=>{
                const x_hNum = Number(x.tagName.replace(/h/i,''));
                //hide headers of the same level or lower...
                if(((!ancestors2ignore.includes(x)) || hElm_hNum <= x_hNum) ){toggleH1to6siblings(null, x); hid_something=true;}
            }):(y ? (toggleH1to6siblings(null, hElm),hid_something=true) : null);

            y && !hid_something ? toggleH1to6siblings(null, hElm) : null;
        }
        if(hElmHidingSiblings){
            limitedToggle(othersH1to6showing);//then show its own nonH1to6 siblings
            toggleH1to6siblings(null, hElm);
        }
        //remove hElm from the h1to6 showing their siblings
        else {
            othersH1to6showing.splice(othersH1to6showing.indexOf(hElm),1);
            //hide siblings of any whose siblings are showing, if any, but if none, just hide this one's nonH1to6 sibs
            limitedToggle(othersH1to6showing,true);
        }
    }
    //hide or unhide all non-headings
    else if((e?.ctrlKey && ['click','contextmenu'].includes(e.type)) || (e?.type=='contextmenu' && [1,3].includes(e.buttons))){
        // left mouse button down + rightclick
        if(hElmHidingSiblings){unhideAllH1to6();}
        else {
            let allChildrenOfeTargetParent = Array.from(eTargetParent.children), prvHx, youMayHide=false;
            allChildrenOfeTargetParent.forEach((elm,i)=>{
                //Only hide after coming across a header
                let elmTagName=elm.tagName.toUpperCase();
                if(!youMayHide && h1to6arr.includes(elmTagName)){
                    prvHx=h1to6arr.find(x=>{return x==elmTagName.toUpperCase();});
                    youMayHide=true;
                }
                if(youMayHide){
                    if (!h1to6arr.includes(elmTagName) || Number(elmTagName.match(/\d+/g)) < Number(prvHx.match(/\d+/g))) {
                        h1to6arr.forEach(hx=>{elm.classList.remove('hidby_'+hx)});//don't hide headings
                        elm.classList.add('hidby_' + prvHx);
                    }
                    if(h1to6arr.includes(elmTagName)){//elm is header 
                        elm.nextElementSibling && !elm.nextElementSibling.matches('h1,h2,h3,h4,h5,h6')?elm.classList.add('hidingsibs'):null;
                        h1to6arr.forEach(hx=>{elm.classList.remove('hidby_'+hx)});//don't hide headings
                        prvHx=h1to6arr.find(x=>{return x==elmTagName.toUpperCase();});
                    }
                }
            })
        }
    }
    //hide or unhide all headings lower than current heading and non-headings that come after current heading and that precede an equal or greater heading
    else if(!e || e.type=='click'){
        
        const hIndx = h1to6arr.indexOf(hTag);
        // const hIndx = Number(hTag.match(/\d+/)[0])-1;
        let hElmSibling = hElm.nextElementSibling;
        let hElmSibTagName;
        if(hElmSibling){
            hElmSibTagName = hElmSibling.tagName.toUpperCase();
            if((h1to6arr.includes(hElmSibTagName) && (h1to6arr.indexOf(hElmSibTagName) < hIndx))){return}
        }
        let sc = hElmHidingSiblings;
        while(hElmSibling && hElmSibTagName != hTag && hElmSibTagName != 'SCRIPT'){
            // Show all sibling if Helm was hidingsibs
            if(hElmHidingSiblings && hElmSibling.classList.contains('hidby_' + hTag)){
                if(e && e.altKey){
                    for (let i = hIndx; i <= 6; i++) {
                        hElmSibling.classList.remove('hidby_H' + i);
                        hElmSibling.classList.remove('hidingsibs');//in case it is a H1to6 hiding sibling,
                    }
                }
                else {hElmSibling.classList.remove('hidby_H' + (hIndx+1))};
                hElm.classList.remove('hidingsibs')
            }
            // Hide all sibling if Helm is not hiding siblings
            else if (!hElmHidingSiblings) {
                hElmSibling.classList.add('hidby_' + hTag);
                hElm.classList.add('hidingsibs')
            }
            hElmSibling = hElmSibling.nextElementSibling;
            if(hElmSibling){
                hElmSibTagName = hElmSibling.tagName.toUpperCase();
                if((h1to6arr.includes(hElmSibTagName) && (h1to6arr.indexOf(hElmSibTagName) < hIndx))){
                    // closestScrollableAncestors(hElm);
                    sc ? setTimeout(() => {hElm.scrollIntoView({behavior:'smooth',block:'nearest'})}, 200) : null;
                    return
                }
            }
        }
        // closestScrollableAncestors(hElm);
        sc ? setTimeout(() => {hElm.scrollIntoView({behavior:'smooth',block:'nearest'})}, 200) : null;
    }
}
function isMouseOverHighlightedText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range) {
            const rects = range.getClientRects();
            if (rects.length > 0) {
                for (let i = 0; i < rects.length; i++) {
                  const rect = rects[i];
                  if (
                    event.clientX >= rect.left &&
                    event.clientX <= rect.right &&
                    event.clientY >= rect.top &&
                    event.clientY <= rect.bottom
                    ) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
/* Toggle All Open Details */
function openCloseAllDetailsInParent(e){
    let etarget=e.target;
    let details2openORclose;
    let eParent=etarget.closest('.resultsummary');
    if(etarget.matches('summary') && eParent && !etarget.matches('.resultsummary > summary')){
        details2openORclose = '.resultsummary details:not(.resultsummary>details)';
        if(etarget.parentElement.open){
            eParent.querySelectorAll(details2openORclose).forEach(dtl=>{dtl.open=false})
        } else {
          eParent.querySelectorAll(details2openORclose).forEach(dtl=>{dtl.open=true})
        }
    }
    e.preventDefault()
}

/* GET OFFEST OF ELEMENT RELATIVE TO GIVEN ANCESTOR OR BODY  */
function getOffsetRelativeToAncestor(element, ancestor=null) {
    let offsetLeft = 0,offsetTop = 0;
    while (element && element !== ancestor) {
        offsetLeft += element.offsetLeft;
        offsetTop += element.offsetTop;

        // Consider the element's clientLeft and clientTop (borders) when it's not the body element
        if (element !== document.body) {
            offsetLeft += element.clientLeft;
            offsetTop += element.clientTop;
        }
        element = element.offsetParent;
    }
    return {
        left: offsetLeft,
        top: offsetTop
    };
}
function distanceBetweenElementAndPreviousSibling(element) {
    if (!element) {console.error(`Element not found.`);return;}
    const previousSibling = element.previousElementSibling;
    if (previousSibling) {
        const previousBottom = previousSibling.getBoundingClientRect().bottom;
        const elementTop = element.getBoundingClientRect().top;
        const distance = elementTop - previousBottom;
      return distance;
    } else {console.error('No previousSibling found.');return null;}
}
function distanceToAncestorBottom(element, ancestor) {
    if (!element || !ancestor) {console.error('Element or ancestor not found.');return null;}
    const elementRect = element.getBoundingClientRect();
    const ancestorRect = ancestor.getBoundingClientRect();
    const distance = ancestorRect.bottom - elementRect.bottom;
    return distance;
}
function getClickedClientRect(elm, e) {
    const rects = elm.getClientRects();
    const {clientX,clientY} = e;
    const elm_bcRect = elm.getBoundingClientRect();
    const elmOffsetLeft = elm.offsetLeft - (rects[0].left - elm_bcRect.left);//because offsetLeft will for inline element is the offsetLeft of the first rect
    const elmOffsetTop = elm.offsetTop - (rects[0].top - elm_bcRect.top);//because offsetTop will for inline element is the offsetTop of the first rect

    for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        if (rects.length==1 || (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom)) {
            //Get Offsets
            const Left = elmOffsetLeft + (rect.left - elm_bcRect.left);
            const Top = elmOffsetTop + (rect.top - elm_bcRect.top);
            return {Left,Top,'left':Left,'top':Top,'width':rect.width,'height':rect.height,'Width':rect.width,'Height':rect.height,rect}
        }
    }
    const rect = elm_bcRect;
    return {'Left':rect.left,'Top':rect.top,'left':elmOffsetLeft,'top':elmOffsetTop,'width':rect.width,'height':rect.height,'Width':rect.width,'Height':rect.height,rect};
}
function paddingDistanceOfChildToAncestor(elm,targetAncestor,parentsToIgnore) {
    if(!targetAncestor.contains(elm)){return '0px'}
    let ep = elm.parentElement;
    let leftPading = 0, topPading = 0;
    while(ep){
        if(!parentsToIgnore || !ep.matches(parentsToIgnore.join(','))){
            leftPading += parseFloat(window.getComputedStyle(ep).paddingLeft) + parseFloat(window.getComputedStyle(ep).borderLeftWidth) + parseFloat(window.getComputedStyle(ep).marginLeft);
            topPading += parseFloat(window.getComputedStyle(ep).paddingTop) + parseFloat(window.getComputedStyle(ep).borderTopWidth) + parseFloat(window.getComputedStyle(ep).marginTop);
            if(ep == targetAncestor){
                ep = null;
                const left = leftPading + 'px';
                const top = topPading + 'px';
                return {left,top};
            }
        }
        ep = ep.parentElement;
    }
}

// Function to find the closest scrollable ancestors for x and y directions
function closestScrollableAncestors(element,limit) {
    let scrollableAncestor;
    let scrollableAncestorY = null;
    let scrollableAncestorX = null;

    while (element) {
        const style = window.getComputedStyle(element);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;

        const isScrollableY = (overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight;
        const isScrollableX = (overflowX === 'auto' || overflowX === 'scroll') && element.scrollWidth > element.clientWidth;

        if (isScrollableY && !scrollableAncestorY) {scrollableAncestorY = element;}
        if (isScrollableX && !scrollableAncestorX) {scrollableAncestorX = element;}
        scrollableAncestor = element;
        if ((scrollableAncestorY || scrollableAncestorX)||(element==limit)) {break;}// Found both scrollable ancestors //don't go beyond this parent
        element = element.parentElement;
    }
    return { elm:scrollableAncestor, x: scrollableAncestorX, y: scrollableAncestorY };
}
function wasMarkerClicked(e,clicked_elm) {
    if (!clicked_elm) return false;
    // doesn't work for nested li's children if ol/ul, li is positioned relative
    const absoluteLeft = clicked_elm.getBoundingClientRect().left;
    const computed_paddingLeft = window.getComputedStyle(clicked_elm).paddingLeft;
    const clicked_elm_Left = parseFloat(absoluteLeft);// calculate the margin-left of clicked_li
    const clickX = e.clientX;
    // const clicked_elm_paddingLeft = parseFloat(computed_paddingLeft) + parseFloat(absoluteLeft);// Calculate the padding-left of ul or `ol`
    const markerBoundary = parseFloat(computed_paddingLeft) + parseFloat(absoluteLeft);// Calculate marker boundary based on combined padding and margin
    // const markerBoundary = clicked_elm_paddingLeft + clicked_elm_Left;
    const markerWasClicked = clickX >= clicked_elm_Left && clickX <= markerBoundary;// Check if the click falls within the marker boundary

    return markerWasClicked
}
/* ******** ** ******** ********* ******* */
/* Function to Retrieve Clipboard Content */
/* ******** ** ******** ********* ******* */
/* async function getClipboardContent() {
    try {
        const clipboardData = await navigator.clipboard.readText();
        return clipboardData;
    } catch (error) {
        console.error('Failed to read clipboard contents: ', error);
        return null;
    }
}
  
// Usage example: calling the function to get clipboard content
getClipboardContent().then((clipboardContent) => {
    if (clipboardContent) {
        // Do something with the clipboard content here
        console.log('Clipboard content:', clipboardContent);
        // You can assign the clipboard content to a variable here if needed
        // For example:
        // const myVariable = clipboardContent;
    } else {
        console.log('Clipboard is empty or access denied.');
    }
}); */

/* FOR CHECKING IF TRANSLATION HAS ANY ISSUE AND WHERE THE ISSUES ARE */
/* function findMissingIncompleteChapters(translation){
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
} */

// Function to show the custom alert
function showAlert(alertString) {
    // Custom Alert Modal
    if (x = document.getElementById('customAlert')) {x.remove();}
    if (x = document.getElementById('showAlert_style')) {x.remove();}
    const alertHTML = `<div id="customAlert" style="display:block"><p>${alertString}</p><button onclick="closeAlert()">OK</button></div><div id="overlay" style="display:block"></div>`;
    const alertSTYLE = `<style id="showAlert_style">#customAlert {display:none;position:fixed;top: 50%;left:50%;transform:translate(-50%, -50%);font-size:1.6em;text-align:center;background-color:white;padding: 20px;box-shadow: 0 0 10px rgba(0,0,0,0.5);z-index:1000;border-radius:8px;}#overlay {display: none;position:fixed;top: 0;left: 0;width:100%;height:100%;background-color: rgba(0, 0, 0, 0.5);z-index:999;}.darkmode #customAlert {background:brown;}#customAlert button {display: block;margin: 10px auto 0;padding: 5px 10px;background-color: #007bff;color: white;border: none;border-radius: 4px;cursor: pointer;}#customAlert button:hover {background-color: #0056b3;}</style>`;

    let alertHTMLDocFrag = new DOMParser().parseFromString(alertHTML, 'text/html').body;
    let alertStyleDocHead = new DOMParser().parseFromString(alertSTYLE, 'text/html').head;
    document.head.appendChild(alertStyleDocHead.firstElementChild);
    Array.from(alertHTMLDocFrag.children).forEach(child=>{document.body.appendChild(child);});
    document.getElementById('overlay').setAttribute('onclick', 'closeAlert()');
}

// Function to close the custom alert
function closeAlert() {
    let alert = document.getElementById('customAlert');
    let overlay = document.getElementById('overlay');
    let showAlert_style = document.getElementById('showAlert_style');
    if (alert) alert.remove();
    if (overlay) overlay.remove();
    if (showAlert_style) showAlert_style.remove();
}

/* RADOMLY CHANGE BACKGROUND COLOR OF SELECTION EVERY TIME SELECTION IS MADE */
(function(){
    // Array of supplied colors
    const colors = ['#00ff2c7d', '#ff017d36', '#ffff0094', '#d29e50ab', '#fa9eedcc', '#cfbfa1b5', '#27b2199e', '#f59aeccc', '#49ee15c2', '#fd97a663'];
    let currentIndex = 0;

    // Detect start of selection
    document.addEventListener('mousedown', () => {currentIndex = (currentIndex + 1) % colors.length;});// Cycle through array // Update color immediately on mousedown

    document.addEventListener('selectionchange', () => {
        document.documentElement.style.setProperty('--selection', colors[currentIndex]);
    });

    /* RANDOM COLOR GENERATION AND SELECTION */
    /*
    // Function to generate a random RGBA color
    function getRandomColor() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      const a = (Math.random() * 0.5 + 0.3).toFixed(2); // Alpha between 0.3 and 0.8
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    // Update the --selection variable on selection
    document.addEventListener('selectionchange', () => {
      document.documentElement.style.setProperty('--selection', getRandomColor());
    });
     */
})();

/* So the cursor does not enter element that is not visible when moved with arrow keys */
/* Temporarily Display None All .sld_up while selection is likely being made with Arrow Keys */
document.addEventListener('keydown', (e) => {
    if (!document.activeElement.matches('input') && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        // Create style to hide .sld_up
        const style = document.createElement('style');
        style.id = 'hide-sld-up';
        style.textContent = '.sld_up { display: none!important; }';
        document.head.appendChild(style);

        const keysPressed = new Set();// Track key states
        const handleKeyDown = (event) => {keysPressed.add(event.key);};// Add key to pressed set

        // Remove key from pressed set
        const handleKeyUp = (event) => {
            keysPressed.delete(event.key);
            // When no arrow keys are pressed, remove style and listener
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && keysPressed.size === 0) {
                const styleElement = document.getElementById('hide-sld-up');
                if (styleElement) styleElement.remove();
                document.removeEventListener('keyup', handleKeyUp);
                document.removeEventListener('keydown', handleKeyDown);
            }
        };

        // Add listeners for keydown and keyup
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }
});