if (!document.body.matches("#versenotepage")) {
    // strongsdefinitionwindow.addEventListener('click', toggleH1to6siblings);
    // strongsdefinitionwindow.addEventListener('contextmenu', toggleH1to6siblings);
    // strongsdefinitionwindow.addEventListener('keydown', toggleH1to6siblings);
}

// FOR STRONGS LEXICON
var requestStrongsURL = 'data/strongs.json';
var strongsJSON = new XMLHttpRequest();
strongsJSON.open('GET', requestStrongsURL);
strongsJSON.responseType = 'json';
strongsJSON.send();

let strongsJSONresponse, strngsAll;
strongsJSON.onload = function (){strongsJSONresponse = strongsJSON.response;}
/* GET STRONG'S DEFININTION - MAIN FUNCTION */
let searchButtonHTML = function () {
    let searchicon = document.body.matches('.darkmode') ? 'search-svgrepo-com(2)-DarkMode.svg' : 'search-svgrepo-com(2).svg';
    let copyicon = document.body.matches('.darkmode') ? 'copy-svgrepo-com-DarkMode.svg' : 'copy-svgrepo-com.svg';
    return `<button class="cmenusrchbtn" onmouseup="searchStrongs(event,this)"><img src="images/${searchicon}" alt="🔎"></button><button class="cmenucopyhbtn" onmouseup="searchStrongs(event,this,true)"><img src="images/${copyicon}" alt="C"></button>`;
}
async function getsStrongsDefinition(x) {
    _text = '';
    let openOrclose='open';
    let strngsearchfor = '';
    // x.forEach((wStrnum,i) => {
    let i = -1;
    for (let wStrnum of x){
        i=i+1;
        strngsearchfor = strngsearchfor + ' ' + wStrnum;
        if(x.length==2 && (x[0]=='G3588' && i==1)){openOrclose='open'}
        else if((x.length>2)||(x.length>1 && (x[0]=='G3588' && i==0)||(i!=0))){openOrclose=''}// only the first detail element will be open except there is more than one strong num and the first one is "the"--G3588
        let xlit_lemma_definition = getsStrongsLemmanNxLit(wStrnum);
        let lsj_match = getLSJGreekStrongs(wStrnum);
        let BDB_definition = await getBDBdefinition(wStrnum);
        // console.log(BDB_definition.mergedBDBdefinitions);
        
        if(xlit_lemma_definition.xlit!=''){
            let str_xlit = xlit_lemma_definition.xlit;
            let str_lemma = xlit_lemma_definition.lemma;
            let str_morph = xlit_lemma_definition.morphology;
            // let str_definition = xlit_lemma_definition.definition;
            let str_definition = xlit_lemma_definition.definition;
            // Some strong's number entries don't have derivations
            if (str_definition) {
                if(str_definition.derivation){
                    var str_derivation = str_definition.derivation.replace(/([GH]\d+)/g, '<span class="strnum $1" strnum="$1">$1</span>');
                    str_derivation = modifyRefInDef(str_derivation);
            }
                else{str_derivation='…'}
                if(str_definition.kjv_def){
                    var str_kjv_def = str_definition.kjv_def.replace(/([GH]\d+)/g, '<span class="strnum $1" strnum="$1">$1</span>');
                    str_kjv_def = modifyRefInDef(str_kjv_def);
                }
                if(str_definition.strongs_def){
                    var str_strongs_def = str_definition.strongs_def.replace(/([GH]\d+)/g, '<span class="strnum $1" strnum="$1">$1</span>');
                    str_strongs_def = modifyRefInDef(str_strongs_def);
                }
            }
            function modifyRefInDef(def) {
                def = def.replace(/(\w+[.\s:])(\d+[.:]\d+(,*\s*\d+(-\d+)*)*)(,*\s*(\d+[.:]\d+(,*\s*\d+(-\d+)*)*))+/g,'<span ref="$1$2">$1$2</span>; <span ref="$5">$5</span>');
                def = def.replace(/(\w+[.\s:])(\d+[.:]\d+(,*\s*\d+(-\d+)*)*)/g,'<span ref="$1$2">$1$2</span>');
                return def
            }
            
            let i_lemma=' | ',i_translit=' | ',i_morph=' | ';
            // i_lemma = '<br><i>Lemma</i>: ',i_translit='<br><i>Translit</i>: ',i_morph='<br><i>Morphology</i>: '
            _text = `${_text}
            <details class="strngsdefinition" ${openOrclose}>
            <summary>
                <div class='openCloseIconHolder'></div>
                <div>
                    <span title="Strong's Number">${wStrnum}</span>
                    ${i_lemma}<span title="Lemma">${str_lemma}</span>
                    ${i_translit}<span title='Transliteration'>${str_xlit}</span>
                    ${str_morph!=''?`${i_morph}<span title="${/G\d/.test(wStrnum)==true?`${parseGreekMorph(str_morph)}`:`${parseHebrewMorph(str_morph)}`}">${str_morph}</span>`:''}
                </div>
            </summary>
                <div>
                ${rootsBranchesANDfamily(wStrnum)}
                ${wordsSharingDerivationWith(wStrnum).lemaXlit}
                ${wordsRelatedBySpelling(wStrnum).lemaXlit}</ol>
                <h5 class="hidingsibs">KJV Definition</h5>
                <p class="hidby_H5">${str_kjv_def}</p>
                <h5 class="hidingsibs">Strong's Definition</h5>
                <p class="hidby_H5">
                    <b><i>Derivation: </i></b>${str_derivation}
                    <span style="border-top:2px solid;display:block;margin-top:0.2em;padding-top:0.5em">${str_strongs_def}</span>
                </p>
                ${modifyRefInDef(BDB_definition.mergedBDBdefinitions)}
                ${lsj_match.lemaXlit}
                </div>
            </details>`;
        }
        //For strong's numbers that don't exist like some in the ABP
        else {_text = `${_text}<span style="display:flex;justify-content:center;font-style:italic;">No Strong’s entry for&nbsp;<b>${wStrnum}</b>.</span>`;}
    };
    // });
    currentStrongsDef = _text;
    if(!document.querySelector('body').matches('#versenotepage')){
        strongsdefinition_text.innerHTML = _text.replace(/(<details class="strngsdefinition")/i,'$1 open');
        strongsnum_input.value = strngsearchfor.trim();
    }
    return _text
}
// Create and Append Transliteration Data Attribute
function createTransliterationAttr(v, l) {
    // l is in some places is bible version name instead of language
    let translatedWordsInVerse = v.querySelectorAll('[strnum]:not(.vnotestrnum)');
    translatedWordsInVerse.forEach(strNumElm => {
        wStrnum_array = strNumElm.getAttribute('strnum').split(' ');
        const wl=wStrnum_array.length;
        wStrnum_array.forEach((wStrnum,i) => {
            let divider='';
            if (i>0) {divider = '|'}
            //For Greek/Hebrew Bibles
            if (['original','gr','arm'].includes(l) || strNumElm.matches('.v_ABP-gr [strnum], .v_accented [strnum], .v_Aramaic [strnum]')) {
                strNumElm.setAttribute("data-true-xlit", keyValueReplacer(strNumElm.innerText));
            }
            // CHECK STRONGS DICTIONARY
            for (let k = 0; k < strongsJSONresponse.length; k++) {
                if (strongsJSONresponse[k].number == wStrnum) {
                    strNumElm.classList.add(wStrnum);
                    let str_xlit = strongsJSONresponse[k].xlit;
                    let str_lemma = strongsJSONresponse[k].lemma;
                    strNumElm.setAttribute("data-xlit", strNumElm.getAttribute("data-xlit") + divider + str_xlit);
                    strNumElm.setAttribute("data-lemma", strNumElm.getAttribute("data-lemma") + divider + str_lemma);
                    strNumElm.setAttribute('data-title', wStrnum + " | " + str_xlit + " | " + str_lemma);
                    break
                }
            }
        });
        let strNum_Title = '';
        if (strNumElm.getAttribute('data-title')) {
            strNum_Title = strNumElm.getAttribute('data-title');
        }
        // strNumElm.setAttribute('data-title', '(' + strNumElm.getAttribute("translation") + ')' + strNum_Title);
        strNumElm.setAttribute('data-title', strNum_Title);
    });
    return v
}
let currentStrongsDef = null;      
function isRelated(word1, word2) {
    function removeCommonPrefixes(word) {
      const prefixPattern = /^(α|ανα|αμφι|δια|εν|επι|κατα|μετα|παρα|περι|υπερ|προ)/;
      return word.replace(prefixPattern, '');
    }
  
    function removeCommonSuffixes(word) {
      const suffixPattern = /(ος|ης|ου|ον|ιζω|ομαι|ει|εις|ειν|ειτε|ειτες|οι|ες|εστε|ουν|ομεν|ετε|ουσα|ων)$/;
      return word.replace(suffixPattern, '');
    }
  
    function removeInflections(word) {
      const inflections = [
        { pattern: /α$/, replacement: '' },
        { pattern: /ες$/, replacement: '' },
        { pattern: /ων$/, replacement: '' },
        { pattern: /ουσα$/, replacement: '' },
        { pattern: /εως$/, replacement: '' },
        { pattern: /εων$/, replacement: '' },
        { pattern: /ευς$/, replacement: '' },
        { pattern: /ευν$/, replacement: '' },
        { pattern: /ος$/, replacement: '' },
        { pattern: /ουν$/, replacement: '' }
      ];
      for (const inflection of inflections) {
        if (inflection.pattern.test(word)) {
          return word.replace(inflection.pattern, inflection.replacement);
        }
      }
      return word;
    }
  
    function areWordsRelated(word1, word2) {
      let modifiedWord1 = removeCommonPrefixes(normalizeWord(word1));
      modifiedWord1 = removeCommonSuffixes(modifiedWord1);
      modifiedWord1 = removeInflections(modifiedWord1);
  
      let modifiedWord2 = removeCommonPrefixes(normalizeWord(word2));
      modifiedWord2 = removeCommonSuffixes(modifiedWord2);
      modifiedWord2 = removeInflections(modifiedWord2);
  
      return (
        modifiedWord1 === modifiedWord2 || calculateJaroWinklerScore(modifiedWord1, modifiedWord2) >= 0.85
      );
    }
  
    /* Jaro-Winkler algorithm */
    function calculateJaroWinklerScore(word1, word2) {
      const matchScoreThreshold = Math.floor(Math.max(word1.length, word2.length) / 2) - 1;
      const jaroScore = calculateJaroScore(word1, word2);
      if (jaroScore < 0.7) {
        return jaroScore;
      }
      const prefixLength = getPrefixLength(word1, word2, matchScoreThreshold);
      const jaroWinklerScore = jaroScore + 0.1 * prefixLength * (1 - jaroScore);
      return jaroWinklerScore;
    }
  
    function calculateJaroScore(word1, word2) {
      const matchingDistance = Math.floor(Math.max(word1.length, word2.length) / 2) - 1;
      const commonChars1 = getCommonCharacters(word1, word2, matchingDistance);
      const commonChars2 = getCommonCharacters(word2, word1, matchingDistance);
      if (commonChars1.length === 0 || commonChars2.length === 0) {
        return 0;
      }
      const transpositions = countTranspositions(commonChars1, commonChars2);
      const jaroScore =
        (commonChars1.length / word1.length +
          commonChars2.length / word2.length +
          (commonChars1.length - transpositions) / commonChars1.length) /
        3;
      return jaroScore;
    }
  
    function getCommonCharacters(word1, word2, matchingDistance) {
      const commonChars = [];
      const visited = Array(word2.length).fill(false);
      for (let i = 0; i < word1.length; i++) {
        const start = Math.max(0, i - matchingDistance);
        const end = Math.min(i + matchingDistance + 1, word2.length);
        for (let j = start; j < end; j++) {
          if (word1[i] === word2[j] && !visited[j]) {
            commonChars.push(word1[i]);
            visited[j] = true;
            break;
          }
        }
      }
      return commonChars;
    }
  
    function countTranspositions(chars1, chars2) {
      let transpositions = 0;
      for (let i = 0; i < chars1.length; i++) {
        if (chars1[i] !== chars2[i]) {
          transpositions++;
        }
      }
      return transpositions / 2;
    }
  
    function getPrefixLength(word1, word2, maxLength) {
      const prefixLength = Math.min(maxLength, getCommonPrefixLength(word1, word2));
      return prefixLength;
    }
  
    function getCommonPrefixLength(word1, word2) {
      let prefixLength = 0;
      const minLength = Math.min(word1.length, word2.length);
      for (let i = 0; i < minLength; i++) {
        if (word1[i] === word2[i]) {
          prefixLength++;
        } else {
          break;
        }
      }
      return prefixLength;
    }
  
    return areWordsRelated(word1, word2);
}
function normalizeWord(word) {
    const accentMap = {
      ά: 'α', Ά: 'Α', ὰ: 'α', ᾶ: 'α', ἀ: 'α', ἄ: 'α', ἂ: 'α', ἆ: 'α', ἁ: 'α', ἅ: 'α', ἃ: 'α', ἇ: 'α', ᾳ: 'α', έ: 'ε', Έ: 'Ε', ὲ: 'ε', ἐ: 'ε', ἔ: 'ε', ἒ: 'ε', ἕ: 'ε', ἓ: 'ε', ή: 'η', Ή: 'Η', ῆ: 'η',
      ἠ: 'η', ἤ: 'η', ἢ: 'η', ἦ: 'η', ἡ: 'η', ἥ: 'η', ἣ: 'η', ἧ: 'η', ῃ: 'η', ί: 'ι', Ι: 'Ι', ῖ: 'ι', ἰ: 'ι', ἴ: 'ι', ἲ: 'ι', ἶ: 'ι', ἱ: 'ι', ἵ: 'ι', ἳ: 'ι', ἷ: 'ι', ῐ: 'ι', ῑ: 'ι', ό: 'ο', Ό: 'Ο',
      ὸ: 'ο', ὀ: 'ο', ὄ: 'ο', ὂ: 'ο', ὅ: 'ο', ὃ: 'ο', ύ: 'υ', Ύ: 'Υ', ῦ: 'υ', ὐ: 'υ', ὔ: 'υ', ὒ: 'υ', ὖ: 'υ', ὑ: 'υ', ὕ: 'υ', ὓ: 'υ', ὗ: 'υ', ϋ: 'υ', ΰ: 'υ', ώ: 'ω', Ώ: 'Ω', ῶ: 'ω', ὠ: 'ω', ὤ: 'ω', ὢ: 'ω',
      ὦ: 'ω', ὡ: 'ω', ὥ: 'ω', ὣ: 'ω', ὧ: 'ω', ῳ: 'ω'
    };

    const normalizedWord = word.replace(/./g, (c) => accentMap[c] || c);
    return normalizedWord.toLowerCase();
}
function wordsSharingDerivationWith(x) {
    const wordsToOmit = /^(α|ανα|αμφι|δια|εν|επι|κατα|μετα|παρα|περι|υπερ|προ|ος|ης|ου|ον|ιζω|ομαι|ει|εις|ειν|ειτε|ειτες|οι|ες|εστε|ουν|ομεν|ετε|ουσα|ων)$/;
    // Get the strongs numbers from which it was derived
    const xDerivation = getsStrongsLemmanNxLit(x).derivation;
    let lemaXlit = '';
    let s = '';
    // Extract the strongs number
    if (!xDerivation) {
      return { lemaXlit };
    }
    const derivationRoots = extractStrongNumbers(xDerivation);
    let strongsSharingDerivation = {};
    let htmlWrappedRelations = {};
    if (derivationRoots.length == 0) {
      return { strongsSharingDerivation, lemaXlit };
    }
    if (normalizeWord(getsStrongsLemmanNxLit(x).lemma).match(wordsToOmit)) {
      return { strongsSharingDerivation, lemaXlit };
    }
    // Store each derivation separately
    derivationRoots[x] = {};
    derivationRoots.forEach((dr) => {
      strongsSharingDerivation[dr] = {};
    });
  
    // Look for all strongs numbers that include the derivation strongs number
    for (let k = 0; k < strongsJSONresponse.length; k++) {
      derivationRoots.forEach((dr) => {
        htmlWrappedRelations[dr] = [];
        const rgx = new RegExp(dr + "\\b");
        const sk = strongsJSONresponse[k];
        if (sk.lemma.length > 1) {
          const skmatch = rgx.test(sk.description.derivation);
          if (skmatch) {
            const num = sk.number;
            const num_xLemaGloss = getLSJGreekStrongs(num,true);
            const xlit = num_xLemaGloss.xlit;// const xlit = sk.xlit;
            const lemma = num_xLemaGloss.lemma;// const lemma = sk.lemma;
            const gloss = num_xLemaGloss.gloss;

            strongsSharingDerivation[dr][num] = { xlit, lemma, gloss };
          }
        }
      });
    }
    derivationRoots.forEach((dr) => {
      const relatedWordsCount = Object.keys(strongsSharingDerivation[dr]).length;
      if (
        !normalizeWord(getsStrongsLemmanNxLit(dr).lemma).match(wordsToOmit) &&
        relatedWordsCount > 0
      ) {
        if (relatedWordsCount > 1) {
          s = 's';
        }
        // Iterate through each key-value pair in the object
        for (const [objKey, objValue] of Object.entries(strongsSharingDerivation[dr])) {
          const currentlyInspectedStrongsArray = objValue;
          // Check if the current key or value's Strong's numbers intersect with the Strong's numbers of the given key
          /* ROOTS */
          // Loop through all the strongs words and find all that have the same root
          const l = currentlyInspectedStrongsArray.lemma;
          const x = currentlyInspectedStrongsArray.xlit;
          const g = currentlyInspectedStrongsArray.gloss;
          if (l != undefined && (objKey !== x || objKey !== x)) {
              const strString = `<li>${searchButtonHTML()}<span class="strnum ${objKey}" strnum="${objKey}">${objKey}</span> (${l}/${x})${g?('—<i>“'+g+'”</i>'):''}</li>`;
              htmlWrappedRelations[dr].push(strString);
          }
        }
  
        // WRAP IN HTML TAGS
        const xlit_lemma_gloss=dr.match(/G\d+/) ? getLSJGreekStrongs(dr,true) : getsStrongsLemmanNxLit(dr);
        const gloss = xlit_lemma_gloss.gloss;
        lemaXlit += `<li>${searchButtonHTML()}(${htmlWrappedRelations[dr].length + 1}) <b>Relation${s} Derived From ${searchButtonHTML()}<span class="strnum ${dr}" strnum="${dr}">${dr}</span> ${getsStrongsLemmanNxLit(dr).lemma}/${getsStrongsLemmanNxLit(dr).xlit}</b>
              <ol class="sld_up" style="display:none!important;"><li>${searchButtonHTML()}<span class="strnum ${dr}" strnum="${dr}">${dr}</span> (${xlit_lemma_gloss.lemma}/${xlit_lemma_gloss.xlit})${gloss?('—<i>“'+gloss+'”</i>'):''}</li>${htmlWrappedRelations[dr].join('')}</ol></li>`;
      }
    });
  
    return { strongsSharingDerivation, lemaXlit };
  
    function extractStrongNumbers(str) {
      const regex = /G\d+/g;
      const matches = str.match(regex);
      if (!matches) {
        return [];
      }
      return matches;
    }
}
// Function to get all strongs word related to a selected strongs word by root
function wordsRelatedBySpelling(x){ //Or just close in spelling
    let keysWithSharedRoots = {};
    let lemaXlit = '';
    if(!x.match(/^G/)){return {keysWithSharedRoots,lemaXlit}}//Works only with Greek words
    const xLema = getsStrongsLemmanNxLit(x).lemma
    
    let htmlWrappedRelations = [];
    let s = '';
    let lx;
    
    // Loop through all stongs words
    for (let k = 8682; k < strongsJSONresponse.length; k++) {
        if (isRelated(xLema, strongsJSONresponse[k].lemma)) {
            const num = strongsJSONresponse[k].number;

            const num_xLemaGloss = getLSJGreekStrongs(num,true);
            const xlit = num_xLemaGloss.xlit;
            const lemma = num_xLemaGloss.lemma;
            const gloss = num_xLemaGloss.gloss;
            keysWithSharedRoots[num]={xlit,lemma,gloss};
        }
    }

    const relatedWordsCount = Object.keys(keysWithSharedRoots).length;
    if (relatedWordsCount>0) {
        if (relatedWordsCount > 1) {s='s'}      
        // Iterate through each key in the object
        for (const objKey in keysWithSharedRoots) {
            if (objKey !== x) {
                const currentlyInspectedStrongsArray = keysWithSharedRoots[objKey];
                // Check if the current key's Strong's numbers intersect with the Strong's numbers of the given key
                /* ROOTS */
                //Loop through all the strongs words and find all that have the same root
                const l = currentlyInspectedStrongsArray.lemma;
                const x = currentlyInspectedStrongsArray.xlit;
                const g = currentlyInspectedStrongsArray.gloss;
                if (l != undefined) {
                    const strString = `<li>${searchButtonHTML()}${objKey.replace(/([GH]\d+)/g, '<span class="strnum $1" strnum="$1">$1</span>')} (${l}/${x})${g?('—<i>“'+g+'”</i>'):''}</li>`;
                    htmlWrappedRelations.push(strString);
                }
            }
        }
        // WRAP IN HTML TAGS
        let count = htmlWrappedRelations.length;
        let olContent = count ? `<ol class="sld_up" style="display:none!important;">${htmlWrappedRelations.join('')}</ol>`: '';
        lemaXlit += `<li>${searchButtonHTML()}(${count}) <b>Relation${s} By Root/Spelling</b>${olContent}</li>`;
    }

    return {keysWithSharedRoots,lemaXlit};
}
function rootsBranchesANDfamily(strNum) {
    let branches = getBranches(strNum);
    let rootAndfamily = getRootandFamily(strNum);
    const famBranches = getBranches(rootAndfamily.family ? rootAndfamily.family : strNum);
    const familyMembers = getKeysByFamily(rootAndfamily.family ? rootAndfamily.family : strNum);
    const familyMembersNbranches = sortStrongsNumsArray(famBranches.concat(familyMembers));

    function get_xlit_n_lemma(sn_arr, elmTagName='li') {
        let htmlString='';
        sn_arr.forEach((sn,i) => {
            let xlit_lemma_definition = sn.match(/G\d+/) ? getLSJGreekStrongs(sn,true) : getsStrongsLemmanNxLit(sn);

            if(xlit_lemma_definition.xlit!=''){
                const xlit = xlit_lemma_definition.xlit;
                const lemma = xlit_lemma_definition.lemma;
                const morph = xlit_lemma_definition.morphology;
                const gloss = xlit_lemma_definition.gloss;

                // htmlString += elmTagName ? `<${elmTagName}>${lemma} (${xlit} ${sn})</${elmTagName}>` : `${lemma} (${xlit} ${sn})`;
                htmlString += elmTagName ? `<${elmTagName}>${sn} (<b>${lemma}</b>, ${xlit})${gloss?('—<i>“'+gloss+'”</i>'):''}</${elmTagName}>` : `${sn} (<b>${lemma}</b>, ${xlit})${gloss?('—<i>“'+gloss+'”</i>'):''}`;
            }
        })
        return htmlString
    }
    function wrapStrongsNumber(strn,family=false,x) {
        const y=strn;
        if(typeof strn === 'string' || strn instanceof String){strn=[strn];}
        if (!Array.isArray(strn)) {return ''}
        let strn_modified = get_xlit_n_lemma(strn).replace(/([GH]\d+)/g, `${searchButtonHTML()}<span class="strnum $1" strnum="$1">$1</span>`);
        if (strn.length>1) {//for roots and branches if more than one          
            strn_modified = ` <ol class="sld_up" style="display:none!important;">${strn_modified}</ol>`;
        }
        else if (strn.length==1) {
            strn_modified = `${strn_modified.replace(/<\/*li>/g,'')}${family?
               `<ol class="sld_up" style="display:none!important;">
                    <u style="margin-left:-1em;display:block;font-family:'Marvel';font-weight:bold">(${familyMembersNbranches.length}) Family Branch${famBranches.length < 2 ? '' : 'es'} & Member${familyMembers.length < 2 ? '' : 's'}:</u>
                    <li>${searchButtonHTML()} <i>(${famBranches.length}) Family Branch${famBranches.length < 2 ? '' : 'es'}</i>:
                        <ol class="sld_up" style="display:none!important;margin-left:-1.1em;">${wrapStrongsNumber(famBranches, false, true).replace(/<ol class="sld_up" style="display:none!important;">(.*)<\/ol>/g,'$1')}</ol>
                    </li>
                    <li>${searchButtonHTML()} <i>(${familyMembers.length}) Family Member${familyMembers.length < 2 ? '' : 's'}</i>:
                        <ol class="sld_up" style="display:none!important;margin-left:-1.1em;">${wrapStrongsNumber(familyMembers, false, true).replace(/<ol class="sld_up" style="display:none!important;">(.*)<\/ol>/g,'$1')}</ol>
                    </li>
                </ol>`
                  : ''
              }`;
        }
        else{strn_modified='<i>None</i>';}
        return strn_modified 
    }
    // WRAP IN HTML TAGS
    return `<h5 class="hidingsibs">Word Relatives</h5><ol class="hidby_H5">
        <li>${searchButtonHTML()} (${familyMembersNbranches.length}) <b>Family</b>: ${wrapStrongsNumber(rootAndfamily.family, true)}</li>
        <li>${searchButtonHTML()}(${rootAndfamily.roots.length}) <b>Root${rootAndfamily.roots.length==1?'':'s'}</b>: ${wrapStrongsNumber(rootAndfamily.roots)}</li>
        <li>${searchButtonHTML()}(${branches.length}) <b>Branch${branches.length==1?'':'es'}</b>: ${wrapStrongsNumber(branches)}</li>
    `;
}
function sortStrongsNumsArray(strnumsArray) {
    return [...new Set(strnumsArray)].sort((a, b) => {
        // Extract the alphabet part using a regular expression
        const alphaA = a.match(/[A-Za-z]+/)[0]; // Matches the alphabet part
        const alphaB = b.match(/[A-Za-z]+/)[0];
      
        // Extract the number part using a regular expression
        const numA = parseInt(a.match(/\d+/)[0], 10); // Matches the number part
        const numB = parseInt(b.match(/\d+/)[0], 10);
        // Compare alphabet parts first
        if (alphaA < alphaB) return -1; if (alphaA > alphaB) return 1;
        return numA - numB;
    })
}
function searchStrongs(event,dis,copy){
    let strongsNums = dis.closest('li').innerHTML.match(/(?:G|H)\d+/gi);
    let strngNumsCount = strongsNums.length;
    strongsNums = sortStrongsNumsArray(strongsNums);
    strongsNums = strongsNums?.toString().replace(/,/g,' ');
    copy ? api.copyTextSelection(strongsNums) : searchInputsValueChange(event, strngNumsCount>1?`[${strongsNums}]`:`${strongsNums}`);//if more than one wrap in '[]' if not don't
}
function getsStrongsLemmanNxLit(wStrnum) {
    let str_xlit='', str_lemma='', str_definition='', str_morph='';
    for (let k = 0; k < strongsJSONresponse.length; k++) {
        if (strongsJSONresponse[k].number == wStrnum) {
            const currentStrongsNum = strongsJSONresponse[k];
            str_xlit = currentStrongsNum.xlit;
            str_lemma = currentStrongsNum.lemma;
            str_definition = currentStrongsNum.description;
            if (morph = currentStrongsNum.morph) {str_morph = morph;}
            k = strongsJSONresponse.length//to end the forloop
        }
    }
    return {
        xlit: str_xlit,
        lemma: str_lemma,
        morphology: str_morph,
        definition: str_definition,
        derivation: str_definition.derivation,
    }
}
function getLSJGreekStrongs(wStrnum,lean=false) {
    let lemaXlit = '',morph='';
    const regex = /(LXX|NT|OT)\.((\w+\.\d+\.\d+(-\d+)*)(,*\s*\d+\.\d+(-\d+)*)*)/g;
    
    if(!wStrnum.match(/G\d+/)){return {lemaXlit,morph}}
    let str_xlit,str_lemma,str_gloss,str_definition;
    for (let k = 0; k < lsj_full.length; k++) {
        if (lsj_full[k].number == wStrnum) {
            const lsjk = lsj_full[k];            
            morph = lsjk.morph;
            str_xlit = lsjk.xlit;
            str_lemma = lsjk.lemma;
            str_gloss = lsjk.gloss;
            str_definition = lsjk.definition;
            if (lean) {
                return {
                    xlit: str_xlit,
                    gloss: str_gloss,
                    lemma: str_lemma,
                    definition: str_definition,
                    morph:morph,
                    morphology:morph,
                }
            }
            str_definition = refsOutsideHTMLtags(str_definition);
            str_definition = modifyTags(str_definition).modifiedStr;            

            lemaXlit += `<h5 class="hidingsibs">Liddell-Scott-Jones Definition</h5>
                <p class="hidby_H5">
                    <i><b>Gloss</b>: ${lsjk.gloss}</i><br>
                    <i><b>Definition</b>: </i>
                    ${str_definition}
                </p>`;
            k = lsj_full.length//to end the forloop
        }
    }
    // lemaXlit = refsOutsideHTMLtags(lemaXlit);
    
    return {
        xlit: str_xlit,
        gloss: str_gloss,
        lemma: str_lemma,
        definition: str_definition,
        lemaXlit:lemaXlit,
        morph:morph,
        morphology:morph,
    }

    function modifyTags(str) {
        // Regular expression to match HTML tags
        var tagRegex = /(<a[^>]+>[^<]+<)/g;
      
        // Array to store modified tags
        var modifiedTags = [];
      
        // Replace each tag with the modified version
        var modifiedStr = str.replace(tagRegex, function(match, tag) {
            const matchedRefs = tag.match(regex);
            let replacement = '';
            // Modify the tag if there is a match
            if(matchedRefs){
                let tm = [];
                matchedRefs.forEach(r=>{
                    r = r.replace(/((LXX|NT|OT)\.)(\w+\.)(\d+\.\d+(,*\s*\d+(-\d+)*)*)(,*\s*(\d+\.\d+(,*\s*\d+(-\d+)*)*))+/g,'$1<span ref="$3$4">$3$4</span>; <span ref="$7">$7</span>');
                    r = r.replace(/((LXX|NT|OT)\.)(\w+\.)(\d+\.\d+(,*\s*\d+(-\d+)*)*)/g,'$1<span ref="$3$4">$3$4</span>');
                    tm.push(r);
                })
                replacement = tm.join('; ');
                replacement = replacement.replace(/NT\.|OT\./g,'');
                replacement = replacement.replace(/LXX\./g,'LXX ');
                tag = tag.replace(/(>[^(LXX|NT|OT)]*)(LXX|NT|OT)/, '$1' + replacement)
            }
          // Store the modified tag in the array
          modifiedTags.push(tag);
          // Return the modified tag to replace the original tag in the string
          return tag;
        });
      
        // Return the modified string and the array of modified tags
        return { modifiedStr, modifiedTags };
    }
    function refsOutsideHTMLtags(strd=str_definition) {
        let str_definition = strd;
        const rgx = /(?<!<[^>]*>)([^<>]+)(?![^<]*>)/g; // Matches text not inside tags
        // const rgx = /(?:^|>)[^<]*/g; // Matches text not inside tags
        let ntxt = str_definition.match(rgx);
        if (ntxt) {
            ntxt.forEach(mtc => {
                const refM = /(\w+)([\.\s]\d+[\.:]\d+(?:-\d+)*(?:,*\s*\d+(?:-\d+)*)*)((;\s*(?:[\.\s]*\d+[\.:]*\d+(?:-\d+)*(?:,*\s*\d+(?:-\d+)*)*)*)*)/g;

                // Transform the matches within `mtc`
                const transformed = mtc.replace(refM, function (fullMatch, bk_nm, chptNvrs_1, refsWithoutBknm, g1, chptNvrs_2) {
                    let newTxt = fullMatch;
                    if (bk_nm && chptNvrs_1) {
                        chptNvrs_1 = chptNvrs_1.replace(/^\./, ''); // Format chptNvrs_1
                        const combined = bk_nm + ' ' + chptNvrs_1; // Combine bk_nm and chptNvrs_1
                        newTxt = `<span ref="${bk_nm + '.' + chptNvrs_1.replace(/[:]/,'.')}">${combined}</span>`; // Replace with span

                        refsWithoutBknm = refsWithoutBknm.replace(/\s*/g,'');
                        let semiColon_count = refsWithoutBknm.match(/;\s*/g);
                        semiColon_count = semiColon_count ? semiColon_count.length : 0;
                        refsWithoutBknm = refsWithoutBknm.replace(/^\s*;\s*/,'').split(/;\s*/);
                        let l = refsWithoutBknm.length
                        if (l>0) {
                            refsWithoutBknm.forEach((rf2,i) => {
                                rf2 = rf2.trim();
                                if(/\d/.test(rf2)){
                                    rf2 = rf2.replace(/^\./, ''), newTxt += `; <span ref="${bk_nm + '.' + rf2.replace(/[:]/,'.')}" bkn="${bk_nm}">${rf2}</span>`; // Replace with span
                                    semiColon_count = semiColon_count-1;
                                }
                                else if (i==l-1 && /;/.test(g1) && semiColon_count){
                                    newTxt += '; ';
                                    semiColon_count = semiColon_count-1;
                                };
                            });
                        }
                    }

                    return newTxt; // Return the original match if no transformation
                });

                // Replace the original text in `str_definition`
                str_definition = str_definition.replace(mtc, transformed);
            });
        }
        return str_definition
    }
}
const filePathname = document.location.pathname.replace(/^\//,'').replace(/resources\/app\/.*/g,'').replace(/\//g,'\\');
async function getBDBdefinition(h_strnum) {
    let bdbFolder = filePathname + "resources\\app\\src\\data\\BDB_Entries"
    // get corresponding BDB numbers from strongs2BDBMapping.json (can be more than one match)
    // get BDB definition using the BDB numbers as file name (*.html) and get the content of the file (result is html)

    async function fetchCorresponding_BDBnum(h_strnum) {
        const response = await fetch(`/${bdbFolder}/strongs2BDBMapping.json`);
        let responseJSON = await response.json();
        // console.log(responseJSON)
        let arrayOfCorrespondingBDBnums = [];
        responseJSON[h_strnum].forEach((x,i)=>{
            if(i%2==0){arrayOfCorrespondingBDBnums.push(x)}
        })
        return arrayOfCorrespondingBDBnums
    }

    async function fetchBDBhtml(h_strnum) {
        let arrayOfBDBdefinitions = [];
        let mergedBDBdefinitions = '';
        if (!/\bH\d+/i.test(h_strnum)){return {arrayOfBDBdefinitions, mergedBDBdefinitions};}
        try {
            let arrayOfCorrespondingBDBnums = await fetchCorresponding_BDBnum(h_strnum);
    
            if (Array.isArray(arrayOfCorrespondingBDBnums) && arrayOfCorrespondingBDBnums.length === 0) {
                // If no numbers are returned, return empty results immediately
                return {arrayOfBDBdefinitions, mergedBDBdefinitions};
            }

            // Use for...of for asynchronous operations inside a loop
            for (let num of arrayOfCorrespondingBDBnums) {
                let definition = await getTextContent(num);
                if (definition) { // Only add valid definitions
                    arrayOfBDBdefinitions.push(definition);
                    mergedBDBdefinitions += definition;
                }
            }
            return {arrayOfBDBdefinitions, mergedBDBdefinitions};
        } catch (error) {
            console.error('Error in fetchBDBhtml:', error);
            return {arrayOfBDBdefinitions, mergedBDBdefinitions};// If fetchCorresponding_BDBnum fails, return empty results
            // throw error; // Propagate the error so the caller knows something went wrong
        }
    
        async function getTextContent(num) {
            try {
                const response = await fetch(`/${bdbFolder}/${num}.html`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${num}.html`);
                }
                let dbd_def = await response.text();

                // Clean up the HTML content before storing
                dbd_def = dbd_def
                .replace(/(?:(?:[\n\s\r]*<hr>)*[\n\s\r]*<\/*html>[\n\s\r]*)|(?:<head[\n\s\r\S]*?<\/head>[\n\s\r]*)/g, '')
                .replace(/<(?:(?:entry)|(?:ref))[\n\s\r\S]*?>/g,'').replace(/<\/(?:(?:entry)|(?:ref))>/g,'')
                .replace(/<language>/g,'<i>Language: ').replace(/<\/language>/g,'</i>')
                .replace(/([\n\s\r\S\d\w]*)/g, '<span>$1</span>')
                .replace(/<span>[\n\s\r]*(<h1[\n\s\r\S]*?<\/h1>)/g, '$1<span class="bdb hidby_H5">')
                // .replace(/<sense[\n\s\r\S]*?<\/sense>/g, '')
                // .replace(/<subsense[\n\s\r\S]*?<\/subsense>/g, '')
                .replace(/(\b[GH]\d+)/g, '<span class="strnum $1" strnum="$1">$1</span>')
                .replace(/(\b[GH]\d+[\n\s\r\S]<\/span>)[\n\s\r]*(<span[\n\s\r\S]*?strnum)/g, '$1 | $2')
                .replace(/<h1>/g, '<h5 style="display: block;" class="bdb hidingsibs">')
                .replace(/<span><\/span>/g, '')
                .replace(/(<div[\n\s\r\S]*?class="sense)([\n\s\r\S]*?>[\n\s\r\S]*?<sense>)/g, '$1 showlesstext$2')
                .replace(/(<div[\n\s\r\S]*?class="subsense)([\n\s\r\S]*?>[\n\s\r\S]*?<subsense>)/g, '$1 showlesstext$2')
                .replace(/(<div class="sense[\n\s\r\S]*?)<sense>([\n\s\r\S]*?)<\/sense>/g, '$1<button onclick="this.closest(\'div\').classList.toggle(\'showlesstext\')">$2</button>')
                .replace(/(<div class="subsense[\n\s\r\S]*?)<subsense>([\n\s\r\S]*?)<\/subsense>/g, '$1<button onclick="this.closest(\'div\').classList.toggle(\'showlesstext\')">$2</button>')
                .replace(/<section>([\n\s\r\S]*?)<\/section>/g, '<button onclick="this.closest(\'div\').classList.toggle(\'showlesstext\')">$1</button>')
                .replace(/<div\s+class="remarks">/g, '<div class="remarks showlesstext"><button onclick="this.closest(\'div\').classList.toggle(\'showlesstext\')" title="remarks">R</button>')
                .replace(/<div\s+class="section">/g, '<div class="section showlesstext">')

                // function replaceNestedElements(htmlString) {
                //     // Replace div.subsense with li.subsense but only if inside .sense
                //     htmlString = htmlString.replace(/<div[^>]*>([\s\S]*?)<\/div>/g, function(match, content) {
                //         return match.replace(/<div([^>]*)class="([^"]*\s*)?subsense(\s[^"]*)?"([^>]*)>/gi, '<li$1class="$2subsense$3"$4>')
                //         .replace(/<\/div>/gi, '</li>');
                //     });

                //     // Replace div.sense with ol.sense
                //     htmlString = htmlString.replace(/<div([^>]*)class="([^"]*\s*)?sense(\s[^"]*)?"([^>]*)>/gi, '<ol$1class="$2sense$3"$4>')
                //     .replace(/<\/div>/gi, '</ol>');
                
                //     return transformHtmlStructure(htmlString);
                // }

                // function transformHtmlStructure(inputString) {
                //     let senseOpen = 0, subsenseOpen = 0;

                //     // Use replace with a function for each match
                //     let senseCount = inputString.match(/<div\s+class="sense">/g)
                //     senseCount = senseCount ? senseCount.length: 0;
                //     org_senseCount = senseCount;

                //     inputString = inputString.replace(/(<div\s+class="sense">)|(<div\s+class="subsense">)|(<\/div>)/g, function(match, senseOpenMatch, subsenseOpenMatch, divCloseMatch) {
                //         if (senseOpenMatch) {
                //             senseCount--;
                //             senseOpen++;
                //             if (org_senseCount == senseCount + 1) {return `<ol><li class="sense"><ol>`;}
                //             else {return `<li class="sense"><ol>`;}
                //         } else if (subsenseOpenMatch) {
                //             subsenseOpen++;
                //             return `<li class="subsense">`;
                //         } else if (divCloseMatch) {
                //             if (subsenseOpen > 0) {
                //                 subsenseOpen--;
                //                 return `</li>`;
                //             } else if (senseOpen > 0) {
                //                 senseOpen--;
                //                 if (!senseCount) {return `</ol></li></ol>`;}
                //                 else {return `</ol></li>`;}
                //             } else {
                //                 // If we encounter a closing div with no open sense or subsense, we'll just close the last opened tag
                //                 // This should never happen since we match all possibilities, but for safety:
                //                 return `</li>`;
                //             }
                //         }
                //         return match;
                //     });
                //     return inputString
                //             .replace(/<ol>[\n\s\r]*(<descrip[\n\s\r\S]*?<\/descrip>[\n\s\r]*)/g,'<i>Description: </i><b class="description">$1</b><ol><li>')
                //             .replace(/<ol>[\n\s\r]*(<gloss[\n\s\r\S]*?<\/gloss>[\n\s\r]*)/g,'<i>Gloss: </i><b class="description">$1</b><ol>')
                // }
                // return transformHtmlStructure(dbd_def)
                return dbd_def
            } catch (error) {
                console.error(`Failed to fetch content for ${num}:`, error);
                return null; // Return null instead of throwing, so we can continue with other numbers
            }
        }
    }
    return await fetchBDBhtml(h_strnum)
}

//TO SHOW TRANSLITERATION OF WORDS
if(document.querySelector('#pagemaster')){
    pagemaster = document.querySelector('#pagemaster')
} else if(document.querySelector('body').matches('#versenotepage')){
    pagemaster = document.querySelector('body#versenotepage')
}
pagemaster.addEventListener("dblclick",transliterateWordsOnDoubleClick)

var transliteratedWords_Array = [];
function transliterateAllStoredWords(targetedSection){
    transliteratedWords_Array.forEach(storedStrnum => {showTransliteration(storedStrnum,targetedSection)});
}
function showTransliteration(stn,targetedSection) {
    let allSimilarWords;
    if(!targetedSection){targetedSection=pagemaster;}
    if(/G|H\d+/i.test(stn) && stn!=='G*'){
        allSimilarWords = targetedSection.querySelectorAll('.' + stn + '[data-xlit]:not(.vnotestrnum)');
        
        // Don't change 'the'--'G3588' if the strnums are more than 2 and one of them is 'G3588'
        if (stn=='G3588') {
            const regex = /^[GHgh]\d+$/; // Match classes starting with G/H/g/h followed by digits
            allSimilarWords = Array.from(allSimilarWords).filter(el=>!Array.from(el.classList).some(cls => regex.test(cls)));;
        }
        
        // ':not(.vnotestrnum)' so as to exempt strnums in verseNotes
        if(allSimilarWords.length<1){return}
        allSimilarWords.forEach(elm => {
            elm.innerHTML = '';
            let xlitFragment = new DocumentFragment();
            let elm_strnum = elm.getAttribute("strnum").split(' ');
            let elm_dxlit = elm.getAttribute("data-xlit").split('|');
            let y=0;
            let loopCount=0;
            alignElm_strnumElm_dxlit();//to ensure elm_strnum and elm_dxlit correspond
    
            let elm_lemma = '';
            if(elm.getAttribute("data-lemma")){elm_lemma = elm.getAttribute("data-lemma").split('|');}
            let engTranslation;
            let trueTransliteration = null;
            if(elm.getAttribute("data-true-xlit")) { //If it is from Greek Bible
                trueTransliteration = elm.getAttribute("data-true-xlit");
            } else { //If it is not from Greek Bible
                engTranslation = elm.getAttribute("translation");
            }
            let transSpanX;
            elm_strnum.forEach((eStn,j) => {
                if (/G|H\d+/i.test(eStn)) {
                    let transSpan = document.createElement('SPAN');
                    transSpanX=transSpan;
                    transSpan.classList.add(eStn);
                    transSpan.classList.add('strnum')
                    transSpan.setAttribute('strnum', eStn);
                    transSpan.setAttribute('data-xlit', elm_dxlit[j]);
                    let sLemma = ' | ' + elm_lemma[j];
                    transSpan.setAttribute('data-title', eStn + ' | ' + elm_dxlit[j] + sLemma);
                    if (elm.getAttribute("transliteration")) {
                        transSpan.innerText = ' ' + elm.getAttribute("transliteration").split(' ')[j];
                    } else {
                        transSpan.innerText = ' ' + elm_dxlit[j];
                    }
                    if (trueTransliteration) {
                        transSpan.setAttribute("data-true-xlit", trueTransliteration);
                        transSpan.innerText = ' ' + trueTransliteration;
                    }
                    xlitFragment.append(transSpan);
                } else {
                    if(!transSpanX){transSpanX = document.createElement('SPAN');}
                    transSpanX.classList.add(eStn);
                }
            });
            elm.append(xlitFragment);
            elm.classList.add('eng2grk');
            
            function alignElm_strnumElm_dxlit() {
                loopCount++;
                if (elm_strnum.length > elm_dxlit.length) {
                    if (!/[GH]\d+/i.test(elm_strnum[y])) {
                        elm_dxlit.splice(y, 0, '');
                    }
                };
                y++;
                if(loopCount<elm_strnum.length && elm_strnum.length > elm_dxlit.length){
                    alignElm_strnumElm_dxlit()
                };
            }
        })
    }
}
function hideTransliteration(stn) {
    let allSimilarWords = pagemaster.querySelectorAll('.' + stn + ':not(.vnotestrnum)');
    // ':not(.vnotestrnum)' so as to exempt strnums in verseNotes
    allSimilarWords.forEach(elm => {
        elm.classList.remove('eng2grk');
        elm.innerHTML = '';
        elm.innerHTML = elm.getAttribute("translation");
    })
}
function highlightAllStrongs(x) {
    if(!x){return}
    let allStrNumsInWord=x.trim().split(' ');
    let alreadyHighlightedStrnum=[];
    let rc=randomColor(200);
    // let rc=randomColor(true);
    allStrNumsInWord.forEach(stnum => {
        let ruleSelector1= `span[strnum="${stnum}"]:not(.translated), .${stnum}:not(.eng2grk), .${stnum}.eng2grk::after`;
        let ruleSelector2= `span[strnum].${stnum} span.strnum`;
        if (document.querySelector('style#highlightstrongs')&&findCSSRule(highlightstrongs, ruleSelector1) != -1) {
            //first unhighlight the strNums with highlight then
            addRemoveRuleFromStyleSheet('cs', ruleSelector1, highlightstrongs)
            //get all strongs number that have been highlihgted
            alreadyHighlightedStrnum.push(stnum)
        }
        
    });
    if(alreadyHighlightedStrnum.length!=allStrNumsInWord.length){//Not all strNums were formally highlighted
        highlightArrOfStrNum(allStrNumsInWord)//apply an equal color to all of them
    }

    function highlightArrOfStrNum(xxx){
        xxx.forEach(stnum => {
            if (/[GHgh]\d+/.test(stnum.replace(/[\*\]\[\(\)\]]*/g,''))) {
                let ruleSelector1= `span[strnum="${stnum}"]:not(.translated), .${stnum}:not(.eng2grk), .${stnum}.eng2grk::after`;
                let ruleSelector2= `span[strnum].${stnum} span.strnum`;
                let ruleSelector3= `span[strnum].${stnum}:not(.translated span[strnum])::after`;
                cs1 = `${ruleSelector1}{
                        background:linear-gradient(to top, ${rc} 0.8em, transparent 2em);
                        background:${rc};
                        box-shadow:0px 1px 6px -2px!important;
                        box-shadow:0 0 1px!important;
                        border-radius:2.5px!important;
                        color:black!important;
                        border-bottom-color: orangered!important;
                        transition: all 0.3s ease-in;}`;
                cs2 = `${ruleSelector2}{color:black!important}`;
                cs3 = `${ruleSelector3}{
                        content: attr(data-xlit);
                        font-size: 75%;
                        line-height: 0;
                        position: relative;
                        vertical-align: baseline;
                        top: -0.35em;
                        font-style: italic;
                        border-bottom-color: orangered!important;
                        color:crimson;}`;
                //CREATE THE INNER-STYLE WITH ID #highlightstrongs IN THE HEAD IF IT DOESN'T EXIST
                if (document.querySelector('style#highlightstrongs')) {//IF HIGHLIGHTSTRONGS STYLESHEET ALREADY EXISTS
                    addRemoveRuleFromStyleSheet(cs1, ruleSelector1, highlightstrongs)
                    // addRemoveRuleFromStyleSheet(cs3, ruleSelector3, highlightstrongs)
                    // addRemoveRuleFromStyleSheet(cs2, ruleSelector2, highlightstrongs)
                } else {//ELSE HIGHLIGHTSTRONGS STYLESHEET DOES NOT ALREADY EXISTS
                    createNewStyleSheetandRule('highlightstrongs', cs1)
                    // addRemoveRuleFromStyleSheet(cs2, ruleSelector2, highlightstrongs)
                }
            }
        });
    }
}
var clickeElmArray = [];
let timerstn;

function removeRecentStrongsFromArray(stn) {
    timerstn = setTimeout(() => {
        const index = clickeElmArray.indexOf(stn);
        if (index > -1) {
            clickeElmArray.splice(index, 1)
        }
        highlightAllStrongs(stn)
        if (document.querySelector('style#highlightstrongs')) {
            setItemInLocalStorage('strongsHighlightStyleSheet', getAllRulesInStyleSheet(highlightstrongs));
        }
    }, 300);
}

function strongsHighlighting(e) {
    let clickedElm;
    //IF IT IS A WORD TRANSLATED FROM HEBREW/GREEK
    if (e.target.classList.contains('translated')) {
        clickedElm = e.target;
        let stn = clickedElm.getAttribute('strnum');
        if (!clickeElmArray.includes(stn)) {
            clickeElmArray.push(stn)
            removeRecentStrongsFromArray(stn);
        }
    }
    //IF IT IS THE STRONGS WORD ITSELF
    else if (!e.target.matches('#singleverse_compare_menu')) {
        // clickedElm = e.target.parentElement;
        clickedElm = e.target;
        let stn = clickedElm.getAttribute('strnum');
        if (!clickeElmArray.includes(stn)) {
            clickeElmArray.push(stn)
            removeRecentStrongsFromArray(stn);
        } else { //If doubleclicked (stn will still be in the array)
            clickeElmArray.shift(stn);
            clearTimeout(timerstn)
        }
    }
}
//ON PAGE LOAD, GET TRANSLITERATED ARRAY FROM CACHE
//window.onload = () => cacheFunctions(); //Moved to after loading of first chapter

function transliterateWordsOnDoubleClick(e) {
    hoverElm = e.target;
    // SHOW TRANSLITERATION        
    if (hoverElm.nodeName == 'SPAN' && hoverElm.classList.contains('translated') && !hoverElm.classList.contains('eng2grk')) {
            let allstn = hoverElm.getAttribute('strnum').split(' '); //Some words are translated from more than one word
            allstn.forEach((stn,i) => {
                if (transliteratedWords_Array.indexOf(stn) == -1) {
                    /* ADD THE WORD TO THE transliteratedWords_Array */
                    transliteratedWords_Array.push(stn);
                }
                if(/G|H\d+/i.test(stn) && ((allstn.length==1) || (allstn.length>1 && stn!='G3588'))){showTransliteration(stn);} // Don't change 'the'--'G3588' if the strnums are more than 2 and one of them is 'G3588'
            })
        }
        // HIDE TRANSLITERATION        
        else if (hoverElm.classList.contains('strnum')) {
            let allstn = hoverElm.parentElement.getAttribute('strnum').split(' ');
            allstn.forEach(stn => {
                if (transliteratedWords_Array.indexOf(stn) != -1) {
                    /* REMOVE THE WORD FROM THE transliteratedWords_Array */
                    transliteratedWords_Array.splice(transliteratedWords_Array.indexOf(stn), 1);
            }
            if(((allstn.length==1) || (allstn.length>1 && stn!='G3588'))){hideTransliteration(stn);}// Don't change 'the'--'G3588' if the strnums are more than 2 and one of them is 'G3588'
        })
    }
    setItemInLocalStorage('transliteratedWords', transliteratedWords_Array);
}

//HIGHLIGHTING CLICKED WORD
const strongs_dblclick_prevent = debounce(strongsHighlighting, 300);
main.addEventListener("click", strongs_dblclick_prevent)
if(!document.querySelector('body').matches('#versenotepage')){
    searchPreviewFixed.addEventListener("click", strongs_dblclick_prevent);
    scriptureCompareWindow.addEventListener("click", strongs_dblclick_prevent);
}

/* EVENT LISTENERS FOR HIGHLIGHTING ALL ELEMENTS WITH THE SAME CLASS NAME BY HOVERING OVER ONE OF THEM */
/* This is acomplished by modifying the styles in the head */

const showAllSameStrongsnumberedWord = (function(){
    let mhm_t;    
     return async function(ev) {
        let e=ev;
        clearTimeout(mhm_t);
        mhm_t = setTimeout(()=>{_x(e);clearTimeout(mhm_t);},200);
        return
        function _x(e) {
            let strAtt,highlightColor;
            if (!e.target.matches('#context_menu') && e.target.getAttribute('strnum')) {
                strAtt = e.target.getAttribute('strnum');
                highlightColor = getBoxShadowColor(e.target);
            }
            //For context_menu when it is serving a strong's number
            else {
                let strElm = null;
                if (e.target.matches('#context_menu[strnum]')||(strElm=e.target.closest('#context_menu[strnum]'))) {
                    /* 'rightClickedElm' & 'firstShadowColorOfElem' are gotten from the rightclickmenu function */
                    if((typeof firstShadowColorOfElem != 'undefined') && firstShadowColorOfElem){
                        if(strElm){strAtt=strElm.getAttribute('strnum');}
                        else{strAtt=rightClickedElm.getAttribute('strnum');}
                        highlightColor = firstShadowColorOfElem;
                    }
                } else if (x=e.target.closest('[strnum]')) {
                    strAtt=x.getAttribute('strnum');
                    highlightColor = getBoxShadowColor(e.target);
                }
            }
            let isStrnum=false;
            if(e.target.matches('.strnum')){isStrnum=true}
            if (strAtt) {
                if (highlightall = document.getElementById('highlightall')) {
                    highlightall.remove();
                }
                let newStyleInHead = document.createElement('style');
                strAtt = /G3588 (G\d+)/.test(strAtt) ? strAtt.replace(/G3588\s*/,''): strAtt;// remove "the" definite article if the strong's number is more than one and starts with a "the"--G3588
                strAtt = strAtt.split(' ');
                transStyleSelector = '';
                let afterStyleSelector = '';
                // Highlight all strongs on page belong to the same family as hovered strongs
                let famMem, fmj='';
                strAtt.forEach(stn => {fmj += getKeysByFamily(stn).join(',.');});//familyMembers_joined
                if(isStrnum){famMem=`:is(.${fmj}):not(.eng2grk), :is(.${fmj}).eng2grk::after`}
                else{famMem=`:is(.${fmj}), :is(.${fmj}).eng2grk .strnum`}
                
                // Highlight all same strongs
                strAtt = strAtt.join(',.');
                if(isStrnum){
                    transStyleSelector=`:is(.${strAtt}):not(.eng2grk),:is(.${strAtt}).eng2grk::after`;
                }
                else{
                    transStyleSelector=`:is(.${strAtt}),:is(.${strAtt}).eng2grk .strnum`;
                    afterStyleSelector=`:is(.${strAtt}).eng2grk::after`;
                }
                
                newStyleInHead.id = 'highlightall';
                if(highlightColor=='none'){highlightColor='var(--strongword-hover)'}
                
                newStyleInHead.innerHTML = famMem.trim()!='' ? `body:not(.ignoreHoveredStrongs) ${famMem}{
                    background:bisque!important;
                    color:black!important;
                    box-shadow:none;
                    box-shadow: 0px 0px 1px!important;
                    text-decoration: none!important;
                    transition: all 0.05s ease-in;
                    }`:'';
                newStyleInHead.innerHTML += afterStyleSelector.trim()!=''?`body:not(.ignoreHoveredStrongs) ${afterStyleSelector}{
                    border-bottom:none;
                    box-shadow:none;
                    background:none!important;
                    transition: all 0.05s ease-in;
                    }`:'';
                newStyleInHead.innerHTML += transStyleSelector.trim()!=''?`body:not(.ignoreHoveredStrongs) ${transStyleSelector}{
                    background:var(--strnum-hover)!important;
                    text-decoration: none!important;
                    box-shadow: 0px 0px 0px 1px grey!important;
                    box-shadow: 0px 0px 1px!important;
                    border-bottom:solid 2px orangered;
                    color:black!important;
                    transition: all 0.05s ease-in;
                    `:'';
                let headPart = document.getElementsByTagName('head')[0];
                headPart.append(newStyleInHead);
            }
            document.addEventListener('mouseout',removeHighlightAllStyleInHead);
        }   
    }
})();
let mouseX=0,mouseY=0;
document.addEventListener('mousemove',(e)=>{mouseX=e.clientX;mouseY=e.clientY;});
function scrollMousePositionAndTarget(){
    // Get the element currently under the mouse cursor
    const elementUnderCursor = document.elementFromPoint(mouseX,mouseY);
    // Manually trigger the hover function if the element matches
    if(elementUnderCursor){showAllSameStrongsnumberedWord({target: elementUnderCursor});}
}
async function add_showAllSameStrongsnumberedWord_EventListener(yesORno) {
    if (yesORno==false) {
        document.removeEventListener('mouseover', await showAllSameStrongsnumberedWord);
        document.removeEventListener('mouseout', await removeHighlightAllStyleInHead);
        document.removeEventListener('scroll',scrollMousePositionAndTarget,{capture:true,passive:true});
        if(highlightall=document.head.querySelector('#highlightall')){highlightall.remove();}
        return
    }
    document.addEventListener('mouseover', await showAllSameStrongsnumberedWord);
    document.addEventListener('mouseover', showAllSameStrongsnumberedWord);
    document.addEventListener('scroll',scrollMousePositionAndTarget,{capture:true,passive:true});
      
}
function removeHighlightAllStyleInHead(e) {
    if (e.target.hasAttribute('strnum')&&(highlightall=document.head.querySelector('#highlightall'))) {highlightall.remove()}
}
// CTRL + SHIFT + D
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        checkUncheck(hl_highlightwordswithsamestrongs_check);
        showHideTransliterationSection({target:hl_highlightwordswithsamestrongs_check})
        add_showAllSameStrongsnumberedWord_EventListener(hl_highlightwordswithsamestrongs_check.checked)
    }
});