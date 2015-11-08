# inquirer-autocomplete-prompt

Autocomplete prompt for [inquirer](https://github.com/SBoudrias/Inquirer.js)

[![build status](https://secure.travis-ci.org/mokkabonna/inquirer-autocomplete-prompt.svg)](http://travis-ci.org/mokkabonna/inquirer-autocomplete-prompt)
[![dependency status](https://david-dm.org/mokkabonna/inquirer-autocomplete-prompt.svg)](https://david-dm.org/mokkabonna/inquirer-autocomplete-prompt)

## Installation

```
npm install --save inquirer-autocomplete-prompt
```

## Usage

This prompt is anonymous, meaning you can register this prompt with the type name you please:

```javascript
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
inquirer.prompt({
  type: 'autocomplete',
  ...
})
```

Change `autocomplete` to whatever you might prefer.

### Options

> **Note:** _allowed options written inside square brackets (`[]`) are optional. Others are required._

`type`, `name`, `message`, `source`[, `filter`, `when`, `acceptInput`]

See [inquirer](https://github.com/SBoudrias/Inquirer.js) readme for meaning of all except **source** and **acceptInput**.

**Source** will be called with previous answers object and the current user input each time the user types, it **must** return a promise.

**Source** will be called once at at first before the user types anything with a empty search string. If a new search is triggered by user input it maintains the correct order, meaning that if the first call completes after the second starts, the results of the first call are never displayed.

**acceptInput** is a boolean, defaulting to `false`. If `true`, the user can input arbitrary text as a selection — that is to say, even if the choice does not appear in the list. See `example.js` for an example.

#### Example

```javascript
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
inquirer.prompt([{
  type: 'autocomplete',
  name: 'from',
  message: 'Select a state to travel from',
  source: function(answersSoFar, input) {
    return myApi.searchStates(input);
  }
}], function(answers) {
  //etc
});
```

See also [example.js](https://github.com/mokkabonna/inquirer-autocomplete-prompt/blob/master/example.js) for a working example

![Autocomplete prompt](https://cloud.githubusercontent.com/assets/230877/9003165/bd188d9a-376b-11e5-8ddf-5186bc9eb453.png)

## Credits
[Martin Hansen](https://github.com/mokkabonna/)

## License

ISC
