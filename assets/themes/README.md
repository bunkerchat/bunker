# Custom Themes

## Modifying an existing theme

Ask yourself, is this a change everyone would want?

* Yes? Feel free to modify it
* No? Make a new theme
* Unsure? Ask in the chat!

## Creating a new theme

1) Copy one of the existing scss files in this folder as a base
2) Determine which bootswatch theme you want to base off of, change the declarations

    Replace "basetheme" with some bootswatch theme you mostly like
    ```scss
    @import "../../node_modules/bootswatch/dist/basetheme/variables";
    @import "../../node_modules/bootstrap/scss/bootstrap";
    @import "../../node_modules/bootswatch/dist/basetheme/bootswatch";
    ```
    Alternatively if you hate Bootswatch figure out some other way of doing this, but this is 
    the easy way. Bear in mind Bootstrap helper classes are used extensively in Bunker V2 so
    you can't just have your own stylesheet that ignores Bootstrap.

3) If you wish to override some global Bootstrap settings like colors, widths, borders, etc. do so
by changing settings before the imports

    Example: Here I'm going to change the Bootstrap "red" setting and globally override
    some paddings
    ```scss
   $red: #bb0628;
   $input-height: 50px;
   $btn-padding-y: 0.75rem;
   $btn-padding-y: 0.75rem;
   
   // do all that before importing
   @import "../../node_modules/bootswatch/dist/basetheme/variables";
   //@import etc
    ```

4) If you wish to modify classes at a granular level do that after the imports 
    
    Example: Here I'm going to change some of the Bootstrap classes to style more how I want
    ```scss
   // @import etc
   @import "../../node_modules/bootswatch/dist/basetheme/bootswatch";
   // which should be done AFTER importing the base scss
   
   .navbar {
   	border-radius: 0;
   }
   
   a,
   [ng-click],
   [ui-sref] {
   	cursor: pointer;
   }
    ```

5) Add the value to settings component: `/src/features/Settings.jsx`
    
    * "value" of below needs to match the file name of your scss file
    * the label doesn't matter but make it good or else
    ```html
    <option value="filename-of-your-scss-file">Descriptive Label</option>
   ```
6) Add any component overrides to `/src/constants/theme.js`
   
7) Run `npm run build` or `npm run watch` and `gulp sass`

Look at classic.scss as an example