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
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
      displayWidth(str) {
        return stripColor(str).length;
      }
      /**
       * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
       *
       * @param {string} str
       * @returns {string}
       */
      styleTitle(str) {
        return str;
      }
      styleUsage(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word === "[command]") return this.styleSubcommandText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleCommandText(word);
        }).join(" ");
      }
      styleCommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleOptionDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleSubcommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleArgumentDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleDescriptionText(str) {
        return str;
      }
      styleOptionTerm(str) {
        return this.styleOptionText(str);
      }
      styleSubcommandTerm(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleSubcommandText(word);
        }).join(" ");
      }
      styleArgumentTerm(str) {
        return this.styleArgumentText(str);
      }
      styleOptionText(str) {
        return str;
      }
      styleArgumentText(str) {
        return str;
      }
      styleSubcommandText(str) {
        return str;
      }
      styleCommandText(str) {
        return str;
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
      preformatted(str) {
        return /\n[^\S\r\n]/.test(str);
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
      boxWrap(str, width) {
        if (width < this.minWidthToWrap) return str;
        const rawLines = str.split(/\r\n|\n/);
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
    function stripColor(str) {
      const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
      return str.replace(sgrPattern, "");
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
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
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
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          outputError: (str, write) => write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
          getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
          stripColor: (str) => stripColor(str)
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
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
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
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
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
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
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
      usage(str) {
        if (str === void 0) {
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
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
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
          baseWrite = (str) => this._outputConfiguration.writeErr(str);
          hasColors = this._outputConfiguration.getErrHasColors();
          helpWidth = this._outputConfiguration.getErrHelpWidth();
        } else {
          baseWrite = (str) => this._outputConfiguration.writeOut(str);
          hasColors = this._outputConfiguration.getOutHasColors();
          helpWidth = this._outputConfiguration.getOutHelpWidth();
        }
        const write = (str) => {
          if (!hasColors) str = this._outputConfiguration.stripColor(str);
          return baseWrite(str);
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

// src/codearts.ts
import { readFileSync as readFileSync6 } from "node:fs";

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

// ../config-center/src/config-store.ts
import { readFile, rename, open, unlink } from "fs/promises";
import { chmodSync, existsSync, mkdirSync, statSync } from "fs";
import { randomUUID } from "crypto";
import { dirname, join } from "path";
import { homedir } from "os";

// ../config-center/src/errors.ts
var PluginError = class extends Error {
  constructor(message, code, exitCode = 1) {
    super(message);
    this.code = code;
    this.exitCode = exitCode;
    this.name = "PluginError";
  }
  code;
  exitCode;
};

// ../config-center/src/config-store.ts
function homeDir() {
  return homedir();
}
var CACHE_DIR_ENV = "AGENT_PLUGINS_CACHE_DIR";
function cacheRoot() {
  const override = (process.env[CACHE_DIR_ENV] ?? "").trim();
  return override || join(homeDir(), ".cache", "agent-plugins");
}
var CACHE_DIR = join(homeDir(), ".cache", "agent-plugins");
function legacyFlatPath(name) {
  return join(cacheRoot(), `${name}.json`);
}
function legacyOlderPath(name) {
  return join(cacheRoot(), "..", "ap", "ex-plugin", `${name}.json`);
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
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var POSIX_MODES = process.platform !== "win32";
var OTHERS_BITS = 63;
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
function ensurePrivateConfigDirSync(name) {
  return ensurePrivatePluginDirSync(name);
}
async function ensurePrivateConfigDir(name) {
  return ensurePrivateConfigDirSync(name);
}
function tightenStoredConfig(name) {
  tightenModeSync(configDir(name), 448, "the plugin cache directory");
  tightenModeSync(configPath(name), 384, "the stored configuration");
}
function delay(ms) {
  return new Promise((resolve3) => setTimeout(resolve3, ms));
}
var REPLACE_RETRY_CODES = /* @__PURE__ */ new Set(["EACCES", "EBUSY", "EPERM"]);
var REPLACE_RETRY_LIMIT = 6;
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
function deepMerge(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (isRecord(value) && isRecord(result[key])) {
      result[key] = deepMerge(
        result[key],
        value
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}
async function migrateLegacyConfig(name) {
  const target = configPath(name);
  if (existsSync(target)) return;
  for (const from of [legacyFlatPath(name), legacyOlderPath(name)]) {
    if (!existsSync(from)) continue;
    ensurePrivateConfigDirSync(name);
    await rename(from, target);
    tightenModeSync(target, 384, "the stored configuration");
    return;
  }
}
async function readConfigRaw(name) {
  const path = configPath(name);
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw new PluginError("Failed to parse config", "CONFIG_INVALID");
  }
}
async function loadConfig(name) {
  await migrateLegacyConfig(name);
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
async function saveConfig(name, data, options = {}) {
  let finalData = data;
  if (options.merge === true) {
    const existing = await readConfigRaw(name);
    if (existing) {
      finalData = deepMerge(existing, data);
    }
  }
  await writePluginFile(name, ["config.json"], JSON.stringify(finalData, null, 2) + "\n");
}
async function requireConfig(name) {
  const config = await loadConfig(name);
  if (!config) {
    throw new PluginError("No config found", "CONFIG_MISSING");
  }
  return config;
}

// ../config-center/src/launch-ui.ts
import { createServer } from "node:http";
import { readFileSync, existsSync as existsSync2, readdirSync } from "node:fs";
import { dirname as dirname2, resolve } from "node:path";
import { exec } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
var defaultOutput = {
  stdout: (s) => process.stdout.write(s),
  stderr: (s) => process.stderr.write(s)
};
function isValidPluginName(name) {
  return /^[A-Za-z0-9_-]+$/.test(name);
}
function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function pointerToKeys(pointer) {
  return pointer.replace(/^\//, "").split("/").filter(Boolean);
}
function getAtPath(obj, keys) {
  let cur = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return void 0;
    cur = cur[k];
  }
  return cur;
}
function setAtPath(obj, keys, value) {
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in cur) || typeof cur[keys[i]] !== "object") {
      cur[keys[i]] = {};
    }
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}
function configToState(config, collections) {
  if (!collections || collections.length === 0) return { ...config };
  const state = { ...config };
  for (const mapping of collections) {
    const keys = pointerToKeys(mapping.statePath);
    const nameKey = mapping.nameKey ?? "_name";
    const obj = getAtPath(config, keys);
    if (isPlainObject(obj)) {
      const arr = Object.entries(obj).map(([name, value]) => {
        if (isPlainObject(value)) {
          return { [nameKey]: name, ...value };
        }
        return { [nameKey]: name, value };
      });
      setAtPath(state, keys, arr);
    }
  }
  return state;
}
function stateToConfig(state, collections) {
  if (!collections || collections.length === 0) return { ...state };
  const config = { ...state };
  for (const mapping of collections) {
    const keys = pointerToKeys(mapping.statePath);
    const nameKey = mapping.nameKey ?? "_name";
    const arr = getAtPath(state, keys);
    if (Array.isArray(arr)) {
      const obj = {};
      for (const item of arr) {
        if (isPlainObject(item)) {
          const name = String(item[nameKey] ?? "");
          if (!name) continue;
          const { [nameKey]: _ignored, ...rest } = item;
          obj[name] = rest;
        }
      }
      setAtPath(config, keys, obj);
    }
  }
  return config;
}
function readConfigSync(name) {
  if (!name) return {};
  const path = configPath(name);
  if (!existsSync2(path)) return {};
  try {
    const raw = readFileSync(path, "utf-8").trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function loadBundledHTML() {
  const thisDir = typeof __dirname !== "undefined" ? __dirname : dirname2(fileURLToPath(import.meta.url));
  const candidates = [
    // Bundled plugin: <plugin>/dist/config-ui/dist/index.html
    resolve(thisDir, "config-ui", "dist", "index.html"),
    // Dev: plugins/config-center/src/ -> ../ui/dist/index.html
    resolve(thisDir, "..", "ui", "dist", "index.html"),
    // Fallback: deeper nesting
    resolve(thisDir, "..", "..", "ui", "dist", "index.html")
  ];
  for (const candidate of candidates) {
    if (existsSync2(candidate)) {
      return readFileSync(candidate, "utf-8");
    }
  }
  throw new PluginError(
    `Config-UI bundle not found. Searched:
${candidates.map((c) => `  - ${c}`).join("\n")}`,
    "CONFIG_MISSING"
  );
}
function safeJSON(value) {
  return JSON.stringify(value).replace(/<\//g, "<\\/").replace(/<!--/g, "<\\!--");
}
function injectGlobals(html, spec, state, csrfToken, pluginName) {
  const scriptTag = `<script>
window.__CONFIG_SPEC__ = ${safeJSON(spec ?? null)};
window.__CONFIG_STATE__ = ${safeJSON(state)};
window.__CSRF_TOKEN__ = ${safeJSON(csrfToken)};
window.__PLUGIN_NAME__ = ${safeJSON(pluginName ?? null)};
</script>`;
  return html.replace("</head>", `${scriptTag}
</head>`);
}
function listPlugins() {
  try {
    return readdirSync(cacheRoot(), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch {
    return [];
  }
}
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}
function launchUI(pluginName, options) {
  const output = options?.output ?? defaultOutput;
  const open2 = options?.open ?? !process.env.AGENT_PLUGINS_NO_BROWSER;
  const timeoutMs = options?.timeoutMs ?? (Number(process.env.AGENT_PLUGINS_UI_TIMEOUT_MS) || 5 * 60 * 1e3);
  const spec = options?.spec;
  const collections = options?.collections;
  const csrfToken = randomBytes(16).toString("hex");
  const existing = pluginName ? readConfigSync(pluginName) : {};
  const hasStoredConfig = Object.keys(existing).length > 0;
  if (!open2 && hasStoredConfig && !process.env.AGENT_PLUGINS_CACHE_DIR) {
    output.stderr(
      `[config-center] WARNING: rendering the stored configuration for "${pluginName ?? "unknown"}". For previews and tests set AGENT_PLUGINS_CACHE_DIR to a scratch directory \u2014 changing HOME inside a script does not isolate it.
`
    );
  }
  const defaults = spec?.state ?? {};
  const merged = deepMerge(defaults, existing);
  const uiState = configToState(merged, collections);
  let html = null;
  let htmlError = null;
  try {
    const rawHTML = loadBundledHTML();
    html = injectGlobals(rawHTML, spec, uiState, csrfToken, pluginName);
  } catch (e) {
    htmlError = e.message;
    output.stderr(`[config-ui] Warning: UI bundle not loaded: ${htmlError}
`);
  }
  let resolveDone;
  let resolved = false;
  let timeoutHandle;
  let serverPort = 0;
  const done = new Promise((resolve3) => {
    resolveDone = resolve3;
  });
  const settle = (value) => {
    if (resolved) return;
    resolved = true;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    resolveDone(value);
  };
  let resolveReady;
  const ready = new Promise((resolve3) => {
    resolveReady = resolve3;
  });
  const server = createServer(async (req, res) => {
    const url = req.url ?? "";
    const method = req.method ?? "GET";
    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "http://127.0.0.1",
        "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      });
      res.end();
      return;
    }
    if (method === "GET" && (url === "/" || url === "/index.html")) {
      if (html !== null) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
      } else {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`Config-UI bundle not available: ${htmlError ?? "unknown error"}
Run: cd src/config-center && npx vite build --config ui/vite.config.ts`);
      }
      return;
    }
    if (method === "GET" && url === "/api/plugins") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(listPlugins()));
      return;
    }
    const getConfigMatch = url.match(/^\/api\/config\/([^/?]+)$/);
    if (method === "GET" && getConfigMatch) {
      const plugin = decodeURIComponent(getConfigMatch[1]);
      if (!isValidPluginName(plugin)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }
      const config = readConfigSync(plugin);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(config));
      return;
    }
    const postConfigMatch = url.match(/^\/api\/config\/([^/?]+)$/);
    if (method === "POST" && postConfigMatch) {
      const token = req.headers["x-csrf-token"];
      if (token !== csrfToken) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid CSRF token" }));
        return;
      }
      const plugin = decodeURIComponent(postConfigMatch[1]);
      if (!isValidPluginName(plugin)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }
      const body = await readBody(req);
      try {
        const data = JSON.parse(body);
        await saveConfig(plugin, data, { merge: false });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        setTimeout(() => {
          server.close();
          settle(true);
        }, 500);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
      return;
    }
    if (method === "POST" && url === "/save") {
      const token = req.headers["x-csrf-token"];
      if (token !== csrfToken) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid CSRF token" }));
        return;
      }
      if (!pluginName) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "No plugin name bound to this server" }));
        return;
      }
      if (!isValidPluginName(pluginName)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid plugin name" }));
        return;
      }
      const body = await readBody(req);
      try {
        const submittedState = JSON.parse(body);
        const configData = stateToConfig(submittedState, collections);
        const currentExisting = readConfigSync(pluginName);
        const finalConfig = deepMerge(currentExisting, configData);
        await saveConfig(pluginName, finalConfig, { merge: false });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        setTimeout(() => {
          server.close();
          settle(true);
        }, 500);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });
  server.listen(0, "127.0.0.1", () => {
    const addr = server.address();
    serverPort = addr?.port ?? 0;
    output.stderr(`Open the config UI at: http://localhost:${serverPort}
`);
    if (open2 && serverPort > 0) {
      const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
      exec(`${cmd} "http://localhost:${serverPort}"`, () => {
      });
    }
    timeoutHandle = setTimeout(() => {
      server.close();
      settle(false);
    }, timeoutMs);
    resolveReady();
  });
  server.on("error", (err) => {
    output.stderr(`[config-ui] Server error: ${err.message}
`);
    settle(false);
    resolveReady();
  });
  return {
    get port() {
      return serverPort;
    },
    get url() {
      return serverPort ? `http://localhost:${serverPort}` : "";
    },
    csrfToken,
    ready,
    done,
    async close() {
      settle(false);
      await new Promise((resolve3) => {
        server.close(() => resolve3());
      });
    }
  };
}
async function requireConfigWithSetup(pluginName, options) {
  const { validate } = options;
  const setupCommand = options.setupCommand ?? "setup";
  const reason = options.reason ? `
[${pluginName}] ${options.reason}
` : "";
  let config;
  try {
    config = await requireConfig(pluginName);
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      process.stderr.write(`[${pluginName}] No configuration yet \u2014 opening the configuration form.${reason}`);
      const handle = launchUI(pluginName, options);
      const saved = await handle.done;
      if (saved) {
        try {
          config = await requireConfig(pluginName);
          if (!validate || !validate(config)) return config;
        } catch {
        }
      }
      throw new PluginError(
        `No config found. Run: ${pluginName} ${setupCommand}`,
        "CONFIG_MISSING"
      );
    }
    throw e;
  }
  if (validate && validate(config)) {
    process.stderr.write(`[${pluginName}] Configuration is incomplete \u2014 opening the configuration form.${reason}`);
    const handle = launchUI(pluginName, options);
    const saved = await handle.done;
    if (saved) {
      try {
        const newConfig = await requireConfig(pluginName);
        if (!validate(newConfig)) return newConfig;
      } catch {
      }
    }
    throw new PluginError(
      `Invalid configuration. Run: ${pluginName} ${setupCommand}`,
      "CONFIG_INVALID"
    );
  }
  return config;
}

// ../config-center/src/redact.ts
import { createHash } from "node:crypto";
var FINGERPRINT_MIN_LENGTH = 16;
var MAX_STRUCTURE_DEPTH = 3;
function maskFully(value) {
  return "\u2022".repeat(value.length);
}
function redactStructure(prefix, value, options = {}) {
  const maxDepth = options.maxDepth ?? MAX_STRUCTURE_DEPTH;
  const walk = (path, current, depth) => {
    if (current === null || current === void 0 || current === "") {
      return [`${path}=<not set>`];
    }
    if (Array.isArray(current)) {
      if (depth >= maxDepth || current.length === 0) {
        return [`${path}=<array: ${current.length} item${current.length === 1 ? "" : "s"}>`];
      }
      return current.flatMap((item, index) => walk(`${path}[${index}]`, item, depth + 1));
    }
    if (typeof current === "object") {
      const entries = Object.entries(current);
      if (depth >= maxDepth || entries.length === 0) {
        return [`${path}=<object: ${entries.length} key${entries.length === 1 ? "" : "s"}>`];
      }
      return entries.flatMap(([key, child]) => walk(`${path}.${key}`, child, depth + 1));
    }
    if (typeof current === "number" || typeof current === "boolean") {
      return [`${path}=${current}`];
    }
    const text = String(current);
    if (options.reveal?.(path)) {
      return [`${path}=${text}`];
    }
    return [`${path}=${maskFully(text)}${options.lengths ? `  len=${text.length}` : ""}`];
  };
  return walk(prefix, value, 0);
}
function describeCharset(value) {
  if (/^[0-9a-f]+$/i.test(value)) return "hex";
  if (/^[A-Za-z0-9]+$/.test(value)) return "alphanumeric";
  if (/^https?:\/\//.test(value)) return "url";
  if (/\s/.test(value)) return "contains whitespace";
  if (/^[A-Za-z0-9+/_=-]+$/.test(value)) return "base64-ish";
  return "mixed";
}
function fingerprintOf(value) {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 10);
}
function describeSecret(value, expectation = {}) {
  const text = value == null ? "" : String(value);
  if (text === "") {
    return { length: null, shape: "unset" };
  }
  const report = {
    length: text.length,
    shape: "ok"
  };
  if (expectation.pattern && !expectation.pattern.test(text)) {
    report.shape = "unexpected";
    const observed = `${describeCharset(text)}, ${text.length} chars`;
    report.shapeHint = expectation.description ? `expected ${expectation.description}; got ${observed}` : `does not match the expected shape; got ${observed}`;
  }
  return report;
}
function fingerprintAll(values) {
  const parts = values.map((value) => (value ?? "").trim()).filter(Boolean);
  if (parts.length === 0) return void 0;
  if (parts.some((part) => part.length < 8)) return void 0;
  if (parts.join("").length < FINGERPRINT_MIN_LENGTH) return void 0;
  return fingerprintOf(parts.join("\0"));
}

// ../config-center/src/config-flow.ts
var defaultOutput2 = {
  stdout: (s) => process.stdout.write(s),
  stderr: (s) => process.stderr.write(s)
};
var INTENT_MESSAGE = {
  create: "No configuration yet \u2014 opening the configuration form.",
  edit: "Opening the configuration form to change the configuration.",
  view: "Opening the configuration form."
};
async function openConfigUI(pluginName, options = {}) {
  const intent = options.intent ?? "edit";
  const output = options.output ?? defaultOutput2;
  output.stderr(`[${pluginName}] ${INTENT_MESSAGE[intent]}
`);
  if (options.reason) output.stderr(`[${pluginName}] ${options.reason}
`);
  if (intent === "view") {
    output.stderr(
      `[${pluginName}] Saving is optional here; the form also ends on its own after the session timeout.
`
    );
  }
  const handle = launchUI(pluginName, options);
  await handle.ready;
  output.stderr(`[${pluginName}] Waiting for the form to be saved (or for the session to time out)\u2026
`);
  const saved = await handle.done;
  return { opened: Boolean(handle.url), saved, url: handle.url };
}
var FIELD_TYPES = /* @__PURE__ */ new Set(["text", "password", "number", "checkbox", "select", "textarea"]);
function declaredPaths(spec) {
  const plain = /* @__PURE__ */ new Set();
  const password = /* @__PURE__ */ new Set();
  for (const element of Object.values(spec?.elements ?? {})) {
    const props = element?.props;
    const fieldType = String(props?.type ?? "").toLowerCase();
    const statePath = String(props?.statePath ?? "").trim();
    if (!statePath || !FIELD_TYPES.has(fieldType)) continue;
    const dotted = statePath.replace(/^\//, "").split("/").filter(Boolean).join(".");
    const target = fieldType === "password" ? password : plain;
    target.add(dotted);
    target.add(dotted.split(".").pop() ?? dotted);
  }
  return { plain, password };
}
function summarizeConfig(config, options = {}) {
  const { plain, password } = declaredPaths(options.spec);
  const isPassword = (path) => {
    const leaf = path.split(".").pop() ?? path;
    return password.has(path) || password.has(leaf);
  };
  const reveal = (path) => {
    if (isPassword(path)) return false;
    const leaf = path.split(".").pop() ?? path;
    return plain.has(path) || plain.has(leaf);
  };
  const lines = Object.entries(config).flatMap(
    ([key, value]) => redactStructure(key, value, { lengths: true, reveal })
  );
  return lines.length > 0 ? lines : ["<empty configuration>"];
}

// ../config-center/src/verification.ts
import { existsSync as existsSync3, readFileSync as readFileSync2 } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
function verificationPath(name) {
  return `${configDir(name)}/verification.json`;
}
function parse(raw) {
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.verifiedAt === "string" ? parsed : null;
  } catch {
    return null;
  }
}
function readVerificationSync(name) {
  const path = verificationPath(name);
  if (!existsSync3(path)) return null;
  try {
    return parse(readFileSync2(path, "utf-8"));
  } catch {
    return null;
  }
}
async function recordVerification(name, record) {
  try {
    await ensurePrivateConfigDir(name);
    await writeFile(
      verificationPath(name),
      `${JSON.stringify({ ...record, verifiedAt: record.verifiedAt ?? (/* @__PURE__ */ new Date()).toISOString() }, null, 2)}
`,
      "utf-8"
    );
  } catch {
  }
}
function assessCredentials(name, values, now = /* @__PURE__ */ new Date()) {
  const fingerprint = fingerprintAll(values);
  const verification = readVerificationSync(name);
  if (!verification) {
    return {
      fingerprint,
      verification: null,
      changedSinceVerification: false,
      summary: "These credentials have not been used successfully yet; a read-only call is the way to settle it."
    };
  }
  const comparable = Boolean(fingerprint) && Boolean(verification.fingerprint);
  const changed = comparable && fingerprint !== verification.fingerprint;
  const age = now.getTime() - Date.parse(verification.verifiedAt);
  const ageText = Number.isFinite(age) ? describeAge(age) : "at an unknown time";
  const where = verification.endpoint ? ` against ${verification.endpoint}` : "";
  let summary;
  if (changed) {
    summary = `These credentials have changed since they last worked (last success ${ageText}${where}), so a wrong or mis-pasted key is the first thing to check.`;
  } else if (comparable) {
    summary = `These same credentials worked ${ageText}${where}, so the key itself is unlikely to be the problem.`;
  } else {
    summary = `The last authenticated call succeeded ${ageText}${where}.`;
  }
  return { fingerprint, verification, changedSinceVerification: changed, summary };
}
function describeAge(ms) {
  const minutes = Math.max(0, Math.round(ms / 6e4));
  if (minutes < 1) return "moments ago";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.round(hours / 24)} days ago`;
}

// src/config-ui.ts
var L = (en, zh) => ({ en, zh });
var REASON_NEEDS_CONFIG = "Requests need somewhere to go (a gateway URL, or a per-service endpoint from `codearts endpoint discover`) and a working credential.";
var CONFIG_UI = {
  setupCommand: "config --ui",
  reason: REASON_NEEDS_CONFIG,
  spec: {
    root: "page",
    elements: {
      page: {
        type: "Header",
        props: {
          title: L("Huawei Cloud CodeArts", "\u534E\u4E3A\u4E91 CodeArts"),
          description: L(
            "Credential and endpoint setup for the codearts CLI",
            "codearts CLI \u7684\u51ED\u8BC1\u4E0E\u7AEF\u70B9\u914D\u7F6E"
          ),
          configPath: null
        },
        children: ["section-connection", "section-auth", "section-defaults", "save"]
      },
      // ── Where requests go ─────────────────────────────────────────────────
      "section-connection": {
        type: "Section",
        props: {
          title: L("Connection", "\u8FDE\u63A5"),
          description: L(
            "Region and domain are what endpoint discovery needs; the gateway is only for deployments that expose one shared address.",
            "\u533A\u57DF\u4E0E\u90E8\u7F72\u57DF\u540D\u662F\u7AEF\u70B9\u63A2\u6D4B\u6240\u9700\u7684\uFF1B\u53EA\u6709\u90E8\u7F72\u63D0\u4F9B\u7EDF\u4E00\u7F51\u5173\u65F6\u624D\u9700\u8981\u586B\u7F51\u5173\u5730\u5740\u3002"
          ),
          collapsible: null,
          defaultOpen: true
        },
        children: ["region", "deploymentDomain", "gateway", "insecure"]
      },
      region: {
        type: "Field",
        props: {
          label: L("Region", "\u533A\u57DF"),
          type: "text",
          required: true,
          help: L(
            "Region id of the tenant, or the region0_id of a private cloud.",
            "\u79DF\u6237\u6240\u5728\u533A\u57DF\u6807\u8BC6\uFF1B\u79C1\u6709\u4E91\u586B region0_id\u3002"
          ),
          placeholder: "cn-north-4",
          options: null,
          statePath: "region"
        }
      },
      deploymentDomain: {
        type: "Field",
        props: {
          label: L("Deployment domain", "\u90E8\u7F72\u57DF\u540D"),
          type: "text",
          required: false,
          help: L(
            "Only for private clouds, and only used by `codearts endpoint discover`. Example: example.com",
            "\u4EC5\u79C1\u6709\u4E91\u9700\u8981\uFF0C\u4E14\u53EA\u88AB `codearts endpoint discover` \u4F7F\u7528\u3002\u4F8B\u5982 example.com"
          ),
          placeholder: "example.com",
          options: null,
          statePath: "deploymentDomain"
        }
      },
      gateway: {
        type: "Field",
        props: {
          label: L("Gateway URL", "\u7F51\u5173\u5730\u5740"),
          type: "text",
          required: false,
          help: L(
            "One base URL shared by every service. Leave empty when each service has its own endpoint \u2014 run `codearts endpoint discover --write` and the override map is used instead.",
            "\u6240\u6709\u670D\u52A1\u5171\u7528\u7684\u4E00\u4E2A\u57FA\u5730\u5740\u3002\u82E5\u6BCF\u4E2A\u670D\u52A1\u5404\u6709\u72EC\u7ACB\u57DF\u540D\u5C31\u7559\u7A7A \u2014\u2014 \u5148\u8DD1 `codearts endpoint discover --write`\uFF0CCLI \u4F1A\u7528\u6309\u670D\u52A1\u7684\u7AEF\u70B9\u8986\u76D6\u3002"
          ),
          placeholder: "http://10.0.0.1:8099",
          options: null,
          statePath: "gateway"
        }
      },
      insecure: {
        type: "Field",
        props: {
          label: L("Skip TLS verification", "\u8DF3\u8FC7 TLS \u6821\u9A8C"),
          type: "checkbox",
          required: false,
          help: L(
            "Only for private clouds whose gateway uses an internal or self-signed certificate.",
            "\u4EC5\u5F53\u79C1\u6709\u4E91\u7F51\u5173\u4F7F\u7528\u5185\u90E8/\u81EA\u7B7E\u8BC1\u4E66\u65F6\u52FE\u9009\u3002"
          ),
          placeholder: null,
          options: null,
          statePath: "insecure"
        }
      },
      // ── Credentials ───────────────────────────────────────────────────────
      "section-auth": {
        type: "Section",
        props: {
          title: L("Credentials", "\u51ED\u8BC1"),
          description: L(
            "Pick an authentication mode; only its fields are shown.",
            "\u5148\u9009\u9274\u6743\u65B9\u5F0F\uFF0C\u8868\u5355\u53EA\u5C55\u793A\u8BE5\u65B9\u5F0F\u9700\u8981\u7684\u5B57\u6BB5\u3002"
          ),
          collapsible: null,
          defaultOpen: true
        },
        children: [
          "authType",
          "accessKeyId",
          "accessKeySecret",
          "token",
          "iamEndpoint",
          "domain",
          "username",
          "password"
        ]
      },
      authType: {
        type: "Field",
        props: {
          label: L("Authentication", "\u9274\u6743\u65B9\u5F0F"),
          type: "select",
          required: true,
          help: L(
            "aksk signs every request with an access key. token sends an IAM token instead.",
            "aksk \u7528\u8BBF\u95EE\u5BC6\u94A5\u9010\u8BF7\u6C42\u7B7E\u540D\uFF1Btoken \u6539\u4E3A\u53D1\u9001 IAM \u4EE4\u724C\u3002"
          ),
          placeholder: null,
          options: ["aksk", "token"],
          statePath: "authType"
        }
      },
      accessKeyId: {
        type: "Field",
        props: {
          label: L("Access Key ID", "Access Key ID"),
          type: "text",
          required: true,
          help: L(
            "From \u6211\u7684\u51ED\u8BC1 \u2192 \u8BBF\u95EE\u5BC6\u94A5.",
            "\u5728\u300C\u6211\u7684\u51ED\u8BC1 \u2192 \u8BBF\u95EE\u5BC6\u94A5\u300D\u83B7\u53D6\u3002"
          ),
          placeholder: null,
          options: null,
          statePath: "accessKeyId",
          visibleWhen: { statePath: "authType", oneOf: ["aksk"] }
        }
      },
      accessKeySecret: {
        type: "Field",
        props: {
          label: L("Secret Access Key", "Secret Access Key"),
          type: "password",
          required: true,
          help: null,
          placeholder: null,
          options: null,
          statePath: "accessKeySecret",
          visibleWhen: { statePath: "authType", oneOf: ["aksk"] }
        }
      },
      token: {
        type: "Field",
        props: {
          label: L("X-Auth-Token", "X-Auth-Token"),
          type: "password",
          required: false,
          help: L(
            "Use this when the deployment does not expose the IAM token API. Expires in about 24 hours.",
            "\u90E8\u7F72\u6CA1\u6709\u5F00\u653E IAM \u53D6 token \u63A5\u53E3\u65F6\u7528\u5B83\uFF0C\u7EA6 24 \u5C0F\u65F6\u8FC7\u671F\u3002"
          ),
          placeholder: null,
          options: null,
          statePath: "token",
          visibleWhen: { statePath: "authType", oneOf: ["token"] }
        }
      },
      iamEndpoint: {
        type: "Field",
        props: {
          label: L("IAM endpoint", "IAM \u7EC8\u7AEF\u8282\u70B9"),
          type: "text",
          required: false,
          help: L(
            "Needed to exchange account credentials for a token. Example: https://iam-apigateway-proxy.<region>.<domain>",
            "\u7528\u8D26\u53F7\u5BC6\u7801\u81EA\u52A8\u6362\u53D6\u4EE4\u724C\u65F6\u9700\u8981\u3002\u4F8B\u5982 https://iam-apigateway-proxy.<region>.<domain>"
          ),
          placeholder: "https://iam-apigateway-proxy.<region>.<domain>",
          options: null,
          statePath: "iamEndpoint",
          visibleWhen: { statePath: "authType", oneOf: ["token"] }
        }
      },
      domain: {
        type: "Field",
        props: {
          label: L("Account name", "\u8D26\u53F7\u540D"),
          type: "text",
          required: false,
          help: L("Owner account of the IAM user.", "IAM \u7528\u6237\u6240\u5C5E\u7684\u8D26\u53F7\u540D\u3002"),
          placeholder: null,
          options: null,
          statePath: "domain",
          visibleWhen: { statePath: "authType", oneOf: ["token"] }
        }
      },
      username: {
        type: "Field",
        props: {
          label: L("IAM username", "IAM \u7528\u6237\u540D"),
          type: "text",
          required: false,
          help: null,
          placeholder: null,
          options: null,
          statePath: "username",
          visibleWhen: { statePath: "authType", oneOf: ["token"] }
        }
      },
      password: {
        type: "Field",
        props: {
          label: L("IAM password", "IAM \u5BC6\u7801"),
          type: "password",
          required: false,
          help: null,
          placeholder: null,
          options: null,
          statePath: "password",
          visibleWhen: { statePath: "authType", oneOf: ["token"] }
        }
      },
      // ── Defaults ──────────────────────────────────────────────────────────
      "section-defaults": {
        type: "Section",
        props: {
          title: L("Defaults", "\u9ED8\u8BA4\u503C"),
          description: L(
            "Optional. The CodeArts project is always chosen per command with --project.",
            "\u53EF\u9009\u3002CodeArts \u9879\u76EE\u59CB\u7EC8\u6309\u547D\u4EE4\u7528 --project \u6307\u5B9A\uFF0C\u4E0D\u8BBE\u9ED8\u8BA4\u503C\u3002"
          ),
          collapsible: null,
          defaultOpen: true
        },
        children: ["authProjectId", "tenantId"]
      },
      authProjectId: {
        type: "Field",
        props: {
          label: L("Gateway auth project ID", "\u7F51\u5173\u9274\u6743\u9879\u76EE ID"),
          type: "text",
          required: false,
          help: L(
            "Sent as X-Project-Id. Only needed when the gateway authenticates against a different project than the one used in request paths (console: \u6211\u7684\u51ED\u8BC1 \u2192 \u9879\u76EEID).",
            "\u4F5C\u4E3A X-Project-Id \u53D1\u9001\u3002\u4EC5\u5F53\u7F51\u5173\u9274\u6743\u7528\u7684\u9879\u76EE\u4E0E\u4E0A\u9762\u7684 CodeArts \u9879\u76EE\u4E0D\u662F\u540C\u4E00\u4E2A\u65F6\u624D\u9700\u8981\u586B\uFF08\u63A7\u5236\u53F0\u300C\u6211\u7684\u51ED\u8BC1 \u2192 \u9879\u76EEID\u300D\uFF09\u3002"
          ),
          placeholder: null,
          options: null,
          statePath: "authProjectId"
        }
      },
      tenantId: {
        type: "Field",
        props: {
          label: L("Account (tenant) ID", "\u8D26\u53F7\uFF08\u79DF\u6237\uFF09ID"),
          type: "text",
          required: false,
          help: L(
            "A few Artifact paths need it. Console: \u6211\u7684\u51ED\u8BC1 \u2192 \u8D26\u53F7ID.",
            "\u5C11\u6570\u5236\u54C1\u4ED3\u5E93\u63A5\u53E3\u9700\u8981\u3002\u63A7\u5236\u53F0\u300C\u6211\u7684\u51ED\u8BC1 \u2192 \u8D26\u53F7ID\u300D\u3002"
          ),
          placeholder: null,
          options: null,
          statePath: "tenantId"
        }
      },
      save: { type: "SaveBar", props: { saveLabel: null, resetLabel: null } }
    },
    state: {
      gateway: "",
      insecure: false,
      authType: "aksk",
      accessKeyId: "",
      accessKeySecret: "",
      token: "",
      iamEndpoint: "",
      domain: "",
      username: "",
      password: "",
      region: "",
      deploymentDomain: "",
      authProjectId: "",
      tenantId: ""
    }
  }
};

// src/config.ts
var DEFAULT_TIMEOUT_MS = 6e4;
var CODEARTS_PLUGIN_NAME = "codearts";
function codeartsConfigPath() {
  return configPath(CODEARTS_PLUGIN_NAME);
}
function isConfigComplete(config) {
  const hasGateway = Boolean(String(config.gateway ?? "").trim());
  const hasServiceEndpoints = Object.keys(config.endpoints ?? {}).length > 0;
  if (!hasGateway && !hasServiceEndpoints) return false;
  if (config.authType === "token") {
    if (String(config.token ?? "").trim()) return true;
    return Boolean(
      String(config.username ?? "").trim() && String(config.password ?? "").trim() && String(config.domain ?? "").trim() && String(config.iamEndpoint ?? "").trim()
    );
  }
  return Boolean(
    String(config.accessKeyId ?? "").trim() && String(config.accessKeySecret ?? "").trim()
  );
}
async function requireConfig2() {
  const config = await requireConfigWithSetup("codearts", {
    ...CONFIG_UI,
    // Completeness is a config-domain rule shared with the CLI, so it is applied
    // here rather than baked into the form's data module.
    validate: (candidate) => !isConfigComplete(candidate)
  });
  if (!isConfigComplete(config)) {
    throw new PluginError(
      `CodeArts configuration is incomplete. Run: codearts config --ui`,
      "CONFIG_INVALID"
    );
  }
  return config;
}
async function readConfig() {
  return loadConfig("codearts");
}
async function updateConfig(patch) {
  await saveConfig("codearts", patch, { merge: true });
}
var AK_EXPECTATION = {
  pattern: /^[A-Z0-9]{20}$/,
  description: "20 characters, uppercase letters and digits"
};
var SK_EXPECTATION = {
  pattern: /^[A-Za-z0-9]{40}$/,
  description: "40 letters and digits"
};
function credentialFields(config) {
  if (config.authType === "token") {
    return [
      { key: "password", value: config.password, expectation: {} },
      { key: "token", value: config.token, expectation: {} }
    ].filter((field) => String(field.value ?? "").trim() !== "");
  }
  return [
    { key: "accessKeyId", value: config.accessKeyId, expectation: AK_EXPECTATION },
    { key: "accessKeySecret", value: config.accessKeySecret, expectation: SK_EXPECTATION }
  ];
}
function credentialValues(config) {
  if (config.authType === "token") return [];
  return [config.accessKeyId ?? "", config.accessKeySecret ?? ""];
}
function redactEchoedSecrets(text, config) {
  let result = text;
  for (const field of credentialFields(config)) {
    const secret = String(field.value ?? "");
    if (secret.length >= 8) result = result.split(secret).join("<redacted>");
  }
  return result;
}
function credentialDiagnosis(config) {
  const lines = [];
  for (const field of credentialFields(config)) {
    const report = describeSecret(field.value, field.expectation);
    if (report.shape === "unset") {
      lines.push(`${field.key} is not set.`);
    } else if (report.shape === "unexpected") {
      lines.push(
        `${field.key} does not look like a valid value: ${report.shapeHint}.`,
        `Re-copy it from the console; a truncated paste is the usual cause.`
      );
    }
  }
  lines.push(assessCredentials(CODEARTS_PLUGIN_NAME, credentialValues(config)).summary);
  return lines;
}

// src/catalog.ts
import { existsSync as existsSync4, readFileSync as readFileSync3 } from "node:fs";
import { dirname as dirname3, resolve as resolve2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var cachedCatalog = null;
function catalogCandidates() {
  const thisDir = typeof __dirname !== "undefined" ? __dirname : dirname3(fileURLToPath2(import.meta.url));
  return [
    resolve2(thisDir, "api-catalog.json"),
    resolve2(thisDir, "..", "dist", "api-catalog.json")
  ];
}
function catalogPath() {
  const candidates = catalogCandidates();
  const found = candidates.find((candidate) => existsSync4(candidate));
  if (!found) {
    throw new Error(
      `CodeArts API catalog not found. Searched:
${candidates.map((candidate) => `  - ${candidate}`).join("\n")}
Run: npm run extract --prefix plugins/codearts`
    );
  }
  return found;
}
function loadCatalog() {
  if (cachedCatalog) return cachedCatalog;
  cachedCatalog = JSON.parse(readFileSync3(catalogPath(), "utf-8"));
  return cachedCatalog;
}
function docUrl(operation, catalog = loadCatalog()) {
  return `${catalog.source}/api/${operation.service}/${pageName(operation)}.html`;
}
function pageName(operation) {
  return operation.id.slice(operation.service.length + 1);
}
function resolveOperation(reference) {
  const catalog = loadCatalog();
  const raw = reference.trim();
  if (!raw) return { kind: "missing", suggestions: [] };
  const needle = raw.toLowerCase();
  const urlPage = raw.match(/\/([^/]+)\.html?$/);
  const exact = catalog.operations.find((operation) => operation.id.toLowerCase() === needle);
  if (exact) return { kind: "found", operation: exact };
  if (urlPage) {
    const byPage2 = catalog.operations.filter(
      (operation) => pageName(operation).toLowerCase() === urlPage[1].toLowerCase()
    );
    if (byPage2.length === 1) return { kind: "found", operation: byPage2[0] };
    if (byPage2.length > 1) return { kind: "ambiguous", candidates: byPage2 };
  }
  const split = raw.match(/^([A-Za-z]+)[.:/](.+)$/);
  if (split) {
    const [, servicePart, pagePart] = split;
    const byServiceAndPage = catalog.operations.filter(
      (operation) => operation.service.toLowerCase().endsWith(servicePart.toLowerCase()) && pageName(operation).toLowerCase() === pagePart.toLowerCase()
    );
    if (byServiceAndPage.length === 1) return { kind: "found", operation: byServiceAndPage[0] };
    if (byServiceAndPage.length > 1) return { kind: "ambiguous", candidates: byServiceAndPage };
  }
  const byPage = catalog.operations.filter(
    (operation) => pageName(operation).toLowerCase() === needle
  );
  if (byPage.length === 1) return { kind: "found", operation: byPage[0] };
  if (byPage.length > 1) return { kind: "ambiguous", candidates: byPage };
  const byName = catalog.operations.filter((operation) => operation.name === raw);
  if (byName.length === 1) return { kind: "found", operation: byName[0] };
  if (byName.length > 1) return { kind: "ambiguous", candidates: byName };
  const suggestions = catalog.operations.filter(
    (operation) => operation.name.includes(raw) || pageName(operation).toLowerCase().includes(needle)
  ).sort((a, b) => a.name.length - b.name.length).slice(0, 10);
  return { kind: "missing", suggestions };
}
function searchOperations(options = {}) {
  const catalog = loadCatalog();
  const keyword = options.keyword?.trim().toLowerCase();
  const service = options.service?.trim().toLowerCase();
  const method = options.method?.trim().toUpperCase();
  const limit = options.limit ?? 40;
  const matched = catalog.operations.filter((operation) => {
    if (!options.includeLegacy && operation.legacy) return false;
    if (service && operation.service.toLowerCase() !== service) {
      const label = catalog.services.find((entry) => entry.service === operation.service)?.label;
      if (label !== service) return false;
    }
    if (method && operation.method !== method) return false;
    if (keyword) {
      const haystack = `${operation.name} ${operation.id} ${operation.path} ${operation.group}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });
  return matched.slice(0, limit);
}
function resolveService(reference) {
  const catalog = loadCatalog();
  const needle = reference.trim().toLowerCase();
  return catalog.services.find(
    (service) => service.service.toLowerCase() === needle || service.label.toLowerCase() === needle || service.serviceName.toLowerCase() === needle || service.serviceName.toLowerCase().includes(needle)
  );
}

