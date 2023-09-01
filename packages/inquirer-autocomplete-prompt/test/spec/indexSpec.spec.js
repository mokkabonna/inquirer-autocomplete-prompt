/* eslint-env mocha */

import { strict as assert } from 'assert';
import sinon from 'sinon';
import inquirer from 'inquirer';
import ReadlineStub from '../helpers/readline.js';
import Prompt from '../../index.js';
import { describe, it, beforeEach } from 'vitest';

describe('inquirer-autocomplete-prompt', () => {
  let source;
  let prompt;
  let resolve;
  let promise;
  let rl;
  let defaultChoices;
  let promiseForAnswer;

  describe('suggestOnly = true', () => {
    beforeEach(() => {
      defaultChoices = ['foo', new inquirer.Separator(), 'bar', 'bum'];
      promise = new Promise((res) => {
        resolve = res;
      });
      source = sinon.stub().returns(promise);

      rl = new ReadlineStub();
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          suggestOnly: true,
          source,
        },
        rl
      );
    });

    it('applies filter', () => {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter(val) {
            return val.slice(0, 2);
          },
          suggestOnly: true,
          source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();

      type('banana');
      enter();

      return promiseForAnswer.then((answer) => {
        assert.equal(answer, 'ba');
      });
    });

    it('applies filter async with done callback', () => {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter(val) {
            const done = this.async();

            setTimeout(() => {
              done(null, val.slice(0, 2));
            }, 100);
          },
          suggestOnly: true,
          source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();

      type('banana');
      enter();

      return promiseForAnswer.then((answer) => {
        assert.equal(answer, 'ba');
      });
    });

    it('applies filter async with promise', () => {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter(val) {
            return new Promise((resolve) => {
              resolve(val.slice(0, 2));
            });
          },
          suggestOnly: true,
          source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();

      type('banana');
      enter();

      return promiseForAnswer.then((answer) => {
        assert.equal(answer, 'ba');
      });
    });

    describe('when tab pressed', () => {
      let promiseForAnswer;
      beforeEach(() => {
        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);
        return promise;
      });

      it('autocompletes the value selected in the list', () => {
        tab();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'foo');
        });
      });

      it('accepts any input', () => {
        type('banana');
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'banana');
        });
      });
    });

    describe('validation', () => {
      it('validates sync', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate() {
              return false;
            },
            source,
            suggestOnly: true,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        let hasCompleted = false;

        return promise.then(() => {
          enter();

          promiseForAnswer.then(() => {
            hasCompleted = true;
          });

          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (hasCompleted) {
                reject(
                  new Error(
                    'Prompt completed, but should have failed sync validation!.'
                  )
                );
              } else {
                resolve();
              }
            }, 10);
          });
        });
      });

      it('calls validate function correctly', () => {
        const validate = sinon.stub().returns(true);
        const answers = {};
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate,
            source,
            suggestOnly: true,
          },
          rl,
          answers
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        return promise.then(() => {
          tab();
          enter();

          return promiseForAnswer.then(() => {
            sinon.assert.calledOnce(validate);
            sinon.assert.calledWithExactly(validate, 'foo', {});
          });
        });
      });

      it('validates async false', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate() {
              let res;
              const promise = new Promise((resolve) => {
                res = resolve;
              });

              setTimeout(() => {
                res(false);
              }, 10);

              return promise;
            },
            source,
            suggestOnly: true,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        let hasCompleted = false;

        return promise.then(() => {
          enter();

          promiseForAnswer.then(() => {
            hasCompleted = true;
          });

          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (hasCompleted) {
                reject(
                  new Error(
                    'Prompt completed, but should have failed async validation!.'
                  )
                );
              } else {
                resolve();
              }
            }, 10);
          });
        });
      });

      it('validates async true', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate() {
              let res;
              const promise = new Promise((resolve) => {
                res = resolve;
              });

              setTimeout(() => {
                res(true);
              }, 10);

              return promise;
            },
            source,
            suggestOnly: true,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        return promise.then(() => {
          type('banana');
          enter();

          return promiseForAnswer.then((answer) => {
            assert.equal(answer, 'banana');
          });
        });
      });

      it('validates only if function', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate: null,
            source,
            suggestOnly: true,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        return promise.then(() => {
          type('banana');
          enter();

          return promiseForAnswer.then((answer) => {
            assert.equal(answer, 'banana');
          });
        });
      });
    });
  });

  describe('suggestOnly = false', () => {
    beforeEach(() => {
      defaultChoices = ['foo', new inquirer.Separator(), 'bar', 'bum'];
      promise = new Promise((res) => {
        resolve = res;
      });
      source = sinon.stub().returns(promise);

      rl = new ReadlineStub();
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          source,
        },
        rl
      );
    });

    describe('default behaviour', () => {
      it('sets the first to selected when no default', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            source,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve([9, 0, 'foo']);

        return promise.then(() => {
          enter();

          return promiseForAnswer.then((answer) => {
            assert.equal(answer, 9);
          });
        });
      });

      it('set default value as selected when string', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            source,
            default: 'foo',
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve([1, 8, 'foo', 7, 3]);

        return promise.then(() => {
          enter();

          return promiseForAnswer.then((answer) => {
            assert.equal(answer, 'foo');
          });
        });
      });

      it('set default value as selected when number', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            source,
            default: 7,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(['foo', 1, 7, 3]);

        return promise.then(() => {
          enter();

          return promiseForAnswer.then((answer) => {
            assert.equal(answer, 7);
          });
        });
      });

      it('set first default value as selected duplicates', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            source,
            default: 7,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(['foo', 1, 'foo', 3]);

        return promise.then(() => {
          moveDown();
          enter();

          return promiseForAnswer.then((answer) => {
            assert.equal(answer, 1);
          });
        });
      });
    });

    it('applies filter', () => {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter(val) {
            return val.slice(0, 2);
          },
          source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();
      resolve(defaultChoices);

      return promise.then(() => {
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'ba');
        });
      });
    });

    it('applies filter async with done calback', () => {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter(val) {
            const done = this.async();
            setTimeout(() => {
              done(null, val.slice(0, 2));
            }, 100);
          },
          source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();
      resolve(defaultChoices);

      return promise.then(() => {
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'ba');
        });
      });
    });

    it('applies filter async with promise', () => {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter(val) {
            return new Promise((resolve) => {
              resolve(val.slice(0, 2));
            });
          },
          source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();
      resolve(defaultChoices);

      return promise.then(() => {
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'ba');
        });
      });
    });

    it('requires a name', () => {
      assert.throws(() => {
        new Prompt({
          message: 'foo',
          source,
        });
      }, /name/);
    });

    it('requires a source parameter', () => {
      assert.throws(() => {
        new Prompt({
          name: 'foo',
          message: 'foo',
        });
      }, /source/);
    });

    it('immediately calls source with undefined', () => {
      prompt.run();
      sinon.assert.calledOnce(source);
      sinon.assert.calledWithExactly(source, undefined, undefined);
    });

    describe('multiline choices', () => {
      let promiseForAnswer;
      beforeEach(() => {
        promiseForAnswer = getPromiseForAnswer();
        resolve([
          'foo',
          new inquirer.Separator(),
          'multiline\nline2\n\nline4',
          'bum',
        ]);
        return promise;
      });

      it('should select the correct multiline choice', () => {
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'multiline\nline2\n\nline4');
        });
      });

      it('should skip over the multiline choice', () => {
        moveDown();
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'bum');
        });
      });
    });

    describe('mixed choices type', () => {
      let promiseForAnswer;
      beforeEach(() => {
        promiseForAnswer = getPromiseForAnswer();

        resolve([
          1234,
          'Option 2',
          {
            name: 'Option 3',
          },
          {
            value: 'Option 4',
          },
        ]);

        return promise;
      });

      it('supports number', () => {
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 1234);
        });
      });

      it('supports string', () => {
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'Option 2');
        });
      });

      it('supports object with no value, uses name for value', () => {
        moveDown();
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'Option 3');
        });
      });

      it('supports object with no name, uses value for name', () => {
        moveDown();
        moveDown();
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'Option 4');
        });
      });
    });

    describe('when it has full choices', () => {
      let promiseForAnswer;
      beforeEach(() => {
        promiseForAnswer = getPromiseForAnswer();

        resolve([
          {
            name: 'Option1',
            value: 1,
          },
          {
            name: 'Option2',
            value: 2,
            disabled: true,
          },
          {
            name: 'Option3',
            value: 3,
          },
          {
            name: 'Option4',
            value: 4,
            disabled: false,
          },
        ]);

        return promise;
      });

      it('can not select disabled choices', () => {
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 3);
        });
      });

      it('loops back correctly (accounts for disabled)', () => {
        moveDown();
        moveDown();
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 1);
        });
      });
    });

    describe('when it has some results', () => {
      let promiseForAnswer;
      beforeEach(() => {
        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);
        return promise;
      });

      it('should move selected cursor on keypress', () => {
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'bar');
        });
      });

      it('should move selected cursor on ctrl n + p keypress', () => {
        moveDownCtrl();
        moveDownCtrl();
        moveUpCtrl();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'bar');
        });
      });

      it('moves up and down', () => {
        moveDown();
        moveDown();
        moveUp();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'bar');
        });
      });

      it('loops choices going down', () => {
        moveDown();
        moveDown();
        moveDown();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'foo');
        });
      });

      it('loops choices going up', () => {
        moveUp();
        enter();

        return promiseForAnswer.then((answer) => {
          assert.equal(answer, 'bum');
        });
      });
    });

    describe('searching', () => {
      beforeEach(() => {
        prompt.run();
        source.reset();
        source.returns(promise);
      });

      it('searches after each char when user types', () => {
        type('a');
        sinon.assert.calledWithExactly(source, undefined, 'a');
        type('bba');
        sinon.assert.calledWithExactly(source, undefined, 'ab');
        sinon.assert.calledWithExactly(source, undefined, 'abb');
        sinon.assert.calledWithExactly(source, undefined, 'abba');
        sinon.assert.callCount(source, 4);
      });

      it('does not search again if same searchterm (not input added)', () => {
        type('ice');
        sinon.assert.calledThrice(source);
        source.reset();
        typeNonChar();
        sinon.assert.notCalled(source);
      });
    });

    describe('validation', () => {
      it('calls the validation function with the choice object', () => {
        const validate = sinon.stub().returns(true);
        const answers = {};
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate,
            source,
          },
          rl,
          answers
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        return promise.then(() => {
          enter();

          return promiseForAnswer.then(() => {
            sinon.assert.calledOnce(validate);
            sinon.assert.calledWithExactly(
              validate,
              sinon.match({
                disabled: undefined,
                name: 'foo',
                short: 'foo',
                value: 'foo',
              }),
              {}
            );
          });
        });
      });

      it('validates sync', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate() {
              return false;
            },
            source,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        let hasCompleted = false;

        return promise.then(() => {
          enter();

          promiseForAnswer.then(() => {
            hasCompleted = true;
          });

          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (hasCompleted) {
                reject(
                  new Error(
                    'Prompt completed, but should have failed sync validation!.'
                  )
                );
              } else {
                resolve();
              }
            }, 10);
          });
        });
      });

      it('validates async false', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate() {
              let res;
              const promise = new Promise((resolve) => {
                res = resolve;
              });

              setTimeout(() => {
                res(false);
              }, 10);

              return promise;
            },
            source,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        let hasCompleted = false;

        return promise.then(() => {
          enter();

          promiseForAnswer.then(() => {
            hasCompleted = true;
          });

          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (hasCompleted) {
                reject(
                  new Error(
                    'Prompt completed, but should have failed sync validation!.'
                  )
                );
              } else {
                resolve();
              }
            }, 10);
          });
        });
      });

      it('validates async true', () => {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate() {
              let res;
              const promise = new Promise((resolve) => {
                res = resolve;
              });

              setTimeout(() => {
                res(true);
              }, 10);

              return promise;
            },
            source,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        return promise.then(() => {
          moveDown();
          enter();

          return promiseForAnswer.then((answer) => {
            assert.equal(answer, 'bar');
          });
        });
      });
    });

    describe('submit', () => {
      describe('without choices in result', () => {
        beforeEach(() => {
          rl = new ReadlineStub();
          prompt = new Prompt(
            {
              message: 'test2',
              name: 'name2',
              source,
            },
            rl
          );
          prompt.run();

          resolve([]);
          return promise;
        });

        it('searches again, since not possible to select something that does not exist', () => {
          sinon.assert.calledOnce(source);
          enter();
          sinon.assert.calledTwice(source);
        });
      });

      describe('with suggestOnly', () => {
        const answerValue = {};

        beforeEach(() => {
          promiseForAnswer = getPromiseForAnswer();
          resolve([
            {
              name: 'foo',
              value: answerValue,
              short: 'short',
            },
          ]);
          return promise;
        });

        it('selects the actual value typed');
      });

      describe('with choices', () => {
        let promiseForAnswer;
        const answerValue = {};

        beforeEach(() => {
          promiseForAnswer = getPromiseForAnswer();
          resolve([
            {
              name: 'foo',
              value: answerValue,
              short: 'short',
            },
          ]);
          return promise;
        });

        it('stores the value as the answer and status to answered', () => {
          enter();
          return promiseForAnswer.then((answer) => {
            assert.deepEqual(answer, answerValue);
            assert.deepEqual(prompt.answer, answerValue);
            assert.equal(prompt.shortAnswer, 'short');
            assert.equal(prompt.answerName, 'foo');
            assert.equal(prompt.status, 'answered');
          });
        });

        describe('after selecting', () => {
          beforeEach(() => {
            enter();
            source.reset();
            return promiseForAnswer;
          });

          it('stops searching on typing', () => {
            type('test');
            sinon.assert.notCalled(source);
          });

          it('does not change answer on enter', () => {
            enter();
            sinon.assert.notCalled(source);
            return promiseForAnswer.then((answer) => {
              assert.deepEqual(answer, answerValue);
              assert.equal(prompt.answer, answerValue);
              assert.equal(prompt.status, 'answered');
            });
          });
        });
      });
    });
  });

  function getPromiseForAnswer() {
    return prompt.run();
  }

  function typeNonChar() {
    rl.input.emit('keypress', '', {
      name: 'shift',
    });
  }

  function type(word) {
    word.split('').forEach((char) => {
      rl.line += char;
      rl.input.emit('keypress', char);
    });
  }

  function moveDown() {
    rl.input.emit('keypress', '', {
      name: 'down',
    });
  }

  function moveDownCtrl() {
    rl.input.emit('keypress', '', {
      name: 'n',
      ctrl: true,
    });
  }

  function moveUpCtrl() {
    rl.input.emit('keypress', '', {
      name: 'p',
      ctrl: true,
    });
  }

  function moveUp() {
    rl.input.emit('keypress', '', {
      name: 'up',
    });
  }

  function enter() {
    rl.emit('line');
  }

  function tab() {
    rl.input.emit('keypress', '', {
      name: 'tab',
    });
  }
});
