#!/usr/bin/env node
import{createRequire as _cr}from'module';import{fileURLToPath as _fu}from'url';import{dirname as _dn}from'path';const require=_cr(import.meta.url),__filename=_fu(import.meta.url),__dirname=_dn(_fu(import.meta.url));
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/commander/lib/error.js
var require_error = __commonJS({
  "../../node_modules/commander/lib/error.js"(exports) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports.CommanderError = CommanderError2;
    exports.InvalidArgumentError = InvalidArgumentError2;
  }
});

// ../../node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "../../node_modules/commander/lib/argument.js"(exports) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.endsWith("...")) {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _collectValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        previous.push(value);
        return previous;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._collectValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports.Argument = Argument2;
    exports.humanReadableArgName = humanReadableArgName;
  }
});

// ../../node_modules/commander/lib/help.js
var require_help = __commonJS({
  "../../node_modules/commander/lib/help.js"(exports) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.minWidthToWrap = 40;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
       * and just before calling `formatHelp()`.
       *
       * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
       *
       * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
       */
      prepareContext(contextOptions) {
        this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleSubcommandTerm(helper.subcommandTerm(command))
            )
          );
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleArgumentTerm(helper.argumentTerm(argument))
            )
          );
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (option.description) {
            return `${option.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return argument.description;
      }
      /**
       * Format a list of items, given a heading and an array of formatted items.
       *
       * @param {string} heading
       * @param {string[]} items
       * @param {Help} helper
       * @returns string[]
       */
      formatItemList(heading, items, helper) {
        if (items.length === 0) return [];
        return [helper.styleTitle(heading), ...items, ""];
      }
      /**
       * Group items by their help group heading.
       *
       * @param {Command[] | Option[]} unsortedItems
       * @param {Command[] | Option[]} visibleItems
       * @param {Function} getGroup
       * @returns {Map<string, Command[] | Option[]>}
       */
      groupItems(unsortedItems, visibleItems, getGroup) {
        const result = /* @__PURE__ */ new Map();
        unsortedItems.forEach((item) => {
          const group = getGroup(item);
          if (!result.has(group)) result.set(group, []);
        });
        visibleItems.forEach((item) => {
          const group = getGroup(item);
          if (!result.has(group)) {
            result.set(group, []);
          }
          result.get(group).push(item);
        });
        return result;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth ?? 80;
        function callFormatItem(term, description) {
          return helper.formatItem(term, termWidth, description, helper);
        }
        let output = [
          `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
          ""
        ];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.boxWrap(
              helper.styleCommandDescription(commandDescription),
              helpWidth
            ),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return callFormatItem(
            helper.styleArgumentTerm(helper.argumentTerm(argument)),
            helper.styleArgumentDescription(helper.argumentDescription(argument))
          );
        });
        output = output.concat(
          this.formatItemList("Arguments:", argumentList, helper)
        );
        const optionGroups = this.groupItems(
          cmd.options,
          helper.visibleOptions(cmd),
          (option) => option.helpGroupHeading ?? "Options:"
        );
        optionGroups.forEach((options, group) => {
          const optionList = options.map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          output = output.concat(this.formatItemList(group, optionList, helper));
        });
        if (helper.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          output = output.concat(
            this.formatItemList("Global Options:", globalOptionList, helper)
          );
        }
        const commandGroups = this.groupItems(
          cmd.commands,
          helper.visibleCommands(cmd),
          (sub) => sub.helpGroup() || "Commands:"
        );
        commandGroups.forEach((commands, group) => {
          const commandList = commands.map((sub) => {
            return callFormatItem(
              helper.styleSubcommandTerm(helper.subcommandTerm(sub)),
              helper.styleSubcommandDescription(helper.subcommandDescription(sub))
            );
          });
          output = output.concat(this.formatItemList(group, commandList, helper));
        });
        return output.join("\n");
      }
      /**
       * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
       *
       * @param {string} str
       * @returns {number}
       */
      displayWidth(str2) {
        return stripColor(str2).length;
      }
      /**
       * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
       *
       * @param {string} str
       * @returns {string}
       */
      styleTitle(str2) {
        return str2;
      }
      styleUsage(str2) {
        return str2.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word === "[command]") return this.styleSubcommandText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleCommandText(word);
        }).join(" ");
      }
      styleCommandDescription(str2) {
        return this.styleDescriptionText(str2);
      }
      styleOptionDescription(str2) {
        return this.styleDescriptionText(str2);
      }
      styleSubcommandDescription(str2) {
        return this.styleDescriptionText(str2);
      }
      styleArgumentDescription(str2) {
        return this.styleDescriptionText(str2);
      }
      styleDescriptionText(str2) {
        return str2;
      }
      styleOptionTerm(str2) {
        return this.styleOptionText(str2);
      }
      styleSubcommandTerm(str2) {
        return str2.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleSubcommandText(word);
        }).join(" ");
      }
      styleArgumentTerm(str2) {
        return this.styleArgumentText(str2);
      }
      styleOptionText(str2) {
        return str2;
      }
      styleArgumentText(str2) {
        return str2;
      }
      styleSubcommandText(str2) {
        return str2;
      }
      styleCommandText(str2) {
        return str2;
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
       *
       * @param {string} str
       * @returns {boolean}
       */
      preformatted(str2) {
        return /\n[^\S\r\n]/.test(str2);
      }
      /**
       * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
       *
       * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
       *   TTT  DDD DDDD
       *        DD DDD
       *
       * @param {string} term
       * @param {number} termWidth
       * @param {string} description
       * @param {Help} helper
       * @returns {string}
       */
      formatItem(term, termWidth, description, helper) {
        const itemIndent = 2;
        const itemIndentStr = " ".repeat(itemIndent);
        if (!description) return itemIndentStr + term;
        const paddedTerm = term.padEnd(
          termWidth + term.length - helper.displayWidth(term)
        );
        const spacerWidth = 2;
        const helpWidth = this.helpWidth ?? 80;
        const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
        let formattedDescription;
        if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
          formattedDescription = description;
        } else {
          const wrappedDescription = helper.boxWrap(description, remainingWidth);
          formattedDescription = wrappedDescription.replace(
            /\n/g,
            "\n" + " ".repeat(termWidth + spacerWidth)
          );
        }
        return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
      }
      /**
       * Wrap a string at whitespace, preserving existing line breaks.
       * Wrapping is skipped if the width is less than `minWidthToWrap`.
       *
       * @param {string} str
       * @param {number} width
       * @returns {string}
       */
      boxWrap(str2, width) {
        if (width < this.minWidthToWrap) return str2;
        const rawLines = str2.split(/\r\n|\n/);
        const chunkPattern = /[\s]*[^\s]+/g;
        const wrappedLines = [];
        rawLines.forEach((line) => {
          const chunks = line.match(chunkPattern);
          if (chunks === null) {
            wrappedLines.push("");
            return;
          }
          let sumChunks = [chunks.shift()];
          let sumWidth = this.displayWidth(sumChunks[0]);
          chunks.forEach((chunk) => {
            const visibleWidth = this.displayWidth(chunk);
            if (sumWidth + visibleWidth <= width) {
              sumChunks.push(chunk);
              sumWidth += visibleWidth;
              return;
            }
            wrappedLines.push(sumChunks.join(""));
            const nextChunk = chunk.trimStart();
            sumChunks = [nextChunk];
            sumWidth = this.displayWidth(nextChunk);
          });
          wrappedLines.push(sumChunks.join(""));
        });
        return wrappedLines.join("\n");
      }
    };
    function stripColor(str2) {
      const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
      return str2.replace(sgrPattern, "");
    }
    exports.Help = Help2;
    exports.stripColor = stripColor;
  }
});

