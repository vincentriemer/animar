/**
 * Created by vincentriemer on 11/23/14.
 * @flow
 */

var Helper = {
    isElement: function(o: any): boolean{
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    }
};

module.exports = Helper;