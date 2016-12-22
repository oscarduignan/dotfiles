"use strict";
//"use strict";
const environmentPath_1 = require('./environmentPath');
class LocalSetting {
    constructor() {
        this.Token = null;
        this.Gist = null;
        this.lastUpload = null;
        this.firstTime = true; // to open the toturial first time when used any command.
        this.autoDownload = false;
        this.autoUpload = false;
        this.allowUpload = true;
        this.lastDownload = null;
        this.Version = null;
        this.showSummary = true;
        this.publicGist = false;
        this.forceDownload = false;
        this.openLinks = true;
        this.Version = environmentPath_1.Environment.CURRENT_VERSION;
    }
}
exports.LocalSetting = LocalSetting;
class CloudSetting {
    constructor() {
        this.lastUpload = null;
    }
}
exports.CloudSetting = CloudSetting;
//# sourceMappingURL=setting.js.map