// ../../node_modules/commander/lib/option.js
var require_option = __commonJS({
  "../../node_modules/commander/lib/option.js"(exports) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
        this.helpGroupHeading = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _collectValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        previous.push(value);
        return previous;
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._collectValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as an object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        if (this.negate) {
          return camelcase(this.name().replace(/^no-/, ""));
        }
        return camelcase(this.name());
      }
      /**
       * Set the help group heading.
       *
       * @param {string} heading
       * @return {Option}
       */
      helpGroup(heading) {
        this.helpGroupHeading = heading;
        return this;
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str2) {
      return str2.split("-").reduce((str3, word) => {
        return str3 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const shortFlagExp = /^-[^-]$/;
      const longFlagExp = /^--[^-]/;
      const flagParts = flags.split(/[ |,]+/).concat("guard");
      if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
      if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
      if (!shortFlag && shortFlagExp.test(flagParts[0]))
        shortFlag = flagParts.shift();
      if (!shortFlag && longFlagExp.test(flagParts[0])) {
        shortFlag = longFlag;
        longFlag = flagParts.shift();
      }
      if (flagParts[0].startsWith("-")) {
        const unsupportedFlag = flagParts[0];
        const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
        if (/^-[^-][^-]/.test(unsupportedFlag))
          throw new Error(
            `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
          );
        if (shortFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many short flags`);
        if (longFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many long flags`);
        throw new Error(`${baseError}
- unrecognised flag format`);
      }
      if (shortFlag === void 0 && longFlag === void 0)
        throw new Error(
          `option creation failed due to no flags found in '${flags}'.`
        );
      return { shortFlag, longFlag };
    }
    exports.Option = Option2;
    exports.DualOptions = DualOptions;
  }
});

// ../../node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "../../node_modules/commander/lib/suggestSimilar.js"(exports) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports.suggestSimilar = suggestSimilar;
  }
});

// ../../node_modules/commander/lib/command.js
var require_command = __commonJS({
  "../../node_modules/commander/lib/command.js"(exports) {
    var EventEmitter = __require("node:events").EventEmitter;
    var childProcess = __require("node:child_process");
    var path = __require("node:path");
    var fs = __require("node:fs");
    var process2 = __require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2, stripColor } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = false;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._savedState = null;
        this._outputConfiguration = {
          writeOut: (str2) => process2.stdout.write(str2),
          writeErr: (str2) => process2.stderr.write(str2),
          outputError: (str2, write) => write(str2),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
          getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
          stripColor: (str2) => stripColor(str2)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
        this._helpGroupHeading = void 0;
        this._defaultCommandGroup = void 0;
        this._defaultOptionGroup = void 0;
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // change how output being written, defaults to stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // change how output being written for errors, defaults to writeErr
       *     outputError(str, write) // used for displaying errors and not used for displaying help
       *     // specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // color support, currently only used with Help
       *     getOutHasColors()
       *     getErrHasColors()
       *     stripColor() // used to remove ANSI escape codes if output does not have colors
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        this._outputConfiguration = {
          ...this._outputConfiguration,
          ...configuration
        };
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom argument processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, parseArg, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof parseArg === "function") {
          argument.default(defaultValue).argParser(parseArg);
        } else {
          argument.default(parseArg);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument?.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          if (enableOrNameAndArgs && this._defaultCommandGroup) {
            this._initCommandGroup(this._getHelpCommand());
          }
          return this;
        }
        const nameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        if (enableOrNameAndArgs || description) this._initCommandGroup(helpCommand);
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        this._initCommandGroup(helpCommand);
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this._initOptionGroup(option);
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this._initCommandGroup(command);
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._collectValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process2.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process2.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process2.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      _prepareForParse() {
        if (this._savedState === null) {
          this.saveStateBeforeParse();
        } else {
          this.restoreStateBeforeParse();
        }
      }
      /**
       * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state saved.
       */
      saveStateBeforeParse() {
        this._savedState = {
          // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
          _name: this._name,
          // option values before parse have default values (including false for negated options)
          // shallow clones
          _optionValues: { ...this._optionValues },
          _optionValueSources: { ...this._optionValueSources }
        };
      }
      /**
       * Restore state before parse for calls after the first.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state restored.
       */
      restoreStateBeforeParse() {
        if (this._storeOptionsAsProperties)
          throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
        this._name = this._savedState._name;
        this._scriptPath = null;
        this.rawArgs = [];
        this._optionValues = { ...this._savedState._optionValues };
        this._optionValueSources = { ...this._savedState._optionValueSources };
        this.args = [];
        this.processedArgs = [];
      }
      /**
       * Throw if expected executable is missing. Add lots of help for author.
       *
       * @param {string} executableFile
       * @param {string} executableDir
       * @param {string} subcommandName
       */
      _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
        if (fs.existsSync(executableFile)) return;
        const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs.realpathSync(this._scriptPath);
          } catch {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(
            path.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(
              this._scriptPath,
              path.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          this._checkForMissingExecutable(
            executableFile,
            executableDir,
            subcommand._name
          );
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process2.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            this._checkForMissingExecutable(
              executableFile,
              executableDir,
              subcommand._name
            );
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        subCommand._prepareForParse();
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise?.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent?.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Side effects: modifies command by storing options. Does not reset state if called again.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} args
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(args) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        const negativeNumberArg = (arg) => {
          if (!/^-(\d+|\d*\.\d+)(e[+-]?\d+)?$/.test(arg)) return false;
          return !this._getCommandAndAncestors().some(
            (cmd) => cmd.options.map((opt) => opt.short).some((short) => /^-\d$/.test(short))
          );
        };
        let activeVariadicOption = null;
        let activeGroup = null;
        let i = 0;
        while (i < args.length || activeGroup) {
          const arg = activeGroup ?? args[i++];
          activeGroup = null;
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args.slice(i));
            break;
          }
          if (activeVariadicOption && (!maybeOption(arg) || negativeNumberArg(arg))) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args[i++];
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (i < args.length && (!maybeOption(args[i]) || negativeNumberArg(args[i]))) {
                  value = args[i++];
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                activeGroup = `-${arg.slice(2)}`;
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (dest === operands && maybeOption(arg) && !(this.commands.length === 0 && negativeNumberArg(arg))) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              unknown.push(...args.slice(i));
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg, ...args.slice(i));
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg, ...args.slice(i));
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg, ...args.slice(i));
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str2, flags, description) {
        if (str2 === void 0) return this._version;
        this._version = str2;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str2}
`);
          this._exit(0, "commander.version", str2);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str2, argsDescription) {
        if (str2 === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str2;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str2) {
        if (str2 === void 0) return this._summary;
        this._summary = str2;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str2) {
        if (str2 === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str2;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str2) {
        if (str2 === void 0) return this._name;
        this._name = str2;
        return this;
      }
      /**
       * Set/get the help group heading for this subcommand in parent command's help.
       *
       * @param {string} [heading]
       * @return {Command | string}
       */
      helpGroup(heading) {
        if (heading === void 0) return this._helpGroupHeading ?? "";
        this._helpGroupHeading = heading;
        return this;
      }
      /**
       * Set/get the default help group heading for subcommands added to this command.
       * (This does not override a group set directly on the subcommand using .helpGroup().)
       *
       * @example
       * program.commandsGroup('Development Commands:);
       * program.command('watch')...
       * program.command('lint')...
       * ...
       *
       * @param {string} [heading]
       * @returns {Command | string}
       */
      commandsGroup(heading) {
        if (heading === void 0) return this._defaultCommandGroup ?? "";
        this._defaultCommandGroup = heading;
        return this;
      }
      /**
       * Set/get the default help group heading for options added to this command.
       * (This does not override a group set directly on the option using .helpGroup().)
       *
       * @example
       * program
       *   .optionsGroup('Development Options:')
       *   .option('-d, --debug', 'output extra debugging')
       *   .option('-p, --profile', 'output profiling information')
       *
       * @param {string} [heading]
       * @returns {Command | string}
       */
      optionsGroup(heading) {
        if (heading === void 0) return this._defaultOptionGroup ?? "";
        this._defaultOptionGroup = heading;
        return this;
      }
      /**
       * @param {Option} option
       * @private
       */
      _initOptionGroup(option) {
        if (this._defaultOptionGroup && !option.helpGroupHeading)
          option.helpGroup(this._defaultOptionGroup);
      }
      /**
       * @param {Command} cmd
       * @private
       */
      _initCommandGroup(cmd) {
        if (this._defaultCommandGroup && !cmd.helpGroup())
          cmd.helpGroup(this._defaultCommandGroup);
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path2) {
        if (path2 === void 0) return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        const context = this._getOutputContext(contextOptions);
        helper.prepareContext({
          error: context.error,
          helpWidth: context.helpWidth,
          outputHasColors: context.hasColors
        });
        const text = helper.formatHelp(this, helper);
        if (context.hasColors) return text;
        return this._outputConfiguration.stripColor(text);
      }
      /**
       * @typedef HelpContext
       * @type {object}
       * @property {boolean} error
       * @property {number} helpWidth
       * @property {boolean} hasColors
       * @property {function} write - includes stripColor if needed
       *
       * @returns {HelpContext}
       * @private
       */
      _getOutputContext(contextOptions) {
        contextOptions = contextOptions || {};
        const error = !!contextOptions.error;
        let baseWrite;
        let hasColors;
        let helpWidth;
        if (error) {
          baseWrite = (str2) => this._outputConfiguration.writeErr(str2);
          hasColors = this._outputConfiguration.getErrHasColors();
          helpWidth = this._outputConfiguration.getErrHelpWidth();
        } else {
          baseWrite = (str2) => this._outputConfiguration.writeOut(str2);
          hasColors = this._outputConfiguration.getOutHasColors();
          helpWidth = this._outputConfiguration.getOutHelpWidth();
        }
        const write = (str2) => {
          if (!hasColors) str2 = this._outputConfiguration.stripColor(str2);
          return baseWrite(str2);
        };
        return { error, write, hasColors, helpWidth };
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const outputContext = this._getOutputContext(contextOptions);
        const eventContext = {
          error: outputContext.error,
          write: outputContext.write,
          command: this
        };
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
        this.emit("beforeHelp", eventContext);
        let helpInformation = this.helpInformation({ error: outputContext.error });
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        outputContext.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", eventContext);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", eventContext)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            if (this._helpOption === null) this._helpOption = void 0;
            if (this._defaultOptionGroup) {
              this._initOptionGroup(this._getHelpOption());
            }
          } else {
            this._helpOption = null;
          }
          return this;
        }
        this._helpOption = this.createOption(
          flags ?? "-h, --help",
          description ?? "display help for command"
        );
        if (flags || description) this._initOptionGroup(this._helpOption);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        this._initOptionGroup(option);
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = Number(process2.exitCode ?? 0);
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * // Do a little typing to coordinate emit and listener for the help text events.
       * @typedef HelpTextEventContext
       * @type {object}
       * @property {boolean} error
       * @property {Command} command
       * @property {function} write
       */
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function useColor() {
      if (process2.env.NO_COLOR || process2.env.FORCE_COLOR === "0" || process2.env.FORCE_COLOR === "false")
        return false;
      if (process2.env.FORCE_COLOR || process2.env.CLICOLOR_FORCE !== void 0)
        return true;
      return void 0;
    }
    exports.Command = Command2;
    exports.useColor = useColor;
  }
});

// ../../node_modules/commander/index.js
var require_commander = __commonJS({
  "../../node_modules/commander/index.js"(exports) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports.program = new Command2();
    exports.createCommand = (name) => new Command2(name);
    exports.createOption = (flags, description) => new Option2(flags, description);
    exports.createArgument = (name, description) => new Argument2(name, description);
    exports.Command = Command2;
    exports.Option = Option2;
    exports.Argument = Argument2;
    exports.Help = Help2;
    exports.CommanderError = CommanderError2;
    exports.InvalidArgumentError = InvalidArgumentError2;
    exports.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// ../config-center/src/errors.ts
var PluginError;
var init_errors = __esm({
  "../config-center/src/errors.ts"() {
    "use strict";
    PluginError = class extends Error {
      constructor(message, code, exitCode = 1) {
        super(message);
        this.code = code;
        this.exitCode = exitCode;
        this.name = "PluginError";
      }
      code;
      exitCode;
    };
  }
});

// ../config-center/src/config-store.ts
import { readFile, rename, open, unlink } from "fs/promises";
import { chmodSync, existsSync, mkdirSync, statSync } from "fs";
import { randomUUID } from "crypto";
import { dirname, join } from "path";
import { homedir } from "os";
function homeDir() {
  return homedir();
}
function cacheRoot() {
  const override = (process.env[CACHE_DIR_ENV] ?? "").trim();
  return override || join(homeDir(), ".cache", "agent-plugins");
}
function configDir(name) {
  return join(cacheRoot(), name);
}
function configPath(name) {
  return join(configDir(name), "config.json");
}
function pluginFilePath(name, ...segments) {
  return join(configDir(name), ...segments);
}
function permissionsMessage(what, detail) {
  return `Refusing to continue: ${what} is readable by other users and could not be restricted (${detail}). Run 'chmod 700' on the plugin cache directory and 'chmod 600' on its config file.`;
}
function tightenModeSync(path, mode, what) {
  if (!POSIX_MODES) return;
  let current;
  try {
    current = statSync(path);
  } catch (e) {
    if (e.code === "ENOENT") return;
    throw new PluginError(permissionsMessage(what, e.code ?? e.message), "CONFIG_PERMISSIONS");
  }
  if ((current.mode & OTHERS_BITS) === 0) return;
  try {
    chmodSync(path, mode);
  } catch (e) {
    throw new PluginError(permissionsMessage(what, e.code ?? e.message), "CONFIG_PERMISSIONS");
  }
  if ((statSync(path).mode & OTHERS_BITS) !== 0) {
    throw new PluginError(permissionsMessage(what, "the mode did not change"), "CONFIG_PERMISSIONS");
  }
}
function ensurePrivateDirSync(dir) {
  mkdirSync(dir, { recursive: true, mode: 448 });
  tightenModeSync(dir, 448, "the plugin cache directory");
  return dir;
}
function ensurePrivatePluginDirSync(name, ...segments) {
  const dir = ensurePrivateDirSync(configDir(name));
  if (segments.length === 0) return dir;
  return ensurePrivateDirSync(pluginFilePath(name, ...segments));
}
function tightenStoredConfig(name) {
  tightenModeSync(configDir(name), 448, "the plugin cache directory");
  tightenModeSync(configPath(name), 384, "the stored configuration");
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function replaceFile(tmp, path) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await rename(tmp, path);
      return;
    } catch (e) {
      if (!REPLACE_RETRY_CODES.has(e.code) || attempt >= REPLACE_RETRY_LIMIT) {
        await unlink(tmp).catch(() => {
        });
        throw e;
      }
      await delay(5 * 2 ** attempt);
    }
  }
}
async function writePrivateFile(path, data) {
  const tmp = `${path}.tmp-${process.pid}-${randomUUID().slice(0, 8)}`;
  const handle = await open(tmp, "wx", 384);
  try {
    await handle.writeFile(data, "utf-8");
    await handle.sync();
  } catch (e) {
    await handle.close().catch(() => {
    });
    await unlink(tmp).catch(() => {
    });
    throw e;
  }
  await handle.close();
  await replaceFile(tmp, path);
}
async function writePluginFile(name, segments, data) {
  const path = pluginFilePath(name, ...segments);
  ensurePrivateDirSync(dirname(path));
  await writePrivateFile(path, data);
  return path;
}
async function loadConfig(name) {
  const path = configPath(name);
  if (!existsSync(path)) return null;
  tightenStoredConfig(name);
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw new PluginError("Failed to parse config", "CONFIG_INVALID");
  }
}
var CACHE_DIR_ENV, CACHE_DIR, POSIX_MODES, OTHERS_BITS, REPLACE_RETRY_CODES, REPLACE_RETRY_LIMIT;
var init_config_store = __esm({
  "../config-center/src/config-store.ts"() {
    "use strict";
    init_errors();
    CACHE_DIR_ENV = "AGENT_PLUGINS_CACHE_DIR";
    CACHE_DIR = join(homeDir(), ".cache", "agent-plugins");
    POSIX_MODES = process.platform !== "win32";
    OTHERS_BITS = 63;
    REPLACE_RETRY_CODES = /* @__PURE__ */ new Set(["EACCES", "EBUSY", "EPERM"]);
    REPLACE_RETRY_LIMIT = 6;
  }
});

