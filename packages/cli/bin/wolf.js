'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var program = _interopDefault(require('commander'));

var indentifier = {
    command: 'generate <directory-name>',
    description: 'generate a new directory which contains the defaultPage and the defaultStyle',
    options: [
        {
            flag: 't',
            details: 'type <route-type>',
            desc: 'route type (single nest single-dynamic nest-dynamic)',
            default: 'single',
        },
        {
            flag: 'l',
            details: 'language <language-ext>',
            desc: 'javascript language (js or ts)',
            default: 'ts',
        },
        {
            flag: 'p',
            details: 'preprocessor <preprocessor-ext>',
            desc: 'css preprocessor (less sass scss css)',
            default: 'scss',
        },
    ],
};

function generateCommander() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function () {
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var _a = args_1[_i], command = _a.command, description = _a.description, options = _a.options;
            var com = program.command(command).description(description);
            for (var _b = 0, options_1 = options; _b < options_1.length; _b++) {
                var _c = options_1[_b], flag = _c.flag, details = _c.details, desc = _c.desc, defaultValue = _c.default;
                com.option("-" + flag + ", --" + details + ", " + desc + ", " + defaultValue);
            }
        }
        program.parse(process.argv);
    };
}
var Commanders = generateCommander(indentifier);

Commanders();
