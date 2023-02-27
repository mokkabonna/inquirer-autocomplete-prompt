/**
 * List prompt example
 */

import inquirer from 'inquirer';
import fuzzy from 'fuzzy';
import inquirerPrompt from './index.js';

const prompt2 = inquirer.createPromptModule({});

console.log(prompt2);

prompt2.registerPrompt('autocomplete', inquirerPrompt);

const states = [
  'Alabama',
  'Alaska',
  'American Samoa',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District Of Columbia',
  'Federated States Of Micronesia',
  'Florida',
  'Georgia',
  'Guam',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Marshall Islands',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Northern Mariana Islands',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Palau',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virgin Islands',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

const foods = ['Apple', 'Orange', 'Banana', 'Kiwi', 'Lichi', 'Grapefruit'];

function searchStates(answers, input = '') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = fuzzy.filter(input, states).map((el) => el.original);

      results.splice(5, 0, new inquirer.Separator());
      results.push(new inquirer.Separator());
      resolve(results);
    }, Math.random() * 470 + 30);
  });
}

function searchFood(answers, input = '') {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fuzzy.filter(input, foods).map((el) => el.original));
    }, Math.random() * 470 + 30);
  });
}

prompt2([
  {
    type: 'autocomplete',
    name: 'fruit',
    suggestOnly: true,
    message: 'What is your favorite fruit?',
    searchText: 'We are searching the internet for you!',
    emptyText: 'Nothing found!',
    default: 'Banana',
    source: searchFood,
    pageSize: 4,
    validate(val) {
      return val ? true : 'Type something!';
    },
  },
  {
    type: 'autocomplete',
    name: 'state',
    message: 'Select a state to travel from',
    default: 'California',
    validate(choice, answers) {
      if (answers.fruit === 'Banana') {
        return choice && choice.value[0] === 'C'
          ? true
          : 'Since you selected Banana in the previous prompt you need to select a state that starts with "C". Makes sense.';
      }

      return true;
    },
    source: searchStates,
  },
  {
    type: 'autocomplete',
    name: 'stateNoPromise',
    message: 'Select a state to travel to',
    source: () => states,
  },
  {
    type: 'autocomplete',
    name: 'multiline',
    pageSize: 20,
    message: 'Choices support multiline choices (should increase pagesize)',
    source: () =>
      Promise.resolve([
        'Option1',
        'Option2\n\nline2\nline3',
        'Option3\n\nblank line between\n\n\nfar down\nlast line',
        new inquirer.Separator(),
      ]),
  },
  {
    type: 'checkbox',
    name: 'multilineCheckbox',
    message: 'Normal checkbox multiline example',
    choices: [
      'Alaska\nmore lines\neven more\nlast line',
      'filler1',
      'filler2',
      'filler3',
      'filler4',
      'filler5',
      'filler6',
      new inquirer.Separator(),
    ],
  },
]).then((answers) => {
  console.log(JSON.stringify(answers, null, 2));
});