// ../config-center/src/launch-ui.ts
var init_launch_ui = __esm({
  "../config-center/src/launch-ui.ts"() {
    "use strict";
    init_config_store();
    init_errors();
    init_config_store();
  }
});

// ../config-center/src/redact.ts
var init_redact = __esm({
  "../config-center/src/redact.ts"() {
    "use strict";
  }
});

// ../config-center/src/config-flow.ts
var init_config_flow = __esm({
  "../config-center/src/config-flow.ts"() {
    "use strict";
    init_config_store();
    init_redact();
    init_launch_ui();
  }
});

// ../config-center/src/verification.ts
var init_verification = __esm({
  "../config-center/src/verification.ts"() {
    "use strict";
    init_config_store();
    init_redact();
  }
});

// ../config-center/src/bridge.ts
var init_bridge = __esm({
  "../config-center/src/bridge.ts"() {
    "use strict";
    init_config_store();
    init_config_flow();
    init_errors();
  }
});

// ../config-center/src/env-spec.ts
function zentaoFormSpec() {
  return {
    root: "page",
    elements: {
      page: {
        type: "Header",
        props: {
          title: L("ZenTao (zentao-cli)", "\u7985\u9053\uFF08zentao-cli\uFF09"),
          description: L(
            "Credentials for the zentao command-line tool. They are injected as environment variables when config-center runs it; they never pass through the conversation.",
            "zentao \u547D\u4EE4\u884C\u5DE5\u5177\u7684\u767B\u5F55\u51ED\u8BC1\u3002config-center \u4EE3\u4E3A\u6267\u884C\u547D\u4EE4\u65F6\u4EE5\u73AF\u5883\u53D8\u91CF\u6CE8\u5165\uFF0C\u51ED\u8BC1\u4E0D\u7ECF\u8FC7\u5BF9\u8BDD\u3002"
          ),
          configPath: null
        },
        children: ["section-server", "section-credentials", "section-token", "save"]
      },
      "section-server": {
        type: "Section",
        props: {
          title: L("Server", "\u670D\u52A1\u5730\u5740"),
          description: null,
          collapsible: null,
          defaultOpen: true
        },
        children: ["url"]
      },
      url: {
        type: "Field",
        props: {
          label: L("ZenTao URL", "\u7985\u9053\u670D\u52A1\u5730\u5740"),
          type: "text",
          required: true,
          help: L(
            "Base address with the protocol; include the install path when ZenTao does not sit at the domain root.",
            "\u5E26\u534F\u8BAE\u7684\u5B8C\u6574\u5730\u5740\uFF1B\u7985\u9053\u5B89\u88C5\u5728\u5B50\u76EE\u5F55\u65F6\u5E26\u4E0A\u5B8C\u6574\u8DEF\u5F84\u3002"
          ),
          placeholder: "https://zentao.example.com",
          options: null,
          statePath: "url"
        }
      },
      "section-credentials": {
        type: "Section",
        props: {
          title: L("Account", "\u8D26\u53F7"),
          description: L(
            "The account and its password, used to log in automatically.",
            "\u767B\u5F55\u7528\u7684\u8D26\u53F7\u4E0E\u5BC6\u7801\uFF0C\u7531\u5DE5\u5177\u81EA\u52A8\u767B\u5F55\u3002"
          ),
          collapsible: null,
          defaultOpen: true
        },
        children: ["account", "password"]
      },
      account: {
        type: "Field",
        props: {
          label: L("Account", "\u8D26\u53F7"),
          type: "text",
          required: true,
          help: null,
          placeholder: null,
          options: null,
          statePath: "account"
        }
      },
      password: {
        type: "Field",
        props: {
          label: L("Password", "\u5BC6\u7801"),
          type: "password",
          required: false,
          help: L(
            "Leave empty only when an API token is filled below.",
            "\u53EA\u5728\u4E0B\u65B9\u586B\u5199\u4E86 API Token \u65F6\u624D\u7559\u7A7A\u3002"
          ),
          placeholder: null,
          options: null,
          statePath: "password"
        }
      },
      "section-token": {
        type: "Section",
        props: {
          title: L("API token (optional)", "API Token\uFF08\u53EF\u9009\uFF09"),
          description: L(
            "A ready-made token replaces the password; the password field can stay empty.",
            "\u5DF2\u6709\u7684 Token \u53EF\u4EE5\u4EE3\u66FF\u5BC6\u7801\uFF0C\u6B64\u65F6\u5BC6\u7801\u7559\u7A7A\u3002"
          ),
          collapsible: null,
          defaultOpen: false
        },
        children: ["token"]
      },
      token: {
        type: "Field",
        props: {
          label: L("API token", "API Token"),
          type: "password",
          required: false,
          help: null,
          placeholder: null,
          options: null,
          statePath: "token"
        }
      },
      save: { type: "SaveBar", props: { saveLabel: null, resetLabel: null } }
    },
    state: {
      url: "",
      account: "",
      password: "",
      token: ""
    }
  };
}
var L, zentaoEnvSpec;
var init_env_spec = __esm({
  "../config-center/src/env-spec.ts"() {
    "use strict";
    L = (en, zh) => ({ en, zh });
    zentaoEnvSpec = {
      plugin: "zentao",
      command: "zentao",
      env: {
        ZENTAO_URL: "url",
        ZENTAO_ACCOUNT: "account",
        ZENTAO_PASSWORD: "password",
        ZENTAO_TOKEN: "token"
      },
      requiredKeys: ["url", "account"],
      requiredAny: [["password", "token"]],
      formSpec: zentaoFormSpec(),
      reason: "The zentao CLI needs a server address and login credentials before any command can run."
    };
  }
});

