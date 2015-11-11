var expect = require('chai').expect;
var sinon = require('sinon');
var _ = require('lodash');
var Promise = require('bluebird');
var fixtures = require('../helpers/fixtures');
var ReadlineStub = require('../helpers/readline');
var Prompt = require('../../index');

describe('inquirer-autocomplete-prompt', function() {
  var source;
  var prompt;
  var resolve;
  var reject;
  var promise;

  beforeEach(function() {
    promise = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    source = sinon.stub().returns(promise)

    this.fixture = _.clone(fixtures.autocomplete);
    this.rl = new ReadlineStub();
    prompt = new Prompt({
      message: 'test',
      name: 'name',
      source: source
    }, this.rl);
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

  describe('when it has searched', function() {

    it.skip('should move selected cursor on keypress', function(done) {
      prompt.run(function(answer) {
        expect(answer).to.equal('bar');
        done();
      });

      this.rl.input.emit('keypress', '', {
        name: 'down'
      });

      this.rl.emit('line');
    });
  });


})
