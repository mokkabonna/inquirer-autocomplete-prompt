import { describe, it, afterEach, beforeEach, expect } from 'vitest';
import { render } from '@inquirer/testing';
import sinon from 'sinon';

import autocomplete from '../src/index.js';
import { Separator } from '@inquirer/core';

describe('inquirer-autocomplete-prompt', () => {
  let sourceStub;

  let answer;
  let events;
  let getScreen;

  beforeEach(() => {
    sourceStub = sinon.stub();
  });

  afterEach(() => {
    getScreen = null;
    events = null;
    if (answer) {
      answer.cancel();
    }
    answer = null;
  });

  async function renderPrompt(config: any = {}) {
    config.message ??= 'msg';
    config.source ??= sourceStub;
    const renderResult = await render(autocomplete, config);
    answer = renderResult.answer;
    events = renderResult.events;
    getScreen = renderResult.getScreen;
    return renderResult;
  }

  it('calls source function right away with empty string', async () => {
    await renderPrompt();

    sinon.assert.calledOnce(sourceStub);
    sinon.assert.calledWith(sourceStub, undefined);
  });

  it('renders description', async () => {
    sourceStub.resolves([
      {
        value: '1',
        description: 'desc1',
      },
      {
        value: '2',
        description: 'desc2',
      },
    ]);

    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      ❯ 1
        2
      desc1"
    `);
  });

  it('renders text if empty results', async () => {
    sourceStub.resolves([]);

    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      No results..."
    `);
  });

  it('allows to show custom empty result text', async () => {
    sourceStub.resolves([]);
    await renderPrompt({
      source: sourceStub,
      emptyText: 'nothing here',
    });

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      nothing here"
    `);
  });

  it('renders error if not array', async () => {
    sourceStub.resolves({});

    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      > Autocomplete source function must return an array of choices"
    `);
  });

  it('selects first item', async () => {
    sourceStub.resolves([{ value: '1' }, { value: '2' }]);
    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      ❯ 1
        2"
    `);
  });

  it('selects first selectable item', async () => {
    sourceStub.resolves([
      { value: '1', disabled: true },
      { value: '2' },
      { value: '3' },
    ]);
    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      - 1 (disabled)
      ❯ 2
        3"
    `);
  });

  it('separator is not selectable', async () => {
    sourceStub.resolves([new Separator(), { value: '2' }, { value: '3' }]);
    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
       ──────────────
      ❯ 2
        3"
    `);
  });

  it('renders text if choice disabled property is string', async () => {
    sourceStub.resolves([
      { value: '1', disabled: 'I am disabled' },
      new Separator(),
      { value: '2' },
      { value: '3' },
    ]);

    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      - 1 I am disabled
       ──────────────
      ❯ 2
        3"
    `);
  });

  it('supports non async source function', async () => {
    sourceStub.returns([{ value: '1' }, { value: '2' }]);

    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      ❯ 1
        2"
    `);
  });

  it('shows error if synchronous error', async () => {
    sourceStub.throws(new Error('error in source function'));
    await renderPrompt();

    expect(getScreen()).to.toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
      > error in source function"
    `);
  });

  describe('navigation', () => {
    it('does not support j/k for up/down but accept them as input', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt();

      events.type('j');
      await Promise.resolve();

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg j
        ❯ 1
          2
          3"
      `);

      events.keypress('backspace');
      events.type('k');

      await Promise.resolve();

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg k
        ❯ 1
          2
          3"
      `);
    });

    it('selects next when pressing down', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt();

      events.keypress('down');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
          1
        ❯ 2
          3"
      `);

      events.keypress('down');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
          1
          2
        ❯ 3"
      `);

      // Loops back
      events.keypress('down');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        ❯ 1
          2
          3"
      `);
    });

    it('skips disabled and separators', async () => {
      sourceStub.resolves([
        { value: '1' },
        { value: '2', disabled: true },
        new Separator(),
        { value: '3' },
      ]);
      await renderPrompt();

      events.keypress('down');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
          1
        - 2 (disabled)
         ──────────────
        ❯ 3"
      `);
    });

    it('selects next when pressing up', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt();

      events.keypress('up');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
          1
          2
        ❯ 3"
      `);

      events.keypress('up');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
          1
        ❯ 2
          3"
      `);

      // Loops back
      events.keypress('up');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        ❯ 1
          2
          3"
      `);
    });
  });

  describe('when done', () => {
    it('renders choice name over value', async () => {
      sourceStub.resolves([{ name: 'name', value: 'value' }]);
      await renderPrompt({
        source: sourceStub,
      });

      events.keypress('enter');

      await Promise.resolve();

      expect(getScreen()).to.toMatchInlineSnapshot('"? msg name"');

      // resolves to value even if renders name
      await expect(answer).resolves.toEqual('value');
    });

    it('renders value if no name', async () => {
      sourceStub.resolves([{ value: 'bar' }]);
      await renderPrompt({
        source: sourceStub,
      });

      events.keypress('enter');

      await Promise.resolve();

      expect(getScreen()).to.toMatchInlineSnapshot('"? msg bar"');

      await expect(answer).resolves.toEqual('bar');
    });
  });

  describe('when enter pressed and no valid choice', () => {
    it('searches again', async () => {
      sourceStub.resolves([]);
      await renderPrompt();

      sinon.assert.calledOnce(sourceStub);

      events.keypress('enter');

      sinon.assert.calledTwice(sourceStub);
    });
  });

  describe('validation', () => {
    it('handles synchronous validation', async () => {
      sourceStub.resolves([
        { value: '1', description: 'choice 1 description' },
        { value: '2' },
      ]);

      await renderPrompt({
        validate: (value) => value === '2',
      });

      events.keypress('enter');
      await Promise.resolve();

      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        ❯ 1
          2
        choice 1 description
        > Enter something, tab to autocomplete!"
      `);

      // choose the valid one
      events.keypress('down');
      events.keypress('enter');
      await Promise.resolve();

      expect(getScreen()).to.toMatchInlineSnapshot('"? msg 2"');
    });

    it('handles asynchronous validation', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);

      await renderPrompt({
        validate: async (value) => value === '2',
      });

      events.keypress('enter');

      await Promise.resolve();

      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        ❯ 1
          2
          3
        > Enter something, tab to autocomplete!"
      `);

      // choose the valid one
      events.keypress('down');
      events.keypress('enter');

      await Promise.resolve();
      expect(getScreen()).to.toMatchInlineSnapshot('"? msg 2"');
    });
  });

  it('transforms the value using †he transformer function', async () => {
    sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
    const { answer, events, getScreen } = await renderPrompt({
      transformer: (value, { isFinal }) =>
        isFinal ? 'Transformed' : `transformed name: ${value}`,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        ❯ 1
          2
          3"
      `);

    events.keypress('down');
    // before done we print the transformed value in the prompt
    expect(getScreen()).toMatchInlineSnapshot(`
      "? msg (Use arrow keys or type to search)
        1
      ❯ 2
        3"
    `);

    await Promise.resolve();

    events.keypress('enter'); // select the second one
    await expect(answer).resolves.toEqual('2'); // it is the value of the choice, not the transformed value
    expect(getScreen()).toMatchInlineSnapshot('"? msg Transformed"'); // here we print the transformed value
  });

  describe('suggestOnly', () => {
    it('renders extra help text', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt({
        suggestOnly: true,
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search, tab to autocomplete)
        ❯ 1
          2
          3"
      `);
    });

    it('removes the default value on backspace', async () => {
      // keep promise pending
      const promise = new Promise(() => {});
      sourceStub.returns(promise);

      await renderPrompt({
        suggestOnly: true,
        default: '10',
      });

      events.keypress('backspace');

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg
        Searching..."
      `);
    });

    it('does nothing if pressing tab and no choice selected yet', async () => {
      // keep promise pending
      const promise = new Promise(() => {});
      sourceStub.returns(promise);

      await renderPrompt({
        suggestOnly: true,
        default: '10',
      });

      events.keypress('tab');

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (10) (Use arrow keys or type to search, tab to autocomplete)
        Searching..."
      `);
    });

    it('autocompletes the choice value if one selected', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt({
        suggestOnly: true,
        default: '3',
      });

      events.keypress('up');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (3) (Use arrow keys or type to search, tab to autocomplete)
          1
        ❯ 2
          3"
      `);

      events.keypress('tab');
      await Promise.resolve();

      // 2 was autcompleted while
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg 2
        ❯ 1
          2
          3"
      `);
    });

    it('supports a default value chosen by enter while still searching', async () => {
      // keep promise pending
      const promise = new Promise(() => {});
      sourceStub.returns(promise);

      await renderPrompt({
        suggestOnly: true,
        default: '10',
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (10) (Use arrow keys or type to search, tab to autocomplete)
        Searching..."
      `);

      events.keypress('enter');

      await expect(answer).resolves.toEqual('10');
      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg 10"
      `);
    });

    it('selects empty string if no default and nothing typed', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);

      await renderPrompt({
        suggestOnly: true,
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search, tab to autocomplete)
        ❯ 1
          2
          3"
      `);

      events.keypress('enter');
      await Promise.resolve();

      await expect(answer).resolves.toEqual('');
      expect(getScreen()).toMatchInlineSnapshot('"? msg"');
    });

    it('completes with the default if no choice has that value', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt({
        suggestOnly: true,
        default: '100',
      });

      events.keypress('enter');
      await Promise.resolve();

      await expect(answer).resolves.toEqual('100');
      expect(getScreen()).toMatchInlineSnapshot('"? msg 100"');
    });

    it('validates the final value', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt({
        suggestOnly: true,
        validate: (value) => (value ? true : 'can not use empty string'),
      });

      events.keypress('enter');
      await Promise.resolve();

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search, tab to autocomplete)
        ❯ 1
          2
          3
        > can not use empty string"
      `);
    });

    it('completes with the typed value', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt({
        suggestOnly: true,
        default: 'abc',
      });

      events.type('101');
      events.keypress('enter');
      await Promise.resolve();

      await expect(answer).resolves.toEqual('101');
      expect(getScreen()).toMatchInlineSnapshot('"? msg 101"');
    });

    it('completes with the autofilled value', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt({
        suggestOnly: true,
        default: 'abc',
      });

      events.keypress('down');
      events.keypress('tab');
      events.keypress('enter');
      await Promise.resolve();

      await expect(answer).resolves.toEqual('2');
      expect(getScreen()).toMatchInlineSnapshot('"? msg 2"');
    });

    it('supports a default value chosen by enter if choices has that value', async () => {
      let resolve;
      const promise = new Promise((r) => (resolve = r));

      sourceStub.returns(promise);

      await renderPrompt({
        suggestOnly: true,
        default: '10',
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (10) (Use arrow keys or type to search, tab to autocomplete)
        Searching..."
      `);

      resolve([{ value: '1' }, { value: '10' }]);

      await sourceStub.firstCall.returnValue;

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (10) (Use arrow keys or type to search, tab to autocomplete)
          1
        ❯ 10"
      `);

      events.keypress('enter');

      await expect(answer).resolves.toEqual('10');
      expect(getScreen()).toMatchInlineSnapshot('"? msg 10"');
    });

    it('transforms the value using †he transformer function', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      const { answer, events, getScreen } = await renderPrompt({
        suggestOnly: true,
        transformer: (value, { isFinal }) =>
          isFinal ? 'Transformed' : `transformed name: ${value}`,
      });

      expect(getScreen()).toMatchInlineSnapshot(`
          "? msg (Use arrow keys or type to search, tab to autocomplete)
          ❯ 1
            2
            3"
        `);

      events.type('John');
      // before done we print the transformed value in the prompt
      expect(getScreen()).toMatchInlineSnapshot(`
          "? msg transformed name: John
          Searching..."
        `);

      await Promise.resolve();

      events.keypress('enter'); // select the first one
      await expect(answer).resolves.toEqual('John'); // it is the value of the choice, not the transformed value
      expect(getScreen()).toMatchInlineSnapshot('"? msg Transformed"'); // here we print the transformed value
    });
  });

  describe('when searching', () => {
    it('does not select the previous choice if pressing enter while searching', async () => {
      sourceStub.resolves([{ value: '1' }, { value: '2' }, { value: '3' }]);
      await renderPrompt();

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        ❯ 1
          2
          3"
      `);

      events.type('xyz');

      expect(getScreen()).toMatchInlineSnapshot(`
      "? msg xyz
      Searching..."
      `);

      events.keypress('enter');
      await Promise.resolve();

      expect(getScreen()).toMatchInlineSnapshot(`
        "? msg xyz
        ❯ 1
          2
          3"
      `);
    });

    it('renders searching state', async () => {
      sourceStub.returns(new Promise(() => {})); // never resolves
      await renderPrompt();
      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        Searching..."
      `);
    });

    it('supports custom search text', async () => {
      sourceStub.returns(new Promise(() => {})); // keep it pending
      await renderPrompt({
        searchText: 'this is going to take a while...',
      });

      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        this is going to take a while..."
      `);
    });

    it('calls source function when receiving input', async () => {
      sourceStub.resolves([]);
      await renderPrompt();
      sinon.assert.calledOnce(sourceStub);
      sinon.assert.calledWith(sourceStub, undefined);

      sourceStub.reset();
      sourceStub.resolves([{ value: 2 }]);

      events.type('a');

      sinon.assert.calledOnce(sourceStub);
      sinon.assert.calledWith(sourceStub, 'a');

      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg a
        Searching..."
      `);

      await sourceStub.firstCall.returnValue;

      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg a
        ❯ 2"
      `);
    });

    it('does not render call1 results if another call is made before call1 completes', async () => {
      sourceStub.returns(
        new Promise((resolve) => {
          setTimeout(() => resolve([{ value: 1 }]), 10);
        })
      ); // keep it pending
      await renderPrompt();
      sinon.assert.calledOnce(sourceStub);
      sinon.assert.calledWith(sourceStub, undefined);

      sourceStub.resolves(
        new Promise((resolve) => {
          setTimeout(() => resolve([{ value: 2 }]), 5); // will finish before first call
        })
      );

      events.type('a');

      sinon.assert.calledTwice(sourceStub);
      sinon.assert.calledWith(sourceStub, 'a');

      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg a
        Searching..."
      `);

      await sourceStub.firstCall.returnValue;

      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg a
        ❯ 2"
      `);
    });

    it('does not show help text again if has typed anything and then deleted it', async () => {
      sourceStub.resolves([]);
      await renderPrompt();

      // help text is shown
      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg (Use arrow keys or type to search)
        No results..."
      `);

      events.type('a');

      // input is shown
      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg a
        Searching..."
      `);

      events.keypress('backspace');

      // no help text is shown
      expect(getScreen()).to.toMatchInlineSnapshot(`
        "? msg
        Searching..."
      `);
    });
  });
});
