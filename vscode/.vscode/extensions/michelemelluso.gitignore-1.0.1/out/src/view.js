"use strict";
var StatusBarView = (function () {
    function StatusBarView(statusBarItem) {
        this._statusBarItem = statusBarItem;
    }
    ;
    StatusBarView.prototype.refresh = function (text) {
        this._statusBarItem.text = 'Pippo';
        this._statusBarItem.tooltip = 'Pippo 2';
        this._statusBarItem.command = 'extension.sayHello';
        this._statusBarItem.show();
    };
    StatusBarView.prototype.dispose = function () {
    };
    return StatusBarView;
}());
exports.StatusBarView = StatusBarView;
//# sourceMappingURL=view.js.map