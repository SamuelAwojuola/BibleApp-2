function addCSSrulesFromArray(css_rules_array, styleSheetToAddThemTo) {}

function getAllRulesInStyleSheet(styleSheet) {
    if (styleSheet) {
        let allRules = styleSheet.sheet.cssRules;
        let rulesArray = [];
        for (let i = 0; i < allRules.length; i++) {
            rulesArray.push(allRules[i].cssText)
        };
        // console.log(rulesArray)
        return rulesArray
    }
}
//STYLE SHEET MODIFIER
function findCSSRule(mySheet, selector) {
    let ruleIndex = -1; // Default to 'not found'
    let theRules = mySheet.cssRules ? mySheet.cssRules : mySheet.rules;
    // console.log(theRules.length)
    for (i = 0; i < theRules.length; i++) {
        if (theRules[i].selectorText == selector) {
            ruleIndex = i;
            break;
        }
    }
    return ruleIndex;
}
//Random color Alternative
//+'#' + (0x1220000 + Math.random() * 0xFF00FF).toString(16).substr(1,6);
function createNewStyleSheetandRule(styleID, styleRule) {
    if (!document.getElementsByTagName('head')[0].querySelector('#' + styleID)) {
        addNewStyle()
    } else {
        document.getElementsByTagName('head')[0].querySelector('#' + styleID).remove();
        addNewStyle()
    }

    function addNewStyle() {
        let headPart = document.getElementsByTagName('head')[0];
        newStyleInHead = document.createElement('style');
        newStyleInHead.id = styleID;
        newStyleInHead.innerHTML = styleRule;
        headPart.append(newStyleInHead);
    }
}

function addRemoveRuleFromStyleSheet(CS_rule, ruleSelector, targetStyleSheet) {
    let highlightStrongsSheet = targetStyleSheet.sheet;
    let allRules = highlightStrongsSheet.cssRules;
    for (let i = 0; i < allRules.length; i++) {
        if (findCSSRule(highlightStrongsSheet, ruleSelector) == -1) {
            highlightstrongs.sheet.insertRule(CS_rule, allRules.length - 1);
        } else {
            highlightStrongsSheet.deleteRule(findCSSRule(highlightStrongsSheet, ruleSelector));
            if (allRules.length == 0) {
                targetStyleSheet.remove()
            }
        }
        break
    }
}
/* CHANGE ROOT CSS VARIABLES */
//get a variables value
let documentROOT = document.querySelector(':root');
let rootStyles = getComputedStyle(documentROOT)
// rootStyles.getPropertyValue('--buttons')
function changeFontFamily() {
    //change value of variable
    documentROOT.style.setProperty('--main-font', fontchange.value);
    styleLocalstorageSet()
}

function changeFontSize(targetgroup, plusMinus) {
    let currentSize;
    if (targetgroup == 'verse_text') {
        targ = '--fontsize-scripture';
        currentSize = rootStyles.getPropertyValue('--fontsize-scripture');
    }
    if (targetgroup == 'main_font') {
        targ = '--fontsize-main';
        currentSize = rootStyles.getPropertyValue('--fontsize-main');
    }
    if (targetgroup == 'ref_text') {
        targ = '--fontsize-ref';
        currentSize = rootStyles.getPropertyValue('--fontsize-ref');
    }
    if (targetgroup == 'strongs_tooltip') {
        targ = '--fontsize-strongstooltip';
        currentSize = rootStyles.getPropertyValue('--fontsize-strongstooltip');
    }
    if (targetgroup == 'bible_nav') {
        targ = '--fontsize-scripture-nav';
        currentSize = rootStyles.getPropertyValue('--fontsize-scripture-nav');
    }
    currentSize = Number(currentSize.split('px')[0].trim())
    if (plusMinus == 'plus') {
        currentSize = (currentSize + 2) + 'px'
    } else if (plusMinus == 'minus') {
        currentSize = (currentSize - 2) + 'px'
    }
    documentROOT.style.setProperty(targ, currentSize);
    styleLocalstorageSet()
}

