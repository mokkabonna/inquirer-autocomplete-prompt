// @flow

/**
 * `autocomplete` type prompt
 */

var ansiEscapes = require('ansi-escapes');
var chalk = require('chalk');
var figures = require('figures');
var Base = require('inquirer/lib/prompts/base');
var Choices = require('inquirer/lib/objects/choices');
var observe = require('inquirer/lib/utils/events');
var utils = require('inquirer/lib/utils/readline');
var Paginator = require('inquirer/lib/utils/paginator');
var runAsync = require('run-async');
var { takeWhile } = require('rxjs/operators');

class AutocompletePrompt extends Base {
  constructor(
    questions /*: Array<any> */,
    rl /*: readline$Interface */,
    answers /*: Array<any> */
  ) {
    super(questions, rl, answers);

    if (!this.opt.source) {
      this.throwParamError('source');
    }

    this.currentChoices = [];

    this.firstRender = true;
    this.selected = 0;

    // Make sure no default is set (so it won't be printed)
    this.opt.default = null;

    this.paginator = new Paginator();
  }

  /**
   * Start the Inquiry session
   * @param  {Function} cb      Callback when prompt is done
   * @return {this}
   */
  _run(cb /*: Function */) /*: this*/ {
    this.done = cb;

    if (this.rl.history instanceof Array) {
      this.rl.history = [];
    }

    var events = observe(this.rl);

    const dontHaveAnswer = () => !this.answer;

    events.line
      .pipe(takeWhile(dontHaveAnswer))
      .forEach(this.onSubmit.bind(this));
    events.keypress
      .pipe(takeWhile(dontHaveAnswer))
      .forEach(this.onKeypress.bind(this));

    // Call once at init
    this.search(undefined);

    return this;
  }

  /**
   * Render the prompt to screen
   * @return {undefined}
   */
  render(error /*: ?string */) {
    // Render question
    var content = this.getQuestion();
    var bottomContent = '';

    if (this.firstRender) {
      var suggestText = this.opt.suggestOnly ? ', tab to autocomplete' : '';
      content += chalk.dim(
        '(Use arrow keys or type to search' + suggestText + ')'
      );
    }
    // Render choices or answer depending on the state
    if (this.status === 'answered') {
      content += chalk.cyan(this.shortAnswer || this.answerName || this.answer);
    } else if (this.searching) {
      content += this.rl.line;
      bottomContent += '  ' + chalk.dim('Searching...');
    } else if (this.currentChoices.length) {
      var choicesStr = listRender(this.currentChoices, this.selected);
      content += this.rl.line;
      bottomContent += this.paginator.paginate(
        choicesStr,
        this.selected,
        this.opt.pageSize
      );
    } else {
      content += this.rl.line;
      bottomContent += '  ' + chalk.yellow('No results...');
    }

    if (error) {
      bottomContent += '\n' + chalk.red('>> ') + error;
    }

    this.firstRender = false;

    this.screen.render(content, bottomContent);
  }

  /**
   * When user press `enter` key
   */
  onSubmit(line /* : string */) {
    if (typeof this.opt.validate === 'function' && this.opt.suggestOnly) {
      var validationResult = this.opt.validate(line);
      if (validationResult !== true) {
        this.render(
          validationResult || 'Enter something, tab to autocomplete!'
        );
        return;
      }
    }

    var choice = {};
    if (this.currentChoices.length <= this.selected && !this.opt.suggestOnly) {
      this.rl.write(line);
      this.search(line);
      return;
    }

    if (this.opt.suggestOnly) {
      choice.value = line || this.rl.line;
      this.answer = line || this.rl.line;
      this.answerName = line || this.rl.line;
      this.shortAnswer = line || this.rl.line;
      this.rl.line = '';
    } else {
      choice = this.currentChoices.getChoice(this.selected);
      this.answer = choice.value;
      this.answerName = choice.name;
      this.shortAnswer = choice.short;
    }

    runAsync(this.opt.filter, (err, value) => {
      choice.value = value;
      this.answer = value;

      if (this.opt.suggestOnly) {
        this.shortAnswer = value;
      }

      this.status = 'answered';
      // Rerender prompt
      this.render();
      this.screen.done();
      this.done(choice.value);
    })(choice.value);
  }

  search(searchTerm /* : ?string */) {
    var self = this;
    self.selected = 0;

    // Only render searching state after first time
    if (self.searchedOnce) {
      self.searching = true;
      self.currentChoices = new Choices([]);
      self.render(); // Now render current searching state
    } else {
      self.searchedOnce = true;
    }

    self.lastSearchTerm = searchTerm;
    var thisPromise = self.opt.source(self.answers, searchTerm);

    // Store this promise for check in the callback
    self.lastPromise = thisPromise;

    return thisPromise.then(function inner(choices) {
      // If another search is triggered before the current search finishes, don't set results
      if (thisPromise !== self.lastPromise) return;

      choices = new Choices(
        choices.filter(function(choice) {
          return choice.type !== 'separator';
        })
      );

      self.currentChoices = choices;
      self.searching = false;
      self.render();
    });
  }

  ensureSelectedInRange() {
    var selectedIndex = Math.min(this.selected, this.currentChoices.length); // Not above currentChoices length - 1
    this.selected = Math.max(selectedIndex, 0); // Not below 0
  }

  /**
   * When user type
   */

  onKeypress(e /* : {key: { name: string }, value: string} */) {
    var len;
    var keyName = (e.key && e.key.name) || undefined;

    if (keyName === 'tab' && this.opt.suggestOnly) {
      if (this.currentChoices.getChoice(this.selected)) {
        this.rl.write(ansiEscapes.cursorLeft);
        var autoCompleted = this.currentChoices.getChoice(this.selected).value;
        this.rl.write(ansiEscapes.cursorForward(autoCompleted.length));
        this.rl.line = autoCompleted;
        this.render();
      }
    } else if (keyName === 'down') {
      len = this.currentChoices.length;
      this.selected = this.selected < len - 1 ? this.selected + 1 : 0;
      this.ensureSelectedInRange();
      this.render();
      utils.up(this.rl, 2);
    } else if (keyName === 'up') {
      len = this.currentChoices.length;
      this.selected = this.selected > 0 ? this.selected - 1 : len - 1;
      this.ensureSelectedInRange();
      this.render();
    } else {
      this.render(); // Render input automatically
      // Only search if input have actually changed, not because of other keypresses
      if (this.lastSearchTerm !== this.rl.line) {
        this.search(this.rl.line); // Trigger new search
      }
    }
  }
}

/**
 * Function for rendering list choices
 * @param  {Number} pointer Position of the pointer
 * @return {String}         Rendered content
 */
function listRender(choices, pointer /*: string */) /*: string */ {
  var output = '';
  var separatorOffset = 0;

  choices.forEach(function(choice, i) {
    if (choice.type === 'separator') {
      separatorOffset++;
      output += '  ' + choice + '\n';
      return;
    }

    var isSelected = i - separatorOffset === pointer;
    var line = (isSelected ? figures.pointer + ' ' : '  ') + choice.name;

    if (isSelected) {
      line = chalk.cyan(line);
    }
    output += line + ' \n';
  });

  return output.replace(/\n$/, '');
}

module.exports = AutocompletePrompt;
