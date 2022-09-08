//KJV Bible OT & NT
var request_KJV_URL = 'bibles/KJV.json';
var kjvBible = new XMLHttpRequest();
kjvBible.open('GET', request_KJV_URL);
kjvBible.responseType = 'json';
kjvBible.send();

var KJV;
kjvBible.onload = function () {
    let booksChaptersAndVerses = kjvBible.response;
    KJV = booksChaptersAndVerses['books'];
    populateBooks();
    // 

    if (!localStorage.getItem('lastBookandChapter')) { //If there is no page stored in the cache
        openachapteronpageload() //To display Gensis 1 on pageLoad
    } else {
        cacheFunctions() //GET TRANSLITERATED ARRAY FROM CACHE
    }
}

// window.onload=function(){
//     if (!localStorage.getItem('lastBookandChapter')) { //If there is no page stored in the cache
//         openachapteronpageload() //To display Gensis 1 on pageLoad
//     } else {
//         cacheFunctions() //GET TRANSLITERATED ARRAY FROM CACHE
//     }
// }

/* LOAD THE BIBLE */
let availableVersions = {
    // 'original': {name: 'Original', language: 'original'},
    'accented': {name: 'Accented original', language: 'original'},
    'KJV': {name: 'King James Version', language: 'en'},
    'WEB': {name: 'World English Bible', language: 'en'},
    'ESV': {name: 'English Standard Version', language: 'en'},
    // 'LC': {name: 'Literal Consistent', language: 'en'},
    'YLT': {name: 'Young\'s Literal Translation', language: 'en'},
    'ASV': {name: 'American Standard Version', language: 'en'},
    'DARBY': {name: 'Darby Translation', language: 'en'},
    'GW': {name: 'God\'s Word Translation', language: 'en'},
    'JUB': {name: 'Jubilee Bible 200', language: 'en'},
    'LEB': {name: 'Lexham English Bible', language: 'en'},
    'NET': {name: 'New English Translation', language: 'en'},
    'WMB': {name: 'World Messianic Bible', language: 'en'},
    'OPV': {name: 'ترجمه-ی قدام', language: 'fa'},
    'TPV': {name: 'مژده برای اسرع جدید', language: 'fa'},
    'NMV': {name: 'ترجمه هزارۀ نو', language: 'fa'},
    'AraSVD': {name: 'Arabic Bible', language: 'ar'},
    'RomCor': {name: 'Cornilescu Bible in Romanian  language', language: 'ro'},
    'MCSB': {name: 'Matupi Chin Standard Bible', language: 'hlt'},
    'FreSegond1910': {name: "Bible Louis Segond (1910)", language: 'fr'},
    'FreJND': {name: "Bible J.N.Darby en français", language: 'fr'},
    'FrePGR': {name: "Bible Perret-Gentil et Rilliet", language: 'fr'},
    'CKBOKS': {name: "وەشانی بێبەرامبەری کوردیی سۆرانیی ستاندەر", language: 'ckb'},
};
// let original,accented,WEB,ESV,LC,YLT,ASV,DARBY,GW,JUB,LEB,NET,WMB,OPV,TPV,NMV,AraSVD,RomCor,MCSB,FreSegond1910,FreJND,FrePGR,CKBOKS;
// var original='original',accented='accented',WEB='WEB',ESV='ESV',LC='LC',YLT='YLT',ASV='ASV',DARBY='DARBY',GW='GW',JUB='JUB',LEB='LEB',NET='NET',WMB='WMB',OPV='OPV',TPV='TPV',NMV='NMV',AraSVD='AraSVD',RomCor='RomCor',MCSB='MCSB',FreSegond1910='FreSegond1910',FreJND='FreJND',FrePGR='FrePGR',CKBOKS='CKBOKS';

for (key in availableVersions) {
    // 
    // 
    bible_versions.innerHTML = bible_versions.innerHTML + `<div><input type="checkbox" id="${key}_version" name="${key}_version" value="${key}"><label for="${key}_version" abreviation="${key}" title="${availableVersions[key].name}">${key}</label></div>`;
}
bible_versions.addEventListener('change', function (e) {
    if (e.target.checked) {
        loadVersion(e.target.getAttribute('value'))
        localStorage.setItem('loadedBibleVersions',loadedBibleVersions)
    }
    else if (!e.target.checked) {
        // window[e.target.getAttribute('value')]//This is equal to the variable name, e.g., WEB, YLT storing the JSON object of the bible version
        let versionName=window[e.target.getAttribute('value')]
        versionName=null;//Delete the loaded JSON version
        loadedBibleVersions.splice(loadedBibleVersions.indexOf(versionName), 1)
        if(versionsToShow.length>0){
        versionsToShow.splice(versionsToShow.indexOf(versionName), 1);
        localStorage.setItem('versionsToShow', versionsToShow)
        }
        localStorage.setItem('loadedBibleVersions',loadedBibleVersions)
        bibleversions_btns.querySelector(`[bversion="${e.target.getAttribute('value')}"]`).remove()
    }
});