// ../config-center/src/sql-output.ts
var init_sql_output = __esm({
  "../config-center/src/sql-output.ts"() {
    "use strict";
  }
});

// ../config-center/src/index.ts
var init_src = __esm({
  "../config-center/src/index.ts"() {
    "use strict";
    init_config_store();
    init_launch_ui();
    init_config_flow();
    init_redact();
    init_verification();
    init_errors();
    init_bridge();
    init_env_spec();
    init_sql_output();
  }
});

// src/config.ts
function defaultSkillsRoot() {
  const home = (process.env.HOME ?? process.env.USERPROFILE ?? "").trim();
  return home === "" ? "" : `${home}/.agents/skills`;
}
async function resolveConfig() {
  let stored = null;
  try {
    stored = await loadConfig(PLUGIN_NAME);
  } catch {
    stored = null;
  }
  const fallback = {
    ...DEFAULT_THRESHOLDS,
    skillsRoot: defaultSkillsRoot(),
    maturity: 100,
    capacity: 20,
    verifyTimeoutMs: 6e4
  };
  if (stored === null) return fallback;
  return {
    activityQuantum: positiveInt(stored.activityQuantum, fallback.activityQuantum),
    repeatCalls: positiveInt(stored.repeatCalls, fallback.repeatCalls),
    errorStreak: positiveInt(stored.errorStreak, fallback.errorStreak),
    errorPattern: nonEmpty(stored.errorPattern, fallback.errorPattern),
    skillsRoot: nonEmpty(stored.skillsRoot, fallback.skillsRoot),
    maturity: positiveInt(stored.maturity, fallback.maturity),
    capacity: positiveInt(stored.capacity, fallback.capacity),
    verifyTimeoutMs: positiveInt(stored.verifyTimeoutMs, fallback.verifyTimeoutMs)
  };
}
function requireSkillsRoot(config) {
  if (config.skillsRoot.trim() === "") {
    throw new Error(
      `no skills root: set "skillsRoot" in ${PLUGIN_NAME}'s config.json to the directory accumulated skills should be installed into`
    );
  }
  return config.skillsRoot;
}
function positiveInt(value, fallback) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}
function nonEmpty(value, fallback) {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}
function failurePattern(config) {
  try {
    return new RegExp(config.errorPattern);
  } catch {
    return new RegExp(DEFAULT_ERROR_PATTERN);
  }
}
var PLUGIN_NAME, STATE_SEGMENTS, TRACE_LIMIT, EMITTED_LIMIT, DEFAULT_ERROR_PATTERN, DEFAULT_THRESHOLDS, DESCRIPTION_MAX_CHARS, VERIFY_COMMAND_MAX_CHARS, FILE_MAX_BYTES, SUBFILE_DIRS;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    init_src();
    PLUGIN_NAME = "dsh-evolve";
    STATE_SEGMENTS = ["state", "sessions"];
    TRACE_LIMIT = 200;
    EMITTED_LIMIT = 50;
    DEFAULT_ERROR_PATTERN = String.raw`^\s*(?:Error|ERROR)\b`;
    DEFAULT_THRESHOLDS = {
      activityQuantum: 20,
      repeatCalls: 2,
      errorStreak: 3,
      errorPattern: DEFAULT_ERROR_PATTERN
    };
    DESCRIPTION_MAX_CHARS = 500;
    VERIFY_COMMAND_MAX_CHARS = 500;
    FILE_MAX_BYTES = 256 * 1024;
    SUBFILE_DIRS = ["scripts", "references", "assets", "templates"];
  }
});

