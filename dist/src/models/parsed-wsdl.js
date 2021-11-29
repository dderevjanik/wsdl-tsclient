"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedWsdl = void 0;
var sanitize_filename_1 = __importDefault(require("sanitize-filename"));
var logger_1 = require("../utils/logger");
var defaultOptions = {
    caseInsensitiveNames: false,
    maxStack: 9999,
    maxStackWarn: 9999,
};
var ParsedWsdl = /** @class */ (function () {
    function ParsedWsdl(options) {
        this.definitions = [];
        this.ports = [];
        this.services = [];
        this._options = __assign(__assign({}, defaultOptions), options);
        this._warns = [];
    }
    /** Find definition by it's name */
    ParsedWsdl.prototype.findDefinition = function (definitionName) {
        return this.definitions.find(function (def) { return def.name === definitionName; });
    };
    /**
     * To make every definition's name unique.
     * If definition with same name exists, suffix it with incremented number
     */
    ParsedWsdl.prototype.findNonCollisionDefinitionName = function (defName, prefix, suffix) {
        var definitionName = (0, sanitize_filename_1.default)(defName);
        var isInSensitive = this._options.caseInsensitiveNames;
        var completeDef = "".concat(prefix).concat(definitionName).concat(suffix);
        var defNameToCheck = isInSensitive ? completeDef.toLowerCase() : completeDef;
        if (!this.definitions.find(function (def) {
            return isInSensitive ? def.name.toLowerCase() === defNameToCheck : def.name === defNameToCheck;
        })) {
            return defNameToCheck;
        }
        var _loop_1 = function (i) {
            if (!this_1.definitions.find(function (def) {
                return isInSensitive
                    ? def.name.toLowerCase() === "".concat(defNameToCheck).concat(i).toLowerCase()
                    : def.name === "".concat(defNameToCheck).concat(i);
            })) {
                return { value: "".concat(defNameToCheck).concat(i) };
            }
            if (i == this_1._options.maxStackWarn && !this_1._warns.includes(defNameToCheck)) {
                logger_1.Logger.warn("Too many definition with same name \"".concat(defNameToCheck, "\""));
                this_1._warns.push(defNameToCheck);
            }
        };
        var this_1 = this;
        for (var i = 1; i < this._options.maxStack; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        throw new Error("Out of stack (".concat(this._options.maxStack, ") for \"").concat(defNameToCheck, "\", there's probably cyclic definition. You can also try to increase maxStack with --TODO option"));
    };
    return ParsedWsdl;
}());
exports.ParsedWsdl = ParsedWsdl;
//# sourceMappingURL=parsed-wsdl.js.map