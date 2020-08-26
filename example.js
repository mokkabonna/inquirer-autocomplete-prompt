/**
 * List prompt example
 */

'use strict';
var inquirer = require('inquirer');
var _ = require('lodash');
var fuzzy = require('fuzzy');

inquirer.registerPrompt('autocomplete', require('./index'));

var states = [
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

var foods = ['Apple', 'Orange', 'Banana', 'Kiwi', 'Lichi', 'Grapefruit'];

function searchStates(answers, input) {
  input = input || '';
  return new Promise(function (resolve) {
    setTimeout(function () {
      var fuzzyResult = fuzzy.filter(input, states);
      const results = fuzzyResult.map(function (el) {
        return el.original;
      });

      results.splice(5, 0, new inquirer.Separator());
      results.push(new inquirer.Separator());
      resolve(results);
    }, _.random(30, 500));
  });
}

function searchFood(answers, input) {
  input = input || '';
  return new Promise(function (resolve) {
    setTimeout(function () {
      var fuzzyResult = fuzzy.filter(input, foods);
      resolve(
        fuzzyResult.map(function (el) {
          return el.original;
        })
      );
    }, _.random(30, 500));
  });
}

inquirer
  .prompt([
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
      validate: function (val) {
        return val ? true : 'Type something!';
      },
    },
    {
      type: 'autocomplete',
      name: 'state',
      message: 'Select a state to travel from',
      default: 'California',
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
  ])
  .then(function (answers) {
    console.log(JSON.stringify(answers, null, 2));
  });
