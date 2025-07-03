function parseVerseText(vT, verseSpan) {
    const verseFragments = [];
    if (Array.isArray(vT)) {
        previousVT = vT;
        vTLength = Object(vT).length;
        let redWordFRAG, redWordSpan, startRed, endRed, restartRed, italicStart = false,
            italicEnd = true;
        let italicElm;
        vT.forEach((wString, i) => {
            let wordSpan = document.createElement('span');
            let wordSpan1 = document.createElement('span');
            let wordSpan2 = document.createElement('span');

            // For making words of Christ red, for versions that have it, e.g., WEB. (The WEB translation however has issues so I do not use it)
            if (/^""/.test(wString[0]) || (restartRed && versionWithRedWordsArray.includes(currentlyParsedVersion))) {
                startRed = true;
                redWordFRAG = new DocumentFragment()
                redWordSpan = document.createElement('span');
                redWordSpan.classList.add('red');
                /* To ensure it only applies the red word span accross multiple verses for the same translation */
                if (!versionWithRedWordsArray.includes(currentlyParsedVersion)) {
                    versionWithRedWordsArray.push(currentlyParsedVersion);
                }
            };
            if (/""$/.test(wString[0])) {
                endRed = true;
                removeItemFromArray(currentlyParsedVersion, versionWithRedWordsArray)
            };

            if (wString.length === 3) {
                if (wString[2].includes('/')) {
                    const [splt_L1, splt_L2] = wString[2].split('/');
                    wordSpan1.setAttribute('TH', splt_L1);
                    wordSpan2.setAttribute('TH', splt_L2);
                } else {
                    wordSpan.setAttribute('TH', wString[2]);
                }
            }
            if (wString.length >= 2) {
                if (wString[0].includes('/')) { //For words such as ["וְ/כָל","Hc/H3605","HC/Ncmsc"]
                    const [splt_L1, splt_L2] = wString[0].split('/');

                    wordSpan1.classList.add('translated');
                    wordSpan1.setAttribute('data-xlit', "");
                    wordSpan1.setAttribute('data-lemma', "");
                    wordSpan1.setAttribute('strnum', wString[1].split('/')[0]);
                    wordSpan1.setAttribute('data-kjv-trans', ' ' + splt_L1);
                    wordSpan1.setAttribute('translation', ' ' + splt_L1);
                    wordSpan1.innerHTML = splt_L1;
                    // versespanAppender([' ', wordSpan1]);
                    verseFragments.push(...[' ', wordSpan1]);

                    wordSpan2.classList.add('translated');
                    wordSpan2.setAttribute('data-xlit', "");
                    wordSpan2.setAttribute('data-lemma', "");
                    wordSpan2.setAttribute('strnum', wString[1].split('/')[1]);
                    // wordSpan2.classList.add(wString[1].split('/')[1]);
                    wordSpan2.setAttribute('data-kjv-trans', ' ' + splt_L2);
                    wordSpan2.setAttribute('translation', ' ' + splt_L2);
                    wordSpan2.innerHTML = splt_L2;
                    // versespanAppender([wordSpan2]);
                    verseFragments.push(wordSpan2);
                } else {
                    // The actual translated text
                    wStringREGEXED = wString[0];

                    italicsStartnEnd(wStringREGEXED)

                    wStringREGEXED = wStringREGEXED.replace(/\{/g, '<sup>');
                    wStringREGEXED = wStringREGEXED.replace(/\}/g, '</sup>');
                    wStringREGEXED = wStringREGEXED.replace(/(^"")|(^")/g, '“');
                    wStringREGEXED = wStringREGEXED.replace(/(""$)|"$/g, '”');

                    // Create its "SPAN" container and set attributes as needed 
                    if (wString[1] != 'added') { //If it has an actual strongs number
                        wordSpan.classList.add('translated');
                        wordSpan.setAttribute('data-xlit', "");
                        wordSpan.setAttribute('data-lemma', "");
                        wordSpan.setAttribute('strnum', wString[1]);
                        // wordSpan.classList.add(wString[1]);
                        wordSpan.setAttribute('data-kjv-trans', ' ' + wStringREGEXED); //add the actual translation as an attribute
                        wordSpan.setAttribute('translation', ' ' + wStringREGEXED); //add the actual translation as an attribute
                        // If it is a Title to a Psalm (**they are in italics in the original document, ABP in particular)
                        if (italicStart == true && italicEnd == false) {
                            wordSpan.classList.add('em');
                        }
                        if (italicStart == true && italicEnd == true) {
                            italicStart = false;
                            // console.log(wStringREGEXED)
                            wordSpan.classList.add('em');
                            wStringREGEXED = wStringREGEXED + '<hr>'
                        }
                    }

                    // Add the text to the "SPAN" element
                    wordSpan.innerHTML = wStringREGEXED;
                    // Add the "SPAN" element with text in it to the current verse
                    // versespanAppender([' ', wordSpan]);
                    verseFragments.push(...[' ', wordSpan]);
                }
            }
            if (wString.length == 1) {
                let spacebtwwords = ' ';
                // Check if last string of string is a punctuation that should be followed by a space
                if (([".", ",", ":", ";", "?", "]", ")"].includes(wString[0][0]) == true)) {
                    spacebtwwords = '';
                }

                if (wString[0].match(/\{\d\}/)) { // ABP word order number
                    // const susFrag = document.createDocumentFragment();
                    let supElm = document.createElement('sup');

                    wStringREGEXED = wString[0];
                    // wStringREGEXED = wStringREGEXED.replace(/\{/g, '<sup>');
                    // wStringREGEXED = wStringREGEXED.replace(/\}/g, '</sup>');
                    wStringREGEXED = wStringREGEXED.replace(/[\{\}]+/g, '');
                    // verseSpan.append(' ');
                    // verseSpan.innerHTML=verseSpan.innerHTML+wStringREGEXED;
                    supElm.innerHTML = wStringREGEXED;
                    wStringREGEXED = supElm;
                    // susFrag.innerHTML = wStringREGEXED;
                    // susFrag.append(wStringREGEXED);
                    // verseFragments.push(...[supElm]);
                    verseFragments.push(...[' ', wStringREGEXED]);
                } else {
                    wStringREGEXED = wString[0];
                    //Opening and closing quotations marks
                    wStringREGEXED = wStringREGEXED.replace(/(^"")|(^")/g, '“');
                    wStringREGEXED = wStringREGEXED.replace(/(""$)|"$/g, '”');
                    italicsStartnEnd(wStringREGEXED)
                    if (italicStart == true && italicEnd == false) {
                        // console.log('italicsStartnEnd')
                        wordSpan.append(wStringREGEXED);
                        wordSpan.classList.add('em');
                    }
                    if (italicStart == true && italicEnd == true) {
                        italicStart = false;
                        wStringREGEXED = wStringREGEXED.replace(/<ii>/g, '')
                        wordSpan.append(wStringREGEXED);
                        wordSpan.append(document.createElement('hr'));
                        wordSpan.classList.add('em');
                        wStringREGEXED = wordSpan;
                    }
                    if (startRed) {
                        redWordFRAG.append(spacebtwwords);
                        redWordFRAG.append(wStringREGEXED);
                    } else {
                        // verseSpan.append(spacebtwwords);
                        // verseSpan.append(wStringREGEXED);
                        verseFragments.push(...[spacebtwwords, wStringREGEXED]);
                    }
                }

            }
            verseSpan.innerHTML = verseSpan.innerHTML.replace(/<\/sup> /g, '</sup>').replace(/(([\(\[])\s*)/g, '$2').replace(/NaN/g, '');
        });

        function italicsStartnEnd(wStringREGEXED) {
            italicStart
            italicEnd
            if ((italicStart == false) && (/<i>/i.test(wStringREGEXED))) {
                italicStart = true;
                italicEnd = false;
                wStringREGEXED = wStringREGEXED.replace(/<i>/g, '');
            }
            if (/<ii>/i.test(wStringREGEXED)) {
                italicEnd = true;
                wStringREGEXED = wStringREGEXED.replace(/<ii>/g, '');
            }
        }

        function versespanAppender(arr) {
            if (redWordFRAG) {
                arr.forEach(a => {
                    redWordFRAG.append(a)
                })
                restartRed = false;
                if (endRed || i == vTLength - 1) {
                    redWordSpan.append(redWordFRAG);
                    verseSpan.append(redWordSpan);
                    endRed = null;
                    startRed = null;
                    if (i == vTLength - 1) {
                        restartRed = true;
                    }
                }
            } else {
                arr.forEach(a => {
                    verseSpan.append(a)
                })
            }
        }
    } else {
        vT = vT.replace(/<hi type="bold">/g, '<span class="b">');
        vT = vT.replace(/<hi type="italic">/g, '<span class="i">');
        vT = vT.replace(/<\/hi>/g, '</span>');
        vT = vT.replace(/<ptitle>/g, '<span class="em">');
        vT = vT.replace(/<\/ptitle>/g, '</span><hr>');
        vT = modifyQuotationMarks(vT);
        vT = vT.replace(/ ,/g, ',');
        // verseSpan.innerHTML = vT;
        verseFragments.push(vT);
    }
    verseSpan.append(...verseFragments);
    return verseSpan;
}

/* FORMER */
function parseSingleVerse(bkid, chNumInBk, vNumInChpt, vText, appendHere, bookName, vIdx, fromSearch = false, bibleVersionName) {
    let vref = `${bookName} ${chNumInBk+1}:${vNumInChpt}`;
    let verseMultipleSpan = document.createElement('span');
    verseMultipleSpan.classList.add('vmultiple');
    /* ***************************** */
    /* Check if verse was bookmarked */
    /* ***************************** */
    if (bookMarkedVersesArr.indexOf(vref) > -1) {
        verseMultipleSpan.classList.add('v_dblclckd');
    }
    verseMultipleSpan.setAttribute('ref', vref);
    let verseSpan = document.createElement('span');
    let verseNum = document.createElement('code');
    // let bereanIndex = jsonVerseIdex - versesOT;/* TO BE CHANGED */

    // let parsedVerse = new DocumentFragment();
    if (vText == null && bibleVersionName) {
        vText = window[bibleVersionName][bookName][chNumInBk - 1][vNumInChpt - 1];
    }

    if (fromSearch) {
        let trans_lang;
        if (bibleVersionName) {
            trans_lang = bible.Data.supportedVersions[bibleVersionName].language;
        } else {
            bibleVersionName = bversionName
        }
        verseSpan = parseVerseText(vText, verseSpan);
        if (bibleVersionName) {
            verseSpan.classList.add(`v_${bibleVersionName}`);
            // verseSpan.classList.add(`hello_there`);
            if (bible.isRtlVersion(bibleVersionName, bookName) == true) {
                verseSpan.classList.add('rtl');
                verseNum.prepend(`${(chNumInBk)}:${vNumInChpt} ${bibleVersionName}`);
            } else {
                verseNum.prepend(`${bibleVersionName} ${(chNumInBk)}:${vNumInChpt}`);
            }
        } else {
            verseNum.prepend((chNumInBk) + ':' + vNumInChpt + ' ');
            // verseSpan.id = ('_' + bkid + '.' + (chNumInBk) + '.' + (vNumInChpt - 1));
        }
        verseNum.setAttribute('ref', `${bookName} ${chNumInBk}:${vNumInChpt}`);
        verseNum.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
        verseSpan.prepend(' ');
        verseSpan.prepend(verseNum);

        createTransliterationAttr(verseSpan, trans_lang);
        verseSpan.classList.add('verse');
        const lastVersionInVerseHolder = appendHere.querySelector('.verse:last-of-type');
        // const lastVersionInVerseHolder = appendHere.lastOfType('.verse');
        /* ****************************************************************************** */
        /* appendHere.nodeType==1 ensure it is an element node and not a documentFragment */
        /* ****************************************************************************** */
        if (appendHere.nodeType == 1 && lastVersionInVerseHolder && lastVersionInVerseHolder.nextElementSibling) {
            insertElmAafterElmB(verseSpan, lastVersionInVerseHolder)
        } else {
            appendHere.appendChild(verseSpan);
        }
        transliteratedWords_Array.forEach(storedStrnum => {
            showTransliteration(storedStrnum)
        });
        return
    }
    // /* OTHER VERSIONS */
    if (versionsToShow.length != 0) {
        versionsToShow.forEach(bv2d => {
            currentlyParsedVersion = bv2d;
            let trans_lang = bible.Data.supportedVersions[bv2d].language;
            // console.log(window[bv2d][bookName][chNumInBk][vIdx])
            let verseSpan2 = document.createElement('span');
            let verseNum2 = document.createElement('code');
            // console.log(versionsToShow)
            // console.log(window[bv2d])
            let vText2 = window[bv2d][bookName][chNumInBk][vIdx]
            verseSpan2 = parseVerseText(vText2, verseSpan2);
            verseSpan2.classList.add(`v_${bv2d}`)

            verseNum2.setAttribute('ref', bookName + ' ' + (chNumInBk + 1) + ':' + vNumInChpt);
            verseNum2.setAttribute('aria-hidden', 'true'); //so that screen readers ignore the verse numbers
            verseSpan2.prepend(' ');
            verseSpan2.prepend(verseNum2);
            verseSpan2.classList.add('verse');
            if (bible.isRtlVersion(bv2d, bookName) == true) {
                verseSpan2.classList.add('rtl');
                verseNum2.prepend(`${(chNumInBk + 1)}:${vNumInChpt} ${bv2d}`);
            } else {
                verseNum2.prepend(`${bv2d} ${(chNumInBk + 1)}:${vNumInChpt}`);
            }
            createTransliterationAttr(verseSpan2, trans_lang);
            verseMultipleSpan.appendChild(verseSpan2);
            verseMultipleSpan.id = ('_' + bkid + '.' + (chNumInBk) + '.' + (vNumInChpt - 1));
        })
    }
    appendHere.appendChild(verseMultipleSpan);
    currentlyParsedVersion = null;
    return appendHere
}
/* OPTIMIZATION TRY 01 */
function parseSingleVerse(bkid, chNumInBk, vNumInChpt, vText, appendHere, bookName, vIdx, fromSearch = false, bibleVersionName) {
    const vref = `${bookName} ${chNumInBk + 1}:${vNumInChpt}`;
    const verseMultipleSpan = document.createElement('span');
    verseMultipleSpan.classList.add('vmultiple');

    if (bookMarkedVersesArr.includes(vref)) {
        verseMultipleSpan.classList.add('v_dblclckd');
    }

    verseMultipleSpan.setAttribute('ref', vref);
    const verseSpan = document.createElement('span');
    const verseNum = document.createElement('code');

    if (vText == null && bibleVersionName) {
        vText = window[bibleVersionName][bookName][chNumInBk - 1][vNumInChpt - 1];
    }

    if (fromSearch) {
        const trans_lang = bibleVersionName ? bible.Data.supportedVersions[bibleVersionName].language : bversionName;
        verseSpan.classList.add('verse');
        verseSpan = parseVerseText(vText, verseSpan);

        if (bibleVersionName) {
            verseSpan.classList.add(`v_${bibleVersionName}`);
            verseNum.prepend(`${bible.isRtlVersion(bibleVersionName, bookName) ? chNumInBk : bibleVersionName} ${chNumInBk}:${vNumInChpt}`);
        } else {
            verseNum.prepend(`${chNumInBk}:${vNumInChpt} `);
        }

        verseNum.setAttribute('ref', `${bookName} ${chNumInBk}:${vNumInChpt}`);
        verseNum.setAttribute('aria-hidden', 'true');
        verseSpan.prepend(' ');
        verseSpan.prepend(verseNum);

        createTransliterationAttr(verseSpan, trans_lang);

        const lastVersionInVerseHolder = appendHere.querySelector('.verse:last-of-type');
        // const lastVersionInVerseHolder = appendHere.lastOfType('.verse');
        if (appendHere.nodeType === 1 && lastVersionInVerseHolder && lastVersionInVerseHolder.nextElementSibling) {
            insertElmAafterElmB(verseSpan, lastVersionInVerseHolder);
        } else {
            appendHere.appendChild(verseSpan);
        }

        transliteratedWords_Array.forEach(showTransliteration);

        return;
    }

    if (versionsToShow.length !== 0) {
        const trans_lang = bible.Data.supportedVersions[bibleVersionName].language;
        const verseSpan2Array = versionsToShow.map(bv2d => {
            const verseSpan2 = document.createElement('span');
            const verseNum2 = document.createElement('code');
            const vText2 = window[bv2d][bookName][chNumInBk][vIdx];
            verseSpan2.classList.add(`v_${bv2d}`);

            verseNum2.setAttribute('ref', `${bookName} ${chNumInBk + 1}:${vNumInChpt}`);
            verseNum2.setAttribute('aria-hidden', 'true');
            verseSpan2.prepend(' ');
            verseSpan2.prepend(verseNum2);
            verseSpan2.classList.add('verse');

            if (bible.isRtlVersion(bv2d, bookName)) {
                verseSpan2.classList.add('rtl');
                verseNum2.prepend(`${chNumInBk + 1}:${vNumInChpt} ${bv2d}`);
            } else {
                verseNum2.prepend(`${bv2d} ${chNumInBk + 1}:${vNumInChpt}`);
            }

            createTransliterationAttr(verseSpan2, trans_lang);
            return parseVerseText(vText2, verseSpan2);
        });

        verseMultipleSpan.id = `_${bkid}.${chNumInBk}.${vNumInChpt - 1}`;
        verseMultipleSpan.append(...verseSpan2Array);
    }

    appendHere.appendChild(verseMultipleSpan);
    return appendHere;
}
/* OPTIMIZATION 02 */
function parseSingleVerse(bkid, chNumInBk, vNumInChpt, vText, appendHere, bookName, vIdx, fromSearch = false, bibleVersionName) {
    const vref = `${bookName} ${chNumInBk + 1}:${vNumInChpt}`;
    const verseMultipleSpan = document.createElement('span');
    verseMultipleSpan.classList.add('vmultiple');

    // Check if verse was bookmarked
    if (bookMarkedVersesArr.includes(vref)) {
        verseMultipleSpan.classList.add('v_dblclckd');
    }

    verseMultipleSpan.setAttribute('ref', vref);
    let verseSpan = document.createElement('span');
    let verseNum = document.createElement('code');

    if (vText == null && bibleVersionName) {
        vText = window[bibleVersionName][bookName][chNumInBk - 1][vNumInChpt - 1];
    }

    if (fromSearch) {
        const trans_lang = bibleVersionName ? bible.Data.supportedVersions[bibleVersionName].language : bversionName;
        verseSpan = parseVerseText(vText, verseSpan);
        verseSpan.classList.add(`v_${bibleVersionName}`);

        if (bible.isRtlVersion(bibleVersionName, bookName)) {
            verseSpan.classList.add('rtl');
            verseNum.prepend(`${chNumInBk}:${vNumInChpt} ${bibleVersionName}`);
        } else {
            verseNum.prepend(`${bibleVersionName} ${chNumInBk}:${vNumInChpt}`);
        }

        verseNum.setAttribute('ref', `${bookName} ${chNumInBk}:${vNumInChpt}`);
        verseNum.setAttribute('aria-hidden', 'true');
        verseSpan.prepend(' ');
        verseSpan.prepend(verseNum);
        createTransliterationAttr(verseSpan, trans_lang);
        verseSpan.classList.add('verse');

        // const lastVerseHolder = appendHere.querySelector('.verse:last-of-type');
        const lastVerseHolder = appendHere.lastOfType('.verse');
        if (appendHere.nodeType === 1 && lastVerseHolder && lastVerseHolder.nextElementSibling) {
            insertElmAafterElmB(verseSpan, lastVerseHolder);
        } else {
            appendHere.appendChild(verseSpan);
        }

        transliteratedWords_Array.forEach(storedStrnum => {
            showTransliteration(storedStrnum);
        });

        return;
    }

    if (versionsToShow.length !== 0) {
        for (const bv2d of versionsToShow) {
            currentlyParsedVersion = bv2d;
            const {
                language
            } = bible.Data.supportedVersions[bv2d]; // Optimization 5: Destructuring
            let verseSpan2 = document.createElement('span');
            const verseNum2 = document.createElement('code');
            const vText2 = window[bv2d][bookName][chNumInBk][vIdx];

            verseSpan2 = parseVerseText(vText2, verseSpan2);
            verseSpan2.classList.add(`v_${bv2d}`);
            verseNum2.setAttribute('ref', `${bookName} ${chNumInBk + 1}:${vNumInChpt}`);
            verseNum2.setAttribute('aria-hidden', 'true');
            verseSpan2.prepend(' ');
            verseSpan2.prepend(verseNum2);
            verseSpan2.classList.add('verse');

            if (bible.isRtlVersion(bv2d, bookName)) {
                verseSpan2.classList.add('rtl');
                verseNum2.prepend(`${chNumInBk + 1}:${vNumInChpt} ${bv2d}`);
            } else {
                verseNum2.prepend(`${bv2d} ${chNumInBk + 1}:${vNumInChpt}`);
            }

            createTransliterationAttr(verseSpan2, language); // Optimization 3: Moved outside the loop
            verseMultipleSpan.appendChild(verseSpan2);
            verseMultipleSpan.id = `_${bkid}.${chNumInBk}.${vNumInChpt - 1}`;
        }
    }
    appendHere.appendChild(verseMultipleSpan);
    currentlyParsedVersion = null;
    return appendHere;

}
/* FORMER FUNCTION generateChapter(xyz)*/
function generateChapter(xyz) {
    let wholeChapterFragment = new DocumentFragment();
    let chpHeadingFragment = new DocumentFragment();
    let chapterHeading = null;
    let chpVersesFragment = new DocumentFragment();
    let chapterVersesSpan = document.createElement('SPAN');
    let xyz_bookName = xyz.getAttribute("bookname");
    let xyz_bookIdx = Number(xyz.getAttribute("bookindex"));
    let xyz_chNumInBk = Number(xyz.getAttribute("chapterindex"));
    let actualChapter = window[versionsToShow[0]][xyz_bookName][xyz_chNumInBk];
    currentlyParsedVersion = versionsToShow[0];
    // let actualChapter = KJV[xyz_bookName][xyz_chNumInBk];
    for (vNumInChpt = 1, i = 0; i < actualChapter.length; i++, vNumInChpt++) {
        // Create Chapter Heading
        if (vNumInChpt == 1) {
            chapterHeading = document.createElement('h2');
            chapterHeading.classList.add('chptheading');
            chapterHeading.setAttribute('bookName', xyz_bookName);
            chapterHeading.append(xyz_bookName + ' ' + (xyz_chNumInBk + 1));
            chapterHeading.id = '_' + xyz_bookIdx + '.' + (xyz_chNumInBk);
            chpHeadingFragment.prepend(chapterHeading)
        }
        let verseContent = actualChapter[i];
        parseSingleVerse(xyz_bookIdx, xyz_chNumInBk, vNumInChpt, verseContent, chpVersesFragment, xyz_bookName, i)
    }
    chapterVersesSpan.classList.add('chptverses');
    chapterVersesSpan.setAttribute('bookName', xyz_bookName);
    chapterVersesSpan.setAttribute('bookId', xyz_bookIdx);
    chapterVersesSpan.setAttribute('chapter', xyz_chNumInBk + 1);
    chapterVersesSpan.innerHTML = '';
    chapterVersesSpan.append(chpVersesFragment);
    wholeChapterFragment.append(chapterVersesSpan);
    wholeChapterFragment.prepend(chpHeadingFragment);
    currentlyParsedVersion = null;
    return wholeChapterFragment;
    // chpVersesFragment.prepend(chpHeadingFragment);
    // return chpVersesFragment;
}
/* Optimization 1 */
function generateChapter(xyz) {
    let wholeChapterFragment = document.createDocumentFragment();
    let chapterHeading = null;
    let xyz_bookName = xyz.getAttribute("bookname");
    let xyz_bookIdx = Number(xyz.getAttribute("bookindex"));
    let xyz_chNumInBk = Number(xyz.getAttribute("chapterindex"));
    let actualChapter;
    for (const vrzn of versionsToShow) {
        actualChapter = window[vrzn]?.[xyz_bookName]?.[xyz_chNumInBk];
        if (actualChapter) {
            currentlyParsedVersion = vrzn;        
            break
        }
    }

    // Create Chapter Heading
    chapterHeading = document.createElement('h2');
    chapterHeading.classList.add('chptheading');
    chapterHeading.setAttribute('bookName', xyz_bookName);
    chapterHeading.append(xyz_bookName + ' ' + (xyz_chNumInBk + 1));
    chapterHeading.id = '_' + xyz_bookIdx + '.' + (xyz_chNumInBk);
    wholeChapterFragment.appendChild(chapterHeading);

    // Create Chapter Verses
    let chpVersesContainer = document.createElement('div');
    chpVersesContainer.classList.add('chptverses');
    chpVersesContainer.setAttribute('bookName', xyz_bookName);
    chpVersesContainer.setAttribute('bookId', xyz_bookIdx);
    chpVersesContainer.setAttribute('chapter', xyz_chNumInBk + 1);

    for (let i = 0; i < actualChapter.length; i++) {
        let verseContent = actualChapter[i];
        let parsedVerseElement = parseSingleVerse(xyz_bookIdx, xyz_chNumInBk, i + 1, verseContent, chpVersesContainer, xyz_bookName, i);
    }

    wholeChapterFragment.appendChild(chpVersesContainer);
    currentlyParsedVersion = null;
    return wholeChapterFragment;
}