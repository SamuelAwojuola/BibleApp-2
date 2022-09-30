// function getFUllBookName(shortBkNm) {
//     bible.Data.books.forEach((ref_, ref_indx) => {
//         if (ref_.includes(shortBkNm.toUpperCase())) {
//             let fullname = bible.Data.bookNamesByLanguage.en[ref_indx]
//             return fullname;
//         }
//     });
// }
/* Ensure doublick does not run click eventListner */

function codeELmRefClick(e) {
    if (e.target.tagName == "CODE") {
        let codeElm = e.target;
        gotoRef(codeElm.getAttribute('ref'))
        // console.log('e.target')
        e.preventDefault();
    }
}

function debounce(func, timeout = 300) {
    var ttt;
        return function () {
        if (ttt) {
            console.log('clearing Timeout')
            clearTimeout(ttt)
            ttt=undefined;
        } else {
            // console.log('setting Timeout')
            const context = this
            const args = arguments
            ttt = setTimeout(() => {
                func.apply(context, args);
                ttt=undefined;
                // console.log('done & cleared')
            }, timeout)
        }
    }
}

function removeItemFromArray(n, array) {
    const index = array.indexOf(n);

    // if the element is in the array, remove it
    if (index > -1) {

        // remove item
        array.splice(index, 1);
    }
    return array;
}

function elmAhasElmOfClassBasAncestor(a, ancestorsClass, limit = 'BODY') {
    while (a.parentNode && a.parentNode.tagName.toUpperCase() != limit) {
        if (a.parentNode.classList.contains(ancestorsClass) || a.parentNode.matches(ancestorsClass)) {
            return a.parentNode
        }
        a = a.parentNode;
    }
    return false
}

function insertElmAbeforeElmB(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode);
}

function removeCharacterFromString(xh, str) {
    return str.split(xh).join('')
}

/* DRAGGING RESIZE */
const BORDER_SIZE = 10;
const panel = document.getElementById("strongsdefinitionwindow");
const resizerdiv = document.getElementById("resizerdiv");

let m_pos;
let old_width;
let hasBeenClicked = false;

function resize(e) {
    const dx = e.x - m_pos;
    //   const dx = m_pos - e.x;
    if (dx > 0) {
        let new_width = old_width + dx;
        panel.style.maxWidth = new_width + "px";
        panel.style.width = new_width + "px";
    } else if (dx < 0) {
        panel.style.maxWidth = old_width + "px";
        panel.style.width = old_width + "px";
    }
}

resizerdiv.addEventListener("mousedown", function (e) {
    if (hasBeenClicked == false && e.offsetX < BORDER_SIZE) {
        m_pos = e.x;
        old_width = parseInt(getComputedStyle(panel, '').width);
        hasBeenClicked = true;
        document.addEventListener("mousemove", resize, false);
    }
}, false);

document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", resize, false);
    hasBeenClicked = false;
}, false);

function relocateElmTo(elm, moveHere){
    let elmCopy = elm.cloneNode(true);
    elm.remove();
    moveHere.append(elmCopy)
}

function X_hasNoSibling_Y_b4_Z(x,y,z){
    let a=x,yes_no=false,Y=null,Z=null,elm2appendAfter=x;
    while (a.nextElementSibling) {
        if(a.nextElementSibling.matches(z)){
            Z=a.nextElementSibling;
            elm2appendAfter=x;
            yes_no = true;
            break
        } else if(a.nextElementSibling.matches(y)){
            Y=a.nextElementSibling;
            elm2appendAfter=Y;
            aa=Y.nextElementSibling;
            yes_no = false;
            while (aa) {
                if(aa.matches(z)){
                    Z=aa;
                    break
                }
                aa=aa.nextElementSibling;
            }
            break
        } else {a=a.nextElementSibling;}
    }
    return {
        elm2appendAfter:elm2appendAfter,
        yes_no:yes_no,
        elmY:Y,
        elmZ:Z
    }
}

function getSibling_Y_of_X_b4_Z(x,y,z){}