function styleLocalstorageSet() {
    let variableArray = [
        ["--fontsize-scripture", rootStyles.getPropertyValue('--fontsize-scripture')],
        ["--fontsize-ref", rootStyles.getPropertyValue('--fontsize-ref')],
        ["--fontsize-strongstooltip", rootStyles.getPropertyValue('--fontsize-strongstooltip')],
        ["--main-font", rootStyles.getPropertyValue('--main-font')],
        ["--main-font", rootStyles.getPropertyValue('--main-font')],
        ["--fontsize-main", rootStyles.getPropertyValue('--fontsize-main')]
    ]
    setItemInLocalStorage('styles_variables', variableArray);
}

let lcol = rootStyles.getPropertyValue('--verse-hover');

function darkLightMode() {
    let dark_mode = 'darkmode';
    let darkmodeCSS = `span.verse{
        background-color:rgb(38, 38, 38);
        color:white!important;
    }span.verse span{
        color:white;
    }`
    // let dcol= 'rgba(0, 50, 112, 0.918)';
    let dcol = 'rgba(0, 120, 112, 0.918)';
    if (document.getElementsByTagName('head')[0].querySelector('#darkmode')) {
        darkmode.remove();
        console.log(this);
        darkmodebtn.innerText = 'L'
        documentROOT.style.setProperty('--verse-hover', lcol);
    } else {
        createNewStyleSheetandRule(dark_mode, darkmodeCSS);
        darkmodebtn.innerText = 'D';
        documentROOT.style.setProperty('--verse-hover', dcol);
    }
}
let saved_highlightStrongsSheet

function hide_strongshighlight() {
    saved_highlightStrongsSheet = highlightstrongs;
    highlightstrongs.remove()
}

function showEnglishTranslationOfHGtransliteration(evt) {
    if (evt && evt.key === 'r' && evt.altKey) {
        engnXlit_supscript('eng')
    }
    if (evt && evt.key === 't' && evt.altKey) {
        engnXlit_supscript('hebgrk')
    }
}

function engnXlit_supscript(x) {
    console.log(x)
    if (x == 'eng') {
        let eng2grk_style = `.verse:not(.v_accented) .eng2grk::after{
            content: attr(translation);
            font-size: 75%;
            line-height: 0;
            position: relative;
            vertical-align: baseline;
            top: -0.5em;
            font-style: italic;
            color:crimson;
        }`;

        // Toggle the stylesheet :::: add/remove
        if (engofgrknhb = document.querySelector('head').querySelector('#engofgrknhb')) {
            engofgrknhb.remove();
            show_eng_superscript.innerText = 'OFF';
        } else {
            createNewStyleSheetandRule('engofgrknhb', eng2grk_style)
            show_eng_superscript.innerText = 'ON';
        }
    }
    if (x == 'hebgrk') {
        let eng2grk_style = `
        .verse:not(.v_accented) .translated:not(.eng2grk)::after {
                content: attr(data-xlit)
            }
        .verse.v_accented .translated:not(.eng2grk)::after {
                content: attr(data-true-xlit)
            }
            .verse .translated:not(.eng2grk)::after {
                font-size: 75%;
                line-height: 0;
                position: relative;
                vertical-align: baseline;
                top: -0.5em;
                font-style: italic;
                color:darkslategrey;
            }`;

        // Toggle the stylesheet :::: add/remove
        if (xlitofhebngrk = document.querySelector('head').querySelector('#xlitofhebngrk')) {
            xlitofhebngrk.remove();
            show_hebgrk_superscript.innerText = 'OFF';
        } else {
            createNewStyleSheetandRule('xlitofhebngrk', eng2grk_style)
            show_hebgrk_superscript.innerText = 'ON';
        }
    }
}

// function engnXlit_supscript() {
//     let eng2grk_style = `.verse:not(.v_accented) .eng2grk::after{
//         content: attr(translation);
//         font-size: 75%;
//         line-height: 0;
//         position: relative;
//         vertical-align: baseline;
//         top: -0.5em;
//         font-style: italic;
//         color:crimson;
//     }`;

//     // Toggle the stylesheet :::: add/remove
//     if (engofgrknhb = document.querySelector('head').querySelector('#engofgrknhb')) {
//         engofgrknhb.remove();
//     } else {
//         createNewStyleSheetandRule('engofgrknhb', eng2grk_style)
//     }
// }

console.log("HELP:: press 'alt+r' to toggle original english translation of transliterated Hebrew or Greek words as a superscript ")

document.addEventListener('keydown', showEnglishTranslationOfHGtransliteration)