// src/http.ts
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

// src/sign.ts
import { createHash as createHash2, createHmac } from "node:crypto";
var EMPTY_BODY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
var SDK_SIGNING_ALGORITHM = "SDK-HMAC-SHA256";
var HEADER_X_SDK_DATE = "x-sdk-date";
var HEADER_HOST = "host";
var HEADER_CONTENT_SHA256 = "x-sdk-content-sha256";
var UNRESERVED = /^[A-Za-z0-9\-._~]$/;
function urlEncode(value) {
  let out = "";
  for (const char of value) {
    if (UNRESERVED.test(char)) {
      out += char;
      continue;
    }
    for (const byte of Buffer.from(char, "utf8")) {
      out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
  }
  return out;
}
function sha256Hex(value) {
  return createHash2("sha256").update(value).digest("hex");
}
function hmacSha256Hex(key, value) {
  return createHmac("sha256", key).update(value).digest("hex");
}
function requestDateTime(date = /* @__PURE__ */ new Date()) {
  const iso = date.toISOString();
  return `${iso.slice(0, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}T${iso.slice(11, 13)}${iso.slice(
    14,
    16
  )}${iso.slice(17, 19)}Z`;
}
function canonicalUri(path) {
  if (!path) return path;
  const encoded = path.split("/").map(urlEncode).join("/");
  return encoded.endsWith("/") ? encoded : `${encoded}/`;
}
function canonicalQueryString(query = {}) {
  const parts = [];
  for (const key of Object.keys(query).sort()) {
    const value = query[key];
    const values = Array.isArray(value) ? [...value].map(String).sort() : [String(value)];
    for (const item of values) {
      parts.push(`${urlEncode(key)}=${urlEncode(item)}`);
    }
  }
  return parts.join("&");
}
function canonicalHeaders(headers) {
  const names = Object.keys(headers).map((name) => name.toLowerCase()).sort();
  const canonical = names.map((name) => `${name}:${headers[name] ?? headerValue(headers, name)}
`).join("");
  return { canonical, signedHeaders: names.join(";") };
}
function headerValue(headers, lowerName) {
  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === lowerName) return value;
  }
  return "";
}
function signRequest(input) {
  const endpoint2 = new URL(input.endpoint);
  const dateTimeStamp = requestDateTime(input.date);
  const headers = {};
  for (const [name, value] of Object.entries(input.headers ?? {})) {
    headers[name.toLowerCase()] = value;
  }
  headers[HEADER_X_SDK_DATE] = dateTimeStamp;
  headers[HEADER_HOST] = endpoint2.host;
  if (/multipart\/form-data/i.test(headers["content-type"] ?? "")) {
    delete headers["content-type"];
  }
  const payloadHash = headers[HEADER_CONTENT_SHA256] ? headers[HEADER_CONTENT_SHA256] : input.body !== void 0 && input.body !== "" ? sha256Hex(input.body) : EMPTY_BODY_SHA256;
  const { canonical, signedHeaders } = canonicalHeaders(headers);
  const canonicalRequest = [
    input.method.toUpperCase(),
    canonicalUri(input.path.split("?")[0]),
    canonicalQueryString(input.query ?? {}),
    canonical,
    signedHeaders,
    payloadHash
  ].join("\n");
  const stringToSign = [SDK_SIGNING_ALGORITHM, dateTimeStamp, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmacSha256Hex(input.accessKeySecret, stringToSign);
  return {
    headers: {
      ...headers,
      Authorization: `${SDK_SIGNING_ALGORITHM} Access=${input.accessKeyId}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    },
    canonicalRequest,
    stringToSign,
    signature,
    signedHeaders
  };
}

// src/http.ts
var DryRunSignal = class extends Error {
  constructor() {
    super("dry run");
    this.name = "DryRunSignal";
  }
};
function resolveEndpoint(config, service) {
  const override = config.endpoints?.[service];
  const endpoint2 = (override ?? config.gateway ?? "").trim();
  if (!endpoint2) {
    throw new PluginError(
      "No CodeArts endpoint configured.\nSet a gateway with: codearts config --ui\nOr discover per-service hosts with: codearts endpoint discover --region <region> --domain <domain> --write",
      "CONFIG_INVALID"
    );
  }
  try {
    const parsed = new URL(endpoint2);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    throw new PluginError(
      `Configured endpoint is not a valid URL: ${endpoint2}
Fix it with: codearts config --ui`,
      "CONFIG_INVALID"
    );
  }
}
function buildPath(template, values) {
  const missing = [];
  const path = template.replace(/\{([^}]+)\}/g, (_, name) => {
    const value = values[name];
    if (value === void 0 || value === "") {
      missing.push(name);
      return `{${name}}`;
    }
    return encodeURIComponent(value);
  });
  if (missing.length > 0) {
    throw new PluginError(
      `Missing path parameter${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}
Pass ${missing.map((name) => `--param ${name}=<value>`).join(" ")}`,
      "QUERY_FAILED"
    );
  }
  return path;
}
function encodeQuery(query) {
  const parts = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === void 0 || value === null || value === "") continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
    }
  }
  return parts.join("&");
}
function serializeBody(body) {
  if (body === void 0) return void 0;
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body, "utf8");
  return Buffer.from(JSON.stringify(body), "utf8");
}
var cachedToken = null;
async function fetchProjectToken(config, projectId) {
  const iamEndpoint = (config.iamEndpoint ?? "").trim();
  if (!iamEndpoint) {
    throw new PluginError(
      "Token authentication needs an IAM endpoint.\nSet it with: codearts config --ui",
      "CONFIG_INVALID"
    );
  }
  const scope = projectId ?? config.projectId;
  if (!scope) {
    throw new PluginError(
      "Token authentication needs a project id. Pass --project <id> or run: codearts project use <id>",
      "CONFIG_INVALID"
    );
  }
  const cacheKey = `${iamEndpoint}|${scope}`;
  if (cachedToken && cachedToken.endpoint === cacheKey && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }
  const payload = {
    auth: {
      identity: {
        methods: ["password"],
        password: {
          user: {
            name: config.username,
            password: config.password,
            domain: { name: config.domain }
          }
        }
      },
      scope: { project: { id: scope } }
    }
  };
  const result = await transport(
    {
      method: "POST",
      url: `${iamEndpoint.replace(/\/$/, "")}/v3/auth/tokens`,
      headers: { "content-type": "application/json" },
      body: Buffer.from(JSON.stringify(payload), "utf8")
    },
    { timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS, insecure: config.insecure === true }
  );
  const token = result.headers["x-subject-token"];
  if (!result.ok || !token) {
    throw new PluginError(
      `IAM did not return a project token (HTTP ${result.status}).
Check the IAM endpoint, account name, username and password.
Response: ${redactEchoedSecrets(truncate(result.raw, 400), config)}`,
      "AUTH_FAILED"
    );
  }
  cachedToken = {
    token,
    endpoint: cacheKey,
    // Refresh well before the documented 24h lifetime.
    expiresAt: Date.now() + 20 * 60 * 60 * 1e3
  };
  return token;
}
function transport(spec, options) {
  return new Promise((resolve3, reject) => {
    const url = new URL(spec.url);
    const send = url.protocol === "https:" ? httpsRequest : httpRequest;
    const req = send(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: spec.method,
        headers: spec.headers,
        ...url.protocol === "https:" ? { rejectUnauthorized: !options.insecure } : {}
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const headers = {};
          for (const [name, value] of Object.entries(res.headers)) {
            headers[name.toLowerCase()] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
          }
          const status = res.statusCode ?? 0;
          resolve3({
            status,
            ok: status >= 200 && status < 300,
            headers,
            raw: buffer.toString("utf8"),
            buffer
          });
        });
      }
    );
    req.setTimeout(options.timeoutMs, () => {
      req.destroy(
        new Error(
          `Request timed out after ${options.timeoutMs}ms. Check the gateway address and network reachability.`
        )
      );
    });
    req.on("error", reject);
    if (spec.body && spec.body.length > 0) req.write(spec.body);
    req.end();
  });
}
async function execute(config, spec, options = {}) {
  const endpoint2 = resolveEndpoint(config, spec.service);
  const path = spec.pathParams ? buildPath(spec.path, spec.pathParams) : spec.path;
  const query = spec.query ?? {};
  const queryString = encodeQuery(query);
  const url = `${endpoint2}${path}${queryString ? `?${queryString}` : ""}`;
  const body = serializeBody(spec.body);
  const headers = {
    accept: "application/json",
    ...body ? { "content-type": "application/json" } : {},
    ...spec.headers ?? {},
    ...options.extraHeaders ?? {}
  };
  const scopeProjectId = (config.authProjectId ?? "").trim() || spec.projectId || spec.pathParams?.project_id || spec.pathParams?.project_uuid;
  if (scopeProjectId && !headers["x-project-id"]) {
    headers["x-project-id"] = scopeProjectId;
  }
  const authType = config.authType ?? "aksk";
  if (authType === "aksk") {
    if (!config.accessKeyId || !config.accessKeySecret) {
      throw new PluginError("AK/SK are not configured.\nSet them with: codearts config --ui", "CONFIG_INVALID");
    }
    const signed = signRequest({
      method: spec.method,
      endpoint: endpoint2,
      path,
      query,
      headers,
      body,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret
    });
    Object.assign(headers, signed.headers);
  } else {
    headers["x-auth-token"] = (config.token ?? "").trim() || await fetchProjectToken(config, scopeProjectId);
  }
  const preview = {
    method: spec.method.toUpperCase(),
    url,
    headers: redactHeaders(headers),
    ...body ? { body: body.toString("utf8") } : {}
  };
  if (spec.dryRun) {
    process.stdout.write(`${formatPreview(preview)}
`);
    throw new DryRunSignal();
  }
  let response;
  try {
    response = await transport(
      { method: spec.method.toUpperCase(), url, headers, body },
      { timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS, insecure: config.insecure === true }
    );
  } catch (error) {
    throw new PluginError(
      `Request to ${endpoint2} failed: ${error.message}
Check the gateway address, network reachability, and certificate trust (codearts config --ui).`,
      "QUERY_FAILED"
    );
  }
  const parsed = parseBody(response.raw);
  const result = {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    body: parsed,
    raw: response.raw,
    buffer: response.buffer,
    preview
  };
  if (!response.ok) throw httpError(result, config);
  return result;
}
function parseBody(raw) {
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
function httpError(response, config) {
  const payload = response.body;
  const errorCode = (payload && (payload.error_code ?? payload.errorCode ?? payload.code)) ?? void 0;
  const errorMsg = (payload && (payload.error_msg ?? payload.errorMessage ?? payload.message)) ?? void 0;
  const lines = [`CodeArts API request failed with HTTP ${response.status}.`];
  if (errorCode) lines.push(`error_code: ${errorCode}`);
  if (errorMsg) lines.push(`error_msg: ${redactEchoedSecrets(String(errorMsg), config)}`);
  lines.push(`request: ${response.preview.method} ${response.preview.url}`);
  if (!errorCode && !errorMsg) {
    lines.push(`response: ${redactEchoedSecrets(truncate(response.raw, 600), config)}`);
  }
  if (response.status === 401 || response.status === 403) {
    lines.push("The gateway rejected the credentials.");
    for (const line of credentialDiagnosis(config)) lines.push(`  ${line}`);
    lines.push(
      "If the shape looks right and nothing has changed, the key may lack the CodeArts permissions for this project.",
      "Confirm the credentials themselves with: codearts doctor"
    );
    return new PluginError(lines.join("\n"), "AUTH_FAILED");
  }
  if (response.status === 404) {
    lines.push(
      "A path parameter such as project_id, pipeline_id or repository_id may not exist.",
      "Confirm identifiers with the matching list command, e.g. codearts project list"
    );
  } else if (response.status === 429) {
    lines.push("Rate limited. Retry after a short wait.");
  }
  return new PluginError(lines.join("\n"), "QUERY_FAILED");
}
function formatPreview(preview) {
  const lines = [`${preview.method} ${preview.url}`];
  for (const [name, value] of Object.entries(preview.headers)) {
    lines.push(`${name}: ${value}`);
  }
  if (preview.body) lines.push("", preview.body);
  return lines.join("\n");
}
function redactHeaders(headers) {
  const redacted = {};
  for (const [name, value] of Object.entries(headers)) {
    const lower = name.toLowerCase();
    if (lower === "authorization" || lower === "x-auth-token" || lower === "x-subject-token") {
      redacted[name] = `<redacted:${value.length} chars>`;
    } else {
      redacted[name] = value;
    }
  }
  return redacted;
}
function truncate(value, max) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\u2026 (${value.length - max} more characters)`;
}
async function probeEndpoint(candidate, timeoutMs = 8e3, options = {}) {
  let origin;
  try {
    const parsed = new URL(candidate);
    origin = `${parsed.protocol}//${parsed.host}`;
  } catch {
    return {
      url: candidate,
      reachable: false,
      looksLikeCodearts: false,
      certificateUntrusted: false,
      detail: "not a valid URL; include the scheme, for example http://10.0.0.1:8099"
    };
  }
  const method = (options.method ?? "GET").toUpperCase();
  const target = `${origin}${options.path ?? "/v1/domain/project/related"}`;
  const attempt = (insecure) => transport(
    {
      method,
      url: target,
      headers: { accept: "application/json", "content-type": "application/json" },
      ...method === "POST" || method === "PUT" || method === "PATCH" ? { body: Buffer.from("{}", "utf8") } : {}
    },
    { timeoutMs, insecure }
  );
  try {
    const response = await attempt(false);
    return classify(response);
  } catch (error) {
    const message = error.message ?? String(error);
    if (/certificate|self.signed|unable to verify/i.test(message)) {
      try {
        const response = await attempt(true);
        return {
          ...classify(response),
          certificateUntrusted: true,
          detail: `${classify(response).detail} (TLS certificate is not trusted by this machine)`
        };
      } catch (retryError) {
        return {
          url: origin,
          reachable: false,
          looksLikeCodearts: false,
          certificateUntrusted: true,
          detail: `TLS handshake failed: ${retryError.message}`
        };
      }
    }
    return {
      url: origin,
      reachable: false,
      looksLikeCodearts: false,
      certificateUntrusted: false,
      detail: message
    };
  }
  function classify(response) {
    const looksLikeCodearts = response.status === 401 || response.status === 403;
    const body = response.raw.slice(0, 800);
    const apigwCode = body.match(/APIGW\.\d+/)?.[0];
    const ssoShell = /cloud_route_state|authui\/login/.test(body);
    let detail;
    if (looksLikeCodearts) {
      detail = "reachable and asking for credentials \u2014 a CodeArts gateway responds this way";
    } else if (apigwCode) {
      detail = `Huawei API gateway reachable, but not for this probe path (${apigwCode}). A host can serve a service on other paths, so this is not proof the host is wrong \u2014 decide endpoints with \`codearts endpoint discover\``;
    } else if (ssoShell) {
      detail = "console or single-page app shell that redirects to SSO; the REST API lives on another host";
    } else if (response.status === 404) {
      detail = "reachable HTTP service, but this path is not CodeArts; check the host and any path prefix";
    } else if (response.status >= 500) {
      detail = "reachable but returning a server error";
    } else {
      detail = `reachable (HTTP ${response.status})`;
    }
    return {
      url: origin,
      reachable: true,
      status: response.status,
      looksLikeCodearts,
      certificateUntrusted: false,
      detail
    };
  }
}
function buildMultipart(fields, files) {
  const boundary = `----codearts${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
  const chunks = [];
  const push = (value) => chunks.push(Buffer.from(value, "utf8"));
  for (const [name, value] of Object.entries(fields)) {
    push(`--${boundary}\r
`);
    push(`Content-Disposition: form-data; name="${name}"\r
\r
`);
    push(`${value}\r
`);
  }
  for (const file of files) {
    push(`--${boundary}\r
`);
    push(
      `Content-Disposition: form-data; name="${file.field}"; filename="${file.filename}"\r
`
    );
    push(`Content-Type: ${file.contentType ?? "application/octet-stream"}\r
\r
`);
    chunks.push(file.content);
    push("\r\n");
  }
  push(`--${boundary}--\r
`);
  return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}

// src/endpoint.ts
var SERVICE_PROBES = [
  {
    service: "codeartspipeline",
    label: "pipeline",
    subdomains: ["cloudpipeline-ext", "cloudpipeline", "codeartspipeline", "pipeline"],
    method: "POST",
    path: "/v5/{project_id}/api/pipelines/list"
  },
  {
    service: "codeartsbuild",
    label: "build",
    subdomains: ["cloudbuild", "cloudbuild-ext", "codeartsbuild", "codeci", "build"],
    method: "GET",
    path: "/v1/job/list"
  },
  {
    service: "codeartscheck",
    label: "check",
    subdomains: ["codeartscheck", "codecheck", "codecheck-ext", "check"],
    method: "GET",
    path: "/v2/{project_id}/tasks"
  },
  {
    service: "codeartsrepo",
    label: "repo",
    subdomains: ["codeartsrepo", "codehub", "codehub-ext", "repo"],
    method: "GET",
    path: "/v1/projects/{project_id}/repositories"
  },
  {
    service: "codeartsdeploy",
    label: "deploy",
    subdomains: ["codeartsdeploy", "deployman", "deployman-ext", "deploy"],
    method: "POST",
    path: "/v1/applications/list"
  },
  {
    service: "codeartsartifact",
    label: "artifact",
    subdomains: ["codeartsartifact", "cloudartifact", "artifact", "devrepo"],
    method: "GET",
    path: "/v2/{project_id}/release/files"
  },
  {
    service: "codeartswiki",
    label: "wiki",
    subdomains: ["codeartswiki", "cloudwiki", "wiki", "zhishiku"],
    method: "GET",
    path: "/v1/openapi/project/zhishiku/{project_id}"
  },
  {
    service: "codeartsboard",
    label: "board",
    subdomains: ["codeartsboard", "cloudboard", "board", "bi"],
    method: "POST",
    path: "/v1/{project_id}/access-data-api/probe"
  }
];
function endpointCandidates(probe, region, domain) {
  const bare = domain.replace(/^\.+/, "");
  return probe.subdomains.map((sub) => `https://${sub}.${region}.${bare}`);
}
async function discoverServiceEndpoint(probe, options) {
  const candidates = endpointCandidates(probe, options.region, options.domain);
  const path = probe.path.replace("{project_id}", options.projectId);
  const tried = [];
  for (const candidate of candidates) {
    tried.push(candidate);
    const result = await probeEndpoint(candidate, options.timeoutMs ?? 6e3, {
      method: probe.method,
      path
    });
    if (result.looksLikeCodearts) {
      return {
        service: probe.service,
        label: probe.label,
        endpoint: candidate,
        tried,
        detail: result.detail
      };
    }
  }
  const last = tried[tried.length - 1];
  return {
    service: probe.service,
    label: probe.label,
    tried,
    detail: `none of ${tried.length} candidate hosts serve this service (last tried ${last}). The service may be disabled in this deployment, or it may use a host name outside the known set \u2014 check the CodeArts console's network requests, or ask the administrator for the endpoint.`
  };
}
async function discoverEndpoints(options) {
  const probes = options.services?.length ? SERVICE_PROBES.filter(
    (probe) => options.services.some(
      (name) => probe.service === name || probe.label === name.toLowerCase()
    )
  ) : SERVICE_PROBES;
  const results = [];
  for (const probe of probes) {
    results.push(await discoverServiceEndpoint(probe, options));
  }
  return results;
}

// src/output.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function valueAtPath(value, path) {
  if (!path) return value;
  let current = value;
  for (const segment of path.split(".")) {
    if (current === null || current === void 0) return void 0;
    const indexed = segment.match(/^([^[\]]*)((?:\[\d+\])*)$/);
    if (!indexed) return void 0;
    const [, key, indexes] = indexed;
    if (key) {
      if (!isRecord2(current)) return void 0;
      current = current[key];
    }
    for (const index of indexes.matchAll(/\[(\d+)\]/g)) {
      if (!Array.isArray(current)) return void 0;
      current = current[Number(index[1])];
    }
  }
  return current;
}
function findArray(value, candidatePaths) {
  for (const path of candidatePaths) {
    const found = valueAtPath(value, path);
    if (Array.isArray(found)) return found;
  }
  const queue = [value];
  while (queue.length > 0) {
    const current = queue.shift();
    if (Array.isArray(current)) return current;
    if (isRecord2(current)) queue.push(...Object.values(current));
  }
  return null;
}
function cell(value) {
  if (value === null || value === void 0) return "";
  if (typeof value === "object") {
    const json = JSON.stringify(value);
    return json.length > 60 ? `${json.slice(0, 57)}\u2026` : json;
  }
  const text = String(value);
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
function columnValue(row, column) {
  if (!isRecord2(row)) return row;
  if (column in row) return row[column];
  return valueAtPath(row, column);
}
function renderTable(rows, columns) {
  if (rows.length === 0) return "(no rows)";
  const header = `| ${columns.join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map(
    (row) => `| ${columns.map((column) => cell(columnValue(row, column))).join(" | ")} |`
  );
  return [header, divider, ...body].join("\n");
}
function inferColumns(rows, preferred) {
  const first = rows.find(isRecord2);
  if (!first) return ["value"];
  const available = Object.keys(first);
  const chosen = preferred.filter((column) => available.includes(column));
  if (chosen.length > 0) return chosen;
  return available.slice(0, 8);
}
function renderValue(value, options) {
  if (options.format === "json") return JSON.stringify(value ?? null, null, 2);
  if (options.format === "text") {
    if (typeof value === "string") return value;
    return JSON.stringify(value ?? null, null, 2);
  }
  const rows = options.arrayPath ? valueAtPath(value, options.arrayPath) : findArray(value, []);
  if (Array.isArray(rows) && rows.length > 0) {
    const columns = options.columns?.length ? options.columns : inferColumns(rows, []);
    const table = renderTable(rows, columns);
    return `${table}

${rows.length} row(s). Use --format json for the full payload.`;
  }
  if (isRecord2(value)) {
    const entries = Object.entries(value);
    if (entries.length > 0) {
      const rows2 = entries.map(([key, item]) => ({ key, value: item }));
      const scalarOnly = entries.every(([, item]) => typeof item !== "object" || item === null);
      if (scalarOnly) return renderTable(rows2, ["key", "value"]);
    }
  }
  return JSON.stringify(value ?? null, null, 2);
}
function pickPaths(value, paths) {
  const result = {};
  for (const path of paths) {
    result[path] = valueAtPath(value, path);
  }
  return result;
}

// src/runtime.ts
function readContext(command) {
  const options = command.optsWithGlobals();
  return {
    format: options.format ?? "table",
    projectId: options.project || void 0,
    dryRun: options.dryRun === true,
    endpoint: options.endpoint || void 0,
    verbose: options.verbose === true,
    fields: options.fields?.filter(Boolean)
  };
}
async function createClient(command) {
  const ctx = readContext(command);
  const config = await requireConfig2();
  if (ctx.endpoint) {
    config.gateway = ctx.endpoint;
    delete config.endpoints;
  }
  let projectPromise = null;
  const listProjects = async () => {
    projectPromise ??= loadProjects(config);
    return projectPromise;
  };
  const client = {
    config,
    ctx,
    request: async (spec) => {
      const pathParams = { ...spec.pathParams ?? {} };
      const projectKeys = ["project_id", "projectId", "project_uuid"];
      const pathWantsProject = projectKeys.some((key) => spec.path.includes(`{${key}}`));
      const supplied = projectKeys.some((key) => Boolean(pathParams[key]));
      const resolved = spec.projectId ?? (pathWantsProject && !supplied ? await client.projectId({ required: false }) : void 0);
      for (const key of projectKeys) {
        if (resolved && spec.path.includes(`{${key}}`) && !pathParams[key]) pathParams[key] = resolved;
      }
      const response = await execute(
        config,
        {
          ...spec,
          pathParams,
          // The header scope prefers the gateway auth project inside `execute`.
          ...resolved ? { projectId: resolved } : {},
          dryRun: spec.dryRun ?? ctx.dryRun
        },
        { extraHeaders: { "x-language": "zh-cn" } }
      );
      if (ctx.verbose) process.stderr.write(`${formatPreview(response.preview)}
`);
      await noteCredentialSuccess(config, response.preview.url);
      return response;
    },
    projectId: async (options) => {
      if (ctx.projectId) return resolveProjectRef(ctx.projectId);
      const projects = await listProjects();
      if (projects.length === 1) {
        return projects[0].identifier;
      }
      if (projects.length === 0) {
        if (options?.required === false) return void 0;
        throw new PluginError(
          "No CodeArts project is visible to the current credentials.\nCheck that the account has joined a project, or pass --project <name|id>.",
          "QUERY_FAILED"
        );
      }
      throw new PluginError(
        `This deployment has several CodeArts projects, so one must be chosen per command:
` + projects.map((project2) => `  --project ${project2.name}   (${project2.identifier})`).join("\n") + `
Example: codearts pipeline list --project ${projects[0].name}`,
        "CONFIG_INVALID"
      );
    },
    projects: listProjects,
    tenantId: async () => {
      if (config.tenantId) return config.tenantId;
      const iamEndpoint = (config.iamEndpoint ?? "").trim();
      if (!iamEndpoint) {
        throw new PluginError(
          "This operation needs the account (tenant) id, which is not configured.\nFind it in the console under \u6211\u7684\u51ED\u8BC1 \u2192 \u8D26\u53F7ID, then set it with `codearts config --ui` (or configure the IAM endpoint so it can be discovered automatically).",
          "CONFIG_INVALID"
        );
      }
      const gateway = config.gateway;
      const endpoints = config.endpoints;
      config.gateway = iamEndpoint;
      delete config.endpoints;
      try {
        const response = await execute(config, {
          service: "codeartsbuild",
          method: "GET",
          path: "/v3/projects/"
        });
        const accountId = valueAtPath(response.body, "projects.0.domain_id");
        if (!accountId) {
          throw new PluginError(
            `IAM returned no usable project for these credentials.
${JSON.stringify(response.body).slice(0, 300)}`,
            "QUERY_FAILED"
          );
        }
        config.tenantId = String(accountId);
        return config.tenantId;
      } finally {
        config.gateway = gateway;
        if (endpoints) config.endpoints = endpoints;
      }
    }
  };
  async function resolveProjectRef(reference) {
    const value = reference.trim();
    if (!value) return value;
    if (/^[0-9a-f]{32}$/i.test(value)) return value;
    const projects = await listProjects();
    const exact = projects.filter((project2) => project2.name === value);
    if (exact.length === 1) return exact[0].identifier;
    const partial = projects.filter(
      (project2) => project2.name.toLowerCase().includes(value.toLowerCase())
    );
    const matches = exact.length > 0 ? exact : partial;
    if (matches.length === 1) return matches[0].identifier;
    throw new PluginError(
      matches.length === 0 ? `No CodeArts project matches "${reference}".
Available projects:
${projects.map((project2) => `  ${project2.name}  (${project2.identifier})`).join("\n")}` : `"${reference}" matches several projects; use the full name or id:
${matches.map((project2) => `  ${project2.name}  (${project2.identifier})`).join("\n")}`,
      "QUERY_FAILED"
    );
  }
  return client;
}
var credentialSuccess = null;
function noteCredentialSuccess(config, requestUrl) {
  credentialSuccess ??= recordVerification(CODEARTS_PLUGIN_NAME, {
    authType: config.authType,
    endpoint: originOf(requestUrl),
    fingerprint: fingerprintAll(credentialValues(config))
  });
  return credentialSuccess;
}
function originOf(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}
async function loadProjects(config) {
  const response = await execute(config, {
    service: "codeartsbuild",
    method: "GET",
    path: "/v1/domain/project/related"
  });
  await noteCredentialSuccess(config, response.preview.url);
  const list = valueAtPath(response.body, "result.project_info_list") ?? valueAtPath(response.body, "project_info_list");
  if (!Array.isArray(list)) {
    throw new PluginError(
      `Unexpected project list payload; expected result.project_info_list.
${JSON.stringify(
        response.body
      ).slice(0, 400)}`,
      "QUERY_FAILED"
    );
  }
  return list.filter(isRecord2).map((entry) => ({
    identifier: String(entry.identifier ?? entry.project_id ?? ""),
    name: String(entry.name ?? "")
  }));
}
function parseKeyValues(values, flag) {
  const result = {};
  for (const entry of values ?? []) {
    const index = entry.indexOf("=");
    if (index <= 0) {
      throw new PluginError(
        `Invalid ${flag} value: ${entry}
Expected the form ${flag} <name>=<value>`,
        "CONFIG_INVALID"
      );
    }
    result[entry.slice(0, index)] = entry.slice(index + 1);
  }
  return result;
}
function setDeep(target, path, value) {
  const segments = path.split(".").flatMap((segment) => {
    const match = segment.match(/^([^[\]]*)((?:\[\d+\])*)$/);
    if (!match) return [segment];
    const parts = [];
    if (match[1]) parts.push(match[1]);
    for (const index of match[2].matchAll(/\[(\d+)\]/g)) parts.push(Number(index[1]));
    return parts;
  });
  let cursor = target;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    const next = segments[i + 1];
    if (typeof key === "number") {
      const array = cursor;
      array[key] ??= typeof next === "number" ? [] : {};
      cursor = array[key];
    } else {
      const object = cursor;
      object[key] ??= typeof next === "number" ? [] : {};
      cursor = object[key];
    }
  }
  const last = segments[segments.length - 1];
  if (typeof last === "number") cursor[last] = value;
  else cursor[last] = value;
}
function coerceValue(raw, type) {
  if (!type) return raw;
  const normalized = type.toLowerCase();
  if (normalized.includes("bool")) {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return raw;
  }
  if (normalized.includes("integer") || normalized.includes("number") || normalized.includes("int")) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : raw;
  }
  if (normalized.startsWith("array") || normalized.startsWith("map") || normalized.includes("object")) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return raw;
      }
    }
  }
  return raw;
}
function toQuery(entries) {
  const query = {};
  for (const [key, value] of Object.entries(entries)) {
    if (value === void 0 || value === null) continue;
    query[key] = value;
  }
  return query;
}

// src/cli-helpers.ts
function action(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      if (error instanceof DryRunSignal) return;
      if (error instanceof PluginError) {
        process.stderr.write(`${error.message}
`);
        process.exit(error.exitCode);
      }
      const err = error;
      process.stderr.write(`${err.message}
`);
      if (process.env.CODEARTS_DEBUG) process.stderr.write(`${err.stack}
`);
      process.exit(1);
    }
  };
}
function emit(command, payload, options = {}) {
  const { format, fields } = command.optsWithGlobals();
  const value = fields && fields.length > 0 ? pickPaths(payload, fields) : payload;
  const resolvedFormat = format ?? "table";
  if (resolvedFormat === "table") {
    const rows = options.arrayPath ? valueAtPath(value, options.arrayPath) : value;
    if (Array.isArray(rows) && rows.length > 0) {
      const columns = options.columns ?? inferColumns(rows, []);
      const footnote = options.footnote ?? `${rows.length} row(s). Use --format json for the full payload.`;
      process.stdout.write(`${renderTable(rows, columns)}

${footnote}
`);
      return;
    }
  }
  process.stdout.write(
    `${renderValue(value, {
      format: resolvedFormat,
      columns: options.columns,
      arrayPath: options.arrayPath
    })}
`
  );
}
function note(command, message) {
  const { verbose } = command.optsWithGlobals();
  if (verbose) process.stderr.write(`${message}
`);
}
function asRows(value) {
  return Array.isArray(value) ? value : [];
}
function renderPreview(preview) {
  const lines = [`${preview.method} ${preview.url}`];
  for (const [name, value] of Object.entries(preview.headers)) {
    lines.push(`${name}: ${value}`);
  }
  if (preview.body) lines.push("", preview.body);
  return lines.join("\n");
}

// src/scenarios/helpers.ts
function textOf(item, keys) {
  for (const key of keys) {
    const value = isRecord2(item) ? valueAtPath(item, key) : void 0;
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return void 0;
}
function matchOne(items, reference, options) {
  const needle = reference.trim();
  const limit = options.limit ?? 20;
  const byId = items.filter((item) => textOf(item, options.idKeys) === needle);
  if (byId.length === 1) return byId[0];
  const byName = items.filter((item) => textOf(item, options.nameKeys) === needle);
  if (byName.length === 1) return byName[0];
  const bySubstring = items.filter((item) => {
    const name = textOf(item, options.nameKeys);
    return name !== void 0 && name.toLowerCase().includes(needle.toLowerCase());
  });
  if (bySubstring.length === 1) return bySubstring[0];
  if (byName.length > 1 || bySubstring.length > 1) {
    const candidates = byName.length > 1 ? byName : bySubstring;
    throw new PluginError(
      `"${needle}" matches ${candidates.length} ${options.label}s; use the exact id:
` + candidates.slice(0, limit).map((item) => `  ${describe(item, options)}`).join("\n"),
      "QUERY_FAILED"
    );
  }
  throw new PluginError(
    `No ${options.label} matches "${needle}".
` + (items.length > 0 ? `Available ${options.label}s:
${items.slice(0, limit).map((item) => `  ${describe(item, options)}`).join("\n")}${items.length > limit ? `
  \u2026 and ${items.length - limit} more` : ""}` : `Nothing is visible yet. List candidates with: ${options.listHint}`),
    "QUERY_FAILED"
  );
}
function describe(item, options) {
  const id = textOf(item, options.idKeys) ?? "?";
  const name = textOf(item, options.nameKeys) ?? "";
  return `${id}  ${name}`.trim();
}
async function poll(producer, options) {
  const timeoutMs = options.timeoutMs ?? 15 * 60 * 1e3;
  const intervalMs = options.intervalMs ?? 5e3;
  const started = Date.now();
  let last;
  for (; ; ) {
    last = await producer();
    if (options.isDone(last)) return last;
    const elapsed = Date.now() - started;
    if (options.onTick) options.onTick(last, elapsed);
    if (elapsed + intervalMs > timeoutMs) {
      throw new PluginError(
        `Gave up waiting after ${Math.round(elapsed / 1e3)}s; the task is still running.
Re-check it later, or raise the wait with --watch-timeout <seconds>.`,
        "QUERY_FAILED"
      );
    }
    await new Promise((resolve3) => setTimeout(resolve3, intervalMs));
  }
}
var TERMINAL_STATUSES = /* @__PURE__ */ new Set([
  "COMPLETED",
  "SUCCESS",
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "CANCELLED",
  "ABORTED",
  "STOPPED",
  "TIMEOUT",
  "TIMED_OUT",
  "SKIPPED",
  "IGNORED",
  "FINISHED",
  "ERROR",
  "EXPIRED"
]);
function isTerminalStatus(status) {
  if (status === null || status === void 0) return false;
  return TERMINAL_STATUSES.has(String(status).toUpperCase());
}
function parseAssignments(values, label) {
  const result = {};
  for (const entry of values ?? []) {
    const index = entry.indexOf("=");
    if (index <= 0) {
      throw new PluginError(
        `Invalid ${label} value: ${entry}
Expected the form ${label} <name>=<value>`,
        "CONFIG_INVALID"
      );
    }
    result[entry.slice(0, index)] = entry.slice(index + 1);
  }
  return result;
}
function shiftTime(spec, fallbackMs) {
  if (!spec) return Date.now() - fallbackMs;
  const match = spec.trim().match(/^-(\d+)([smhdw])$/i);
  if (!match) {
    const parsed = Date.parse(spec);
    if (Number.isNaN(parsed)) {
      throw new PluginError(
        `Invalid time value: ${spec}
Use a relative form such as -7d, -12h or an ISO timestamp.`,
        "CONFIG_INVALID"
      );
    }
    return parsed;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const factor = unit === "s" ? 1e3 : unit === "m" ? 6e4 : unit === "h" ? 36e5 : unit === "d" ? 864e5 : 6048e5;
  return Date.now() - amount * factor;
}
function formatTimestamp(value) {
  if (value === null || value === void 0 || value === "" || value === 0) return "";
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().replace("T", " ").slice(0, 19);
  }
  return String(value);
}
function flattenTree(nodes, options = {}) {
  const childrenKey = options.childrenKey ?? "children";
  const depth = options.depth ?? 0;
  if (!Array.isArray(nodes)) return [];
  return nodes.flatMap((node) => {
    if (!isRecord2(node)) return [];
    const children = node[childrenKey];
    return [
      { ...node, depth, [childrenKey]: void 0 },
      ...flattenTree(children, { childrenKey, depth: depth + 1 })
    ];
  });
}
var NOT_PUBLISHED = /APIGW\.0101/;
async function callAny(client, candidates, params = {}, body) {
  const catalog = loadCatalog();
  const skipped = [];
  for (const id of candidates) {
    const operation = catalog.operations.find((entry) => entry.id === id);
    if (!operation) continue;
    const pathParams = {};
    const query = {};
    for (const param of operation.pathParams) {
      const value = params[param.name];
      if (value !== void 0) pathParams[param.name] = String(value);
    }
    for (const param of operation.queryParams) {
      const value = params[param.name];
      if (value !== void 0) {
        query[param.name] = coerceValue(String(value), param.type);
      }
    }
    try {
      const response = await client.request({
        service: operation.service,
        method: operation.method,
        path: operation.path,
        pathParams,
        query,
        ...body !== void 0 ? { body } : {}
      });
      return { operation: id, response };
    } catch (error) {
      if (NOT_PUBLISHED.test(error.message ?? "")) {
        skipped.push(id);
        continue;
      }
      throw error;
    }
  }
  throw new PluginError(
    `This deployment publishes none of the documented variants for this call.
Tried: ${candidates.join(", ")}
` + (skipped.length > 0 ? `Not published here: ${skipped.join(", ")}
` : "") + `Find an alternative with: codearts api list <service> --search <keyword>`,
    "QUERY_FAILED"
  );
}
function unwrap(payload) {
  if (!isRecord2(payload)) return payload;
  for (const key of ["result", "data"]) {
    const inner = payload[key];
    if (inner !== void 0 && inner !== null) return inner;
  }
  return payload;
}
function arrayFrom(payload, keys) {
  const body = unwrap(payload);
  if (Array.isArray(body)) return body;
  for (const key of keys) {
    const found = valueAtPath(body, key);
    if (Array.isArray(found)) return found;
  }
  return [];
}

// src/scenarios/pipeline.ts
async function listPipelines(client, options = {}) {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartspipeline",
    method: "POST",
    path: "/v5/{project_id}/api/pipelines/list",
    projectId,
    body: {
      ...options.search ? { name: options.search } : {},
      offset: 0,
      limit: options.limit ?? 50
    }
  });
  const pipelines = valueAtPath(response.body, "pipelines");
  return Array.isArray(pipelines) ? pipelines : [];
}
async function resolvePipeline(client, reference) {
  const pipelines = await listPipelines(client, { limit: 200 });
  return matchOne(pipelines, reference, {
    idKeys: ["pipeline_id"],
    nameKeys: ["name"],
    label: "pipeline",
    listHint: "codearts pipeline list"
  });
}
function runRows(pipeline) {
  const latest = isRecord2(pipeline.latest_run) ? pipeline.latest_run : {};
  return {
    pipeline_id: pipeline.pipeline_id,
    name: pipeline.name,
    last_run_id: latest.pipeline_run_id ?? "",
    last_status: latest.status ?? statusFromStages(latest.stage_status_list),
    last_executor: latest.executor_name ?? "",
    last_started: formatTimestamp(latest.start_time)
  };
}
function statusFromStages(stages) {
  if (!Array.isArray(stages) || stages.length === 0) return "";
  const statuses = stages.map((stage) => isRecord2(stage) ? String(stage.status ?? "") : "");
  if (statuses.some((status) => status === "FAILED")) return "FAILED";
  if (statuses.every((status) => status === "COMPLETED" || status === "IGNORED" || status === "SKIPPED")) {
    return "COMPLETED";
  }
  const running = statuses.find((status) => status === "RUNNING");
  return running ?? statuses.find(Boolean) ?? "";
}
async function fetchRunDetail(client, pipelineId, runId) {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartspipeline",
    method: "GET",
    path: "/v5/{project_id}/api/pipelines/{pipeline_id}/pipeline-runs/detail",
    pathParams: { project_id: String(projectId), pipeline_id: pipelineId },
    query: runId ? { pipeline_run_id: runId } : {}
  });
  return response.body;
}
function stageRows(detail) {
  const stages = valueAtPath(detail, "stages");
  if (!Array.isArray(stages)) return [];
  return stages.filter(isRecord2).map((stage) => ({
    stage: stage.name ?? stage.identifier ?? "",
    status: stage.status ?? "",
    started: formatTimestamp(stage.start_time),
    ended: formatTimestamp(stage.end_time)
  }));
}
function registerPipeline(program3) {
  const pipeline = program3.command("pipeline").description("Run and inspect CodeArts pipelines");
  pipeline.command("list").description("List pipelines in the project with their latest run status").option("--search <keyword>", "filter by pipeline name").option("--limit <n>", "maximum pipelines to return", "50").action(
    action(async (options, command) => {
      const client = await createClient(command);
      const pipelines = await listPipelines(client, {
        search: options.search,
        limit: Number(options.limit ?? 50)
      });
      emit(command, pipelines.map(runRows), {
        columns: ["pipeline_id", "name", "last_status", "last_run_id", "last_started"]
      });
      note(command, `${pipelines.length} pipeline(s) returned.`);
    })
  );
  pipeline.command("run").argument("<pipeline>", "pipeline id or name").description("Start a pipeline, optionally on a branch with variables").option("--branch <name>", "branch or tag to build").option("--var <name=value>", "pipeline variable (repeatable)", collect, []).option("--sources <json>", "full sources array, overriding --branch").option("--description <text>", "run description").option("--watch", "follow the run until it reaches a terminal status").option("--watch-timeout <seconds>", "give up watching after this many seconds", "1800").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const target = await resolvePipeline(client, reference);
      const pipelineId = target.pipeline_id;
      const projectId = await client.projectId();
      const variables = parseAssignments(options.var, "--var");
      const sources = options.sources ? JSON.parse(options.sources) : options.branch ? [
        {
          type: "code",
          params: { build_params: { build_type: "branch", target_branch: options.branch } }
        }
      ] : void 0;
      const body = {};
      if (sources) body.sources = sources;
      if (options.description) body.description = options.description;
      if (Object.keys(variables).length > 0) {
        body.variables = Object.entries(variables).map(([name, value]) => ({ name, value }));
      }
      const response = await client.request({
        service: "codeartspipeline",
        method: "POST",
        path: "/v5/{project_id}/api/pipelines/{pipeline_id}/run",
        projectId,
        body
      });
      const runId = valueAtPath(response.body, "pipeline_run_id");
      if (!runId) {
        throw new PluginError(
          `Pipeline started but no pipeline_run_id was returned.
${JSON.stringify(response.body)}`,
          "QUERY_FAILED"
        );
      }
      if (!options.watch) {
        emit(command, { pipeline_id: pipelineId, pipeline_run_id: runId, name: target.name });
        return;
      }
      const detail = await poll(() => fetchRunDetail(client, pipelineId, String(runId)), {
        isDone: (value) => isTerminalStatus(valueAtPath(value, "status")),
        timeoutMs: Number(options.watchTimeout ?? 1800) * 1e3,
        onTick: (value) => {
          note(command, `status=${valueAtPath(value, "status") ?? "unknown"}`);
        }
      });
      emit(command, {
        pipeline_id: pipelineId,
        pipeline_run_id: runId,
        name: valueAtPath(detail, "name") ?? target.name,
        status: valueAtPath(detail, "status"),
        run_number: valueAtPath(detail, "run_number"),
        start_time: formatTimestamp(valueAtPath(detail, "start_time")),
        end_time: formatTimestamp(valueAtPath(detail, "end_time"))
      });
      const stages = stageRows(detail);
      if (stages.length > 0) {
        process.stdout.write("\n");
        emit(command, stages, { columns: ["stage", "status", "started", "ended"] });
      }
      if (String(valueAtPath(detail, "status")) !== "COMPLETED") process.exit(1);
    })
  );
  pipeline.command("status").argument("<pipeline>", "pipeline id or name").argument("[run-id]", "pipeline run id; defaults to the most recent run").description("Show the status and stages of one pipeline run").action(
    action(async (reference, runId, options, command) => {
      void options;
      const client = await createClient(command);
      const target = await resolvePipeline(client, reference);
      const detail = await fetchRunDetail(client, target.pipeline_id, runId);
      emit(command, {
        pipeline_id: target.pipeline_id,
        pipeline_run_id: valueAtPath(detail, "id") ?? runId ?? "",
        name: valueAtPath(detail, "name") ?? target.name,
        status: valueAtPath(detail, "status"),
        run_number: valueAtPath(detail, "run_number"),
        executor: valueAtPath(detail, "executor_name"),
        start_time: formatTimestamp(valueAtPath(detail, "start_time")),
        end_time: formatTimestamp(valueAtPath(detail, "end_time"))
      });
      const stages = stageRows(detail);
      if (stages.length > 0) {
        process.stdout.write("\n");
        emit(command, stages, { columns: ["stage", "status", "started", "ended"] });
      }
    })
  );
  pipeline.command("runs").argument("<pipeline>", "pipeline id or name").description("List recent runs of a pipeline").option("--limit <n>", "maximum runs to return", "20").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const target = await resolvePipeline(client, reference);
      const projectId = await client.projectId();
      const response = await client.request({
        service: "codeartspipeline",
        method: "POST",
        path: "/v5/{project_id}/api/pipelines/{pipeline_id}/pipeline-runs/list",
        pathParams: { project_id: String(projectId), pipeline_id: target.pipeline_id },
        body: { limit: Number(options.limit ?? 20), offset: 0 }
      });
      const runs = valueAtPath(response.body, "pipeline_runs") ?? valueAtPath(response.body, "runs");
      const rows = (Array.isArray(runs) ? runs : []).filter(isRecord2).map((run) => ({
        run_id: run.pipeline_run_id ?? run.id ?? "",
        status: run.status ?? "",
        run_number: run.run_number ?? "",
        executor: run.executor_name ?? "",
        started: formatTimestamp(run.start_time),
        ended: formatTimestamp(run.end_time)
      }));
      emit(command, rows, { columns: ["run_id", "status", "run_number", "started", "ended"] });
    })
  );
  pipeline.command("stop").argument("<pipeline>", "pipeline id or name").argument("<run-id>", "pipeline run id").description("Stop a running pipeline instance").action(
    action(async (reference, runId, options, command) => {
      void options;
      const client = await createClient(command);
      const target = await resolvePipeline(client, reference);
      const projectId = await client.projectId();
      const response = await client.request({
        service: "codeartspipeline",
        method: "POST",
        path: "/v5/{project_id}/api/pipelines/{pipeline_id}/pipeline-runs/{pipeline_run_id}/stop",
        pathParams: {
          project_id: String(projectId),
          pipeline_id: target.pipeline_id,
          pipeline_run_id: runId
        }
      });
      process.stdout.write(`Stop requested for run ${runId}.
`);
    })
  );
  pipeline.command("logs").argument("<pipeline>", "pipeline id or name").argument("<run-id>", "pipeline run id").requiredOption("--job-run-id <id>", "job run id, from `pipeline status <pipeline> <run> --format json`").requiredOption("--step-run-id <id>", "step run id, from the same payload").description("Print the log of one pipeline step").option("--limit <n>", "log characters to fetch", "5000").action(
    action(
      async (reference, runId, options, command) => {
        const client = await createClient(command);
        const target = await resolvePipeline(client, reference);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartspipeline",
          method: "POST",
          path: "/v5/{project_id}/api/pipelines/{pipeline_id}/pipeline-runs/{pipeline_run_id}/jobs/{job_run_id}/steps/{step_run_id}/logs",
          pathParams: {
            project_id: String(projectId),
            pipeline_id: target.pipeline_id,
            pipeline_run_id: runId,
            job_run_id: String(options.jobRunId),
            step_run_id: String(options.stepRunId)
          },
          body: {
            start_offset: 0,
            end_offset: 0,
            limit: Number(options.limit ?? 5e3),
            sort: "asc"
          }
        });
        const log = valueAtPath(response.body, "log");
        process.stdout.write(typeof log === "string" ? `${log}
` : `${JSON.stringify(response.body, null, 2)}
`);
      }
    )
  );
}
function collect(value, previous) {
  return [...previous, value];
}

// src/scenarios/build.ts
async function listJobs(client, options = {}) {
  const limit = options.limit ?? 50;
  const search = options.search;
  const response = await client.request({
    service: "codeartsbuild",
    method: "GET",
    path: "/v1/job/list",
    ...search ? { query: { search } } : {}
  });
  const jobs = valueAtPath(response.body, "result.job_list");
  const all = Array.isArray(jobs) ? jobs.filter(isRecord2) : [];
  const scoped = options.projectId ? all.filter((job) => String(job.project_id ?? "") === options.projectId) : all;
  return scoped.slice(0, limit);
}
async function resolveJob(client, reference) {
  const scopedProject = client.ctx.projectId ? await client.projectId() : void 0;
  const jobs = await listJobs(client, { limit: 200, projectId: scopedProject });
  if (jobs.length === 0 && scopedProject) {
    const elsewhere = await listJobs(client, { limit: 200 });
    if (elsewhere.length > 0) {
      throw new PluginError(
        `No build task in the selected project.
These tasks exist in other projects \u2014 drop --project or choose the right one:
` + elsewhere.slice(0, 15).map((job) => `  ${job.job_name}   (project ${job.project_name ?? job.project_id ?? "?"})`).join("\n"),
        "QUERY_FAILED"
      );
    }
  }
  return matchOne(jobs, reference, {
    idKeys: ["id"],
    nameKeys: ["job_name"],
    label: "build task",
    listHint: "codearts build list"
  });
}
function jobRows(jobs) {
  return jobs.map((job) => ({
    job_id: job.id,
    name: job.job_name,
    project: job.project_name ?? job.project_id ?? "",
    last_status: job.last_build_status ?? "",
    last_running: job.last_job_running_status ?? "",
    last_built: formatTimestamp(job.last_build_time)
  }));
}
function registerBuild(program3) {
  const build = program3.command("build").description("Trigger and inspect CodeArts compilation builds");
  build.command("list").description("List build tasks visible to the current user").option("--search <keyword>", "filter by task name").option("--limit <n>", "maximum tasks to return", "50").action(
    action(async (options, command) => {
      const client = await createClient(command);
      const jobs = await listJobs(client, {
        search: options.search,
        limit: Number(options.limit ?? 50),
        projectId: client.ctx.projectId ? await client.projectId() : void 0
      });
      emit(command, jobRows(jobs), {
        columns: ["job_id", "name", "last_status", "last_running", "last_built"]
      });
      note(command, `${jobs.length} build task(s) returned.`);
    })
  );
  build.command("show").argument("<job>", "build task id or name").description("Show one build task and its recent records").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const job = await resolveJob(client, reference);
      const response = await client.request({
        service: "codeartsbuild",
        method: "GET",
        path: "/v1/job/{job_id}/info",
        pathParams: { job_id: job.id }
      });
      emit(command, response.body);
    })
  );
  build.command("run").argument("<job>", "build task id or name").description("Run a build task, optionally against a branch with parameters").option("--branch <name>", "branch or tag to build").option("--param <name=value>", "build parameter (repeatable)", collect2, []).option("--watch", "follow the build until it finishes").option("--watch-timeout <seconds>", "give up watching after this many seconds", "1800").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const job = await resolveJob(client, reference);
      const parameters = parseAssignments(options.param, "--param");
      const body = {
        job_id: job.id,
        ...Object.keys(parameters).length > 0 ? {
          parameter: Object.entries(parameters).map(([name, value]) => ({ name, value }))
        } : {},
        ...options.branch ? { scm: { branch: options.branch, build_type: "branch" } } : {}
      };
      const response = await client.request({
        service: "codeartsbuild",
        method: "POST",
        path: "/v1/job/execute",
        body
      });
      const buildNumber = valueAtPath(response.body, "actual_build_number") ?? valueAtPath(response.body, "daily_build_number");
      emit(command, {
        job_id: job.id,
        name: job.job_name,
        build_number: buildNumber ?? "",
        daily_build_number: valueAtPath(response.body, "daily_build_number") ?? ""
      });
      if (!options.watch) return;
      const deadline = Number(options.watchTimeout ?? 1800) * 1e3;
      const started = Date.now();
      for (; ; ) {
        const status = await client.request({
          service: "codeartsbuild",
          method: "GET",
          path: "/v1/job/{job_id}/status",
          pathParams: { job_id: job.id }
        });
        const state = valueAtPath(status.body, "result.status") ?? valueAtPath(status.body, "status");
        note(command, `status=${String(state)}`);
        if (!isRecord2(status.body) || isFinished(state)) {
          process.stdout.write(`${JSON.stringify(status.body, null, 2)}
`);
          if (!isSuccess(state)) {
            throw new PluginError(
              `Build task ${job.id} finished with status "${String(state)}".`,
              "QUERY_FAILED"
            );
          }
          return;
        }
        if (Date.now() - started > deadline) {
          throw new PluginError(
            `Gave up waiting after ${Math.round((Date.now() - started) / 1e3)}s; the build is still running.
Re-check it with: codearts build status ${job.id}`,
            "QUERY_FAILED"
          );
        }
        await new Promise((resolve3) => setTimeout(resolve3, 5e3));
      }
    })
  );
  build.command("status").argument("<job>", "build task id or name").description("Show whether a build task is running and its step status").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const job = await resolveJob(client, reference);
      const running = await client.request({
        service: "codeartsbuild",
        method: "GET",
        path: "/v1/job/{job_id}/running-status",
        pathParams: { job_id: job.id }
      });
      const steps = await client.request({
        service: "codeartsbuild",
        method: "GET",
        path: "/v1/job/{job_id}/status",
        pathParams: { job_id: job.id }
      });
      process.stdout.write(`${JSON.stringify({ running: running.body, steps: steps.body }, null, 2)}
`);
    })
  );
  build.command("records").argument("<job>", "build task id or name").description("List recent build records of a task").option("--since <time>", "start of the window, e.g. -7d or an ISO timestamp", "-7d").option("--until <time>", "end of the window, defaults to now").option("--limit <n>", "maximum records to return", "20").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const job = await resolveJob(client, reference);
      const response = await client.request({
        service: "codeartsbuild",
        method: "GET",
        path: "/v1/record/{job_id}/list",
        pathParams: { job_id: job.id },
        query: {
          start_time: shiftTime(options.since, 7 * 864e5),
          end_time: options.until ? shiftTime(options.until, 0) : Date.now(),
          page_size: Number(options.limit ?? 20)
        }
      });
      emit(command, response.body);
    })
  );
  build.command("record").argument("<record-id>", "build record id, from `codearts build records`").description("Show one build record, including its stages").action(
    action(async (recordId, options, command) => {
      void options;
      const client = await createClient(command);
      const detail = await client.request({
        service: "codeartsbuild",
        method: "GET",
        path: "/v1/record/{record_id}/info",
        pathParams: { record_id: recordId }
      });
      const stages = await client.request({
        service: "codeartsbuild",
        method: "GET",
        path: "/v1/record/{record_id}/full-stages",
        pathParams: { record_id: recordId }
      });
      process.stdout.write(`${JSON.stringify({ record: detail.body, stages: stages.body }, null, 2)}
`);
    })
  );
  build.command("stop").argument("<job>", "build task id or name").description("Stop a running build task").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const job = await resolveJob(client, reference);
      const response = await client.request({
        service: "codeartsbuild",
        method: "POST",
        path: "/v1/job/{job_id}/stop",
        pathParams: { job_id: job.id }
      });
      process.stdout.write(`Stop requested for build task ${job.id}.
`);
    })
  );
}
function isSuccess(status) {
  if (status === null || status === void 0) return false;
  return ["finished", "success", "successful", "ok"].includes(String(status).toLowerCase());
}
function isFinished(status) {
  if (status === null || status === void 0) return false;
  return ["finished", "success", "successful", "failed", "aborted", "canceled", "stopped"].includes(
    String(status).toLowerCase()
  );
}
function collect2(value, previous) {
  return [...previous, value];
}

// src/scenarios/check.ts
var TASK_STATUS_LABEL = {
  "0": "checking",
  "1": "failed",
  "2": "succeeded",
  "3": "aborted"
};
var DEFECT_LEVEL_LABEL = {
  "0": "fatal",
  "1": "severe",
  "2": "general",
  "3": "hint"
};
async function listCheckTasks(client, options = {}) {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartscheck",
    method: "GET",
    path: "/v2/{project_id}/tasks",
    pathParams: { project_id: String(projectId) },
    query: { offset: 0, limit: options.limit ?? 100 }
  });
  const tasks = valueAtPath(response.body, "tasks");
  return Array.isArray(tasks) ? tasks.filter(isRecord2) : [];
}
async function resolveCheckTask(client, reference) {
  const tasks = await listCheckTasks(client, { limit: 100 });
  return matchOne(tasks, reference, {
    idKeys: ["task_id"],
    nameKeys: ["task_name"],
    label: "check task",
    listHint: "codearts check list"
  });
}
async function progress(client, taskId) {
  const response = await client.request({
    service: "codeartscheck",
    method: "GET",
    path: "/v2/tasks/{task_id}/progress",
    pathParams: { task_id: taskId }
  });
  return response.body;
}
function registerCheck(program3) {
  const check = program3.command("check").description("Run and inspect CodeArts code checks");
  check.command("list").description("List code check tasks in the project").option("--limit <n>", "maximum tasks to return", "100").action(
    action(async (options, command) => {
      const client = await createClient(command);
      const tasks = await listCheckTasks(client, { limit: Number(options.limit ?? 100) });
      emit(
        command,
        tasks.map((task) => ({
          task_id: task.task_id,
          name: task.task_name,
          branch: task.git_branch ?? "",
          repository: task.git_url ?? "",
          last_check: task.last_check_time ?? ""
        })),
        { columns: ["task_id", "name", "branch", "last_check"] }
      );
      note(command, `${tasks.length} check task(s) returned.`);
    })
  );
  check.command("run").argument("<task>", "check task id or name").description("Start a code check task and optionally follow it to completion").option("--ref <mode>", "incremental download mode, e.g. merge_request").option("--watch", "follow the check until it finishes").option("--watch-timeout <seconds>", "give up watching after this many seconds", "1800").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const task = await resolveCheckTask(client, reference);
      const response = await client.request({
        service: "codeartscheck",
        method: "POST",
        path: "/v2/tasks/{task_id}/run",
        pathParams: { task_id: task.task_id },
        ...options.ref ? { body: { ref: options.ref } } : {}
      });
      const execId = valueAtPath(response.body, "exec_id");
      emit(command, { task_id: task.task_id, name: task.task_name, exec_id: execId ?? "" });
      if (!options.watch) return;
      const detail = await poll(() => progress(client, task.task_id), {
        isDone: (value) => {
          const status = String(valueAtPath(value, "task_status") ?? "");
          return status !== "" && status !== "0";
        },
        timeoutMs: Number(options.watchTimeout ?? 1800) * 1e3,
        onTick: (value) => {
          note(command, `progress=${valueAtPath(value, "progress.ratio") ?? "?"}`);
        }
      });
      const statusCode = String(valueAtPath(detail, "task_status") ?? "");
      process.stdout.write(`
Check finished with status: ${TASK_STATUS_LABEL[statusCode] ?? statusCode}
`);
      if (statusCode !== "2") process.exit(1);
    })
  );
  check.command("status").argument("<task>", "check task id or name").description("Show the execution status of a check task").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const task = await resolveCheckTask(client, reference);
      const detail = await progress(client, task.task_id);
      const statusCode = String(valueAtPath(detail, "task_status") ?? "");
      emit(command, {
        task_id: task.task_id,
        name: task.task_name,
        status: TASK_STATUS_LABEL[statusCode] ?? statusCode,
        progress: valueAtPath(detail, "progress.ratio") ?? ""
      });
    })
  );
  check.command("summary").argument("<task>", "check task id or name").description("Show the defect and quality summary of a check task").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const task = await resolveCheckTask(client, reference);
      const response = await client.request({
        service: "codeartscheck",
        method: "GET",
        path: "/v2/tasks/{task_id}/defects-summary",
        pathParams: { task_id: task.task_id }
      });
      emit(command, response.body);
    })
  );
  check.command("defects").argument("<task>", "check task id or name").description("List the defects found by a check task").option("--severity <levels>", "comma-separated severity levels: 0 fatal, 1 severe, 2 general, 3 hint").option("--limit <n>", "maximum defects to return", "50").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const task = await resolveCheckTask(client, reference);
      const response = await client.request({
        service: "codeartscheck",
        method: "GET",
        path: "/v2/tasks/{task_id}/defects-detail",
        pathParams: { task_id: task.task_id },
        query: {
          offset: 0,
          limit: Number(options.limit ?? 50),
          ...options.severity ? { severity: options.severity } : {}
        }
      });
      const defects = valueAtPath(response.body, "defects");
      const rows = (Array.isArray(defects) ? defects : []).filter(isRecord2).map((defect) => ({
        level: DEFECT_LEVEL_LABEL[String(defect.defect_level ?? "")] ?? defect.defect_level ?? "",
        file: defect.file_path ?? "",
        line: defect.line_number ?? "",
        rule: defect.rule_name ?? defect.defect_checker_name ?? "",
        description: defect.defect_content ?? "",
        defect_id: defect.defect_id ?? ""
      }));
      emit(command, rows, {
        columns: ["level", "file", "line", "rule", "description"],
        footnote: `${rows.length} defect(s) shown; total reported by the service: ${valueAtPath(response.body, "total") ?? "unknown"}.`
      });
    })
  );
  check.command("stop").argument("<task>", "check task id or name").description("Stop a running check task").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const task = await resolveCheckTask(client, reference);
      const response = await client.request({
        service: "codeartscheck",
        method: "POST",
        path: "/v2/tasks/{task_id}/stop",
        pathParams: { task_id: task.task_id }
      });
      process.stdout.write(`Stop requested for check task ${task.task_id}.
`);
    })
  );
  check.command("history").argument("<task>", "check task id or name").description("Show past scan results of a check task").option("--limit <n>", "maximum records to return", "20").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const task = await resolveCheckTask(client, reference);
      const projectId = await client.projectId();
      const response = await client.request({
        service: "codeartscheck",
        method: "GET",
        path: "/v2/{project_id}/tasks/{task_id}/checkrecord",
        pathParams: { project_id: String(projectId), task_id: task.task_id },
        query: { offset: 0, limit: Number(options.limit ?? 20) }
      });
      emit(command, response.body);
    })
  );
}

// src/scenarios/repo.ts
async function listRepositories(client) {
  const projectId = await client.projectId();
  const { response } = await callAny(
    client,
    ["codeartsrepo.GetAllRepositoryByProjectId", "codeartsrepo.ShowAllRepositoryByTwoProjectId"],
    { project_uuid: String(projectId), project_id: String(projectId) }
  );
  return arrayFrom(response.body, ["repositorys", "repositories"]).filter(isRecord2).map((entry) => ({
    repository_id: String(entry.repoId ?? entry.repository_id ?? entry.id ?? ""),
    repository_uuid: String(entry.id ?? entry.repository_uuid ?? ""),
    name: String(entry.name ?? ""),
    group: String(entry.groupName ?? entry.group_name ?? ""),
    http_url: String(entry.httpUrl ?? entry.http_url ?? "")
  }));
}
async function resolveRepository(client, reference) {
  const repositories = await listRepositories(client);
  return matchOne(repositories, reference, {
    idKeys: ["repository_id", "repository_uuid"],
    nameKeys: ["name"],
    label: "repository",
    listHint: "codearts repo list"
  });
}
function registerRepo(program3) {
  const repo = program3.command("repo").description("Browse CodeArts repositories and merge requests");
  repo.command("list").description("List repositories in the project").action(
    action(async (options, command) => {
      void options;
      const client = await createClient(command);
      const repositories = await listRepositories(client);
      emit(command, repositories, {
        columns: ["repository_id", "name", "group", "http_url"]
      });
      note(command, `${repositories.length} repository(ies) returned.`);
    })
  );
  repo.command("show").argument("<repo>", "repository name, numeric id or uuid").description("Show one repository").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const target = await resolveRepository(client, reference);
      const { response } = await callAny(
        client,
        ["codeartsrepo.ShowRepository", "codeartsrepo.zh-cn_topic_0000002501109464"],
        { repository_id: target.repository_id }
      );
      emit(command, unwrap(response.body));
    })
  );
  repo.command("branches").argument("<repo>", "repository name, numeric id or uuid").description("List branches of a repository").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const target = await resolveRepository(client, reference);
      const { response } = await callAny(
        client,
        [
          "codeartsrepo.ListBranches",
          "codeartsrepo.ListBranchesByRepositoryId",
          "codeartsrepo.ShowBranchesByRepositoryId"
        ],
        { repository_id: target.repository_id }
      );
      const branches = arrayFrom(response.body, ["branches"]);
      emit(
        command,
        branches.filter(isRecord2).map((branch) => ({
          name: branch.name ?? "",
          commit: String(branch.commit_id ?? valueAtPath(branch, "commit.id") ?? "").slice(0, 10),
          default: branch.default === true || branch.is_default === true ? "yes" : ""
        })),
        { columns: ["name", "commit", "default"] }
      );
    })
  );
  const mr = repo.command("mr").description("Work with merge requests");
  mr.command("list").argument("<repo>", "repository name, numeric id or uuid").description("List merge requests of a repository").option("--state <state>", "filter by state, e.g. opened, merged, closed").option("--limit <n>", "maximum merge requests to return", "20").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const target = await resolveRepository(client, reference);
      const { response } = await callAny(
        client,
        [
          "codeartsrepo.ListRepositoryMergeRequests",
          "codeartsrepo.ListMergeRequest",
          "codeartsrepo.zh-cn_topic_0000002500949600"
        ],
        {
          repository_id: target.repository_id,
          ...options.state ? { state: options.state } : {},
          offset: 0,
          limit: Number(options.limit ?? 20)
        }
      );
      const list = arrayFrom(response.body, ["merge_requests", "merge_request", "data"]);
      const rows = list.filter(isRecord2).map((entry) => ({
        iid: entry.iid ?? entry.id ?? "",
        title: entry.title ?? "",
        state: entry.state ?? "",
        source: entry.source_branch ?? "",
        target: entry.target_branch ?? "",
        updated: entry.updated_at ?? ""
      }));
      emit(command, rows, { columns: ["iid", "title", "state", "source", "target", "updated"] });
    })
  );
  mr.command("show").argument("<repo>", "repository name, numeric id or uuid").argument("<iid>", "merge request iid").description("Show one merge request").action(
    action(async (reference, iid, options, command) => {
      void options;
      const client = await createClient(command);
      const target = await resolveRepository(client, reference);
      const { response } = await callAny(
        client,
        ["codeartsrepo.ShowMergeRequestDetail", "codeartsrepo.ShowMergeRequest"],
        {
          repository_id: target.repository_id,
          merge_request_iid: iid,
          merge_request_id: iid
        }
      );
      emit(command, unwrap(response.body));
    })
  );
  mr.command("create").argument("<repo>", "repository name, numeric id or uuid").description("Open a merge request").requiredOption("--source <branch>", "source branch").requiredOption("--target <branch>", "target branch").requiredOption("--title <text>", "merge request title").option("--description <text>", "merge request description").option("--reviewer-ids <ids>", "comma-separated reviewer user ids").option("--assignee-ids <ids>", "comma-separated assignee user ids").option("--squash", "squash commits on merge").option("--remove-source-branch", "delete the source branch after merge").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const target = await resolveRepository(client, reference);
      const { response } = await callAny(
        client,
        ["codeartsrepo.CreateMergeRequest", "codeartsrepo.zh-cn_topic_0000002501109512"],
        { repository_id: target.repository_id },
        {
          title: options.title,
          source_branch: options.source,
          target_branch: options.target,
          state: "opened",
          ...options.description ? { description: options.description } : {},
          ...options.reviewerIds ? { reviewer_ids: options.reviewerIds } : {},
          ...options.assigneeIds ? { assignee_ids: options.assigneeIds } : {},
          ...options.squash ? { squash: true } : {},
          ...options.removeSourceBranch ? { force_remove_source_branch: true } : {}
        }
      );
      emit(command, {
        iid: valueAtPath(response.body, "iid") ?? "",
        id: valueAtPath(response.body, "id") ?? "",
        title: valueAtPath(response.body, "title") ?? "",
        state: valueAtPath(response.body, "state") ?? "",
        source_branch: valueAtPath(response.body, "source_branch") ?? "",
        target_branch: valueAtPath(response.body, "target_branch") ?? ""
      });
    })
  );
  mr.command("merge").argument("<repo>", "repository name, numeric id or uuid").argument("<iid>", "merge request iid").description("Merge a merge request").option("--message <text>", "merge commit message").option("--squash", "squash commits").action(
    action(async (reference, iid, options, command) => {
      const client = await createClient(command);
      const target = await resolveRepository(client, reference);
      const { response } = await callAny(
        client,
        ["codeartsrepo.MergeMergeRequest", "codeartsrepo.zh-cn_topic_0000002501109508"],
        { repository_id: target.repository_id, merge_request_iid: iid },
        {
          ...options.message ? { merge_commit_message: options.message } : {},
          ...options.squash ? { squash: true } : {}
        }
      );
      emit(command, {
        state: valueAtPath(response.body, "state") ?? "",
        merged_at: valueAtPath(response.body, "merged_at") ?? "",
        merge_commit_sha: valueAtPath(response.body, "merge_commit_sha") ?? ""
      });
    })
  );
  mr.command("comments").argument("<repo>", "repository name, numeric id or uuid").argument("<iid>", "merge request iid").description("List review comments on a merge request").option("--limit <n>", "maximum comments to return", "50").action(
    action(async (reference, iid, options, command) => {
      const client = await createClient(command);
      const target = await resolveRepository(client, reference);
      const { response } = await callAny(
        client,
        ["codeartsrepo.ListMergeRequestDiscussions", "codeartsrepo.GetMergeRequestDiscussions"],
        {
          repository_id: target.repository_id,
          merge_request_iid: iid,
          offset: 0,
          limit: Number(options.limit ?? 50)
        }
      );
      const list = arrayFrom(response.body, ["discussions", "reviews"]);
      const rows = (Array.isArray(list) ? list : []).filter(isRecord2).map((entry) => ({
        discussion_id: entry.id ?? "",
        individual_note: entry.individual_note ?? "",
        notes: Array.isArray(entry.notes) ? entry.notes.length : ""
      }));
      emit(command, rows, { columns: ["discussion_id", "individual_note", "notes"] });
    })
  );
  mr.command("comment").argument("<repo>", "repository name, numeric id or uuid").argument("<iid>", "merge request iid").description("Add a comment to a merge request").requiredOption("--body <text>", "comment text").action(
    action(async (reference, iid, options, command) => {
      const client = await createClient(command);
      const target = await resolveRepository(client, reference);
      const { response } = await callAny(
        client,
        [
          "codeartsrepo.CreateMergeRequestDiscussion_0",
          "codeartsrepo.CreateMergeRequestDiscussion"
        ],
        { repository_id: target.repository_id, merge_request_iid: iid },
        { body: options.body }
      );
      emit(command, response.body);
    })
  );
}

// src/scenarios/deploy.ts
async function listApps(client, size = 100) {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartsdeploy",
    method: "POST",
    path: "/v1/applications/list",
    body: { project_id: projectId, page: 1, size }
  });
  const result = valueAtPath(response.body, "result");
  return Array.isArray(result) ? result.filter(isRecord2) : [];
}
async function resolveApp(client, reference) {
  const apps = await listApps(client);
  return matchOne(apps, reference, {
    idKeys: ["id"],
    nameKeys: ["name"],
    label: "deployment application",
    listHint: "codearts deploy apps"
  });
}
function registerDeploy(program3) {
  const deploy = program3.command("deploy").description("Deploy applications and inspect deployment environments");
  deploy.command("apps").description("List deployment applications in the project").action(
    action(async (options, command) => {
      void options;
      const client = await createClient(command);
      const apps = await listApps(client);
      emit(
        command,
        apps.map((app) => ({
          application_id: app.id,
          name: app.name,
          state: app.execution_state ?? "",
          last_deployed: formatTimestamp(app.end_time),
          executor: app.executor_nick_name ?? ""
        })),
        { columns: ["application_id", "name", "state", "last_deployed", "executor"] }
      );
      note(command, `${apps.length} application(s) returned.`);
    })
  );
  deploy.command("app").argument("<application>", "application id or name").description("Show one deployment application").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const app = await resolveApp(client, reference);
      const response = await client.request({
        service: "codeartsdeploy",
        method: "GET",
        path: "/v1/applications/{application_id}/info",
        pathParams: { application_id: app.id }
      });
      emit(command, response.body);
    })
  );
  deploy.command("envs").argument("<application>", "application id or name").description("List the environments of an application").action(
    action(async (reference, options, command) => {
      void options;
      const client = await createClient(command);
      const app = await resolveApp(client, reference);
      const projectId = await client.projectId();
      const response = await client.request({
        service: "codeartsdeploy",
        method: "GET",
        path: "/v1/applications/{application_id}/environments",
        pathParams: { application_id: app.id },
        query: { project_id: String(projectId), page_index: 1, page_size: 100 }
      });
      const list = (Array.isArray(response.body) ? response.body : void 0) ?? valueAtPath(response.body, "result") ?? [];
      emit(
        command,
        (Array.isArray(list) ? list : []).filter(isRecord2).map((environment) => ({
          environment_id: environment.id ?? environment.environment_id ?? "",
          name: environment.name ?? "",
          description: environment.description ?? ""
        })),
        { columns: ["environment_id", "name", "description"] }
      );
    })
  );
  deploy.command("run").argument("<application>", "application id or name").description("Start a deployment and report the created record").option("--param <name=value>", "deployment parameter (repeatable)", collect3, []).action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const app = await resolveApp(client, reference);
      const params = parseParams(options.param);
      const response = await client.request({
        service: "codeartsdeploy",
        method: "POST",
        path: "/v2/tasks/{task_id}/start",
        pathParams: { task_id: app.id },
        body: { params, trigger_source: "API" }
      });
      emit(command, {
        application_id: app.id,
        name: app.name,
        record_id: valueAtPath(response.body, "id") ?? "",
        job_name: valueAtPath(response.body, "job_name") ?? ""
      });
      note(command, `Follow the deployment with: codearts deploy history ${app.id}`);
    })
  );
  deploy.command("history").argument("<application>", "application id or name").description("List recent deployment records of an application").option("--since <time>", "window start, e.g. -7d or an ISO timestamp", "-7d").option("--limit <n>", "maximum records to return", "20").action(
    action(async (reference, options, command) => {
      const client = await createClient(command);
      const app = await resolveApp(client, reference);
      const projectId = await client.projectId();
      const response = await client.request({
        service: "codeartsdeploy",
        method: "GET",
        path: "/v2/{project_id}/task/{task_id}/history",
        pathParams: { project_id: String(projectId), task_id: app.id },
        query: {
          page: 1,
          size: Number(options.limit ?? 20),
          start_date: new Date(shiftTime(options.since, 7 * 864e5)).toISOString(),
          end_date: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      const list = (Array.isArray(response.body) ? response.body : void 0) ?? valueAtPath(response.body, "result") ?? valueAtPath(response.body, "records") ?? [];
      emit(
        command,
        (Array.isArray(list) ? list : []).filter(isRecord2).map((record) => ({
          record_id: record.id ?? "",
          state: record.state ?? record.execution_state ?? "",
          operator: record.operator ?? record.executor ?? "",
          started: formatTimestamp(record.start_time ?? record.create_time),
          ended: formatTimestamp(record.end_time)
        })),
        { columns: ["record_id", "state", "operator", "started", "ended"] }
      );
    })
  );
  deploy.command("hosts").description("List host clusters and their hosts").option("--cluster <id>", "list the hosts of one cluster instead of the cluster list").action(
    action(async (options, command) => {
      const client = await createClient(command);
      const projectId = await client.projectId();
      if (options.cluster) {
        const response2 = await client.request({
          service: "codeartsdeploy",
          method: "GET",
          path: "/v1/resources/host-groups/{group_id}/hosts",
          pathParams: { group_id: String(options.cluster) },
          query: { page_index: 1, page_size: 100 }
        });
        const hosts = valueAtPath(response2.body, "result") ?? [];
        emit(
          command,
          (Array.isArray(hosts) ? hosts : []).filter(isRecord2).map((host) => ({
            host_id: host.id ?? "",
            ip: host.ip ?? "",
            name: host.name ?? "",
            os: host.os ?? "",
            connection_status: host.connection_status ?? ""
          })),
          { columns: ["host_id", "ip", "name", "os", "connection_status"] }
        );
        return;
      }
      const response = await client.request({
        service: "codeartsdeploy",
        method: "GET",
        path: "/v1/resources/host-groups",
        query: { project_id: String(projectId), page_index: 1, page_size: 100 }
      });
      const clusters = valueAtPath(response.body, "result") ?? [];
      emit(
        command,
        (Array.isArray(clusters) ? clusters : []).filter(isRecord2).map((cluster) => ({
          cluster_id: cluster.id ?? cluster.group_id ?? "",
          name: cluster.name ?? "",
          os: cluster.os ?? "",
          hosts: cluster.host_count ?? ""
        })),
        { columns: ["cluster_id", "name", "os", "hosts"] }
      );
    })
  );
}
function parseParams(values) {
  const result = [];
  for (const entry of values ?? []) {
    const index = entry.indexOf("=");
    if (index <= 0) continue;
    result.push({ name: entry.slice(0, index), value: entry.slice(index + 1) });
  }
  return result;
}
function collect3(value, previous) {
  return [...previous, value];
}

// src/scenarios/artifact.ts
import { readFileSync as readFileSync4, writeFileSync } from "node:fs";
import { basename } from "node:path";
function isUnpublished(error) {
  return /APIGW\.0101/.test(error.message ?? "");
}
async function listRepositories2(client, options = {}) {
  const projectId = await client.projectId();
  const tenantId = options.tenant ?? await client.tenantId();
  let response;
  try {
    response = await client.request({
      service: "codeartsartifact",
      method: "GET",
      path: "/cloudartifact/v5/{tenant_id}/{project_id}/repositories",
      pathParams: { tenant_id: tenantId, project_id: String(projectId) },
      query: {
        page_no: 1,
        page_size: 100,
        ...options.search ? { qname: options.search } : {},
        ...options.format ? { format: options.format } : {}
      }
    });
  } catch (error) {
    if (isUnpublished(error)) {
      throw new PluginError(
        "This deployment does not publish the private-repository API (/cloudartifact/... is absent from the gateway).\nOnly the release library is available here; try:\n  codearts artifact versions\n  codearts artifact release-files <file-name>",
        "QUERY_FAILED"
      );
    }
    throw error;
  }
  const repositories = valueAtPath(response.body, "result.repositories");
  if (!Array.isArray(repositories)) return [];
  return repositories.filter(isRecord2).map((entry) => ({
    id: String(entry.id ?? entry.repoId ?? entry.name ?? ""),
    name: String(entry.name ?? entry.repositoryName ?? ""),
    format: String(entry.format ?? "")
  }));
}
async function resolveRepository2(client, reference, tenant) {
  const repositories = await listRepositories2(client, { tenant });
  return matchOne(repositories, reference, {
    idKeys: ["id"],
    nameKeys: ["name"],
    label: "artifact repository",
    listHint: "codearts artifact repos"
  });
}
function registerArtifact(program3) {
  const artifact = program3.command("artifact").description("Browse artifact repositories and move files in and out");
  artifact.command("repos").description("List artifact repositories").option("--search <keyword>", "filter repositories by name").option("--format-filter <format>", "filter by package format, e.g. maven, npm, docker").option("--tenant <id>", "account (tenant) id when it is not configured").action(
    action(async (options, command) => {
      const client = await createClient(command);
      const repositories = await listRepositories2(client, {
        search: options.search,
        format: options.formatFilter,
        tenant: options.tenant
      });
      emit(command, repositories, { columns: ["name", "format", "id"] });
      note(command, `${repositories.length} repository(ies) returned.`);
    })
  );
  artifact.command("versions").description("List release-library versions of the project").option("--build-version <version>", "filter by build version").option("--limit <n>", "maximum versions to return", "20").action(
    action(async (options, command) => {
      const client = await createClient(command);
      const projectId = await client.projectId();
      const response = await client.request({
        service: "codeartsartifact",
        method: "GET",
        path: "/v1/{project_id}/versions",
        pathParams: { project_id: String(projectId) },
        query: {
          offset: 0,
          limit: Number(options.limit ?? 20),
          ...options.buildVersion ? { build_version: options.buildVersion } : {}
        }
      });
      const result = valueAtPath(response.body, "result");
      if (Array.isArray(result)) {
        emit(command, result);
        return;
      }
      emit(command, response.body);
    })
  );
  artifact.command("release-files").argument("<file-name>", "release file name to look up").description("Find the versions of one release file").option("--limit <n>", "maximum rows to return", "20").action(
    action(async (fileName, options, command) => {
      const client = await createClient(command);
      const projectId = await client.projectId();
      const response = await client.request({
        service: "codeartsartifact",
        method: "GET",
        path: "/v2/{project_id}/release/files",
        pathParams: { project_id: String(projectId) },
        query: { file_name: fileName, offset: 0, limit: Number(options.limit ?? 20) }
      });
      emit(command, response.body);
    })
  );
  artifact.command("release-file").argument("<file-name>", "release file name").argument("<file-path>", "path of the file inside the release library").description("Show one release-library file").action(
    action(
      async (fileName, filePath, options, command) => {
        void options;
        const client = await createClient(command);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartsartifact",
          method: "GET",
          path: "/v2/{project_id}/release/file",
          pathParams: { project_id: String(projectId) },
          query: { file_name: fileName, file_path: filePath }
        });
        emit(command, response.body);
      }
    )
  );
  artifact.command("search").argument("<artifact-name>", "artifact name, or part of it").description("Search artifacts across repositories").option("--type <type>", "artifact type filter").option("--limit <n>", "maximum results", "30").action(
    action(async (name, options, command) => {
      const client = await createClient(command);
      const projectId = await client.projectId();
      const response = await client.request({
        service: "codeartsartifact",
        method: "POST",
        path: "/cloudartifact/v5/tree/repos/artifacts",
        body: {
          artifact_name: name,
          project_id: projectId,
          in_project: true,
          page_no: 1,
          page_size: Number(options.limit ?? 30),
          ...options.type ? { artifact_type: options.type } : {}
        }
      });
      const list = valueAtPath(response.body, "result.data") ?? valueAtPath(response.body, "result") ?? [];
      emit(
        command,
        (Array.isArray(list) ? list : []).filter(isRecord2).map((entry) => ({
          name: entry.name ?? entry.artifact_name ?? "",
          version: entry.version ?? "",
          repository: entry.repo ?? entry.repository_name ?? "",
          path: entry.path ?? ""
        })),
        { columns: ["name", "version", "repository", "path"] }
      );
    })
  );
  artifact.command("upload").argument("<repository>", "repository name or id").argument("<file>", "local file to upload").description("Upload one file into an artifact repository").requiredOption("--path <remote-path>", "remote path inside the repository").option("--tenant <id>", "account (tenant) id when it is not configured").action(
    action(
      async (reference, file, options, command) => {
        const client = await createClient(command);
        const repository = await resolveRepository2(
          client,
          reference,
          options.tenant
        );
        const content = readFileSync4(file);
        const response = await client.request({
          service: "codeartsartifact",
          method: "PUT",
          path: "/artgalaxy/{repo_id}/{file_path}",
          pathParams: {
            repo_id: repository.id,
            file_path: String(options.path).replace(/^\/+/, "")
          },
          headers: { "content-type": "application/octet-stream" },
          body: content
        });
        emit(command, response.body);
        note(command, `Uploaded ${basename(file)} to ${repository.name}.`);
      }
    )
  );
  artifact.command("download").argument("<repository>", "repository name or id").argument("<remote-path>", "path of the file inside the repository").description("Download one file from an artifact repository").requiredOption("--out <path>", "local destination file").option("--tenant <id>", "account (tenant) id when it is not configured").action(
    action(
      async (reference, remotePath, options, command) => {
        const client = await createClient(command);
        const repository = await resolveRepository2(
          client,
          reference,
          options.tenant
        );
        const response = await client.request({
          service: "codeartsartifact",
          method: "GET",
          path: "/artgalaxy/{repo_id}/{file_path}",
          pathParams: { repo_id: repository.id, file_path: remotePath.replace(/^\/+/, "") }
        });
        writeFileSync(String(options.out), response.buffer);
        process.stdout.write(
          `Saved ${response.buffer.length} bytes to ${options.out}.
`
        );
      }
    )
  );
}

// src/scenarios/wiki.ts
import { readFileSync as readFileSync5, writeFileSync as writeFileSync2 } from "node:fs";
async function knowledgeBaseId(client) {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartswiki",
    method: "GET",
    path: "/v1/openapi/project/zhishiku/{project_id}",
    pathParams: { project_id: String(projectId) }
  });
  const id = valueAtPath(response.body, "id");
  if (!id) {
    throw new PluginError(
      `The project has no knowledge base, or the response shape changed.
${JSON.stringify(
        response.body
      ).slice(0, 300)}`,
      "QUERY_FAILED"
    );
  }
  return String(id);
}
async function fileLibraryId(client) {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartswiki",
    method: "GET",
    path: "/v1/openapi/project/clouddrive/{project_id}",
    pathParams: { project_id: String(projectId) }
  });
  const id = valueAtPath(response.body, "id");
  if (!id) {
    throw new PluginError(
      `The project has no file library, or the response shape changed.
${JSON.stringify(
        response.body
      ).slice(0, 300)}`,
      "QUERY_FAILED"
    );
  }
  return String(id);
}
async function documentTree(client) {
  const response = await client.request({
    service: "codeartswiki",
    method: "GET",
    path: "/v1/openapi/doc/{zhishiku_id}/tree",
    pathParams: { zhishiku_id: await knowledgeBaseId(client) }
  });
  const children = valueAtPath(response.body, "children");
  return (Array.isArray(children) ? children : []).filter(isRecord2);
}
function treeRows(root) {
  return flattenTree(root).map((node) => ({
    depth: node.depth,
    id: node.id ?? "",
    name: `${"  ".repeat(Number(node.depth))}${node.name ?? ""}`,
    type: node.type ?? ""
  }));
}
function registerWiki(program3) {
  const wiki = program3.command("wiki").description("Read CodeArts Wiki documents and files");
  wiki.command("tree").description("Show the document tree of the project knowledge base").action(
    action(async (options, command) => {
      void options;
      const client = await createClient(command);
      const tree = await documentTree(client);
      emit(command, treeRows(tree), { columns: ["id", "name", "type"] });
    })
  );
  wiki.command("doc").argument("<document>", "document id").description("Print a wiki document").action(
    action(async (documentId, options, command) => {
      void options;
      const client = await createClient(command);
      const response = await client.request({
        service: "codeartswiki",
        method: "GET",
        path: "/v1/openapi/content/doc/{id}",
        pathParams: { id: documentId }
      });
      const body = response.body;
      const content = valueAtPath(body, "content") ?? valueAtPath(body, "doc_content") ?? valueAtPath(body, "body") ?? valueAtPath(body, "data.content");
      if (typeof content === "string") {
        process.stdout.write(`${content}
`);
        return;
      }
      emit(command, body);
    })
  );
  wiki.command("files").description("Show the file tree of the project file library").action(
    action(async (options, command) => {
      void options;
      const client = await createClient(command);
      const response = await client.request({
        service: "codeartswiki",
        method: "GET",
        path: "/v1/openapi/clouddrive/{zhishiku_id}/tree",
        pathParams: { zhishiku_id: await fileLibraryId(client) }
      });
      const children = valueAtPath(response.body, "children");
      emit(command, treeRows(Array.isArray(children) ? children : []), {
        columns: ["id", "name", "type"]
      });
    })
  );
  wiki.command("download").requiredOption("--id <file-id>", "file id from `codearts wiki files`").requiredOption("--out <path>", "local destination file").description("Download a file from the project file library").action(
    action(async (options, command) => {
      const client = await createClient(command);
      const response = await client.request({
        service: "codeartswiki",
        method: "GET",
        path: "/v1/openapi/file/download",
        query: { id: String(options.id) }
      });
      writeFileSync2(String(options.out), response.buffer);
      process.stdout.write(`Saved ${response.buffer.length} bytes to ${options.out}.
`);
    })
  );
  wiki.command("upload").argument("<file>", "local file to upload").description("Upload a file into a project file library folder").requiredOption("--parent-id <id>", "parent folder id from `codearts wiki files`").action(
    action(async (file, options, command) => {
      const client = await createClient(command);
      const projectId = await client.projectId();
      const content = readFileSync5(file);
      const multipart = buildMultipart(
        { project_id: String(projectId), parent_id: String(options.parentId) },
        [{ field: "file", filename: file.split("/").pop() ?? "file", content }]
      );
      const response = await client.request({
        service: "codeartswiki",
        method: "POST",
        path: "/v1/openapi/prj/upload",
        headers: { "content-type": multipart.contentType },
        body: multipart.body
      });
      emit(command, response.body);
    })
  );
  wiki.command("find").argument("<name>", "document name, or part of it").description("Find document ids by name").action(
    action(async (name, options, command) => {
      void options;
      const client = await createClient(command);
      const tree = await documentTree(client);
      const rows = flattenTree(tree).filter(
        (node) => String(node.name ?? "").includes(name)
      );
      if (rows.length === 0) {
        throw new PluginError(
          `No document matches "${name}".
Browse the tree with: codearts wiki tree`,
          "QUERY_FAILED"
        );
      }
      emit(
        command,
        rows.map((node) => ({ id: node.id ?? "", name: node.name ?? "", type: node.type ?? "" })),
        { columns: ["id", "name", "type"] }
      );
    })
  );
}

// src/scenarios/board.ts
function registerBoard(program3) {
  const board = program3.command("board").description("Query CodeArts Board metrics and datasets");
  board.command("query").argument("<api-name>", "name of the self-service data extraction API defined in Board").description("Call a Board dataset API and print the returned rows").option("--param <name=value>", "filter passed to the dataset (repeatable)", collect4, []).option("--limit <n>", "maximum rows", "100").option("--offset <n>", "row offset", "0").option("--all", "do not truncate the table").action(
    action(async (apiName, options, command) => {
      const client = await createClient(command);
      const body = parseKeyValues(options.param, "--param");
      const response = await client.request({
        service: "codeartsboard",
        method: "POST",
        path: "/v1/{project_id}/access-data-api/{api_name}",
        pathParams: { api_name: apiName },
        query: {
          limit: Number(options.limit ?? 100),
          offset: Number(options.offset ?? 0)
        },
        body
      });
      const rows = (Array.isArray(response.body) ? response.body : void 0) ?? valueAtPath(response.body, "data") ?? valueAtPath(response.body, "result");
      if (Array.isArray(rows)) {
        const limited = options.all ? rows : rows.slice(0, 200);
        emit(command, limited);
        note(command, `${rows.length} row(s) returned by ${apiName}.`);
        return;
      }
      if (isRecord2(response.body)) {
        emit(command, response.body);
        return;
      }
      emit(command, response.body);
    })
  );
  board.command("show").argument("<api-name>", "name of the self-service data extraction API").description("Show the raw response shape of a Board dataset API").action(
    action(async (apiName, options, command) => {
      void options;
      const client = await createClient(command);
      const response = await client.request({
        service: "codeartsboard",
        method: "POST",
        path: "/v1/{project_id}/access-data-api/{api_name}",
        pathParams: { api_name: apiName },
        query: { limit: 1, offset: 0 },
        body: {}
      });
      emit(command, response.body);
    })
  );
}
function collect4(value, previous) {
  return [...previous, value];
}

// src/scenarios/flow.ts
var AREAS = ["pipeline", "build", "check", "deploy"];
async function collect5(client, area) {
  if (area === "pipeline") {
    const pipelines = await listPipelines(client, { limit: 30 });
    return pipelines.map((pipeline) => {
      const row = runRows(pipeline);
      return {
        area: "pipeline",
        name: String(row.name ?? ""),
        status: String(row.last_status ?? ""),
        detail: `run ${row.last_run_id ?? "-"} at ${row.last_started ?? "-"}`
      };
    });
  }
  if (area === "build") {
    const jobs = await listJobs(client, { limit: 30, projectId: await client.projectId() });
    return jobs.map((job) => ({
      area: "build",
      name: String(job.job_name ?? ""),
      status: String(job.last_build_status ?? ""),
      detail: `last built ${formatTimestamp(job.last_build_time) || "-"}`
    }));
  }
  if (area === "check") {
    const tasks = await listCheckTasks(client, { limit: 30 });
    return tasks.map((task) => ({
      area: "check",
      name: String(task.task_name ?? ""),
      // The task list carries no status; report when it last ran instead.
      status: task.last_check_time ? "checked" : "never-checked",
      detail: `last check ${String(task.last_check_time ?? "-")}`
    }));
  }
  const apps = await listApps(client, 30);
  return apps.map((app) => ({
    area: "deploy",
    name: String(app.name ?? ""),
    status: String(app.execution_state ?? ""),
    detail: `last deployed ${formatTimestamp(app.end_time) || "-"}`
  }));
}
function registerFlow(program3) {
  program3.command("flow").description("Show the development-to-operations status of the project").option("--area <area>", "limit to one area: pipeline | build | check | deploy").option("--limit <n>", "maximum rows per area", "30").action(
    action(async (options, command) => {
      const requested = options.area ? String(options.area) : void 0;
      if (requested && !AREAS.includes(requested)) {
        throw new Error(`Unknown area "${requested}". Choose one of: ${AREAS.join(", ")}.`);
      }
      const client = await createClient(command);
      const areas = requested ? [requested] : [...AREAS];
      const limit = Number(options.limit ?? 30);
      const targets = client.ctx.projectId ? [{ identifier: await client.projectId() ?? "", name: client.ctx.projectId ?? "" }] : await client.projects();
      const rows = [];
      const failures = [];
      for (const target of targets) {
        const scoped = {
          ...client,
          projectId: async () => target.identifier
        };
        for (const area of areas) {
          try {
            const collected = await collect5(scoped, area);
            rows.push(
              ...collected.slice(0, limit).map((row) => ({ ...row, project: target.name || target.identifier }))
            );
          } catch (error) {
            failures.push(
              `${target.name || target.identifier} / ${area}: ${error.message.split("\n")[0]}`
            );
          }
        }
      }
      emit(command, rows, {
        columns: ["project", "area", "name", "status", "detail"],
        footnote: `${rows.length} entr(ies) across ${targets.length} project(s) and ${areas.length} area(s).`
      });
      if (failures.length > 0) {
        process.stderr.write(`
Unavailable areas:
${failures.map((line) => `  ${line}`).join("\n")}
`);
        note(command, "Retry a single area with: codearts flow --area <area>");
      }
    })
  );
}

// src/scenarios/index.ts
function registerScenarios(program3) {
  registerPipeline(program3);
  registerBuild(program3);
  registerCheck(program3);
  registerRepo(program3);
  registerDeploy(program3);
  registerArtifact(program3);
  registerWiki(program3);
  registerBoard(program3);
  registerFlow(program3);
}

// src/codearts.ts
function collectFields(value, previous) {
  return [...previous, ...value.split(",").map((entry) => entry.trim()).filter(Boolean)];
}
var program2 = new Command();
program2.name("codearts").description(
  "Huawei Cloud CodeArts CLI \u2014 pipelines, builds, checks, repos, deploys, artifacts, wiki and board"
).version("0.1.0").option("--format <format>", "output format: table | json | text", "table").option("--project <name|id>", "CodeArts project for this command; required when several are visible").option("--endpoint <url>", "override the configured gateway for this invocation").option("--dry-run", "print the request that would be sent without sending it").option("--verbose", "print request details and extra context on stderr").option("--fields <path>", "keep only this dotted path in the response (repeatable)", collectFields, []);
program2.command("setup").description("Configure the CodeArts gateway and credentials in the browser").action(
  action(async () => {
    const existing = await readConfig();
    const { saved } = await openConfigUI("codearts", {
      ...CONFIG_UI,
      intent: existing ? "edit" : "create"
    });
    if (!saved) {
      process.stderr.write("Setup was closed without saving.\n");
      process.exit(1);
    }
    process.stdout.write("Configuration saved.\n");
  })
);
program2.command("config").description("Show the configured endpoints and credentials (secrets masked)").option("--ui", "open the configuration form, pre-filled, instead of only printing").action(
  action(async (options) => {
    const before = await readConfig();
    if (options.ui) {
      const result = await openConfigUI("codearts", {
        ...CONFIG_UI,
        intent: before ? "edit" : "create",
        reason: REASON_NEEDS_CONFIG
      });
      if (!result.opened) {
        process.stderr.write("Could not serve the configuration form; printing the stored configuration instead.\n");
      } else if (!result.saved) {
        process.stderr.write("No changes were saved.\n");
      }
    }
    const config = await readConfig();
    if (!config) {
      process.stderr.write("No configuration yet. Run: codearts config --ui\n");
      process.exit(1);
    }
    process.stdout.write(
      `${summarizeConfig(config, { spec: CONFIG_UI.spec }).join("\n")}
`
    );
    for (const line of credentialDiagnosis(config)) process.stdout.write(`${line}
`);
    process.stdout.write(`configPath=${codeartsConfigPath()}
`);
  })
);
program2.command("doctor").description("Verify the gateway, credentials and catalog before doing real work").action(
  action(async (options, command) => {
    void options;
    const lines = [];
    const config = await readConfig();
    if (!config) {
      process.stderr.write("No configuration yet. Run: codearts config --ui\n");
      process.exit(1);
    }
    lines.push("Configuration");
    for (const line of summarizeConfig(config, { spec: CONFIG_UI.spec })) {
      lines.push(`  ${line}`);
    }
    lines.push("", "Credentials");
    for (const line of credentialDiagnosis(config)) lines.push(`  ${line}`);
    const catalog = loadCatalog();
    lines.push("", "Catalog");
    lines.push(`  operations=${catalog.operations.length}`);
    lines.push(`  services=${catalog.services.length}`);
    lines.push(`  extractedFrom=${catalog.source}`);
    lines.push(`  generatedAt=${catalog.generatedAt}`);
    lines.push("", "Connectivity");
    let connected = false;
    try {
      const client = await createClient(command);
      const projects = await client.projects();
      connected = true;
      lines.push(`  project discovery: OK (${projects.length} visible)`);
      for (const project2 of projects.slice(0, 10)) {
        lines.push(`    ${project2.identifier}  ${project2.name}`);
      }
      if (projects.length > 10) lines.push(`    \u2026 and ${projects.length - 10} more`);
    } catch (error) {
      lines.push(`  project discovery: FAILED \u2014 ${error.message}`);
    }
    process.stdout.write(`${lines.join("\n")}
`);
    if (!connected) process.exit(1);
  })
);
program2.command("probe").argument("<url...>", "candidate gateway addresses to test").description("Test candidate gateway addresses without credentials").option(
  "--service <service>",
  "probe the documented path of this service instead of the generic one"
).action(
  action(async (urls, options, command) => {
    const requested = options.service ? resolveService(String(options.service)) : void 0;
    if (options.service && !requested) {
      throw new PluginError(
        `Unknown service "${String(options.service)}".
Available: ${loadCatalog().services.map((entry) => entry.label).join(", ")}`,
        "CONFIG_INVALID"
      );
    }
    const probe = requested ? SERVICE_PROBES.find((entry) => entry.service === requested.service) : void 0;
    const globals = command.optsWithGlobals();
    const probePath = probe ? probe.path.replace("{project_id}", globals.project ?? "0000000000000000000000000000abcd") : void 0;
    const results = [];
    for (const url of urls) {
      const result = await probeEndpoint(url, 8e3, {
        ...probe ? { method: probe.method, path: probePath } : {}
      });
      results.push({
        url: result.url,
        service: requested?.label ?? "",
        reachable: result.reachable ? "yes" : "no",
        codearts: result.looksLikeCodearts ? "yes" : "",
        status: result.status ?? "",
        detail: result.detail
      });
    }
    emit(command, results, {
      columns: ["url", "service", "reachable", "status", "codearts", "detail"],
      footnote: requested ? `Probed ${requested.label}'s documented path. A host answering 401/403 serves this service; 404/APIGW.0101 here means this path is not published on it.` : "Without --service this probes one generic path, which some deployments do not publish; prefer `codearts endpoint discover` for endpoint decisions."
    });
  })
);
var endpoint = program2.command("endpoint").description("Discover and manage the per-service API endpoints of your deployment");
endpoint.command("list").description("Show the endpoint each service will use").action(
  action(async (options, command) => {
    void options;
    const config = await readConfig();
    const rows = loadCatalog().services.map((service) => ({
      service: service.label,
      endpoint: config?.endpoints?.[service.service] ?? service.service,
      source: config?.endpoints?.[service.service] ? "override" : "gateway"
    }));
    emit(command, rows, {
      columns: ["service", "endpoint", "source"],
      footnote: "`override` comes from the per-service endpoint map; everything else goes to the configured gateway."
    });
  })
);
endpoint.command("discover").description("Probe the deployment for the host that serves each service").option("--region <region>", "region or region0_id, e.g. cn-north-4").option("--domain <domain>", "deployment domain, e.g. example.com").option("--service <service>", "limit discovery to one service").option("--timeout <seconds>", "per-candidate timeout", "6").option("--write", "save the discovered endpoints to the configuration").action(
  action(async (options, command) => {
    const config = await readConfig();
    const region = options.region ?? config?.region;
    const domain = normaliseDomain(
      options.domain ?? config?.deploymentDomain
    );
    if (!region || !domain) {
      throw new PluginError(
        "Endpoint discovery needs a region and a domain.\nPass them explicitly, for example:\n  codearts endpoint discover --region <region0_id> --domain <domain>\nor save them with `codearts config --ui`.",
        "CONFIG_INVALID"
      );
    }
    const globals = command.optsWithGlobals();
    const projectId = globals.project ?? "0000000000000000000000000000abcd";
    const results = await discoverEndpoints({
      region,
      domain,
      projectId,
      services: options.service ? [String(options.service)] : void 0,
      timeoutMs: Number(options.timeout ?? 6) * 1e3
    });
    emit(
      command,
      results.map((result) => ({
        service: result.label,
        endpoint: result.endpoint ?? "(not found)",
        detail: result.endpoint ? "serves this service" : result.detail
      })),
      { columns: ["service", "endpoint", "detail"] }
    );
    const found = results.filter((result) => result.endpoint);
    if (options.write === true && found.length > 0) {
      const endpoints = { ...config?.endpoints ?? {} };
      for (const result of found) endpoints[result.service] = result.endpoint;
      await updateConfig({ endpoints, deploymentDomain: domain, region });
      process.stdout.write(`
Saved ${found.length} endpoint(s) to the configuration.
`);
    } else if (options.write === true) {
      process.stderr.write("\nNothing to save: no endpoint answered.\n");
    } else if (found.length > 0) {
      process.stdout.write("\nRe-run with --write to save these endpoints.\n");
    }
  })
);
endpoint.command("set").argument("<service>", "service flag or label, e.g. pipeline").argument("<url>", "endpoint origin, e.g. https://codeartsrepo.example.com").description("Pin one service to a specific endpoint").action(
  action(async (serviceRef, url, options, command) => {
    void options;
    const service = resolveService(serviceRef);
    if (!service) {
      throw new PluginError(
        `Unknown service "${serviceRef}".
Available: ${loadCatalog().services.map((entry) => entry.label).join(", ")}`,
        "CONFIG_INVALID"
      );
    }
    const config = await readConfig();
    const endpoints = { ...config?.endpoints ?? {}, [service.service]: url };
    await updateConfig({ endpoints });
    process.stdout.write(`${service.label} -> ${url}
`);
  })
);
endpoint.command("clear").argument("[service]", "service flag or label; omit to clear every override").description("Remove a per-service endpoint override").action(
  action(async (serviceRef, options, command) => {
    void options;
    const config = await readConfig();
    if (!serviceRef) {
      await updateConfig({ endpoints: {} });
      process.stdout.write("Cleared every endpoint override.\n");
      return;
    }
    const service = resolveService(serviceRef);
    const endpoints = { ...config?.endpoints ?? {} };
    if (service) delete endpoints[service.service];
    await updateConfig({ endpoints });
    process.stdout.write("Cleared.\n");
  })
);
function normaliseDomain(value) {
  const raw = (value ?? "").trim();
  if (!raw) return void 0;
  return raw.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/^\.+/, "");
}
program2.command("services").description("List the CodeArts services covered by this CLI").action(
  action(async (options, command) => {
    void options;
    const catalog = loadCatalog();
    const rows = catalog.services.map((service) => ({
      label: service.label,
      service: service.service,
      name: service.serviceName,
      operations: service.operationCount
    }));
    emit(command, rows, { columns: ["label", "service", "name", "operations"] });
  })
);
var project = program2.command("project").description("Discover and select the CodeArts project");
project.command("list").description("List every CodeArts project visible to the credentials").action(
  action(async (options, command) => {
    void options;
    const client = await createClient(command);
    const projects = await client.projects();
    emit(command, projects, { columns: ["identifier", "name"] });
  })
);
project.command("current").description("Explain which project this command would use").action(
  action(async (options, command) => {
    void options;
    const selected = command.optsWithGlobals().project;
    if (selected) {
      process.stdout.write(`--project ${selected}
`);
      return;
    }
    const client = await createClient(command);
    const projects = await client.projects();
    if (projects.length === 1) {
      process.stdout.write(
        `${projects[0].identifier}  ${projects[0].name}  (the only visible project)
`
      );
      return;
    }
    process.stdout.write(
      "No project selected, and no default is stored \u2014 pick one per command:\n" + projects.map((entry) => `  --project ${entry.name}   (${entry.identifier})`).join("\n") + "\n"
    );
  })
);
var api = program2.command("api").description("Explore and call any documented CodeArts API operation");
api.command("list").argument("[service]", "service flag, label or name, e.g. pipeline").description("List catalog operations").option("--search <keyword>", "match name, id, path or group").option("--method <method>", "filter by HTTP method").option("--include-legacy", "include operations the documentation marks as outdated").option("--all", "do not truncate the result").action(
  action(
    async (serviceRef, options, command) => {
      const service = serviceRef ? resolveService(serviceRef) : void 0;
      if (serviceRef && !service) {
        const catalog = loadCatalog();
        throw new PluginError(
          `Unknown service "${serviceRef}".
Available services:
` + catalog.services.map((entry) => `  ${entry.label}  (${entry.service})`).join("\n"),
          "CONFIG_INVALID"
        );
      }
      const operations = searchOperations({
        service: service?.service,
        keyword: options.search,
        method: options.method,
        includeLegacy: options.includeLegacy === true,
        limit: options.all ? Number.MAX_SAFE_INTEGER : 60
      });
      const rows = operations.map((operation) => ({
        id: operation.id,
        method: operation.method,
        path: operation.path,
        name: operation.name,
        group: operation.group
      }));
      emit(command, rows, { columns: ["id", "method", "path", "name"] });
      if (rows.length === 60) {
        process.stderr.write("Showing the first 60 matches. Narrow with --search or add --all.\n");
      }
    }
  )
);
api.command("show").argument("<operation>", "operation id, page name, doc URL or Chinese operation name").description("Show an operation's method, path and parameters").action(
  action(async (reference, options, command) => {
    void options;
    const operation = requireOperation(reference);
    const { format } = command.optsWithGlobals();
    if (format === "json") {
      process.stdout.write(`${JSON.stringify(operation, null, 2)}
`);
      return;
    }
    process.stdout.write(renderOperation(operation));
  })
);
api.command("call").argument("<operation>", "operation id, page name, doc URL or Chinese operation name").description("Call an operation, routing --param values by the catalog").option("--param <name=value>", "path, query, header or body parameter (repeatable)", collectFields, []).option("--path <name=value>", "force a path parameter (repeatable)", collectFields, []).option("--query <name=value>", "force a query parameter (repeatable)", collectFields, []).option("--header <name=value>", "force a request header (repeatable)", collectFields, []).option("--body <json>", "full request body as JSON, or @path to read a file").option("--body-file <path>", "read the request body from a file").action(
  action(async (reference, options, command) => {
    const operation = requireOperation(reference);
    const client = await createClient(command);
    const request = buildOperationRequest(operation, options);
    const response = await client.request({
      service: operation.service,
      method: operation.method,
      path: operation.path,
      ...Object.keys(request.pathParams).length > 0 ? { pathParams: request.pathParams } : {},
      query: request.query,
      ...request.body !== void 0 ? { body: request.body } : {},
      ...Object.keys(request.headers).length > 0 ? { headers: request.headers } : {}
    });
    if (client.ctx.dryRun) return;
    note(command, `${renderPreview(response.preview)}
`);
    emit(command, response.body);
  })
);
function requireOperation(reference) {
  const lookup = resolveOperation(reference);
  if (lookup.kind === "found") return lookup.operation;
  if (lookup.kind === "ambiguous") {
    throw new PluginError(
      `"${reference}" matches several operations; use the full id:
` + lookup.candidates.map(
        (operation) => `  ${operation.id}  ${operation.name}  ${operation.method} ${operation.path}`
      ).join("\n"),
      "CONFIG_INVALID"
    );
  }
  const catalog = loadCatalog();
  throw new PluginError(
    `No operation matches "${reference}".
` + (lookup.suggestions.length > 0 ? `Closest matches:
${lookup.suggestions.map((operation) => `  ${operation.id}  ${operation.name}`).join("\n")}` : `Browse operations with: codearts api list <service>
Services: ${catalog.services.map((entry) => entry.label).join(", ")}`),
    "CONFIG_INVALID"
  );
}
function buildOperationRequest(operation, options) {
  const pathValues = parseKeyValues(options.path, "--path");
  const queryValues = parseKeyValues(options.query, "--query");
  const headers = parseKeyValues(options.header, "--header");
  const params = parseKeyValues(options.param, "--param");
  const pathNames = new Set(operation.pathParams.map((param) => param.name));
  const queryNames = new Map(operation.queryParams.map((param) => [param.name, param.type]));
  const bodyNames = new Map(operation.bodyParams.map((param) => [param.name, param.type]));
  const nestedNames = new Set(
    Object.values(operation.bodyObjects ?? {}).flatMap((fields) => fields.map((field) => field.name))
  );
  const body = {};
  for (const [name, value] of Object.entries(params)) {
    if (pathNames.has(name)) {
      pathValues[name] = value;
      continue;
    }
    if (queryNames.has(name)) {
      queryValues[name] = coerceValue(value, queryNames.get(name));
      continue;
    }
    if (bodyNames.has(name)) {
      body[name] = coerceValue(value, bodyNames.get(name));
      continue;
    }
    if (name.includes(".") || name.includes("[")) {
      setDeep(body, name, value);
      continue;
    }
    if (nestedNames.has(name) && operation.bodyObjects) {
      let placed = false;
      for (const [objectName, fields] of Object.entries(operation.bodyObjects)) {
        const field = fields.find((entry) => entry.name === name);
        if (!field) continue;
        const existing = isRecord2(body[objectName]) ? body[objectName] : {};
        body[objectName] = { ...existing, [name]: coerceValue(value, field.type) };
        placed = true;
      }
      if (placed) continue;
    }
    throw new PluginError(unknownParamMessage(operation, name), "CONFIG_INVALID");
  }
  const explicitBody = readExplicitBody(options);
  const finalBody = explicitBody !== void 0 ? explicitBody : Object.keys(body).length > 0 ? body : void 0;
  if (operation.method !== "GET" && operation.method !== "DELETE" && isRecord2(finalBody)) {
    const missing2 = operation.bodyParams.filter((param) => param.required && !(param.name in finalBody)).map((param) => param.name);
    if (missing2.length > 0) {
      process.stderr.write(
        `Note: the documentation marks these body parameters as required: ${missing2.join(", ")}
`
      );
    }
  }
  const projectPlaceholders = /* @__PURE__ */ new Set(["project_id", "projectId", "project_uuid"]);
  const missing = operation.pathParams.filter(
    (param) => param.required && !pathValues[param.name] && !projectPlaceholders.has(param.name)
  ).map((param) => param.name);
  if (missing.length > 0) {
    throw new PluginError(
      `Missing path parameter${missing.length > 1 ? "s" : ""} for ${operation.id}: ${missing.join(", ")}
Pass ${missing.map((name) => `--param ${name}=<value>`).join(" ")}`,
      "CONFIG_INVALID"
    );
  }
  return {
    pathParams: pathValues,
    query: toQuery(queryValues),
    ...finalBody !== void 0 ? { body: finalBody } : {},
    headers
  };
}
function readExplicitBody(options) {
  const file = options.bodyFile;
  if (file) return readFileSync6(file, "utf8");
  const raw = options.body;
  if (raw === void 0) return void 0;
  if (raw.startsWith("@")) return readFileSync6(raw.slice(1), "utf8");
  return raw;
}
function unknownParamMessage(operation, name) {
  const pathNames = operation.pathParams.map((param) => param.name);
  const queryNames = operation.queryParams.map((param) => param.name);
  const bodyNames = operation.bodyParams.map((param) => param.name);
  const suggestions = [...pathNames, ...queryNames, ...bodyNames].filter(
    (candidate) => candidate.includes(name) || name.includes(candidate)
  );
  return [
    `Unknown parameter "${name}" for ${operation.id}.`,
    `  path:  ${pathNames.join(", ") || "(none)"}`,
    `  query: ${queryNames.join(", ") || "(none)"}`,
    `  body:  ${bodyNames.join(", ") || "(none)"}`,
    ...suggestions.length > 0 ? [`Did you mean: ${suggestions.join(", ")}`] : [],
    `Inspect with: codearts api show ${operation.id}`,
    `Parameters the documentation omits can still be passed with --query or --body.`
  ].join("\n");
}
function renderOperation(operation) {
  const lines = [];
  lines.push(`${operation.name}  (${operation.id})`);
  lines.push(`${operation.method} ${operation.path}`);
  if (operation.legacy) {
    lines.push("Documented as outdated; prefer a newer operation when one exists.");
  }
  lines.push(`Service: ${operation.serviceName} \u2014 ${operation.group}`);
  lines.push(`Docs: ${docUrl(operation)}`);
  const section = (title, params) => {
    lines.push("", `${title}:`);
    if (params.length === 0) {
      lines.push("  (none)");
      return;
    }
    for (const param of params) {
      const flags = [param.type, param.required ? "required" : "optional"].filter(Boolean).join(", ");
      lines.push(`  ${param.name}  (${flags})${param.description ? ` \u2014 ${param.description}` : ""}`);
    }
  };
  section("Path parameters", operation.pathParams);
  section("Query parameters", operation.queryParams);
  section("Body parameters", operation.bodyParams);
  if (operation.headerParams.length > 0) section("Additional headers", operation.headerParams);
  const objects = Object.entries(operation.bodyObjects ?? {});
  if (objects.length > 0) {
    lines.push("", "Nested body objects (use --param <object>.<field>=<value> or --body):");
    for (const [name, fields] of objects) {
      lines.push(`  ${name}: ${fields.map((field) => field.name).join(", ")}`);
    }
  }
  const example = [
    "codearts api call",
    operation.id,
    ...operation.pathParams.filter((param) => param.required).map((param) => `--param ${param.name}=<value>`)
  ].join(" ");
  lines.push("", "Example:", `  ${example}`);
  return `${lines.join("\n")}
`;
}
registerScenarios(program2);
program2.parseAsync(process.argv).catch((error) => {
  process.stderr.write(`${error.message}
`);
  process.exit(1);
});
export {
  asRows,
  pickPaths,
  program2 as program,
  renderValue,
  valueAtPath
};