// src/store.ts
var store_exports = {};
__export(store_exports, {
  appendLedger: () => appendLedger,
  archiveDir: () => archiveDir,
  bumpRequests: () => bumpRequests,
  emptySession: () => emptySession,
  listSessionIds: () => listSessionIds,
  loadRegistry: () => loadRegistry,
  loadSession: () => loadSession,
  readLedger: () => readLedger,
  requestCount: () => requestCount,
  retirementCauses: () => retirementCauses,
  saveRegistry: () => saveRegistry,
  saveSession: () => saveSession,
  stateKey: () => stateKey,
  withCall: () => withCall,
  withEmitted: () => withEmitted
});
import { createHash } from "node:crypto";
import { appendFileSync, existsSync as existsSync2, mkdirSync as mkdirSync2, readFileSync, readdirSync } from "node:fs";
function stateKey(sessionId) {
  if (SAFE_ID.test(sessionId)) return sessionId;
  return `h${createHash("sha256").update(sessionId).digest("hex").slice(0, 16)}`;
}
function sessionsDir() {
  return pluginFilePath(PLUGIN_NAME, ...STATE_SEGMENTS);
}
function sessionPath(sessionId) {
  return pluginFilePath(PLUGIN_NAME, ...STATE_SEGMENTS, `${stateKey(sessionId)}.json`);
}
function isTraceEntry(value) {
  if (typeof value !== "object" || value === null) return false;
  const entry = value;
  return typeof entry.tool === "string" && typeof entry.paramsHash === "string" && typeof entry.ok === "boolean";
}
function loadSession(sessionId) {
  const path = sessionPath(sessionId);
  if (!existsSync2(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8"));
    return {
      sessionId,
      cwd: typeof parsed.cwd === "string" ? parsed.cwd : "",
      toolCalls: typeof parsed.toolCalls === "number" ? parsed.toolCalls : 0,
      entries: Array.isArray(parsed.entries) ? parsed.entries.filter(isTraceEntry) : [],
      emitted: Array.isArray(parsed.emitted) ? parsed.emitted.filter((value) => typeof value === "string") : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : ""
    };
  } catch {
    return null;
  }
}
function emptySession(sessionId, cwd) {
  return { sessionId, cwd, toolCalls: 0, entries: [], emitted: [], updatedAt: "" };
}
async function saveSession(state) {
  ensurePrivatePluginDirSync(PLUGIN_NAME, ...STATE_SEGMENTS);
  const bounded = {
    ...state,
    entries: state.entries.slice(-TRACE_LIMIT),
    emitted: state.emitted.slice(-EMITTED_LIMIT),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await writePluginFile(
    PLUGIN_NAME,
    [...STATE_SEGMENTS, `${stateKey(state.sessionId)}.json`],
    `${JSON.stringify(bounded, null, 2)}
`
  );
}
function withCall(state, entry) {
  return { ...state, toolCalls: state.toolCalls + 1, entries: [...state.entries, entry] };
}
function withEmitted(state, signatures) {
  return { ...state, emitted: [...state.emitted, ...signatures] };
}
function listSessionIds() {
  const dir = sessionsDir();
  if (!existsSync2(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith(".json")).map((name) => name.slice(0, -".json".length));
}
function requestsPath() {
  return pluginFilePath(PLUGIN_NAME, "state", "requests");
}
function requestCount() {
  const path = requestsPath();
  if (!existsSync2(path)) return 0;
  const parsed = Number.parseInt(readFileSync(path, "utf-8").trim(), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
async function bumpRequests() {
  const next = requestCount() + 1;
  ensurePrivatePluginDirSync(PLUGIN_NAME, "state");
  await writePluginFile(PLUGIN_NAME, ["state", "requests"], `${next}
`);
  return next;
}
function registryPath() {
  return pluginFilePath(PLUGIN_NAME, "library", "registry.json");
}
function loadRegistry() {
  const path = registryPath();
  if (!existsSync2(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8"));
    const registry = {};
    for (const [name, value] of Object.entries(parsed)) {
      if (typeof value !== "object" || value === null) continue;
      const entry = value;
      registry[name] = {
        anchor: typeof entry.anchor === "number" ? entry.anchor : 0,
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : "",
        use: typeof entry.use === "number" ? entry.use : 0,
        view: typeof entry.view === "number" ? entry.view : 0,
        patches: typeof entry.patches === "number" ? entry.patches : 0,
        path: typeof entry.path === "string" ? entry.path : ""
      };
    }
    return registry;
  } catch {
    return {};
  }
}
async function saveRegistry(registry) {
  ensurePrivatePluginDirSync(PLUGIN_NAME, "library");
  await writePluginFile(PLUGIN_NAME, ["library", "registry.json"], `${JSON.stringify(registry, null, 2)}
`);
}
function ledgerPath() {
  return pluginFilePath(PLUGIN_NAME, "library", "ledger.jsonl");
}
function readLedger() {
  const path = ledgerPath();
  if (!existsSync2(path)) return [];
  const entries = [];
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed.name === "string" && typeof parsed.action === "string") entries.push(parsed);
    } catch {
      continue;
    }
  }
  return entries;
}
function appendLedger(entry) {
  ensurePrivatePluginDirSync(PLUGIN_NAME, "library");
  appendFileSync(ledgerPath(), `${JSON.stringify({ at: (/* @__PURE__ */ new Date()).toISOString(), ...entry })}
`, {
    encoding: "utf-8",
    mode: 384
  });
}
function retirementCauses(entries) {
  const last = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    if (entry.action === "archive" || entry.action === "merge") last.set(entry.name, entry);
  }
  let absorbed = 0;
  let pruned = 0;
  for (const entry of last.values()) {
    if (entry.absorbedInto !== void 0 && entry.absorbedInto !== "") absorbed += 1;
    else pruned += 1;
  }
  return { absorbed, pruned };
}
function archiveDir() {
  const dir = pluginFilePath(PLUGIN_NAME, "library", "archive");
  mkdirSync2(dir, { recursive: true, mode: 448 });
  return dir;
}
var SAFE_ID;
var init_store = __esm({
  "src/store.ts"() {
    "use strict";
    init_src();
    init_config();
    SAFE_ID = /^[A-Za-z0-9_-]+$/;
  }
});

// ../../node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// src/dsh-evolve.ts
init_config();
import { readFileSync as readFileSync3 } from "node:fs";

// src/draft.ts
init_config();
init_store();
init_src();
import { spawnSync } from "node:child_process";
import { cpSync, existsSync as existsSync3, mkdirSync as mkdirSync3, readFileSync as readFileSync2, readdirSync as readdirSync2, rmSync, statSync as statSync2, writeFileSync } from "node:fs";
import { join as join2 } from "node:path";
var SKILL_NAME = /^auto-[a-z0-9]+(?:-[a-z0-9]+)*$/;
var SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
function draftsDir() {
  return pluginFilePath(PLUGIN_NAME, "library", "drafts");
}
function draftDir(name) {
  return join2(draftsDir(), name);
}
function draftManifestPath(name) {
  return join2(draftDir(name), "draft.json");
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function subfileError(path) {
  if (path.trim() === "") return "a file path is empty";
  if (path.includes("\\")) return `${path}: use forward slashes`;
  if (path.startsWith("/") || /^[A-Za-z]:/.test(path)) return `${path}: must be relative`;
  const segments = path.split("/");
  if (segments.length < 2) return `${path}: must be inside one of ${SUBFILE_DIRS.join(", ")}`;
  if (segments.some((segment) => segment === ".." || segment === ".")) {
    return `${path}: must not contain . or ..`;
  }
  if (!SUBFILE_DIRS.includes(segments[0] ?? "")) {
    return `${path}: the first segment must be one of ${SUBFILE_DIRS.join(", ")}`;
  }
  const bad = segments.find((segment) => !SEGMENT.test(segment));
  return bad === void 0 ? null : `${path}: "${bad}" is not a usable path segment`;
}
function validateManifest(value) {
  const errors = [];
  if (!isRecord(value)) return ["manifest must be a JSON object"];
  const name = value.name;
  if (typeof name !== "string" || !SKILL_NAME.test(name)) {
    errors.push(`name must match ${SKILL_NAME} (for example "auto-gate-check")`);
  }
  const description = value.description;
  if (typeof description !== "string" || description.trim() === "") {
    errors.push("description must be a non-empty string");
  } else if (description.length > DESCRIPTION_MAX_CHARS) {
    errors.push(`description is ${description.length} characters; the catalog truncates at ${DESCRIPTION_MAX_CHARS}`);
  }
  if (typeof value.body !== "string" || value.body.trim() === "") {
    errors.push("body must be the SKILL.md content below the frontmatter");
  }
  const verify = value.verify;
  if (!isRecord(verify)) {
    errors.push("verify must be an object with command and expectExit");
  } else {
    const command = verify.command;
    if (typeof command !== "string" || command.trim() === "") {
      errors.push("verify.command must be a non-empty string");
    } else if (command.length > VERIFY_COMMAND_MAX_CHARS) {
      errors.push(`verify.command is longer than ${VERIFY_COMMAND_MAX_CHARS} characters`);
    }
    if (typeof verify.expectExit !== "number" || !Number.isInteger(verify.expectExit)) {
      errors.push("verify.expectExit must be an integer");
    }
  }
  const files = value.files;
  if (!isRecord(files)) {
    errors.push("files must be an object mapping each relative path to its content");
  } else {
    const paths = Object.keys(files);
    if (paths.length === 0) {
      errors.push("files must ship at least one file; a skill with nothing runnable is a note, not a skill");
    }
    for (const path of paths) {
      const problem = subfileError(path);
      if (problem !== null) errors.push(problem);
      const content = files[path];
      if (typeof content !== "string") {
        errors.push(`${path}: content must be a string`);
      } else if (Buffer.byteLength(content, "utf-8") > FILE_MAX_BYTES) {
        errors.push(`${path}: larger than ${FILE_MAX_BYTES} bytes`);
      }
    }
    if (!paths.some((path) => path.startsWith("scripts/"))) {
      errors.push("files must include at least one path under scripts/ for verify to run");
    }
  }
  return errors;
}
function renderSkill(manifest) {
  const frontmatter = ["---", `name: ${manifest.name}`, `description: ${manifest.description}`, "---", ""].join("\n");
  return `${frontmatter}${manifest.body.trimEnd()}
`;
}
function stageDraft(manifest) {
  const dir = draftDir(manifest.name);
  rmSync(dir, { recursive: true, force: true });
  ensurePrivatePluginDirSync(PLUGIN_NAME, "library", "drafts", manifest.name);
  for (const [path, content] of Object.entries(manifest.files)) {
    const target = join2(dir, ...path.split("/"));
    mkdirSync3(join2(target, ".."), { recursive: true });
    writeFileSync(target, content, { encoding: "utf-8", mode: 384 });
  }
  writeFileSync(join2(dir, "SKILL.md"), renderSkill(manifest), { encoding: "utf-8", mode: 384 });
  writeFileSync(
    draftManifestPath(manifest.name),
    `${JSON.stringify({ name: manifest.name, description: manifest.description, verify: manifest.verify }, null, 2)}
`,
    { encoding: "utf-8", mode: 384 }
  );
  return dir;
}
function readDraftManifest(name) {
  const path = draftManifestPath(name);
  if (!existsSync3(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync2(path, "utf-8"));
    const verify = isRecord(parsed.verify) ? parsed.verify : {};
    return {
      name: typeof parsed.name === "string" ? parsed.name : name,
      description: typeof parsed.description === "string" ? parsed.description : "",
      body: "",
      verify: {
        command: typeof verify.command === "string" ? verify.command : "",
        expectExit: typeof verify.expectExit === "number" ? verify.expectExit : 0
      },
      files: {}
    };
  } catch {
    return null;
  }
}
function listDrafts() {
  const dir = draftsDir();
  if (!existsSync3(dir)) return [];
  return readdirSync2(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}
function checkDraft(name, config) {
  const manifest = readDraftManifest(name);
  if (manifest === null) {
    return { ok: false, exitCode: null, timedOut: false, stdout: "", stderr: `no staged draft named ${name}` };
  }
  if (manifest.verify.command.trim() === "") {
    return { ok: false, exitCode: null, timedOut: false, stdout: "", stderr: "the draft declares no verify command" };
  }
  const result = spawnSync(manifest.verify.command, {
    shell: true,
    cwd: draftDir(name),
    timeout: config.verifyTimeoutMs,
    encoding: "utf-8",
    maxBuffer: FILE_MAX_BYTES,
    env: { ...process.env, DSH_EVOLVE_DRAFT: name }
  });
  const timedOut = result.error !== void 0 && result.error.code === "ETIMEDOUT";
  const exitCode = result.status;
  return {
    ok: !timedOut && exitCode === manifest.verify.expectExit,
    exitCode,
    timedOut,
    stdout: (result.stdout ?? "").slice(0, 4e3),
    stderr: timedOut ? `timed out after ${config.verifyTimeoutMs}ms` : (result.stderr ?? "").slice(0, 4e3)
  };
}
async function promoteDraft(name, config) {
  const manifest = readDraftManifest(name);
  if (manifest === null) throw new Error(`no staged draft named ${name}`);
  const outcome = checkDraft(name, config);
  if (!outcome.ok) {
    throw new Error(
      `refusing to promote ${name}: its check did not pass (exit ${outcome.exitCode ?? "none"}${outcome.timedOut ? ", timed out" : ""}).
${outcome.stderr.trim() || outcome.stdout.trim() || "no output"}`
    );
  }
  const root = requireSkillsRoot(config);
  const target = join2(root, name);
  mkdirSync3(root, { recursive: true });
  rmSync(target, { recursive: true, force: true });
  cpSync(draftDir(name), target, {
    recursive: true,
    filter: (source) => !source.endsWith("draft.json")
  });
  const registry = loadRegistry();
  const existing = registry[name];
  registry[name] = {
    // An update keeps the original anchor and usage history: replacing a skill's
    // content must not hand it a fresh probation or erase what it has earned.
    anchor: existing?.anchor ?? requestCount(),
    createdAt: existing?.createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    use: existing?.use ?? 0,
    view: existing?.view ?? 0,
    patches: existing === void 0 ? 0 : existing.patches + 1,
    path: target
  };
  await saveRegistry(registry);
  appendLedger(
    existing === void 0 ? { name, action: "create", reason: "check passed; installed into the skills root" } : { name, action: "patch", reason: "check passed; replaced the installed content" }
  );
  rmSync(draftDir(name), { recursive: true, force: true });
  return target;
}
function dropDraft(name, reason) {
  const dir = draftDir(name);
  if (!existsSync3(dir)) return false;
  rmSync(dir, { recursive: true, force: true });
  appendLedger({ name, action: "drop", reason });
  return true;
}
function draftBytes(name) {
  const dir = draftDir(name);
  if (!existsSync3(dir)) return 0;
  let total = 0;
  const walk = (current) => {
    for (const entry of readdirSync2(current, { withFileTypes: true })) {
      const full = join2(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) total += statSync2(full).size;
    }
  };
  walk(dir);
  return total;
}

// src/hook.ts
init_config();
import { createHash as createHash2 } from "node:crypto";

// src/detect.ts
var NAMED_TOOLS = 3;
function listTools(tools) {
  const unique = [...new Set(tools)];
  const named = unique.slice(0, NAMED_TOOLS).map((tool) => `\`${tool}\``).join(", ");
  return unique.length > NAMED_TOOLS ? `${named} and ${unique.length - NAMED_TOOLS} more` : named;
}
function trailingFailures(entries) {
  const failed = [];
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry === void 0 || entry.ok) break;
    failed.push(entry);
  }
  return failed;
}
function detect(input) {
  const { entries, toolCalls, thresholds } = input;
  const findings = [];
  const last = entries.at(-1);
  if (last !== void 0) {
    const repeats = entries.filter(
      (entry) => entry.tool === last.tool && entry.paramsHash === last.paramsHash
    ).length;
    if (repeats >= thresholds.repeatCalls) {
      findings.push({
        kind: "repeat-call",
        signature: `repeat-call:${last.tool}:${last.paramsHash}`,
        message: `\`${last.tool}\` ran ${repeats} times with identical arguments and this is the same call repeating. Identical input rarely produces a different result: change the arguments, or skip the call and do the step another way.`
      });
    }
    const failed = trailingFailures(entries);
    if (failed.length >= thresholds.errorStreak) {
      findings.push({
        kind: "error-streak",
        signature: `error-streak:${failed.length}:${[...new Set(failed.map((entry) => entry.tool))].sort().join(",")}`,
        message: `The last ${failed.length} tool calls failed (${listTools(failed.map((entry) => entry.tool))}). Calling them again in the same shape will not clear this: change the approach, or report the blocker instead of looping.`
      });
    }
  }
  if (toolCalls >= thresholds.activityQuantum) {
    const milestone = Math.floor(toolCalls / thresholds.activityQuantum);
    findings.push({
      kind: "high-activity",
      signature: `high-activity:${milestone}`,
      message: `${toolCalls} tool calls in this session. If a repeatable procedure emerged, fold it into a skill now while the steps are still in context; load the \`skill-evolution\` skill for when that is worth doing and when it is not.`
    });
  }
  return findings;
}
function unemitted(findings, emitted) {
  const seen = new Set(emitted);
  return findings.filter((finding) => !seen.has(finding.signature));
}

// src/hook.ts
init_store();
function str(value) {
  return typeof value === "string" ? value : "";
}
function record(value) {
  return typeof value === "object" && value !== null ? value : {};
}
function canonical(value, depth = 12) {
  if (depth <= 0) return '"\u2026"';
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonical(item, depth - 1)).join(",")}]`;
  if (typeof value === "object") {
    const entries = value;
    const body = Object.keys(entries).sort().map((key) => `${JSON.stringify(key)}:${canonical(entries[key], depth - 1)}`).join(",");
    return `{${body}}`;
  }
  return '""';
}
function paramsHash(tool, input) {
  return createHash2("sha256").update(`${tool}\0${canonical(input)}`).digest("hex").slice(0, 16);
}
function isFailure(response, config) {
  return failurePattern(config).test(response);
}
function usageOf(tool, input) {
  const args = record(input);
  const installed = loadRegistry();
  if (tool === "skill") {
    const name = str(args.name);
    return installed[name] === void 0 ? null : { skill: name, kind: "use" };
  }
  if (tool === "Read") {
    const path = str(args.file_path) !== "" ? str(args.file_path) : str(args.path);
    for (const [name, entry] of Object.entries(installed)) {
      if (entry.path !== "" && path.startsWith(`${entry.path}/`)) return { skill: name, kind: "view" };
    }
  }
  return null;
}
async function recordUsage(usage) {
  const registry = loadRegistry();
  const entry = registry[usage.skill];
  if (entry === void 0) return;
  registry[usage.skill] = usage.kind === "use" ? { ...entry, use: entry.use + 1 } : { ...entry, view: entry.view + 1 };
  await saveRegistry(registry);
}
async function handlePostToolUse(input, config) {
  const sessionId = str(input.session_id);
  const tool = str(input.tool_name);
  const cwd = str(input.cwd);
  const usage = usageOf(tool, input.tool_input);
  if (usage !== null) await recordUsage(usage);
  const state = loadSession(sessionId) ?? emptySession(sessionId, cwd);
  const recorded = withCall(state, {
    tool,
    paramsHash: paramsHash(tool, input.tool_input),
    ok: !isFailure(str(input.tool_response), config)
  });
  const delivered = unemitted(
    detect({ entries: recorded.entries, toolCalls: recorded.toolCalls, thresholds: config }),
    recorded.emitted
  );
  const next = withEmitted(recorded, delivered.map((finding) => finding.signature));
  await saveSession(next);
  if (delivered.length === 0) return { output: null, delivered, counted: usage };
  return {
    output: {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: delivered.map((finding) => finding.message).join("\n\n")
      }
    },
    delivered,
    counted: usage
  };
}
async function dispatchHook(event, input, config) {
  if (event === "PostToolUse") return handlePostToolUse(input, config);
  return null;
}

// src/library.ts
init_config();
init_store();
import { cpSync as cpSync2, existsSync as existsSync4, readdirSync as readdirSync3, rmSync as rmSync2 } from "node:fs";
import { join as join3 } from "node:path";
function turnsAvailable(member, requests) {
  return Math.max(0, requests - member.anchor);
}
function rate(member, requests) {
  const turns = turnsAvailable(member, requests);
  return turns === 0 ? 0 : member.use / turns;
}
function evaluate(members, requests, options) {
  const probation = [];
  const spared = [];
  const dormant = [];
  const contested = [];
  for (const member of [...members].sort((left, right) => left.name.localeCompare(right.name))) {
    if (turnsAvailable(member, requests) < options.maturity) {
      probation.push(member.name);
    } else if (member.use === 0 && member.view > 0) {
      spared.push(member.name);
    } else if (member.use === 0) {
      dormant.push(member.name);
    } else {
      contested.push({ name: member.name, rate: rate(member, requests) });
    }
  }
  const archive = [...dormant];
  if (contested.length > options.capacity) {
    const ranked = [...contested].sort(
      (left, right) => left.rate === right.rate ? left.name.localeCompare(right.name) : left.rate - right.rate
    );
    archive.push(...ranked.slice(0, ranked.length - options.capacity).map((entry) => entry.name));
  }
  const retiring = new Set(archive);
  return {
    probation,
    spared,
    pool: contested.filter((entry) => !retiring.has(entry.name)).map((entry) => entry.name).sort(),
    archive: archive.sort()
  };
}
function listMembers() {
  const registry = loadRegistry();
  return Object.entries(registry).map(([name, entry]) => ({
    name,
    anchor: entry.anchor,
    use: entry.use,
    view: entry.view
  }));
}
async function retire(name, config, options) {
  const registry = loadRegistry();
  const entry = registry[name];
  if (entry === void 0) return null;
  const source = entry.path !== "" ? entry.path : join3(requireSkillsRoot(config), name);
  const destination = join3(archiveDir(), name);
  if (existsSync4(source)) {
    rmSync2(destination, { recursive: true, force: true });
    cpSync2(source, destination, { recursive: true });
    rmSync2(source, { recursive: true, force: true });
  }
  delete registry[name];
  await saveRegistry(registry);
  appendLedger({
    name,
    action: options.action,
    reason: options.reason,
    ...options.absorbedInto === void 0 ? {} : { absorbedInto: options.absorbedInto }
  });
  return destination;
}
async function curate(config, apply) {
  const requests = requestCount();
  const decision = evaluate(listMembers(), requests, {
    maturity: config.maturity,
    capacity: config.capacity
  });
  if (!apply) return { decision, retired: [] };
  const retired = [];
  for (const name of decision.archive) {
    const archived = await retire(name, config, {
      action: "archive",
      reason: `never loaded after ${config.maturity} turns of probation, or the lowest rate above capacity ${config.capacity}`
    });
    if (archived !== null) retired.push(name);
  }
  return { decision, retired };
}
async function mergeInto(config, narrow, umbrella, reason) {
  const registry = loadRegistry();
  if (registry[narrow] === void 0) throw new Error(`${narrow} is not an installed skill`);
  const umbrellaEntry = registry[umbrella];
  if (umbrellaEntry === void 0) throw new Error(`${umbrella} is not an installed skill`);
  if (narrow === umbrella) throw new Error("a skill cannot absorb itself");
  registry[umbrella] = { ...umbrellaEntry, patches: umbrellaEntry.patches + 1 };
  await saveRegistry(registry);
  appendLedger({ name: umbrella, action: "patch", reason: `absorbed ${narrow}` });
  const archived = await retire(narrow, config, { action: "merge", reason, absorbedInto: umbrella });
  if (archived === null) throw new Error(`could not retire ${narrow}`);
  return archived;
}
function listArchived() {
  const dir = archiveDir();
  if (!existsSync4(dir)) return [];
  return readdirSync3(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}
function describe(name, entry, requests) {
  const turns = turnsAvailable({ name, anchor: entry.anchor, use: entry.use, view: entry.view }, requests);
  const perTurn = turns === 0 ? 0 : entry.use / turns;
  return `${name} use=${entry.use} view=${entry.view} turns=${turns} rate=${perTurn.toFixed(4)} patches=${entry.patches}`;
}

// src/dsh-evolve.ts
init_store();
var VERSION = "0.2.0";
function readStdin() {
  try {
    return readFileSync3(0, "utf-8");
  } catch {
    return "";
  }
}
function parseJson(text) {
  const trimmed = text.trim();
  return trimmed === "" ? null : JSON.parse(trimmed);
}
function shortKey(key) {
  return key.length > 12 ? `${key.slice(0, 12)}\u2026` : key;
}
var program2 = new Command();
program2.name(PLUGIN_NAME).version(VERSION).description("Count tool activity, stage skill drafts, and keep the accumulated library honest.");
program2.command("hook").argument("<event>", "hook event name as the host reports it").description("run one hook invocation; reads the host payload from stdin").action(async (event) => {
  try {
    let input = {};
    try {
      const parsed = parseJson(readStdin());
      if (parsed !== null && typeof parsed === "object") input = parsed;
    } catch {
      return;
    }
    if (event === "Stop") {
      await bumpRequests();
      return;
    }
    const config = await resolveConfig();
    const outcome = await dispatchHook(event, input, config);
    if (outcome?.output != null) process.stdout.write(`${JSON.stringify(outcome.output)}
