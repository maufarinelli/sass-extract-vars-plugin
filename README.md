# SASS-EXTRACT-VARS-PLUGIN

A webpack plugin to extract SASS variables from a `.scss` file and put into a `json` file to be used in your JS App.

## Reason (story behind it)

In the project I am working on, we inherit some SASS variables from a styleguide, but all our React Components are using `styled-components`.
We needed to reuse all thoses SASS variables in our StyledComponents.

We were using some npm package to extract sass to js, but that was not updated since 2018...
Our company has some security standards which our apps need to follow, and our dependencies have to be up-to-date for

### How to install

`npm install sass-extract-vars-plugin --save-dev`
or
`yarn add sass-extract-vars-plugin --dev`

### How to use it

In your webpack config file:

```
...
const SassExtractVarsPlugin = require('sass-extract-vars-plugin');

module.exports = {
    ...
    plugins: [
        new SassExtractVarsPlugin(
        [
            { color: './path/to/file/_colors.scss' },
            { font: './path/to/file/_fonts.scss' },
        ],
        './path/to/folder/to/save/theme.json',
        ),
    ...
    ]
}
```

When webpack compiles your code, it will create a JSON file with the same format as you provided in the first argument.
e.g:

```
{
    { 
        "color": {
            $firstVar: "#FFF",
            $secondVar: "#CCC"
        } 
    },
    {  
        font: {
            $thirdVar: "12px",
            $forthVar: "14px"
        } 
    },
}
    
```

and it will save the file in the path you provided as second parameter.

#### NOTE: If you using webpack-dev-server or any other that reloads when file changes are detected, you have to put that json file path in the watchOption ignored

e.g.:
```
  watchOptions: {
    ignored: '**/path/to/folder/to/save/theme.json',
  },
```

Finally, you just need to import in your code and use it

e.g.:
```
import themeVariables from './theme.json';
```
