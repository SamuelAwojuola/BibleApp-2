Element.prototype.lastOfType = function (selector) {
    const elements = this.querySelectorAll(selector);
    return elements.length ? elements[elements.length - 1] : null;
};
Element.prototype.firstOfType = function (selector) {
    const element = this.querySelector(selector);
    return element;
};