`);
  } catch (error) {
    process.stderr.write(`[${PLUGIN_NAME}] ${error.message}
`);
  }
});
program2.command("status").argument("[session]", "one session key; omit to list every recorded session").description("show the trace, the library, and the thresholds in force").action(async (session) => {
  const config = await resolveConfig();
  process.stdout.write(
    `${PLUGIN_NAME} ${VERSION}
thresholds: activity=${config.activityQuantum} repeat=${config.repeatCalls} streak=${config.errorStreak}
skills root: ${config.skillsRoot || "(unset)"}
survival: maturity=${config.maturity} turns capacity=${config.capacity}
turns seen: ${requestCount()}

`
  );
  const members = listMembers();
  process.stdout.write(`library: ${members.length} installed, ${listArchived().length} archived
`);
  for (const member of members) {
    const entry = loadRegistry()[member.name];
    if (entry !== void 0) process.stdout.write(`  ${describe(member.name, entry, requestCount())}
`);
  }
  const staged = listDrafts();
  process.stdout.write(`
drafts: ${staged.length} staged
`);
  for (const name of staged) process.stdout.write(`  ${name} (${draftBytes(name)} bytes)
`);
  process.stdout.write("\n");
  const keys = session !== void 0 ? [session] : [];
  if (session === void 0) {
    const { listSessionIds: listSessionIds2 } = await Promise.resolve().then(() => (init_store(), store_exports));
    keys.push(...listSessionIds2());
  }
  if (keys.length === 0) {
    process.stdout.write("no session has recorded a tool call yet\n");
    return;
  }
  for (const key of keys) {
    const { loadSession: loadSession2 } = await Promise.resolve().then(() => (init_store(), store_exports));
    const state = loadSession2(key);
    if (state === null) {
      process.stdout.write(`${key}: no state
