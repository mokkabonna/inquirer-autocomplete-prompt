/**
 * `autocomplete` type prompt
 */

var util = require('util');
var chalk = require('chalk');
var figures = require('figures');
var Base = require('inquirer/lib/prompts/base');
var Choices = require('inquirer/lib/objects/choices');
var observe = require('inquirer/lib/utils/events');
var utils = require('inquirer/lib/utils/readline');
var Paginator = require('inquirer/lib/utils/paginator');

/**
 * Module exports
 */

module.exports = Prompt;


/**
 * Constructor
 */

function Prompt() {
  Base.apply(this, arguments);

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
util.inherits(Prompt, Base);


/**
 * Start the Inquiry session
 * @param  {Function} cb      Callback when prompt is done
 * @return {this}
 */

Prompt.prototype._run = function(cb) {
  var self = this;
  self.done = cb;

  if (self.rl.history instanceof Array) {
    self.rl.history = [];
  }

  var events = observe(self.rl);

  events.line.takeWhile(dontHaveAnswer).forEach(self.onSubmit.bind(this));
  events.keypress.takeWhile(dontHaveAnswer).forEach(self.onKeypress.bind(this));

  function dontHaveAnswer() {
    return !self.answer;
  }

  if (!!self.opt.initial) {
    // emit a keypress event to pass in the initial option
    self.rl.input.emit('keypress', self.opt.initial) // trigger the search
  } else {
    // call once at init
    self.search(null);
  }

  return this;
};


/**
 * Render the prompt to screen
 * @return {Prompt} self
 */

Prompt.prototype.render = function() {
  // Render question
  var content = this.getQuestion();
  var bottomContent = '';

  if (this.firstRender) {
    content += chalk.dim('(Use arrow keys or type to search)');
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
    bottomContent += this.paginator.paginate(choicesStr, this.selected);
  } else {
    content += this.rl.line;
    bottomContent += '  ' + chalk.yellow('No results...');
  }

  this.firstRender = false;

  this.screen.render(content, bottomContent);
};

/**
 * When user press `enter` key
 */

Prompt.prototype.onSubmit = function(line) {
  if (this.currentChoices.length <= this.selected) {
    this.rl.write(line)
    this.search(line)
    return;
  }

  var choice = this.currentChoices.getChoice(this.selected);
  this.answer = choice.value;
  this.answerName = choice.name;
  this.shortAnswer = choice.short;

  this.status = 'answered';

  // Rerender prompt
  this.render();

  this.screen.done();

  this.done(choice.value);
};

Prompt.prototype.search = function(searchTerm) {
  var self = this;
  self.selected = 0;

  //only render searching state after first time
  if (self.searchedOnce) {
    self.searching = true;
    self.currentChoices = new Choices([]);
    self.render(); //now render current searching state
  } else {
    self.searchedOnce = true;
  }

  self.lastSearchTerm = searchTerm;
  var thisPromise = self.opt.source(self.answers, searchTerm);

  //store this promise for check in the callback
  self.lastPromise = thisPromise;

  return thisPromise.then(function inner(choices) {
    //if another search is triggered before the current search finishes, don't set results
    if (thisPromise !== self.lastPromise) return;

    choices = new Choices(choices.filter(function(choice) {
      return choice.type !== 'separator';
    }));

    self.currentChoices = choices
    self.searching = false;
    self.render();
  });

};


Prompt.prototype.ensureSelectedInRange = function() {
  var selectedIndex = Math.min(this.selected, this.currentChoices.length); //not above currentChoices length - 1
  this.selected = Math.max(selectedIndex, 0); //not below 0
}


/**
 * When user type
 */

Prompt.prototype.onKeypress = function(e) {
  var len;
  var keyName = (e.key && e.key.name) || undefined;
  if (keyName === 'down') {
    len = this.currentChoices.length;
    this.selected = (this.selected < len - 1) ? this.selected + 1 : 0;
    this.ensureSelectedInRange();
    this.render();
    utils.up(this.rl, 2);
  } else if (keyName === 'up') {
    len = this.currentChoices.length;
    this.selected = (this.selected > 0) ? this.selected - 1 : len - 1;
    this.ensureSelectedInRange();
    this.render();
  } else {
    this.render(); //render input automatically
    //Only search if input have actually changed, not because of other keypresses
    if (this.lastSearchTerm !== this.rl.line) {
      this.search(this.rl.line); //trigger new search
    }
  }
};


/**
 * Function for rendering list choices
 * @param  {Number} pointer Position of the pointer
 * @return {String}         Rendered content
 */
function listRender(choices, pointer) {
  var output = '';
  var separatorOffset = 0;

  choices.forEach(function(choice, i) {
    if (choice.type === 'separator') {
      separatorOffset++;
      output += '  ' + choice + '\n';
      return;
    }

    var isSelected = (i - separatorOffset === pointer);
    var line = (isSelected ? figures.pointer + ' ' : '  ') + choice.name;

    if (isSelected) {
      line = chalk.cyan(line);
    }
    output += line + ' \n';
  });

  return output.replace(/\n$/, '');
}
