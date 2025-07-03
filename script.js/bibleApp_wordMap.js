// generateWordMap("Genesis", 1, 1);
function wordMapFromVerseCompareInput(x) {
    fill_Compareverse(x, true)
}
function generateWordMap(bookName, startChapter=1, startVerse=1, endChapter, endVerse) {

    //SHORT bookName NAME
    let bknm_reg = new RegExp('^' + bookName, 'i'); // make case insensitive (instead of using bknm.toUpperCase())
    let shrtBknm = bible.Data.books.find(x=>{return x.includes(bookName.toUpperCase())}) ? bible.Data.books.find(x=>{return x.includes(bookName.toUpperCase())})[1] : (bible.Data.books.find(x=>{return x.find(y=>{return y.match(bknm_reg)})}) ? bible.Data.books.find(x=>{return x.find(y=>{return y.match(bknm_reg)})})[1] : null);
    shrtBknm ? shrtBknm = capitalizeFirstAlphabetCharacter(shrtBknm.toLowerCase()) : null;

    const translationString = `${bversionName} Translation`;
    const wordMap = {"Translation":{},"Strongs":{}};
    const bibleVersion = window[bversionName];
    const versionHasStrongsNums = bible.Data.supportedVersions[bversionName].withStrongsNums;

    // Determine which chapters and verses to iterate over based on provided range
    const chapters = bible.Data.verses[bible.parseReference(bookName).bookID - 1];
    const numberOfChaptersInBook = chapters.length;
    
    if(!endChapter){
        endChapter=numberOfChaptersInBook;
        endVerse = bible.Data.verses[bible.parseReference(bookName).bookID - 1][endChapter-1];
    }

    chapterIteration(bookName);
    function chapterIteration(bookName) {
        // Iterate over chapters
        chapters.forEach((numberOfVersesInChapter, chapterNum) => {
            chapterNum = chapterNum+1;
            if(chapterNum==startChapter||chapterNum<endChapter+1){
                const chapterText = bibleVersion[bookName][chapterNum - 1];
                versesIteration(chapterText,bookName,chapterNum);
            }
        })
    }
    function versesIteration(chapterText,bookName,chapterNum){
        // Iterate over verses
        chapterText.forEach((verse, verseIndex) => {
            // Check if within specified verse range
            if ((chapterNum==startChapter && verseIndex+1 >= startVerse) ||(chapterNum>startChapter && chapterNum<endChapter)|| ((chapterNum==endChapter && verseIndex+1 <= endVerse))) {
                // Iterate over words
                if(versionHasStrongsNums){
                    complexWordMap(verse,shrtBknm,chapterNum,verseIndex);
                }
                else {
                    simpleWordMap(verse,shrtBknm,chapterNum,verseIndex);
                }
            }
        });
    }
    function simpleWordMap(verse,shrtBknm,chapterNum,verseIndex) {
        const wordsArray = verse.toString().replace(/\{\d+\}|[;\:\?,\.\]\["]/g, ' ').split(/\s+/);
        wordsArray.forEach(w=> {
            w=w.replace(/[^a-zA-Z0-9]+/g,'');
            w=w.trim();
            const ref = `${shrtBknm} ${chapterNum}:${verseIndex + 1}`;
            if(!w.match(/[GHhg]\d+/) && w!="") {
                if (!wordMap["Translation"][w]) {wordMap["Translation"][w] = [];}// Check if word already exists in wordMap
                wordMap["Translation"][w].push(`${ref}`);// Add verse to wordMap
            }
        });
    }
    function complexWordMap(verse,shrtBknm,chapterNum,verseIndex) {
        // Iterate over words
        verse.forEach(wordsArray => { //["water","G5204 G3588"],["gathered together","G4863"],
            wordsArray.forEach((arrayOfWordsAndStrongs,i) => {
                if (i<2) {
                    arrayOfWordsAndStrongs.toString().replace(/\{\d+\}|[;\:\?,\.\]\["]/g, ' ').split(/\s+/).forEach(w => {
                        w=w.replace(/[^a-zA-Z0-9]+/g,'');
                        w=w.trim();
                        const ref = `${shrtBknm} ${chapterNum}:${verseIndex + 1}`;
                        if(w.match(/\b[GHhg]\d+/)){
                            if (!wordMap["Strongs"][w]) {wordMap["Strongs"][w] = [];}// Check if strong's word already exists in wordMap
                            //index-0 of "words" will be the Translation of the Strongs
                            if (!wordMap["Strongs"][w]['"'+wordsArray[0]+'"']) {wordMap["Strongs"][w]['"'+wordsArray[0]+'"'] = [];}// Check if strong's word already has Translation in wordMap //'"'+wordsArray[0]+'"' wrapped in quotes because of conflicts with key words, e.g., "every"
                            wordMap["Strongs"][w]['"'+wordsArray[0]+'"'].push(`${ref}`);
                        }
                        else if(!w.match(/[GHhg]\d+/) && w!="") {
                            w=w.replace(/[^a-zA-Z0-9]/g,'');
                            if (!wordMap["Translation"][w]) {wordMap["Translation"][w] = [];}// Check if word already exists in wordMap
                            if (!wordMap["Translation"][w]['"'+wordsArray[1]+'"']) {wordMap["Translation"][w]['"'+wordsArray[1]+'"'] = [];}// Check if strong's word already has Translation in wordMap //'"'+wordsArray[0]+'"' wrapped in quotes because of conflicts with key words, e.g., "every"
                            wordMap["Translation"][w]['"'+wordsArray[1]+'"'].push(`${ref}`);// Add verse to wordMap
                        }
                    });
                }
            });
        });
    }
    const refWordMappedFor = `${bookName} ${startChapter}:${startVerse} -- ${bookName} ${endChapter}:${endVerse}`;
    // Convert wordMap to HTML
    return objectToHtmlList(wordMap,0,refWordMappedFor)
}
function objectToHtmlList(obj,depth=0,refWordMappedFor) {
    depth++;
    let i=-1;
    let html = '';
    const versionHasStrongsNums = bible.Data.supportedVersions[bversionName].withStrongsNums;

    // Iterate over each key-value pair in the object
    for (let key in obj) {
        i++;
        refWordMappedFor = i==0?`<code class="donothide"><em>${refWordMappedFor}</em></code>`:''
        // If the value is an object, recursively call the function
        if (typeof obj[key] === 'object') {
            if(depth==1){
                html += `${refWordMappedFor}<h2 class="wordmap chptheading notfromsearch" tabindex="0">${key=='Translation'?`${bversionName} Translation`:key}<code>--${Object.values(obj[key]).length} Words</code></h2>`;
                html += `<span class="wordmap verse">${objectToHtmlList(sortObj(obj[key]),depth)}</span>`;
            }
            else if(depth==2){
                html += `<h2 class="wordmap chptheading notfromsearch" tabindex="0">${wrapStrongsNum(key)}<code>--${Object.values(obj[key]).length} Words</code></h2>`;
                if(versionHasStrongsNums){
                    html += `<span class="verse wordmap"><ul>${objectToHtmlList(sortObj(obj[key]),depth)}</ul></span>`;
                }
                else {
                    const refArr = JSON.stringify(obj[key]).replace(/"/g,'').split(',');
                    let result = convertDuplicatesToCounts(refArr);
                    html += `<span class="verse wordmap">${objectToHtmlList(result,depth)}</span>`;
                }
            }
            else if(depth==3){                
                html += `<li class="wordmap"><b>“${wrapStrongsNum(key.replace(/"/g, '')).replace(/class="/g, 'class="wordmap ')}”</b>: `;//the key is either strong's num or word
                let result = convertDuplicatesToCounts(obj[key]).toString().replace(/,*; ,*/g,'; ').replace(/,,/g,',');
                // result = generateRefsInNote(result);//generated in 'combineRefs(arr)'
                html += `${objectToHtmlList(result,depth)}</li>`;
            }
        }
        else {
            // If the value is not an object, add it as a list item
            html += obj[key]/* .toString().split(',').join('; ') */;
        }
    }

    // Close the unordered list tag
    return html;
    function wrapStrongsNum(x){
        return `${x.replace(/(?<!<[^>]*)(?!<span[^>]*?strnum[^>]*?>|<text[^>]*?>)((H|G)[0-9]+)(?![^<]*<\/text>)(?![^<]*>)/gi, function(match) {const sn = match.toUpperCase();return `<span class="strnum ${sn} vnotestrnum" strnum="${sn}">${sn} <code>(${getsStrongsLemmanNxLit(sn).lemma}|${getsStrongsLemmanNxLit(sn).xlit})</code></span>`;})}`;
    }
    function convertDuplicatesToCounts(arr) {
        const result = [];
        const uniqueItems = [...new Set(arr)];
        uniqueItems.forEach((item,i) => {
            const count = arr.filter(x => x === item).length;
            const separator = '';
            result.push(`${item}${count>1?'<i class="wordmap_count">-('+count+'x)</i>':''}${separator}`)
        });
        const contractedRefs = combineRefs(result);
        return contractedRefs;
    }
    function combineRefs(arr){
        // E.g., change, ['1Pe 2:3', '1Pe 2:16'] to ['1Pe 2:3,16']
        let contractedRefs = [],prvbknChpt,generatedRef='';
        let al = arr.length > 1;//ensure it is more than one reference in the array
        arr.forEach((x,i) => {
            let d = (i>0) ? '; ' : '';//divider
            x=x.replace(/;\s*/g, '');// remove '; ' from ref
            const w = x.match(/(\w+\s+\d+:\d+)/)[1];
            let regReturn = x.match(/(\w+\s+\d+:)(\d+)$/);//does not have a counter after it, e.g., <i>--(2x)</i>
            if(regReturn && al){
                let bknChpt = regReturn[1];
                let vrs = regReturn[2];
                if(i==0){generatedRef = spanRef(w,x);}//first ref in array
                else if(prvbknChpt==bknChpt){
                    // d=',';//no need, array toString() will add ','
                    d='';
                    generatedRef = `${spanRef(w,vrs)}`;
                }//display only verse if it is the same book and chapter in a row
                else {
                    d='; ';
                    generatedRef = spanRef(w,x);
                }
                contractedRefs.push(`${d}${generatedRef}`);
                prvbknChpt = bknChpt;
            }
            else{
                //if there is just one array item or it is not a match (which will only happen if it has a counter, e.g.,-(2x))
                // generatedRef!=''?contractedRefs.push(`${d}${generatedRef}`):null;
                contractedRefs.push(`${d}${spanRef(w,x)}`);
                generatedRef = '';
                prvbknChpt = null;
            }
        });
        function spanRef(r,v) {return `<span ref="${r}">${v}</span>`}
        return contractedRefs
    }
}