`);
      continue;
    }
    const failures = state.entries.filter((entry) => !entry.ok).length;
    process.stdout.write(
      `session ${shortKey(key)} calls=${state.toolCalls} recent=${state.entries.length} failures=${failures} reported=${state.emitted.length}
`
    );
  }
});
var draft = program2.command("draft").description("stage, check, promote, and discard skill drafts");
draft.command("stage").option("--file <path>", "read the manifest from this file instead of stdin").description("validate and stage a draft from a JSON manifest").action(async (options) => {
  const text = options.file === void 0 ? readStdin() : readFileSync3(options.file, "utf-8");
  const manifest = parseJson(text);
  const errors = validateManifest(manifest);
  if (errors.length > 0) {
    process.stderr.write(`[${PLUGIN_NAME}] the manifest was rejected:
`);
    for (const error of errors) process.stderr.write(`  - ${error}
`);
    process.exit(1);
  }
  const dir = stageDraft(manifest);
  process.stdout.write(`staged ${manifest.name} at ${dir}
`);
  process.stdout.write(`next: ${PLUGIN_NAME} draft check ${manifest.name}
`);
});
draft.command("list").description("list staged drafts").action(() => {
  const names = listDrafts();
  if (names.length === 0) {
    process.stdout.write("no staged drafts\n");
    return;
  }
  for (const name of names) process.stdout.write(`${name} (${draftBytes(name)} bytes)
