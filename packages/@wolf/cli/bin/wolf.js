'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var joi = _interopDefault(require('@hapi/joi'));
var program = _interopDefault(require('commander'));
var assert = _interopDefault(require('assert'));
var chalk = _interopDefault(require('chalk'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var __assign = function () {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function camelize(path) {
    return path.replace(/(?:[-])(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : c;
    });
}
function createSchema(fn) {
    return fn(joi);
}
function tuple() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args;
}

function error(msg) {
    if (msg) {
        assert.fail(chalk.red("[@wolf/invoke] " + chalk.red(msg)));
    }
}

var defaultArgs = {
    type: 'single',
    language: 'ts',
    preprocessor: 'scss',
};
var typeValue = tuple('s', 'single', 'n', 'nest', 'sd', 'single-dynamic', 'nd', 'nest-dynamic');
var languageValue = tuple('js', 'jsx', 'ts', 'tsx');
var preprocessorValue = tuple('css', 'less', 'sass', 'scss');
function validate(args) {
    var schema = createSchema(function (joi) {
        var _a, _b, _c;
        return joi.object({
            type: (_a = joi.string()).valid.apply(_a, typeValue),
            language: (_b = joi.string()).valid.apply(_b, languageValue),
            preprocessor: (_c = joi.string()).valid.apply(_c, preprocessorValue),
        });
    });
    var _error = schema.validate(args).error;
    error(_error === null || _error === void 0 ? void 0 : _error.message);
}
function generateFiles(name, args) {
    var files = [];
    var dirName = '';
    var type = args.type, language = args.language, preprocessor = args.preprocessor;
    if (type === 'n' || type === 'nest') {
        dirName = name;
    }
    else if (type === 'nest-dynamic' || type === 'nd') {
        dirName = "_" + name;
    }
    else if (type === 'single-dynamic' || type === 'sd') {
        dirName = '_index';
    }
    else {
        dirName = 'index';
    }
    files.push(dirName + "." + language);
    files.push("index." + preprocessor);
    return {
        dirName: dirName,
        files: files,
    };
}
var indentifier = {
    command: 'generate <directory-name>',
    description: 'generate a new directory which contains the defaultPage and the defaultStyle',
    options: [
        {
            flag: 't',
            details: 'type <route-type>',
            desc: 'route type s(single) n(nest) sd(single-dynamic) nd(nest-dynamic)',
            default: 'single',
        },
        {
            flag: 'l',
            details: 'language <language-ext>',
            desc: 'javascript language (js jsx ts tsx)',
            default: 'ts',
        },
        {
            flag: 'p',
            details: 'preprocessor <preprocessor-ext>',
            desc: 'css preprocessor (less sass scss css)',
            default: 'scss',
        },
    ],
    action: function (name, cmd, args) {
        args = __assign(__assign({}, defaultArgs), args);
        validate(args);
        var _a = generateFiles(name, args);
    },
};

function cleanArgs(cmd) {
    var args = {};
    cmd.options.forEach(function (o) {
        var key = camelize(o.long.replace(/^--/, ''));
        if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
            args[key] = cmd[key];
        }
    });
    return args;
}
function generateCommander() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function () {
        var _loop_1 = function (command, description, options, action) {
            var com = program.command(command).description(description);
            for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                var _a = options_1[_i], flag = _a.flag, details = _a.details, desc = _a.desc, defaultValue = _a.default;
                com.option("-" + flag + ", --" + details + ", " + desc + "s, " + defaultValue);
            }
            com.action(function (name, cmd) {
                var args = cleanArgs(cmd);
                action(name, cmd, args);
            });
        };
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var _a = args_1[_i], command = _a.command, description = _a.description, options = _a.options, action = _a.action;
            _loop_1(command, description, options, action);
        }
        program.parse(process.argv);
    };
}
var Commanders = generateCommander(indentifier);

Commanders();
