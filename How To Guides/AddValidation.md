## Step 1

Starting with the main.mjs that was created in InstallDependencies.md:

 

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
    console.log(answer) 
    
     ```
__You will need the Countries.mjs as well in order for this code to work as intended. It can be found in the InstallDependencies.md__

## Step 2

Take a look at how the documentation says to use the validation function: 

        (value: Value) => boolean | string | Promise<string | boolean>

This function is suppose to take a value in and check to see if its valid or not. If it is true then it will return true. However, if the value is found to not be valid it will return false and an error string will be printed. 

### Step 3

Taking the what was just covered and adding it to the main.mjs file we get what is pictured below. Its a very basic  example of a validation function thats used to make sure the user chooses a value. Based on your needs you can add more logic to validate the answers.

__Notice that suggestOnly is set to true. So if the user hits enter without first selecting the value then an empty string will be returned__

    ```
    import autocomplete from 'inquirer-autocomplete-standalone';
    import { searchCountries } from './Countries.mjs';

    const answer = await autocomplete({
        message: 'Travel from what country?',
        suggestOnly: true,
            validate: async (input) => {
                // Can add more validation code here
                const isValid = input.trim() !== ''; 

                if (!isValid) {
                return 'Input cannot be empty.';
                }

                return true; 
            },
            source: async (input) => {
                const filteredCountries = await searchCountries(input);
                return filteredCountries.map(country => ({
                value: country,
                description: `${country} is a great place to visit`
                }));
            },
    });

    console.log(answer);

    ```

## Result

If you enter an invalid value then the command line will look like this:

<img src="Images/InvalidEntry.JPG" alt="Page Limit Result" width="1000" height="200">

The user will still be able to select another value.

 It should also be noted that if another invalid value is selected there will be no new indication. It will remain on the same screen.  