var inquirer = require('inquirer');

module.exports = {

  autocomplete: {
    message: 'message',
    name: 'name',
    choices: ['foo', new inquirer.Separator(), 'bar', 'bum']
  },

};
