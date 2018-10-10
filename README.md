# helm-i18n 
Forked from https://www.npmjs.com/package/grunt-i18n
> Internationalization support for grunt.

This is a dependency for HelmNext to build.

## Getting started
This plugin requires Grunt `~0.4.0`

## i18n task
_Run this task with the `grunt helm-i18n` command._
Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

This plugin provides a localization mechanism for grunt templates. It was developed as a tool for localizing html templates during a grunt build process. Since localization is done once during the build there is no performance hit on the application, as opposed to dynamic localization.

This version is a restricted cut down version of the actual grunt-i18n library, and basically only supports using the
simple <%=name_here%> template formats. Any other formatting methods will require further changes.

### Options
Available options to configure the task.

#### locales
Type: String|Array

Path to localization files. Please check the examples in tests. Glob patterns can be used.

#### output
Type: String

Root output folder.

#### base
Type: String

Base folder for HTML templates which should not be preserved while translating. 

#### format
Type: String

Supports 'json', 'properties'.

#### parser
Type: Object

Custom parser to read locale files. There are 2 functions which have to be provided:

* resolveLocale: (localePath) -> locale - get locale from locale path
* readLocaleData: (localePath) -> data - read locale file

## Release History
* 2018-09-28   v0.7.1   Custom modifications to resolve maximum stack size exception
* 2013-11-11   v0.7.0   Properties parser. Custom parsers
* 2013-12-31   v0.6.0   Transifex locale format added
* 2013-12-06   v0.5.0   Can read locals in yaml format
* 2013-11-29   v0.4.0   Custom delimiters and localization file existence checks
* 2013-10-23   v0.3.0   Fix for separator in output path. Add logging messages
* 2013-10-22   v0.2.0   Might be useful for others
* 2013-05-28   v0.1.0   Initial release, not really useful for anybody except me ;)
