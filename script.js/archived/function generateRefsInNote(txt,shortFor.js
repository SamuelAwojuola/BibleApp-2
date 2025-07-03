/* NEW generateRefsInNote() function */
function generateRefsInNote(txt,shortForm='false'){
    let bdb=bible.Data.books;
    let preferredBKabrv;
    let orderOfarray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,61,62,63,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,64,65];//because of Joh (42) and I Joh (61,62,63) conflict
    for(let k=0;k<orderOfarray.length;k++){//loop through all the arrays of book names and their abbreviations
        let i = orderOfarray[k];
        const bkMatchFound=bdb[i].some((bkNabrv) => {
            let rgx = new RegExp(`${bkNabrv}`, 'i');
            return txt.match(rgx)
        });
        if(bkMatchFound){//check if any of the names in the array matches
            preferredBKabrv=bdb[i][1];//NOT USED: if there is a match, pick the second name which is the preferred abbreviation
            for(let j=0;j<bdb[i].length;j++){
                let bkName2find=bdb[i][j];
                txt = findAndIndicateScriptureRefs(txt,bkName2find);
            }
        }
    }
    // Indicate strongs numbers
    txt = txt.replace(/(?<!<[^>]*)(?!<span[^>]*?strnum[^>]*?>|<text[^>]*?>)((H|G)[0-9]+)(?![^<]*<\/text>)(?![^<]*>)/gi, function(match) {
        const strn = match.toUpperCase();
        return `<span class="strnum ${strn} vnotestrnum" strnum="${strn}">${strn}</span>`;
    });
    

    /* WRAP SCRIPTURE REFERENCES FOR RIGHT-CLICKING */
    function findAndIndicateScriptureRefs(txt,bkName2find){
        // Wrap scripture references in spans
        txt = txt.replace(/((\d+)\s*)(,|-|:)(\s*(\d+))\b/g, '$2$3$5')//remove undesired spaces
        txt = txt.replace(/(([0-9]+)\s*)([;])/g, '$2$3')//remove undesired spaces
        // prevent it from converting references in img tags--(?<!notes_img\/)
        // let newBkReg = new RegExp(`(?<!ref="${bkName2find}\\.\\d+\\.\\d+([-,]\\d+)*">)(?![^<]*<text[^>]*>)\\b((?<!notes_img\/)(?<!<span [^>]*)(?<!span ref=")${bkName2find})(?:(?:[\\s:;.,-]*(?:(?::*\\s*\\d+(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)+)|(?:(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)|(?:(?<=[:\\d*])\\d+)|(?<=${bkName2find}\\s*)\\d+|\\d+(?!\\s*\\p{L}))))+)(?!">)(?![^<]*<\/text>)`, 'uig');
        let newBkReg = new RegExp(`(?<!ref="${bkName2find}\\.\\d+\\.\\d+([-,]\\d+)*">)(?![^<]*<text[^>]*>)\\b((?<!notes_img\/)(?<!<span [^>]*)(?<!span ref=")${bkName2find})(?:(?:[\\s:;.,-]*(?:(?::*\\s*\\d+(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)+)|(?:(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)|(?:(?<=[:\\d*])\\d+)|(?<=${bkName2find}\\s*)\\d+|\\d+(?!\\s*\\p{L}))))+)(?!">)(?![^<]*<\/text>)(\\s*-\\s*(?<!ref="${bkName2find}\\.\\d+\\.\\d+([-,]\\d+)*">)(?![^<]*<text[^>]*>)\\b((?<!notes_img\/)(?<!<span [^>]*)(?<!span ref=")${bkName2find})(?:(?:[\\s:;.,-]*(?:(?::*\\s*\\d+(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)+)|(?:(?:\\d+:*\\s*-\\s*\\d+(?:\\s*,)*)|(?:(?<=[:\\d*])\\d+)|(?<=${bkName2find}\\s*)\\d+|\\d+(?!\\s*\\p{L}))))+)(?!">)(?![^<]*<\/text>))*`, 'uig');// So as to match ranges accross chapters, e.g., "Gen 6:20 - Gen 7:3"
        // txt.match(newBkReg)?console.log(bkName2find + '::'+ txt.match(newBkReg)):null;
        txt = txt.replace(newBkReg, function (mtch) {
            mtch = mtch.replace(/(\p{L})(\d)/ug,'$1 $2').replace(/\s*([.:\-,])\s*/g,'$1').replace(/\s*(;)\s*(\w)/g,'$1 $2');//2Cor3.1==>2Cor 3.1
            let xSplit = /;|:|/.test(mtch)?mtch.split(/;|(?<=[a-zA-Z]+\s*\d+(?:\s*,\s*\d+)*),|,(?=\d+\s*:\s*\d+)/):mtch.split(',');//split match by semi-colons
            newBkReg2 = new RegExp(`(?<!span ref=")${bkName2find}`,'i');
            // console.log(xSplit);
            let rtxt = '';
            
            //refs with book names
            let refWithName = xSplit.shift();
            let bkn = refWithName.match(/[iI0-9]*\s*([a-zA-Z]+\s*)/)[0].trim();
            let chptNvrs = refWithName.replace(/[iI0-9]*\s*[a-zA-Z]+\s*/,'').trim();
            
            refWithName = shortenedBookName(refWithName);
            // /:/ vs. /:|(?:(?:\s|\.)\d+\.\d+)/
            rtxt += /:|(?:(?:\s|\.)\d+\.\d+)/.test(refWithName) ? `<span ref="${refWithName.replace(/\s+(?!$)|:/g,'.')}">${refWithName}</span>`: `<span ref="${turnChptOnlyTOFullRef(bkn,chptNvrs).replace(/\s+(?!$)|:/g,'.')}">${refWithName}</span>`;
            // console.log({'_2':rtxt});
            
            if(xSplit.length>0) {
                xSplit.forEach(r => {
                // console.log({'_3':r});
                if (/:/.test(r)) {//if it has colon, then it is has chapter and verse(s) numbers
                    // console.log({'_4':r});
                    rtxt += `; <span ${/[a-zA-Z]/.test(r) ? '' : 'bkn="'+ bkn +'" '}ref="${bkn}.${r.trim().replace(/:/,'.')}">${r}</span>`;
                }
                
                else {//if it has colon, then it is has chapter and verse(s) numbers
                    //they are chapter numbers (that don't have verse numbers)
                    // console.log(r);
                    let chptsOnlyArray = r.split(/(?<!:(?:\d+|[\s,]*)+),/g).filter(item => item !== undefined);
                    // console.log({'_5':chptsOnlyArray});
                    chptsOnlyArray.forEach((chpt,i) => {
                        // console.log({'_6':chpt});
                        chpt!=undefined?_r():null;
                        function _r() {
                            let chpt_trm = chpt.trim();
                            let wholeChpt = turnChptOnlyTOFullRef(bkn, chpt_trm);
                            // rtxt +=  `${i==0?';':','}${/\s+/.test(chpt)?' ':''}<span bkn="${bkn}" ref="${wholeChpt}">${chpt}</span>`;
                            rtxt +=  `${i==0?';':','} <span bkn="${bkn}" ref="${wholeChpt}">${chpt}</span>`;
                        };
                    });
                }
                });
            }
            //refs without book name
            return rtxt
        })
        proofEditText ? txt = modifyQuotationMarks(txt) : null;
        return txt

        function turnChptOnlyTOFullRef(bkn, chpt_trm) {
            const xr = breakDownRef(`${bkn} ${chpt_trm}`);
            let wholeChpt = `${bkn}.${chpt_trm}.${xr.cv}-${xr.cv2}`;
            return wholeChpt;
        }

        function shortenedBookName(refWithName) {
            if (shortForm) {
                refWithName = refWithName.replace(/(\p{L}+)\s*(\d+)\s*(:)\s*(\d+)/gui, '$1 $2$3$4')//Replace name ensure space between name and chapter number
                refWithName = refWithName.replace(newBkReg2, preferredBKabrv).toLowerCase().replace(/\b\d*\s*(\p{L})/ug, function (match) {
                    return match.toUpperCase();
                });
            }
            return refWithName.replace(/\bSOS\b/gi,'SoS').replace(/\bJb\b/gi,'Job');
        }
    }
    return txt
}


