(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("library", [], factory);
	else if(typeof exports === 'object')
		exports["library"] = factory();
	else
		root["library"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _app = __webpack_require__(1);

var _app2 = _interopRequireDefault(_app);

__webpack_require__(7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function outdatedBrowser(options) {
  console.log('in main wrapper');
  console.log(options);
  (0, _app2.default)(options);
}
window.outdatedBrowser = outdatedBrowser;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _uaParserJs = __webpack_require__(2);

var _uaParserJs2 = _interopRequireDefault(_uaParserJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var languageMessages = __webpack_require__(6);

function OutDatedBrowser(userProvidedOptions) {
  console.log('in main code');
  console.log(userProvidedOptions);
  var main = function main(options) {
    console.log('in main function');
    console.log(options);

    // Despite the docs, UA needs to be provided to constructor explicitly:
    // https://github.com/faisalman/ua-parser-js/issues/90
    var parsedUserAgent = new _uaParserJs2.default(window.navigator.userAgent).getResult();

    // Variable definition (before ajax)
    var outdatedUI = document.getElementById('outdated');

    if (!outdatedUI) {
      console.warn('DOM element with id "outdated" is missing! Such element is required for outdated-browser to work. ' + 'Having such element only on certain pages is a valid way to define where to display alert, so if this is' + 'intentional, ignore this warning');
      return;
    }

    options = options || {};

    var browserLocale = window.navigator.language || window.navigator.userLanguage; // Everyone else, IE

    // Set default options
    var browserSupport = options.browserSupport || {
      'Chrome': 37,
      'IE': 10,
      'Safari': 7,
      'Mobile Safari': 7,
      'Firefox': 32
    };
    // CSS property to check for. You may also like 'borderSpacing', 'boxShadow', 'transform', 'borderImage';
    var requiredCssProperty = options.requiredCssProperty || false;
    var backgroundColor = options.backgroundColor || '#f25648'; // Salmon
    var textColor = options.textColor || 'white';
    var language = options.language || browserLocale.slice(0, 2); // Language code

    var languages = options.languageJson || {};
    var customCSSClasses = options.customCSSClasses || null;

    var updateSource = 'web'; // Other possible values are 'googlePlay' or 'appStore'. Determines where we tell users to go for upgrades.

    // Chrome mobile is still Chrome (unlike Safari which is 'Mobile Safari')
    var isAndroid = parsedUserAgent.os.name === 'Android';
    if (isAndroid) {
      updateSource = 'googlePlay';
    }

    var isAndroidButNotChrome;
    if (options.requireChromeOnAndroid) {
      isAndroidButNotChrome = isAndroid && parsedUserAgent.browser.name !== 'Chrome';
    }

    if (parsedUserAgent.os.name === 'iOS') {
      updateSource = 'appStore';
    }

    var done = true;

    var changeOpacity = function changeOpacity(opacityValue) {
      outdatedUI.style.opacity = opacityValue / 100;
      outdatedUI.style.filter = 'alpha(opacity=' + opacityValue + ')';
    };

    var fadeIn = function fadeIn(opacityValue) {
      changeOpacity(opacityValue);
      if (opacityValue === 1) {
        outdatedUI.style.display = 'block';
      }
      if (opacityValue === 100) {
        done = true;
      }
    };

    var isBrowserOutOfDate = function isBrowserOutOfDate() {
      var browserName = parsedUserAgent.browser.name;
      var browserMajorVersion = parsedUserAgent.browser.major;
      var isOutOfDate = false;
      if (browserSupport[browserName]) {
        if (browserMajorVersion < browserSupport[browserName]) {
          isOutOfDate = true;
        }
      }
      return isOutOfDate;
    };

    // Returns true if a browser supports a css3 property
    var isPropertySupported = function isPropertySupported(prop) {
      if (!prop) {
        return true;
      }
      var div = document.createElement('div');
      var vendorPrefixes = 'Khtml Ms O Moz Webkit'.split(' ');
      var count = vendorPrefixes.length;

      if (div.style[prop]) {
        return true;
      }

      prop = prop.replace(/^[a-z]/, function (val) {
        return val.toUpperCase();
      });

      while (count--) {
        if (div.style[vendorPrefixes[count] + prop]) {
          return true;
        }
      }
      return false;
    };

    var makeFadeInFunction = function makeFadeInFunction(x) {
      return function () {
        fadeIn(x);
      };
    };

    // Style element explicitly - TODO: investigate and delete if not needed
    var startStylesAndEvents = function startStylesAndEvents() {
      var buttonClose = document.getElementById('buttonCloseUpdateBrowser');
      var buttonUpdate = document.getElementById('buttonUpdateBrowser');

      //check settings attributes
      outdatedUI.style.backgroundColor = backgroundColor;
      //way too hard to put !important on IE6
      outdatedUI.style.color = textColor;
      outdatedUI.children[0].style.color = textColor;
      outdatedUI.children[1].style.color = textColor;

      // Update button is desktop only
      if (buttonUpdate) {
        buttonUpdate.style.color = textColor;
        if (buttonUpdate.style.borderColor) {
          buttonUpdate.style.borderColor = textColor;
        }

        // Override the update button color to match the background color
        buttonUpdate.onmouseover = function () {
          this.style.color = backgroundColor;
          this.style.backgroundColor = textColor;
        };

        buttonUpdate.onmouseout = function () {
          this.style.color = textColor;
          this.style.backgroundColor = backgroundColor;
        };
      }

      buttonClose.style.color = textColor;

      buttonClose.onmousedown = function () {
        outdatedUI.style.display = 'none';
        return false;
      };
    };

    var getmessage = function getmessage(lang, userProvidedLanguageJson, customCSSClasses) {
      var messages = userProvidedLanguageJson[lang] || languageMessages[lang] || languageMessages.en;
      var titleClass = customCSSClasses ? customCSSClasses.titleClass ? customCSSClasses.titleClass : '' : '';
      var contentClass = customCSSClasses ? customCSSClasses.contentClass ? customCSSClasses.contentClass : '' : '';
      var actionButtonClass = customCSSClasses ? customCSSClasses.actionButtonClass ? customCSSClasses.actionButtonClass : '' : '';
      var closeButtonClass = customCSSClasses ? customCSSClasses.closeButtonClass ? customCSSClasses.closeButtonClass : '' : '';

      var updateMessages = {
        'web': '<p class="' + contentClass + '">' + messages.update.web + '<a id="buttonUpdateBrowser" href="' + messages.url + '" class="' + actionButtonClass + '">' + messages.callToAction + '</a></p>',
        'googlePlay': '<p class="' + contentClass + '">' + messages.update.googlePlay + '<a id="buttonUpdateBrowser" href="https://play.google.com/store/apps/details?id=com.android.chrome" class="' + actionButtonClass + '">' + messages.callToAction + '</a></p>',
        'appStore': '<p class="' + contentClass + '">' + messages.update[updateSource] + '</p>'
      };

      var updateMessage = updateMessages[updateSource];

      return '<h6 class="' + titleClass + '">' + messages.outOfDate + '</h6>' + updateMessage + '<p class="last ' + closeButtonClass + '"><a href="#" id="buttonCloseUpdateBrowser" title="' + messages.close + '">×</a></p>';
    };

    // Check if browser is supported
    if (isBrowserOutOfDate() || !isPropertySupported(requiredCssProperty) || isAndroidButNotChrome) {

      // This is an outdated browser
      if (done && outdatedUI.style.opacity !== '1') {
        done = false;

        for (var i = 1; i <= 100; i++) {
          setTimeout(makeFadeInFunction(i), i * 8);
        }
      }

      var insertContentHere = document.getElementById('outdated');
      var wrapperClass = customCSSClasses ? customCSSClasses.wrapperClass ? customCSSClasses.wrapperClass : false : false;
      if (wrapperClass) {
        insertContentHere.classList.add(wrapperClass);
      }
      insertContentHere.innerHTML = getmessage(language, languages, customCSSClasses);
      startStylesAndEvents();
    }
  };

  // Load main when DOM ready.
  var oldOnload = window.onload;
  if (typeof window.onload !== 'function') {
    window.onload = function () {
      return main(userProvidedOptions);
    };
  } else {
    window.onload = function () {
      if (oldOnload) {
        oldOnload();
      }
      main(userProvidedOptions);
    };
  }
};
module.exports = OutDatedBrowser;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * UAParser.js v0.7.17
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2016 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var LIBVERSION = '0.7.17',
        EMPTY = '',
        UNKNOWN = '?',
        FUNC_TYPE = 'function',
        UNDEF_TYPE = 'undefined',
        OBJ_TYPE = 'object',
        STR_TYPE = 'string',
        MAJOR = 'major',
        // deprecated
    MODEL = 'model',
        NAME = 'name',
        TYPE = 'type',
        VENDOR = 'vendor',
        VERSION = 'version',
        ARCHITECTURE = 'architecture',
        CONSOLE = 'console',
        MOBILE = 'mobile',
        TABLET = 'tablet',
        SMARTTV = 'smarttv',
        WEARABLE = 'wearable',
        EMBEDDED = 'embedded';

    ///////////
    // Helper
    //////////


    var util = {
        extend: function extend(regexes, extensions) {
            var margedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    margedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    margedRegexes[i] = regexes[i];
                }
            }
            return margedRegexes;
        },
        has: function has(str1, str2) {
            if (typeof str1 === "string") {
                return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
            } else {
                return false;
            }
        },
        lowerize: function lowerize(str) {
            return str.toLowerCase();
        },
        major: function major(version) {
            return (typeof version === 'undefined' ? 'undefined' : _typeof(version)) === STR_TYPE ? version.replace(/[^\d\.]/g, '').split(".")[0] : undefined;
        },
        trim: function trim(str) {
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    };

    ///////////////
    // Map helper
    //////////////


    var mapper = {

        rgx: function rgx(ua, arrays) {

            //var result = {},
            var i = 0,
                j,
                k,
                p,
                q,
                matches,
                match; //, args = arguments;

            /*// construct object barebones
            for (p = 0; p < args[1].length; p++) {
                q = args[1][p];
                result[typeof q === OBJ_TYPE ? q[0] : q] = undefined;
            }*/

            // loop through all regexes maps
            while (i < arrays.length && !matches) {

                var regex = arrays[i],
                    // even sequence (0,2,4,..)
                props = arrays[i + 1]; // odd sequence (1,3,5,..)
                j = k = 0;

                // try matching uastring with regexes
                while (j < regex.length && !matches) {

                    matches = regex[j++].exec(ua);

                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if ((typeof q === 'undefined' ? 'undefined' : _typeof(q)) === OBJ_TYPE && q.length > 0) {
                                if (q.length == 2) {
                                    if (_typeof(q[1]) == FUNC_TYPE) {
                                        // assign modified match
                                        this[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        this[q[0]] = q[1];
                                    }
                                } else if (q.length == 3) {
                                    // check whether function or regex
                                    if (_typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length == 4) {
                                    this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                this[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
            // console.log(this);
            //return this;
        },

        str: function str(_str, map) {

            for (var i in map) {
                // check if array
                if (_typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (util.has(map[i][j], _str)) {
                            return i === UNKNOWN ? undefined : i;
                        }
                    }
                } else if (util.has(map[i], _str)) {
                    return i === UNKNOWN ? undefined : i;
                }
            }
            return _str;
        }
    };

    ///////////////
    // String map
    //////////////


    var maps = {

        browser: {
            oldsafari: {
                version: {
                    '1.0': '/8',
                    '1.2': '/1',
                    '1.3': '/3',
                    '2.0': '/412',
                    '2.0.2': '/416',
                    '2.0.3': '/417',
                    '2.0.4': '/419',
                    '?': '/'
                }
            }
        },

        device: {
            amazon: {
                model: {
                    'Fire Phone': ['SD', 'KF']
                }
            },
            sprint: {
                model: {
                    'Evo Shift 4G': '7373KT'
                },
                vendor: {
                    'HTC': 'APA',
                    'Sprint': 'Sprint'
                }
            }
        },

        os: {
            windows: {
                version: {
                    'ME': '4.90',
                    'NT 3.11': 'NT3.51',
                    'NT 4.0': 'NT4.0',
                    '2000': 'NT 5.0',
                    'XP': ['NT 5.1', 'NT 5.2'],
                    'Vista': 'NT 6.0',
                    '7': 'NT 6.1',
                    '8': 'NT 6.2',
                    '8.1': 'NT 6.3',
                    '10': ['NT 6.4', 'NT 10.0'],
                    'RT': 'ARM'
                }
            }
        }
    };

    //////////////
    // Regex map
    /////////////


    var regexes = {

        browser: [[

        // Presto based
        /(opera\smini)\/([\w\.-]+)/i, // Opera Mini
        /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i, // Opera Mobi/Tablet
        /(opera).+version\/([\w\.]+)/i, // Opera > 9.80
        /(opera)[\/\s]+([\w\.]+)/i // Opera < 9.80
        ], [NAME, VERSION], [/(opios)[\/\s]+([\w\.]+)/i // Opera mini on iphone >= 8.0
        ], [[NAME, 'Opera Mini'], VERSION], [/\s(opr)\/([\w\.]+)/i // Opera Webkit
        ], [[NAME, 'Opera'], VERSION], [

        // Mixed
        /(kindle)\/([\w\.]+)/i, // Kindle
        /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
        // Lunascape/Maxthon/Netfront/Jasmine/Blazer

        // Trident based
        /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
        // Avant/IEMobile/SlimBrowser/Baidu
        /(?:ms|\()(ie)\s([\w\.]+)/i, // Internet Explorer

        // Webkit/KHTML based
        /(rekonq)\/([\w\.]+)*/i, // Rekonq
        /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser)\/([\w\.-]+)/i
        // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser
        ], [NAME, VERSION], [/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i // IE11
        ], [[NAME, 'IE'], VERSION], [/(edge)\/((\d+)?[\w\.]+)/i // Microsoft Edge
        ], [NAME, VERSION], [/(yabrowser)\/([\w\.]+)/i // Yandex
        ], [[NAME, 'Yandex'], VERSION], [/(puffin)\/([\w\.]+)/i // Puffin
        ], [[NAME, 'Puffin'], VERSION], [/((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i
        // UCBrowser
        ], [[NAME, 'UCBrowser'], VERSION], [/(comodo_dragon)\/([\w\.]+)/i // Comodo Dragon
        ], [[NAME, /_/g, ' '], VERSION], [/(micromessenger)\/([\w\.]+)/i // WeChat
        ], [[NAME, 'WeChat'], VERSION], [/(QQ)\/([\d\.]+)/i // QQ, aka ShouQ
        ], [NAME, VERSION], [/m?(qqbrowser)[\/\s]?([\w\.]+)/i // QQBrowser
        ], [NAME, VERSION], [/xiaomi\/miuibrowser\/([\w\.]+)/i // MIUI Browser
        ], [VERSION, [NAME, 'MIUI Browser']], [/;fbav\/([\w\.]+);/i // Facebook App for iOS & Android
        ], [VERSION, [NAME, 'Facebook']], [/headlesschrome(?:\/([\w\.]+)|\s)/i // Chrome Headless
        ], [VERSION, [NAME, 'Chrome Headless']], [/\swv\).+(chrome)\/([\w\.]+)/i // Chrome WebView
        ], [[NAME, /(.+)/, '$1 WebView'], VERSION], [/((?:oculus|samsung)browser)\/([\w\.]+)/i], [[NAME, /(.+(?:g|us))(.+)/, '$1 $2'], VERSION], [// Oculus / Samsung Browser

        /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i // Android Browser
        ], [VERSION, [NAME, 'Android Browser']], [/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i
        // Chrome/OmniWeb/Arora/Tizen/Nokia
        ], [NAME, VERSION], [/(dolfin)\/([\w\.]+)/i // Dolphin
        ], [[NAME, 'Dolphin'], VERSION], [/((?:android.+)crmo|crios)\/([\w\.]+)/i // Chrome for Android/iOS
        ], [[NAME, 'Chrome'], VERSION], [/(coast)\/([\w\.]+)/i // Opera Coast
        ], [[NAME, 'Opera Coast'], VERSION], [/fxios\/([\w\.-]+)/i // Firefox for iOS
        ], [VERSION, [NAME, 'Firefox']], [/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i // Mobile Safari
        ], [VERSION, [NAME, 'Mobile Safari']], [/version\/([\w\.]+).+?(mobile\s?safari|safari)/i // Safari & Safari Mobile
        ], [VERSION, NAME], [/webkit.+?(gsa)\/([\w\.]+).+?(mobile\s?safari|safari)(\/[\w\.]+)/i // Google Search Appliance on iOS
        ], [[NAME, 'GSA'], VERSION], [/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i // Safari < 3.0
        ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [/(konqueror)\/([\w\.]+)/i, // Konqueror
        /(webkit|khtml)\/([\w\.]+)/i], [NAME, VERSION], [

        // Gecko based
        /(navigator|netscape)\/([\w\.-]+)/i // Netscape
        ], [[NAME, 'Netscape'], VERSION], [/(swiftfox)/i, // Swiftfox
        /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
        // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
        /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
        // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
        /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i, // Mozilla

        // Other
        /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
        // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
        /(links)\s\(([\w\.]+)/i, // Links
        /(gobrowser)\/?([\w\.]+)*/i, // GoBrowser
        /(ice\s?browser)\/v?([\w\._]+)/i, // ICE Browser
        /(mosaic)[\/\s]([\w\.]+)/i // Mosaic
        ], [NAME, VERSION]

        /* /////////////////////
        // Media players BEGIN
        ////////////////////////
         , [
         /(apple(?:coremedia|))\/((\d+)[\w\._]+)/i,                          // Generic Apple CoreMedia
        /(coremedia) v((\d+)[\w\._]+)/i
        ], [NAME, VERSION], [
         /(aqualung|lyssna|bsplayer)\/((\d+)?[\w\.-]+)/i                     // Aqualung/Lyssna/BSPlayer
        ], [NAME, VERSION], [
         /(ares|ossproxy)\s((\d+)[\w\.-]+)/i                                 // Ares/OSSProxy
        ], [NAME, VERSION], [
         /(audacious|audimusicstream|amarok|bass|core|dalvik|gnomemplayer|music on console|nsplayer|psp-internetradioplayer|videos)\/((\d+)[\w\.-]+)/i,
                                                                            // Audacious/AudiMusicStream/Amarok/BASS/OpenCORE/Dalvik/GnomeMplayer/MoC
                                                                            // NSPlayer/PSP-InternetRadioPlayer/Videos
        /(clementine|music player daemon)\s((\d+)[\w\.-]+)/i,               // Clementine/MPD
        /(lg player|nexplayer)\s((\d+)[\d\.]+)/i,
        /player\/(nexplayer|lg player)\s((\d+)[\w\.-]+)/i                   // NexPlayer/LG Player
        ], [NAME, VERSION], [
        /(nexplayer)\s((\d+)[\w\.-]+)/i                                     // Nexplayer
        ], [NAME, VERSION], [
         /(flrp)\/((\d+)[\w\.-]+)/i                                          // Flip Player
        ], [[NAME, 'Flip Player'], VERSION], [
         /(fstream|nativehost|queryseekspider|ia-archiver|facebookexternalhit)/i
                                                                            // FStream/NativeHost/QuerySeekSpider/IA Archiver/facebookexternalhit
        ], [NAME], [
         /(gstreamer) souphttpsrc (?:\([^\)]+\)){0,1} libsoup\/((\d+)[\w\.-]+)/i
                                                                            // Gstreamer
        ], [NAME, VERSION], [
         /(htc streaming player)\s[\w_]+\s\/\s((\d+)[\d\.]+)/i,              // HTC Streaming Player
        /(java|python-urllib|python-requests|wget|libcurl)\/((\d+)[\w\.-_]+)/i,
                                                                            // Java/urllib/requests/wget/cURL
        /(lavf)((\d+)[\d\.]+)/i                                             // Lavf (FFMPEG)
        ], [NAME, VERSION], [
         /(htc_one_s)\/((\d+)[\d\.]+)/i                                      // HTC One S
        ], [[NAME, /_/g, ' '], VERSION], [
         /(mplayer)(?:\s|\/)(?:(?:sherpya-){0,1}svn)(?:-|\s)(r\d+(?:-\d+[\w\.-]+){0,1})/i
                                                                            // MPlayer SVN
        ], [NAME, VERSION], [
         /(mplayer)(?:\s|\/|[unkow-]+)((\d+)[\w\.-]+)/i                      // MPlayer
        ], [NAME, VERSION], [
         /(mplayer)/i,                                                       // MPlayer (no other info)
        /(yourmuze)/i,                                                      // YourMuze
        /(media player classic|nero showtime)/i                             // Media Player Classic/Nero ShowTime
        ], [NAME], [
         /(nero (?:home|scout))\/((\d+)[\w\.-]+)/i                           // Nero Home/Nero Scout
        ], [NAME, VERSION], [
         /(nokia\d+)\/((\d+)[\w\.-]+)/i                                      // Nokia
        ], [NAME, VERSION], [
         /\s(songbird)\/((\d+)[\w\.-]+)/i                                    // Songbird/Philips-Songbird
        ], [NAME, VERSION], [
         /(winamp)3 version ((\d+)[\w\.-]+)/i,                               // Winamp
        /(winamp)\s((\d+)[\w\.-]+)/i,
        /(winamp)mpeg\/((\d+)[\w\.-]+)/i
        ], [NAME, VERSION], [
         /(ocms-bot|tapinradio|tunein radio|unknown|winamp|inlight radio)/i  // OCMS-bot/tap in radio/tunein/unknown/winamp (no other info)
                                                                            // inlight radio
        ], [NAME], [
         /(quicktime|rma|radioapp|radioclientapplication|soundtap|totem|stagefright|streamium)\/((\d+)[\w\.-]+)/i
                                                                            // QuickTime/RealMedia/RadioApp/RadioClientApplication/
                                                                            // SoundTap/Totem/Stagefright/Streamium
        ], [NAME, VERSION], [
         /(smp)((\d+)[\d\.]+)/i                                              // SMP
        ], [NAME, VERSION], [
         /(vlc) media player - version ((\d+)[\w\.]+)/i,                     // VLC Videolan
        /(vlc)\/((\d+)[\w\.-]+)/i,
        /(xbmc|gvfs|xine|xmms|irapp)\/((\d+)[\w\.-]+)/i,                    // XBMC/gvfs/Xine/XMMS/irapp
        /(foobar2000)\/((\d+)[\d\.]+)/i,                                    // Foobar2000
        /(itunes)\/((\d+)[\d\.]+)/i                                         // iTunes
        ], [NAME, VERSION], [
         /(wmplayer)\/((\d+)[\w\.-]+)/i,                                     // Windows Media Player
        /(windows-media-player)\/((\d+)[\w\.-]+)/i
        ], [[NAME, /-/g, ' '], VERSION], [
         /windows\/((\d+)[\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ (home media server)/i
                                                                            // Windows Media Server
        ], [VERSION, [NAME, 'Windows']], [
         /(com\.riseupradioalarm)\/((\d+)[\d\.]*)/i                          // RiseUP Radio Alarm
        ], [NAME, VERSION], [
         /(rad.io)\s((\d+)[\d\.]+)/i,                                        // Rad.io
        /(radio.(?:de|at|fr))\s((\d+)[\d\.]+)/i
        ], [[NAME, 'rad.io'], VERSION]
         //////////////////////
        // Media players END
        ////////////////////*/

        ],

        cpu: [[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i // AMD64
        ], [[ARCHITECTURE, 'amd64']], [/(ia32(?=;))/i // IA32 (quicktime)
        ], [[ARCHITECTURE, util.lowerize]], [/((?:i[346]|x)86)[;\)]/i // IA32
        ], [[ARCHITECTURE, 'ia32']], [

        // PocketPC mistakenly identified as PowerPC
        /windows\s(ce|mobile);\sppc;/i], [[ARCHITECTURE, 'arm']], [/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i // PowerPC
        ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [/(sun4\w)[;\)]/i // SPARC
        ], [[ARCHITECTURE, 'sparc']], [/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
        // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
        ], [[ARCHITECTURE, util.lowerize]]],

        device: [[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i // iPad/PlayBook
        ], [MODEL, VENDOR, [TYPE, TABLET]], [/applecoremedia\/[\w\.]+ \((ipad)/ // iPad
        ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [/(apple\s{0,1}tv)/i // Apple TV
        ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple']], [/(archos)\s(gamepad2?)/i, // Archos
        /(hp).+(touchpad)/i, // HP TouchPad
        /(hp).+(tablet)/i, // HP Tablet
        /(kindle)\/([\w\.]+)/i, // Kindle
        /\s(nook)[\w\s]+build\/(\w+)/i, // Nook
        /(dell)\s(strea[kpr\s\d]*[\dko])/i // Dell Streak
        ], [VENDOR, MODEL, [TYPE, TABLET]], [/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i // Kindle Fire HD
        ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i // Fire Phone
        ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [/\((ip[honed|\s\w*]+);.+(apple)/i // iPod/iPhone
        ], [MODEL, VENDOR, [TYPE, MOBILE]], [/\((ip[honed|\s\w*]+);/i // iPod/iPhone
        ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [/(blackberry)[\s-]?(\w+)/i, // BlackBerry
        /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
        // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
        /(hp)\s([\w\s]+\w)/i, // HP iPAQ
        /(asus)-?(\w+)/i // Asus
        ], [VENDOR, MODEL, [TYPE, MOBILE]], [/\(bb10;\s(\w+)/i // BlackBerry 10
        ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
        // Asus Tablets
        /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone)/i], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [/(sony)\s(tablet\s[ps])\sbuild\//i, // Sony
        /(sony)?(?:sgp.+)\sbuild\//i], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [/android.+\s([c-g]\d{4}|so[-l]\w+)\sbuild\//i], [MODEL, [VENDOR, 'Sony'], [TYPE, MOBILE]], [/\s(ouya)\s/i, // Ouya
        /(nintendo)\s([wids3u]+)/i // Nintendo
        ], [VENDOR, MODEL, [TYPE, CONSOLE]], [/android.+;\s(shield)\sbuild/i // Nvidia
        ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [/(playstation\s[34portablevi]+)/i // Playstation
        ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [/(sprint\s(\w+))/i // Sprint Phones
        ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i // Lenovo tablets
        ], [VENDOR, MODEL, [TYPE, TABLET]], [/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i, // HTC
        /(zte)-(\w+)*/i, // ZTE
        /(alcatel|geeksphone|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
        // Alcatel/GeeksPhone/Lenovo/Nexian/Panasonic/Sony
        ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [/(nexus\s9)/i // HTC Nexus 9
        ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [/d\/huawei([\w\s-]+)[;\)]/i, /(nexus\s6p)/i // Huawei
        ], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [/(microsoft);\s(lumia[\s\w]+)/i // Microsoft Lumia
        ], [VENDOR, MODEL, [TYPE, MOBILE]], [/[\s\(;](xbox(?:\sone)?)[\s\);]/i // Microsoft Xbox
        ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [/(kin\.[onetw]{3})/i // Microsoft Kin
        ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

        // Motorola
        /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i, /mot[\s-]?(\w+)*/i, /(XT\d{3,4}) build\//i, /(nexus\s6)/i], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [/hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i // HbbTV devices
        ], [[VENDOR, util.trim], [MODEL, util.trim], [TYPE, SMARTTV]], [/hbbtv.+maple;(\d+)/i], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [/\(dtv[\);].+(aquos)/i // Sharp
        ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i, /((SM-T\w+))/i], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [// Samsung
        /smart-tv.+(samsung)/i], [VENDOR, [TYPE, SMARTTV], MODEL], [/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i, /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i, /sec-((sgh\w+))/i], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [/sie-(\w+)*/i // Siemens
        ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [/(maemo|nokia).*(n900|lumia\s\d+)/i, // Nokia
        /(nokia)[\s_-]?([\w-]+)*/i], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [/android\s3\.[\s\w;-]{10}(a\d{3})/i // Acer
        ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [/android.+([vl]k\-?\d{3})\s+build/i // LG Tablet
        ], [MODEL, [VENDOR, 'LG'], [TYPE, TABLET]], [/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i // LG Tablet
        ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [/(lg) netcast\.tv/i // LG SmartTV
        ], [VENDOR, MODEL, [TYPE, SMARTTV]], [/(nexus\s[45])/i, // LG
        /lg[e;\s\/-]+(\w+)*/i, /android.+lg(\-?[\d\w]+)\s+build/i], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [/android.+(ideatab[a-z0-9\-\s]+)/i // Lenovo
        ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [/linux;.+((jolla));/i // Jolla
        ], [VENDOR, MODEL, [TYPE, MOBILE]], [/((pebble))app\/[\d\.]+\s/i // Pebble
        ], [VENDOR, MODEL, [TYPE, WEARABLE]], [/android.+;\s(oppo)\s?([\w\s]+)\sbuild/i // OPPO
        ], [VENDOR, MODEL, [TYPE, MOBILE]], [/crkey/i // Google Chromecast
        ], [[MODEL, 'Chromecast'], [VENDOR, 'Google']], [/android.+;\s(glass)\s\d/i // Google Glass
        ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [/android.+;\s(pixel c)\s/i // Google Pixel C
        ], [MODEL, [VENDOR, 'Google'], [TYPE, TABLET]], [/android.+;\s(pixel xl|pixel)\s/i // Google Pixel
        ], [MODEL, [VENDOR, 'Google'], [TYPE, MOBILE]], [/android.+(\w+)\s+build\/hm\1/i, // Xiaomi Hongmi 'numeric' models
        /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i, // Xiaomi Hongmi
        /android.+(mi[\s\-_]*(?:one|one[\s_]plus|note lte)?[\s_]*(?:\d\w)?)\s+build/i, // Xiaomi Mi
        /android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+)?)\s+build/i // Redmi Phones
        ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [/android.+(mi[\s\-_]*(?:pad)?(?:[\s_]*[\w\s]+)?)\s+build/i // Mi Pad tablets
        ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, TABLET]], [/android.+;\s(m[1-5]\snote)\sbuild/i // Meizu Tablet
        ], [MODEL, [VENDOR, 'Meizu'], [TYPE, TABLET]], [/android.+a000(1)\s+build/i // OnePlus
        ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [/android.+[;\/]\s*(RCT[\d\w]+)\s+build/i // RCA Tablets
        ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [/android.+[;\/]\s*(Venue[\d\s]*)\s+build/i // Dell Venue Tablets
        ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [/android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i // Verizon Tablet
        ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [/android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i // Barnes & Noble Tablet
        ], [[VENDOR, 'Barnes & Noble'], MODEL, [TYPE, TABLET]], [/android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i // Barnes & Noble Tablet
        ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [/android.+[;\/]\s*(zte)?.+(k\d{2})\s+build/i // ZTE K Series Tablet
        ], [[VENDOR, 'ZTE'], MODEL, [TYPE, TABLET]], [/android.+[;\/]\s*(gen\d{3})\s+build.*49h/i // Swiss GEN Mobile
        ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [/android.+[;\/]\s*(zur\d{3})\s+build/i // Swiss ZUR Tablet
        ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [/android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i // Zeki Tablets
        ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [/(android).+[;\/]\s+([YR]\d{2}x?.*)\s+build/i, /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(.+)\s+build/i // Dragon Touch Tablet
        ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [/android.+[;\/]\s*(NS-?.+)\s+build/i // Insignia Tablets
        ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [/android.+[;\/]\s*((NX|Next)-?.+)\s+build/i // NextBook Tablets
        ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [/android.+[;\/]\s*(Xtreme\_?)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [// Voice Xtreme Phones

        /android.+[;\/]\s*(LVTEL\-?)?(V1[12])\s+build/i // LvTel Phones
        ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [/android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i // Envizen Tablets
        ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [/android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(.*\b)\s+build/i // Le Pan Tablets
        ], [VENDOR, MODEL, [TYPE, TABLET]], [/android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i // MachSpeed Tablets
        ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [/android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i // Trinity Tablets
        ], [VENDOR, MODEL, [TYPE, TABLET]], [/android.+[;\/]\s*TU_(1491)\s+build/i // Rotor Tablets
        ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [/android.+(KS(.+))\s+build/i // Amazon Kindle Tablets
        ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [/android.+(Gigaset)[\s\-]+(Q.+)\s+build/i // Gigaset Tablets
        ], [VENDOR, MODEL, [TYPE, TABLET]], [/\s(tablet|tab)[;\/]/i, // Unidentifiable Tablet
        /\s(mobile)(?:[;\/]|\ssafari)/i // Unidentifiable Mobile
        ], [[TYPE, util.lowerize], VENDOR, MODEL], [/(android.+)[;\/].+build/i // Generic Android Device
        ], [MODEL, [VENDOR, 'Generic']]

        /*//////////////////////////
            // TODO: move to string map
            ////////////////////////////
             /(C6603)/i                                                          // Sony Xperia Z C6603
            ], [[MODEL, 'Xperia Z C6603'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
            /(C6903)/i                                                          // Sony Xperia Z 1
            ], [[MODEL, 'Xperia Z 1'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
             /(SM-G900[F|H])/i                                                   // Samsung Galaxy S5
            ], [[MODEL, 'Galaxy S5'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G7102)/i                                                       // Samsung Galaxy Grand 2
            ], [[MODEL, 'Galaxy Grand 2'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G530H)/i                                                       // Samsung Galaxy Grand Prime
            ], [[MODEL, 'Galaxy Grand Prime'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G313HZ)/i                                                      // Samsung Galaxy V
            ], [[MODEL, 'Galaxy V'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-T805)/i                                                        // Samsung Galaxy Tab S 10.5
            ], [[MODEL, 'Galaxy Tab S 10.5'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
            /(SM-G800F)/i                                                       // Samsung Galaxy S5 Mini
            ], [[MODEL, 'Galaxy S5 Mini'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-T311)/i                                                        // Samsung Galaxy Tab 3 8.0
            ], [[MODEL, 'Galaxy Tab 3 8.0'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
             /(T3C)/i                                                            // Advan Vandroid T3C
            ], [MODEL, [VENDOR, 'Advan'], [TYPE, TABLET]], [
            /(ADVAN T1J\+)/i                                                    // Advan Vandroid T1J+
            ], [[MODEL, 'Vandroid T1J+'], [VENDOR, 'Advan'], [TYPE, TABLET]], [
            /(ADVAN S4A)/i                                                      // Advan Vandroid S4A
            ], [[MODEL, 'Vandroid S4A'], [VENDOR, 'Advan'], [TYPE, MOBILE]], [
             /(V972M)/i                                                          // ZTE V972M
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [
             /(i-mobile)\s(IQ\s[\d\.]+)/i                                        // i-mobile IQ
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(IQ6.3)/i                                                          // i-mobile IQ IQ 6.3
            ], [[MODEL, 'IQ 6.3'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
            /(i-mobile)\s(i-style\s[\d\.]+)/i                                   // i-mobile i-STYLE
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(i-STYLE2.1)/i                                                     // i-mobile i-STYLE 2.1
            ], [[MODEL, 'i-STYLE 2.1'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
             /(mobiistar touch LAI 512)/i                                        // mobiistar touch LAI 512
            ], [[MODEL, 'Touch LAI 512'], [VENDOR, 'mobiistar'], [TYPE, MOBILE]], [
             /////////////
            // END TODO
            ///////////*/

        ],

        engine: [[/windows.+\sedge\/([\w\.]+)/i // EdgeHTML
        ], [VERSION, [NAME, 'EdgeHTML']], [/(presto)\/([\w\.]+)/i, // Presto
        /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
        /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, // KHTML/Tasman/Links
        /(icab)[\/\s]([23]\.[\d\.]+)/i // iCab
        ], [NAME, VERSION], [/rv\:([\w\.]+).*(gecko)/i // Gecko
        ], [VERSION, NAME]],

        os: [[

        // Windows based
        /microsoft\s(windows)\s(vista|xp)/i // Windows (iTunes)
        ], [NAME, VERSION], [/(windows)\snt\s6\.2;\s(arm)/i, // Windows RT
        /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s]+\w)*/i, // Windows Phone
        /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

        // Mobile/Embedded OS
        /\((bb)(10);/i // BlackBerry 10
        ], [[NAME, 'BlackBerry'], VERSION], [/(blackberry)\w*\/?([\w\.]+)*/i, // Blackberry
        /(tizen)[\/\s]([\w\.]+)/i, // Tizen
        /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
        // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
        /linux;.+(sailfish);/i // Sailfish OS
        ], [NAME, VERSION], [/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i // Symbian
        ], [[NAME, 'Symbian'], VERSION], [/\((series40);/i // Series 40
        ], [NAME], [/mozilla.+\(mobile;.+gecko.+firefox/i // Firefox OS
        ], [[NAME, 'Firefox OS'], VERSION], [

        // Console
        /(nintendo|playstation)\s([wids34portablevu]+)/i, // Nintendo/Playstation

        // GNU/Linux based
        /(mint)[\/\s\(]?(\w+)*/i, // Mint
        /(mageia|vectorlinux)[;\s]/i, // Mageia/VectorLinux
        /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]+)*/i,
        // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
        // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
        /(hurd|linux)\s?([\w\.]+)*/i, // Hurd/Linux
        /(gnu)\s?([\w\.]+)*/i // GNU
        ], [NAME, VERSION], [/(cros)\s[\w]+\s([\w\.]+\w)/i // Chromium OS
        ], [[NAME, 'Chromium OS'], VERSION], [

        // Solaris
        /(sunos)\s?([\w\.]+\d)*/i // Solaris
        ], [[NAME, 'Solaris'], VERSION], [

        // BSD based
        /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
        ], [NAME, VERSION], [/(haiku)\s(\w+)/i // Haiku
        ], [NAME, VERSION], [/cfnetwork\/.+darwin/i, /ip[honead]+(?:.*os\s([\w]+)\slike\smac|;\sopera)/i // iOS
        ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [/(mac\sos\sx)\s?([\w\s\.]+\w)*/i, /(macintosh|mac(?=_powerpc)\s)/i // Mac OS
        ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

        // Other
        /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i, // Solaris
        /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i, // AIX
        /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
        // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
        /(unix)\s?([\w\.]+)*/i // UNIX
        ], [NAME, VERSION]]
    };

    /////////////////
    // Constructor
    ////////////////
    /*
    var Browser = function (name, version) {
        this[NAME] = name;
        this[VERSION] = version;
    };
    var CPU = function (arch) {
        this[ARCHITECTURE] = arch;
    };
    var Device = function (vendor, model, type) {
        this[VENDOR] = vendor;
        this[MODEL] = model;
        this[TYPE] = type;
    };
    var Engine = Browser;
    var OS = Browser;
    */
    var UAParser = function UAParser(uastring, extensions) {

        if ((typeof uastring === 'undefined' ? 'undefined' : _typeof(uastring)) === 'object') {
            extensions = uastring;
            uastring = undefined;
        }

        if (!(this instanceof UAParser)) {
            return new UAParser(uastring, extensions).getResult();
        }

        var ua = uastring || (window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : EMPTY);
        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;
        //var browser = new Browser();
        //var cpu = new CPU();
        //var device = new Device();
        //var engine = new Engine();
        //var os = new OS();

        this.getBrowser = function () {
            var browser = { name: undefined, version: undefined };
            mapper.rgx.call(browser, ua, rgxmap.browser);
            browser.major = util.major(browser.version); // deprecated
            return browser;
        };
        this.getCPU = function () {
            var cpu = { architecture: undefined };
            mapper.rgx.call(cpu, ua, rgxmap.cpu);
            return cpu;
        };
        this.getDevice = function () {
            var device = { vendor: undefined, model: undefined, type: undefined };
            mapper.rgx.call(device, ua, rgxmap.device);
            return device;
        };
        this.getEngine = function () {
            var engine = { name: undefined, version: undefined };
            mapper.rgx.call(engine, ua, rgxmap.engine);
            return engine;
        };
        this.getOS = function () {
            var os = { name: undefined, version: undefined };
            mapper.rgx.call(os, ua, rgxmap.os);
            return os;
        };
        this.getResult = function () {
            return {
                ua: this.getUA(),
                browser: this.getBrowser(),
                engine: this.getEngine(),
                os: this.getOS(),
                device: this.getDevice(),
                cpu: this.getCPU()
            };
        };
        this.getUA = function () {
            return ua;
        };
        this.setUA = function (uastring) {
            ua = uastring;
            //browser = new Browser();
            //cpu = new CPU();
            //device = new Device();
            //engine = new Engine();
            //os = new OS();
            return this;
        };
        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = {
        NAME: NAME,
        MAJOR: MAJOR, // deprecated
        VERSION: VERSION
    };
    UAParser.CPU = {
        ARCHITECTURE: ARCHITECTURE
    };
    UAParser.DEVICE = {
        MODEL: MODEL,
        VENDOR: VENDOR,
        TYPE: TYPE,
        CONSOLE: CONSOLE,
        MOBILE: MOBILE,
        SMARTTV: SMARTTV,
        TABLET: TABLET,
        WEARABLE: WEARABLE,
        EMBEDDED: EMBEDDED
    };
    UAParser.ENGINE = {
        NAME: NAME,
        VERSION: VERSION
    };
    UAParser.OS = {
        NAME: NAME,
        VERSION: VERSION
    };
    //UAParser.Utils = util;

    ///////////
    // Export
    //////////


    // check js environment
    if (( false ? 'undefined' : _typeof(exports)) !== UNDEF_TYPE) {
        // nodejs env
        if (( false ? 'undefined' : _typeof(module)) !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        // TODO: test!!!!!!!!
        /*
        if (require && require.main === module && process) {
            // cli
            var jsonize = function (arr) {
                var res = [];
                for (var i in arr) {
                    res.push(new UAParser(arr[i]).getResult());
                }
                process.stdout.write(JSON.stringify(res, null, 2) + '\n');
            };
            if (process.stdin.isTTY) {
                // via args
                jsonize(process.argv.slice(2));
            } else {
                // via pipe
                var str = '';
                process.stdin.on('readable', function() {
                    var read = process.stdin.read();
                    if (read !== null) {
                        str += read;
                    }
                });
                process.stdin.on('end', function () {
                    jsonize(str.replace(/\n$/, '').split('\n'));
                });
            }
        }
        */
        exports.UAParser = UAParser;
    } else {
        // requirejs env (optional)
        if (( false ? 'undefined' : _typeof(__webpack_require__(4))) === FUNC_TYPE && __webpack_require__(5)) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
                return UAParser;
            }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        } else if (window) {
            // browser env
            window.UAParser = UAParser;
        }
    }

    // jQuery/Zepto specific (optional)
    // Note:
    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
    //   and we should catch that.
    var $ = window && (window.jQuery || window.Zepto);
    if ((typeof $ === 'undefined' ? 'undefined' : _typeof($)) !== UNDEF_TYPE) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () {
            return parser.getUA();
        };
        $.ua.set = function (uastring) {
            parser.setUA(uastring);
            var result = parser.getResult();
            for (var prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }
})((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' ? window : undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function () {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function get() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function get() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = function() {
	throw new Error("define cannot be used indirect");
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = {"br":{"outOfDate":"O seu navegador est&aacute; desatualizado!","update":{"web":"Atualize o seu navegador para ter uma melhor experi&ecirc;ncia e visualiza&ccedil;&atilde;o deste site. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/br","callToAction":"Atualize o seu navegador agora","close":"Fechar"},"cn":{"outOfDate":"您的浏览器已过时","update":{"web":"要正常浏览本网站请升级您的浏览器。","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/cn","callToAction":"现在升级","close":"关闭"},"cz":{"outOfDate":"Váš prohlížeč je zastaralý!","update":{"web":"Pro správné zobrazení těchto stránek aktualizujte svůj prohlížeč. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/cz","callToAction":"Aktualizovat nyní svůj prohlížeč","close":"Zavřít"},"da":{"outOfDate":"Din browser er forældet!","update":{"web":"Opdatér din browser for at få vist denne hjemmeside korrekt. ","googlePlay":"Installér venligst Chrome fra Google Play","appStore":"Opdatér venligst iOS"},"url":"http://outdatedbrowser.com/da","callToAction":"Opdatér din browser nu","close":"Luk"},"de":{"outOfDate":"Ihr Browser ist veraltet!","update":{"web":"Bitte aktualisieren Sie Ihren Browser, um diese Website korrekt darzustellen. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/de","callToAction":"Den Browser jetzt aktualisieren ","close":"Schließen"},"ee":{"outOfDate":"Sinu veebilehitseja on vananenud!","update":{"web":"Palun uuenda oma veebilehitsejat, et näha lehekülge korrektselt. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/ee","callToAction":"Uuenda oma veebilehitsejat kohe","close":"Sulge"},"en":{"outOfDate":"Your browser is out-of-date!","update":{"web":"Update your browser to view this website correctly. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/","callToAction":"Update my browser now","close":"Close"},"es":{"outOfDate":"¡Tu navegador está anticuado!","update":{"web":"Actualiza tu navegador para ver esta página correctamente. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/es","callToAction":"Actualizar mi navegador ahora","close":"Cerrar"},"fa":{"rightToLeft":true,"outOfDate":"مرورگر شما منسوخ شده است!","update":{"web":"جهت مشاهده صحیح این وبسایت، مرورگرتان را بروز رسانی نمایید. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/","callToAction":"همین حالا مرورگرم را بروز کن","close":"Close"},"fi":{"outOfDate":"Selaimesi on vanhentunut!","update":{"web":"Lataa ajantasainen selain n&auml;hd&auml;ksesi t&auml;m&auml;n sivun oikein. ","googlePlay":"Asenna uusin Chrome Google Play -kaupasta","appStore":"Päivitä iOS puhelimesi asetuksista"},"url":"http://outdatedbrowser.com/fi","callToAction":"P&auml;ivit&auml; selaimeni nyt ","close":"Sulje"},"fr":{"outOfDate":"Votre navigateur n'est plus compatible !","update":{"web":"Mettez à jour votre navigateur pour afficher correctement ce site Web. ","googlePlay":"Merci d'installer Chrome depuis le Google Play Store","appStore":"Merci de mettre à jour iOS depuis l'application Réglages"},"url":"http://outdatedbrowser.com/fr","callToAction":"Mettre à jour maintenant ","close":"Fermer"},"hu":{"outOfDate":"A böngészője elavult!","update":{"web":"Firssítse vagy cserélje le a böngészőjét. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/hu","callToAction":"A böngészőm frissítése ","close":"Close"},"id":{"outOfDate":"Browser yang Anda gunakan sudah ketinggalan zaman!","update":{"web":"Perbaharuilah browser Anda agar bisa menjelajahi website ini dengan nyaman. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/","callToAction":"Perbaharui browser sekarang ","close":"Close"},"it":{"outOfDate":"Il tuo browser non &egrave; aggiornato!","update":{"web":"Aggiornalo per vedere questo sito correttamente. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/it","callToAction":"Aggiorna ora","close":"Chiudi"},"lt":{"outOfDate":"Jūsų naršyklės versija yra pasenusi!","update":{"web":"Atnaujinkite savo naršyklę, kad galėtumėte peržiūrėti šią svetainę tinkamai. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/","callToAction":"Atnaujinti naršyklę ","close":"Close"},"nl":{"outOfDate":"Je gebruikt een oude browser!","update":{"web":"Update je browser om deze website correct te bekijken. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/nl","callToAction":"Update mijn browser nu ","close":"Sluiten"},"pl":{"outOfDate":"Twoja przeglądarka jest przestarzała!","update":{"web":"Zaktualizuj swoją przeglądarkę, aby poprawnie wyświetlić tę stronę. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/pl","callToAction":"Zaktualizuj przeglądarkę już teraz","close":"Close"},"pt":{"outOfDate":"O seu browser est&aacute; desatualizado!","update":{"web":"Atualize o seu browser para ter uma melhor experi&ecirc;ncia e visualiza&ccedil;&atilde;o deste site. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/pt","callToAction":"Atualize o seu browser agora","close":"Fechar"},"ro":{"outOfDate":"Browserul este învechit!","update":{"web":"Actualizați browserul pentru a vizualiza corect acest site. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/","callToAction":"Actualizați browserul acum!","close":"Close"},"ru":{"outOfDate":"Ваш браузер устарел!","update":{"web":"Обновите ваш браузер для правильного отображения этого сайта. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/ru","callToAction":"Обновить мой браузер ","close":"Закрыть"},"si":{"outOfDate":"Vaš brskalnik je zastarel!","update":{"web":"Za pravilen prikaz spletne strani posodobite vaš brskalnik. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/si","callToAction":"Posodobi brskalnik ","close":"Zapri"},"sv":{"outOfDate":"Din webbläsare stödjs ej längre!","update":{"web":"Uppdatera din webbläsare för att webbplatsen ska visas korrekt. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/","callToAction":"Uppdatera min webbläsare nu","close":"Stäng"},"ua":{"outOfDate":"Ваш браузер застарів!","update":{"web":"Оновіть ваш браузер для правильного відображення цього сайта. ","googlePlay":"Please install Chrome from Google Play","appStore":"Please update iOS from the Settings App"},"url":"http://outdatedbrowser.com/ua","callToAction":"Оновити мій браузер ","close":"Закрити"}}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(8);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(10)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {
	module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./outdated-browser-rework.scss", function() {
		var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./outdated-browser-rework.scss");

		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)(false);
// imports


// module
exports.push([module.i, "#outdated {\n  position: absolute;\n  background-color: #f25648;\n  color: white;\n  display: none;\n  overflow: hidden;\n  left: 0;\n  position: fixed;\n  text-align: center;\n  text-transform: uppercase;\n  top: 0;\n  width: 100%;\n  z-index: 1500;\n  padding: 24px; }\n  #outdated h6 {\n    font-size: 25px;\n    line-height: 25px;\n    margin: 12px 0; }\n  #outdated p {\n    font-size: 12px;\n    line-height: 12px;\n    margin: 0; }\n  #outdated #buttonUpdateBrowser {\n    border: 2px solid white;\n    color: white;\n    cursor: pointer;\n    display: block;\n    margin: 30px auto 0;\n    padding: 10px 20px;\n    position: relative;\n    text-decoration: none;\n    width: 230px; }\n    #outdated #buttonUpdateBrowser:hover {\n      background-color: white;\n      color: #f25648; }\n  #outdated .last {\n    height: 20px;\n    position: absolute;\n    right: 25px;\n    top: 10px;\n    width: 0px; }\n  #outdated .last[dir=rtl] {\n    left: 25px !important;\n    right: auto !important; }\n  #outdated #buttonCloseUpdateBrowser {\n    color: white;\n    display: block;\n    font-size: 36px;\n    height: 100%;\n    line-height: 36px;\n    position: relative;\n    text-decoration: none;\n    width: 100%; }\n", ""]);

// exports


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function (useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if (item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(11);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
	// get current location
	var location = typeof window !== "undefined" && window.location;

	if (!location) {
		throw new Error("fixUrls requires window.location");
	}

	// blank or null?
	if (!css || typeof css !== "string") {
		return css;
	}

	var baseUrl = location.protocol + "//" + location.host;
	var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
 This regular expression is just a way to recursively match brackets within
 a string.
 	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
    (  = Start a capturing group
      (?:  = Start a non-capturing group
          [^)(]  = Match anything that isn't a parentheses
          |  = OR
          \(  = Match a start parentheses
              (?:  = Start another non-capturing groups
                  [^)(]+  = Match anything that isn't a parentheses
                  |  = OR
                  \(  = Match a start parentheses
                      [^)(]*  = Match anything that isn't a parentheses
                  \)  = Match a end parentheses
              )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
  \)  = Match a close parens
 	 /gi  = Get all matches, not the first.  Be case insensitive.
  */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function (fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl.trim().replace(/^"(.*)"$/, function (o, $1) {
			return $1;
		}).replace(/^'(.*)'$/, function (o, $1) {
			return $1;
		});

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
			return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
			//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};

/***/ })
/******/ ]);
});