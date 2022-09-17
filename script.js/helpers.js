function elmAhasElmOfClassBasAncestor(a, ancestorsClass, limit = 'BODY') {
    while (a.parentNode.tagName.toUpperCase() != limit) {
        if (a.parentNode.classList.contains(ancestorsClass)||a.parentNode.matches(ancestorsClass)) {
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