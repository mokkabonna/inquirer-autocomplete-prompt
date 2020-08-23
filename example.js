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
  return new Promise(function(resolve) {
    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, states);
      resolve(
        fuzzyResult.map(function(el) {
          return el.original;
        })
      );
    }, _.random(30, 500));
  });
}

function searchFood(answers, input) {
  input = input || '';
  return new Promise(function(resolve) {
    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, foods);
      resolve(
        fuzzyResult.map(function(el) {
          return el.original;
        })
      );
    }, _.random(30, 500));
  });
}

function sliceInput(input, { cursor } = {}) {
  var string = '';
  var leftIndex = input.length - 1;
  var rightIndex = input.length - 1;
  if (/([^\s,]*)$/.test(input.slice(0, cursor))) {
    string += RegExp.$1;
    leftIndex = cursor - RegExp.$1.length;
  }
  if (/^([^\s,]*)/.test(input.slice(cursor))) {
    string += RegExp.$1;
    rightIndex = cursor + RegExp.$1.length;
  }
  return {
    matching: string,
    leftIndex,
    rightIndex
  };
}

inquirer
  .prompt([
    {
      type: 'autocomplete',
      name: 'issues',
      suggestOnly: true,
      message: 'What are your favorite states?',
      source: (answers, input = '') => {

        if (input.includes('#')) {
          const index = input.indexOf('#');
          const before = input.slice(0, index);
          const allAfter = input.slice(index);
          // ignore #, and take until space
          const nextSpaceIndex = allAfter.indexOf(' ');
          const subQuery = nextSpaceIndex === -1 ? allAfter.slice(1) : allAfter.slice(1, index + 1 + nextSpaceIndex);
          const afterSubQuery = allAfter.slice(subQuery.length + 1);

          return searchStates(answers, subQuery)
            .then(options => {
              return options.map((state) => ({
                name: state,
                value: before + state + afterSubQuery,
              }));
            });
        } else {
          return searchStates(answers, input);
        }
      },
      pageSize: 4,
      validate: function (val) {
        return val ? true : 'Type something!';
      },
    },
    {
      type: 'autocomplete',
      name: 'issues',
      suggestOnly: true,
      message: 'What issues you want to close (e.g. close #123,#234)?',
      source: (answer, input = '', { cursor }) => {
        var { matching, leftIndex, rightIndex } = sliceInput(input, { cursor });
        var makeChoice = (name) => {
          var name = name + matching.slice(1);
          return {
            name,
            value: input.slice(0, leftIndex) + name + input.slice(rightIndex),
          };
        };

        if (matching.startsWith('#') && matching.length > 1) {
          return [
            makeChoice('issue-'),
            makeChoice('issue-a-'),
            makeChoice('issue-ab-'),
          ];
        }

        return [];
      },
      pageSize: 4,
      validate: function (val) {
        return val ? true : 'Type something!';
      },
    },
    {
      type: 'autocomplete',
      name: 'fruit',
      suggestOnly: true,
      message: 'What is your favorite fruit?',
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
      source: searchStates,
    },
  ])
  .then(function (answers) {
    console.log(JSON.stringify(answers, null, 2));
  })
  .catch(console.error);
