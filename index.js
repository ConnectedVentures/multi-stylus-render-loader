var path = require('path')
var fs = require('fs')

var loaderUtils = require('loader-utils')
var Promise = require('promise')
var stylus = require('stylus')
var cloneDeep = require('lodash.clonedeep')
var isArray = require('lodash.isarray')

var importRegexp = /(.*)@(import|require)\s*["'](.*)["']\s*$/
var trailingSlashesRegexp = /\/$/
var leadingWhitespaceRegexp = /^([\t ]*)/
var newLineRegexp = /(?:\\r)?\\n/g

module.exports = function(source) {
  var self = this
  if (self.cacheable) self.cacheable()
  var configPaths = cloneDeep(loaderUtils.getLoaderConfig(self, "multiStylusLoader")).paths
  var context = self.context
  var done = self.async()

  getConfigs(configPaths).then(function(configs) {
    return mutliRender(source, configs)
  }).then(function (results) {
    var output = results
    done(null, output)
  }).catch(function (err) {
    done(err)
  })

  function mutliRender (source, configs) {
    return Promise.all(
      Object.keys(configs).map(function(namespace, index) {
        var currentNamespace = namespace
        thisSource = '.' + namespace + '\n' 
          + indentSource(source, 2)
        var config = configs[namespace]
        return renderPromise(thisSource, config)
          .then(function(result) {
            result = '\n/* ' + currentNamespace + ' */\n' + result
            return result
          })
      })
    ).then(function(results) {
      return results.join('\n\n')
    })
  }

  function getConfigs (configPaths) {
    return Promise.all(
      Object.keys(configPaths).map(function(configName) {
        var configPath = configPaths[configName]
        // Asynchronously load import
        var configFileName
        return resolvePromise(context, configPath)
          .then(function(fileName) {
            self.addDependency && self.addDependency(fileName)
            configFileName = fileName
            return loadModulePromise('-!' + __dirname + '/identity.loader.js!' + fileName)
          }).then(function (results) {
            results = self.exec(results, configFileName)
            configPaths[configName] = results
          }).catch(function(err) {
            console.log('load module promise err', err)
          })
      })
    ).then(function () {
      return configPaths
    })
  }

  function renderPromise (source, config, namespace) {
    return new Promise(function(resolve, reject) {
      var compiler = stylus(source)
      applyOptions(compiler, config)
      compiler.render(function(err, css) {
        if (err) reject(err)
        resolve(css)
      })
    })
  }

  function resolvePromise(context, request) {
    return new Promise(function (resolve, reject) {
      self.resolve(context, request, function(err, filename) {
        if (err) reject(err)
        resolve(filename)
      })
    })
  }

  function loadModulePromise(request) {
    return new Promise(function (resolve, reject) {
      self.loadModule(request, function(err, source) {
        if (err) reject(err)
        resolve(source)
      })
    })
  }
}

function applyOptions(stylus, options) {
  ['set', 'include', 'import', 'define', 'use'].forEach(function(method) {
    var option = options[method]
    if (isArray(option)) {
      for (var i = 0; i < option.length; i++)
        stylus[method](option[i])
    } else {
      for (var prop in option)
        stylus[method](prop, option[prop])
    }
  })
}

function indentSource (source, indentSize) {
  var lines = source.split(newLineRegexp)
  var indent = Array(indentSize + 1).join(' ')
  return lines.map(function (line, index) {
    return indent + normalizeWhiteSpace(line)
  }).join('\n')
}

function normalizeWhiteSpace(line) {
  return line.replace(/\\t/g, '  ')
}