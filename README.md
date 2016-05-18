# Multi Stylus Render Loader for Webpack

This loader takes a stylus file, renders it as many times as is specified each with different stylus options. The rendered css is namespace with a user defined value and returns a value ready to be used by the css-loader.   
  
This results in namespaced css rules that supports style-loader hot module replacement in dev-mode, and also text-extractor for production bundling. 
  
If you wish webpack to cache and watch the stylus files stylus dependencies, use stylus-flatten-loader, which bundles these, although lacks source map support.

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

Add the `multiStylusLoader` option to your Webpack config.

Add to your Webpack `loaders` config under the `/\.(styl|stylus)$/` test

#### Recommended loader config
```
{ test: /\.(styl|stylus)(\?.*)?$/,
  loader: 'style-loader!css-loader!multi-stylus-render!stylus-flatten'
}
```

#### CONFIG API
Config option `multiStylusLoader` in your Webpack config.

* **`paths`** property should be a dictionary
	* Maps a namespace to a, relative to the cwd, js module path. The module should export a stylus options object.
	* There can be as many path entries as required.

E.g. 

```
  multiStylusLoader: {
    paths:
    { 'stylusConfigOne': 'src/providers/stylusConfigOne.js'
    }
  }
```

## Install
in project `package.json` add this devDependency 
not hosted on npm, as I doubt anyone will want to use this

```json
"devDependencies": {
  "multi-stylus-render-loader": "git+http://github.com/ConnectedVentures/multi-stylus-render-loader.git"
'
}
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