let bibleVersionsLoadedFromCACHE=[];
let loadedBibleVersions=[];
let versionsToShow=[];
let runCacheFunc2=true;

function loadVersion(versionName) {
    

    // 
    // 
    let request_Version_URL = `bibles/${versionName}.json`;
    let bibleVersion = new XMLHttpRequest();
    bibleVersion.open('GET', request_Version_URL);
    bibleVersion.responseType = 'json';
    bibleVersion.send();

    let newVersion;
    
    bibleVersion.onload = function () { 
        let booksChaptersAndVerses = bibleVersion.response;
        newVersion = booksChaptersAndVerses['books'];
        // 
        window[versionName]=newVersion;//For automatically assigning values to the variables
        // 
        // 
        
        /* TO ENSURE THE BOOKS ARE ONLY DISPLAYED AFTER THEY HAVE BEEN LOADED */
        
        
        
        
        
        
        if(runCacheFunc2){
            if (versionsToShow.includes(versionName.toString())) {
                
                bibleVersionsLoadedFromCACHE.push(versionName);
            }
            if(versionsToShow2.length==bibleVersionsLoadedFromCACHE.length){
                cacheFunctions2()
            }
        }
    }
    let bvInpt = document.createElement('INPUT');
    bvInpt.setAttribute('type','checkbox');
    let bvBtn = document.createElement('BUTTON');
    bvBtn.setAttribute('bversion',versionName);
    bvBtn.append(bvInpt);
    bvBtn.innerHTML=bvBtn.innerHTML+versionName;
    bibleversions_btns.append(bvBtn);
    if(loadedBibleVersions.indexOf(versionName)==-1){loadedBibleVersions.push(versionName)};
}

bibleversions_btns.addEventListener('click', function(e){
    let pbtn=e.target;
    if(pbtn.tagName.toLowerCase()=='button'){
        let pbtnCheck=pbtn.querySelector('input');
        let vname =pbtn.getAttribute('bversion');
        
        if((pbtnCheck.checked)&&(bibleversions_btns.querySelectorAll('input:checked').length>1)){
                pbtnCheck.checked=false;
                //remove the book from the display
                let versionVersesToRemove=document.querySelectorAll(`.v_${vname}`);
                versionVersesToRemove.forEach(v2r => {v2r.remove()});
                versionsToShow.splice(versionsToShow.indexOf(vname),1);
                localStorage.setItem('versionsToShow', versionsToShow)
        }else if((!pbtnCheck.checked)){
            pbtnCheck.checked=true;
            if(versionsToShow.includes(vname)==0){versionsToShow.push(vname);
            localStorage.setItem('versionsToShow', versionsToShow)
            //display the book
            let allLoadedmainVerses=main.querySelectorAll('.vmultiple');
            // 
            allLoadedmainVerses.forEach(vrs => {
                let bkid=vrs.id.split('.')[0];
                let v_ref = vrs.querySelector('code').getAttribute('ref').split(' ');
                // 
                let chptNv=v_ref.pop();
                let bookName=v_ref.join(' ');
                chptNv=chptNv.split(':')
                let chNumInBk=chptNv[0]
                let vIdx=chptNv[1]
                // 
                // 
                // 
                let vText = window[vname][bookName][Number(chNumInBk)-1][Number(vIdx)-1];
                let appendHere = vrs;
                parseSingleVerse(bkid, chNumInBk, vIdx, vText, appendHere,bookName,null, true,vname);
            });}
        }
    }
    
})
// loadVersion('WEB')

// let KJV;
// function loadAnotherVersion(){
//         // original,
//         // accented,
//         // WEB,
//         // ESV,
//         // LC,
//         // YLT,
//         // ASV,
//         // DARBY,
//         // GW,
//         // JUB,
//         // LEB,
//         // NET,
//         // WMB,
//         // OPV,
//         // TPV,
//         // NMV,
//         // AraSVD,
//         // RomCor,
//         // MCSB,
//         // FreSegond1910,
//         // FreJND,
//         // FrePGR,
//         // CKBOKS
// }