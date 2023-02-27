/* 
generateAllMarkers()
adds vmarkers to all verses on chapter load
*/

let bookMarkers;
let markersObjForCurrentBook;
let currentlyMarkedBook;
let arrOfAllVerseMarkersInBook = [];
let allBibleMarkersOBJ={}

// On Click of MARKERS Button in the ref code
function show_v_grp(x) {
    closeAnyMarkersCreatorInput()
    // Get the verseHolder
    let parent_vMultiple = elmAhasElmOfClassBasAncestor(x, '.vmultiple');
    appendAllAvialableMarkersToVMultiple(parent_vMultiple)
}
async function appendAllAvialableMarkersToVMultiple(parent_vMultiple, forChapter=0){
    let verse_refcode = parent_vMultiple.id.replace(/\./g,'_');
    let bcv = vNumCode(verse_refcode);
    
    // If v_markers already attached to verse, just toggle it
    if(v_markersHolder=parent_vMultiple.querySelector('.v_markers')){
        if(forChapter==0){
            slideUpDown(v_markersHolder);
            if(v_markerinputnbtn_holder = parent_vMultiple.querySelector('.v_markerinputnbtn_holder')){
                if(!v_markerinputnbtn_holder.matches('.slidleft')){toggleSlideLeft(v_markerinputnbtn_holder)}
            }
        }
    }
    // If v_markers NOT already attached to verse, create and append it to the verse
    else{
        let v_markersHolder = new DocumentFragment();
        let tempDIV = createNewElement('DIV','.v_markers', `[versecode=${verse_refcode}]`);
        tempDIV.innerHTML= `<button class="add_vMarker" onclick="add_vMarker_creator(this)">+</button>`;
        
        // If Verse Has Markers it is under, add them to the tempDIV
        if(forChapter){
            if(currentlyMarkedBook != bcv.bkName){
                bookMarkers = await markersForCurrentChapter(verse_refcode)
                currentlyMarkedBook = bcv.bkName;
                vmAppender(bookMarkers,tempDIV)
            }
            else if (await bookMarkers){
                vmAppender(bookMarkers,tempDIV)
            }
        } else {
            getMarkersForCurrentVerseFromFile(verse_refcode,tempDIV,parent_vMultiple);
        }   
        v_markersHolder.append(tempDIV);
        parent_vMultiple.append(v_markersHolder);
        tempDIV.querySelector('.add_vMarker').focus();
    }
    
    function vmAppender(bookMarkers,tempDIV){
        // First, get an array of the markers for this verse, if it has
        let arrOfVerseMarkers = [];
        let arrOfvm_withNotes = [];
        for(key in bookMarkers){
            if(arrOfVerses = bookMarkers[key][bcv.currentChpt]){
                arrOfVerses.forEach(arrOfversesInarr=>{
                    if(arrOfversesInarr[0]==bcv.currentV){
                        arrOfVerseMarkers.push(key);
                        if(arrOfversesInarr[1]){arrOfvm_withNotes.push(key)}
                    }
                })
            }
        }
        
        // Next create the marker elements and append them to the verseHolder
        let tempMarkersFrag = document.createDocumentFragment();
        arrOfVerseMarkers.forEach((mrk,i) => {
            let cleanMarker=mrk.replace(/\s+/,'_');// replace spaces with '_'
            let newMarkerNameClass = `marker_${cleanMarker}`;
            let dot_newMarkerNameClass = `.${newMarkerNameClass}`;
            let newMarkerElm = createNewElement('SPAN','.vmarker',dot_newMarkerNameClass);
            if(arrOfvm_withNotes.length>0 && arrOfvm_withNotes.includes(mrk)){
                newMarkerElm.classList.add("hasnote");
            }
            newMarkerElm.innerText=mrk;
            if(i>0){
                let textNode = document.createTextNode(';\u00A0');
                tempMarkersFrag.append(textNode)
            }
            tempMarkersFrag.append(newMarkerElm)
            /// Add marker class to vmultiple verses holder
            parent_vMultiple.classList.add(newMarkerNameClass);
        });
        let clonedNodes = new DocumentFragment();
        tempDIV.querySelectorAll('.add_vMarker,.v_markerinputnbtn_holder').forEach((x)=>{
            clonedNodes.append(x.cloneNode(true));
        })
        tempDIV.innerHTML=null;
        tempDIV.style.display = 'none';
        tempDIV.append(clonedNodes);
        tempDIV.prepend(tempMarkersFrag);
        setTimeout(() => {slideUpDown(tempDIV)}, 1);
    }
}
// On Click of +/- Button in v_markers div
function add_vMarker_creator(x) {
    let parent_vMarker = elmAhasElmOfClassBasAncestor(x, '.v_markers');
    closeAnyMarkersCreatorInput()
    //If input already present
    if(v_markerinputnbtn_holder = parent_vMarker.querySelector('.v_markerinputnbtn_holder')){
        toggleSlideLeft(v_markerinputnbtn_holder)
    }
    //If input NOT already present
    else {
        let tempDIV = createNewElement('DIV','.v_markerinputnbtn_holder');
        tempDIV.innerHTML= `<input placeholder="add marker"></input><button onclick="create_v_marker(this)"><img src="images/check-box-svgrepo-com.svg" alt="✓"></button>`;
        x.parentElement.append(tempDIV);
        let tempDIVinput = tempDIV.querySelector('input');
        tempDIVinput.focus();
        tempDIVinput.addEventListener('keypress',createMarkerOnEnterKeyPress);
        tempDIVinput.addEventListener('input',autocomplete);
        x.innerText='-';
    }
}
// On Click of ✓ button
async function create_v_marker(x) {
    //Get the inputValue
    if(newMarkerName = x.previousElementSibling.value.trim()){
        // Clean the input value up--it cannot have any space
        x.previousElementSibling.value = newMarkerName;
        let cleanMarker=newMarkerName.replace(/\s+/,'_');// replace spaces with '_'
        let newMarkerNameClass = `marker_${cleanMarker}`;
        let dot_newMarkerNameClass = `.${newMarkerNameClass}`;

        // Create the the new visual marker element
        let newMarkerElm = createNewElement('SPAN','.vmarker',dot_newMarkerNameClass)
        newMarkerElm.innerHTML=newMarkerName;
        // Prepare to prepend it
        let v_markersHolder = elmAhasElmOfClassBasAncestor(x, '.v_markers');
        
        //If marker not already present newMarkerNameClass
        if(!v_markersHolder.querySelector(dot_newMarkerNameClass)){
            let vcode = v_markersHolder.getAttribute('versecode');
            // Add marker to JSON file
            addNewMarkerToFile(vcode,cleanMarker,v_markersHolder).then(r=>{
                if(r!=false){
                    let v_markerinputnbtn_holder = elmAhasElmOfClassBasAncestor(x, '.v_markerinputnbtn_holder');
                    // Hide the input
                    if(!v_markerinputnbtn_holder.matches('.slidleft')){toggleSlideLeft(v_markerinputnbtn_holder)}
                    // Add marker class to vmultiple verses holder
                    let parent_vMultiple = elmAhasElmOfClassBasAncestor(x, '.vmultiple');
                    parent_vMultiple.classList.add(newMarkerNameClass)
                }
            })
        }
    }
}
async function getMarkersForCurrentVerseFromFile(verse_refcode,tempDIV,parent_vMultiple,arrOfvMks){
    let arrOfVerseMarkers,arrOfvm_withNotes;
    if(arrOfvMks){
        arrOfVerseMarkers = arrOfvMks;
    } else {
        objOfVerseMarkers = await markersForCurrentVerse(verse_refcode);
        arrOfVerseMarkers = await objOfVerseMarkers.allvMarkers;
        arrOfvm_withNotes = await objOfVerseMarkers.vMarkersWithNotes;
    }
    if(arrOfVerseMarkers){
        let tempMarkersFrag = document.createDocumentFragment();
        arrOfVerseMarkers.forEach((mrk,i) => {
            let cleanMarker=mrk.replace(/\s+/,'_');// replace spaces with '_'
            let newMarkerNameClass = `marker_${cleanMarker}`;
            let dot_newMarkerNameClass = `.${newMarkerNameClass}`;
            let newMarkerElm = createNewElement('SPAN','.vmarker',dot_newMarkerNameClass)
            newMarkerElm.innerText=mrk;
            
            if(arrOfvm_withNotes.includes(mrk)){
                newMarkerElm.classList.add("hasnote");
            }
            if(i>0){
                let textNode = document.createTextNode(';\u00A0');
                tempMarkersFrag.append(textNode)
            }
            tempMarkersFrag.append(newMarkerElm)
            /// Add marker class to vmultiple verses holder
            parent_vMultiple.classList.add(newMarkerNameClass);
        });
        let clonedNodes = new DocumentFragment();
        tempDIV.querySelectorAll('.add_vMarker,.v_markerinputnbtn_holder').forEach((x)=>{
            clonedNodes.append(x.cloneNode(true));
        })
        tempDIV.innerHTML=null;
        tempDIV.append(clonedNodes);
        tempDIV.prepend(tempMarkersFrag);
    }
}

