import autocomplete, {
  ChoiceOrSeparatorArray,
  Separator,
} from '../src/index.js';

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

function searchStates(input = ''): Promise<ChoiceOrSeparatorArray<string>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = states.filter((s) =>
        s.toLowerCase().includes(input.toLowerCase())
      );

      const all: any = results.map((r) => ({
        value: r,
        name: r,
        description: r,
        disabled: false,
      }));

      if (all[1]) {
        all[1].disabled = true;
      }

      all.unshift(new Separator());
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
  default: 'Florida',
  pageSize: 10,
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
