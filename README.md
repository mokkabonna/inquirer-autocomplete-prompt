# inquirer-autocomplete-prompt

Autocomplete prompt for [inquirer](https://github.com/SBoudrias/Inquirer.js)

[![build status](https://github.com/mokkabonna/inquirer-autocomplete-prompt/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/mokkabonna/inquirer-autocomplete-prompt/actions/workflows/ci.yml)

## Installation

```sh
npm install inquirer-autocomplete-prompt
```

inquirer v9 and inquirer-autocomplete-prompt v3 and higher are native esm modules, this mean you cannot use the commonjs syntax `require('inquirer-autocomplete-prompt')` anymore. If you want to learn more about using native esm in Node, I'd recommend reading [the following guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). Alternatively, you can rely on an older version until you're ready to upgrade your environment:

```
npm install inquirer-autocomplete-prompt@^2.0.0
```

## Usage

This prompt is anonymous, meaning you can register this prompt with the type name you please:

```js
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';

inquirer.registerPrompt('autocomplete', inquirerPrompt);
inquirer.prompt({
  type: 'autocomplete',
  ...
})
```

Change `autocomplete` to whatever you might prefer.

### Options

> **Note:** _allowed options written inside square brackets (`[]`) are optional. Others are required._

`type`, `name`, `message`, `source`, [`default`, `validate`, `filter`, `when`, `pageSize`, `prefix`, `suffix`, `askAnswered`, `loop`, `suggestOnly`, `searchText`, `emptyText`]

See [inquirer](https://github.com/SBoudrias/Inquirer.js) readme for meaning of all except **source**, **suggestOnly**, **searchText** and **emptyText**.

**source** will be called with previous answers object and the current user input each time the user types, it **must** return a promise (which resolves to an array of options).

**source** will be called once at at first before the user types anything with **undefined** as the value. If a new search is triggered by user input it maintains the correct order, meaning that if the first call completes after the second starts, the results of the first call are never displayed.

**suggestOnly** is default **false**. Setting it to true turns the input into a normal text input. Meaning that pressing enter selects whatever value you currently have. And pressing tab autocompletes the currently selected value in the list. This way you can accept manual input instead of forcing a selection from the list.

**validate** is called with the entered text when **suggestOnly** is set to **true**. When **suggestOnly** is false, validate is called with the choice object. In addition it is called with the answers object so far.

**searchText** Is the text shown when searching. Defaults: `Searching...`

**emptyText** Is the text shown if the search returns no results. Defaults: `No results...`

#### Example

```js
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';

inquirer.registerPrompt('autocomplete', inquirerPrompt);
inquirer
  .prompt([
    {
      type: 'autocomplete',
      name: 'from',
      message: 'Select a state to travel from',
      source: (answersSoFar, input) => myApi.searchStates(input),
    },
  ])
  .then((answers) => {
    // etc
  });
```

See also [example.js](https://github.com/mokkabonna/inquirer-autocomplete-prompt/blob/master/example.js) for a working example.

I recommend using this package with [fuzzy](https://www.npmjs.com/package/fuzzy) if you want fuzzy search. Again, see the example for a demonstration of this.

![Autocomplete prompt](./inquirer.gif)

## Credits

[Martin Hansen](https://github.com/mokkabonna)

## License

ISC