`);
});
draft.command("check").argument("<name>", "staged draft name").description("run the draft's own check; this is the only pass or fail that counts").action(async (name) => {
  const outcome = checkDraft(name, await resolveConfig());
  if (outcome.stdout.trim() !== "") process.stdout.write(`${outcome.stdout.trimEnd()}
`);
  if (outcome.stderr.trim() !== "") process.stderr.write(`${outcome.stderr.trimEnd()}
`);
  process.stdout.write(`${name}: ${outcome.ok ? "PASS" : "FAIL"} (exit ${outcome.exitCode ?? "none"})
`);
  process.exit(outcome.ok ? 0 : 1);
});
draft.command("promote").argument("<name>", "staged draft name").description("re-run the check and install the draft into the skills root only if it passes").action(async (name) => {
  const target = await promoteDraft(name, await resolveConfig());
  process.stdout.write(`promoted ${name} to ${target}
`);
});
draft.command("drop").argument("<name>", "staged draft name").option("--reason <text>", "why it was discarded", "discarded by the agent").description("discard a staged draft").action((name, options) => {
  const removed = dropDraft(name, options.reason);
  process.stdout.write(removed ? `dropped ${name}
` : `no staged draft named ${name}
`);
  process.exit(removed ? 0 : 1);
});
var library = program2.command("library").description("inspect and maintain the accumulated skills");
library.command("list").description("list installed skills with their usage rate").action(() => {
  const members = listMembers();
  const requests = requestCount();
  if (members.length === 0) {
    process.stdout.write("the library is empty\n");
    return;
  }
  const registry = loadRegistry();
  for (const member of members) {
    const entry = registry[member.name];
    if (entry !== void 0) process.stdout.write(`${describe(member.name, entry, requests)}
`);
  }
});
library.command("curate").option("--apply", "retire the skills the decision names; without it, only report").description("apply the survival rule").action(async (options) => {
  const config = await resolveConfig();
  const { decision, retired } = await curate(config, options.apply === true);
  process.stdout.write(`probation: ${decision.probation.join(", ") || "-"}
`);
  process.stdout.write(`spared:    ${decision.spared.join(", ") || "-"}
`);
  process.stdout.write(`pool:      ${decision.pool.join(", ") || "-"}
`);
  process.stdout.write(`retire:    ${decision.archive.join(", ") || "-"}
`);
  if (options.apply !== true && decision.archive.length > 0) {
    process.stdout.write(`
re-run with --apply to retire them
`);
  }
  if (retired.length > 0) process.stdout.write(`
retired: ${retired.join(", ")}
`);
});
library.command("merge").argument("<narrow>", "the skill being absorbed").requiredOption("--into <umbrella>", "the installed skill that keeps the content").option("--reason <text>", "why they were folded together", "overlapping scope").description("fold one skill into another, recording what absorbed it").action(async (narrow, options) => {
  const archived = await mergeInto(await resolveConfig(), narrow, options.into, options.reason);
  process.stdout.write(`merged ${narrow} into ${options.into}; archived at ${archived}
`);
});
library.command("ledger").description("print the append-only record, and how skills have left the library").action(() => {
  const entries = readLedger();
  for (const entry of entries) {
    const absorbed = entry.absorbedInto === void 0 ? "" : ` absorbed-into=${entry.absorbedInto}`;
    process.stdout.write(`${entry.at} ${entry.action} ${entry.name}${absorbed} \u2014 ${entry.reason}
`);
  }
  const causes = retirementCauses(entries);
  process.stdout.write(`
retired: ${causes.absorbed} absorbed, ${causes.pruned} pruned
`);
});
try {
  await program2.parseAsync(process.argv);
} catch (error) {
  if (error instanceof CommanderError) process.exit(error.exitCode);
  process.stderr.write(`[${PLUGIN_NAME}] ${error.message}
`);
  process.exit(1);
}
