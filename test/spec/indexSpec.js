var expect = require('chai').expect;
var sinon = require('sinon');
var Promise = require('bluebird');
var inquirer = require('inquirer');
var ReadlineStub = require('../helpers/readline');
var Prompt = require('../../index');
describe('inquirer-autocomplete-prompt', function() {
  var source;
  var prompt;
  var resolve;
  var reject;
  var promise;
  var rl;
  var defaultChoices;

  beforeEach(function() {
    defaultChoices = ['foo', new inquirer.Separator(), 'bar', 'bum'];
    promise = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    source = sinon.stub().returns(promise);

    rl = new ReadlineStub();
    prompt = new Prompt({
      message: 'test',
      name: 'name',
      source: source
    }, rl);
  });

  it('requires a name', function() {
    expect(function() {
      new Prompt({
        message: 'foo',
        source: source
      });

    }).to.throw(/name/);
  });

  it('requires a message', function() {
    expect(function() {
      new Prompt({
        name: 'foo',
        source: source
      });

    }).to.throw(/message/);
  });

  it('requires a source parameter', function() {
    expect(function() {
      new Prompt({
        name: 'foo',
        message: 'foo',
      });

    }).to.throw(/source/);
  });

  it('immediately calls source with null', function() {
    prompt.run();
    sinon.assert.calledOnce(source);
    sinon.assert.calledWithExactly(source, undefined, null);
  });

  describe('when it has some results', function() {
    var promiseForAnswer;
    beforeEach(function() {
      promiseForAnswer = getPromiseForAnswer();
      resolve(defaultChoices);
      return promise;
    });

    it('should move selected cursor on keypress', function() {
      moveDown();
      enter();

      return promiseForAnswer.then(function(answer) {
        expect(answer).to.equal('bar');
      })
    });

    it('moves up and down', function() {
      moveDown();
      moveDown();
      moveUp();
      enter();

      return promiseForAnswer.then(function(answer) {
        expect(answer).to.equal('bar');
      })
    });

    it('loops choices going down', function() {
      moveDown();
      moveDown();
      moveDown();
      enter();

      return promiseForAnswer.then(function(answer) {
        expect(answer).to.equal('foo');
      })
    });

    it('loops choices going up', function() {
      moveUp();
      enter();

      return promiseForAnswer.then(function(answer) {
        expect(answer).to.equal('bum');
      })
    })
  });


  describe('searching', function() {
    beforeEach(function() {
      prompt.run();
      source.reset();
    });

    it('searches after each char when user types', function() {
      type('a');
      sinon.assert.calledWithExactly(source, undefined, 'a');
      type('bba');
      sinon.assert.calledWithExactly(source, undefined, 'ab');
      sinon.assert.calledWithExactly(source, undefined, 'abb');
      sinon.assert.calledWithExactly(source, undefined, 'abba');
      sinon.assert.callCount(source, 4);
    });

    it('does not search again if same searchterm (not input added)', function() {
      type('ice');
      sinon.assert.calledThrice(source);
      source.reset();
      typeNonChar();
      sinon.assert.notCalled(source);
    });
  });

  describe('submit', function() {

    describe('without choices', function() {

      beforeEach(function() {
        prompt.run();
        source.reset();
      });

      it('searches again, since not possible to select something that does not exist', function() {
        sinon.assert.notCalled(source);
        enter();
        sinon.assert.calledOnce(source);
      });
    });

    describe('with choices', function() {
      var promiseForAnswer;

      beforeEach(function() {
        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);
        return promise;
      });

      it('stores the value as the answer and status to answered', function() {
        enter();
        return promiseForAnswer.then(function(answer) {
          expect(answer).to.equal('foo');
          expect(prompt.answer).to.equal('foo');
          expect(prompt.status).to.equal('answered');
        })
      });

      describe('after selecting', function() {
        beforeEach(function() {
          enter();
          source.reset();
          return promiseForAnswer;
        });

        it('stops searching on typing', function() {
          type('test');
          sinon.assert.notCalled(source);
        });

        it('does not change answer on enter', function() {
          enter();
          sinon.assert.notCalled(source);
          return promiseForAnswer.then(function(answer) {
            expect(answer).to.equal('foo');
            expect(prompt.answer).to.equal('foo');
            expect(prompt.status).to.equal('answered');
          })
        });
      });
    });

  });

  function getPromiseForAnswer() {
    return new Promise(function(resolve) {
      prompt.run(function(answer) {
        resolve(answer);
      });
    });
  }

  function typeNonChar() {
    rl.input.emit('keypress', '', {
      name: 'shift'
    });
  }

  function type(word) {
    word.split('').forEach(function(char) {
      rl.line = rl.line + char;
      rl.input.emit('keypress', char)
    });
  }

  function moveDown() {
    rl.input.emit('keypress', '', {
      name: 'down'
    });
  }

  function moveUp() {
    rl.input.emit('keypress', '', {
      name: 'up'
    });
  }

  function enter() {
    rl.emit('line');
  }

})
