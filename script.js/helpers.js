function elmAhasElmOfClassBasAncestor(a, ancestorsClass, limit = 'BODY') {
    while (a.parentNode.tagName.toUpperCase() != limit) {
        if (a.parentNode.classList.contains(ancestorsClass)) {
            return a.parentNode
        }
        a = a.parentNode;
    }
    return false
}