__This assume thats you have installed the necessary dependencies and checked your setup by running the demo outlined in InstallDependencies.MD__

## Step 1

There are two modules that we need to import which are:

* import autocomplete from 'inquirer-autocomplete-standalone';
* import { searchCountries } from './Countries.mjs';

The first one is importing this project and the other we will create a little further down in this page.

## Step 2

The very first feature we will look at is the message feature. It's a string that wil be displayed and prompts the user to select and answer. It will look something like:

                    message: "Select an input below"

The other important feature is the source function which can either by synchronous or asynchronous and is defined below.

(input?: string) => Promise<Choice<Value> | Separator> | Choice<Value> | Separator

It returns the value of the input that the user selects.


## Step 3

A easy example to see both the source and message features being used is found below. A similar example can be found in the [README](https://github.com/mokkabonna/inquirer-autocomplete-prompt#usage). Create a file called main.mjs and copy the code into it and save it.

    ```
    import autocomplete from 'inquirer-autocomplete-standalone';
    import { searchCountries } from './Countries.mjs';

    const answer = await autocomplete({
        message: 'Travel from what country?',
        
            source: async (input) => {
                const filteredCountries = await searchCountries(input)
                return filteredCountries.map(country => {
                    return {
                        value: country,
                        description: `${country} is a great place to visit`
                    }
                })
            }
    })
    // user searches and selects a country from the returned list
    console.log(answer) // Norway

    ```

## Step 2

The second import above is looking for an asynchronous function that contains a list of countries. Create another file at the same level as the previous file called "Countries.mjs" and copy this function into it and save it. 

    ```  
    async function searchCountries(input) {
    const countries = [
        'Sweden',
        'Denmark',
        'Finland',
        'Germany',
        'Netherlands',
        'France',
        // ...other country names
    ];

    // Filter the list of countries
    const filteredCountries = countries.filter(country =>
        country.toLowerCase()
    );

    return filteredCountries;
    }

    export { searchCountries };
    
    ```
 
## Step 3


The final step is to in the command line if you aren't already there is to navigate to the  project folder and run the following command

    node main.mjs 

This should populate the command line with a list of options that are listed in Countries.mjs and that you can interact with using your arrow keys. Once you hit enter on the option of your choosing it will be returned to the command line. This is shown below:

<img src="Images/AddSource.JPG" alt="Page Limit Result" width="700" height="260">