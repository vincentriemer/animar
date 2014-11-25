/* @flow */

var Animation = function(element: HTMLElement, attribute: string, start: number, end: number, duration: number, ease: Function ) {
    this.element = element;
    this.attribute = attribute;
    this.start = start;
    this.end = end;
    this.duration = duration; // in frames
    this.ease = ease;
};

module.exports = Animation;