# inquirer-autocomplete-prompt

[![Greenkeeper badge](https://badges.greenkeeper.io/mokkabonna/inquirer-autocomplete-prompt.svg)](https://greenkeeper.io/)

Autocomplete prompt for [inquirer](https://github.com/SBoudrias/Inquirer.js)

[![build status](https://travis-ci.com/mokkabonna/inquirer-autocomplete-prompt.svg?branch=master)](https://travis-ci.com/github/mokkabonna/inquirer-autocomplete-prompt)

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

## Typescript

Add `inquirer-autocomplete-prompt` to *tsconfig.json/compilerOptions/types*

```json
{
  "compilerOptions": {
    "types": [
      "inquirer-autocomplete-prompt"
    ]
  }
}
```

Change `autocomplete` to whatever you might prefer.

### Options

> **Note:** _allowed options written inside square brackets (`[]`) are optional. Others are required._

`type`, `name`, `message`, `source`[, `default`,  `validate`, `filter`, `when`, `pageSize`, `prefix`, `suffix`, `askAnswered`, `loop`, `suggestOnly`, `searchText`, `emptyText`]

See [inquirer](https://github.com/SBoudrias/Inquirer.js) readme for meaning of all except **source**, **suggestOnly**, **searchText** and **emptyText**.

**source** will be called with previous answers object and the current user input each time the user types, it **must** return a promise.

**source** will be called once at at first before the user types anything with **undefined** as the value. If a new search is triggered by user input it maintains the correct order, meaning that if the first call completes after the second starts, the results of the first call are never displayed.

**suggestOnly** is default **false**. Setting it to true turns the input into a normal text input. Meaning that pressing enter selects whatever value you currently have. And pressing tab autocompletes the currently selected value in the list. This way you can accept manual input instead of forcing a selection from the list.

**validate** is called with the entered text when **suggestOnly** is set to **true**. When **suggestOnly** is false, validate is called with the choice object. In addition it is called with the answers object so far.

**searchText** Is the text shown when searching. Defaults: `Searching...`

**emptyText** Is the text shown if the search returns no results. Defaults: `No results...`


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
}]).then(function(answers) {
  //etc
});

```

See also [example.js](https://github.com/mokkabonna/inquirer-autocomplete-prompt/blob/master/example.js) for a working example.

I recommend using this package with [fuzzy](https://www.npmjs.com/package/fuzzy) if you want fuzzy search. Again, see the example for a demonstration of this.

![Autocomplete prompt](./inquirer.gif)

## Credits

[Martin Hansen](https://github.com/mokkabonna/)

## License

ISC
