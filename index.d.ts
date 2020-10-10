import inquirer, { Answers } from 'inquirer';

declare module 'inquirer' {
  interface AutocompleteQuestionOptions<T> extends Question<T> {
    suggestOnly?: boolean;
    searchText?: string;
    emptyText?: string;
    default?: string;
    pageSize?: number;
    filter?(options: Array<string>): Array<string>;
    validate?(line: string): boolean;
    source(answersSoFar: Answers, input: string): Promise<Array<string>>;
  }

  export interface AutocompleteQuestion<T extends Answers = Answers> extends AutocompleteQuestionOptions<T> {
    type: "autocomplete";
  }

  export interface QuestionMap<T extends Answers = Answers> {
    autocomplete: AutocompleteQuestion<T>;
  }
}