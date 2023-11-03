# Tutorial 

## How to get the code to run locally 

### Step 1

The first thing you want to do is open a command line and navigate to the folder that you would like the project to reside in 

### Step 2

Check if you have node installed by running this command in the command line

    node -v 

If its not installed please follow the instructions listed here to install it: [npm install location](https://github.com/nvm-sh/nvm)

### Step 3

Download inquirer-autocomplete-standalone by running the command in the command line:

    npm install inquirer-autocomplete-standalone

### Step 4

Once downlaoded to make sure its installed correctly inside the command line run this command: 

    
    npx inquirer-autocomplete-demo

This should allow you to use the arrow keys ito interactively select a country. 

### Step 5

Inside the directory that your project is in create a main.mjs file and. Next copy the following code into it 

    ```
    import autocomplete from 'inquirer-autocomplete-standalone';
    import { searchCountries } = './some-external-api';

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

Next, we need to modify the second import to

    import { searchCountries } from './Countries.mjs';

### Step 6

Create another file at the same level as the previous file called "Countries" and copy this function into it and save it. 

```  
// This is a simplified example
async function searchCountries(input) {
    // Simulate an API call or use a real API here to fetch the list of countries
    const countries = [
      'Hello Welcome to this Program where we will be using a UI',
      'Sweden',
      'Denmark',
      'Finland',
      'Germany',
      'Netherlands',
      'France',
      // ...other country names
    ];
  
    // Filter the list of countries based on the user's input
    const filteredCountries = countries.filter(country =>
      country.toLowerCase()
    );
  
    return filteredCountries;
  }
  
  export { searchCountries };
  
  ```

### Step 7

The final step is to in the command line if you aren't already there is to navigate to the folder that the project is in and run the following command

    node main.mjs 

This should populate the command line with a list of options that are listed in Countries.mjs and that you can interact with using your arrow keys. Once you hit enter on the option of your choosing it will be returned to the command line. 
