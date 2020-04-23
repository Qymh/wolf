'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var shared = require('@wolf/shared');
var assert = _interopDefault(require('assert'));
var path = _interopDefault(require('path'));
var Config = _interopDefault(require('webpack-chain'));

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
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (_)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function error(msg) {
    if (msg) {
        assert.fail(shared.chalk.red("[@wolf/invoke] " + shared.chalk.red(msg)));
    }
}

var typeValue = shared.tuple('s', 'single', 'n', 'nest', 'sd', 'single-dynamic', 'nd', 'nest-dynamic');
var languageValue = shared.tuple('js', 'jsx', 'ts', 'tsx', 'vue');
var preprocessorValue = shared.tuple('css', 'less', 'sass', 'scss');
function validate(args) {
    var schema = shared.createSchema(function (joi) {
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
function getFileName(name, args) {
    var fileName = '';
    var type = args.type;
    if (type === 'n' || type === 'nest') {
        fileName = name;
    }
    else if (type === 'nest-dynamic' || type === 'nd') {
        fileName = "_" + name;
    }
    else if (type === 'single-dynamic' || type === 'sd') {
        fileName = '_index';
    }
    else {
        fileName = 'index';
    }
    return fileName;
}
function outputFiles(name, fileName, config) {
    return __awaiter(this, void 0, void 0, function () {
        function writeFiles() {
            shared.fs.mkdirSync(realDir);
            var mainFile = path.resolve(realDir, fileName + "." + language);
            var mainCss = path.resolve(realDir, "index." + preprocessor);
            var base = template[language](name, preprocessor);
            shared.fs.outputFileSync(mainFile, base);
            if (language !== 'vue') {
                shared.fs.outputFileSync(mainCss, '');
            }
        }
        var _a, dir, language, preprocessor, template, realDir;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = config.cli.generate, dir = _a.dir, language = _a.language, preprocessor = _a.preprocessor, template = _a.template;
                    realDir = path.resolve(dir, name);
                    if (!shared.fs.existsSync(realDir)) return [3, 2];
                    return [4, shared.inquirer
                            .prompt({
                            name: 'overrideDir',
                            type: 'confirm',
                            message: shared.chalk.blue(realDir) + " is existed, are you sure to override it?",
                        })
                            .then(function (res) {
                            if (!res.overrideDir) {
                                process.exit();
                            }
                            else {
                                shared.fs.removeSync(realDir);
                                writeFiles();
                            }
                        })];
                case 1:
                    _b.sent();
                    return [3, 3];
                case 2:
                    writeFiles();
                    _b.label = 3;
                case 3: return [2];
            }
        });
    });
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
            desc: 'javascript language (js jsx ts tsx vue)',
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
        return __awaiter(this, void 0, void 0, function () {
            var config, _a, type, language, preprocessor, fileName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        config = shared.getConfig();
                        _a = config.cli.generate, type = _a.type, language = _a.language, preprocessor = _a.preprocessor;
                        args = __assign({ type: type, language: language, preprocessor: preprocessor }, args);
                        validate(args);
                        config.cli.generate = __assign(__assign({}, config.cli.generate), args);
                        fileName = getFileName(name, args);
                        return [4, outputFiles(name, fileName, config)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    },
};

var getDefaultChainWebpack = function (config) {
    config.entry('main').add(path.resolve(process.cwd(), 'src/main.js'));
    config.output
        .path(path.resolve(process.cwd(), 'dist'))
        .filename('[name.js]')
        .publicPath('/');
    config.resolve.alias.set('@', path.resolve(process.cwd(), 'dist'));
    config.resolve.extensions
        .add('js')
        .add('jsx')
        .add('ts')
        .add('tsx')
        .add('vue');
    config.module
        .rule('babel')
        .test(/\.[j|t]sx?$/)
        .use('babe')
        .loader('babel-loader')
        .options({
        exclude: /node_modules/,
    });
    config.module
        .rule('vue')
        .test(/\.vue$/)
        .use('vue')
        .loader('vue-loader');
    config.module
        .rule('css')
        .test(/\.css$/)
        .use('css')
        .loader('vue-style-loader')
        .loader('css-loader');
    config.module
        .rule('scss')
        .test(/\.s[a|c]ss$/)
        .use('scss')
        .loader('sass-loader')
        .loader('vue-style-loader')
        .loader('css-loader');
    config.module
        .rule('images')
        .test(/\.(png|jpe?g|gif|webp)$/i)
        .use('images')
        .loader('url-loader')
        .options({
        limit: 4096,
        fallback: {
            loader: 'file-loader',
            options: {
                name: 'images/[name].[hash:8].[ext]',
            },
        },
    });
    config.module
        .rule('media')
        .test(/\.(png|jpe?g|gif|webp)$/i)
        .use('media')
        .loader('url-loader')
        .options({
        limit: 4096,
        fallback: {
            loader: 'file-loader',
            options: {
                name: 'media/[name].[hash:8].[ext]',
            },
        },
    });
    config.module
        .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)$/i)
        .use('fonts')
        .loader('url-loader')
        .options({
        limit: 4096,
        fallback: {
            loader: 'file-loader',
            options: {
                name: 'fonts/[name].[hash:8].[ext]',
            },
        },
    });
    config.plugin('vue').use(require('vue-loader').VueLoaderPlugin);
    config.plugin('define').use(require('webpack').DefinePlugin, [
        {
            process: {
                env: {
                    NODE_ENV: JSON.stringify('development'),
                },
            },
        },
    ]);
    config.plugin('html').use(require('html-webpack-plugin'), [
        {
            template: path.resolve(process.cwd(), 'public/index.html'),
        },
    ]);
    config.plugin('css').use(require('mini-css-extract-plugin'), [
        {
            filename: '[name].css',
        },
    ]);
};
function callChainConfig(config) {
    var chainConfig = new Config();
    getDefaultChainWebpack(chainConfig);
    config.cli.serve.chainWebpack(chainConfig);
    normalizeConfig(chainConfig);
}
function normalizeConfig(chainConfig) {
    var mainEntry = chainConfig.entry('main').values();
    var last = mainEntry[mainEntry.length - 1];
    chainConfig.entry('main').clear().add(last);
}
var indentifier$1 = {
    command: 'serve [entry]',
    description: 'start a development server to run the app',
    options: [],
    action: function (entry, cmd, args) {
        var config = shared.getConfig();
        callChainConfig(config);
    },
};

function cleanArgs(cmd) {
    var args = {};
    cmd.options.forEach(function (o) {
        var key = shared.camelize(o.long.replace(/^--/, ''));
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
            var com = shared.program.command(command).description(description);
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
        shared.program.parse(process.argv);
    };
}
var Commanders = generateCommander(indentifier, indentifier$1);

Commanders();
