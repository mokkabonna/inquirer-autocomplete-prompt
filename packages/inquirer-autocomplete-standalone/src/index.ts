import {
  AsyncPromptConfig,
  createPrompt,
  isBackspaceKey,
  isEnterKey,
  KeypressEvent,
  ResolvedPromptConfig,
  Separator,
  useEffect,
  useKeypress,
  usePagination,
  usePrefix,
  useRef,
  useState,
} from '@inquirer/core';
import figures from 'figures';
import pc from 'picocolors';
import type {} from '@inquirer/type';

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  disabled?: boolean | string;
  type?: never;
};

export type ChoiceOrSeparatorArray<Value> = ReadonlyArray<
  Choice<Value> | Separator
>;

type AutocompleteConfig<Value> = AsyncPromptConfig &
  ResolvedPromptConfig & {
    source: (input?: string) => Promise<ChoiceOrSeparatorArray<Value>>;
    validate?: (value: Value) => boolean | string | Promise<string | boolean>;
    transformer?: (value: string, { isFinal }: { isFinal: boolean }) => string;
    default?: string;
    emptyText?: string;
    pageSize?: number;
    searchText?: string;
    suggestOnly?: boolean;
  };

enum AsyncStatus {
  Pending = 'pending',
  Done = 'done',
}

function isSelectableChoice(choice: Choice<any> | Separator | null) {
  return choice !== null && !Separator.isSeparator(choice) && !choice.disabled;
}

/**
 * The isUpKey and isDownKey functions from inquirer include a check for j/k keys and we don't want that here
 */
function isUpKey(key: KeypressEvent) {
  return key.name === 'up';
}

function isDownKey(key: KeypressEvent) {
  return key.name === 'down';
}

function getValidationMsg(validationError: string) {
  return validationError ? pc.red(`\n> ${validationError}`) : '';
}
function getDescription<Value>(choice: Choice<Value> | null) {
  return choice?.description ? `\n${choice.description}` : '';
}

function getFirstSelectable<Value>(
  choices: ChoiceOrSeparatorArray<Value>,
  cursorPosition: number = -1,
  offset: number = 1
): [number, Choice<Value> | null] {
  let newCursorPosition = cursorPosition;
  let selectedOption = null;

  const hasSelectable = choices.some((c) => isSelectableChoice(c));
  if (!hasSelectable) {
    return [-1, null];
  }

  while (!isSelectableChoice(selectedOption)) {
    newCursorPosition =
      (newCursorPosition + offset + choices.length) % choices.length;
    selectedOption = choices[newCursorPosition] ?? null;
  }

  return [newCursorPosition, selectedOption as Choice<Value>];
}

function renderList<Value>(
  choices: ChoiceOrSeparatorArray<Value>,
  cursorPosition: number,
  config: AutocompleteConfig<Value>
) {
  const choicesAsString = choices
    .map((choice, index) => {
      if (Separator.isSeparator(choice)) {
        return ` ${choice.separator}`;
      }

      const line = choice.name || choice.value;
      if (choice.disabled) {
        const disabledLabel =
          typeof choice.disabled === 'string' ? choice.disabled : '(disabled)';
        return pc.dim(`- ${line} ${disabledLabel}`);
      }

      if (index === cursorPosition) {
        return pc.cyan(`${figures.pointer} ${line}`);
      }

      return `  ${line}`;
    })
    .join('\n');

  return usePagination(choicesAsString, {
    active: cursorPosition,
    pageSize: config.pageSize,
  });
}