/* OLD generateRefsInNote() function */
function generateRefsInNote(txt,shortForm='false'){
    let bdb=bible.Data.books;
    let preferredBKabrv;
    let orderOfarray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,61,62,63,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,64,65];//because of Joh (42) and I Joh (61,62,63) conflict
    for(let k=0;k<orderOfarray.length;k++){//loop through all the arrays of book names and their abbreviations
        let i = orderOfarray[k];
        const bkMatchFound=bdb[i].some((bkNabrv) => {
            let rgx = new RegExp(`${bkNabrv}`, 'i');
            return txt.match(rgx)
        });
        if(bkMatchFound){//check if any of the names in the array matches
            preferredBKabrv=bdb[i][1];//NOT USED: if there is a match, pick the second name which is the preferred abbreviation
            for(let j=0;j<bdb[i].length;j++){
                let bkName2find=bdb[i][j];
                txt = findAndIndicateScriptureRefs(txt,bkName2find);
            }
        }
    }
    // Indicate strongs numbers
    txt = txt.replace(/(?<!<[^>]*)(?!<span[^>]*?strnum[^>]*?>|<text[^>]*?>)((H|G)[0-9]+)(?![^<]*<\/text>)(?![^<]*>)/gi, function(match) {
        const strn = match.toUpperCase();
        return `<span class="strnum ${strn} vnotestrnum" strnum="${strn}">${strn}</span>`;
    });
    

    /* WRAP SCRIPTURE REFERENCES FOR RIGHT-CLICKING */
    function findAndIndicateScriptureRefs(txt,bkName2find){
        // Wrap scripture references in spans
        txt = txt.replace(/((\d+)\s*)(,|-|:)(\s*(\d+))\b/g, '$2$3$5')//remove undesired spaces
        txt = txt.replace(/(([0-9]+)\s*)([;])/g, '$2$3')//remove undesired spaces
        // prevent it from converting references in img tags--(?<!notes_img\/)
        // let newBkReg = new RegExp(`\\b((?<![notes_img|(span ref=")]\/)${bkName2find})((\\s*\\d+[:.]\\d+([-]\\d+)*([,]*\\d+([-]\\d+)*)*;*)+)`, 'ig');
        let newBkReg = new RegExp(`(?<!ref="${bkName2find}\\.\\d+\\.\\d+([-,]\\d+)*">)(?![^<]*<text[^>]*>)\\b((?<!notes_img\/)${bkName2find})((\\s*\\d+[:.]\\d+([-]\\d+)*([,]*\\d+([-]\\d+)*)*;*)+)(?![^<]*<\/text>)`, 'ig');
        // Make sure bkName2find is not preceded by ref="${bkName2find}\\.\\d+\\.\\d+">
        txt = txt.replace(newBkReg, function (x) {
            let xSplit = x.split(';');
            newBkReg2 = new RegExp(`(?<!span ref=")${bkName2find}`,'i');
            if(xSplit.length>1){
                let refWithName = xSplit.shift();
                refWithName = shortenedBookName(refWithName);
                let bkn = refWithName.match(/[iI0-9]*\s*([a-zA-Z]+\s*)/)[0].trim();
                let rtxt = `<span ref="${refWithName.split(' ').join('.').split(':').join('.')}">${refWithName}</span>` + xSplit.map(y => `; <span bkn="${bkn}" ref="${bkn}.${y.trim().split(':').join('.')}">${y}</span>`).join('')
                return rtxt
            }
            else{
                let refWithName = xSplit.shift();
                refWithName = shortenedBookName(refWithName);
                let rtxt = `<span ref="${refWithName.split(' ').join('.').split(':').join('.')}">${refWithName}</span>`
                return rtxt
            }
        })
        txt = modifyQuotationMarks(txt);
        return txt

        function shortenedBookName(refWithName) {
            if (shortForm) {
                refWithName = refWithName.replace(/(\p{L}+)\s*(\d+)\s*(:)\s*(\d+)/gui, '$1 $2$3$4')//Replace name ensure space between name and chapter number
                refWithName = refWithName.replace(newBkReg2, preferredBKabrv).toLowerCase().replace(/\b\d*\s*(\w)/g, function (match) {
                    return match.toUpperCase();
                });
            }
            return refWithName.replace(/\bSOS\b/gi,'SoS').replace(/\bJb\b/gi,'Job');;
        }
    }
    return txt
}