import autocomplete, { ChoiceOrSeparatorArray } from '../src/index.js';
// import { Separator } from '@inquirer/core';

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

// import select from '@inquirer/select';

// await select({
//   message: 'Select a state (select)',
//   choices: states.map((r) => ({
//     value: 123,
//     name: r,
//     description: r,
//     disabled: false,
//   })),
//   pageSize: 5,
// });

// import input from '@inquirer/input';
// const inputfinalval = await input({
//   message: 'Select a state (input)',
//   default: 'Alabama',
//   transformer: (input, { isFinal }) =>
//     isFinal ? 'Transformed' : `transformed name: ${input}`,
//   // validate: () => false,
// });

// console.log(inputfinalval);

// const foods = ['Apple', 'Orange', 'Banana', 'Kiwi', 'Lichi', 'Grapefruit'];

function searchStates(input = ''): Promise<ChoiceOrSeparatorArray<string>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = states.filter((s) =>
        s.toLowerCase().includes(input.toLowerCase())
      );

      const all = results.map((r) => ({
        value: r,
        name: r,
        description: r,
        disabled: false,
      }));

      if (all[1]) {
        all[1].disabled = true;
      }

      // all.unshift(new Separator());
      resolve(all);
    }, 500 + 30);
  });
}

const answer = await autocomplete({
  message: 'Select a state (suggest only)',
  source: searchStates,
  suggestOnly: true,
  transformer: (input, { isFinal }) => {
    if (isFinal) {
      return 'Transformed';
    }
    return `transformed name: ${input}`;
  },
  // default: 'Flofdsafdsrida',
  pageSize: 5,
});

const answer2 = await autocomplete({
  message: 'Select a state (forced choice)',
  source: searchStates,
  transformer: (input, { isFinal }) => {
    if (isFinal) {
      return 'Transformed';
    }
    return `transformed name: ${input}`;
  },
  pageSize: 5,
});

console.log(answer, answer2);

export default answer;
