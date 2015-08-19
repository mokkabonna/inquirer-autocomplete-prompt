# inquirer-autocomplete-prompt

Autocomplete prompt for inquirer

[![build status](https://secure.travis-ci.org/mokkabonna/inquirer-autocomplete-prompt.svg)](http://travis-ci.org/mokkabonna/inquirer-autocomplete-prompt)
[![dependency status](https://david-dm.org/mokkabonna/inquirer-autocomplete-prompt.svg)](https://david-dm.org/mokkabonna/inquirer-autocomplete-prompt)

## Installation

```
npm install --save inquirer-autocomplete-prompt
```

## Usage

You can register this prompt with the type name you please like this:

```javascript
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
inquirer.prompt({
  type: 'autocomplete',
  ...
})
```

> **Note:**: _allowed options written inside square brackets (`[]`) are optional. Others are required._

### autocomplete - `{ type: 'autocomplete' }`

Take `type`, `name`, `message`, `source`[, `filter`, `when`] properties.

Source will be called with previous answers object and the current searchTerm.

It **must** return a promise.

It will be called once at at first before the user types anything with a empty search string.

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
