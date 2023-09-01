# inquirer-autocomplete-prompt

Autocomplete prompt for [inquirer](https://github.com/SBoudrias/Inquirer.js)

## Installation

```
npm install inquirer-autocomplete-standalone
```

## Usage

```js
import autocomplete from 'inquirer-autocomplete-prompt';
import { searchCountries } = './some-external-api';

const answer = await autocomplete({
  message: 'Travel from what country?',
  source: async (input) => {
    const filteredCountries =  await searchCountries(input)
    return filteredCountries.map(country => {
      return {
        value: country,
      }
    })
  }
})

// user searches and selects a country from the returned list

console.log(answer) // Norway

```