export default createPrompt(
  <Value extends unknown>(
    config: AutocompleteConfig<Value>,
    done: (value: Value) => void
  ): string | [string, string] => {
    config.suggestOnly ??= false;
    const [searchStatus, setSearchStatus] = useState<AsyncStatus>(
      AsyncStatus.Pending
    );
    const [input, setInput] = useState<string | undefined>(undefined);
    const [defaultValue = '', setDefaultValue] = useState<string | undefined>(
      config.default
    );
    const prefix = usePrefix();
    const [isDirty, setIsDirty] = useState(false);
    const [choices, setChoices] = useState<ChoiceOrSeparatorArray<Value>>([]);
    const [choice, setChoice] = useState<Choice<Value> | null>(null);
    const [finalValue, setFinalValue] = useState<string | null>(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const promise = useRef<any>(null);

    const isDone = !!finalValue;

    function search() {
      setSearchStatus(AsyncStatus.Pending);
      setError('');
      setChoice(null);
      setChoices([]);

      let thisPromise: Promise<ChoiceOrSeparatorArray<Value>>;
      try {
        const result = config.source(input);
        thisPromise = Promise.resolve(result);
      } catch (err) {
        thisPromise = Promise.reject(err);
      }

      // Store this promise for check in the callback for in order result showing
      promise.current = thisPromise;

      thisPromise
        .then((newChoices) => {
          // If a search is triggered lastPromise would be updated and it will then not match the new thisPromise here
          // if so do nothing, as we will now rather wait for the new promise to resolve
          // also if no previous promises just continue
          if (promise.current !== null && thisPromise !== promise.current) {
            return;
          }

          if (!Array.isArray(newChoices)) {
            setError(
              'Autocomplete source function must return an array of choices'
            );
            setChoices([]);
            setChoice(null);
            return;
          }

          setChoices(newChoices);

          let [newCursorPosition, firstChoice] =
            getFirstSelectable<Value>(newChoices);

          if (defaultValue) {
            const foundAtIndex = newChoices.findIndex(
              (c) => !Separator.isSeparator(c) && c.value === defaultValue
            );

            if (foundAtIndex > -1) {
              newCursorPosition = foundAtIndex;
              firstChoice = (newChoices[foundAtIndex] as Choice<Value>) ?? null;
            }
          }

          setCursorPosition(newCursorPosition);
          setChoice(firstChoice);
          setSearchStatus(AsyncStatus.Done);
        })
        .catch((err) => {
          setError(err.message);
          setSearchStatus(AsyncStatus.Done);
        });
    }

    useEffect(search, [input]);

    async function validateAndSetDone(choice: Choice<Value>) {
      const validationResult = await config.validate(choice.value);
      if (validationResult !== true) {
        setValidationError(
          validationResult || 'Enter something, tab to autocomplete!'
        );
      } else {
        setDefaultValue(undefined);
        setValidationError('');
        const value = choice.name || String(choice.value);

        setFinalValue(value);
        done(choice.value);
      }

      return validationResult;
    }

    useKeypress(async (key, rl) => {
      if (isEnterKey(key)) {
        if (config.suggestOnly) {
          if (!input && defaultValue) {
            const fakeChoice = { value: defaultValue as Value };
            await validateAndSetDone(fakeChoice);
          } else {
            // if no default and no typed value yet, use input as is, normalize to empty string if undefined
            const fakeChoice = { value: (input ?? '') as Value };
            await validateAndSetDone(fakeChoice);
          }
        } else if (choice) {
          await validateAndSetDone(choice);
        } else {
          search();
        }
      } else if (isBackspaceKey(key) && !input) {
        setDefaultValue(undefined);
        setInput('');
        setIsDirty(true);
      } else if (key.name === 'tab') {
        if (config.suggestOnly) {
          // select choice value if one selected
          // else do nothing on tab (probably while still searching)
          if (choice) {
            setDefaultValue(undefined);
            rl.clearLine(0);
            const value = String(choice.value);
            rl.write(value);
            setIsDirty(true);
            setInput(value);
          }
        }
      } else if (isUpKey(key) || isDownKey(key)) {
        const offset = isUpKey(key) ? -1 : 1;
        const [newCursorPosition, firstChoice] = getFirstSelectable(
          choices,
          cursorPosition,
          offset
        );

        setCursorPosition(newCursorPosition);
        setChoice(firstChoice);
      } else {
        setIsDirty(true);
        setInput(rl.line);
        setError('');
      }
    });

    const message = pc.bold(config.message);

    let suggestHelpText = '';
    if (config.suggestOnly) {
      suggestHelpText = ', tab to autocomplete';
    }
    const listHelpText = pc.gray(
      `(Use arrow keys or type to search${suggestHelpText})`
    );

    function transformMaybe(input: string | undefined) {
      if (typeof config.transformer !== 'function') return input;
      return config.transformer(input || '', {
        isFinal: isDone,
      });
    }

    let formattedValue = transformMaybe(input);

    function renderPrompt(
      extra: string,
      ...rest: string[]
    ): string | [string, string] {
      const firstLine = `${prefix} ${message} ${extra}`;
      const below = rest.join('');

      return [`${firstLine}`, `${below}`];
    }

    if (finalValue !== null) {
      return renderPrompt(pc.cyan(transformMaybe(String(finalValue))));
    }

    let firstLineExtra = isDirty ? formattedValue ?? '' : listHelpText;

    if (defaultValue && !isDone && !input) {
      firstLineExtra = pc.dim(`(${defaultValue}) `) + firstLineExtra;
    }

    if (error) {
      return renderPrompt(firstLineExtra, pc.red(`> ${error}`));
    }

    let validationMsg = getValidationMsg(validationError);
    let choiceDescription = getDescription(choice);

    if (searchStatus === AsyncStatus.Pending) {
      return renderPrompt(
        firstLineExtra,
        config.searchText ?? pc.dim('Searching...'),
        choiceDescription,
        validationMsg
      );
    }

    if (!choices?.length) {
      return renderPrompt(
        firstLineExtra,
        config.emptyText ?? pc.yellow('No results...'),
        choiceDescription,
        validationMsg
      );
    }

    const list = renderList(choices, cursorPosition, config);
    return renderPrompt(firstLineExtra, list, choiceDescription, validationMsg);
  }
);

export { Separator };
