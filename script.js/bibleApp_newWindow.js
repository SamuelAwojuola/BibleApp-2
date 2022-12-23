let window2;
// let window2 = open('page2_versenotes.html','winname','location=1');
function openNewWindow(){
    window2 = open('page2_versenotes.html','winname','location=0');
    window2.resizeTo(400, screen.height);
    window2.moveTo(screen.width-265, 0);
    window2.focus()
}
function win2bgColor(cl){
    if(!window2){return}
    window2.document.bgColor=cl;
    window2.focus()
}