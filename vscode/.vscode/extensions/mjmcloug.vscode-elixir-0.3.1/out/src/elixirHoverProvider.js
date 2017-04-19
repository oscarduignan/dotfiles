"use strict";
var ElixirHoverProvider = (function () {
    function ElixirHoverProvider(server) {
        this.server = server;
    }
    ElixirHoverProvider.prototype.provideHover = function (document, position, token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.server.getDocumentation(document, position, function (hover) {
                if (!token.isCancellationRequested) {
                    resolve(hover);
                }
                else {
                    console.error('rejecting');
                    reject();
                }
            });
        });
    };
    return ElixirHoverProvider;
}());
exports.ElixirHoverProvider = ElixirHoverProvider;
//# sourceMappingURL=elixirHoverProvider.js.map