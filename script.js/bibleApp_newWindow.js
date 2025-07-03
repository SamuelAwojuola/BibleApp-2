let window2;
// let window2 = open('verseNotesPage.html','winname','location=1');
async function openNewVerseNotesWindow(refObj){
    if(api.isElectron){
        window2 = await api.openNoteInVerseNoteWindow(refObj);
        console.log({window2});
        return
    }
    window2 = open('verseNotesPage.html','verseNotes','location=0');
    window2.resizeTo(400, screen.height);
    window2.moveTo(screen.width-265, 0);
    window2.focus();
}
function win2bgColor(cl){
    if(!window2){return}
    window2.document.bgColor=cl;
    window2.focus()
}