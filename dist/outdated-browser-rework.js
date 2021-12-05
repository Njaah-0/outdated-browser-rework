(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.outdatedBrowserRework = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var DEFAULTS = {
	Chrome: 57, // Includes Chrome for mobile devices
	Edge: 39,
	Safari: 10,
	"Mobile Safari": 10,
	Opera: 50,
	Firefox: 50,
	Vivaldi: 1,
	IE: false
}

var EDGEHTML_VS_EDGE_VERSIONS = {
	12: 0.1,
	13: 21,
	14: 31,
	15: 39,
	16: 41,
	17: 42,
	18: 44
}

var updateDefaults = function (defaults, updatedValues) {
	for (var key in updatedValues) {
		defaults[key] = updatedValues[key]
	}

	return defaults
}

module.exports = function (parsedUserAgent, options) {
	// Set default options
	var browserSupport = options.browserSupport ? updateDefaults(DEFAULTS, options.browserSupport) : DEFAULTS
	var requiredCssProperty = options.requiredCssProperty || false

	var browserName = parsedUserAgent.browser.name;

	var isAndroidButNotChrome
	if (options.requireChromeOnAndroid) {
		isAndroidButNotChrome = parsedUserAgent.os.name === "Android" && parsedUserAgent.browser.name !== "Chrome"
	}	
	
	var parseMinorVersion = function (version) {
		return version.replace(/[^\d.]/g, '').split(".")[1];
	}

	var isBrowserUnsupported = function () {
		var isUnsupported = false
		if (!(browserName in browserSupport)) {
			if (!options.isUnknownBrowserOK) {
				isUnsupported = true
			}
		} else if (!browserSupport[browserName]) {
			isUnsupported = true
		}
		return isUnsupported;
	}

	var isBrowserUnsupportedResult = isBrowserUnsupported();

	var isBrowserOutOfDate = function () {
		var browserVersion = parsedUserAgent.browser.version;
		var browserMajorVersion = parsedUserAgent.browser.major;
		var osName = parsedUserAgent.os.name;
		var osVersion = parsedUserAgent.os.version;

		// Edge legacy needed a version mapping, Edge on Chromium doesn't
		if (browserName === "Edge" && browserMajorVersion <= 18) {
			browserMajorVersion = EDGEHTML_VS_EDGE_VERSIONS[browserMajorVersion];
		}

		// Firefox Mobile on iOS is essentially Mobile Safari so needs to be handled that way
		// See: https://github.com/mikemaccana/outdated-browser-rework/issues/98#issuecomment-597721173
		if (browserName === 'Firefox' && osName === 'iOS') {
			browserName = 'Mobile Safari';
			browserVersion = osVersion;
			browserMajorVersion = osVersion.substring(0, osVersion.indexOf('.'));
		}

		var isOutOfDate = false
		if (isBrowserUnsupportedResult) {
			isOutOfDate = true;
		} else if (browserName in browserSupport) {
			var minVersion = browserSupport[browserName]
			if (typeof minVersion == 'object') {
				var minMajorVersion = minVersion.major
				var minMinorVersion = minVersion.minor

				if (browserMajorVersion < minMajorVersion) {
					isOutOfDate = true
				} else if (browserMajorVersion == minMajorVersion) {
					var browserMinorVersion = parseMinorVersion(browserVersion)

					if (browserMinorVersion < minMinorVersion) {
						isOutOfDate = true
					}
				}
			} else if (browserMajorVersion < minVersion) {
				isOutOfDate = true
			}
		}
		return isOutOfDate
	}

	// Returns true if a browser supports a css3 property
	var isPropertySupported = function (property) {
		if (!property) {
			return true
		}
		var div = document.createElement("div")
		var vendorPrefixes = ["khtml", "ms", "o", "moz", "webkit"]
		var count = vendorPrefixes.length

		// Note: HTMLElement.style.hasOwnProperty seems broken in Edge
		if (property in div.style) {
			return true
		}

		property = property.replace(/^[a-z]/, function (val) {
			return val.toUpperCase()
		})

		while (count--) {
			var prefixedProperty = vendorPrefixes[count] + property
			// See comment re: HTMLElement.style.hasOwnProperty above
			if (prefixedProperty in div.style) {
				return true
			}
		}
		return false
	}

	// Return results
	return {
		isAndroidButNotChrome: isAndroidButNotChrome,
		isBrowserOutOfDate: isBrowserOutOfDate(),
		isBrowserUnsupported: isBrowserUnsupportedResult,
		isPropertySupported: isPropertySupported(requiredCssProperty)
	};
}

},{}],2:[function(require,module,exports){
/* Highly dumbed down version of https://github.com/unclechu/node-deep-extend */

/**
 * Extening object that entered in first argument.
 *
 * Returns extended object or false if have no target object or incorrect type.
 *
 * If you wish to clone source object (without modify it), just use empty new
 * object as first argument, like this:
 *   deepExtend({}, yourObj_1, [yourObj_N]);
 */
module.exports = function deepExtend(/*obj_1, [obj_2], [obj_N]*/) {
	if (arguments.length < 1 || typeof arguments[0] !== "object") {
		return false
	}

	if (arguments.length < 2) {
		return arguments[0]
	}

	var target = arguments[0]

	for (var i = 1; i < arguments.length; i++) {
		var obj = arguments[i]

		for (var key in obj) {
			var src = target[key]
			var val = obj[key]

			if (typeof val !== "object" || val === null) {
				target[key] = val

				// just clone arrays (and recursive clone objects inside)
			} else if (typeof src !== "object" || src === null) {
				target[key] = deepExtend({}, val)

				// source value and new value is objects both, extending...
			} else {
				target[key] = deepExtend(src, val)
			}
		}
	}

	return target
}

},{}],3:[function(require,module,exports){
var evaluateBrowser = require("./evaluateBrowser")
var languageMessages = require("./languages.json")
var deepExtend = require("./extend")
var UserAgentParser = require("ua-parser-js")

var COLORS = {
	salmon: "#f25648",
	white: "white"
}

module.exports = function(userProvidedOptions, onload = true) {
	var main = function(options) {
		// Despite the docs, UA needs to be provided to constructor explicitly:
		// https://github.com/faisalman/ua-parser-js/issues/90
		var parsedUserAgent = new UserAgentParser(navigator.userAgent).getResult()

		// Variable definition (before ajax)
		var outdatedUI = document.getElementById("outdated")

		if (!outdatedUI) {
			console.warn(
			  'DOM element with id "outdated" is missing! Such element is required for outdated-browser to work. ' +
			  'Having such element only on certain pages is a valid way to define where to display alert, so if this is' +
			  'intentional, ignore this warning'
			);
			return;
		}	  

		// Set default options
		options = options || {}

		var browserLocale = window.navigator.language || window.navigator.userLanguage // Everyone else, IE
		// CSS property to check for. You may also like 'borderSpacing', 'boxShadow', 'transform', 'borderImage';
		var backgroundColor = options.backgroundColor || COLORS.salmon
		var textColor = options.textColor || COLORS.white
		var fullscreen = options.fullscreen || false
		var language = options.language || browserLocale.slice(0, 2) // Language code

		var languages = options.languageJson || {};
    	var customCSSClasses = options.customCSSClasses || null;

		var updateSource = "web" // Other possible values are 'googlePlay' or 'appStore'. Determines where we tell users to go for upgrades.

		// Chrome mobile is still Chrome (unlike Safari which is 'Mobile Safari')
		var isAndroid = parsedUserAgent.os.name === "Android"
		if (isAndroid) {
			updateSource = "googlePlay"
		} else if  (parsedUserAgent.os.name === "iOS") {
			updateSource = "appStore"
		}

		var isBrowserUnsupported = false // set later after browser evaluation

		var done = true

		var changeOpacity = function (opacityValue) {
			outdatedUI.style.opacity = opacityValue / 100
			outdatedUI.style.filter = "alpha(opacity=" + opacityValue + ")"
		}
	
		var fadeIn = function (opacityValue) {
			changeOpacity(opacityValue)
			if (opacityValue === 1) {
				outdatedUI.style.display = "table"
			}
			if (opacityValue === 100) {
				done = true
			}
		}
	
		var makeFadeInFunction = function (opacityValue) {
			return function () {
				fadeIn(opacityValue)
			}
		}
	
		// Style element explicitly - TODO: investigate and delete if not needed
		var startStylesAndEvents = function () {
			var buttonClose = document.getElementById("buttonCloseUpdateBrowser")
			var buttonUpdate = document.getElementById("buttonUpdateBrowser")
	
			//check settings attributes
			outdatedUI.style.backgroundColor = backgroundColor
			//way too hard to put !important on IE6
			outdatedUI.style.color = textColor
			outdatedUI.children[0].children[0].style.color = textColor
			outdatedUI.children[0].children[1].style.color = textColor
	
			// Update button is desktop only
			if (buttonUpdate) {
				buttonUpdate.style.color = textColor
				if (buttonUpdate.style.borderColor) {
					buttonUpdate.style.borderColor = textColor
				}
	
				// Override the update button color to match the background color
				buttonUpdate.onmouseover = function () {
					this.style.color = backgroundColor
					this.style.backgroundColor = textColor
				}
	
				buttonUpdate.onmouseout = function () {
					this.style.color = textColor
					this.style.backgroundColor = backgroundColor
				}
			}
	
			buttonClose.style.color = textColor
	
			buttonClose.onmousedown = function () {
				outdatedUI.style.display = "none"
				return false
			}
		}
	
		var getMessage = function (lang, userProvidedLanguageJson, customCSSClasses) {
			var defaultMessages = userProvidedLanguageJson[lang] || languageMessages[lang] || languageMessages.en;
			var customMessages = options.messages && options.messages[lang];
			var messages = deepExtend({}, defaultMessages, customMessages);

			var titleClass = '';
      		var contentClass = '';
      		var actionButtonClass = '';
      		var closeButtonClass = '';

			if (customCSSClasses) {
				if (customCSSClasses.titleClass) {
					titleClass = customCSSClasses.titleClass;
				}
				if (customCSSClasses.contentClass) {
					contentClass = customCSSClasses.contentClass;
				}
				if (customCSSClasses.actionButtonClass) {
					actionButtonClass = customCSSClasses.actionButtonClass;
				}
				if (customCSSClasses.closeButtonClass) {
					closeButtonClass = customCSSClasses.closeButtonClass;
				}
			}
	
			var updateMessages = {
				web:
					"<p> class=\"" + contentClass + "\">" +
					messages.update.web +
					(messages.url ? (
						'<a id="buttonUpdateBrowser" rel="nofollow" href="' +
						messages.url +
						'" class="' + actionButtonClass + '" >' +
						messages.callToAction +
						"</a>"
					) : '') +
					"</p>",
				googlePlay:
					"<p class=\"" + contentClass + "\">" +
					messages.update.googlePlay +
					'<a id="buttonUpdateBrowser" rel="nofollow" href="https://play.google.com/store/apps/details?id=com.android.chrome" class="' + actionButtonClass + '" >' +
					messages.callToAction +
					"</a></p>",
				appStore: "<p class=\"" + contentClass + "\">" + messages.update[updateSource] + "</p>"
			}
	
			var updateMessage = updateMessages[updateSource]
	
			var browserSupportMessage = messages.outOfDate;
			if (isBrowserUnsupported && messages.unsupported) {
				browserSupportMessage = messages.unsupported;
			}
	
			return (
				'<div class="vertical-center"><h6 class="' + titleClass + '" >' +
				browserSupportMessage +
				"</h6>" +
				updateMessage +
				'<p class="last ' + closeButtonClass + '"><a href="#" id="buttonCloseUpdateBrowser" title="' +
				messages.close +
				'">&times;</a></p></div>'
			)
		}

		var result = evaluateBrowser(parsedUserAgent, options);
		if (result.isAndroidButNotChrome || result.isBrowserOutOfDate || !result.isPropertySupported) {
			// This is an outdated browser and the banner needs to show

			// Set this flag with the result for `getMessage`
			isBrowserUnsupported = result.isBrowserUnsupported

			if (done && outdatedUI.style.opacity !== "1") {
				done = false
	
				for (var opacity = 1; opacity <= 100; opacity++) {
					setTimeout(makeFadeInFunction(opacity), opacity * 8)
				}
			}
	
			var insertContentHere = document.getElementById("outdated")
			if (fullscreen) {
				insertContentHere.classList.add("fullscreen")
			}
			if (customCSSClasses.wrapperClass) {
				insertContentHere.classList.add(customCSSClasses.wrapperClass);
			}
			insertContentHere.innerHTML = getMessage(language, languages, customCSSClasses);
			startStylesAndEvents()
		}
	}

	// Load main when DOM ready.
	var oldOnload = window.onload
	if (typeof window.onload !== "function") {
		window.onload = main
	} else {
		window.onload = function() {
			if (oldOnload) {
				oldOnload()
			}
			main()
		}
	}

	// Load main when DOM ready.
	if (onload) {
		var oldOnload = window.onload;
		if (typeof window.onload !== 'function') {
		  window.onload = function () { main(userProvidedOptions) };
		}
		else {
		  window.onload = function () {
			if (oldOnload) {
			  oldOnload();
			}
			main(userProvidedOptions,onload);
		  };
		}
	} else {
		main(userProvidedOptions, onload);
	}
}

},{"./evaluateBrowser":1,"./extend":2,"./languages.json":4,"ua-parser-js":5}],4:[function(require,module,exports){
module.exports={
	"ko": {
    "outOfDate": "최신 브라우저가 아닙니다!",
    "update": {
      "web": "웹사이트를 제대로 보려면 브라우저를 업데이트하세요.",
      "googlePlay": "Google Play에서 Chrome을 설치하세요",
      "appStore": "설정 앱에서 iOS를 업데이트하세요"
    },
    "url": "https://browser-update.org/update-browser.html",
    "callToAction": "지금 브라우저 업데이트하기",
    "close": "닫기"
  },
  "ja": {
    "outOfDate": "古いブラウザをお使いのようです。",
    "update": {
      "web": "ウェブサイトを正しく表示できるように、ブラウザをアップデートしてください。",
      "googlePlay": "Google PlayからChromeをインストールしてください",
      "appStore": "設定からiOSをアップデートしてください"
    },
    "url": "https://browser-update.org/update-browser.html",
    "callToAction": "今すぐブラウザをアップデートする",
    "close": "閉じる"
  }, 
	"br": {
		"outOfDate": "O seu navegador est&aacute; desatualizado!",
		"update": {
			"web": "Atualize o seu navegador para ter uma melhor experi&ecirc;ncia e visualiza&ccedil;&atilde;o deste site. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Atualize o seu navegador agora",
		"close": "Fechar"
	},
	"ca": {
		"outOfDate": "El vostre navegador no està actualitzat!",
		"update": {
			"web": "Actualitzeu el vostre navegador per veure correctament aquest lloc web. ",
			"googlePlay": "Instal·leu Chrome des de Google Play",
			"appStore": "Actualitzeu iOS des de l'aplicació Configuració"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Actualitzar el meu navegador ara",
		"close": "Tancar"
	},
	"zh": {
		"outOfDate": "您的浏览器已过时",
		"update": {
			"web": "要正常浏览本网站请升级您的浏览器。",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "现在升级",
		"close": "关闭"
	},
	"cz": {
		"outOfDate": "Váš prohlížeč je zastaralý!",
		"update": {
			"web": "Pro správné zobrazení těchto stránek aktualizujte svůj prohlížeč. ",
			"googlePlay": "Nainstalujte si Chrome z Google Play",
			"appStore": "Aktualizujte si systém iOS"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Aktualizovat nyní svůj prohlížeč",
		"close": "Zavřít"
	},
	"da": {
		"outOfDate": "Din browser er forældet!",
		"update": {
			"web": "Opdatér din browser for at få vist denne hjemmeside korrekt. ",
			"googlePlay": "Installér venligst Chrome fra Google Play",
			"appStore": "Opdatér venligst iOS"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Opdatér din browser nu",
		"close": "Luk"
	},
	"de": {
		"outOfDate": "Ihr Browser ist veraltet!",
		"update": {
			"web": "Bitte aktualisieren Sie Ihren Browser, um diese Website korrekt darzustellen. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Den Browser jetzt aktualisieren ",
		"close": "Schließen"
	},
	"ee": {
		"outOfDate": "Sinu veebilehitseja on vananenud!",
		"update": {
			"web": "Palun uuenda oma veebilehitsejat, et näha lehekülge korrektselt. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Uuenda oma veebilehitsejat kohe",
		"close": "Sulge"
	},
	"en": {
		"outOfDate": "Your browser is out-of-date!",
		"update": {
			"web": "Update your browser to view this website correctly. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Update my browser now",
		"close": "Close"
	},
	"es": {
		"outOfDate": "¡Tu navegador está anticuado!",
		"update": {
			"web": "Actualiza tu navegador para ver esta página correctamente. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Actualizar mi navegador ahora",
		"close": "Cerrar"
	},
	"fa": {
		"rightToLeft": true,
		"outOfDate": "مرورگر شما منسوخ شده است!",
		"update": {
			"web": "جهت مشاهده صحیح این وبسایت، مرورگرتان را بروز رسانی نمایید. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "همین حالا مرورگرم را بروز کن",
		"close": "Close"
	},
	"fi": {
		"outOfDate": "Selaimesi on vanhentunut!",
		"update": {
			"web": "Lataa ajantasainen selain n&auml;hd&auml;ksesi t&auml;m&auml;n sivun oikein. ",
			"googlePlay": "Asenna uusin Chrome Google Play -kaupasta",
			"appStore": "Päivitä iOS puhelimesi asetuksista"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "P&auml;ivit&auml; selaimeni nyt ",
		"close": "Sulje"
	},
	"fr": {
		"outOfDate": "Votre navigateur n'est plus compatible !",
		"update": {
			"web": "Mettez à jour votre navigateur pour afficher correctement ce site Web. ",
			"googlePlay": "Merci d'installer Chrome depuis le Google Play Store",
			"appStore": "Merci de mettre à jour iOS depuis l'application Réglages"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Mettre à jour maintenant ",
		"close": "Fermer"
	},
	"hu": {
		"outOfDate": "A böngészője elavult!",
		"update": {
			"web": "Firssítse vagy cserélje le a böngészőjét. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "A böngészőm frissítése ",
		"close": "Close"
	},
	"id": {
		"outOfDate": "Browser yang Anda gunakan sudah ketinggalan zaman!",
		"update": {
			"web": "Perbaharuilah browser Anda agar bisa menjelajahi website ini dengan nyaman. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Perbaharui browser sekarang ",
		"close": "Close"
	},
	"it": {
		"outOfDate": "Il tuo browser non &egrave; aggiornato!",
		"update": {
			"web": "Aggiornalo per vedere questo sito correttamente. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Aggiorna ora",
		"close": "Chiudi"
	},
	"lt": {
		"outOfDate": "Jūsų naršyklės versija yra pasenusi!",
		"update": {
			"web": "Atnaujinkite savo naršyklę, kad galėtumėte peržiūrėti šią svetainę tinkamai. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Atnaujinti naršyklę ",
		"close": "Close"
	},
	"nl": {
		"outOfDate": "Je gebruikt een oude browser!",
		"update": {
			"web": "Update je browser om deze website correct te bekijken. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Update mijn browser nu ",
		"close": "Sluiten"
	},
	"pl": {
		"outOfDate": "Twoja przeglądarka jest przestarzała!",
		"update": {
			"web": "Zaktualizuj swoją przeglądarkę, aby poprawnie wyświetlić tę stronę. ",
			"googlePlay": "Proszę zainstalować przeglądarkę Chrome ze sklepu Google Play",
			"appStore": "Proszę zaktualizować iOS z Ustawień"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Zaktualizuj przeglądarkę już teraz",
		"close": "Zamknij"
	},
	"pt": {
		"outOfDate": "O seu browser est&aacute; desatualizado!",
		"update": {
			"web": "Atualize o seu browser para ter uma melhor experi&ecirc;ncia e visualiza&ccedil;&atilde;o deste site. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Atualize o seu browser agora",
		"close": "Fechar"
	},
	"ro": {
		"outOfDate": "Browserul este învechit!",
		"update": {
			"web": "Actualizați browserul pentru a vizualiza corect acest site. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Actualizați browserul acum!",
		"close": "Close"
	},
	"ru": {
		"outOfDate": "Ваш браузер устарел!",
		"update": {
			"web": "Обновите ваш браузер для правильного отображения этого сайта. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Обновить мой браузер ",
		"close": "Закрыть"
	},
	"si": {
		"outOfDate": "Vaš brskalnik je zastarel!",
		"update": {
			"web": "Za pravilen prikaz spletne strani posodobite vaš brskalnik. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Posodobi brskalnik ",
		"close": "Zapri"
	},
	"sv": {
		"outOfDate": "Din webbläsare stödjs ej längre!",
		"update": {
			"web": "Uppdatera din webbläsare för att webbplatsen ska visas korrekt. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Uppdatera min webbläsare nu",
		"close": "Stäng"
	},
	"ua": {
		"outOfDate": "Ваш браузер застарів!",
		"update": {
			"web": "Оновіть ваш браузер для правильного відображення цього сайта. ",
			"googlePlay": "Please install Chrome from Google Play",
			"appStore": "Please update iOS from the Settings App"
		},
		"url": "https://browser-update.org/update-browser.html",
		"callToAction": "Оновити мій браузер ",
		"close": "Закрити"
	}
}

},{}],5:[function(require,module,exports){
/////////////////////////////////////////////////////////////////////////////////
/* UAParser.js v0.7.31
   Copyright © 2012-2021 Faisal Salman <f@faisalman.com>
   MIT License *//*
   Detect Browser, Engine, OS, CPU, and Device type/model from User-Agent data.
   Supports browser & node.js environment. 
   Demo   : https://faisalman.github.io/ua-parser-js
   Source : https://github.com/faisalman/ua-parser-js */
/////////////////////////////////////////////////////////////////////////////////

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var LIBVERSION  = '0.7.31',
        EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        STR_TYPE    = 'string',
        MAJOR       = 'major',
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet',
        SMARTTV     = 'smarttv',
        WEARABLE    = 'wearable',
        EMBEDDED    = 'embedded',
        UA_MAX_LENGTH = 255;

    var AMAZON  = 'Amazon',
        APPLE   = 'Apple',
        ASUS    = 'ASUS',
        BLACKBERRY = 'BlackBerry',
        BROWSER = 'Browser',
        CHROME  = 'Chrome',
        EDGE    = 'Edge',
        FIREFOX = 'Firefox',
        GOOGLE  = 'Google',
        HUAWEI  = 'Huawei',
        LG      = 'LG',
        MICROSOFT = 'Microsoft',
        MOTOROLA  = 'Motorola',
        OPERA   = 'Opera',
        SAMSUNG = 'Samsung',
        SONY    = 'Sony',
        XIAOMI  = 'Xiaomi',
        ZEBRA   = 'Zebra',
        FACEBOOK   = 'Facebook';

    ///////////
    // Helper
    //////////

    var extend = function (regexes, extensions) {
            var mergedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    mergedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    mergedRegexes[i] = regexes[i];
                }
            }
            return mergedRegexes;
        },
        enumerize = function (arr) {
            var enums = {};
            for (var i=0; i<arr.length; i++) {
                enums[arr[i].toUpperCase()] = arr[i];
            }
            return enums;
        },
        has = function (str1, str2) {
            return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
        },
        lowerize = function (str) {
            return str.toLowerCase();
        },
        majorize = function (version) {
            return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g, EMPTY).split('.')[0] : undefined;
        },
        trim = function (str, len) {
            if (typeof(str) === STR_TYPE) {
                str = str.replace(/^\s\s*/, EMPTY).replace(/\s\s*$/, EMPTY);
                return typeof(len) === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
            }
    };

    ///////////////
    // Map helper
    //////////////

    var rgxMapper = function (ua, arrays) {

            var i = 0, j, k, p, q, matches, match;

            // loop through all regexes maps
            while (i < arrays.length && !matches) {

                var regex = arrays[i],       // even sequence (0,2,4,..)
                    props = arrays[i + 1];   // odd sequence (1,3,5,..)
                j = k = 0;

                // try matching uastring with regexes
                while (j < regex.length && !matches) {

                    matches = regex[j++].exec(ua);

                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof q === OBJ_TYPE && q.length > 0) {
                                if (q.length === 2) {
                                    if (typeof q[1] == FUNC_TYPE) {
                                        // assign modified match
                                        this[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        this[q[0]] = q[1];
                                    }
                                } else if (q.length === 3) {
                                    // check whether function or regex
                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length === 4) {
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
        },

        strMapper = function (str, map) {

            for (var i in map) {
                // check if current value is array
                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
    };

    ///////////////
    // String map
    //////////////

    // Safari < 3.0
    var oldSafariMap = {
            '1.0'   : '/8',
            '1.2'   : '/1',
            '1.3'   : '/3',
            '2.0'   : '/412',
            '2.0.2' : '/416',
            '2.0.3' : '/417',
            '2.0.4' : '/419',
            '?'     : '/'
        },
        windowsVersionMap = {
            'ME'        : '4.90',
            'NT 3.11'   : 'NT3.51',
            'NT 4.0'    : 'NT4.0',
            '2000'      : 'NT 5.0',
            'XP'        : ['NT 5.1', 'NT 5.2'],
            'Vista'     : 'NT 6.0',
            '7'         : 'NT 6.1',
            '8'         : 'NT 6.2',
            '8.1'       : 'NT 6.3',
            '10'        : ['NT 6.4', 'NT 10.0'],
            'RT'        : 'ARM'
    };

    //////////////
    // Regex map
    /////////////

    var regexes = {

        browser : [[

            /\b(?:crmo|crios)\/([\w\.]+)/i                                      // Chrome for Android/iOS
            ], [VERSION, [NAME, 'Chrome']], [
            /edg(?:e|ios|a)?\/([\w\.]+)/i                                       // Microsoft Edge
            ], [VERSION, [NAME, 'Edge']], [

            // Presto based
            /(opera mini)\/([-\w\.]+)/i,                                        // Opera Mini
            /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,                 // Opera Mobi/Tablet
            /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i                           // Opera
            ], [NAME, VERSION], [
            /opios[\/ ]+([\w\.]+)/i                                             // Opera mini on iphone >= 8.0
            ], [VERSION, [NAME, OPERA+' Mini']], [
            /\bopr\/([\w\.]+)/i                                                 // Opera Webkit
            ], [VERSION, [NAME, OPERA]], [

            // Mixed
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,      // Lunascape/Maxthon/Netfront/Jasmine/Blazer
            // Trident based
            /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,               // Avant/IEMobile/SlimBrowser
            /(ba?idubrowser)[\/ ]?([\w\.]+)/i,                                  // Baidu Browser
            /(?:ms|\()(ie) ([\w\.]+)/i,                                         // Internet Explorer

            // Webkit/KHTML based                                               // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
            /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale|qqbrowserlite|qq)\/([-\w\.]+)/i,
                                                                                // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ, aka ShouQ
            /(weibo)__([\d\.]+)/i                                               // Weibo
            ], [NAME, VERSION], [
            /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i                 // UCBrowser
            ], [VERSION, [NAME, 'UC'+BROWSER]], [
            /\bqbcore\/([\w\.]+)/i                                              // WeChat Desktop for Windows Built-in Browser
            ], [VERSION, [NAME, 'WeChat(Win) Desktop']], [
            /micromessenger\/([\w\.]+)/i                                        // WeChat
            ], [VERSION, [NAME, 'WeChat']], [
            /konqueror\/([\w\.]+)/i                                             // Konqueror
            ], [VERSION, [NAME, 'Konqueror']], [
            /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i                       // IE11
            ], [VERSION, [NAME, 'IE']], [
            /yabrowser\/([\w\.]+)/i                                             // Yandex
            ], [VERSION, [NAME, 'Yandex']], [
            /(avast|avg)\/([\w\.]+)/i                                           // Avast/AVG Secure Browser
            ], [[NAME, /(.+)/, '$1 Secure '+BROWSER], VERSION], [
            /\bfocus\/([\w\.]+)/i                                               // Firefox Focus
            ], [VERSION, [NAME, FIREFOX+' Focus']], [
            /\bopt\/([\w\.]+)/i                                                 // Opera Touch
            ], [VERSION, [NAME, OPERA+' Touch']], [
            /coc_coc\w+\/([\w\.]+)/i                                            // Coc Coc Browser
            ], [VERSION, [NAME, 'Coc Coc']], [
            /dolfin\/([\w\.]+)/i                                                // Dolphin
            ], [VERSION, [NAME, 'Dolphin']], [
            /coast\/([\w\.]+)/i                                                 // Opera Coast
            ], [VERSION, [NAME, OPERA+' Coast']], [
            /miuibrowser\/([\w\.]+)/i                                           // MIUI Browser
            ], [VERSION, [NAME, 'MIUI '+BROWSER]], [
            /fxios\/([-\w\.]+)/i                                                // Firefox for iOS
            ], [VERSION, [NAME, FIREFOX]], [
            /\bqihu|(qi?ho?o?|360)browser/i                                     // 360
            ], [[NAME, '360 '+BROWSER]], [
            /(oculus|samsung|sailfish)browser\/([\w\.]+)/i
            ], [[NAME, /(.+)/, '$1 '+BROWSER], VERSION], [                      // Oculus/Samsung/Sailfish Browser
            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION], [
            /(electron)\/([\w\.]+) safari/i,                                    // Electron-based App
            /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,                   // Tesla
            /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i            // QQBrowser/Baidu App/2345 Browser
            ], [NAME, VERSION], [
            /(metasr)[\/ ]?([\w\.]+)/i,                                         // SouGouBrowser
            /(lbbrowser)/i                                                      // LieBao Browser
            ], [NAME], [

            // WebView
            /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i       // Facebook App for iOS & Android
            ], [[NAME, FACEBOOK], VERSION], [
            /safari (line)\/([\w\.]+)/i,                                        // Line App for iOS
            /\b(line)\/([\w\.]+)\/iab/i,                                        // Line App for Android
            /(chromium|instagram)[\/ ]([-\w\.]+)/i                              // Chromium/Instagram
            ], [NAME, VERSION], [
            /\bgsa\/([\w\.]+) .*safari\//i                                      // Google Search Appliance on iOS
            ], [VERSION, [NAME, 'GSA']], [

            /headlesschrome(?:\/([\w\.]+)| )/i                                  // Chrome Headless
            ], [VERSION, [NAME, CHROME+' Headless']], [

            / wv\).+(chrome)\/([\w\.]+)/i                                       // Chrome WebView
            ], [[NAME, CHROME+' WebView'], VERSION], [

            /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i           // Android Browser
            ], [VERSION, [NAME, 'Android '+BROWSER]], [

            /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i       // Chrome/OmniWeb/Arora/Tizen/Nokia
            ], [NAME, VERSION], [

            /version\/([\w\.]+) .*mobile\/\w+ (safari)/i                        // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], [
            /version\/([\w\.]+) .*(mobile ?safari|safari)/i                     // Safari & Safari Mobile
            ], [VERSION, NAME], [
            /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i                      // Safari < 3.0
            ], [NAME, [VERSION, strMapper, oldSafariMap]], [

            /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], [

            // Gecko based
            /(navigator|netscape\d?)\/([-\w\.]+)/i                              // Netscape
            ], [[NAME, 'Netscape'], VERSION], [
            /mobile vr; rv:([\w\.]+)\).+firefox/i                               // Firefox Reality
            ], [VERSION, [NAME, FIREFOX+' Reality']], [
            /ekiohf.+(flow)\/([\w\.]+)/i,                                       // Flow
            /(swiftfox)/i,                                                      // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror/Klar
            /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(firefox)\/([\w\.]+)/i,                                            // Other Firefox-based
            /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,                         // Mozilla

            // Other
            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir/Obigo/Mosaic/Go/ICE/UP.Browser
            /(links) \(([\w\.]+)/i                                              // Links
            ], [NAME, VERSION]
        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i                     // AMD64 (x64)
            ], [[ARCHITECTURE, 'amd64']], [

            /(ia32(?=;))/i                                                      // IA32 (quicktime)
            ], [[ARCHITECTURE, lowerize]], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32 (x86)
            ], [[ARCHITECTURE, 'ia32']], [

            /\b(aarch64|arm(v?8e?l?|_?64))\b/i                                 // ARM64
            ], [[ARCHITECTURE, 'arm64']], [

            /\b(arm(?:v[67])?ht?n?[fl]p?)\b/i                                   // ARMHF
            ], [[ARCHITECTURE, 'armhf']], [

            // PocketPC mistakenly identified as PowerPC
            /windows (ce|mobile); ppc;/i
            ], [[ARCHITECTURE, 'arm']], [

            /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i                            // PowerPC
            ], [[ARCHITECTURE, /ower/, EMPTY, lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ], [[ARCHITECTURE, lowerize]]
        ],

        device : [[

            //////////////////////////
            // MOBILES & TABLETS
            // Ordered by popularity
            /////////////////////////

            // Samsung
            /\b(sch-i[89]0\d|shw-m380s|sm-[pt]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, TABLET]], [
            /\b((?:s[cgp]h|gt|sm)-\w+|galaxy nexus)/i,
            /samsung[- ]([-\w]+)/i,
            /sec-(sgh\w+)/i
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, MOBILE]], [

            // Apple
            /\((ip(?:hone|od)[\w ]*);/i                                         // iPod/iPhone
            ], [MODEL, [VENDOR, APPLE], [TYPE, MOBILE]], [
            /\((ipad);[-\w\),; ]+apple/i,                                       // iPad
            /applecoremedia\/[\w\.]+ \((ipad)/i,
            /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
            ], [MODEL, [VENDOR, APPLE], [TYPE, TABLET]], [

            // Huawei
            /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
            ], [MODEL, [VENDOR, HUAWEI], [TYPE, TABLET]], [
            /(?:huawei|honor)([-\w ]+)[;\)]/i,
            /\b(nexus 6p|\w{2,4}-[atu]?[ln][01259x][012359][an]?)\b(?!.+d\/s)/i
            ], [MODEL, [VENDOR, HUAWEI], [TYPE, MOBILE]], [

            // Xiaomi
            /\b(poco[\w ]+)(?: bui|\))/i,                                       // Xiaomi POCO
            /\b; (\w+) build\/hm\1/i,                                           // Xiaomi Hongmi 'numeric' models
            /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,                             // Xiaomi Hongmi
            /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,                   // Xiaomi Redmi
            /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i // Xiaomi Mi
            ], [[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, MOBILE]], [
            /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i                        // Mi Pad tablets
            ],[[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, TABLET]], [

            // OPPO
            /; (\w+) bui.+ oppo/i,
            /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
            ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [

            // Vivo
            /vivo (\w+)(?: bui|\))/i,
            /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
            ], [MODEL, [VENDOR, 'Vivo'], [TYPE, MOBILE]], [

            // Realme
            /\b(rmx[12]\d{3})(?: bui|;|\))/i
            ], [MODEL, [VENDOR, 'Realme'], [TYPE, MOBILE]], [

            // Motorola
            /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
            /\bmot(?:orola)?[- ](\w*)/i,
            /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, MOBILE]], [
            /\b(mz60\d|xoom[2 ]{0,2}) build\//i
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, TABLET]], [

            // LG
            /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
            ], [MODEL, [VENDOR, LG], [TYPE, TABLET]], [
            /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
            /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
            /\blg-?([\d\w]+) bui/i
            ], [MODEL, [VENDOR, LG], [TYPE, MOBILE]], [

            // Lenovo
            /(ideatab[-\w ]+)/i,
            /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [

            // Nokia
            /(?:maemo|nokia).*(n900|lumia \d+)/i,
            /nokia[-_ ]?([-\w\.]*)/i
            ], [[MODEL, /_/g, ' '], [VENDOR, 'Nokia'], [TYPE, MOBILE]], [

            // Google
            /(pixel c)\b/i                                                      // Google Pixel C
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, TABLET]], [
            /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i                         // Google Pixel
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, MOBILE]], [

            // Sony
            /droid.+ ([c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
            ], [MODEL, [VENDOR, SONY], [TYPE, MOBILE]], [
            /sony tablet [ps]/i,
            /\b(?:sony)?sgp\w+(?: bui|\))/i
            ], [[MODEL, 'Xperia Tablet'], [VENDOR, SONY], [TYPE, TABLET]], [

            // OnePlus
            / (kb2005|in20[12]5|be20[12][59])\b/i,
            /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
            ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

            // Amazon
            /(alexa)webm/i,
            /(kf[a-z]{2}wi)( bui|\))/i,                                         // Kindle Fire without Silk
            /(kf[a-z]+)( bui|\)).+silk\//i                                      // Kindle Fire HD
            ], [MODEL, [VENDOR, AMAZON], [TYPE, TABLET]], [
            /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i                     // Fire Phone
            ], [[MODEL, /(.+)/g, 'Fire Phone $1'], [VENDOR, AMAZON], [TYPE, MOBILE]], [

            // BlackBerry
            /(playbook);[-\w\),; ]+(rim)/i                                      // BlackBerry PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [
            /\b((?:bb[a-f]|st[hv])100-\d)/i,
            /\(bb10; (\w+)/i                                                    // BlackBerry 10
            ], [MODEL, [VENDOR, BLACKBERRY], [TYPE, MOBILE]], [

            // Asus
            /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
            ], [MODEL, [VENDOR, ASUS], [TYPE, TABLET]], [
            / (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i
            ], [MODEL, [VENDOR, ASUS], [TYPE, MOBILE]], [

            // HTC
            /(nexus 9)/i                                                        // HTC Nexus 9
            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [
            /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,                         // HTC

            // ZTE
            /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
            /(alcatel|geeksphone|nexian|panasonic|sony)[-_ ]?([-\w]*)/i         // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            // Acer
            /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

            // Meizu
            /droid.+; (m[1-5] note) bui/i,
            /\bmz-([-\w]{2,})/i
            ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [

            // Sharp
            /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, MOBILE]], [

            // MIXED
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i,
                                                                                // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
            /(hp) ([\w ]+\w)/i,                                                 // HP iPAQ
            /(asus)-?(\w+)/i,                                                   // Asus
            /(microsoft); (lumia[\w ]+)/i,                                      // Microsoft Lumia
            /(lenovo)[-_ ]?([-\w]+)/i,                                          // Lenovo
            /(jolla)/i,                                                         // Jolla
            /(oppo) ?([\w ]+) bui/i                                             // OPPO
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /(archos) (gamepad2?)/i,                                            // Archos
            /(hp).+(touchpad(?!.+tablet)|tablet)/i,                             // HP TouchPad
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(nook)[\w ]+build\/(\w+)/i,                                        // Nook
            /(dell) (strea[kpr\d ]*[\dko])/i,                                   // Dell Streak
            /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,                                  // Le Pan Tablets
            /(trinity)[- ]*(t\d{3}) bui/i,                                      // Trinity Tablets
            /(gigaset)[- ]+(q\w{1,9}) bui/i,                                    // Gigaset Tablets
            /(vodafone) ([\w ]+)(?:\)| bui)/i                                   // Vodafone
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(surface duo)/i                                                    // Surface Duo
            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, TABLET]], [
            /droid [\d\.]+; (fp\du?)(?: b|\))/i                                 // Fairphone
            ], [MODEL, [VENDOR, 'Fairphone'], [TYPE, MOBILE]], [
            /(u304aa)/i                                                         // AT&T
            ], [MODEL, [VENDOR, 'AT&T'], [TYPE, MOBILE]], [
            /\bsie-(\w*)/i                                                      // Siemens
            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [
            /\b(rct\w+) b/i                                                     // RCA Tablets
            ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [
            /\b(venue[\d ]{2,7}) b/i                                            // Dell Venue Tablets
            ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [
            /\b(q(?:mv|ta)\w+) b/i                                              // Verizon Tablet
            ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [
            /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i                       // Barnes & Noble Tablet
            ], [MODEL, [VENDOR, 'Barnes & Noble'], [TYPE, TABLET]], [
            /\b(tm\d{3}\w+) b/i
            ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [
            /\b(k88) b/i                                                        // ZTE K Series Tablet
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [
            /\b(nx\d{3}j) b/i                                                   // ZTE Nubia
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [
            /\b(gen\d{3}) b.+49h/i                                              // Swiss GEN Mobile
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [
            /\b(zur\d{3}) b/i                                                   // Swiss ZUR Tablet
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [
            /\b((zeki)?tb.*\b) b/i                                              // Zeki Tablets
            ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [
            /\b([yr]\d{2}) b/i,
            /\b(dragon[- ]+touch |dt)(\w{5}) b/i                                // Dragon Touch Tablet
            ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [
            /\b(ns-?\w{0,9}) b/i                                                // Insignia Tablets
            ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [
            /\b((nxa|next)-?\w{0,9}) b/i                                        // NextBook Tablets
            ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [
            /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i                  // Voice Xtreme Phones
            ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [
            /\b(lvtel\-)?(v1[12]) b/i                                           // LvTel Phones
            ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [
            /\b(ph-1) /i                                                        // Essential PH-1
            ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [
            /\b(v(100md|700na|7011|917g).*\b) b/i                               // Envizen Tablets
            ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [
            /\b(trio[-\w\. ]+) b/i                                              // MachSpeed Tablets
            ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [
            /\btu_(1491) b/i                                                    // Rotor Tablets
            ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [
            /(shield[\w ]+) b/i                                                 // Nvidia Shield Tablets
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, TABLET]], [
            /(sprint) (\w+)/i                                                   // Sprint Phones
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
            ], [[MODEL, /\./g, ' '], [VENDOR, MICROSOFT], [TYPE, MOBILE]], [
            /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i             // Zebra
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, TABLET]], [
            /droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, MOBILE]], [

            ///////////////////
            // CONSOLES
            ///////////////////

            /(ouya)/i,                                                          // Ouya
            /(nintendo) ([wids3utch]+)/i                                        // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [
            /droid.+; (shield) bui/i                                            // Nvidia
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [
            /(playstation [345portablevi]+)/i                                   // Playstation
            ], [MODEL, [VENDOR, SONY], [TYPE, CONSOLE]], [
            /\b(xbox(?: one)?(?!; xbox))[\); ]/i                                // Microsoft Xbox
            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, CONSOLE]], [

            ///////////////////
            // SMARTTVS
            ///////////////////

            /smart-tv.+(samsung)/i                                              // Samsung
            ], [VENDOR, [TYPE, SMARTTV]], [
            /hbbtv.+maple;(\d+)/i
            ], [[MODEL, /^/, 'SmartTV'], [VENDOR, SAMSUNG], [TYPE, SMARTTV]], [
            /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i        // LG SmartTV
            ], [[VENDOR, LG], [TYPE, SMARTTV]], [
            /(apple) ?tv/i                                                      // Apple TV
            ], [VENDOR, [MODEL, APPLE+' TV'], [TYPE, SMARTTV]], [
            /crkey/i                                                            // Google Chromecast
            ], [[MODEL, CHROME+'cast'], [VENDOR, GOOGLE], [TYPE, SMARTTV]], [
            /droid.+aft(\w)( bui|\))/i                                          // Fire TV
            ], [MODEL, [VENDOR, AMAZON], [TYPE, SMARTTV]], [
            /\(dtv[\);].+(aquos)/i                                              // Sharp
            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [
            /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,                          // Roku
            /hbbtv\/\d+\.\d+\.\d+ +\([\w ]*; *(\w[^;]*);([^;]*)/i               // HbbTV devices
            ], [[VENDOR, trim], [MODEL, trim], [TYPE, SMARTTV]], [
            /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i                   // SmartTV from Unidentified Vendors
            ], [[TYPE, SMARTTV]], [

            ///////////////////
            // WEARABLES
            ///////////////////

            /((pebble))app/i                                                    // Pebble
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
            /droid.+; (glass) \d/i                                              // Google Glass
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]], [
            /droid.+; (wt63?0{2,3})\)/i
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, WEARABLE]], [
            /(quest( 2)?)/i                                                     // Oculus Quest
            ], [MODEL, [VENDOR, FACEBOOK], [TYPE, WEARABLE]], [

            ///////////////////
            // EMBEDDED
            ///////////////////

            /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i                              // Tesla
            ], [VENDOR, [TYPE, EMBEDDED]], [

            ////////////////////
            // MIXED (GENERIC)
            ///////////////////

            /droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i           // Android Phones from Unidentified Vendors
            ], [MODEL, [TYPE, MOBILE]], [
            /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i       // Android Tablets from Unidentified Vendors
            ], [MODEL, [TYPE, TABLET]], [
            /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i                      // Unidentifiable Tablet
            ], [[TYPE, TABLET]], [
            /(phone|mobile(?:[;\/]| safari)|pda(?=.+windows ce))/i              // Unidentifiable Mobile
            ], [[TYPE, MOBILE]], [
            /(android[-\w\. ]{0,9});.+buil/i                                    // Generic Android Device
            ], [MODEL, [VENDOR, 'Generic']]
        ],

        engine : [[

            /windows.+ edge\/([\w\.]+)/i                                       // EdgeHTML
            ], [VERSION, [NAME, EDGE+'HTML']], [

            /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i                         // Blink
            ], [VERSION, [NAME, 'Blink']], [

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
            /ekioh(flow)\/([\w\.]+)/i,                                          // Flow
            /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,                           // KHTML/Tasman/Links
            /(icab)[\/ ]([23]\.[\d\.]+)/i                                       // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]{1,9})\b.+(gecko)/i                                     // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows
            /microsoft (windows) (vista|xp)/i                                   // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows) nt 6\.2; (arm)/i,                                        // Windows RT
            /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,            // Windows Phone
            /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i
            ], [NAME, [VERSION, strMapper, windowsVersionMap]], [
            /(win(?=3|9|n)|win 9x )([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, strMapper, windowsVersionMap]], [

            // iOS/macOS
            /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,              // iOS
            /cfnetwork\/.+darwin/i
            ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [
            /(mac os x) ?([\w\. ]*)/i,
            /(macintosh|mac_powerpc\b)(?!.+haiku)/i                             // Mac OS
            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

            // Mobile OSes
            /droid ([\w\.]+)\b.+(android[- ]x86)/i                              // Android-x86
            ], [VERSION, NAME], [                                               // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
            /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
            /(blackberry)\w*\/([\w\.]*)/i,                                      // Blackberry
            /(tizen|kaios)[\/ ]([\w\.]+)/i,                                     // Tizen/KaiOS
            /\((series40);/i                                                    // Series 40
            ], [NAME, VERSION], [
            /\(bb(10);/i                                                        // BlackBerry 10
            ], [VERSION, [NAME, BLACKBERRY]], [
            /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i         // Symbian
            ], [VERSION, [NAME, 'Symbian']], [
            /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i // Firefox OS
            ], [VERSION, [NAME, FIREFOX+' OS']], [
            /web0s;.+rt(tv)/i,
            /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i                              // WebOS
            ], [VERSION, [NAME, 'webOS']], [

            // Google Chromecast
            /crkey\/([\d\.]+)/i                                                 // Google Chromecast
            ], [VERSION, [NAME, CHROME+'cast']], [
            /(cros) [\w]+ ([\w\.]+\w)/i                                         // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Console
            /(nintendo|playstation) ([wids345portablevuch]+)/i,                 // Nintendo/Playstation
            /(xbox); +xbox ([^\);]+)/i,                                         // Microsoft Xbox (360, One, X, S, Series X, Series S)

            // Other
            /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,                            // Joli/Palm
            /(mint)[\/\(\) ]?(\w*)/i,                                           // Mint
            /(mageia|vectorlinux)[; ]/i,                                        // Mageia/VectorLinux
            /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
                                                                                // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
            /(hurd|linux) ?([\w\.]*)/i,                                         // Hurd/Linux
            /(gnu) ?([\w\.]*)/i,                                                // GNU
            /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
            /(haiku) (\w+)/i                                                    // Haiku
            ], [NAME, VERSION], [
            /(sunos) ?([\w\.\d]*)/i                                             // Solaris
            ], [[NAME, 'Solaris'], VERSION], [
            /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,                              // Solaris
            /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,                                  // AIX
            /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux)/i,            // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX
            /(unix) ?([\w\.]*)/i                                                // UNIX
            ], [NAME, VERSION]
        ]
    };

    /////////////////
    // Constructor
    ////////////////

    var UAParser = function (ua, extensions) {

        if (typeof ua === OBJ_TYPE) {
            extensions = ua;
            ua = undefined;
        }

        if (!(this instanceof UAParser)) {
            return new UAParser(ua, extensions).getResult();
        }

        var _ua = ua || ((typeof window !== UNDEF_TYPE && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
        var _rgxmap = extensions ? extend(regexes, extensions) : regexes;

        this.getBrowser = function () {
            var _browser = {};
            _browser[NAME] = undefined;
            _browser[VERSION] = undefined;
            rgxMapper.call(_browser, _ua, _rgxmap.browser);
            _browser.major = majorize(_browser.version);
            return _browser;
        };
        this.getCPU = function () {
            var _cpu = {};
            _cpu[ARCHITECTURE] = undefined;
            rgxMapper.call(_cpu, _ua, _rgxmap.cpu);
            return _cpu;
        };
        this.getDevice = function () {
            var _device = {};
            _device[VENDOR] = undefined;
            _device[MODEL] = undefined;
            _device[TYPE] = undefined;
            rgxMapper.call(_device, _ua, _rgxmap.device);
            return _device;
        };
        this.getEngine = function () {
            var _engine = {};
            _engine[NAME] = undefined;
            _engine[VERSION] = undefined;
            rgxMapper.call(_engine, _ua, _rgxmap.engine);
            return _engine;
        };
        this.getOS = function () {
            var _os = {};
            _os[NAME] = undefined;
            _os[VERSION] = undefined;
            rgxMapper.call(_os, _ua, _rgxmap.os);
            return _os;
        };
        this.getResult = function () {
            return {
                ua      : this.getUA(),
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return _ua;
        };
        this.setUA = function (ua) {
            _ua = (typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH) ? trim(ua, UA_MAX_LENGTH) : ua;
            return this;
        };
        this.setUA(_ua);
        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER =  enumerize([NAME, VERSION, MAJOR]);
    UAParser.CPU = enumerize([ARCHITECTURE]);
    UAParser.DEVICE = enumerize([MODEL, VENDOR, TYPE, CONSOLE, MOBILE, SMARTTV, TABLET, WEARABLE, EMBEDDED]);
    UAParser.ENGINE = UAParser.OS = enumerize([NAME, VERSION]);

    ///////////
    // Export
    //////////

    // check js environment
    if (typeof(exports) !== UNDEF_TYPE) {
        // nodejs env
        if (typeof module !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        // requirejs env (optional)
        if (typeof(define) === FUNC_TYPE && define.amd) {
            define(function () {
                return UAParser;
            });
        } else if (typeof window !== UNDEF_TYPE) {
            // browser env
            window.UAParser = UAParser;
        }
    }

    // jQuery/Zepto specific (optional)
    // Note:
    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
    //   and we should catch that.
    var $ = typeof window !== UNDEF_TYPE && (window.jQuery || window.Zepto);
    if ($ && !$.ua) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () {
            return parser.getUA();
        };
        $.ua.set = function (ua) {
            parser.setUA(ua);
            var result = parser.getResult();
            for (var prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : this);

},{}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJldmFsdWF0ZUJyb3dzZXIuanMiLCJleHRlbmQuanMiLCJpbmRleC5qcyIsImxhbmd1YWdlcy5qc29uIiwibm9kZV9tb2R1bGVzL3VhLXBhcnNlci1qcy9zcmMvdWEtcGFyc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIERFRkFVTFRTID0ge1xuXHRDaHJvbWU6IDU3LCAvLyBJbmNsdWRlcyBDaHJvbWUgZm9yIG1vYmlsZSBkZXZpY2VzXG5cdEVkZ2U6IDM5LFxuXHRTYWZhcmk6IDEwLFxuXHRcIk1vYmlsZSBTYWZhcmlcIjogMTAsXG5cdE9wZXJhOiA1MCxcblx0RmlyZWZveDogNTAsXG5cdFZpdmFsZGk6IDEsXG5cdElFOiBmYWxzZVxufVxuXG52YXIgRURHRUhUTUxfVlNfRURHRV9WRVJTSU9OUyA9IHtcblx0MTI6IDAuMSxcblx0MTM6IDIxLFxuXHQxNDogMzEsXG5cdDE1OiAzOSxcblx0MTY6IDQxLFxuXHQxNzogNDIsXG5cdDE4OiA0NFxufVxuXG52YXIgdXBkYXRlRGVmYXVsdHMgPSBmdW5jdGlvbiAoZGVmYXVsdHMsIHVwZGF0ZWRWYWx1ZXMpIHtcblx0Zm9yICh2YXIga2V5IGluIHVwZGF0ZWRWYWx1ZXMpIHtcblx0XHRkZWZhdWx0c1trZXldID0gdXBkYXRlZFZhbHVlc1trZXldXG5cdH1cblxuXHRyZXR1cm4gZGVmYXVsdHNcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGFyc2VkVXNlckFnZW50LCBvcHRpb25zKSB7XG5cdC8vIFNldCBkZWZhdWx0IG9wdGlvbnNcblx0dmFyIGJyb3dzZXJTdXBwb3J0ID0gb3B0aW9ucy5icm93c2VyU3VwcG9ydCA/IHVwZGF0ZURlZmF1bHRzKERFRkFVTFRTLCBvcHRpb25zLmJyb3dzZXJTdXBwb3J0KSA6IERFRkFVTFRTXG5cdHZhciByZXF1aXJlZENzc1Byb3BlcnR5ID0gb3B0aW9ucy5yZXF1aXJlZENzc1Byb3BlcnR5IHx8IGZhbHNlXG5cblx0dmFyIGJyb3dzZXJOYW1lID0gcGFyc2VkVXNlckFnZW50LmJyb3dzZXIubmFtZTtcblxuXHR2YXIgaXNBbmRyb2lkQnV0Tm90Q2hyb21lXG5cdGlmIChvcHRpb25zLnJlcXVpcmVDaHJvbWVPbkFuZHJvaWQpIHtcblx0XHRpc0FuZHJvaWRCdXROb3RDaHJvbWUgPSBwYXJzZWRVc2VyQWdlbnQub3MubmFtZSA9PT0gXCJBbmRyb2lkXCIgJiYgcGFyc2VkVXNlckFnZW50LmJyb3dzZXIubmFtZSAhPT0gXCJDaHJvbWVcIlxuXHR9XHRcblx0XG5cdHZhciBwYXJzZU1pbm9yVmVyc2lvbiA9IGZ1bmN0aW9uICh2ZXJzaW9uKSB7XG5cdFx0cmV0dXJuIHZlcnNpb24ucmVwbGFjZSgvW15cXGQuXS9nLCAnJykuc3BsaXQoXCIuXCIpWzFdO1xuXHR9XG5cblx0dmFyIGlzQnJvd3NlclVuc3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpc1Vuc3VwcG9ydGVkID0gZmFsc2Vcblx0XHRpZiAoIShicm93c2VyTmFtZSBpbiBicm93c2VyU3VwcG9ydCkpIHtcblx0XHRcdGlmICghb3B0aW9ucy5pc1Vua25vd25Ccm93c2VyT0spIHtcblx0XHRcdFx0aXNVbnN1cHBvcnRlZCA9IHRydWVcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFicm93c2VyU3VwcG9ydFticm93c2VyTmFtZV0pIHtcblx0XHRcdGlzVW5zdXBwb3J0ZWQgPSB0cnVlXG5cdFx0fVxuXHRcdHJldHVybiBpc1Vuc3VwcG9ydGVkO1xuXHR9XG5cblx0dmFyIGlzQnJvd3NlclVuc3VwcG9ydGVkUmVzdWx0ID0gaXNCcm93c2VyVW5zdXBwb3J0ZWQoKTtcblxuXHR2YXIgaXNCcm93c2VyT3V0T2ZEYXRlID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBicm93c2VyVmVyc2lvbiA9IHBhcnNlZFVzZXJBZ2VudC5icm93c2VyLnZlcnNpb247XG5cdFx0dmFyIGJyb3dzZXJNYWpvclZlcnNpb24gPSBwYXJzZWRVc2VyQWdlbnQuYnJvd3Nlci5tYWpvcjtcblx0XHR2YXIgb3NOYW1lID0gcGFyc2VkVXNlckFnZW50Lm9zLm5hbWU7XG5cdFx0dmFyIG9zVmVyc2lvbiA9IHBhcnNlZFVzZXJBZ2VudC5vcy52ZXJzaW9uO1xuXG5cdFx0Ly8gRWRnZSBsZWdhY3kgbmVlZGVkIGEgdmVyc2lvbiBtYXBwaW5nLCBFZGdlIG9uIENocm9taXVtIGRvZXNuJ3Rcblx0XHRpZiAoYnJvd3Nlck5hbWUgPT09IFwiRWRnZVwiICYmIGJyb3dzZXJNYWpvclZlcnNpb24gPD0gMTgpIHtcblx0XHRcdGJyb3dzZXJNYWpvclZlcnNpb24gPSBFREdFSFRNTF9WU19FREdFX1ZFUlNJT05TW2Jyb3dzZXJNYWpvclZlcnNpb25dO1xuXHRcdH1cblxuXHRcdC8vIEZpcmVmb3ggTW9iaWxlIG9uIGlPUyBpcyBlc3NlbnRpYWxseSBNb2JpbGUgU2FmYXJpIHNvIG5lZWRzIHRvIGJlIGhhbmRsZWQgdGhhdCB3YXlcblx0XHQvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9taWtlbWFjY2FuYS9vdXRkYXRlZC1icm93c2VyLXJld29yay9pc3N1ZXMvOTgjaXNzdWVjb21tZW50LTU5NzcyMTE3M1xuXHRcdGlmIChicm93c2VyTmFtZSA9PT0gJ0ZpcmVmb3gnICYmIG9zTmFtZSA9PT0gJ2lPUycpIHtcblx0XHRcdGJyb3dzZXJOYW1lID0gJ01vYmlsZSBTYWZhcmknO1xuXHRcdFx0YnJvd3NlclZlcnNpb24gPSBvc1ZlcnNpb247XG5cdFx0XHRicm93c2VyTWFqb3JWZXJzaW9uID0gb3NWZXJzaW9uLnN1YnN0cmluZygwLCBvc1ZlcnNpb24uaW5kZXhPZignLicpKTtcblx0XHR9XG5cblx0XHR2YXIgaXNPdXRPZkRhdGUgPSBmYWxzZVxuXHRcdGlmIChpc0Jyb3dzZXJVbnN1cHBvcnRlZFJlc3VsdCkge1xuXHRcdFx0aXNPdXRPZkRhdGUgPSB0cnVlO1xuXHRcdH0gZWxzZSBpZiAoYnJvd3Nlck5hbWUgaW4gYnJvd3NlclN1cHBvcnQpIHtcblx0XHRcdHZhciBtaW5WZXJzaW9uID0gYnJvd3NlclN1cHBvcnRbYnJvd3Nlck5hbWVdXG5cdFx0XHRpZiAodHlwZW9mIG1pblZlcnNpb24gPT0gJ29iamVjdCcpIHtcblx0XHRcdFx0dmFyIG1pbk1ham9yVmVyc2lvbiA9IG1pblZlcnNpb24ubWFqb3Jcblx0XHRcdFx0dmFyIG1pbk1pbm9yVmVyc2lvbiA9IG1pblZlcnNpb24ubWlub3JcblxuXHRcdFx0XHRpZiAoYnJvd3Nlck1ham9yVmVyc2lvbiA8IG1pbk1ham9yVmVyc2lvbikge1xuXHRcdFx0XHRcdGlzT3V0T2ZEYXRlID0gdHJ1ZVxuXHRcdFx0XHR9IGVsc2UgaWYgKGJyb3dzZXJNYWpvclZlcnNpb24gPT0gbWluTWFqb3JWZXJzaW9uKSB7XG5cdFx0XHRcdFx0dmFyIGJyb3dzZXJNaW5vclZlcnNpb24gPSBwYXJzZU1pbm9yVmVyc2lvbihicm93c2VyVmVyc2lvbilcblxuXHRcdFx0XHRcdGlmIChicm93c2VyTWlub3JWZXJzaW9uIDwgbWluTWlub3JWZXJzaW9uKSB7XG5cdFx0XHRcdFx0XHRpc091dE9mRGF0ZSA9IHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoYnJvd3Nlck1ham9yVmVyc2lvbiA8IG1pblZlcnNpb24pIHtcblx0XHRcdFx0aXNPdXRPZkRhdGUgPSB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpc091dE9mRGF0ZVxuXHR9XG5cblx0Ly8gUmV0dXJucyB0cnVlIGlmIGEgYnJvd3NlciBzdXBwb3J0cyBhIGNzczMgcHJvcGVydHlcblx0dmFyIGlzUHJvcGVydHlTdXBwb3J0ZWQgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcblx0XHRpZiAoIXByb3BlcnR5KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblx0XHR2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuXHRcdHZhciB2ZW5kb3JQcmVmaXhlcyA9IFtcImtodG1sXCIsIFwibXNcIiwgXCJvXCIsIFwibW96XCIsIFwid2Via2l0XCJdXG5cdFx0dmFyIGNvdW50ID0gdmVuZG9yUHJlZml4ZXMubGVuZ3RoXG5cblx0XHQvLyBOb3RlOiBIVE1MRWxlbWVudC5zdHlsZS5oYXNPd25Qcm9wZXJ0eSBzZWVtcyBicm9rZW4gaW4gRWRnZVxuXHRcdGlmIChwcm9wZXJ0eSBpbiBkaXYuc3R5bGUpIHtcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fVxuXG5cdFx0cHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9eW2Etel0vLCBmdW5jdGlvbiAodmFsKSB7XG5cdFx0XHRyZXR1cm4gdmFsLnRvVXBwZXJDYXNlKClcblx0XHR9KVxuXG5cdFx0d2hpbGUgKGNvdW50LS0pIHtcblx0XHRcdHZhciBwcmVmaXhlZFByb3BlcnR5ID0gdmVuZG9yUHJlZml4ZXNbY291bnRdICsgcHJvcGVydHlcblx0XHRcdC8vIFNlZSBjb21tZW50IHJlOiBIVE1MRWxlbWVudC5zdHlsZS5oYXNPd25Qcm9wZXJ0eSBhYm92ZVxuXHRcdFx0aWYgKHByZWZpeGVkUHJvcGVydHkgaW4gZGl2LnN0eWxlKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0Ly8gUmV0dXJuIHJlc3VsdHNcblx0cmV0dXJuIHtcblx0XHRpc0FuZHJvaWRCdXROb3RDaHJvbWU6IGlzQW5kcm9pZEJ1dE5vdENocm9tZSxcblx0XHRpc0Jyb3dzZXJPdXRPZkRhdGU6IGlzQnJvd3Nlck91dE9mRGF0ZSgpLFxuXHRcdGlzQnJvd3NlclVuc3VwcG9ydGVkOiBpc0Jyb3dzZXJVbnN1cHBvcnRlZFJlc3VsdCxcblx0XHRpc1Byb3BlcnR5U3VwcG9ydGVkOiBpc1Byb3BlcnR5U3VwcG9ydGVkKHJlcXVpcmVkQ3NzUHJvcGVydHkpXG5cdH07XG59XG4iLCIvKiBIaWdobHkgZHVtYmVkIGRvd24gdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vdW5jbGVjaHUvbm9kZS1kZWVwLWV4dGVuZCAqL1xuXG4vKipcbiAqIEV4dGVuaW5nIG9iamVjdCB0aGF0IGVudGVyZWQgaW4gZmlyc3QgYXJndW1lbnQuXG4gKlxuICogUmV0dXJucyBleHRlbmRlZCBvYmplY3Qgb3IgZmFsc2UgaWYgaGF2ZSBubyB0YXJnZXQgb2JqZWN0IG9yIGluY29ycmVjdCB0eXBlLlxuICpcbiAqIElmIHlvdSB3aXNoIHRvIGNsb25lIHNvdXJjZSBvYmplY3QgKHdpdGhvdXQgbW9kaWZ5IGl0KSwganVzdCB1c2UgZW1wdHkgbmV3XG4gKiBvYmplY3QgYXMgZmlyc3QgYXJndW1lbnQsIGxpa2UgdGhpczpcbiAqICAgZGVlcEV4dGVuZCh7fSwgeW91ck9ial8xLCBbeW91ck9ial9OXSk7XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVlcEV4dGVuZCgvKm9ial8xLCBbb2JqXzJdLCBbb2JqX05dKi8pIHtcblx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxIHx8IHR5cGVvZiBhcmd1bWVudHNbMF0gIT09IFwib2JqZWN0XCIpIHtcblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuXHRcdHJldHVybiBhcmd1bWVudHNbMF1cblx0fVxuXG5cdHZhciB0YXJnZXQgPSBhcmd1bWVudHNbMF1cblxuXHRmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBvYmogPSBhcmd1bWVudHNbaV1cblxuXHRcdGZvciAodmFyIGtleSBpbiBvYmopIHtcblx0XHRcdHZhciBzcmMgPSB0YXJnZXRba2V5XVxuXHRcdFx0dmFyIHZhbCA9IG9ialtrZXldXG5cblx0XHRcdGlmICh0eXBlb2YgdmFsICE9PSBcIm9iamVjdFwiIHx8IHZhbCA9PT0gbnVsbCkge1xuXHRcdFx0XHR0YXJnZXRba2V5XSA9IHZhbFxuXG5cdFx0XHRcdC8vIGp1c3QgY2xvbmUgYXJyYXlzIChhbmQgcmVjdXJzaXZlIGNsb25lIG9iamVjdHMgaW5zaWRlKVxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygc3JjICE9PSBcIm9iamVjdFwiIHx8IHNyYyA9PT0gbnVsbCkge1xuXHRcdFx0XHR0YXJnZXRba2V5XSA9IGRlZXBFeHRlbmQoe30sIHZhbClcblxuXHRcdFx0XHQvLyBzb3VyY2UgdmFsdWUgYW5kIG5ldyB2YWx1ZSBpcyBvYmplY3RzIGJvdGgsIGV4dGVuZGluZy4uLlxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0W2tleV0gPSBkZWVwRXh0ZW5kKHNyYywgdmFsKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0YXJnZXRcbn1cbiIsInZhciBldmFsdWF0ZUJyb3dzZXIgPSByZXF1aXJlKFwiLi9ldmFsdWF0ZUJyb3dzZXJcIilcbnZhciBsYW5ndWFnZU1lc3NhZ2VzID0gcmVxdWlyZShcIi4vbGFuZ3VhZ2VzLmpzb25cIilcbnZhciBkZWVwRXh0ZW5kID0gcmVxdWlyZShcIi4vZXh0ZW5kXCIpXG52YXIgVXNlckFnZW50UGFyc2VyID0gcmVxdWlyZShcInVhLXBhcnNlci1qc1wiKVxuXG52YXIgQ09MT1JTID0ge1xuXHRzYWxtb246IFwiI2YyNTY0OFwiLFxuXHR3aGl0ZTogXCJ3aGl0ZVwiXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlclByb3ZpZGVkT3B0aW9ucywgb25sb2FkID0gdHJ1ZSkge1xuXHR2YXIgbWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHQvLyBEZXNwaXRlIHRoZSBkb2NzLCBVQSBuZWVkcyB0byBiZSBwcm92aWRlZCB0byBjb25zdHJ1Y3RvciBleHBsaWNpdGx5OlxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWlzYWxtYW4vdWEtcGFyc2VyLWpzL2lzc3Vlcy85MFxuXHRcdHZhciBwYXJzZWRVc2VyQWdlbnQgPSBuZXcgVXNlckFnZW50UGFyc2VyKG5hdmlnYXRvci51c2VyQWdlbnQpLmdldFJlc3VsdCgpXG5cblx0XHQvLyBWYXJpYWJsZSBkZWZpbml0aW9uIChiZWZvcmUgYWpheClcblx0XHR2YXIgb3V0ZGF0ZWRVSSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3V0ZGF0ZWRcIilcblxuXHRcdGlmICghb3V0ZGF0ZWRVSSkge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0ICAnRE9NIGVsZW1lbnQgd2l0aCBpZCBcIm91dGRhdGVkXCIgaXMgbWlzc2luZyEgU3VjaCBlbGVtZW50IGlzIHJlcXVpcmVkIGZvciBvdXRkYXRlZC1icm93c2VyIHRvIHdvcmsuICcgK1xuXHRcdFx0ICAnSGF2aW5nIHN1Y2ggZWxlbWVudCBvbmx5IG9uIGNlcnRhaW4gcGFnZXMgaXMgYSB2YWxpZCB3YXkgdG8gZGVmaW5lIHdoZXJlIHRvIGRpc3BsYXkgYWxlcnQsIHNvIGlmIHRoaXMgaXMnICtcblx0XHRcdCAgJ2ludGVudGlvbmFsLCBpZ25vcmUgdGhpcyB3YXJuaW5nJ1xuXHRcdFx0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XHQgIFxuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgb3B0aW9uc1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cblx0XHR2YXIgYnJvd3NlckxvY2FsZSA9IHdpbmRvdy5uYXZpZ2F0b3IubGFuZ3VhZ2UgfHwgd2luZG93Lm5hdmlnYXRvci51c2VyTGFuZ3VhZ2UgLy8gRXZlcnlvbmUgZWxzZSwgSUVcblx0XHQvLyBDU1MgcHJvcGVydHkgdG8gY2hlY2sgZm9yLiBZb3UgbWF5IGFsc28gbGlrZSAnYm9yZGVyU3BhY2luZycsICdib3hTaGFkb3cnLCAndHJhbnNmb3JtJywgJ2JvcmRlckltYWdlJztcblx0XHR2YXIgYmFja2dyb3VuZENvbG9yID0gb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgfHwgQ09MT1JTLnNhbG1vblxuXHRcdHZhciB0ZXh0Q29sb3IgPSBvcHRpb25zLnRleHRDb2xvciB8fCBDT0xPUlMud2hpdGVcblx0XHR2YXIgZnVsbHNjcmVlbiA9IG9wdGlvbnMuZnVsbHNjcmVlbiB8fCBmYWxzZVxuXHRcdHZhciBsYW5ndWFnZSA9IG9wdGlvbnMubGFuZ3VhZ2UgfHwgYnJvd3NlckxvY2FsZS5zbGljZSgwLCAyKSAvLyBMYW5ndWFnZSBjb2RlXG5cblx0XHR2YXIgbGFuZ3VhZ2VzID0gb3B0aW9ucy5sYW5ndWFnZUpzb24gfHwge307XG4gICAgXHR2YXIgY3VzdG9tQ1NTQ2xhc3NlcyA9IG9wdGlvbnMuY3VzdG9tQ1NTQ2xhc3NlcyB8fCBudWxsO1xuXG5cdFx0dmFyIHVwZGF0ZVNvdXJjZSA9IFwid2ViXCIgLy8gT3RoZXIgcG9zc2libGUgdmFsdWVzIGFyZSAnZ29vZ2xlUGxheScgb3IgJ2FwcFN0b3JlJy4gRGV0ZXJtaW5lcyB3aGVyZSB3ZSB0ZWxsIHVzZXJzIHRvIGdvIGZvciB1cGdyYWRlcy5cblxuXHRcdC8vIENocm9tZSBtb2JpbGUgaXMgc3RpbGwgQ2hyb21lICh1bmxpa2UgU2FmYXJpIHdoaWNoIGlzICdNb2JpbGUgU2FmYXJpJylcblx0XHR2YXIgaXNBbmRyb2lkID0gcGFyc2VkVXNlckFnZW50Lm9zLm5hbWUgPT09IFwiQW5kcm9pZFwiXG5cdFx0aWYgKGlzQW5kcm9pZCkge1xuXHRcdFx0dXBkYXRlU291cmNlID0gXCJnb29nbGVQbGF5XCJcblx0XHR9IGVsc2UgaWYgIChwYXJzZWRVc2VyQWdlbnQub3MubmFtZSA9PT0gXCJpT1NcIikge1xuXHRcdFx0dXBkYXRlU291cmNlID0gXCJhcHBTdG9yZVwiXG5cdFx0fVxuXG5cdFx0dmFyIGlzQnJvd3NlclVuc3VwcG9ydGVkID0gZmFsc2UgLy8gc2V0IGxhdGVyIGFmdGVyIGJyb3dzZXIgZXZhbHVhdGlvblxuXG5cdFx0dmFyIGRvbmUgPSB0cnVlXG5cblx0XHR2YXIgY2hhbmdlT3BhY2l0eSA9IGZ1bmN0aW9uIChvcGFjaXR5VmFsdWUpIHtcblx0XHRcdG91dGRhdGVkVUkuc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlWYWx1ZSAvIDEwMFxuXHRcdFx0b3V0ZGF0ZWRVSS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5VmFsdWUgKyBcIilcIlxuXHRcdH1cblx0XG5cdFx0dmFyIGZhZGVJbiA9IGZ1bmN0aW9uIChvcGFjaXR5VmFsdWUpIHtcblx0XHRcdGNoYW5nZU9wYWNpdHkob3BhY2l0eVZhbHVlKVxuXHRcdFx0aWYgKG9wYWNpdHlWYWx1ZSA9PT0gMSkge1xuXHRcdFx0XHRvdXRkYXRlZFVJLnN0eWxlLmRpc3BsYXkgPSBcInRhYmxlXCJcblx0XHRcdH1cblx0XHRcdGlmIChvcGFjaXR5VmFsdWUgPT09IDEwMCkge1xuXHRcdFx0XHRkb25lID0gdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblx0XG5cdFx0dmFyIG1ha2VGYWRlSW5GdW5jdGlvbiA9IGZ1bmN0aW9uIChvcGFjaXR5VmFsdWUpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGZhZGVJbihvcGFjaXR5VmFsdWUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcblx0XHQvLyBTdHlsZSBlbGVtZW50IGV4cGxpY2l0bHkgLSBUT0RPOiBpbnZlc3RpZ2F0ZSBhbmQgZGVsZXRlIGlmIG5vdCBuZWVkZWRcblx0XHR2YXIgc3RhcnRTdHlsZXNBbmRFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgYnV0dG9uQ2xvc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ1dHRvbkNsb3NlVXBkYXRlQnJvd3NlclwiKVxuXHRcdFx0dmFyIGJ1dHRvblVwZGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnV0dG9uVXBkYXRlQnJvd3NlclwiKVxuXHRcblx0XHRcdC8vY2hlY2sgc2V0dGluZ3MgYXR0cmlidXRlc1xuXHRcdFx0b3V0ZGF0ZWRVSS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBiYWNrZ3JvdW5kQ29sb3Jcblx0XHRcdC8vd2F5IHRvbyBoYXJkIHRvIHB1dCAhaW1wb3J0YW50IG9uIElFNlxuXHRcdFx0b3V0ZGF0ZWRVSS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcdFx0b3V0ZGF0ZWRVSS5jaGlsZHJlblswXS5jaGlsZHJlblswXS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcdFx0b3V0ZGF0ZWRVSS5jaGlsZHJlblswXS5jaGlsZHJlblsxXS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcblx0XHRcdC8vIFVwZGF0ZSBidXR0b24gaXMgZGVza3RvcCBvbmx5XG5cdFx0XHRpZiAoYnV0dG9uVXBkYXRlKSB7XG5cdFx0XHRcdGJ1dHRvblVwZGF0ZS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcdFx0XHRpZiAoYnV0dG9uVXBkYXRlLnN0eWxlLmJvcmRlckNvbG9yKSB7XG5cdFx0XHRcdFx0YnV0dG9uVXBkYXRlLnN0eWxlLmJvcmRlckNvbG9yID0gdGV4dENvbG9yXG5cdFx0XHRcdH1cblx0XG5cdFx0XHRcdC8vIE92ZXJyaWRlIHRoZSB1cGRhdGUgYnV0dG9uIGNvbG9yIHRvIG1hdGNoIHRoZSBiYWNrZ3JvdW5kIGNvbG9yXG5cdFx0XHRcdGJ1dHRvblVwZGF0ZS5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmNvbG9yID0gYmFja2dyb3VuZENvbG9yXG5cdFx0XHRcdFx0dGhpcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0ZXh0Q29sb3Jcblx0XHRcdFx0fVxuXHRcblx0XHRcdFx0YnV0dG9uVXBkYXRlLm9ubW91c2VvdXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcdFx0XHRcdHRoaXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYmFja2dyb3VuZENvbG9yXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XG5cdFx0XHRidXR0b25DbG9zZS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcblx0XHRcdGJ1dHRvbkNsb3NlLm9ubW91c2Vkb3duID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRvdXRkYXRlZFVJLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHR9XG5cdFxuXHRcdHZhciBnZXRNZXNzYWdlID0gZnVuY3Rpb24gKGxhbmcsIHVzZXJQcm92aWRlZExhbmd1YWdlSnNvbiwgY3VzdG9tQ1NTQ2xhc3Nlcykge1xuXHRcdFx0dmFyIGRlZmF1bHRNZXNzYWdlcyA9IHVzZXJQcm92aWRlZExhbmd1YWdlSnNvbltsYW5nXSB8fCBsYW5ndWFnZU1lc3NhZ2VzW2xhbmddIHx8IGxhbmd1YWdlTWVzc2FnZXMuZW47XG5cdFx0XHR2YXIgY3VzdG9tTWVzc2FnZXMgPSBvcHRpb25zLm1lc3NhZ2VzICYmIG9wdGlvbnMubWVzc2FnZXNbbGFuZ107XG5cdFx0XHR2YXIgbWVzc2FnZXMgPSBkZWVwRXh0ZW5kKHt9LCBkZWZhdWx0TWVzc2FnZXMsIGN1c3RvbU1lc3NhZ2VzKTtcblxuXHRcdFx0dmFyIHRpdGxlQ2xhc3MgPSAnJztcbiAgICAgIFx0XHR2YXIgY29udGVudENsYXNzID0gJyc7XG4gICAgICBcdFx0dmFyIGFjdGlvbkJ1dHRvbkNsYXNzID0gJyc7XG4gICAgICBcdFx0dmFyIGNsb3NlQnV0dG9uQ2xhc3MgPSAnJztcblxuXHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMpIHtcblx0XHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMudGl0bGVDbGFzcykge1xuXHRcdFx0XHRcdHRpdGxlQ2xhc3MgPSBjdXN0b21DU1NDbGFzc2VzLnRpdGxlQ2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMuY29udGVudENsYXNzKSB7XG5cdFx0XHRcdFx0Y29udGVudENsYXNzID0gY3VzdG9tQ1NTQ2xhc3Nlcy5jb250ZW50Q2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMuYWN0aW9uQnV0dG9uQ2xhc3MpIHtcblx0XHRcdFx0XHRhY3Rpb25CdXR0b25DbGFzcyA9IGN1c3RvbUNTU0NsYXNzZXMuYWN0aW9uQnV0dG9uQ2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMuY2xvc2VCdXR0b25DbGFzcykge1xuXHRcdFx0XHRcdGNsb3NlQnV0dG9uQ2xhc3MgPSBjdXN0b21DU1NDbGFzc2VzLmNsb3NlQnV0dG9uQ2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XG5cdFx0XHR2YXIgdXBkYXRlTWVzc2FnZXMgPSB7XG5cdFx0XHRcdHdlYjpcblx0XHRcdFx0XHRcIjxwPiBjbGFzcz1cXFwiXCIgKyBjb250ZW50Q2xhc3MgKyBcIlxcXCI+XCIgK1xuXHRcdFx0XHRcdG1lc3NhZ2VzLnVwZGF0ZS53ZWIgK1xuXHRcdFx0XHRcdChtZXNzYWdlcy51cmwgPyAoXG5cdFx0XHRcdFx0XHQnPGEgaWQ9XCJidXR0b25VcGRhdGVCcm93c2VyXCIgcmVsPVwibm9mb2xsb3dcIiBocmVmPVwiJyArXG5cdFx0XHRcdFx0XHRtZXNzYWdlcy51cmwgK1xuXHRcdFx0XHRcdFx0J1wiIGNsYXNzPVwiJyArIGFjdGlvbkJ1dHRvbkNsYXNzICsgJ1wiID4nICtcblx0XHRcdFx0XHRcdG1lc3NhZ2VzLmNhbGxUb0FjdGlvbiArXG5cdFx0XHRcdFx0XHRcIjwvYT5cIlxuXHRcdFx0XHRcdCkgOiAnJykgK1xuXHRcdFx0XHRcdFwiPC9wPlwiLFxuXHRcdFx0XHRnb29nbGVQbGF5OlxuXHRcdFx0XHRcdFwiPHAgY2xhc3M9XFxcIlwiICsgY29udGVudENsYXNzICsgXCJcXFwiPlwiICtcblx0XHRcdFx0XHRtZXNzYWdlcy51cGRhdGUuZ29vZ2xlUGxheSArXG5cdFx0XHRcdFx0JzxhIGlkPVwiYnV0dG9uVXBkYXRlQnJvd3NlclwiIHJlbD1cIm5vZm9sbG93XCIgaHJlZj1cImh0dHBzOi8vcGxheS5nb29nbGUuY29tL3N0b3JlL2FwcHMvZGV0YWlscz9pZD1jb20uYW5kcm9pZC5jaHJvbWVcIiBjbGFzcz1cIicgKyBhY3Rpb25CdXR0b25DbGFzcyArICdcIiA+JyArXG5cdFx0XHRcdFx0bWVzc2FnZXMuY2FsbFRvQWN0aW9uICtcblx0XHRcdFx0XHRcIjwvYT48L3A+XCIsXG5cdFx0XHRcdGFwcFN0b3JlOiBcIjxwIGNsYXNzPVxcXCJcIiArIGNvbnRlbnRDbGFzcyArIFwiXFxcIj5cIiArIG1lc3NhZ2VzLnVwZGF0ZVt1cGRhdGVTb3VyY2VdICsgXCI8L3A+XCJcblx0XHRcdH1cblx0XG5cdFx0XHR2YXIgdXBkYXRlTWVzc2FnZSA9IHVwZGF0ZU1lc3NhZ2VzW3VwZGF0ZVNvdXJjZV1cblx0XG5cdFx0XHR2YXIgYnJvd3NlclN1cHBvcnRNZXNzYWdlID0gbWVzc2FnZXMub3V0T2ZEYXRlO1xuXHRcdFx0aWYgKGlzQnJvd3NlclVuc3VwcG9ydGVkICYmIG1lc3NhZ2VzLnVuc3VwcG9ydGVkKSB7XG5cdFx0XHRcdGJyb3dzZXJTdXBwb3J0TWVzc2FnZSA9IG1lc3NhZ2VzLnVuc3VwcG9ydGVkO1xuXHRcdFx0fVxuXHRcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwidmVydGljYWwtY2VudGVyXCI+PGg2IGNsYXNzPVwiJyArIHRpdGxlQ2xhc3MgKyAnXCIgPicgK1xuXHRcdFx0XHRicm93c2VyU3VwcG9ydE1lc3NhZ2UgK1xuXHRcdFx0XHRcIjwvaDY+XCIgK1xuXHRcdFx0XHR1cGRhdGVNZXNzYWdlICtcblx0XHRcdFx0JzxwIGNsYXNzPVwibGFzdCAnICsgY2xvc2VCdXR0b25DbGFzcyArICdcIj48YSBocmVmPVwiI1wiIGlkPVwiYnV0dG9uQ2xvc2VVcGRhdGVCcm93c2VyXCIgdGl0bGU9XCInICtcblx0XHRcdFx0bWVzc2FnZXMuY2xvc2UgK1xuXHRcdFx0XHQnXCI+JnRpbWVzOzwvYT48L3A+PC9kaXY+J1xuXHRcdFx0KVxuXHRcdH1cblxuXHRcdHZhciByZXN1bHQgPSBldmFsdWF0ZUJyb3dzZXIocGFyc2VkVXNlckFnZW50LCBvcHRpb25zKTtcblx0XHRpZiAocmVzdWx0LmlzQW5kcm9pZEJ1dE5vdENocm9tZSB8fCByZXN1bHQuaXNCcm93c2VyT3V0T2ZEYXRlIHx8ICFyZXN1bHQuaXNQcm9wZXJ0eVN1cHBvcnRlZCkge1xuXHRcdFx0Ly8gVGhpcyBpcyBhbiBvdXRkYXRlZCBicm93c2VyIGFuZCB0aGUgYmFubmVyIG5lZWRzIHRvIHNob3dcblxuXHRcdFx0Ly8gU2V0IHRoaXMgZmxhZyB3aXRoIHRoZSByZXN1bHQgZm9yIGBnZXRNZXNzYWdlYFxuXHRcdFx0aXNCcm93c2VyVW5zdXBwb3J0ZWQgPSByZXN1bHQuaXNCcm93c2VyVW5zdXBwb3J0ZWRcblxuXHRcdFx0aWYgKGRvbmUgJiYgb3V0ZGF0ZWRVSS5zdHlsZS5vcGFjaXR5ICE9PSBcIjFcIikge1xuXHRcdFx0XHRkb25lID0gZmFsc2Vcblx0XG5cdFx0XHRcdGZvciAodmFyIG9wYWNpdHkgPSAxOyBvcGFjaXR5IDw9IDEwMDsgb3BhY2l0eSsrKSB7XG5cdFx0XHRcdFx0c2V0VGltZW91dChtYWtlRmFkZUluRnVuY3Rpb24ob3BhY2l0eSksIG9wYWNpdHkgKiA4KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFxuXHRcdFx0dmFyIGluc2VydENvbnRlbnRIZXJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdXRkYXRlZFwiKVxuXHRcdFx0aWYgKGZ1bGxzY3JlZW4pIHtcblx0XHRcdFx0aW5zZXJ0Q29udGVudEhlcmUuY2xhc3NMaXN0LmFkZChcImZ1bGxzY3JlZW5cIilcblx0XHRcdH1cblx0XHRcdGlmIChjdXN0b21DU1NDbGFzc2VzLndyYXBwZXJDbGFzcykge1xuXHRcdFx0XHRpbnNlcnRDb250ZW50SGVyZS5jbGFzc0xpc3QuYWRkKGN1c3RvbUNTU0NsYXNzZXMud3JhcHBlckNsYXNzKTtcblx0XHRcdH1cblx0XHRcdGluc2VydENvbnRlbnRIZXJlLmlubmVySFRNTCA9IGdldE1lc3NhZ2UobGFuZ3VhZ2UsIGxhbmd1YWdlcywgY3VzdG9tQ1NTQ2xhc3Nlcyk7XG5cdFx0XHRzdGFydFN0eWxlc0FuZEV2ZW50cygpXG5cdFx0fVxuXHR9XG5cblx0Ly8gTG9hZCBtYWluIHdoZW4gRE9NIHJlYWR5LlxuXHR2YXIgb2xkT25sb2FkID0gd2luZG93Lm9ubG9hZFxuXHRpZiAodHlwZW9mIHdpbmRvdy5vbmxvYWQgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdHdpbmRvdy5vbmxvYWQgPSBtYWluXG5cdH0gZWxzZSB7XG5cdFx0d2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKG9sZE9ubG9hZCkge1xuXHRcdFx0XHRvbGRPbmxvYWQoKVxuXHRcdFx0fVxuXHRcdFx0bWFpbigpXG5cdFx0fVxuXHR9XG5cblx0Ly8gTG9hZCBtYWluIHdoZW4gRE9NIHJlYWR5LlxuXHRpZiAob25sb2FkKSB7XG5cdFx0dmFyIG9sZE9ubG9hZCA9IHdpbmRvdy5vbmxvYWQ7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cub25sb2FkICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0ICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkgeyBtYWluKHVzZXJQcm92aWRlZE9wdGlvbnMpIH07XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdCAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChvbGRPbmxvYWQpIHtcblx0XHRcdCAgb2xkT25sb2FkKCk7XG5cdFx0XHR9XG5cdFx0XHRtYWluKHVzZXJQcm92aWRlZE9wdGlvbnMsb25sb2FkKTtcblx0XHQgIH07XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdG1haW4odXNlclByb3ZpZGVkT3B0aW9ucywgb25sb2FkKTtcblx0fVxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcImtvXCI6IHtcbiAgICBcIm91dE9mRGF0ZVwiOiBcIuy1nOyLoCDruIzrnbzsmrDsoIDqsIAg7JWE64uZ64uI64ukIVwiLFxuICAgIFwidXBkYXRlXCI6IHtcbiAgICAgIFwid2ViXCI6IFwi7Ju57IKs7J207Yq466W8IOygnOuMgOuhnCDrs7TroKTrqbQg67iM65287Jqw7KCA66W8IOyXheuNsOydtO2KuO2VmOyEuOyalC5cIixcbiAgICAgIFwiZ29vZ2xlUGxheVwiOiBcIkdvb2dsZSBQbGF57JeQ7IScIENocm9tZeydhCDshKTsuZjtlZjshLjsmpRcIixcbiAgICAgIFwiYXBwU3RvcmVcIjogXCLshKTsoJUg7JWx7JeQ7IScIGlPU+ulvCDsl4XrjbDsnbTtirjtlZjshLjsmpRcIlxuICAgIH0sXG4gICAgXCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG4gICAgXCJjYWxsVG9BY3Rpb25cIjogXCLsp4DquIgg67iM65287Jqw7KCAIOyXheuNsOydtO2KuO2VmOq4sFwiLFxuICAgIFwiY2xvc2VcIjogXCLri6vquLBcIlxuICB9LFxuICBcImphXCI6IHtcbiAgICBcIm91dE9mRGF0ZVwiOiBcIuWPpOOBhOODluODqeOCpuOCtuOCkuOBiuS9v+OBhOOBruOCiOOBhuOBp+OBmeOAglwiLFxuICAgIFwidXBkYXRlXCI6IHtcbiAgICAgIFwid2ViXCI6IFwi44Km44Kn44OW44K144Kk44OI44KS5q2j44GX44GP6KGo56S644Gn44GN44KL44KI44GG44Gr44CB44OW44Op44Km44K244KS44Ki44OD44OX44OH44O844OI44GX44Gm44GP44Gg44GV44GE44CCXCIsXG4gICAgICBcImdvb2dsZVBsYXlcIjogXCJHb29nbGUgUGxheeOBi+OCiUNocm9tZeOCkuOCpOODs+OCueODiOODvOODq+OBl+OBpuOBj+OBoOOBleOBhFwiLFxuICAgICAgXCJhcHBTdG9yZVwiOiBcIuioreWumuOBi+OCiWlPU+OCkuOCouODg+ODl+ODh+ODvOODiOOBl+OBpuOBj+OBoOOBleOBhFwiXG4gICAgfSxcbiAgICBcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcbiAgICBcImNhbGxUb0FjdGlvblwiOiBcIuS7iuOBmeOBkOODluODqeOCpuOCtuOCkuOCouODg+ODl+ODh+ODvOODiOOBmeOCi1wiLFxuICAgIFwiY2xvc2VcIjogXCLplonjgZjjgotcIlxuICB9LCBcblx0XCJiclwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJPIHNldSBuYXZlZ2Fkb3IgZXN0JmFhY3V0ZTsgZGVzYXR1YWxpemFkbyFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkF0dWFsaXplIG8gc2V1IG5hdmVnYWRvciBwYXJhIHRlciB1bWEgbWVsaG9yIGV4cGVyaSZlY2lyYztuY2lhIGUgdmlzdWFsaXphJmNjZWRpbDsmYXRpbGRlO28gZGVzdGUgc2l0ZS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIkF0dWFsaXplIG8gc2V1IG5hdmVnYWRvciBhZ29yYVwiLFxuXHRcdFwiY2xvc2VcIjogXCJGZWNoYXJcIlxuXHR9LFxuXHRcImNhXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIkVsIHZvc3RyZSBuYXZlZ2Fkb3Igbm8gZXN0w6AgYWN0dWFsaXR6YXQhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJBY3R1YWxpdHpldSBlbCB2b3N0cmUgbmF2ZWdhZG9yIHBlciB2ZXVyZSBjb3JyZWN0YW1lbnQgYXF1ZXN0IGxsb2Mgd2ViLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIkluc3RhbMK3bGV1IENocm9tZSBkZXMgZGUgR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJBY3R1YWxpdHpldSBpT1MgZGVzIGRlIGwnYXBsaWNhY2nDsyBDb25maWd1cmFjacOzXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiQWN0dWFsaXR6YXIgZWwgbWV1IG5hdmVnYWRvciBhcmFcIixcblx0XHRcImNsb3NlXCI6IFwiVGFuY2FyXCJcblx0fSxcblx0XCJ6aFwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCLmgqjnmoTmtY/op4jlmajlt7Lov4fml7ZcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIuimgeato+W4uOa1j+iniOacrOe9keermeivt+WNh+e6p+aCqOeahOa1j+iniOWZqOOAglwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCLnjrDlnKjljYfnuqdcIixcblx0XHRcImNsb3NlXCI6IFwi5YWz6ZetXCJcblx0fSxcblx0XCJjelwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJWw6HFoSBwcm9obMOtxb5lxI0gamUgemFzdGFyYWzDvSFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIlBybyBzcHLDoXZuw6kgem9icmF6ZW7DrSB0xJtjaHRvIHN0csOhbmVrIGFrdHVhbGl6dWp0ZSBzdsWvaiBwcm9obMOtxb5lxI0uIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiTmFpbnN0YWx1anRlIHNpIENocm9tZSB6IEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiQWt0dWFsaXp1anRlIHNpIHN5c3TDqW0gaU9TXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiQWt0dWFsaXpvdmF0IG55bsOtIHN2xa9qIHByb2hsw63FvmXEjVwiLFxuXHRcdFwiY2xvc2VcIjogXCJaYXbFmcOtdFwiXG5cdH0sXG5cdFwiZGFcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiRGluIGJyb3dzZXIgZXIgZm9yw6ZsZGV0IVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiT3BkYXTDqXIgZGluIGJyb3dzZXIgZm9yIGF0IGbDpSB2aXN0IGRlbm5lIGhqZW1tZXNpZGUga29ycmVrdC4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJJbnN0YWxsw6lyIHZlbmxpZ3N0IENocm9tZSBmcmEgR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJPcGRhdMOpciB2ZW5saWdzdCBpT1NcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJPcGRhdMOpciBkaW4gYnJvd3NlciBudVwiLFxuXHRcdFwiY2xvc2VcIjogXCJMdWtcIlxuXHR9LFxuXHRcImRlXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIklociBCcm93c2VyIGlzdCB2ZXJhbHRldCFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkJpdHRlIGFrdHVhbGlzaWVyZW4gU2llIElocmVuIEJyb3dzZXIsIHVtIGRpZXNlIFdlYnNpdGUga29ycmVrdCBkYXJ6dXN0ZWxsZW4uIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJEZW4gQnJvd3NlciBqZXR6dCBha3R1YWxpc2llcmVuIFwiLFxuXHRcdFwiY2xvc2VcIjogXCJTY2hsaWXDn2VuXCJcblx0fSxcblx0XCJlZVwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJTaW51IHZlZWJpbGVoaXRzZWphIG9uIHZhbmFuZW51ZCFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIlBhbHVuIHV1ZW5kYSBvbWEgdmVlYmlsZWhpdHNlamF0LCBldCBuw6RoYSBsZWhla8O8bGdlIGtvcnJla3RzZWx0LiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiVXVlbmRhIG9tYSB2ZWViaWxlaGl0c2VqYXQga29oZVwiLFxuXHRcdFwiY2xvc2VcIjogXCJTdWxnZVwiXG5cdH0sXG5cdFwiZW5cIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiWW91ciBicm93c2VyIGlzIG91dC1vZi1kYXRlIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiVXBkYXRlIHlvdXIgYnJvd3NlciB0byB2aWV3IHRoaXMgd2Vic2l0ZSBjb3JyZWN0bHkuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJVcGRhdGUgbXkgYnJvd3NlciBub3dcIixcblx0XHRcImNsb3NlXCI6IFwiQ2xvc2VcIlxuXHR9LFxuXHRcImVzXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIsKhVHUgbmF2ZWdhZG9yIGVzdMOhIGFudGljdWFkbyFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkFjdHVhbGl6YSB0dSBuYXZlZ2Fkb3IgcGFyYSB2ZXIgZXN0YSBww6FnaW5hIGNvcnJlY3RhbWVudGUuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJBY3R1YWxpemFyIG1pIG5hdmVnYWRvciBhaG9yYVwiLFxuXHRcdFwiY2xvc2VcIjogXCJDZXJyYXJcIlxuXHR9LFxuXHRcImZhXCI6IHtcblx0XHRcInJpZ2h0VG9MZWZ0XCI6IHRydWUsXG5cdFx0XCJvdXRPZkRhdGVcIjogXCLZhdix2YjYsdqv2LEg2LTZhdinINmF2YbYs9mI2K4g2LTYr9mHINin2LPYqiFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcItis2YfYqiDZhdi02KfZh9iv2Ycg2LXYrduM2K0g2KfbjNmGINmI2KjYs9in24zYqtiMINmF2LHZiNix2q/Ysdiq2KfZhiDYsdinINio2LHZiNiyINix2LPYp9mG24wg2YbZhdin24zbjNivLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwi2YfZhduM2YYg2K3Yp9mE2Kcg2YXYsdmI2LHar9ix2YUg2LHYpyDYqNix2YjYsiDaqdmGXCIsXG5cdFx0XCJjbG9zZVwiOiBcIkNsb3NlXCJcblx0fSxcblx0XCJmaVwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJTZWxhaW1lc2kgb24gdmFuaGVudHVudXQhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJMYXRhYSBhamFudGFzYWluZW4gc2VsYWluIG4mYXVtbDtoZCZhdW1sO2tzZXNpIHQmYXVtbDttJmF1bWw7biBzaXZ1biBvaWtlaW4uIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiQXNlbm5hIHV1c2luIENocm9tZSBHb29nbGUgUGxheSAta2F1cGFzdGFcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQw6Rpdml0w6QgaU9TIHB1aGVsaW1lc2kgYXNldHVrc2lzdGFcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJQJmF1bWw7aXZpdCZhdW1sOyBzZWxhaW1lbmkgbnl0IFwiLFxuXHRcdFwiY2xvc2VcIjogXCJTdWxqZVwiXG5cdH0sXG5cdFwiZnJcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiVm90cmUgbmF2aWdhdGV1ciBuJ2VzdCBwbHVzIGNvbXBhdGlibGUgIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiTWV0dGV6IMOgIGpvdXIgdm90cmUgbmF2aWdhdGV1ciBwb3VyIGFmZmljaGVyIGNvcnJlY3RlbWVudCBjZSBzaXRlIFdlYi4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJNZXJjaSBkJ2luc3RhbGxlciBDaHJvbWUgZGVwdWlzIGxlIEdvb2dsZSBQbGF5IFN0b3JlXCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiTWVyY2kgZGUgbWV0dHJlIMOgIGpvdXIgaU9TIGRlcHVpcyBsJ2FwcGxpY2F0aW9uIFLDqWdsYWdlc1wiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIk1ldHRyZSDDoCBqb3VyIG1haW50ZW5hbnQgXCIsXG5cdFx0XCJjbG9zZVwiOiBcIkZlcm1lclwiXG5cdH0sXG5cdFwiaHVcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiQSBiw7ZuZ8Opc3rFkWplIGVsYXZ1bHQhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJGaXJzc8OtdHNlIHZhZ3kgY3NlcsOpbGplIGxlIGEgYsO2bmfDqXN6xZFqw6l0LiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiQSBiw7ZuZ8Opc3rFkW0gZnJpc3PDrXTDqXNlIFwiLFxuXHRcdFwiY2xvc2VcIjogXCJDbG9zZVwiXG5cdH0sXG5cdFwiaWRcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiQnJvd3NlciB5YW5nIEFuZGEgZ3VuYWthbiBzdWRhaCBrZXRpbmdnYWxhbiB6YW1hbiFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIlBlcmJhaGFydWlsYWggYnJvd3NlciBBbmRhIGFnYXIgYmlzYSBtZW5qZWxhamFoaSB3ZWJzaXRlIGluaSBkZW5nYW4gbnlhbWFuLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiUGVyYmFoYXJ1aSBicm93c2VyIHNla2FyYW5nIFwiLFxuXHRcdFwiY2xvc2VcIjogXCJDbG9zZVwiXG5cdH0sXG5cdFwiaXRcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiSWwgdHVvIGJyb3dzZXIgbm9uICZlZ3JhdmU7IGFnZ2lvcm5hdG8hXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJBZ2dpb3JuYWxvIHBlciB2ZWRlcmUgcXVlc3RvIHNpdG8gY29ycmV0dGFtZW50ZS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIkFnZ2lvcm5hIG9yYVwiLFxuXHRcdFwiY2xvc2VcIjogXCJDaGl1ZGlcIlxuXHR9LFxuXHRcImx0XCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIkrFq3PFsyBuYXLFoXlrbMSXcyB2ZXJzaWphIHlyYSBwYXNlbnVzaSFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkF0bmF1amlua2l0ZSBzYXZvIG5hcsWheWtsxJksIGthZCBnYWzEl3R1bcSXdGUgcGVyxb5pxatyxJd0aSDFoWnEhSBzdmV0YWluxJkgdGlua2FtYWkuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJBdG5hdWppbnRpIG5hcsWheWtsxJkgXCIsXG5cdFx0XCJjbG9zZVwiOiBcIkNsb3NlXCJcblx0fSxcblx0XCJubFwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJKZSBnZWJydWlrdCBlZW4gb3VkZSBicm93c2VyIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiVXBkYXRlIGplIGJyb3dzZXIgb20gZGV6ZSB3ZWJzaXRlIGNvcnJlY3QgdGUgYmVraWprZW4uIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJVcGRhdGUgbWlqbiBicm93c2VyIG51IFwiLFxuXHRcdFwiY2xvc2VcIjogXCJTbHVpdGVuXCJcblx0fSxcblx0XCJwbFwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJUd29qYSBwcnplZ2zEhWRhcmthIGplc3QgcHJ6ZXN0YXJ6YcWCYSFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIlpha3R1YWxpenVqIHN3b2rEhSBwcnplZ2zEhWRhcmvEmSwgYWJ5IHBvcHJhd25pZSB3ecWbd2lldGxpxIcgdMSZIHN0cm9uxJkuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUHJvc3rEmSB6YWluc3RhbG93YcSHIHByemVnbMSFZGFya8SZIENocm9tZSB6ZSBza2xlcHUgR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQcm9zesSZIHpha3R1YWxpem93YcSHIGlPUyB6IFVzdGF3aWXFhFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIlpha3R1YWxpenVqIHByemVnbMSFZGFya8SZIGp1xbwgdGVyYXpcIixcblx0XHRcImNsb3NlXCI6IFwiWmFta25palwiXG5cdH0sXG5cdFwicHRcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiTyBzZXUgYnJvd3NlciBlc3QmYWFjdXRlOyBkZXNhdHVhbGl6YWRvIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiQXR1YWxpemUgbyBzZXUgYnJvd3NlciBwYXJhIHRlciB1bWEgbWVsaG9yIGV4cGVyaSZlY2lyYztuY2lhIGUgdmlzdWFsaXphJmNjZWRpbDsmYXRpbGRlO28gZGVzdGUgc2l0ZS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIkF0dWFsaXplIG8gc2V1IGJyb3dzZXIgYWdvcmFcIixcblx0XHRcImNsb3NlXCI6IFwiRmVjaGFyXCJcblx0fSxcblx0XCJyb1wiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJCcm93c2VydWwgZXN0ZSDDrm52ZWNoaXQhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJBY3R1YWxpemHIm2kgYnJvd3NlcnVsIHBlbnRydSBhIHZpenVhbGl6YSBjb3JlY3QgYWNlc3Qgc2l0ZS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIkFjdHVhbGl6YcibaSBicm93c2VydWwgYWN1bSFcIixcblx0XHRcImNsb3NlXCI6IFwiQ2xvc2VcIlxuXHR9LFxuXHRcInJ1XCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcItCS0LDRiCDQsdGA0LDRg9C30LXRgCDRg9GB0YLQsNGA0LXQuyFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcItCe0LHQvdC+0LLQuNGC0LUg0LLQsNGIINCx0YDQsNGD0LfQtdGAINC00LvRjyDQv9GA0LDQstC40LvRjNC90L7Qs9C+INC+0YLQvtCx0YDQsNC20LXQvdC40Y8g0Y3RgtC+0LPQviDRgdCw0LnRgtCwLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwi0J7QsdC90L7QstC40YLRjCDQvNC+0Lkg0LHRgNCw0YPQt9C10YAgXCIsXG5cdFx0XCJjbG9zZVwiOiBcItCX0LDQutGA0YvRgtGMXCJcblx0fSxcblx0XCJzaVwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJWYcWhIGJyc2thbG5payBqZSB6YXN0YXJlbCFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIlphIHByYXZpbGVuIHByaWtheiBzcGxldG5lIHN0cmFuaSBwb3NvZG9iaXRlIHZhxaEgYnJza2FsbmlrLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiUG9zb2RvYmkgYnJza2FsbmlrIFwiLFxuXHRcdFwiY2xvc2VcIjogXCJaYXByaVwiXG5cdH0sXG5cdFwic3ZcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiRGluIHdlYmJsw6RzYXJlIHN0w7ZkanMgZWogbMOkbmdyZSFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIlVwcGRhdGVyYSBkaW4gd2ViYmzDpHNhcmUgZsO2ciBhdHQgd2ViYnBsYXRzZW4gc2thIHZpc2FzIGtvcnJla3QuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJVcHBkYXRlcmEgbWluIHdlYmJsw6RzYXJlIG51XCIsXG5cdFx0XCJjbG9zZVwiOiBcIlN0w6RuZ1wiXG5cdH0sXG5cdFwidWFcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwi0JLQsNGIINCx0YDQsNGD0LfQtdGAINC30LDRgdGC0LDRgNGW0LIhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCLQntC90L7QstGW0YLRjCDQstCw0Ygg0LHRgNCw0YPQt9C10YAg0LTQu9GPINC/0YDQsNCy0LjQu9GM0L3QvtCz0L4g0LLRltC00L7QsdGA0LDQttC10L3QvdGPINGG0YzQvtCz0L4g0YHQsNC50YLQsC4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcItCe0L3QvtCy0LjRgtC4INC80ZbQuSDQsdGA0LDRg9C30LXRgCBcIixcblx0XHRcImNsb3NlXCI6IFwi0JfQsNC60YDQuNGC0LhcIlxuXHR9XG59XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8qIFVBUGFyc2VyLmpzIHYwLjcuMzFcbiAgIENvcHlyaWdodCDCqSAyMDEyLTIwMjEgRmFpc2FsIFNhbG1hbiA8ZkBmYWlzYWxtYW4uY29tPlxuICAgTUlUIExpY2Vuc2UgKi8vKlxuICAgRGV0ZWN0IEJyb3dzZXIsIEVuZ2luZSwgT1MsIENQVSwgYW5kIERldmljZSB0eXBlL21vZGVsIGZyb20gVXNlci1BZ2VudCBkYXRhLlxuICAgU3VwcG9ydHMgYnJvd3NlciAmIG5vZGUuanMgZW52aXJvbm1lbnQuIFxuICAgRGVtbyAgIDogaHR0cHM6Ly9mYWlzYWxtYW4uZ2l0aHViLmlvL3VhLXBhcnNlci1qc1xuICAgU291cmNlIDogaHR0cHM6Ly9naXRodWIuY29tL2ZhaXNhbG1hbi91YS1wYXJzZXItanMgKi9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgdW5kZWZpbmVkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLy8vLy8vLy8vLy8vL1xuICAgIC8vIENvbnN0YW50c1xuICAgIC8vLy8vLy8vLy8vLy9cblxuXG4gICAgdmFyIExJQlZFUlNJT04gID0gJzAuNy4zMScsXG4gICAgICAgIEVNUFRZICAgICAgID0gJycsXG4gICAgICAgIFVOS05PV04gICAgID0gJz8nLFxuICAgICAgICBGVU5DX1RZUEUgICA9ICdmdW5jdGlvbicsXG4gICAgICAgIFVOREVGX1RZUEUgID0gJ3VuZGVmaW5lZCcsXG4gICAgICAgIE9CSl9UWVBFICAgID0gJ29iamVjdCcsXG4gICAgICAgIFNUUl9UWVBFICAgID0gJ3N0cmluZycsXG4gICAgICAgIE1BSk9SICAgICAgID0gJ21ham9yJyxcbiAgICAgICAgTU9ERUwgICAgICAgPSAnbW9kZWwnLFxuICAgICAgICBOQU1FICAgICAgICA9ICduYW1lJyxcbiAgICAgICAgVFlQRSAgICAgICAgPSAndHlwZScsXG4gICAgICAgIFZFTkRPUiAgICAgID0gJ3ZlbmRvcicsXG4gICAgICAgIFZFUlNJT04gICAgID0gJ3ZlcnNpb24nLFxuICAgICAgICBBUkNISVRFQ1RVUkU9ICdhcmNoaXRlY3R1cmUnLFxuICAgICAgICBDT05TT0xFICAgICA9ICdjb25zb2xlJyxcbiAgICAgICAgTU9CSUxFICAgICAgPSAnbW9iaWxlJyxcbiAgICAgICAgVEFCTEVUICAgICAgPSAndGFibGV0JyxcbiAgICAgICAgU01BUlRUViAgICAgPSAnc21hcnR0dicsXG4gICAgICAgIFdFQVJBQkxFICAgID0gJ3dlYXJhYmxlJyxcbiAgICAgICAgRU1CRURERUQgICAgPSAnZW1iZWRkZWQnLFxuICAgICAgICBVQV9NQVhfTEVOR1RIID0gMjU1O1xuXG4gICAgdmFyIEFNQVpPTiAgPSAnQW1hem9uJyxcbiAgICAgICAgQVBQTEUgICA9ICdBcHBsZScsXG4gICAgICAgIEFTVVMgICAgPSAnQVNVUycsXG4gICAgICAgIEJMQUNLQkVSUlkgPSAnQmxhY2tCZXJyeScsXG4gICAgICAgIEJST1dTRVIgPSAnQnJvd3NlcicsXG4gICAgICAgIENIUk9NRSAgPSAnQ2hyb21lJyxcbiAgICAgICAgRURHRSAgICA9ICdFZGdlJyxcbiAgICAgICAgRklSRUZPWCA9ICdGaXJlZm94JyxcbiAgICAgICAgR09PR0xFICA9ICdHb29nbGUnLFxuICAgICAgICBIVUFXRUkgID0gJ0h1YXdlaScsXG4gICAgICAgIExHICAgICAgPSAnTEcnLFxuICAgICAgICBNSUNST1NPRlQgPSAnTWljcm9zb2Z0JyxcbiAgICAgICAgTU9UT1JPTEEgID0gJ01vdG9yb2xhJyxcbiAgICAgICAgT1BFUkEgICA9ICdPcGVyYScsXG4gICAgICAgIFNBTVNVTkcgPSAnU2Ftc3VuZycsXG4gICAgICAgIFNPTlkgICAgPSAnU29ueScsXG4gICAgICAgIFhJQU9NSSAgPSAnWGlhb21pJyxcbiAgICAgICAgWkVCUkEgICA9ICdaZWJyYScsXG4gICAgICAgIEZBQ0VCT09LICAgPSAnRmFjZWJvb2snO1xuXG4gICAgLy8vLy8vLy8vLy9cbiAgICAvLyBIZWxwZXJcbiAgICAvLy8vLy8vLy8vXG5cbiAgICB2YXIgZXh0ZW5kID0gZnVuY3Rpb24gKHJlZ2V4ZXMsIGV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgIHZhciBtZXJnZWRSZWdleGVzID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIHJlZ2V4ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9uc1tpXSAmJiBleHRlbnNpb25zW2ldLmxlbmd0aCAlIDIgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkUmVnZXhlc1tpXSA9IGV4dGVuc2lvbnNbaV0uY29uY2F0KHJlZ2V4ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFJlZ2V4ZXNbaV0gPSByZWdleGVzW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWRSZWdleGVzO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJpemUgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgICAgICB2YXIgZW51bXMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbnVtc1thcnJbaV0udG9VcHBlckNhc2UoKV0gPSBhcnJbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZW51bXM7XG4gICAgICAgIH0sXG4gICAgICAgIGhhcyA9IGZ1bmN0aW9uIChzdHIxLCBzdHIyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHN0cjEgPT09IFNUUl9UWVBFID8gbG93ZXJpemUoc3RyMikuaW5kZXhPZihsb3dlcml6ZShzdHIxKSkgIT09IC0xIDogZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIGxvd2VyaXplID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIHN0ci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9LFxuICAgICAgICBtYWpvcml6ZSA9IGZ1bmN0aW9uICh2ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mKHZlcnNpb24pID09PSBTVFJfVFlQRSA/IHZlcnNpb24ucmVwbGFjZSgvW15cXGRcXC5dL2csIEVNUFRZKS5zcGxpdCgnLicpWzBdIDogdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgICB0cmltID0gZnVuY3Rpb24gKHN0ciwgbGVuKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mKHN0cikgPT09IFNUUl9UWVBFKSB7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL15cXHNcXHMqLywgRU1QVFkpLnJlcGxhY2UoL1xcc1xccyokLywgRU1QVFkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YobGVuKSA9PT0gVU5ERUZfVFlQRSA/IHN0ciA6IHN0ci5zdWJzdHJpbmcoMCwgVUFfTUFYX0xFTkdUSCk7XG4gICAgICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIE1hcCBoZWxwZXJcbiAgICAvLy8vLy8vLy8vLy8vL1xuXG4gICAgdmFyIHJneE1hcHBlciA9IGZ1bmN0aW9uICh1YSwgYXJyYXlzKSB7XG5cbiAgICAgICAgICAgIHZhciBpID0gMCwgaiwgaywgcCwgcSwgbWF0Y2hlcywgbWF0Y2g7XG5cbiAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCBhbGwgcmVnZXhlcyBtYXBzXG4gICAgICAgICAgICB3aGlsZSAoaSA8IGFycmF5cy5sZW5ndGggJiYgIW1hdGNoZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciByZWdleCA9IGFycmF5c1tpXSwgICAgICAgLy8gZXZlbiBzZXF1ZW5jZSAoMCwyLDQsLi4pXG4gICAgICAgICAgICAgICAgICAgIHByb3BzID0gYXJyYXlzW2kgKyAxXTsgICAvLyBvZGQgc2VxdWVuY2UgKDEsMyw1LC4uKVxuICAgICAgICAgICAgICAgIGogPSBrID0gMDtcblxuICAgICAgICAgICAgICAgIC8vIHRyeSBtYXRjaGluZyB1YXN0cmluZyB3aXRoIHJlZ2V4ZXNcbiAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IHJlZ2V4Lmxlbmd0aCAmJiAhbWF0Y2hlcykge1xuXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXMgPSByZWdleFtqKytdLmV4ZWModWEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghIW1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAocCA9IDA7IHAgPCBwcm9wcy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoID0gbWF0Y2hlc1srK2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEgPSBwcm9wc1twXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBnaXZlbiBwcm9wZXJ0eSBpcyBhY3R1YWxseSBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcSA9PT0gT0JKX1RZUEUgJiYgcS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBxWzFdID09IEZVTkNfVFlQRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBtb2RpZmllZCBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcVswXV0gPSBxWzFdLmNhbGwodGhpcywgbWF0Y2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gZ2l2ZW4gdmFsdWUsIGlnbm9yZSByZWdleCBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcVswXV0gPSBxWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHEubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB3aGV0aGVyIGZ1bmN0aW9uIG9yIHJlZ2V4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHFbMV0gPT09IEZVTkNfVFlQRSAmJiAhKHFbMV0uZXhlYyAmJiBxWzFdLnRlc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsbCBmdW5jdGlvbiAodXN1YWxseSBzdHJpbmcgbWFwcGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcVswXV0gPSBtYXRjaCA/IHFbMV0uY2FsbCh0aGlzLCBtYXRjaCwgcVsyXSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhbml0aXplIG1hdGNoIHVzaW5nIGdpdmVuIHJlZ2V4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IG1hdGNoID8gbWF0Y2gucmVwbGFjZShxWzFdLCBxWzJdKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChxLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcVswXV0gPSBtYXRjaCA/IHFbM10uY2FsbCh0aGlzLCBtYXRjaC5yZXBsYWNlKHFbMV0sIHFbMl0pKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcV0gPSBtYXRjaCA/IG1hdGNoIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RyTWFwcGVyID0gZnVuY3Rpb24gKHN0ciwgbWFwKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgY3VycmVudCB2YWx1ZSBpcyBhcnJheVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWFwW2ldID09PSBPQkpfVFlQRSAmJiBtYXBbaV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hcFtpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhcyhtYXBbaV1bal0sIHN0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGkgPT09IFVOS05PV04pID8gdW5kZWZpbmVkIDogaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzKG1hcFtpXSwgc3RyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGkgPT09IFVOS05PV04pID8gdW5kZWZpbmVkIDogaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgIH07XG5cbiAgICAvLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBTdHJpbmcgbWFwXG4gICAgLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIFNhZmFyaSA8IDMuMFxuICAgIHZhciBvbGRTYWZhcmlNYXAgPSB7XG4gICAgICAgICAgICAnMS4wJyAgIDogJy84JyxcbiAgICAgICAgICAgICcxLjInICAgOiAnLzEnLFxuICAgICAgICAgICAgJzEuMycgICA6ICcvMycsXG4gICAgICAgICAgICAnMi4wJyAgIDogJy80MTInLFxuICAgICAgICAgICAgJzIuMC4yJyA6ICcvNDE2JyxcbiAgICAgICAgICAgICcyLjAuMycgOiAnLzQxNycsXG4gICAgICAgICAgICAnMi4wLjQnIDogJy80MTknLFxuICAgICAgICAgICAgJz8nICAgICA6ICcvJ1xuICAgICAgICB9LFxuICAgICAgICB3aW5kb3dzVmVyc2lvbk1hcCA9IHtcbiAgICAgICAgICAgICdNRScgICAgICAgIDogJzQuOTAnLFxuICAgICAgICAgICAgJ05UIDMuMTEnICAgOiAnTlQzLjUxJyxcbiAgICAgICAgICAgICdOVCA0LjAnICAgIDogJ05UNC4wJyxcbiAgICAgICAgICAgICcyMDAwJyAgICAgIDogJ05UIDUuMCcsXG4gICAgICAgICAgICAnWFAnICAgICAgICA6IFsnTlQgNS4xJywgJ05UIDUuMiddLFxuICAgICAgICAgICAgJ1Zpc3RhJyAgICAgOiAnTlQgNi4wJyxcbiAgICAgICAgICAgICc3JyAgICAgICAgIDogJ05UIDYuMScsXG4gICAgICAgICAgICAnOCcgICAgICAgICA6ICdOVCA2LjInLFxuICAgICAgICAgICAgJzguMScgICAgICAgOiAnTlQgNi4zJyxcbiAgICAgICAgICAgICcxMCcgICAgICAgIDogWydOVCA2LjQnLCAnTlQgMTAuMCddLFxuICAgICAgICAgICAgJ1JUJyAgICAgICAgOiAnQVJNJ1xuICAgIH07XG5cbiAgICAvLy8vLy8vLy8vLy8vL1xuICAgIC8vIFJlZ2V4IG1hcFxuICAgIC8vLy8vLy8vLy8vLy9cblxuICAgIHZhciByZWdleGVzID0ge1xuXG4gICAgICAgIGJyb3dzZXIgOiBbW1xuXG4gICAgICAgICAgICAvXFxiKD86Y3Jtb3xjcmlvcylcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWUgZm9yIEFuZHJvaWQvaU9TXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdDaHJvbWUnXV0sIFtcbiAgICAgICAgICAgIC9lZGcoPzplfGlvc3xhKT9cXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWljcm9zb2Z0IEVkZ2VcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0VkZ2UnXV0sIFtcblxuICAgICAgICAgICAgLy8gUHJlc3RvIGJhc2VkXG4gICAgICAgICAgICAvKG9wZXJhIG1pbmkpXFwvKFstXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIE1pbmlcbiAgICAgICAgICAgIC8ob3BlcmEgW21vYmlsZXRhYl17Myw2fSlcXGIuK3ZlcnNpb25cXC8oWy1cXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgIC8vIE9wZXJhIE1vYmkvVGFibGV0XG4gICAgICAgICAgICAvKG9wZXJhKSg/Oi4rdmVyc2lvblxcL3xbXFwvIF0rKShbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvb3Bpb3NbXFwvIF0rKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIG1pbmkgb24gaXBob25lID49IDguMFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBPUEVSQSsnIE1pbmknXV0sIFtcbiAgICAgICAgICAgIC9cXGJvcHJcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIFdlYmtpdFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBPUEVSQV1dLCBbXG5cbiAgICAgICAgICAgIC8vIE1peGVkXG4gICAgICAgICAgICAvKGtpbmRsZSlcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtpbmRsZVxuICAgICAgICAgICAgLyhsdW5hc2NhcGV8bWF4dGhvbnxuZXRmcm9udHxqYXNtaW5lfGJsYXplcilbXFwvIF0/KFtcXHdcXC5dKikvaSwgICAgICAvLyBMdW5hc2NhcGUvTWF4dGhvbi9OZXRmcm9udC9KYXNtaW5lL0JsYXplclxuICAgICAgICAgICAgLy8gVHJpZGVudCBiYXNlZFxuICAgICAgICAgICAgLyhhdmFudCB8aWVtb2JpbGV8c2xpbSkoPzpicm93c2VyKT9bXFwvIF0/KFtcXHdcXC5dKikvaSwgICAgICAgICAgICAgICAvLyBBdmFudC9JRU1vYmlsZS9TbGltQnJvd3NlclxuICAgICAgICAgICAgLyhiYT9pZHVicm93c2VyKVtcXC8gXT8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCYWlkdSBCcm93c2VyXG4gICAgICAgICAgICAvKD86bXN8XFwoKShpZSkgKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEludGVybmV0IEV4cGxvcmVyXG5cbiAgICAgICAgICAgIC8vIFdlYmtpdC9LSFRNTCBiYXNlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvY2svUm9ja01lbHQvTWlkb3JpL0VwaXBoYW55L1NpbGsvU2t5ZmlyZS9Cb2x0L0lyb24vSXJpZGl1bS9QaGFudG9tSlMvQm93c2VyL1F1cFppbGxhL0ZhbGtvblxuICAgICAgICAgICAgLyhmbG9ja3xyb2NrbWVsdHxtaWRvcml8ZXBpcGhhbnl8c2lsa3xza3lmaXJlfG92aWJyb3dzZXJ8Ym9sdHxpcm9ufHZpdmFsZGl8aXJpZGl1bXxwaGFudG9tanN8Ym93c2VyfHF1YXJrfHF1cHppbGxhfGZhbGtvbnxyZWtvbnF8cHVmZmlufGJyYXZlfHdoYWxlfHFxYnJvd3NlcmxpdGV8cXEpXFwvKFstXFx3XFwuXSspL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJla29ucS9QdWZmaW4vQnJhdmUvV2hhbGUvUVFCcm93c2VyTGl0ZS9RUSwgYWthIFNob3VRXG4gICAgICAgICAgICAvKHdlaWJvKV9fKFtcXGRcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2VpYm9cbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLyg/OlxcYnVjPyA/YnJvd3NlcnwoPzpqdWMuKyl1Y3dlYilbXFwvIF0/KFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgLy8gVUNCcm93c2VyXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdVQycrQlJPV1NFUl1dLCBbXG4gICAgICAgICAgICAvXFxicWJjb3JlXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZUNoYXQgRGVza3RvcCBmb3IgV2luZG93cyBCdWlsdC1pbiBCcm93c2VyXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdXZUNoYXQoV2luKSBEZXNrdG9wJ11dLCBbXG4gICAgICAgICAgICAvbWljcm9tZXNzZW5nZXJcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlQ2hhdFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnV2VDaGF0J11dLCBbXG4gICAgICAgICAgICAva29ucXVlcm9yXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtvbnF1ZXJvclxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnS29ucXVlcm9yJ11dLCBbXG4gICAgICAgICAgICAvdHJpZGVudC4rcnZbOiBdKFtcXHdcXC5dezEsOX0pXFxiLitsaWtlIGdlY2tvL2kgICAgICAgICAgICAgICAgICAgICAgIC8vIElFMTFcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0lFJ11dLCBbXG4gICAgICAgICAgICAveWFicm93c2VyXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFlhbmRleFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnWWFuZGV4J11dLCBbXG4gICAgICAgICAgICAvKGF2YXN0fGF2ZylcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEF2YXN0L0FWRyBTZWN1cmUgQnJvd3NlclxuICAgICAgICAgICAgXSwgW1tOQU1FLCAvKC4rKS8sICckMSBTZWN1cmUgJytCUk9XU0VSXSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9cXGJmb2N1c1xcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggRm9jdXNcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgRklSRUZPWCsnIEZvY3VzJ11dLCBbXG4gICAgICAgICAgICAvXFxib3B0XFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSBUb3VjaFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBPUEVSQSsnIFRvdWNoJ11dLCBbXG4gICAgICAgICAgICAvY29jX2NvY1xcdytcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb2MgQ29jIEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0NvYyBDb2MnXV0sIFtcbiAgICAgICAgICAgIC9kb2xmaW5cXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9scGhpblxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnRG9scGhpbiddXSwgW1xuICAgICAgICAgICAgL2NvYXN0XFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSBDb2FzdFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBPUEVSQSsnIENvYXN0J11dLCBbXG4gICAgICAgICAgICAvbWl1aWJyb3dzZXJcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1JVUkgQnJvd3NlclxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnTUlVSSAnK0JST1dTRVJdXSwgW1xuICAgICAgICAgICAgL2Z4aW9zXFwvKFstXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94IGZvciBpT1NcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgRklSRUZPWF1dLCBbXG4gICAgICAgICAgICAvXFxicWlodXwocWk/aG8/bz98MzYwKWJyb3dzZXIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAzNjBcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJzM2MCAnK0JST1dTRVJdXSwgW1xuICAgICAgICAgICAgLyhvY3VsdXN8c2Ftc3VuZ3xzYWlsZmlzaClicm93c2VyXFwvKFtcXHdcXC5dKykvaVxuICAgICAgICAgICAgXSwgW1tOQU1FLCAvKC4rKS8sICckMSAnK0JST1dTRVJdLCBWRVJTSU9OXSwgWyAgICAgICAgICAgICAgICAgICAgICAvLyBPY3VsdXMvU2Ftc3VuZy9TYWlsZmlzaCBCcm93c2VyXG4gICAgICAgICAgICAvKGNvbW9kb19kcmFnb24pXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW9kbyBEcmFnb25cbiAgICAgICAgICAgIF0sIFtbTkFNRSwgL18vZywgJyAnXSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8oZWxlY3Ryb24pXFwvKFtcXHdcXC5dKykgc2FmYXJpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRWxlY3Ryb24tYmFzZWQgQXBwXG4gICAgICAgICAgICAvKHRlc2xhKSg/OiBxdGNhcmJyb3dzZXJ8XFwvKDIwXFxkXFxkXFwuWy1cXHdcXC5dKykpL2ksICAgICAgICAgICAgICAgICAgIC8vIFRlc2xhXG4gICAgICAgICAgICAvbT8ocXFicm93c2VyfGJhaWR1Ym94YXBwfDIzNDVFeHBsb3JlcilbXFwvIF0/KFtcXHdcXC5dKykvaSAgICAgICAgICAgIC8vIFFRQnJvd3Nlci9CYWlkdSBBcHAvMjM0NSBCcm93c2VyXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8obWV0YXNyKVtcXC8gXT8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU291R291QnJvd3NlclxuICAgICAgICAgICAgLyhsYmJyb3dzZXIpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMaWVCYW8gQnJvd3NlclxuICAgICAgICAgICAgXSwgW05BTUVdLCBbXG5cbiAgICAgICAgICAgIC8vIFdlYlZpZXdcbiAgICAgICAgICAgIC8oKD86ZmJhblxcL2ZiaW9zfGZiX2lhYlxcL2ZiNGEpKD8hLitmYmF2KXw7ZmJhdlxcLyhbXFx3XFwuXSspOykvaSAgICAgICAvLyBGYWNlYm9vayBBcHAgZm9yIGlPUyAmIEFuZHJvaWRcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgRkFDRUJPT0tdLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL3NhZmFyaSAobGluZSlcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMaW5lIEFwcCBmb3IgaU9TXG4gICAgICAgICAgICAvXFxiKGxpbmUpXFwvKFtcXHdcXC5dKylcXC9pYWIvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGluZSBBcHAgZm9yIEFuZHJvaWRcbiAgICAgICAgICAgIC8oY2hyb21pdW18aW5zdGFncmFtKVtcXC8gXShbLVxcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21pdW0vSW5zdGFncmFtXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9cXGJnc2FcXC8oW1xcd1xcLl0rKSAuKnNhZmFyaVxcLy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgU2VhcmNoIEFwcGxpYW5jZSBvbiBpT1NcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0dTQSddXSwgW1xuXG4gICAgICAgICAgICAvaGVhZGxlc3NjaHJvbWUoPzpcXC8oW1xcd1xcLl0rKXwgKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZSBIZWFkbGVzc1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBDSFJPTUUrJyBIZWFkbGVzcyddXSwgW1xuXG4gICAgICAgICAgICAvIHd2XFwpLisoY2hyb21lKVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWUgV2ViVmlld1xuICAgICAgICAgICAgXSwgW1tOQU1FLCBDSFJPTUUrJyBXZWJWaWV3J10sIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC9kcm9pZC4rIHZlcnNpb25cXC8oW1xcd1xcLl0rKVxcYi4rKD86bW9iaWxlIHNhZmFyaXxzYWZhcmkpL2kgICAgICAgICAgIC8vIEFuZHJvaWQgQnJvd3NlclxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnQW5kcm9pZCAnK0JST1dTRVJdXSwgW1xuXG4gICAgICAgICAgICAvKGNocm9tZXxvbW5pd2VifGFyb3JhfFt0aXplbm9rYV17NX0gP2Jyb3dzZXIpXFwvdj8oW1xcd1xcLl0rKS9pICAgICAgIC8vIENocm9tZS9PbW5pV2ViL0Fyb3JhL1RpemVuL05va2lhXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgL3ZlcnNpb25cXC8oW1xcd1xcLl0rKSAuKm1vYmlsZVxcL1xcdysgKHNhZmFyaSkvaSAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1vYmlsZSBTYWZhcmlcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ01vYmlsZSBTYWZhcmknXV0sIFtcbiAgICAgICAgICAgIC92ZXJzaW9uXFwvKFtcXHdcXC5dKykgLioobW9iaWxlID9zYWZhcml8c2FmYXJpKS9pICAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpICYgU2FmYXJpIE1vYmlsZVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIE5BTUVdLCBbXG4gICAgICAgICAgICAvd2Via2l0Lis/KG1vYmlsZSA/c2FmYXJpfHNhZmFyaSkoXFwvW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgIC8vIFNhZmFyaSA8IDMuMFxuICAgICAgICAgICAgXSwgW05BTUUsIFtWRVJTSU9OLCBzdHJNYXBwZXIsIG9sZFNhZmFyaU1hcF1dLCBbXG5cbiAgICAgICAgICAgIC8od2Via2l0fGtodG1sKVxcLyhbXFx3XFwuXSspL2lcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvLyBHZWNrbyBiYXNlZFxuICAgICAgICAgICAgLyhuYXZpZ2F0b3J8bmV0c2NhcGVcXGQ/KVxcLyhbLVxcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmV0c2NhcGVcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ05ldHNjYXBlJ10sIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvbW9iaWxlIHZyOyBydjooW1xcd1xcLl0rKVxcKS4rZmlyZWZveC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggUmVhbGl0eVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBGSVJFRk9YKycgUmVhbGl0eSddXSwgW1xuICAgICAgICAgICAgL2VraW9oZi4rKGZsb3cpXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG93XG4gICAgICAgICAgICAvKHN3aWZ0Zm94KS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN3aWZ0Zm94XG4gICAgICAgICAgICAvKGljZWRyYWdvbnxpY2V3ZWFzZWx8Y2FtaW5vfGNoaW1lcmF8ZmVubmVjfG1hZW1vIGJyb3dzZXJ8bWluaW1vfGNvbmtlcm9yfGtsYXIpW1xcLyBdPyhbXFx3XFwuXFwrXSspL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEljZURyYWdvbi9JY2V3ZWFzZWwvQ2FtaW5vL0NoaW1lcmEvRmVubmVjL01hZW1vL01pbmltby9Db25rZXJvci9LbGFyXG4gICAgICAgICAgICAvKHNlYW1vbmtleXxrLW1lbGVvbnxpY2VjYXR8aWNlYXBlfGZpcmViaXJkfHBob2VuaXh8cGFsZW1vb258YmFzaWxpc2t8d2F0ZXJmb3gpXFwvKFstXFx3XFwuXSspJC9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94L1NlYU1vbmtleS9LLU1lbGVvbi9JY2VDYXQvSWNlQXBlL0ZpcmViaXJkL1Bob2VuaXhcbiAgICAgICAgICAgIC8oZmlyZWZveClcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXIgRmlyZWZveC1iYXNlZFxuICAgICAgICAgICAgLyhtb3ppbGxhKVxcLyhbXFx3XFwuXSspIC4rcnZcXDouK2dlY2tvXFwvXFxkKy9pLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNb3ppbGxhXG5cbiAgICAgICAgICAgIC8vIE90aGVyXG4gICAgICAgICAgICAvKHBvbGFyaXN8bHlueHxkaWxsb3xpY2FifGRvcmlzfGFtYXlhfHczbXxuZXRzdXJmfHNsZWlwbmlyfG9iaWdvfG1vc2FpY3woPzpnb3xpY2V8dXApW1xcLiBdP2Jyb3dzZXIpWy1cXC8gXT92PyhbXFx3XFwuXSspL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBvbGFyaXMvTHlueC9EaWxsby9pQ2FiL0RvcmlzL0FtYXlhL3czbS9OZXRTdXJmL1NsZWlwbmlyL09iaWdvL01vc2FpYy9Hby9JQ0UvVVAuQnJvd3NlclxuICAgICAgICAgICAgLyhsaW5rcykgXFwoKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMaW5rc1xuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dXG4gICAgICAgIF0sXG5cbiAgICAgICAgY3B1IDogW1tcblxuICAgICAgICAgICAgLyg/OihhbWR8eCg/Oig/Ojg2fDY0KVstX10pP3x3b3d8d2luKTY0KVs7XFwpXS9pICAgICAgICAgICAgICAgICAgICAgLy8gQU1ENjQgKHg2NClcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnYW1kNjQnXV0sIFtcblxuICAgICAgICAgICAgLyhpYTMyKD89OykpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJQTMyIChxdWlja3RpbWUpXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgbG93ZXJpemVdXSwgW1xuXG4gICAgICAgICAgICAvKCg/OmlbMzQ2XXx4KTg2KVs7XFwpXS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJQTMyICh4ODYpXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgJ2lhMzInXV0sIFtcblxuICAgICAgICAgICAgL1xcYihhYXJjaDY0fGFybSh2PzhlP2w/fF8/NjQpKVxcYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQVJNNjRcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnYXJtNjQnXV0sIFtcblxuICAgICAgICAgICAgL1xcYihhcm0oPzp2WzY3XSk/aHQ/bj9bZmxdcD8pXFxiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFSTUhGXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgJ2FybWhmJ11dLCBbXG5cbiAgICAgICAgICAgIC8vIFBvY2tldFBDIG1pc3Rha2VubHkgaWRlbnRpZmllZCBhcyBQb3dlclBDXG4gICAgICAgICAgICAvd2luZG93cyAoY2V8bW9iaWxlKTsgcHBjOy9pXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgJ2FybSddXSwgW1xuXG4gICAgICAgICAgICAvKCg/OnBwY3xwb3dlcnBjKSg/OjY0KT8pKD86IG1hY3w7fFxcKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQb3dlclBDXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgL293ZXIvLCBFTVBUWSwgbG93ZXJpemVdXSwgW1xuXG4gICAgICAgICAgICAvKHN1bjRcXHcpWztcXCldL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU1BBUkNcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnc3BhcmMnXV0sIFtcblxuICAgICAgICAgICAgLygoPzphdnIzMnxpYTY0KD89OykpfDY4ayg/PVxcKSl8XFxiYXJtKD89dig/OlsxLTddfFs1LTddMSlsP3w7fGVhYmkpfCg/PWF0bWVsIClhdnJ8KD86aXJpeHxtaXBzfHNwYXJjKSg/OjY0KT9cXGJ8cGEtcmlzYykvaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJQTY0LCA2OEssIEFSTS82NCwgQVZSLzMyLCBJUklYLzY0LCBNSVBTLzY0LCBTUEFSQy82NCwgUEEtUklTQ1xuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsIGxvd2VyaXplXV1cbiAgICAgICAgXSxcblxuICAgICAgICBkZXZpY2UgOiBbW1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICAgICAgLy8gTU9CSUxFUyAmIFRBQkxFVFNcbiAgICAgICAgICAgIC8vIE9yZGVyZWQgYnkgcG9wdWxhcml0eVxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvLyBTYW1zdW5nXG4gICAgICAgICAgICAvXFxiKHNjaC1pWzg5XTBcXGR8c2h3LW0zODBzfHNtLVtwdF1cXHd7Miw0fXxndC1bcG5dXFxkezIsNH18c2doLXQ4WzU2XTl8bmV4dXMgMTApL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgU0FNU1VOR10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYigoPzpzW2NncF1ofGd0fHNtKS1cXHcrfGdhbGF4eSBuZXh1cykvaSxcbiAgICAgICAgICAgIC9zYW1zdW5nWy0gXShbLVxcd10rKS9pLFxuICAgICAgICAgICAgL3NlYy0oc2doXFx3KykvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBTQU1TVU5HXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEFwcGxlXG4gICAgICAgICAgICAvXFwoKGlwKD86aG9uZXxvZClbXFx3IF0qKTsvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaVBvZC9pUGhvbmVcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQVBQTEVdLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXCgoaXBhZCk7Wy1cXHdcXCksOyBdK2FwcGxlL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaVBhZFxuICAgICAgICAgICAgL2FwcGxlY29yZW1lZGlhXFwvW1xcd1xcLl0rIFxcKChpcGFkKS9pLFxuICAgICAgICAgICAgL1xcYihpcGFkKVxcZFxcZD8sXFxkXFxkP1s7XFxdXS4raW9zL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQVBQTEVdLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLy8gSHVhd2VpXG4gICAgICAgICAgICAvXFxiKCg/OmFnW3JzXVsyM10/fGJhaDI/fHNodD98YnR2KS1hP1tsd11cXGR7Mn0pXFxiKD8hLitkXFwvcykvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBIVUFXRUldLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oPzpodWF3ZWl8aG9ub3IpKFstXFx3IF0rKVs7XFwpXS9pLFxuICAgICAgICAgICAgL1xcYihuZXh1cyA2cHxcXHd7Miw0fS1bYXR1XT9bbG5dWzAxMjU5eF1bMDEyMzU5XVthbl0/KVxcYig/IS4rZFxcL3MpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgSFVBV0VJXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIFhpYW9taVxuICAgICAgICAgICAgL1xcYihwb2NvW1xcdyBdKykoPzogYnVpfFxcKSkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBYaWFvbWkgUE9DT1xuICAgICAgICAgICAgL1xcYjsgKFxcdyspIGJ1aWxkXFwvaG1cXDEvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWGlhb21pIEhvbmdtaSAnbnVtZXJpYycgbW9kZWxzXG4gICAgICAgICAgICAvXFxiKGhtWy1fIF0/bm90ZT9bXyBdPyg/OlxcZFxcdyk/KSBidWkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFhpYW9taSBIb25nbWlcbiAgICAgICAgICAgIC9cXGIocmVkbWlbXFwtXyBdPyg/Om5vdGV8ayk/W1xcd18gXSspKD86IGJ1aXxcXCkpL2ksICAgICAgICAgICAgICAgICAgIC8vIFhpYW9taSBSZWRtaVxuICAgICAgICAgICAgL1xcYihtaVstXyBdPyg/OmFcXGR8b25lfG9uZVtfIF1wbHVzfG5vdGUgbHRlfG1heCk/W18gXT8oPzpcXGQ/XFx3PylbXyBdPyg/OnBsdXN8c2V8bGl0ZSk/KSg/OiBidWl8XFwpKS9pIC8vIFhpYW9taSBNaVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgL18vZywgJyAnXSwgW1ZFTkRPUiwgWElBT01JXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKG1pWy1fIF0/KD86cGFkKSg/OltcXHdfIF0rKSkoPzogYnVpfFxcKSkvaSAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pIFBhZCB0YWJsZXRzXG4gICAgICAgICAgICBdLFtbTU9ERUwsIC9fL2csICcgJ10sIFtWRU5ET1IsIFhJQU9NSV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBPUFBPXG4gICAgICAgICAgICAvOyAoXFx3KykgYnVpLisgb3Bwby9pLFxuICAgICAgICAgICAgL1xcYihjcGhbMTJdXFxkezN9fHAoPzphZnxjW2FsXXxkXFx3fGVbYXJdKVttdF1cXGQwfHg5MDA3fGExMDFvcClcXGIvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnT1BQTyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gVml2b1xuICAgICAgICAgICAgL3Zpdm8gKFxcdyspKD86IGJ1aXxcXCkpL2ksXG4gICAgICAgICAgICAvXFxiKHZbMTJdXFxkezN9XFx3P1thdF0pKD86IGJ1aXw7KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdWaXZvJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBSZWFsbWVcbiAgICAgICAgICAgIC9cXGIocm14WzEyXVxcZHszfSkoPzogYnVpfDt8XFwpKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdSZWFsbWUnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIE1vdG9yb2xhXG4gICAgICAgICAgICAvXFxiKG1pbGVzdG9uZXxkcm9pZCg/OlsyLTR4XXwgKD86YmlvbmljfHgyfHByb3xyYXpyKSk/Oj8oIDRnKT8pXFxiW1xcdyBdK2J1aWxkXFwvL2ksXG4gICAgICAgICAgICAvXFxibW90KD86b3JvbGEpP1stIF0oXFx3KikvaSxcbiAgICAgICAgICAgIC8oKD86bW90b1tcXHdcXChcXCkgXSt8eHRcXGR7Myw0fXxuZXh1cyA2KSg/PSBidWl8XFwpKSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBNT1RPUk9MQV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYihtejYwXFxkfHhvb21bMiBdezAsMn0pIGJ1aWxkXFwvL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgTU9UT1JPTEFdLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLy8gTEdcbiAgICAgICAgICAgIC8oKD89bGcpP1t2bF1rXFwtP1xcZHszfSkgYnVpfCAzXFwuWy1cXHc7IF17MTB9bGc/LShbMDZjdjldezMsNH0pL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgTEddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8obG0oPzotP2YxMDBbbnZdP3wtW1xcd1xcLl0rKSg/PSBidWl8XFwpKXxuZXh1cyBbNDVdKS9pLFxuICAgICAgICAgICAgL1xcYmxnWy1lO1xcLyBdKygoPyFicm93c2VyfG5ldGNhc3R8YW5kcm9pZCB0dilcXHcrKS9pLFxuICAgICAgICAgICAgL1xcYmxnLT8oW1xcZFxcd10rKSBidWkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBMR10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBMZW5vdm9cbiAgICAgICAgICAgIC8oaWRlYXRhYlstXFx3IF0rKS9pLFxuICAgICAgICAgICAgL2xlbm92byA/KHNbNTZdMDAwWy1cXHddK3x0YWIoPzpbXFx3IF0rKXx5dFstXFxkXFx3XXs2fXx0YlstXFxkXFx3XXs2fSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTGVub3ZvJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBOb2tpYVxuICAgICAgICAgICAgLyg/Om1hZW1vfG5va2lhKS4qKG45MDB8bHVtaWEgXFxkKykvaSxcbiAgICAgICAgICAgIC9ub2tpYVstXyBdPyhbLVxcd1xcLl0qKS9pXG4gICAgICAgICAgICBdLCBbW01PREVMLCAvXy9nLCAnICddLCBbVkVORE9SLCAnTm9raWEnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEdvb2dsZVxuICAgICAgICAgICAgLyhwaXhlbCBjKVxcYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIFBpeGVsIENcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKHBpeGVsW1xcZGF4bCBdezAsNn0pKD86IGJ1aXxcXCkpL2kgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIFBpeGVsXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEdPT0dMRV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBTb255XG4gICAgICAgICAgICAvZHJvaWQuKyAoW2MtZ11cXGR7NH18c29bLWdsXVxcdyt8eHEtYVxcd1s0LTddWzEyXSkoPz0gYnVpfFxcKS4rY2hyb21lXFwvKD8hWzEtNl17MCwxfVxcZFxcLikpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgU09OWV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL3NvbnkgdGFibGV0IFtwc10vaSxcbiAgICAgICAgICAgIC9cXGIoPzpzb255KT9zZ3BcXHcrKD86IGJ1aXxcXCkpL2lcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdYcGVyaWEgVGFibGV0J10sIFtWRU5ET1IsIFNPTlldLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLy8gT25lUGx1c1xuICAgICAgICAgICAgLyAoa2IyMDA1fGluMjBbMTJdNXxiZTIwWzEyXVs1OV0pXFxiL2ksXG4gICAgICAgICAgICAvKD86b25lKT8oPzpwbHVzKT8gKGFcXGQwXFxkXFxkKSg/OiBifFxcKSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnT25lUGx1cyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gQW1hem9uXG4gICAgICAgICAgICAvKGFsZXhhKXdlYm0vaSxcbiAgICAgICAgICAgIC8oa2ZbYS16XXsyfXdpKSggYnVpfFxcKSkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtpbmRsZSBGaXJlIHdpdGhvdXQgU2lsa1xuICAgICAgICAgICAgLyhrZlthLXpdKykoIGJ1aXxcXCkpLitzaWxrXFwvL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtpbmRsZSBGaXJlIEhEXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEFNQVpPTl0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLygoPzpzZHxrZilbMDM0OWhpam9yc3R1d10rKSggYnVpfFxcKSkuK3NpbGtcXC8vaSAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmUgUGhvbmVcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsIC8oLispL2csICdGaXJlIFBob25lICQxJ10sIFtWRU5ET1IsIEFNQVpPTl0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBCbGFja0JlcnJ5XG4gICAgICAgICAgICAvKHBsYXlib29rKTtbLVxcd1xcKSw7IF0rKHJpbSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxhY2tCZXJyeSBQbGF5Qm9va1xuICAgICAgICAgICAgXSwgW01PREVMLCBWRU5ET1IsIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYigoPzpiYlthLWZdfHN0W2h2XSkxMDAtXFxkKS9pLFxuICAgICAgICAgICAgL1xcKGJiMTA7IChcXHcrKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrQmVycnkgMTBcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQkxBQ0tCRVJSWV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBBc3VzXG4gICAgICAgICAgICAvKD86XFxifGFzdXNfKSh0cmFuc2ZvW3ByaW1lIF17NCwxMH0gXFx3K3xlZWVwY3xzbGlkZXIgXFx3K3xuZXh1cyA3fHBhZGZvbmV8cDAwW2NqXSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBBU1VTXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvICh6W2Jlc102WzAyN11bMDEyXVtrbV1bbHNdfHplbmZvbmUgXFxkXFx3PylcXGIvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBBU1VTXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEhUQ1xuICAgICAgICAgICAgLyhuZXh1cyA5KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIVEMgTmV4dXMgOVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnSFRDJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhodGMpWy07XyBdezEsMn0oW1xcdyBdKyg/PVxcKXwgYnVpKXxcXHcrKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIVENcblxuICAgICAgICAgICAgLy8gWlRFXG4gICAgICAgICAgICAvKHp0ZSlbLSBdKFtcXHcgXSs/KSg/OiBidWl8XFwvfFxcKSkvaSxcbiAgICAgICAgICAgIC8oYWxjYXRlbHxnZWVrc3Bob25lfG5leGlhbnxwYW5hc29uaWN8c29ueSlbLV8gXT8oWy1cXHddKikvaSAgICAgICAgIC8vIEFsY2F0ZWwvR2Vla3NQaG9uZS9OZXhpYW4vUGFuYXNvbmljL1NvbnlcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIFtNT0RFTCwgL18vZywgJyAnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEFjZXJcbiAgICAgICAgICAgIC9kcm9pZC4rOyAoW2FiXVsxLTddLT9bMDE3OGFdXFxkXFxkPykvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnQWNlciddLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLy8gTWVpenVcbiAgICAgICAgICAgIC9kcm9pZC4rOyAobVsxLTVdIG5vdGUpIGJ1aS9pLFxuICAgICAgICAgICAgL1xcYm16LShbLVxcd117Mix9KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdNZWl6dSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gU2hhcnBcbiAgICAgICAgICAgIC9cXGIoc2gtP1thbHR2el0/XFxkXFxkW2EtZWttXT8pL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1NoYXJwJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBNSVhFRFxuICAgICAgICAgICAgLyhibGFja2JlcnJ5fGJlbnF8cGFsbSg/PVxcLSl8c29ueWVyaWNzc29ufGFjZXJ8YXN1c3xkZWxsfG1laXp1fG1vdG9yb2xhfHBvbHl0cm9uKVstXyBdPyhbLVxcd10qKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja0JlcnJ5L0JlblEvUGFsbS9Tb255LUVyaWNzc29uL0FjZXIvQXN1cy9EZWxsL01laXp1L01vdG9yb2xhL1BvbHl0cm9uXG4gICAgICAgICAgICAvKGhwKSAoW1xcdyBdK1xcdykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFAgaVBBUVxuICAgICAgICAgICAgLyhhc3VzKS0/KFxcdyspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXN1c1xuICAgICAgICAgICAgLyhtaWNyb3NvZnQpOyAobHVtaWFbXFx3IF0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWljcm9zb2Z0IEx1bWlhXG4gICAgICAgICAgICAvKGxlbm92bylbLV8gXT8oWy1cXHddKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMZW5vdm9cbiAgICAgICAgICAgIC8oam9sbGEpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSm9sbGFcbiAgICAgICAgICAgIC8ob3BwbykgPyhbXFx3IF0rKSBidWkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9QUE9cbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLyhhcmNob3MpIChnYW1lcGFkMj8pL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBcmNob3NcbiAgICAgICAgICAgIC8oaHApLisodG91Y2hwYWQoPyEuK3RhYmxldCl8dGFibGV0KS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFAgVG91Y2hQYWRcbiAgICAgICAgICAgIC8oa2luZGxlKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlXG4gICAgICAgICAgICAvKG5vb2spW1xcdyBdK2J1aWxkXFwvKFxcdyspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vb2tcbiAgICAgICAgICAgIC8oZGVsbCkgKHN0cmVhW2twclxcZCBdKltcXGRrb10pL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEZWxsIFN0cmVha1xuICAgICAgICAgICAgLyhsZVstIF0rcGFuKVstIF0rKFxcd3sxLDl9KSBidWkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGUgUGFuIFRhYmxldHNcbiAgICAgICAgICAgIC8odHJpbml0eSlbLSBdKih0XFxkezN9KSBidWkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaW5pdHkgVGFibGV0c1xuICAgICAgICAgICAgLyhnaWdhc2V0KVstIF0rKHFcXHd7MSw5fSkgYnVpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2lnYXNldCBUYWJsZXRzXG4gICAgICAgICAgICAvKHZvZGFmb25lKSAoW1xcdyBdKykoPzpcXCl8IGJ1aSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVm9kYWZvbmVcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLyhzdXJmYWNlIGR1bykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdXJmYWNlIER1b1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBNSUNST1NPRlRdLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZCBbXFxkXFwuXSs7IChmcFxcZHU/KSg/OiBifFxcKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZhaXJwaG9uZVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnRmFpcnBob25lJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyh1MzA0YWEpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBVCZUXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBVCZUJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYnNpZS0oXFx3KikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpZW1lbnNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1NpZW1lbnMnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKHJjdFxcdyspIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUkNBIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1JDQSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIodmVudWVbXFxkIF17Miw3fSkgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEZWxsIFZlbnVlIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0RlbGwnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKHEoPzptdnx0YSlcXHcrKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVmVyaXpvbiBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1Zlcml6b24nXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKD86YmFybmVzWyYgXStub2JsZSB8Ym5bcnRdKShbXFx3XFwrIF0qKSBiL2kgICAgICAgICAgICAgICAgICAgICAgIC8vIEJhcm5lcyAmIE5vYmxlIFRhYmxldFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnQmFybmVzICYgTm9ibGUnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKHRtXFxkezN9XFx3KykgYi9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdOdVZpc2lvbiddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoazg4KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFpURSBLIFNlcmllcyBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1pURSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIobnhcXGR7M31qKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBaVEUgTnViaWFcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1pURSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIoZ2VuXFxkezN9KSBiLis0OWgvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTd2lzcyBHRU4gTW9iaWxlXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdTd2lzcyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIoenVyXFxkezN9KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTd2lzcyBaVVIgVGFibGV0XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdTd2lzcyddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoKHpla2kpP3RiLipcXGIpIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBaZWtpIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1pla2knXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKFt5cl1cXGR7Mn0pIGIvaSxcbiAgICAgICAgICAgIC9cXGIoZHJhZ29uWy0gXSt0b3VjaCB8ZHQpKFxcd3s1fSkgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEcmFnb24gVG91Y2ggVGFibGV0XG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgJ0RyYWdvbiBUb3VjaCddLCBNT0RFTCwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKG5zLT9cXHd7MCw5fSkgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zaWduaWEgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnSW5zaWduaWEnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKChueGF8bmV4dCktP1xcd3swLDl9KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmV4dEJvb2sgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTmV4dEJvb2snXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKHh0cmVtZVxcXyk/KHYoMVswNDVdfDJbMDE1XXxbMzQ2OV0wfDdbMDVdKSkgYi9pICAgICAgICAgICAgICAgICAgLy8gVm9pY2UgWHRyZW1lIFBob25lc1xuICAgICAgICAgICAgXSwgW1tWRU5ET1IsICdWb2ljZSddLCBNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKGx2dGVsXFwtKT8odjFbMTJdKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTHZUZWwgUGhvbmVzXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgJ0x2VGVsJ10sIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIocGgtMSkgL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVzc2VudGlhbCBQSC0xXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdFc3NlbnRpYWwnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKHYoMTAwbWR8NzAwbmF8NzAxMXw5MTdnKS4qXFxiKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRW52aXplbiBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdFbnZpemVuJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYih0cmlvWy1cXHdcXC4gXSspIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWNoU3BlZWQgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTWFjaFNwZWVkJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYnR1XygxNDkxKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUm90b3IgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnUm90b3InXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKHNoaWVsZFtcXHcgXSspIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOdmlkaWEgU2hpZWxkIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ052aWRpYSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oc3ByaW50KSAoXFx3KykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNwcmludCBQaG9uZXNcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oa2luXFwuW29uZXR3XXszfSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pY3Jvc29mdCBLaW5cbiAgICAgICAgICAgIF0sIFtbTU9ERUwsIC9cXC4vZywgJyAnXSwgW1ZFTkRPUiwgTUlDUk9TT0ZUXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKGNjNjY2Nj98ZXQ1WzE2XXxtY1syMzldWzIzXXg/fHZjOFswM114PylcXCkvaSAgICAgICAgICAgICAvLyBaZWJyYVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBaRUJSQV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLis7IChlYzMwfHBzMjB8dGNbMi04XVxcZFtreF0pXFwpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgWkVCUkFdLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICAgICAgLy8gQ09OU09MRVNcbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgLyhvdXlhKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPdXlhXG4gICAgICAgICAgICAvKG5pbnRlbmRvKSAoW3dpZHMzdXRjaF0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5pbnRlbmRvXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIENPTlNPTEVdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLis7IChzaGllbGQpIGJ1aS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOdmlkaWFcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ052aWRpYSddLCBbVFlQRSwgQ09OU09MRV1dLCBbXG4gICAgICAgICAgICAvKHBsYXlzdGF0aW9uIFszNDVwb3J0YWJsZXZpXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBsYXlzdGF0aW9uXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFNPTlldLCBbVFlQRSwgQ09OU09MRV1dLCBbXG4gICAgICAgICAgICAvXFxiKHhib3goPzogb25lKT8oPyE7IHhib3gpKVtcXCk7IF0vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWljcm9zb2Z0IFhib3hcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgTUlDUk9TT0ZUXSwgW1RZUEUsIENPTlNPTEVdXSwgW1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBTTUFSVFRWU1xuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvc21hcnQtdHYuKyhzYW1zdW5nKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhbXN1bmdcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC9oYmJ0di4rbWFwbGU7KFxcZCspL2lcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsIC9eLywgJ1NtYXJ0VFYnXSwgW1ZFTkRPUiwgU0FNU1VOR10sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC8obnV4OyBuZXRjYXN0LitzbWFydHR2fGxnIChuZXRjYXN0XFwudHYtMjAxXFxkfGFuZHJvaWQgdHYpKS9pICAgICAgICAvLyBMRyBTbWFydFRWXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgTEddLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvKGFwcGxlKSA/dHYvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFwcGxlIFRWXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBbTU9ERUwsIEFQUExFKycgVFYnXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL2Nya2V5L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgQ2hyb21lY2FzdFxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgQ0hST01FKydjYXN0J10sIFtWRU5ET1IsIEdPT0dMRV0sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rYWZ0KFxcdykoIGJ1aXxcXCkpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlIFRWXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEFNQVpPTl0sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC9cXChkdHZbXFwpO10uKyhhcXVvcykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaGFycFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU2hhcnAnXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL1xcYihyb2t1KVtcXGR4XSpbXFwpXFwvXSgoPzpkdnAtKT9bXFxkXFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSb2t1XG4gICAgICAgICAgICAvaGJidHZcXC9cXGQrXFwuXFxkK1xcLlxcZCsgK1xcKFtcXHcgXSo7ICooXFx3W147XSopOyhbXjtdKikvaSAgICAgICAgICAgICAgIC8vIEhiYlRWIGRldmljZXNcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCB0cmltXSwgW01PREVMLCB0cmltXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL1xcYihhbmRyb2lkIHR2fHNtYXJ0Wy0gXT90dnxvcGVyYSB0dnx0djsgcnY6KVxcYi9pICAgICAgICAgICAgICAgICAgIC8vIFNtYXJ0VFYgZnJvbSBVbmlkZW50aWZpZWQgVmVuZG9yc1xuICAgICAgICAgICAgXSwgW1tUWVBFLCBTTUFSVFRWXV0sIFtcblxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICAgICAgLy8gV0VBUkFCTEVTXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgICAgIC8oKHBlYmJsZSkpYXBwL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGViYmxlXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rOyAoZ2xhc3MpIFxcZC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBHbGFzc1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBHT09HTEVdLCBbVFlQRSwgV0VBUkFCTEVdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLis7ICh3dDYzPzB7MiwzfSlcXCkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBaRUJSQV0sIFtUWVBFLCBXRUFSQUJMRV1dLCBbXG4gICAgICAgICAgICAvKHF1ZXN0KCAyKT8pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9jdWx1cyBRdWVzdFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBGQUNFQk9PS10sIFtUWVBFLCBXRUFSQUJMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIEVNQkVEREVEXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgICAgIC8odGVzbGEpKD86IHF0Y2FyYnJvd3NlcnxcXC9bLVxcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVzbGFcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIFtUWVBFLCBFTUJFRERFRF1dLCBbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBNSVhFRCAoR0VORVJJQylcbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgL2Ryb2lkIC4rPzsgKFteO10rPykoPzogYnVpfFxcKSBhcHBsZXcpLis/IG1vYmlsZSBzYWZhcmkvaSAgICAgICAgICAgLy8gQW5kcm9pZCBQaG9uZXMgZnJvbSBVbmlkZW50aWZpZWQgVmVuZG9yc1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZCAuKz87IChbXjtdKz8pKD86IGJ1aXxcXCkgYXBwbGV3KS4rPyg/ISBtb2JpbGUpIHNhZmFyaS9pICAgICAgIC8vIEFuZHJvaWQgVGFibGV0cyBmcm9tIFVuaWRlbnRpZmllZCBWZW5kb3JzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYigodGFibGV0fHRhYilbO1xcL118Zm9jdXNcXC9cXGQoPyEuK21vYmlsZSkpL2kgICAgICAgICAgICAgICAgICAgICAgLy8gVW5pZGVudGlmaWFibGUgVGFibGV0XG4gICAgICAgICAgICBdLCBbW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKHBob25lfG1vYmlsZSg/Ols7XFwvXXwgc2FmYXJpKXxwZGEoPz0uK3dpbmRvd3MgY2UpKS9pICAgICAgICAgICAgICAvLyBVbmlkZW50aWZpYWJsZSBNb2JpbGVcbiAgICAgICAgICAgIF0sIFtbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oYW5kcm9pZFstXFx3XFwuIF17MCw5fSk7LitidWlsL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmljIEFuZHJvaWQgRGV2aWNlXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdHZW5lcmljJ11dXG4gICAgICAgIF0sXG5cbiAgICAgICAgZW5naW5lIDogW1tcblxuICAgICAgICAgICAgL3dpbmRvd3MuKyBlZGdlXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVkZ2VIVE1MXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIEVER0UrJ0hUTUwnXV0sIFtcblxuICAgICAgICAgICAgL3dlYmtpdFxcLzUzN1xcLjM2LitjaHJvbWVcXC8oPyEyNykoW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsaW5rXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdCbGluayddXSwgW1xuXG4gICAgICAgICAgICAvKHByZXN0bylcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByZXN0b1xuICAgICAgICAgICAgLyh3ZWJraXR8dHJpZGVudHxuZXRmcm9udHxuZXRzdXJmfGFtYXlhfGx5bnh8dzNtfGdvYW5uYSlcXC8oW1xcd1xcLl0rKS9pLCAvLyBXZWJLaXQvVHJpZGVudC9OZXRGcm9udC9OZXRTdXJmL0FtYXlhL0x5bngvdzNtL0dvYW5uYVxuICAgICAgICAgICAgL2VraW9oKGZsb3cpXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG93XG4gICAgICAgICAgICAvKGtodG1sfHRhc21hbnxsaW5rcylbXFwvIF1cXCg/KFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLSFRNTC9UYXNtYW4vTGlua3NcbiAgICAgICAgICAgIC8oaWNhYilbXFwvIF0oWzIzXVxcLltcXGRcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlDYWJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvcnZcXDooW1xcd1xcLl17MSw5fSlcXGIuKyhnZWNrbykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZWNrb1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIE5BTUVdXG4gICAgICAgIF0sXG5cbiAgICAgICAgb3MgOiBbW1xuXG4gICAgICAgICAgICAvLyBXaW5kb3dzXG4gICAgICAgICAgICAvbWljcm9zb2Z0ICh3aW5kb3dzKSAodmlzdGF8eHApL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdpbmRvd3MgKGlUdW5lcylcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLyh3aW5kb3dzKSBudCA2XFwuMjsgKGFybSkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2luZG93cyBSVFxuICAgICAgICAgICAgLyh3aW5kb3dzICg/OnBob25lKD86IG9zKT98bW9iaWxlKSlbXFwvIF0/KFtcXGRcXC5cXHcgXSopL2ksICAgICAgICAgICAgLy8gV2luZG93cyBQaG9uZVxuICAgICAgICAgICAgLyh3aW5kb3dzKVtcXC8gXT8oW250Y2VcXGRcXC4gXStcXHcpKD8hLit4Ym94KS9pXG4gICAgICAgICAgICBdLCBbTkFNRSwgW1ZFUlNJT04sIHN0ck1hcHBlciwgd2luZG93c1ZlcnNpb25NYXBdXSwgW1xuICAgICAgICAgICAgLyh3aW4oPz0zfDl8bil8d2luIDl4ICkoW250XFxkXFwuXSspL2lcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ1dpbmRvd3MnXSwgW1ZFUlNJT04sIHN0ck1hcHBlciwgd2luZG93c1ZlcnNpb25NYXBdXSwgW1xuXG4gICAgICAgICAgICAvLyBpT1MvbWFjT1NcbiAgICAgICAgICAgIC9pcFtob25lYWRdezIsNH1cXGIoPzouKm9zIChbXFx3XSspIGxpa2UgbWFjfDsgb3BlcmEpL2ksICAgICAgICAgICAgICAvLyBpT1NcbiAgICAgICAgICAgIC9jZm5ldHdvcmtcXC8uK2Rhcndpbi9pXG4gICAgICAgICAgICBdLCBbW1ZFUlNJT04sIC9fL2csICcuJ10sIFtOQU1FLCAnaU9TJ11dLCBbXG4gICAgICAgICAgICAvKG1hYyBvcyB4KSA/KFtcXHdcXC4gXSopL2ksXG4gICAgICAgICAgICAvKG1hY2ludG9zaHxtYWNfcG93ZXJwY1xcYikoPyEuK2hhaWt1KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWMgT1NcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ01hYyBPUyddLCBbVkVSU0lPTiwgL18vZywgJy4nXV0sIFtcblxuICAgICAgICAgICAgLy8gTW9iaWxlIE9TZXNcbiAgICAgICAgICAgIC9kcm9pZCAoW1xcd1xcLl0rKVxcYi4rKGFuZHJvaWRbLSBdeDg2KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQW5kcm9pZC14ODZcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBOQU1FXSwgWyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQW5kcm9pZC9XZWJPUy9RTlgvQmFkYS9SSU0vTWFlbW8vTWVlR28vU2FpbGZpc2ggT1NcbiAgICAgICAgICAgIC8oYW5kcm9pZHx3ZWJvc3xxbnh8YmFkYXxyaW0gdGFibGV0IG9zfG1hZW1vfG1lZWdvfHNhaWxmaXNoKVstXFwvIF0/KFtcXHdcXC5dKikvaSxcbiAgICAgICAgICAgIC8oYmxhY2tiZXJyeSlcXHcqXFwvKFtcXHdcXC5dKikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrYmVycnlcbiAgICAgICAgICAgIC8odGl6ZW58a2Fpb3MpW1xcLyBdKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGl6ZW4vS2FpT1NcbiAgICAgICAgICAgIC9cXCgoc2VyaWVzNDApOy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlcmllcyA0MFxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvXFwoYmIoMTApOy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja0JlcnJ5IDEwXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIEJMQUNLQkVSUlldXSwgW1xuICAgICAgICAgICAgLyg/OnN5bWJpYW4gP29zfHN5bWJvc3xzNjAoPz07KXxzZXJpZXM2MClbLVxcLyBdPyhbXFx3XFwuXSopL2kgICAgICAgICAvLyBTeW1iaWFuXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdTeW1iaWFuJ11dLCBbXG4gICAgICAgICAgICAvbW96aWxsYVxcL1tcXGRcXC5dKyBcXCgoPzptb2JpbGV8dGFibGV0fHR2fG1vYmlsZTsgW1xcdyBdKyk7IHJ2Oi4rIGdlY2tvXFwvKFtcXHdcXC5dKykvaSAvLyBGaXJlZm94IE9TXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIEZJUkVGT1grJyBPUyddXSwgW1xuICAgICAgICAgICAgL3dlYjBzOy4rcnQodHYpL2ksXG4gICAgICAgICAgICAvXFxiKD86aHApP3dvcyg/OmJyb3dzZXIpP1xcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZWJPU1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnd2ViT1MnXV0sIFtcblxuICAgICAgICAgICAgLy8gR29vZ2xlIENocm9tZWNhc3RcbiAgICAgICAgICAgIC9jcmtleVxcLyhbXFxkXFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIENocm9tZWNhc3RcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgQ0hST01FKydjYXN0J11dLCBbXG4gICAgICAgICAgICAvKGNyb3MpIFtcXHddKyAoW1xcd1xcLl0rXFx3KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWl1bSBPU1xuICAgICAgICAgICAgXSwgW1tOQU1FLCAnQ2hyb21pdW0gT1MnXSwgVkVSU0lPTl0sW1xuXG4gICAgICAgICAgICAvLyBDb25zb2xlXG4gICAgICAgICAgICAvKG5pbnRlbmRvfHBsYXlzdGF0aW9uKSAoW3dpZHMzNDVwb3J0YWJsZXZ1Y2hdKykvaSwgICAgICAgICAgICAgICAgIC8vIE5pbnRlbmRvL1BsYXlzdGF0aW9uXG4gICAgICAgICAgICAvKHhib3gpOyAreGJveCAoW15cXCk7XSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgWGJveCAoMzYwLCBPbmUsIFgsIFMsIFNlcmllcyBYLCBTZXJpZXMgUylcblxuICAgICAgICAgICAgLy8gT3RoZXJcbiAgICAgICAgICAgIC9cXGIoam9saXxwYWxtKVxcYiA/KD86b3MpP1xcLz8oW1xcd1xcLl0qKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKb2xpL1BhbG1cbiAgICAgICAgICAgIC8obWludClbXFwvXFwoXFwpIF0/KFxcdyopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pbnRcbiAgICAgICAgICAgIC8obWFnZWlhfHZlY3RvcmxpbnV4KVs7IF0vaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFnZWlhL1ZlY3RvckxpbnV4XG4gICAgICAgICAgICAvKFtreGxuXT91YnVudHV8ZGViaWFufHN1c2V8b3BlbnN1c2V8Z2VudG9vfGFyY2goPz0gbGludXgpfHNsYWNrd2FyZXxmZWRvcmF8bWFuZHJpdmF8Y2VudG9zfHBjbGludXhvc3xyZWQgP2hhdHx6ZW53YWxrfGxpbnB1c3xyYXNwYmlhbnxwbGFuIDl8bWluaXh8cmlzYyBvc3xjb250aWtpfGRlZXBpbnxtYW5qYXJvfGVsZW1lbnRhcnkgb3N8c2FiYXlvbnxsaW5zcGlyZSkoPzogZ251XFwvbGludXgpPyg/OiBlbnRlcnByaXNlKT8oPzpbLSBdbGludXgpPyg/Oi1nbnUpP1stXFwvIF0/KD8hY2hyb218cGFja2FnZSkoWy1cXHdcXC5dKikvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVWJ1bnR1L0RlYmlhbi9TVVNFL0dlbnRvby9BcmNoL1NsYWNrd2FyZS9GZWRvcmEvTWFuZHJpdmEvQ2VudE9TL1BDTGludXhPUy9SZWRIYXQvWmVud2Fsay9MaW5wdXMvUmFzcGJpYW4vUGxhbjkvTWluaXgvUklTQ09TL0NvbnRpa2kvRGVlcGluL01hbmphcm8vZWxlbWVudGFyeS9TYWJheW9uL0xpbnNwaXJlXG4gICAgICAgICAgICAvKGh1cmR8bGludXgpID8oW1xcd1xcLl0qKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSHVyZC9MaW51eFxuICAgICAgICAgICAgLyhnbnUpID8oW1xcd1xcLl0qKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdOVVxuICAgICAgICAgICAgL1xcYihbLWZyZW50b3BjZ2hzXXswLDV9YnNkfGRyYWdvbmZseSlbXFwvIF0/KD8hYW1kfFtpeDM0Nl17MSwyfTg2KShbXFx3XFwuXSopL2ksIC8vIEZyZWVCU0QvTmV0QlNEL09wZW5CU0QvUEMtQlNEL0dob3N0QlNEL0RyYWdvbkZseVxuICAgICAgICAgICAgLyhoYWlrdSkgKFxcdyspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSGFpa3VcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLyhzdW5vcykgPyhbXFx3XFwuXFxkXSopL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb2xhcmlzXG4gICAgICAgICAgICBdLCBbW05BTUUsICdTb2xhcmlzJ10sIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKCg/Om9wZW4pP3NvbGFyaXMpWy1cXC8gXT8oW1xcd1xcLl0qKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbGFyaXNcbiAgICAgICAgICAgIC8oYWl4KSAoKFxcZCkoPz1cXC58XFwpfCApW1xcd1xcLl0pKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBSVhcbiAgICAgICAgICAgIC9cXGIoYmVvc3xvc1xcLzJ8YW1pZ2Fvc3xtb3JwaG9zfG9wZW52bXN8ZnVjaHNpYXxocC11eCkvaSwgICAgICAgICAgICAvLyBCZU9TL09TMi9BbWlnYU9TL01vcnBoT1MvT3BlblZNUy9GdWNoc2lhL0hQLVVYXG4gICAgICAgICAgICAvKHVuaXgpID8oW1xcd1xcLl0qKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVU5JWFxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dXG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDb25zdHJ1Y3RvclxuICAgIC8vLy8vLy8vLy8vLy8vLy9cblxuICAgIHZhciBVQVBhcnNlciA9IGZ1bmN0aW9uICh1YSwgZXh0ZW5zaW9ucykge1xuXG4gICAgICAgIGlmICh0eXBlb2YgdWEgPT09IE9CSl9UWVBFKSB7XG4gICAgICAgICAgICBleHRlbnNpb25zID0gdWE7XG4gICAgICAgICAgICB1YSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBVQVBhcnNlcikpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVUFQYXJzZXIodWEsIGV4dGVuc2lvbnMpLmdldFJlc3VsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF91YSA9IHVhIHx8ICgodHlwZW9mIHdpbmRvdyAhPT0gVU5ERUZfVFlQRSAmJiB3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KSA/IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50IDogRU1QVFkpO1xuICAgICAgICB2YXIgX3JneG1hcCA9IGV4dGVuc2lvbnMgPyBleHRlbmQocmVnZXhlcywgZXh0ZW5zaW9ucykgOiByZWdleGVzO1xuXG4gICAgICAgIHRoaXMuZ2V0QnJvd3NlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfYnJvd3NlciA9IHt9O1xuICAgICAgICAgICAgX2Jyb3dzZXJbTkFNRV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBfYnJvd3NlcltWRVJTSU9OXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJneE1hcHBlci5jYWxsKF9icm93c2VyLCBfdWEsIF9yZ3htYXAuYnJvd3Nlcik7XG4gICAgICAgICAgICBfYnJvd3Nlci5tYWpvciA9IG1ham9yaXplKF9icm93c2VyLnZlcnNpb24pO1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldENQVSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfY3B1ID0ge307XG4gICAgICAgICAgICBfY3B1W0FSQ0hJVEVDVFVSRV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZ3hNYXBwZXIuY2FsbChfY3B1LCBfdWEsIF9yZ3htYXAuY3B1KTtcbiAgICAgICAgICAgIHJldHVybiBfY3B1O1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldERldmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfZGV2aWNlID0ge307XG4gICAgICAgICAgICBfZGV2aWNlW1ZFTkRPUl0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBfZGV2aWNlW01PREVMXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIF9kZXZpY2VbVFlQRV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZ3hNYXBwZXIuY2FsbChfZGV2aWNlLCBfdWEsIF9yZ3htYXAuZGV2aWNlKTtcbiAgICAgICAgICAgIHJldHVybiBfZGV2aWNlO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldEVuZ2luZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfZW5naW5lID0ge307XG4gICAgICAgICAgICBfZW5naW5lW05BTUVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgX2VuZ2luZVtWRVJTSU9OXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJneE1hcHBlci5jYWxsKF9lbmdpbmUsIF91YSwgX3JneG1hcC5lbmdpbmUpO1xuICAgICAgICAgICAgcmV0dXJuIF9lbmdpbmU7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0T1MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX29zID0ge307XG4gICAgICAgICAgICBfb3NbTkFNRV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBfb3NbVkVSU0lPTl0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZ3hNYXBwZXIuY2FsbChfb3MsIF91YSwgX3JneG1hcC5vcyk7XG4gICAgICAgICAgICByZXR1cm4gX29zO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldFJlc3VsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdWEgICAgICA6IHRoaXMuZ2V0VUEoKSxcbiAgICAgICAgICAgICAgICBicm93c2VyIDogdGhpcy5nZXRCcm93c2VyKCksXG4gICAgICAgICAgICAgICAgZW5naW5lICA6IHRoaXMuZ2V0RW5naW5lKCksXG4gICAgICAgICAgICAgICAgb3MgICAgICA6IHRoaXMuZ2V0T1MoKSxcbiAgICAgICAgICAgICAgICBkZXZpY2UgIDogdGhpcy5nZXREZXZpY2UoKSxcbiAgICAgICAgICAgICAgICBjcHUgICAgIDogdGhpcy5nZXRDUFUoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRVQSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdWE7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0VUEgPSBmdW5jdGlvbiAodWEpIHtcbiAgICAgICAgICAgIF91YSA9ICh0eXBlb2YgdWEgPT09IFNUUl9UWVBFICYmIHVhLmxlbmd0aCA+IFVBX01BWF9MRU5HVEgpID8gdHJpbSh1YSwgVUFfTUFYX0xFTkdUSCkgOiB1YTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNldFVBKF91YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBVQVBhcnNlci5WRVJTSU9OID0gTElCVkVSU0lPTjtcbiAgICBVQVBhcnNlci5CUk9XU0VSID0gIGVudW1lcml6ZShbTkFNRSwgVkVSU0lPTiwgTUFKT1JdKTtcbiAgICBVQVBhcnNlci5DUFUgPSBlbnVtZXJpemUoW0FSQ0hJVEVDVFVSRV0pO1xuICAgIFVBUGFyc2VyLkRFVklDRSA9IGVudW1lcml6ZShbTU9ERUwsIFZFTkRPUiwgVFlQRSwgQ09OU09MRSwgTU9CSUxFLCBTTUFSVFRWLCBUQUJMRVQsIFdFQVJBQkxFLCBFTUJFRERFRF0pO1xuICAgIFVBUGFyc2VyLkVOR0lORSA9IFVBUGFyc2VyLk9TID0gZW51bWVyaXplKFtOQU1FLCBWRVJTSU9OXSk7XG5cbiAgICAvLy8vLy8vLy8vL1xuICAgIC8vIEV4cG9ydFxuICAgIC8vLy8vLy8vLy9cblxuICAgIC8vIGNoZWNrIGpzIGVudmlyb25tZW50XG4gICAgaWYgKHR5cGVvZihleHBvcnRzKSAhPT0gVU5ERUZfVFlQRSkge1xuICAgICAgICAvLyBub2RlanMgZW52XG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSBVTkRFRl9UWVBFICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBVQVBhcnNlcjtcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRzLlVBUGFyc2VyID0gVUFQYXJzZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVxdWlyZWpzIGVudiAob3B0aW9uYWwpXG4gICAgICAgIGlmICh0eXBlb2YoZGVmaW5lKSA9PT0gRlVOQ19UWVBFICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVBUGFyc2VyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gVU5ERUZfVFlQRSkge1xuICAgICAgICAgICAgLy8gYnJvd3NlciBlbnZcbiAgICAgICAgICAgIHdpbmRvdy5VQVBhcnNlciA9IFVBUGFyc2VyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8galF1ZXJ5L1plcHRvIHNwZWNpZmljIChvcHRpb25hbClcbiAgICAvLyBOb3RlOlxuICAgIC8vICAgSW4gQU1EIGVudiB0aGUgZ2xvYmFsIHNjb3BlIHNob3VsZCBiZSBrZXB0IGNsZWFuLCBidXQgalF1ZXJ5IGlzIGFuIGV4Y2VwdGlvbi5cbiAgICAvLyAgIGpRdWVyeSBhbHdheXMgZXhwb3J0cyB0byBnbG9iYWwgc2NvcGUsIHVubGVzcyBqUXVlcnkubm9Db25mbGljdCh0cnVlKSBpcyB1c2VkLFxuICAgIC8vICAgYW5kIHdlIHNob3VsZCBjYXRjaCB0aGF0LlxuICAgIHZhciAkID0gdHlwZW9mIHdpbmRvdyAhPT0gVU5ERUZfVFlQRSAmJiAod2luZG93LmpRdWVyeSB8fCB3aW5kb3cuWmVwdG8pO1xuICAgIGlmICgkICYmICEkLnVhKSB7XG4gICAgICAgIHZhciBwYXJzZXIgPSBuZXcgVUFQYXJzZXIoKTtcbiAgICAgICAgJC51YSA9IHBhcnNlci5nZXRSZXN1bHQoKTtcbiAgICAgICAgJC51YS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VyLmdldFVBKCk7XG4gICAgICAgIH07XG4gICAgICAgICQudWEuc2V0ID0gZnVuY3Rpb24gKHVhKSB7XG4gICAgICAgICAgICBwYXJzZXIuc2V0VUEodWEpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHBhcnNlci5nZXRSZXN1bHQoKTtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgJC51YVtwcm9wXSA9IHJlc3VsdFtwcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbn0pKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93IDogdGhpcyk7XG4iXX0=
