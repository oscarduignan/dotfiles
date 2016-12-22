"use strict";
(function (OsType) {
    OsType[OsType["Windows"] = 1] = "Windows";
    OsType[OsType["Linux"] = 2] = "Linux";
    OsType[OsType["Mac"] = 3] = "Mac";
})(exports.OsType || (exports.OsType = {}));
var OsType = exports.OsType;
;
(function (SettingType) {
    SettingType[SettingType["Settings"] = 1] = "Settings";
    SettingType[SettingType["Launch"] = 2] = "Launch";
    SettingType[SettingType["KeyBindings"] = 3] = "KeyBindings";
    SettingType[SettingType["Locale"] = 4] = "Locale";
    SettingType[SettingType["Extensions"] = 5] = "Extensions";
})(exports.SettingType || (exports.SettingType = {}));
var SettingType = exports.SettingType;
;
//# sourceMappingURL=enums.js.map