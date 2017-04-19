"use strict";
var ElixirAutocomplete = (function () {
    function ElixirAutocomplete(elixirServer) {
        this.elixirServer = elixirServer;
    }
    ElixirAutocomplete.prototype.provideCompletionItems = function (document, position, token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.elixirServer.getCompletions(document, position, function (result) {
                if (!token.isCancellationRequested) {
                    resolve(result);
                }
                else {
                    console.error('rejecting');
                    reject();
                }
            });
        });
    };
    return ElixirAutocomplete;
}());
exports.ElixirAutocomplete = ElixirAutocomplete;
//# sourceMappingURL=elixirAutocomplete.js.map