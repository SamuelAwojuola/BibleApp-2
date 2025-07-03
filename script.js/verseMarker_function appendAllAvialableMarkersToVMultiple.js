// 04.04.2024 OLD async function appendAllAvialableMarkersToVMultiple...
// Slowing down page loads
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
            if(previouslyMarkedBook != bcv.bkName){
                bookMarkers = await markersForCurrentChapter(verse_refcode)
                previouslyMarkedBook = bcv.bkName;
                vmAppender(bookMarkers,tempDIV)
            }
            else if (await bookMarkers){
                previouslyMarkedBook = bcv.bkName;
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

// GEMINI AI IMPROVEMENTS
async function appendAllAvialableMarkersToVMultiple(parent_vMultiple, forChapter = 0) {
  const verse_refcode = parent_vMultiple.id.replace(/\./g, '_');
  const bcv = vNumCode(verse_refcode);

  // Check for existing markers and toggle visibility
  const v_markersHolder = parent_vMultiple.querySelector('.v_markers');
  if (v_markersHolder) {
    slideUpDown(v_markersHolder);
    if (forChapter === 0 && v_markerinputnbtn_holder = parent_vMultiple.querySelector('.v_markerinputnbtn_holder')) {
      if (!v_markerinputnbtn_holder.matches('.slidleft')) {
        toggleSlideLeft(v_markerinputnbtn_holder);
      }
    }
    return;
  }

  // Create elements and build content string
  const tempDIV = createNewElement('DIV', '.v_markers', `[versecode=${verse_refcode}]`);
  let contentString = `<button class="add_vMarker" onclick="add_vMarker_creator(this)">+</button>`;

  // Get markers if needed
  let bookMarkers;
  if (forChapter) {
    if (previouslyMarkedBook !== bcv.bkName) {
      bookMarkers = await markersForCurrentChapter(verse_refcode);
      previouslyMarkedBook = bcv.bkName;
    }
  } else {
    bookMarkers = await getMarkersForCurrentVerseFromFile(verse_refcode);
  }

  // Process markers if available
  if (bookMarkers) {
    const arrOfVerseMarkers = [];
    const arrOfvm_withNotes = [];
    for (const key in bookMarkers) {
      const chapterMarkers = bookMarkers[key][bcv.currentChpt];
      if (chapterMarkers) {
        chapterMarkers.forEach((arrOfversesInarr) => {
          if (arrOfversesInarr[0] === bcv.currentV) {
            arrOfVerseMarkers.push(key);
            if (arrOfversesInarr[1]) {
              arrOfvm_withNotes.push(key);
            }
          }
        });
      }
    }

    const tempMarkersFrag = document.createDocumentFragment();
    arrOfVerseMarkers.forEach((mrk, i) => {
      const cleanMarker = mrk.replace(/\s+/g, '_');
      const newMarkerNameClass = `marker_${cleanMarker}`;
      const newMarkerElm = createNewElement('SPAN', '.vmarker', `.${newMarkerNameClass}`);
      newMarkerElm.innerText = mrk;
      if (arrOfvm_withNotes.includes(mrk)) {
        newMarkerElm.classList.add('hasnote');
      }
      if (i > 0) {
        tempMarkersFrag.append(document.createTextNode(';\u00A0'));
      }
      tempMarkersFrag.append(newMarkerElm);
      parent_vMultiple.classList.add(newMarkerNameClass);
    });

    contentString += tempMarkersFrag.outerHTML;
  }

  tempDIV.innerHTML = contentString;
  // Clone frequently used elements and append them efficiently
    const clonedNodes = new DocumentFragment();
    const addMarkerButton = parent_vMultiple.querySelector('.add_vMarker').cloneNode(true);
    const markerInputHolder = v_markerinputnbtn_holder?.cloneNode(true);
    clonedNodes.append(addMarkerButton);
    if (markerInputHolder) {
      clonedNodes.append(markerInputHolder);
    }
  
    tempDIV.append(clonedNodes);
    parent_vMultiple.append(tempDIV);
  
    // Animate after appending for smoother performance
    setTimeout(() => {slideUpDown(tempDIV);}, 1);
}

// CHAT-GPT3 AI IMPROVEMENTS
async function appendAllAvailableMarkersToVMultiple(parent_vMultiple, forChapter = 0) {
    let verse_refcode = parent_vMultiple.id.replace(/\./g, '_');
    let bcv = vNumCode(verse_refcode);

    let v_markersHolder = parent_vMultiple.querySelector('.v_markers');
    if (v_markersHolder) {
        if (forChapter === 0) {
            slideUpDown(v_markersHolder);
            let v_markerinputnbtn_holder = parent_vMultiple.querySelector('.v_markerinputnbtn_holder');
            if (v_markerinputnbtn_holder && !v_markerinputnbtn_holder.matches('.slidleft')) {
                toggleSlideLeft(v_markerinputnbtn_holder);
            }
        }
    } else {
        v_markersHolder = document.createDocumentFragment();
        let tempDIV = createNewElement('DIV', '.v_markers', `[versecode=${verse_refcode}]`);
        tempDIV.innerHTML = `<button class="add_vMarker" onclick="add_vMarker_creator(this)">+</button>`;

        if (forChapter) {
            let bookMarkers;
            if (previouslyMarkedBook !== bcv.bkName) {
                bookMarkers = await markersForCurrentChapter(verse_refcode);
                previouslyMarkedBook = bcv.bkName;
            } else {
                bookMarkers = await bookMarkersPromise;
            }
            vmAppender(bookMarkers, tempDIV);
        } else {
            getMarkersForCurrentVerseFromFile(verse_refcode, tempDIV, parent_vMultiple);
        }

        v_markersHolder.append(tempDIV);
        parent_vMultiple.append(v_markersHolder);
        tempDIV.querySelector('.add_vMarker').focus();
    }

    function vmAppender(bookMarkers, tempDIV) {
        let arrOfVerseMarkers = [];
        let arrOfvm_withNotes = [];
        for (let key in bookMarkers) {
            if (bookMarkers.hasOwnProperty(key)) {
                let arrOfVerses = bookMarkers[key][bcv.currentChpt];
                if (arrOfVerses) {
                    arrOfVerses.forEach(arrOfversesInarr => {
                        if (arrOfversesInarr[0] === bcv.currentV) {
                            arrOfVerseMarkers.push(key);
                            if (arrOfversesInarr[1]) {
                                arrOfvm_withNotes.push(key);
                            }
                        }
                    });
                }
            }
        }

        let tempMarkersFrag = document.createDocumentFragment();
        arrOfVerseMarkers.forEach((mrk, i) => {
            let cleanMarker = mrk.replace(/\s+/, '_');
            let newMarkerNameClass = `marker_${cleanMarker}`;
            let dot_newMarkerNameClass = `.${newMarkerNameClass}`;
            let newMarkerElm = createNewElement('SPAN', '.vmarker', dot_newMarkerNameClass);
            if (arrOfvm_withNotes.length > 0 && arrOfvm_withNotes.includes(mrk)) {
                newMarkerElm.classList.add("hasnote");
            }
            newMarkerElm.innerText = mrk;
            if (i > 0) {
                let textNode = document.createTextNode(';\u00A0');
                tempMarkersFrag.append(textNode);
            }
            tempMarkersFrag.append(newMarkerElm);
            parent_vMultiple.classList.add(newMarkerNameClass);
        });

        let clonedNodes = tempDIV.cloneNode(true);
        tempDIV.innerHTML = null;
        tempDIV.style.display = 'none';
        tempDIV.append(clonedNodes);
        tempDIV.prepend(tempMarkersFrag);
        setTimeout(() => { slideUpDown(tempDIV); }, 1);
    }
}

// CHAT-GPT3 AI FURTHER IMPROVEMENTS COMBINING WITH GEMINI CODE
async function appendAllAvailableMarkersToVMultiple(parent_vMultiple, forChapter = 0) {
    const verse_refcode = parent_vMultiple.id.replace(/\./g, '_');
    const bcv = vNumCode(verse_refcode);

    // Check for existing markers and toggle visibility
    const v_markersHolder = parent_vMultiple.querySelector('.v_markers');
    if (v_markersHolder) {
        slideUpDown(v_markersHolder);
        const v_markerinputnbtn_holder = parent_vMultiple.querySelector('.v_markerinputnbtn_holder');
        if (forChapter === 0 && v_markerinputnbtn_holder) {
            if (!v_markerinputnbtn_holder.matches('.slidleft')) {
                toggleSlideLeft(v_markerinputnbtn_holder);
            }
        }
        return;
    }

    // Create elements and build content string
    const tempDIV = createNewElement('DIV', '.v_markers', `[versecode=${verse_refcode}]`);
    let contentString = `<button class="add_vMarker" onclick="add_vMarker_creator(this)">+</button>`;

    // Get markers if needed
    let bookMarkers;
    if (forChapter) {
        if (previouslyMarkedBook !== bcv.bkName) {
            bookMarkers = await markersForCurrentChapter(verse_refcode);
            previouslyMarkedBook = bcv.bkName;
        } else {
            bookMarkers = await bookMarkersPromise;
        }
    } else {
        bookMarkers = await getMarkersForCurrentVerseFromFile(verse_refcode);
    }

    // Process markers if available
    if (bookMarkers) {
        const arrOfVerseMarkers = [];
        const arrOfvm_withNotes = [];
        for (const key in bookMarkers) {
            if (bookMarkers.hasOwnProperty(key)) {
                const chapterMarkers = bookMarkers[key][bcv.currentChpt];
                if (chapterMarkers) {
                    chapterMarkers.forEach((arrOfversesInarr) => {
                        if (arrOfversesInarr[0] === bcv.currentV) {
                            arrOfVerseMarkers.push(key);
                            if (arrOfversesInarr[1]) {
                                arrOfvm_withNotes.push(key);
                            }
                        }
                    });
                }
            }
        }

        const tempMarkersFrag = document.createDocumentFragment();
        arrOfVerseMarkers.forEach((mrk, i) => {
            const cleanMarker = mrk.replace(/\s+/g, '_');
            const newMarkerNameClass = `marker_${cleanMarker}`;
            const newMarkerElm = createNewElement('SPAN', '.vmarker', `.${newMarkerNameClass}`);
            newMarkerElm.innerText = mrk;
            if (arrOfvm_withNotes.includes(mrk)) {
                newMarkerElm.classList.add('hasnote');
            }
            if (i > 0) {
                tempMarkersFrag.append(document.createTextNode(';\u00A0'));
            }
            tempMarkersFrag.append(newMarkerElm);
            parent_vMultiple.classList.add(newMarkerNameClass);
        });

        contentString += tempMarkersFrag.innerHTML;
    }

    tempDIV.innerHTML = contentString;

    // Clone frequently used elements and append them efficiently
    const clonedNodes = new DocumentFragment();
    const addMarkerButton = tempDIV.querySelector('.add_vMarker').cloneNode(true);
    clonedNodes.append(addMarkerButton);
    const v_markerinputnbtn_holder = parent_vMultiple.querySelector('.v_markerinputnbtn_holder');
    if (v_markerinputnbtn_holder) {
        const markerInputHolder = v_markerinputnbtn_holder.cloneNode(true);
        clonedNodes.append(markerInputHolder);
    }

    tempDIV.innerHTML = null;
    tempDIV.style.display = 'none';
    tempDIV.append(clonedNodes);
    parent_vMultiple.append(tempDIV);

    // Animate after appending for smoother performance
    setTimeout(() => {
        slideUpDown(tempDIV);
    }, 1);
}

// MY OWN

async function appendAllAvialableMarkersToVMultiple(parent_vMultiple, forChapter=0){
    let verse_refcode = parent_vMultiple.id.replace(/\./g,'_');
    let bcv = vNumCode(verse_refcode);
    
    // If v_markers already attached to verse, just toggle it
    if(v_markersHolder=parent_vMultiple.querySelector('.v_markers')){
        if(forChapter==0){
            slideUpDown(v_markersHolder);
            if((v_markerinputnbtn_holder=parent_vMultiple.querySelector('.v_markerinputnbtn_holder'))&&(!v_markerinputnbtn_holder.matches('.slidleft'))){
                toggleSlideLeft(v_markerinputnbtn_holder)
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
            let bm_=false;
            if(previouslyMarkedBook != bcv.bkName){
                bookMarkers = await markersForCurrentChapter(verse_refcode);
                bm_=true;
            }
            else if (await bookMarkers){bm_=true;}
            if(bm_){
                previouslyMarkedBook = bcv.bkName;
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
        tempDIV.textContent='';
        tempDIV.style.display = 'none';
        tempDIV.append(clonedNodes);
        tempDIV.prepend(tempMarkersFrag);
        setTimeout(() => {slideUpDown(tempDIV)}, 1);
    }
}