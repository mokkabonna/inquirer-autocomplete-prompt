'use strict';

import { EventEmitter } from 'events';
import sinon from 'sinon';
class ReadlineStub extends EventEmitter {
  constructor() {
    super();
    this.line = '';
    this.input = new EventEmitter();
  }
}

const stub = {};

Object.assign(stub, {
  write: sinon.stub().returns(stub),
  moveCursor: sinon.stub().returns(stub),
  setPrompt: sinon.stub().returns(stub),
  close: sinon.stub().returns(stub),
  pause: sinon.stub().returns(stub),
  resume: sinon.stub().returns(stub),
  _getCursorPos: sinon.stub().returns({
    cols: 0,
    rows: 0,
  }),
  output: {
    end: sinon.stub(),
    mute: sinon.stub(),
    unmute: sinon.stub(),
    __raw__: '',
    write(str) {
      this.__raw__ += str;
    },
  },
});

Object.assign(ReadlineStub.prototype, stub);

export default ReadlineStub;