/* READING & MODIFYING FILES */
// I am adding the markers to the bibleNotes files
async function markersForCurrentChapter(vcode){
    let bcv = vNumCode(vcode);
    // If you have already run this function before for any verse in this current book
    if(currentlyMarkedBook != bcv.bkName){
        // Empty the array (I may later make this optional)
        arrOfAllVerseMarkersInBook=[];
        currentlyMarkedBook = bcv.bkName;
        //Fetch the notefile
        let bookMarkerFile = fetchBookNotes(bcv.bkName);
        let promise = new Promise((resolve, reject) => {
            bookMarkerFile.then(jsonObject => {
                bibleBookMarkersObject = jsonObject;
                // If there is no marker key in the object, create it (this means no marker has ever been added to it)
                if(bibleBookMarkersObject?.markers==undefined){
                    bibleBookMarkersObject.markers={};
                    markersObjForCurrentBook=bibleBookMarkersObject.markers;
                    resolve(markersObjForCurrentBook)
                }
                else {
                    markersObjForCurrentBook=bibleBookMarkersObject.markers;
                    bookMarkers = bibleBookMarkersObject.markers;
                    for(key in bookMarkers){
                        if(arrOfAllVerseMarkersInBook.indexOf(key)<0){
                            arrOfAllVerseMarkersInBook.push(key)
                        }
                        if(arrOfAllVerseMarkersInBook.indexOf(key)<0){
                            arrOfAllVerseMarkersInBook.push(key)
                        }
                    }
                    resolve(bookMarkers)
                }
            })
        })
        return await promise;
    } else {
        return bookMarkers
    }
}
async function markersForCurrentVerse(vcode){
    let bcv=vNumCode(vcode);
    let result;
    let arrOfVerseMarkers = [],arrOfvm_withNotes=[];

    // If you have already run this function before for any verse in this current book
    if(currentlyMarkedBook == bcv.bkName){
        let promise = new Promise((resolve, reject) => {
            let bookMarkers = markersObjForCurrentBook;
            for(key in bookMarkers){
                if(arrOfAllVerseMarkersInBook.indexOf(key)<0){
                    arrOfAllVerseMarkersInBook.push(key)
                }
                if(arrOfVerses = bookMarkers[key][bcv.currentChpt]){
                    arrOfVerses.forEach(arrOfversesInarr=>{
                        if(arrOfversesInarr[0]==bcv.currentV){
                            arrOfVerseMarkers.push(key);
                            // For markers that have notes
                            if(arrOfversesInarr[1]){arrOfvm_withNotes.push(key)}
                            }
                    })
                }
            }
            resolve({allvMarkers:arrOfVerseMarkers,vMarkersWithNotes:arrOfvm_withNotes})
        })
        result = await promise;
    }

    // If this is the first time running this function for a verse in this current book
    else {
        // Empty the array (I may later make this optional)
        arrOfAllVerseMarkersInBook=[]
        currentlyMarkedBook = bcv.bkName
        //Fetch the notefile
        let bookMarkerFile = fetchBookNotes(bcv.bkName);
        let promise = new Promise((resolve, reject) => {
            bookMarkerFile.then(jsonObject => {
                bibleBookMarkersObject = jsonObject;
                // If there is no marker key in the object, create it (this means no marker has ever been added to it)
                if(bibleBookMarkersObject?.markers == undefined){
                    bibleBookMarkersObject.markers={};
                    markersObjForCurrentBook=bibleBookMarkersObject.markers;
                    resolve({allvMarkers:arrOfVerseMarkers,vMarkersWithNotes:arrOfvm_withNotes})
                }
                else {
                    markersObjForCurrentBook=bibleBookMarkersObject.markers;
                    let bookMarkers = bibleBookMarkersObject.markers;
                    for(key in bookMarkers){
                        if(arrOfAllVerseMarkersInBook.indexOf(key)<0){
                            arrOfAllVerseMarkersInBook.push(key)
                        }
                        if(arrOfVerses = bookMarkers[key][bcv.currentChpt]){
                            arrOfVerses.forEach(arrOfversesInarr=>{
                                if(arrOfversesInarr[0]==bcv.currentV){
                                    arrOfVerseMarkers.push(key);
                                    // For markers that have notes
                                    if(arrOfversesInarr[1]){arrOfvm_withNotes.push(key)}
                                }
                            })
                        }
                    }
                    resolve({allvMarkers:arrOfVerseMarkers,vMarkersWithNotes:arrOfvm_withNotes})
                }
            })
        })
        result = await promise;
    }
    return result
}
async function addNewMarkerToFile(vcode,markername,vmHolder){

    /* THIS FUNCTION WILL NOT RUN IF THE REFERENCE IS ALREADY UNDER THE MARKER */
    let bcv = vNumCode(vcode);
    
    // Make a copy of the markersObjForCurrentBook and modify the copy and only copy it back into the markersObjForCurrentBook if the markers name is not rejected
    let tempMrkObj = deepCopyObj(markersObjForCurrentBook);

    // If the marker does not exist
    if(!tempMrkObj[markername]){
        allVMarkersInAllBooks = addKeyToArrayOfAllVerseMarkers(markername)// all markers in all bible books and not jsut the current book
        tempMrkObj[markername]={};
        if(arrOfAllVerseMarkersInBook.indexOf(markername)<0){arrOfAllVerseMarkersInBook.push(markername)}
    }
    // If the chapter exists, add the verse to its array
    if(tempMrkObj[markername][bcv.currentChpt]){
        tempMrkObj[markername][bcv.currentChpt].push([bcv.currentV]);
        let tarr = tempMrkObj[markername][bcv.currentChpt];
        tempMrkObj[markername][bcv.currentChpt] = tarr.sort(function(a, b){return a[0] - b[0]});
    }
    // If the chapter DOES NOT exist, create the chpt key with value of a new array with the currentVerse in it
    else {
        tempMrkObj[markername][bcv.currentChpt]=[[bcv.currentV]];
    }
    
    //Get current state of file, and then modify the markers object in it
    let returnedJSONobject = await fetchBookNotes(bcv.bkName);

    currentBookName = bcv.bkName;
    returnedJSONobject.markers=sortObj(tempMrkObj);
    let newJSON_data = JSON.stringify(returnedJSONobject, null, 1);

    let r = await saveToLocalDrive(newJSON_data);
    // r will be false if the save operation was cancelled
    if(r!=false){
        markersObjForCurrentBook = deepCopyObj(tempMrkObj);
        if(vcode&&vmHolder){
            let parent_vMultiple = elmAhasElmOfClassBasAncestor(vmHolder, '.vmultiple');
            getMarkersForCurrentVerseFromFile(vcode,vmHolder,parent_vMultiple)
        }
        return true
    } else {
        return false
    }
}
async function removeMarkerFromJSONfile(vcode, markername){
    let bcv = vNumCode(vcode);
    // Make a copy of the markersObjForCurrentBook and modify the copy and only copy it back into the markersObjForCurrentBook if the markers name is not rejected
    let tempMrkObj = deepCopyObj(markersObjForCurrentBook);

    // Remove verse from array for the chapter
    let arrOfVersesInChptUnderMarkername = tempMrkObj[markername][bcv.currentChpt];
    removeItemFromArray([bcv.currentV],arrOfVersesInChptUnderMarkername);
    // Remove Key&Value from markername object if the value/array is empty
    if(arrOfVersesInChptUnderMarkername.length==0){
        delete tempMrkObj[markername][bcv.currentChpt]
        // Delete MarkerName if it has no reference assigned to it
        if(Object.keys(tempMrkObj[markername]).length==0){
            delete tempMrkObj[markername];
        }
    }
    // Get current state of file
    let returnedJSONobject = await fetchBookNotes(bcv.bkName)
    
    // Then modify the markers object in it
    currentBookName = bcv.bkName;
    returnedJSONobject.markers=sortObj(tempMrkObj);
    let newJSON_data = JSON.stringify(returnedJSONobject, null, 1);

    let r = await saveToLocalDrive(newJSON_data)
    // r will be false if the save operation was cancelled
    if(r!=false){
        markersObjForCurrentBook = deepCopyObj(tempMrkObj);
        return true
    } else {
        return false
    }
}
async function generateAllMarkers(){
    let allVmultiple = main.querySelectorAll('.vmultiple');

    // I append it in reverse so that it doesn't scroll away from the topmost verse
    for (let i = allVmultiple.length-1; i > -1; i--) {
        const vmultiple = allVmultiple[i];
        await appendAllAvialableMarkersToVMultiple(vmultiple, true)
    }
}

