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

If no input is entered then the output value will be the default one. Adding the default feature looks like:

    default: "string"
                
This feature is only useful when suggestOnly is set to true. This is because if the user doesn't select and answer and hits enter then nothing gets output. But if you include the default feature then it will output that string instead. Below the default string is "USA"

    ```
        import autocomplete from 'inquirer-autocomplete-standalone';
        import { searchCountries } from './Countries.mjs';

        const answer = await autocomplete({
            message: 'Travel from what country?',
            suggestOnly: true,
            default: "USA"
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

## Result

### Initial List
<img src="Images/PageLimitBefore.JPG" alt="Page Limit Result" width="756" height="186">


### Enter is selected without selecting a value
<img src="Images/DefaultImage.JPG" alt="Page Limit Result" width="400" height="80">

