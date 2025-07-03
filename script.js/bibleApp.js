// // ServiceWorker is a progressive technology. Ignore unsupported browsers
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function() {
//       navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
//         // Registration was successful
//         // console.log('ServiceWorker registration successful with scope: ', registration.scope);
//       }, function(err) {
//         // registration failed :(
//         console.log('ServiceWorker registration failed: ', err);
//       });
//     });
// } else {
//     console.log('CLIENT: service worker is not supported.');
// }
let subHeadingsFileName;
let ignoreLastRef, searchHistoryArr = [];
if (document.body.matches('#homepage') && api.isElectron) {
    // TO SPEED UP THE LOADING OF THE FIRST PAGE
    /* Page content is saved on close.
    Then on opening of page, it is loaded first so as to speed up loading.
    */
    api.getSavedPageContent().then(result => {
        if (result) {
            let [savedDocumentContent, lastScrollPosition, searchHistoryArr_] = result;
            if (!localStorage.getItem('defaultThemesAllSet')) {
                const fs1 = '--ref-img,#fbf7ef,--fontsize-scripture,28px,--fontsize-ref,23px,--fontsize-strongstooltip,35px,--fontsize-scripture-nav,18px,--main-font,Calibri| sans-serif,--fontsize-refnsearch,12px,--fontsize-main,15px,--fontsize-versionsbuttons,20px,--buttons,#e9e5df,--width-sidebuttons,40px,--fontsize-sidewindow-verses,26px,--fontsize-versenotes,28px,--darkmode-bg1color,#000000,--maxwidth-of-verses-per-row,25%,--vhlt3,#fff6aa,--vhlt4,#fffac884,--chpt,#e6d7b7,--translated-word,#471d00';
                const fs2 = '--ref-img,#f0f3f4,--fontsize-scripture,39px,--fontsize-ref,19px,--fontsize-strongstooltip,27px,--fontsize-scripture-nav,15px,--main-font,Calibri| sans-serif,--fontsize-refnsearch,9px,--fontsize-main,16px,--fontsize-versionsbuttons,16px,--buttons,#dbd6c8,--width-sidebuttons,29px,--fontsize-sidewindow-verses,38px,--fontsize-versenotes,39px,--darkmode-bg1color,#020717,--maxwidth-of-verses-per-row,25%,--vhlt3,#fff6aa,--vhlt4,#fffac884,--chpt,#d7ccc8,--translated-word,#5c2e2e';
                const fs3 = '--ref-img,#f7f7e8,--fontsize-scripture,23px,--fontsize-ref,17px,--fontsize-strongstooltip,21px,--fontsize-scripture-nav,17px,--main-font,Cambria|Cochin|Times|"Times New Roman"|serif,--fontsize-refnsearch,10px,--fontsize-main,16px,--fontsize-versionsbuttons,14px,--buttons,#e5ddd4,--width-sidebuttons,26px,--fontsize-sidewindow-verses,18px,--fontsize-versenotes,23px,--darkmode-bg1color,#0a0a0a,--maxwidth-of-verses-per-row,25%,--vhlt3,#fff6aa,--vhlt4,#fffac884,--chpt,#d0b290,--translated-word,#01003d';
                const fs4 = '--ref-img,url(images/background.jpg),--ref-img,#ebecef,--fontsize-scripture,21px,--fontsize-ref,13px,--fontsize-strongstooltip,21px,--fontsize-scripture-nav,16px,--main-font,system-ui| -apple-system| BlinkMacSystemFont| "Segoe UI"| Roboto| Oxygen| Ubuntu| Cantarell| "Open Sans"| "Helvetica Neue"| sans-serif,--fontsize-refnsearch,11px,--fontsize-main,19px,--fontsize-versionsbuttons,18px,--buttons,#f8f8f8,--width-sidebuttons,33px,--fontsize-sidewindow-verses,21px,--fontsize-versenotes,21px,--darkmode-bg1color,#0a0005,--maxwidth-of-verses-per-row,25%,--vhlt3,#fff6aa,--vhlt4,#fffac884,--chpt,#d7ccc8,--translated-word,#211d1c';
                const fs1_drk = '--darkmode-bg1color,,--buttons,,--vhlt3,rgb(8,4,0),--vhlt4,#0f0f10,--chpt,#08443d,--translated-word,';
                const fs2_drk = '--darkmode-bg1color,#0a0a0b,--buttons,#1b1b1c,--vhlt3,rgb(8,4,0),--vhlt4,#2a323fed,--chpt,,--translated-word,';
                const fs3_drk = '--darkmode-bg1color,#1b1918,--buttons,#252423,--vhlt3,#000000,--vhlt4,#12161c,--chpt,#27282b,--translated-word,';
                const fs4_drk = '--darkmode-bg1color,#000000,--buttons,#1a1a1a,--vhlt3,rgb(8,4,0),--vhlt4,#111318,--chpt,#5d4037,--translated-word,';
                const themes_sets = {
                    'fontsizes_1': fs1,
                    'fontsizes_2': fs2,
                    'fontsizes_3': fs3,
                    'fontsizes_4': fs4,
                    'darkmode_fontsizes_1': fs1_drk,
                    'darkmode_fontsizes_2': fs2_drk,
                    'darkmode_fontsizes_3': fs3_drk,
                    'darkmode_fontsizes_4': fs4_drk,
                    'currentFontSizeSet': 'fontsizes_4'
                }
                for (const fs in themes_sets) {
                    if (!localStorage.getItem(fs)) {
                        localStorage.setItem(fs, themes_sets[fs])
                    };
                } //Done this way because of those who already have the app installed and may already have some theme set
                localStorage.setItem('defaultThemesAllSet', 'true')
            }
            if (localStorage.getItem('currentFontSizeSet') && localStorage.getItem(localStorage.getItem('currentFontSizeSet'))) {
                fontsizes.value = localStorage.getItem('currentFontSizeSet');
                if (stylesVariablesArray = localStorage.getItem(fontsizes.value)) {
                    stylesVariablesArray = stylesVariablesArray.split(',');
                    stylesVariablesArray.forEach((sVar, i) => {
                        j = i + 2;
                        if (j % 2 == 0) {
                            document.querySelector(':root').style.setProperty(stylesVariablesArray[i], stylesVariablesArray[i + 1].replace(/\|/g, ','));
                        }
                    });
                }
                else {colorgroups_SET_DEFAULTS()}
            }
            if (localStorage.getItem('darkmode')) {document.body.classList.add('darkmode')} // Make it darkmode from the very start if it was
            document.getElementById('main').innerHTML = savedDocumentContent;
            if (highest_verse = document.getElementById('main').getElementsByClassName('highest_verse')[0]) {
                highest_verse.scrollIntoView({behavior: 'smooth',block: 'start'});
                reference.value = highest_verse.getAttribute('ref');
                document.querySelectorAll('.highest_verse').forEach(x => {x.classList.remove('highest_verse')});
            }
            document.getElementById('main').scrollTop = lastScrollPosition;
            searchHistoryArr = searchHistoryArr_;
            ignoreLastRef = true;
        }
    }).catch(error => {
        console.error('Error retrieving saved page content:', error);
    });
}
document.addEventListener('keydown', function (e) {
    if (e.key === 'F1') {
        e.preventDefault(); // Prevent the default F1 key behavior (e.g., opening browser help)
        showHelpDialogWindow();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'r' && api.isElectron) {
        api.updateSavedPageContent();//IMPORTANT: Update the searchHistory in Electron App to sync accross multiple open sessions
    }
});

function showHelpDialogWindow() {
    if (myDialog.open) {
        myDialog.close();
        myDialog.append(shortcutkeys_list_clone);
        myDialog.querySelector('#shortcutkeys_list_clone').remove();
    } else {
        if (typeof shortcutkeys_list_clone == 'undefined') {
            let shortcutkeys_list_clone = shortcutkeys_list.querySelector('span').cloneNode(true);
            shortcutkeys_list_clone.id = "shortcutkeys_list_clone";
            myDialog.prepend(shortcutkeys_list_clone);
        }
        myDialog.showModal();myDialog.scrollTo(0,0)
    }
}

/* TO COPY HIDDEN ELEMENTS WITH COPY COMMAND + SHIFT-KEY */
// (function () {
//   document.addEventListener('copy', function (e) {
//     if (!e.shiftKey) return; // Only if Shift is held

//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const html = cleanHTML(getFullHtmlIncludingHidden(range));
//     const text = cleanText(range.cloneContents().textContent);

//     e.clipboardData.setData('text/html', html);
//     e.clipboardData.setData('text/plain', text);
//     e.preventDefault(); // Override default copy behavior

//     showToast("Copied with hidden elements");
//   });

//   function getFullHtmlIncludingHidden(range) {
//     const container = document.createElement('div');
//     const treeWalker = document.createTreeWalker(
//       range.commonAncestorContainer,
//       NodeFilter.SHOW_ELEMENT,
//       {
//         acceptNode: (node) => (range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
//       }
//     );

//     while (treeWalker.nextNode()) {
//       container.appendChild(treeWalker.currentNode.cloneNode(true));
//     }

//     return container.innerHTML;
//   }

//   function cleanHTML(html) {
//     const div = document.createElement('div');
//     div.innerHTML = html;

//     // Remove comments
//     const walker = document.createTreeWalker(div, NodeFilter.SHOW_COMMENT, null, false);
//     let comment;
//     while ((comment = walker.nextNode())) {
//       comment.parentNode.removeChild(comment);
//     }

//     // Replace &nbsp;
//     div.innerHTML = div.innerHTML.replace(/&nbsp;/g, ' ');

//     // Optionally remove empty tags
//     div.querySelectorAll('span, div, font, b, i').forEach(el => {
//       if (!el.textContent.trim()) el.remove();
//     });

//     return div.innerHTML.trim();
//   }

//   function cleanText(text) {
//     return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
//   }

//   // Toast logic
//   function showToast(message) {
//     let toast = document.getElementById('js-copy-toast');
//     if (!toast) {
//       toast = document.createElement('div');
//       toast.id = 'js-copy-toast';
//       document.body.appendChild(toast);

//       // Inline style
//       Object.assign(toast.style, {
//         position: 'fixed',
//         bottom: '20px',
//         left: '50%',
//         transform: 'translateX(-50%)',
//         background: '#333',
//         color: '#fff',
//         padding: '10px 20px',
//         borderRadius: '8px',
//         fontSize: '14px',
//         opacity: '0',
//         pointerEvents: 'none',
//         transition: 'opacity 0.3s ease',
//         zIndex: '9999',
//       });
//     }

//     toast.textContent = message;
//     toast.style.opacity = '1';
//     setTimeout(() => {
//       toast.style.opacity = '0';
//     }, 2000);
//   }
// })();