/* CONTEXT-MENU FOR MARKERS */
document.addEventListener(contextMenu_touch, markersOptions);
main.addEventListener('mousedown', remove_MarkersOptions);
document.addEventListener('click', highlight_allVmultipleWithMarker_Class);
combinedVersemarkers_list.addEventListener('click', goToPrevNxtVerse);
function remove_MarkersOptions(e){
    if(!e.target.matches('.vmarker')&&!e.target.matches('#vmarker_options_menu, #vmarker_options_menu *')){
        if(prev_vmrkoptm=main.querySelector('#vmarker_options_menu')){
            prev_vmrkoptm.remove()
        }
    }
}
function markersOptions(e){
    if(e.target.matches('.vmarker')){
        eTargetMarker = e.target;
        let markerName = getMarkerName(eTargetMarker).split(' ')[0];
        let highlightBtnText = 'Highlight Marker';
        let disableOrNot='disabled', shownotedisabled='';
        let mrknotremovebtn = 'none', mrkshownotebtn='', createORedit = 'Edit', createDisplay='';
        if(eTargetMarker.classList.contains('showingNote')){
            mrknotremovebtn='';
            createDisplay='none';
            shownotedisabled='disabled'
        }
        if(!eTargetMarker.classList.contains('hasnote')){
            mrkshownotebtn='none';
            createORedit = 'Create';
        }
        if(document.querySelector('#vm_marker')){
            disableOrNot = '';
        };
        if(document.querySelector(`#vm_marker[markerfor=${markerName}]`)){
            highlightBtnText = 'Unhighlight Marker';
        }
        let vmarker_options_menu = createNewElement('div','#vmarker_options_menu', '.slidedown',`[markerfor=${markerName}]`);
        vmarker_options_menu.innerHTML = `<button class="vmarker_options" id="vmarker_sidenav" onclick="hideRefNav(null, bibleapp_versemarkers)">Toggle Sidenav</button><button class="vmarker_options" id="vmarker_showAllMarkers" onclick="showAllVersesMarkers()">Markers In All Verses</button>
        <code>Highlighting</code>
        <button class="vmarker_options" id="vmarker_highlight" onclick="highlight_allVmultipleWithMarker_Class(this)">${highlightBtnText}</button><button class="vmarker_options" id="vmarker_unhighlight_all" onclick="highlight_allVmultipleWithMarker_Class('all')" ${disableOrNot}>Unhilight All Markers</button>
        <code>Generate Report</code>
        <button class="vmarker_options" id="vmarker_single_report" onclick="generateVmarkerReport('single',true)" placeholder="generate report for this marker">Single Marker</button><button class="vmarker_options" id="vmarker_all_report" onclick="generateVmarkerReport('all',true)" placeholder="generate report for all markers in this book">All Markers</button>
        <code>Marker Short Note</code>
        <button class="vmarker_options" id="vmarker_shownote" style="display:${mrkshownotebtn}" onclick="addMarkerNote(this,'show')" ${shownotedisabled}>Show Note</button><button class="vmarker_options" id="vmarker_editnote" style="display:${createDisplay}" onclick="addMarkerNote(this,'edit')">${createORedit} Marker Note</button><button class="vmarker_options" id="vmarker_removenote" style="display:${mrknotremovebtn}" onclick="removeMarkerNote(this)">Remove Note</button>
        <code>Delete</code>
        <button class="vmarker_options" id="vmarker_delete" onclick="deleteVmarker('one', this)">Delete</button>`;
        if(prev_vmrkoptm=document.querySelector('#vmarker_options_menu')){
            prev_vmrkoptm.remove()
        }
        vmarker_options_menu.style.top=eTargetMarker.offsetTop + eTargetMarker.offsetHeight + "px";
        vmarker_options_menu.style.left=eTargetMarker.offsetLeft + "px";
        // vmarker_options_menu.style.right=eTargetMarker.offsetLeft + eTargetMarker.offsetWidth + "px";
        eTargetMarker.parentElement.append(vmarker_options_menu)
    }
}
let showAllVersesMarkers = toggleVmarkersInVerses();
function toggleVmarkersInVerses(){
    let count=1;
    return function toggleAllvm(){
        let sldUpVmarkers=document.querySelectorAll('.v_markers');
        if(sldUpVmarkers){
            svmmm=sldUpVmarkers;
            if(count%2){
                sldUpVmarkers.forEach(sldvm=>{
                    slideUpDown(sldvm,'show')
                    sldvm.style.display = "";
                })
                console.log({count})
            } else {
                sldUpVmarkers.forEach(sldvm=>{
                    slideUpDown(sldvm, 'hide')
                })
                console.log({count})
            }
            count++
        }
    }
}
function highlight_allVmultipleWithMarker_Class(eX){
    /* NOTE: eX may be an element or a click event */

    let markerName,markerElm,hlghtMarkerBtn;
    if(eX=='all'){
        if(vm_marker=document.querySelector('#vm_marker')){
            vm_marker.remove();
            vmarker_highlight.innerText = 'Highlight Marker';
        }
        return
    }

    /* *********************************** */
    /*         GET THE MARKER NAME         */
    /* *********************************** */
    /* IF the supplied value for the eX parameter IS AN ELEMENT */
    // OnClick of highlightMarker button
    else if(eX.nodeType !== undefined){
        hlghtMarkerBtn = eX;
        markerName = elmAhasElmOfClassBasAncestor(hlghtMarkerBtn,'#vmarker_options_menu').getAttribute('markerfor')
    }

    /* IF eX IS AN EVENT */
    // OnClick of markername element
    // (for when the function is called on click of marker)
    else {
        if(eX.target.matches('.vmarker')){
            markerElm = eX.target;
            markerName = getMarkerName(markerElm);
            if(document.querySelector('#vmarker_options_menu')){vmarker_options_menu.remove()}
        }
        // Button in #currentbook_versemarkers_list
        else if (eX.target.matches('.vm,.vmbtnprevious,.vmbtnnext')){
            hlghtMarker_RefNav_Btn = eX.target;
            markerName = elmAhasElmOfClassBasAncestor(hlghtMarker_RefNav_Btn,'.vm_btns').getAttribute('markerfor')
        }
         else return
    }
    /* *********************************** */
    /*   USING THE MARKER NAME, HIGHLIGHT  */
    /*     THE VERSES UNDER THE MARKER     */
    /* *********************************** */
    // Button in #currentbook_versemarkers_list
    if (eX.nodeType == undefined && eX.target.matches('.vmbtnprevious,.vmbtnnext') && document.querySelector(`#vm_marker[markerfor=${markerName}]`)){
        return
    }
    else {
        // If stylesheet already exists for marker in the document head
        if(vm_marker=document.querySelector(`#vm_marker[markerfor=${markerName}]`)){
            vm_marker.remove();
            if(hlghtMarkerBtn){
                hlghtMarkerBtn.innerText = 'Highlight Marker';
                vmarker_unhighlight_all.disabled = true;//disable unHiglight all markers button
            }
        }
        // Else Create styleSheet and append to head
        else {
            let vm_marker_styleRule = `.vmultiple.${markerName} {
                border-left: 10px solid red!important;
            }
            .vmultiple.${markerName} .verse {
                background-color: var(--vhlt2);
            }
            .darkmode .vmultiple.${markerName} .verse {
                background-color: brown;
            }
            .vmultiple.${markerName} .v_markers {
                display:flex!important;
                margin-top:0!important;
                opacity:1!important;
                z-index:1!important;
            }
            /* .vmultiple.${markerName} .verse[class^=v_]:not(:hover),
            .vmultiple.${markerName} .verse[class^=v_]:not(:hover) span {
                color:black!important;
            } */
        .${markerName}.vmarker, #${markerName.replace(/marker/,'vm')} button {
                border:2px solid brown!important;
                background-color: #fff0f2;
                font-weight:bold;
                border-radius:2px;
            }
            .darkmode #${markerName.replace(/marker/,'vm')} button {
                background-color: #50efad;
            }
            .darkmode #${markerName.replace(/marker/,'vm')} .vmbtnprevious:before,
            .darkmode #${markerName.replace(/marker/,'vm')} .vmbtnnext:before {
                background: url(images/arrow-up-svgrepo-com.svg) center no-repeat!important;
            }
            .darkmode #${markerName}.vm:not(:hover) div {
                color:black!important;
            }
            .darkmode .${markerName}.vmarker{
                border:1px dashed yellow!important;
                color: white!important;
                background: transparent;
            }
            .darkmode .vmultiple.${markerName} {
                border-color: orange!important;
            }
            .darkmode .vmultiple.${markerName}
            .darkmode .${markerName}.vmarker {
                background-color: transparent;
            }`
            createNewStyleSheetandRule('vm_marker',vm_marker_styleRule);
            document.querySelector('#vm_marker').setAttribute('markerfor', markerName);
            if(hlghtMarkerBtn){
                hlghtMarkerBtn.innerText = 'Unhighlight Marker';
                vmarker_unhighlight_all.disabled = false;//enable unHiglight all markers button
            }
        }
        document.querySelectorAll(`.vmultiple.${markerName} div.v_markers.sld_up`).forEach(sldvm=>{
            slideUpDown(sldvm,'show');
            sldvm.style.display="";
        })
    }
}
async function generateVmarkerReport(allorOne,appendVersesToSearchWindow,markerName){
    /* ****************************************************** */
    /*        GENERATES ARRAY OF REFERENCES FOR MARKER   &&   */
    /*  APPENDS REFERENCES FOR MARKER TO SEARCH RESULT WINDOW */
    /* ****************************************************** */
    if(!allorOne || allorOne=='single'){
        // Get all references under class
        // let markerName;
        if(!markerName){markerName = (()=>{let mkn; eTargetMarker.classList.forEach(cl=>{/\bmarker_/.test(cl) ? mkn=cl.replace(/marker_/,'') : null}); return mkn})();}
        let arrayOfRefs = [];
        for(let i=0;i<allBibleBooks.length;i++){
            let bk = allBibleBooks[i];
            let jsonObject = await fetchBookNotes(bk);
            // fetchBookNotes(bk).then(jsonObject => {
            if(jsonObject){
                let currentBookMarkers = jsonObject["markers"];
                if(currentBookMarkers){
                    let markerChapters = currentBookMarkers[markerName];
                    for(k_chpt in markerChapters){
                        let markerVerses = markerChapters[k_chpt];
                        markerVerses.forEach(k_v => {
                            // const markerRef = `${bcv.bkName}.${k_chpt}.${k_v[0]}`;
                            const markerRef = `${bk}.${k_chpt}.${k_v[0]}`;
                            if(!arrayOfRefs.includes(markerRef)){
                                arrayOfRefs.push(markerRef);
                            }
                        });
                    }
                }
                /* ***************************************************** */
                /*         IF appendVersesToSearchWindow IS TRUE         */
                /* WILL APPEND VERSES FOR MARKER TO SEARCH RESULT WINDOW */
                /* ***************************************************** */
                if(appendVersesToSearchWindow && i==allBibleBooks.length-1){ 
                    /* FOR CROSS-REFS & NOTES IN SEARCH WINDOW */
                    //To Clear "searchPreviewFixed" Window after given time
                    searchPreviewFixed.innerHTML='';
                    arrayOfRefs.forEach(ref=>{
                        let vHolder = getCrossReference(ref);
                        searchPreviewFixed.append(vHolder);
                        let allSearchVerses = searchPreviewFixed.querySelectorAll('span.verse');
                        allSearchVerses[allSearchVerses.length-1].append(crfnnote_DIV());
                    })
                    if(!keepsearchopen.checked){runFuncAfterSetTimeInactivityInElm(searchPreviewWindowFixed, 60000, clearSearchWindow)}
                    // Empty the window where they will be appended (using the search window for now)
                    hideRefNav('show');
                    // Append to their window (using the search window for now)
                    hideRefNav('show', searchPreviewWindowFixed);
                }
            }
            // })
        }
        return await arrayOfRefs
    }
}
function addMarkerNote(clickedBtn,editNt){
    if(markernote=eTargetMarker.parentElement.querySelector('#markernote')){
        markernote.remove()
    }
    // Check if marker has note
    const markername = vmarker_options_menu.getAttribute('markerfor').split('marker_')[1];
    const vcode = eTargetMarker.parentElement.getAttribute('versecode');
    const bcv = vNumCode(vcode);
    let txtContent='';
    markersObjForCurrentBook[markername][vNumCode(vcode).currentChpt].forEach((vm,i)=>{
            if(vm[0]==bcv.currentV){
                if(vm[1]){txtContent = vm[1]}
            }
        });
    
    // if(marker Has Note){txtContent=${marekerNoteText};}
    // Add marker note
    const markerNoteHolder = createNewElement('span','.markernote',`.marker_${markername}`);
    insertElmAbeforeElmB(markerNoteHolder, eTargetMarker.nextElementSibling);
    const closeBtn = createNewElement('button','.closebtn','.cmenu_closebtn','[onclick=this.parentElement.previousElementSibling.classList.remove("showingNote")],this.parentElement.remove()')
    if(editNt=='edit'){
        const markerNoteText = createNewElement('span','.markernotetext','[contenteditable=true]');
        const markerNoteSaveBtn = createNewElement('Button','.markernotesavebtn',`[onclick=saveMarkerNote(this,'${vcode}','${markername}')]`);
        markerNoteSaveBtn.innerText = 'Save';
        if(txtContent==''){txtContent='<p placeholder="Add short note for marker"></p>'}
        markerNoteText.innerHTML = txtContent;
        markerNoteHolder.append(markerNoteText);
        markerNoteHolder.append(markerNoteSaveBtn);
        markerNoteHolder.append(closeBtn);
        markerNoteText.querySelector('p').focus();
    } else {
        markerNoteHolder.innerHTML = txtContent;
        markerNoteHolder.append(closeBtn);
    }
    eTargetMarker.classList.add('showingNote')
    // Create button to remove marker note
    clickedBtn.nextElementSibling.style.display='';
    //remove vmarker_options_menu
    vmarker_options_menu.remove();
}
function removeMarkerNote(x){
    eTargetMarker.nextElementSibling.remove();//remove the note
    eTargetMarker.classList.remove('showingNote')//remove the note
    x.style.display='none';// hide the removenote btn
    vmarker_shownote.disabled = false;
}
async function saveMarkerNote(dis,vcode,markername) {
    const markerNoteHolder = dis.parentElement;
    const markernoteText = markerNoteHolder.querySelector('.markernotetext').innerHTML;

    let bcv = vNumCode(vcode);
    
    // Make a copy of the markersObjForCurrentBook and modify the copy and only copy it back into the markersObjForCurrentBook if the markers name is not rejected
    let tempMrkObj = deepCopyObj(markersObjForCurrentBook);
    tempMrkObj[markername][bcv.currentChpt].forEach((vm,i)=>{
        if(vm[0]==bcv.currentV){
            let newVal = [bcv.currentV,markernoteText];
            // If the is no text, delete the marker note
            if(!markerNoteHolder.querySelector('.markernotetext').innerText.trim()){
                newVal = [bcv.currentV];
                elmAhasElmOfClassBasAncestor(dis,'.v_markers').querySelector(`.vmarker.marker_${markername}`).classList.remove('hasnote')
            } else {
                elmAhasElmOfClassBasAncestor(dis,'.v_markers').querySelector(`.vmarker.marker_${markername}`).classList.add('hasnote')
            }
            tempMrkObj[markername][bcv.currentChpt].splice(i,1,newVal)
        }
    });
    //Get current state of file, and then modify the markers object in it
    let returnedJSONobject = await fetchBookNotes(bcv.bkName);
    
    returnedJSONobject.markers=tempMrkObj;
    let newJSON_data = JSON.stringify(returnedJSONobject, null, 1);

    let r = await saveToLocalDrive(newJSON_data);
    if(r!=false){
        markersObjForCurrentBook = deepCopyObj(tempMrkObj);
        markerNoteHolder.innerHTML = markernoteText;
        return true
    } else {
        return false
    }
}
async function deleteVmarker(allorOne, x){
    let markerName = (()=>{let mkn; eTargetMarker.classList.forEach(cl=>{/\bmarker_/.test(cl) ? mkn=cl.replace(/marker_/,'') : null}); return mkn
    })();
    
    let vcode = eTargetMarker.parentElement.getAttribute('versecode');
    removeMarkerFromJSONfile(vcode, markerName).then(r=>{
        if(r!=false){
            const txtNode = eTargetMarker.previousSibling;
            if (txtNode && txtNode.nodeType === 3) {txtNode.remove()}
            eTargetMarker.remove()
            x.style.pointerEvents='none';
            // Remove marker class from parent vmultiple
            let parent_vMultiple = elmAhasElmOfClassBasAncestor(x, '.vmultiple');

            const eTargClasses = eTargetMarker.classList;
            let mark_;
            for (j=0; j<eTargClasses.length; j++) {
                if (/\bmark_/.test(eTargClasses[j])){mark_ = eTargClasses[j]; break}
            }
            parent_vMultiple.classList.remove(mark_);
            document.querySelector('#vmarker_options_menu').remove();
        }
    })
}
let lastVerseJumpedTo;
let lastMarker_goToPrevNxtVerse,arrOf_allRefs_UnderMarker, lastMarkerRef_indx, offpage_MarkerRef_gotten = false;
async function goToPrevNxtVerse(e) {
    if(e.target.matches('.vmbtnprevious, .vmbtnnext')){
        const prNx = e.target;
        const marker_ = elmAhasElmOfClassBasAncestor(prNx,'.vm_btns').id.replace(/vm_/,'marker_')
        // const marker_s = document.querySelectorAll(`.vmultiple.${marker_}`)
        const marker_s = [];
        // const scrollBehaviour = {behavior:"smooth",block:"nearest"};
        
        if(lastMarker_goToPrevNxtVerse!=marker_){
            offpage_MarkerRef_gotten = false;
            // So that it doesn't run the function if the array has already been generated,
            // That is, if it was the same marker that was looked at before
            arrOf_allRefs_UnderMarker = await generateVmarkerReport(null,null,marker_.replace(/marker_/,''));
            lastMarker_goToPrevNxtVerse=marker_;
        }
        // IF THERE ARE NO VERSES UNDER MARKER ON THE PAGE
        if(marker_s.length==0){
            const highestVerseOnPage = getHighestVisibleH2().highestVerse;
            const chptHoldersOnPage = highestVerseOnPage.parentElement;
            const versenNum = highestVerseOnPage.id.split('.')[2];

            const highestBookID = chptHoldersOnPage.getAttribute('bookid');
            const highestBkName = chptHoldersOnPage.getAttribute('bookname');
            const highestChapter = chptHoldersOnPage.getAttribute('chapter');

            const lowestBookID = chptHoldersOnPage.getAttribute('bookid');
            const lowestBkName = chptHoldersOnPage.getAttribute('bookname');
            const lowestChapter = chptHoldersOnPage.getAttribute('chapter');

            // LOOP THROUGH arrOf_allRefs_UnderMarker TO GET THE CLOSEST BOOK
            let closest_bkName_ABOVE;
            let closest_chapter_ABOVE;
            let closest_verse_ABOVE;
            let closest_FullRef_ABOVE;
            let closest_refDecimal_ABOVE;
            let closest_bkName_BELOW;
            let closest_chapter_BELOW;
            let closest_verse_BELOW;
            let closest_FullRef_BELOW;
            let closest_refDecimal_BELOW;
            let ref2goto;
            let bkInRef;
            if(offpage_MarkerRef_gotten){
                if(prNx.matches('.vmbtnprevious')){
                    if(lastMarkerRef_indx - 1 > -1){
                        lastMarkerRef_indx = lastMarkerRef_indx - 1;
                        console.log({lastMarkerRef_indx});
                    }
                    else if(lastMarkerRef_indx - 1 == -1){
                        lastMarkerRef_indx = arrOf_allRefs_UnderMarker.length - 1;
                        console.log({lastMarkerRef_indx});
                    }
                }
                else if(prNx.matches('.vmbtnnext')){
                    if(lastMarkerRef_indx + 1 < arrOf_allRefs_UnderMarker.length){
                        lastMarkerRef_indx = lastMarkerRef_indx + 1;
                        console.log({lastMarkerRef_indx});
                    }
                    else if(lastMarkerRef_indx + 1 == arrOf_allRefs_UnderMarker.length){
                        lastMarkerRef_indx = 0;
                        console.log({lastMarkerRef_indx});
                    }
                }
                ref2goto = arrOf_allRefs_UnderMarker[lastMarkerRef_indx]
                console.log({ref2goto});
            }
            else {
                offpage_MarkerRef_gotten = true;
                for (let i = 0; i < arrOf_allRefs_UnderMarker.length; i++) {
                    let ref_bkn = arrOf_allRefs_UnderMarker[i].split('.')[0];
                    if(ref_bkn!=bkInRef){
                        if(prNx.matches('.vmbtnprevious')){
                            /* ********************************************************** */
                            /*                           PREVIOUS                         */
                            /* ********************************************************** */
                            closest_bkName_ABOVE = ref_bkn;
                            closest_FullRef_ABOVE = arrOf_allRefs_UnderMarker[i];
                            closest_chapter_ABOVE = closest_FullRef_ABOVE.split('.')[1];
                            closest_verse_ABOVE = closest_FullRef_ABOVE.split('.')[2];
                            ref2goto = arrOf_allRefs_UnderMarker[i];
                            lastMarkerRef_indx=i;
                            // Change chapter and verse to decimal (add 0 before it and compare)
                            closest_refDecimal_ABOVE = decimalZeros(closest_chapter_ABOVE,closest_verse_ABOVE);
                            let refOnpage_decimal = decimalZeros(lowestChapter,versenNum)

                            // If index is LESSER, then the book is above the current open book
                            if(allBibleBooks.indexOf(ref_bkn) < highestBookID){
                                
                                // Check ahead until the bookname changes
                                let j = i + 1;
                                if(j < arrOf_allRefs_UnderMarker.length){
                                    console.log({ref2goto})
                                    let nxt_ref_bkn = arrOf_allRefs_UnderMarker[j].split('.')[0]
                                    // if the next book is higher than the book on the page
                                    if((closest_bkName_ABOVE != nxt_ref_bkn) && (allBibleBooks.indexOf(nxt_ref_bkn) > highestBookID)){
                                        console.log({ref2goto})
                                        gotoRef(ref2goto)
                                        return
                                    }
                                }
                            }
                            // If it is the same book
                            else if(allBibleBooks.indexOf(ref_bkn)==highestBookID){
                                // check if chapter is LESSER
                                let j = i + 1;
                                if(closest_refDecimal_ABOVE<=refOnpage_decimal){
                                    gotoRef(ref2goto);
                                    return
                                }
                                // Compare the present ref with the one ahead
                                else if(j < arrOf_allRefs_UnderMarker.length){
                                    let nxt_ref_bkn = arrOf_allRefs_UnderMarker[j].split('.')[0];
                                    let nxt_refDecimal_ABOVE = decimalZeros(arrOf_allRefs_UnderMarker[j].split('.')[1],arrOf_allRefs_UnderMarker[j].split('.')[2]);
                                    /* // if the next book is higher than the book on the page    */
                                    /* // goto current ref                                        */
                                    /*     // if book name changes                                */
                                    /*     // if the chapter and verse decimal is lesser or equal */
                                    if((nxt_ref_bkn == closest_bkName_ABOVE) && (nxt_refDecimal_ABOVE > refOnpage_decimal)){
                                        gotoRef(ref2goto);
                                        return
                                    }
                                }
                            }
                        }
                        else if(prNx.matches('.vmbtnnext')){
                            /* ********************************************************** */
                            /*                             NEXT                           */
                            /* ********************************************************** */
                            closest_bkName_BELOW = ref_bkn;
                            closest_FullRef_BELOW = arrOf_allRefs_UnderMarker[i];
                            closest_chapter_BELOW = closest_FullRef_BELOW.split('.')[1];
                            closest_verse_BELOW = closest_FullRef_BELOW.split('.')[2];
                            ref2goto = arrOf_allRefs_UnderMarker[i];
                            // Change chaper and verse to decimal (add 0 before it and compare)
                            closest_refDecimal_BELOW = decimalZeros(closest_chapter_BELOW,closest_verse_BELOW);
                            let refOnpage_decimal = decimalZeros(lowestChapter,versenNum);
                            lastMarkerRef_indx=i;
                            
                            // If bookIndx of ref is GREATER than the bookIndx of the reference on page, then the book is certainly below the current open book
                            if(allBibleBooks.indexOf(ref_bkn)>lowestBookID){
                                // The first bookIndx greater than the current book is the closest lowest
                                // Its chapter and verse will also be the closest
                                gotoRef(ref2goto)
                                return
                            }
                            // If it is the same book
                            else if(allBibleBooks.indexOf(ref_bkn)==lowestBookID){
                                let j = i + 1;
                                // check if chapter is GREATER, then it is the closest next2
                                if(closest_refDecimal_BELOW >= refOnpage_decimal){
                                    gotoRef(ref2goto)
                                    return
                                }
                                // Check next ref and compare
                                else if (j < arrOf_allRefs_UnderMarker.length){
                                    let nxt_ref_bkn = arrOf_allRefs_UnderMarker[j].split('.')[0];
                                    let nxt_refDecimal_BELOW = decimalZeros(arrOf_allRefs_UnderMarker[j].split('.')[1], arrOf_allRefs_UnderMarker[j].split('.')[2]);
                                    if(((nxt_ref_bkn == closest_bkName_BELOW) || (nxt_refDecimal_BELOW >= refOnpage_decimal))){
                                        gotoRef(ref2goto)
                                        return
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log({ref2goto})
            gotoRef(ref2goto)
        }
        // else{
        //     console.log('YES - marker_s');

        //     marker_s.forEach((mks,i)=>{
        //         /* FULLY SHOWING */
        //         if(isFullyScrolledIntoView(mks)){
        //             //Go to next verse
        //             if(prNx.matches('.vmbtnnext') && marker_s[i+1]){
        //                 lastVerseJumpedTo=marker_s[i+1];
        //                 lastVerseJumpedTo.scrollIntoView(scrollBehaviour);
        //             }
        //             else if(prNx.matches('.vmbtnprevious') && marker_s[i-1]){
        //                 lastVerseJumpedTo=marker_s[i-1];
        //                 lastVerseJumpedTo.scrollIntoView(scrollBehaviour);
        //             }
        //         }
        //         /* PARTIALLY SHOWING */
        //         else if(isPartiallyScrolledIntoView(mks)){
        //             // Scroll it inot view if it is the last verse just scrolled to 
        //             if(prNx.matches('.vmbtnnext')){
        //                 if(lastVerseJumpedTo!=mks){
        //                     mks.scrollIntoView(scrollBehaviour)
        //                     lastVerseJumpedTo=mks;
        //                 }
        //             }
        //             else if(prNx.matches('.vmbtnprevious')){
        //                 if(lastVerseJumpedTo!=mks){
        //                     mks.scrollIntoView(scrollBehaviour)
        //                     lastVerseJumpedTo=mks;
        //                 }
        //             }
        //         }
        //         /* NONE SHOWING */
        //         else {
        //             // Get the topmost visible vmultiple and determine the closest vmarker
        //             const allVmultipleOnPage = document.querySelectorAll(`.vmultiple`)
        //             allVmultipleOnPage.forEach((vmlt,i)=>{
        //                 if(isPartiallyScrolledIntoView(vmlt)){
        //                     // If go to next
        //                     if(prNx.matches('.vmbtnnext')){
        //                         for (let j = i; j < allVmultipleOnPage.length; j++) {
        //                             const vmlt_2 = allVmultipleOnPage[j];
        //                             if(vmlt_2.matches(`.${marker_}`)){
        //                                 vmlt_2.scrollIntoView(scrollBehaviour);
        //                                 break
        //                             }
        //                         }
        //                     }        
        //                 }
        //             })
        //         }
        //     })
        // }
    }
    function decimalZeros(c,v) {
        let dZeros = '';
        if(v.length==1){dZeros='00'}
        else if(v.length==2){dZeros='0'}
        return Number(`${c}.${dZeros}${v}`)
    }
}

/* HELPER FUNCTION TO SLIDE LEFT v_markerinputnbtn_holder */
function closeAnyMarkersCreatorInput(){
    let v_markerinputnbtn_holder = document.querySelector('.v_markerinputnbtn_holder');
    // Hide the input
    if(v_markerinputnbtn_holder && !v_markerinputnbtn_holder.matches('.slidleft')){toggleSlideLeft(v_markerinputnbtn_holder)}
}
function toggleSlideLeft(elm){
    if(elm.matches('.slidleft')){
        elm.style.marginLeft = '0';
        elm.style.opacity = 1;
        elm.classList.remove('slidleft');
        elm.parentElement.querySelector('.add_vMarker').innerText='-';
        let elmInput = elm.querySelector('input');
        elmInput.focus();
        elmInput.setSelectionRange(0, elmInput.value.length);
        elmInput.addEventListener('keypress',createMarkerOnEnterKeyPress);
        elmInput.addEventListener('input',autocomplete);
    } else {
        elm.style.marginLeft = `-${elm.offsetWidth + elm.offsetLeft}px`;
        elm.style.opacity = 0;
        elm.classList.add('slidleft');
        elm.parentElement.querySelector('.add_vMarker').innerText='+';
        elm.querySelector('input').removeEventListener('keypress',createMarkerOnEnterKeyPress);
        elm.parentElement.querySelector('.add_vMarker').focus();
    }
}
function createMarkerOnEnterKeyPress(e) {
    if ((e.keyCode === 13)) {
        create_v_marker(e.target.parentElement.querySelector('button'))
    }
}
function vNumCode(vcode){
    vcode = vcode.slice(1).split('_');
    return {
        bkName:bible.Data.allBooks[vcode[0]],
        currentChpt:Number(vcode[1])+1,
        currentV:Number(vcode[2])+1
    }
}
function getMarkerName(eTargetMarker){
    let markerName;
    eTargetMarker.classList.forEach(cl=>{/\bmarker_/.test(cl) ? markerName=cl : null});
    return markerName
}