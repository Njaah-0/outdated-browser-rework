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
					"<p class=\"" + contentClass + "\">" +
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
		var notExplicitlyAllowByUserAgentKeyword = true;
		if (options.allowedUserAgentKeywords) {
			for (var index = 0; index < options.allowedUserAgentKeywords.length; index++) {
				var keyword = options.allowedUserAgentKeywords[index];
				if (parsedUserAgent.ua.indexOf(keyword) !== -1) {
					notExplicitlyAllowByUserAgentKeyword = false;
					break;
				}
			}
		}
		if (notExplicitlyAllowByUserAgentKeyword && (result.isAndroidButNotChrome || result.isBrowserOutOfDate || !result.isPropertySupported)) {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJldmFsdWF0ZUJyb3dzZXIuanMiLCJleHRlbmQuanMiLCJpbmRleC5qcyIsImxhbmd1YWdlcy5qc29uIiwibm9kZV9tb2R1bGVzL3VhLXBhcnNlci1qcy9zcmMvdWEtcGFyc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIERFRkFVTFRTID0ge1xuXHRDaHJvbWU6IDU3LCAvLyBJbmNsdWRlcyBDaHJvbWUgZm9yIG1vYmlsZSBkZXZpY2VzXG5cdEVkZ2U6IDM5LFxuXHRTYWZhcmk6IDEwLFxuXHRcIk1vYmlsZSBTYWZhcmlcIjogMTAsXG5cdE9wZXJhOiA1MCxcblx0RmlyZWZveDogNTAsXG5cdFZpdmFsZGk6IDEsXG5cdElFOiBmYWxzZVxufVxuXG52YXIgRURHRUhUTUxfVlNfRURHRV9WRVJTSU9OUyA9IHtcblx0MTI6IDAuMSxcblx0MTM6IDIxLFxuXHQxNDogMzEsXG5cdDE1OiAzOSxcblx0MTY6IDQxLFxuXHQxNzogNDIsXG5cdDE4OiA0NFxufVxuXG52YXIgdXBkYXRlRGVmYXVsdHMgPSBmdW5jdGlvbiAoZGVmYXVsdHMsIHVwZGF0ZWRWYWx1ZXMpIHtcblx0Zm9yICh2YXIga2V5IGluIHVwZGF0ZWRWYWx1ZXMpIHtcblx0XHRkZWZhdWx0c1trZXldID0gdXBkYXRlZFZhbHVlc1trZXldXG5cdH1cblxuXHRyZXR1cm4gZGVmYXVsdHNcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGFyc2VkVXNlckFnZW50LCBvcHRpb25zKSB7XG5cdC8vIFNldCBkZWZhdWx0IG9wdGlvbnNcblx0dmFyIGJyb3dzZXJTdXBwb3J0ID0gb3B0aW9ucy5icm93c2VyU3VwcG9ydCA/IHVwZGF0ZURlZmF1bHRzKERFRkFVTFRTLCBvcHRpb25zLmJyb3dzZXJTdXBwb3J0KSA6IERFRkFVTFRTXG5cdHZhciByZXF1aXJlZENzc1Byb3BlcnR5ID0gb3B0aW9ucy5yZXF1aXJlZENzc1Byb3BlcnR5IHx8IGZhbHNlXG5cblx0dmFyIGJyb3dzZXJOYW1lID0gcGFyc2VkVXNlckFnZW50LmJyb3dzZXIubmFtZTtcblxuXHR2YXIgaXNBbmRyb2lkQnV0Tm90Q2hyb21lXG5cdGlmIChvcHRpb25zLnJlcXVpcmVDaHJvbWVPbkFuZHJvaWQpIHtcblx0XHRpc0FuZHJvaWRCdXROb3RDaHJvbWUgPSBwYXJzZWRVc2VyQWdlbnQub3MubmFtZSA9PT0gXCJBbmRyb2lkXCIgJiYgcGFyc2VkVXNlckFnZW50LmJyb3dzZXIubmFtZSAhPT0gXCJDaHJvbWVcIlxuXHR9XHRcblx0XG5cdHZhciBwYXJzZU1pbm9yVmVyc2lvbiA9IGZ1bmN0aW9uICh2ZXJzaW9uKSB7XG5cdFx0cmV0dXJuIHZlcnNpb24ucmVwbGFjZSgvW15cXGQuXS9nLCAnJykuc3BsaXQoXCIuXCIpWzFdO1xuXHR9XG5cblx0dmFyIGlzQnJvd3NlclVuc3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpc1Vuc3VwcG9ydGVkID0gZmFsc2Vcblx0XHRpZiAoIShicm93c2VyTmFtZSBpbiBicm93c2VyU3VwcG9ydCkpIHtcblx0XHRcdGlmICghb3B0aW9ucy5pc1Vua25vd25Ccm93c2VyT0spIHtcblx0XHRcdFx0aXNVbnN1cHBvcnRlZCA9IHRydWVcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFicm93c2VyU3VwcG9ydFticm93c2VyTmFtZV0pIHtcblx0XHRcdGlzVW5zdXBwb3J0ZWQgPSB0cnVlXG5cdFx0fVxuXHRcdHJldHVybiBpc1Vuc3VwcG9ydGVkO1xuXHR9XG5cblx0dmFyIGlzQnJvd3NlclVuc3VwcG9ydGVkUmVzdWx0ID0gaXNCcm93c2VyVW5zdXBwb3J0ZWQoKTtcblxuXHR2YXIgaXNCcm93c2VyT3V0T2ZEYXRlID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBicm93c2VyVmVyc2lvbiA9IHBhcnNlZFVzZXJBZ2VudC5icm93c2VyLnZlcnNpb247XG5cdFx0dmFyIGJyb3dzZXJNYWpvclZlcnNpb24gPSBwYXJzZWRVc2VyQWdlbnQuYnJvd3Nlci5tYWpvcjtcblx0XHR2YXIgb3NOYW1lID0gcGFyc2VkVXNlckFnZW50Lm9zLm5hbWU7XG5cdFx0dmFyIG9zVmVyc2lvbiA9IHBhcnNlZFVzZXJBZ2VudC5vcy52ZXJzaW9uO1xuXG5cdFx0Ly8gRWRnZSBsZWdhY3kgbmVlZGVkIGEgdmVyc2lvbiBtYXBwaW5nLCBFZGdlIG9uIENocm9taXVtIGRvZXNuJ3Rcblx0XHRpZiAoYnJvd3Nlck5hbWUgPT09IFwiRWRnZVwiICYmIGJyb3dzZXJNYWpvclZlcnNpb24gPD0gMTgpIHtcblx0XHRcdGJyb3dzZXJNYWpvclZlcnNpb24gPSBFREdFSFRNTF9WU19FREdFX1ZFUlNJT05TW2Jyb3dzZXJNYWpvclZlcnNpb25dO1xuXHRcdH1cblxuXHRcdC8vIEZpcmVmb3ggTW9iaWxlIG9uIGlPUyBpcyBlc3NlbnRpYWxseSBNb2JpbGUgU2FmYXJpIHNvIG5lZWRzIHRvIGJlIGhhbmRsZWQgdGhhdCB3YXlcblx0XHQvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9taWtlbWFjY2FuYS9vdXRkYXRlZC1icm93c2VyLXJld29yay9pc3N1ZXMvOTgjaXNzdWVjb21tZW50LTU5NzcyMTE3M1xuXHRcdGlmIChicm93c2VyTmFtZSA9PT0gJ0ZpcmVmb3gnICYmIG9zTmFtZSA9PT0gJ2lPUycpIHtcblx0XHRcdGJyb3dzZXJOYW1lID0gJ01vYmlsZSBTYWZhcmknO1xuXHRcdFx0YnJvd3NlclZlcnNpb24gPSBvc1ZlcnNpb247XG5cdFx0XHRicm93c2VyTWFqb3JWZXJzaW9uID0gb3NWZXJzaW9uLnN1YnN0cmluZygwLCBvc1ZlcnNpb24uaW5kZXhPZignLicpKTtcblx0XHR9XG5cblx0XHR2YXIgaXNPdXRPZkRhdGUgPSBmYWxzZVxuXHRcdGlmIChpc0Jyb3dzZXJVbnN1cHBvcnRlZFJlc3VsdCkge1xuXHRcdFx0aXNPdXRPZkRhdGUgPSB0cnVlO1xuXHRcdH0gZWxzZSBpZiAoYnJvd3Nlck5hbWUgaW4gYnJvd3NlclN1cHBvcnQpIHtcblx0XHRcdHZhciBtaW5WZXJzaW9uID0gYnJvd3NlclN1cHBvcnRbYnJvd3Nlck5hbWVdXG5cdFx0XHRpZiAodHlwZW9mIG1pblZlcnNpb24gPT0gJ29iamVjdCcpIHtcblx0XHRcdFx0dmFyIG1pbk1ham9yVmVyc2lvbiA9IG1pblZlcnNpb24ubWFqb3Jcblx0XHRcdFx0dmFyIG1pbk1pbm9yVmVyc2lvbiA9IG1pblZlcnNpb24ubWlub3JcblxuXHRcdFx0XHRpZiAoYnJvd3Nlck1ham9yVmVyc2lvbiA8IG1pbk1ham9yVmVyc2lvbikge1xuXHRcdFx0XHRcdGlzT3V0T2ZEYXRlID0gdHJ1ZVxuXHRcdFx0XHR9IGVsc2UgaWYgKGJyb3dzZXJNYWpvclZlcnNpb24gPT0gbWluTWFqb3JWZXJzaW9uKSB7XG5cdFx0XHRcdFx0dmFyIGJyb3dzZXJNaW5vclZlcnNpb24gPSBwYXJzZU1pbm9yVmVyc2lvbihicm93c2VyVmVyc2lvbilcblxuXHRcdFx0XHRcdGlmIChicm93c2VyTWlub3JWZXJzaW9uIDwgbWluTWlub3JWZXJzaW9uKSB7XG5cdFx0XHRcdFx0XHRpc091dE9mRGF0ZSA9IHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoYnJvd3Nlck1ham9yVmVyc2lvbiA8IG1pblZlcnNpb24pIHtcblx0XHRcdFx0aXNPdXRPZkRhdGUgPSB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpc091dE9mRGF0ZVxuXHR9XG5cblx0Ly8gUmV0dXJucyB0cnVlIGlmIGEgYnJvd3NlciBzdXBwb3J0cyBhIGNzczMgcHJvcGVydHlcblx0dmFyIGlzUHJvcGVydHlTdXBwb3J0ZWQgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcblx0XHRpZiAoIXByb3BlcnR5KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblx0XHR2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuXHRcdHZhciB2ZW5kb3JQcmVmaXhlcyA9IFtcImtodG1sXCIsIFwibXNcIiwgXCJvXCIsIFwibW96XCIsIFwid2Via2l0XCJdXG5cdFx0dmFyIGNvdW50ID0gdmVuZG9yUHJlZml4ZXMubGVuZ3RoXG5cblx0XHQvLyBOb3RlOiBIVE1MRWxlbWVudC5zdHlsZS5oYXNPd25Qcm9wZXJ0eSBzZWVtcyBicm9rZW4gaW4gRWRnZVxuXHRcdGlmIChwcm9wZXJ0eSBpbiBkaXYuc3R5bGUpIHtcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fVxuXG5cdFx0cHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9eW2Etel0vLCBmdW5jdGlvbiAodmFsKSB7XG5cdFx0XHRyZXR1cm4gdmFsLnRvVXBwZXJDYXNlKClcblx0XHR9KVxuXG5cdFx0d2hpbGUgKGNvdW50LS0pIHtcblx0XHRcdHZhciBwcmVmaXhlZFByb3BlcnR5ID0gdmVuZG9yUHJlZml4ZXNbY291bnRdICsgcHJvcGVydHlcblx0XHRcdC8vIFNlZSBjb21tZW50IHJlOiBIVE1MRWxlbWVudC5zdHlsZS5oYXNPd25Qcm9wZXJ0eSBhYm92ZVxuXHRcdFx0aWYgKHByZWZpeGVkUHJvcGVydHkgaW4gZGl2LnN0eWxlKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0Ly8gUmV0dXJuIHJlc3VsdHNcblx0cmV0dXJuIHtcblx0XHRpc0FuZHJvaWRCdXROb3RDaHJvbWU6IGlzQW5kcm9pZEJ1dE5vdENocm9tZSxcblx0XHRpc0Jyb3dzZXJPdXRPZkRhdGU6IGlzQnJvd3Nlck91dE9mRGF0ZSgpLFxuXHRcdGlzQnJvd3NlclVuc3VwcG9ydGVkOiBpc0Jyb3dzZXJVbnN1cHBvcnRlZFJlc3VsdCxcblx0XHRpc1Byb3BlcnR5U3VwcG9ydGVkOiBpc1Byb3BlcnR5U3VwcG9ydGVkKHJlcXVpcmVkQ3NzUHJvcGVydHkpXG5cdH07XG59XG4iLCIvKiBIaWdobHkgZHVtYmVkIGRvd24gdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vdW5jbGVjaHUvbm9kZS1kZWVwLWV4dGVuZCAqL1xuXG4vKipcbiAqIEV4dGVuaW5nIG9iamVjdCB0aGF0IGVudGVyZWQgaW4gZmlyc3QgYXJndW1lbnQuXG4gKlxuICogUmV0dXJucyBleHRlbmRlZCBvYmplY3Qgb3IgZmFsc2UgaWYgaGF2ZSBubyB0YXJnZXQgb2JqZWN0IG9yIGluY29ycmVjdCB0eXBlLlxuICpcbiAqIElmIHlvdSB3aXNoIHRvIGNsb25lIHNvdXJjZSBvYmplY3QgKHdpdGhvdXQgbW9kaWZ5IGl0KSwganVzdCB1c2UgZW1wdHkgbmV3XG4gKiBvYmplY3QgYXMgZmlyc3QgYXJndW1lbnQsIGxpa2UgdGhpczpcbiAqICAgZGVlcEV4dGVuZCh7fSwgeW91ck9ial8xLCBbeW91ck9ial9OXSk7XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVlcEV4dGVuZCgvKm9ial8xLCBbb2JqXzJdLCBbb2JqX05dKi8pIHtcblx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxIHx8IHR5cGVvZiBhcmd1bWVudHNbMF0gIT09IFwib2JqZWN0XCIpIHtcblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuXHRcdHJldHVybiBhcmd1bWVudHNbMF1cblx0fVxuXG5cdHZhciB0YXJnZXQgPSBhcmd1bWVudHNbMF1cblxuXHRmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBvYmogPSBhcmd1bWVudHNbaV1cblxuXHRcdGZvciAodmFyIGtleSBpbiBvYmopIHtcblx0XHRcdHZhciBzcmMgPSB0YXJnZXRba2V5XVxuXHRcdFx0dmFyIHZhbCA9IG9ialtrZXldXG5cblx0XHRcdGlmICh0eXBlb2YgdmFsICE9PSBcIm9iamVjdFwiIHx8IHZhbCA9PT0gbnVsbCkge1xuXHRcdFx0XHR0YXJnZXRba2V5XSA9IHZhbFxuXG5cdFx0XHRcdC8vIGp1c3QgY2xvbmUgYXJyYXlzIChhbmQgcmVjdXJzaXZlIGNsb25lIG9iamVjdHMgaW5zaWRlKVxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygc3JjICE9PSBcIm9iamVjdFwiIHx8IHNyYyA9PT0gbnVsbCkge1xuXHRcdFx0XHR0YXJnZXRba2V5XSA9IGRlZXBFeHRlbmQoe30sIHZhbClcblxuXHRcdFx0XHQvLyBzb3VyY2UgdmFsdWUgYW5kIG5ldyB2YWx1ZSBpcyBvYmplY3RzIGJvdGgsIGV4dGVuZGluZy4uLlxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0W2tleV0gPSBkZWVwRXh0ZW5kKHNyYywgdmFsKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0YXJnZXRcbn1cbiIsInZhciBldmFsdWF0ZUJyb3dzZXIgPSByZXF1aXJlKFwiLi9ldmFsdWF0ZUJyb3dzZXJcIilcbnZhciBsYW5ndWFnZU1lc3NhZ2VzID0gcmVxdWlyZShcIi4vbGFuZ3VhZ2VzLmpzb25cIilcbnZhciBkZWVwRXh0ZW5kID0gcmVxdWlyZShcIi4vZXh0ZW5kXCIpXG52YXIgVXNlckFnZW50UGFyc2VyID0gcmVxdWlyZShcInVhLXBhcnNlci1qc1wiKVxuXG52YXIgQ09MT1JTID0ge1xuXHRzYWxtb246IFwiI2YyNTY0OFwiLFxuXHR3aGl0ZTogXCJ3aGl0ZVwiXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlclByb3ZpZGVkT3B0aW9ucywgb25sb2FkID0gdHJ1ZSkge1xuXHR2YXIgbWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHQvLyBEZXNwaXRlIHRoZSBkb2NzLCBVQSBuZWVkcyB0byBiZSBwcm92aWRlZCB0byBjb25zdHJ1Y3RvciBleHBsaWNpdGx5OlxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWlzYWxtYW4vdWEtcGFyc2VyLWpzL2lzc3Vlcy85MFxuXHRcdHZhciBwYXJzZWRVc2VyQWdlbnQgPSBuZXcgVXNlckFnZW50UGFyc2VyKG5hdmlnYXRvci51c2VyQWdlbnQpLmdldFJlc3VsdCgpXG5cblx0XHQvLyBWYXJpYWJsZSBkZWZpbml0aW9uIChiZWZvcmUgYWpheClcblx0XHR2YXIgb3V0ZGF0ZWRVSSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3V0ZGF0ZWRcIilcblxuXHRcdGlmICghb3V0ZGF0ZWRVSSkge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0ICAnRE9NIGVsZW1lbnQgd2l0aCBpZCBcIm91dGRhdGVkXCIgaXMgbWlzc2luZyEgU3VjaCBlbGVtZW50IGlzIHJlcXVpcmVkIGZvciBvdXRkYXRlZC1icm93c2VyIHRvIHdvcmsuICcgK1xuXHRcdFx0ICAnSGF2aW5nIHN1Y2ggZWxlbWVudCBvbmx5IG9uIGNlcnRhaW4gcGFnZXMgaXMgYSB2YWxpZCB3YXkgdG8gZGVmaW5lIHdoZXJlIHRvIGRpc3BsYXkgYWxlcnQsIHNvIGlmIHRoaXMgaXMnICtcblx0XHRcdCAgJ2ludGVudGlvbmFsLCBpZ25vcmUgdGhpcyB3YXJuaW5nJ1xuXHRcdFx0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XHQgIFxuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgb3B0aW9uc1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cblx0XHR2YXIgYnJvd3NlckxvY2FsZSA9IHdpbmRvdy5uYXZpZ2F0b3IubGFuZ3VhZ2UgfHwgd2luZG93Lm5hdmlnYXRvci51c2VyTGFuZ3VhZ2UgLy8gRXZlcnlvbmUgZWxzZSwgSUVcblx0XHQvLyBDU1MgcHJvcGVydHkgdG8gY2hlY2sgZm9yLiBZb3UgbWF5IGFsc28gbGlrZSAnYm9yZGVyU3BhY2luZycsICdib3hTaGFkb3cnLCAndHJhbnNmb3JtJywgJ2JvcmRlckltYWdlJztcblx0XHR2YXIgYmFja2dyb3VuZENvbG9yID0gb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgfHwgQ09MT1JTLnNhbG1vblxuXHRcdHZhciB0ZXh0Q29sb3IgPSBvcHRpb25zLnRleHRDb2xvciB8fCBDT0xPUlMud2hpdGVcblx0XHR2YXIgZnVsbHNjcmVlbiA9IG9wdGlvbnMuZnVsbHNjcmVlbiB8fCBmYWxzZVxuXHRcdHZhciBsYW5ndWFnZSA9IG9wdGlvbnMubGFuZ3VhZ2UgfHwgYnJvd3NlckxvY2FsZS5zbGljZSgwLCAyKSAvLyBMYW5ndWFnZSBjb2RlXG5cblx0XHR2YXIgbGFuZ3VhZ2VzID0gb3B0aW9ucy5sYW5ndWFnZUpzb24gfHwge307XG4gICAgXHR2YXIgY3VzdG9tQ1NTQ2xhc3NlcyA9IG9wdGlvbnMuY3VzdG9tQ1NTQ2xhc3NlcyB8fCBudWxsO1xuXG5cdFx0dmFyIHVwZGF0ZVNvdXJjZSA9IFwid2ViXCIgLy8gT3RoZXIgcG9zc2libGUgdmFsdWVzIGFyZSAnZ29vZ2xlUGxheScgb3IgJ2FwcFN0b3JlJy4gRGV0ZXJtaW5lcyB3aGVyZSB3ZSB0ZWxsIHVzZXJzIHRvIGdvIGZvciB1cGdyYWRlcy5cblxuXHRcdC8vIENocm9tZSBtb2JpbGUgaXMgc3RpbGwgQ2hyb21lICh1bmxpa2UgU2FmYXJpIHdoaWNoIGlzICdNb2JpbGUgU2FmYXJpJylcblx0XHR2YXIgaXNBbmRyb2lkID0gcGFyc2VkVXNlckFnZW50Lm9zLm5hbWUgPT09IFwiQW5kcm9pZFwiXG5cdFx0aWYgKGlzQW5kcm9pZCkge1xuXHRcdFx0dXBkYXRlU291cmNlID0gXCJnb29nbGVQbGF5XCJcblx0XHR9IGVsc2UgaWYgIChwYXJzZWRVc2VyQWdlbnQub3MubmFtZSA9PT0gXCJpT1NcIikge1xuXHRcdFx0dXBkYXRlU291cmNlID0gXCJhcHBTdG9yZVwiXG5cdFx0fVxuXG5cdFx0dmFyIGlzQnJvd3NlclVuc3VwcG9ydGVkID0gZmFsc2UgLy8gc2V0IGxhdGVyIGFmdGVyIGJyb3dzZXIgZXZhbHVhdGlvblxuXG5cdFx0dmFyIGRvbmUgPSB0cnVlXG5cblx0XHR2YXIgY2hhbmdlT3BhY2l0eSA9IGZ1bmN0aW9uIChvcGFjaXR5VmFsdWUpIHtcblx0XHRcdG91dGRhdGVkVUkuc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlWYWx1ZSAvIDEwMFxuXHRcdFx0b3V0ZGF0ZWRVSS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5VmFsdWUgKyBcIilcIlxuXHRcdH1cblx0XG5cdFx0dmFyIGZhZGVJbiA9IGZ1bmN0aW9uIChvcGFjaXR5VmFsdWUpIHtcblx0XHRcdGNoYW5nZU9wYWNpdHkob3BhY2l0eVZhbHVlKVxuXHRcdFx0aWYgKG9wYWNpdHlWYWx1ZSA9PT0gMSkge1xuXHRcdFx0XHRvdXRkYXRlZFVJLnN0eWxlLmRpc3BsYXkgPSBcInRhYmxlXCJcblx0XHRcdH1cblx0XHRcdGlmIChvcGFjaXR5VmFsdWUgPT09IDEwMCkge1xuXHRcdFx0XHRkb25lID0gdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblx0XG5cdFx0dmFyIG1ha2VGYWRlSW5GdW5jdGlvbiA9IGZ1bmN0aW9uIChvcGFjaXR5VmFsdWUpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGZhZGVJbihvcGFjaXR5VmFsdWUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcblx0XHQvLyBTdHlsZSBlbGVtZW50IGV4cGxpY2l0bHkgLSBUT0RPOiBpbnZlc3RpZ2F0ZSBhbmQgZGVsZXRlIGlmIG5vdCBuZWVkZWRcblx0XHR2YXIgc3RhcnRTdHlsZXNBbmRFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgYnV0dG9uQ2xvc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ1dHRvbkNsb3NlVXBkYXRlQnJvd3NlclwiKVxuXHRcdFx0dmFyIGJ1dHRvblVwZGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnV0dG9uVXBkYXRlQnJvd3NlclwiKVxuXHRcblx0XHRcdC8vY2hlY2sgc2V0dGluZ3MgYXR0cmlidXRlc1xuXHRcdFx0b3V0ZGF0ZWRVSS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBiYWNrZ3JvdW5kQ29sb3Jcblx0XHRcdC8vd2F5IHRvbyBoYXJkIHRvIHB1dCAhaW1wb3J0YW50IG9uIElFNlxuXHRcdFx0b3V0ZGF0ZWRVSS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcdFx0b3V0ZGF0ZWRVSS5jaGlsZHJlblswXS5jaGlsZHJlblswXS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcdFx0b3V0ZGF0ZWRVSS5jaGlsZHJlblswXS5jaGlsZHJlblsxXS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcblx0XHRcdC8vIFVwZGF0ZSBidXR0b24gaXMgZGVza3RvcCBvbmx5XG5cdFx0XHRpZiAoYnV0dG9uVXBkYXRlKSB7XG5cdFx0XHRcdGJ1dHRvblVwZGF0ZS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcdFx0XHRpZiAoYnV0dG9uVXBkYXRlLnN0eWxlLmJvcmRlckNvbG9yKSB7XG5cdFx0XHRcdFx0YnV0dG9uVXBkYXRlLnN0eWxlLmJvcmRlckNvbG9yID0gdGV4dENvbG9yXG5cdFx0XHRcdH1cblx0XG5cdFx0XHRcdC8vIE92ZXJyaWRlIHRoZSB1cGRhdGUgYnV0dG9uIGNvbG9yIHRvIG1hdGNoIHRoZSBiYWNrZ3JvdW5kIGNvbG9yXG5cdFx0XHRcdGJ1dHRvblVwZGF0ZS5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmNvbG9yID0gYmFja2dyb3VuZENvbG9yXG5cdFx0XHRcdFx0dGhpcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0ZXh0Q29sb3Jcblx0XHRcdFx0fVxuXHRcblx0XHRcdFx0YnV0dG9uVXBkYXRlLm9ubW91c2VvdXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcdFx0XHRcdHRoaXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYmFja2dyb3VuZENvbG9yXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XG5cdFx0XHRidXR0b25DbG9zZS5zdHlsZS5jb2xvciA9IHRleHRDb2xvclxuXHRcblx0XHRcdGJ1dHRvbkNsb3NlLm9ubW91c2Vkb3duID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRvdXRkYXRlZFVJLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHR9XG5cdFxuXHRcdHZhciBnZXRNZXNzYWdlID0gZnVuY3Rpb24gKGxhbmcsIHVzZXJQcm92aWRlZExhbmd1YWdlSnNvbiwgY3VzdG9tQ1NTQ2xhc3Nlcykge1xuXHRcdFx0dmFyIGRlZmF1bHRNZXNzYWdlcyA9IHVzZXJQcm92aWRlZExhbmd1YWdlSnNvbltsYW5nXSB8fCBsYW5ndWFnZU1lc3NhZ2VzW2xhbmddIHx8IGxhbmd1YWdlTWVzc2FnZXMuZW47XG5cdFx0XHR2YXIgY3VzdG9tTWVzc2FnZXMgPSBvcHRpb25zLm1lc3NhZ2VzICYmIG9wdGlvbnMubWVzc2FnZXNbbGFuZ107XG5cdFx0XHR2YXIgbWVzc2FnZXMgPSBkZWVwRXh0ZW5kKHt9LCBkZWZhdWx0TWVzc2FnZXMsIGN1c3RvbU1lc3NhZ2VzKTtcblxuXHRcdFx0dmFyIHRpdGxlQ2xhc3MgPSAnJztcbiAgICAgIFx0XHR2YXIgY29udGVudENsYXNzID0gJyc7XG4gICAgICBcdFx0dmFyIGFjdGlvbkJ1dHRvbkNsYXNzID0gJyc7XG4gICAgICBcdFx0dmFyIGNsb3NlQnV0dG9uQ2xhc3MgPSAnJztcblxuXHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMpIHtcblx0XHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMudGl0bGVDbGFzcykge1xuXHRcdFx0XHRcdHRpdGxlQ2xhc3MgPSBjdXN0b21DU1NDbGFzc2VzLnRpdGxlQ2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMuY29udGVudENsYXNzKSB7XG5cdFx0XHRcdFx0Y29udGVudENsYXNzID0gY3VzdG9tQ1NTQ2xhc3Nlcy5jb250ZW50Q2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMuYWN0aW9uQnV0dG9uQ2xhc3MpIHtcblx0XHRcdFx0XHRhY3Rpb25CdXR0b25DbGFzcyA9IGN1c3RvbUNTU0NsYXNzZXMuYWN0aW9uQnV0dG9uQ2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMuY2xvc2VCdXR0b25DbGFzcykge1xuXHRcdFx0XHRcdGNsb3NlQnV0dG9uQ2xhc3MgPSBjdXN0b21DU1NDbGFzc2VzLmNsb3NlQnV0dG9uQ2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XG5cdFx0XHR2YXIgdXBkYXRlTWVzc2FnZXMgPSB7XG5cdFx0XHRcdHdlYjpcblx0XHRcdFx0XHRcIjxwIGNsYXNzPVxcXCJcIiArIGNvbnRlbnRDbGFzcyArIFwiXFxcIj5cIiArXG5cdFx0XHRcdFx0bWVzc2FnZXMudXBkYXRlLndlYiArXG5cdFx0XHRcdFx0KG1lc3NhZ2VzLnVybCA/IChcblx0XHRcdFx0XHRcdCc8YSBpZD1cImJ1dHRvblVwZGF0ZUJyb3dzZXJcIiByZWw9XCJub2ZvbGxvd1wiIGhyZWY9XCInICtcblx0XHRcdFx0XHRcdG1lc3NhZ2VzLnVybCArXG5cdFx0XHRcdFx0XHQnXCIgY2xhc3M9XCInICsgYWN0aW9uQnV0dG9uQ2xhc3MgKyAnXCIgPicgK1xuXHRcdFx0XHRcdFx0bWVzc2FnZXMuY2FsbFRvQWN0aW9uICtcblx0XHRcdFx0XHRcdFwiPC9hPlwiXG5cdFx0XHRcdFx0KSA6ICcnKSArXG5cdFx0XHRcdFx0XCI8L3A+XCIsXG5cdFx0XHRcdGdvb2dsZVBsYXk6XG5cdFx0XHRcdFx0XCI8cCBjbGFzcz1cXFwiXCIgKyBjb250ZW50Q2xhc3MgKyBcIlxcXCI+XCIgK1xuXHRcdFx0XHRcdG1lc3NhZ2VzLnVwZGF0ZS5nb29nbGVQbGF5ICtcblx0XHRcdFx0XHQnPGEgaWQ9XCJidXR0b25VcGRhdGVCcm93c2VyXCIgcmVsPVwibm9mb2xsb3dcIiBocmVmPVwiaHR0cHM6Ly9wbGF5Lmdvb2dsZS5jb20vc3RvcmUvYXBwcy9kZXRhaWxzP2lkPWNvbS5hbmRyb2lkLmNocm9tZVwiIGNsYXNzPVwiJyArIGFjdGlvbkJ1dHRvbkNsYXNzICsgJ1wiID4nICtcblx0XHRcdFx0XHRtZXNzYWdlcy5jYWxsVG9BY3Rpb24gK1xuXHRcdFx0XHRcdFwiPC9hPjwvcD5cIixcblx0XHRcdFx0YXBwU3RvcmU6IFwiPHAgY2xhc3M9XFxcIlwiICsgY29udGVudENsYXNzICsgXCJcXFwiPlwiICsgbWVzc2FnZXMudXBkYXRlW3VwZGF0ZVNvdXJjZV0gKyBcIjwvcD5cIlxuXHRcdFx0fVxuXHRcblx0XHRcdHZhciB1cGRhdGVNZXNzYWdlID0gdXBkYXRlTWVzc2FnZXNbdXBkYXRlU291cmNlXVxuXHRcblx0XHRcdHZhciBicm93c2VyU3VwcG9ydE1lc3NhZ2UgPSBtZXNzYWdlcy5vdXRPZkRhdGU7XG5cdFx0XHRpZiAoaXNCcm93c2VyVW5zdXBwb3J0ZWQgJiYgbWVzc2FnZXMudW5zdXBwb3J0ZWQpIHtcblx0XHRcdFx0YnJvd3NlclN1cHBvcnRNZXNzYWdlID0gbWVzc2FnZXMudW5zdXBwb3J0ZWQ7XG5cdFx0XHR9XG5cdFxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJ2ZXJ0aWNhbC1jZW50ZXJcIj48aDYgY2xhc3M9XCInICsgdGl0bGVDbGFzcyArICdcIiA+JyArXG5cdFx0XHRcdGJyb3dzZXJTdXBwb3J0TWVzc2FnZSArXG5cdFx0XHRcdFwiPC9oNj5cIiArXG5cdFx0XHRcdHVwZGF0ZU1lc3NhZ2UgK1xuXHRcdFx0XHQnPHAgY2xhc3M9XCJsYXN0ICcgKyBjbG9zZUJ1dHRvbkNsYXNzICsgJ1wiPjxhIGhyZWY9XCIjXCIgaWQ9XCJidXR0b25DbG9zZVVwZGF0ZUJyb3dzZXJcIiB0aXRsZT1cIicgK1xuXHRcdFx0XHRtZXNzYWdlcy5jbG9zZSArXG5cdFx0XHRcdCdcIj4mdGltZXM7PC9hPjwvcD48L2Rpdj4nXG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0dmFyIHJlc3VsdCA9IGV2YWx1YXRlQnJvd3NlcihwYXJzZWRVc2VyQWdlbnQsIG9wdGlvbnMpO1xuXHRcdHZhciBub3RFeHBsaWNpdGx5QWxsb3dCeVVzZXJBZ2VudEtleXdvcmQgPSB0cnVlO1xuXHRcdGlmIChvcHRpb25zLmFsbG93ZWRVc2VyQWdlbnRLZXl3b3Jkcykge1xuXHRcdFx0Zm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbnMuYWxsb3dlZFVzZXJBZ2VudEtleXdvcmRzLmxlbmd0aDsgaW5kZXgrKykge1xuXHRcdFx0XHR2YXIga2V5d29yZCA9IG9wdGlvbnMuYWxsb3dlZFVzZXJBZ2VudEtleXdvcmRzW2luZGV4XTtcblx0XHRcdFx0aWYgKHBhcnNlZFVzZXJBZ2VudC51YS5pbmRleE9mKGtleXdvcmQpICE9PSAtMSkge1xuXHRcdFx0XHRcdG5vdEV4cGxpY2l0bHlBbGxvd0J5VXNlckFnZW50S2V5d29yZCA9IGZhbHNlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChub3RFeHBsaWNpdGx5QWxsb3dCeVVzZXJBZ2VudEtleXdvcmQgJiYgKHJlc3VsdC5pc0FuZHJvaWRCdXROb3RDaHJvbWUgfHwgcmVzdWx0LmlzQnJvd3Nlck91dE9mRGF0ZSB8fCAhcmVzdWx0LmlzUHJvcGVydHlTdXBwb3J0ZWQpKSB7XG5cdFx0XHQvLyBUaGlzIGlzIGFuIG91dGRhdGVkIGJyb3dzZXIgYW5kIHRoZSBiYW5uZXIgbmVlZHMgdG8gc2hvd1xuXG5cdFx0XHQvLyBTZXQgdGhpcyBmbGFnIHdpdGggdGhlIHJlc3VsdCBmb3IgYGdldE1lc3NhZ2VgXG5cdFx0XHRpc0Jyb3dzZXJVbnN1cHBvcnRlZCA9IHJlc3VsdC5pc0Jyb3dzZXJVbnN1cHBvcnRlZFxuXG5cdFx0XHRpZiAoZG9uZSAmJiBvdXRkYXRlZFVJLnN0eWxlLm9wYWNpdHkgIT09IFwiMVwiKSB7XG5cdFx0XHRcdGRvbmUgPSBmYWxzZVxuXHRcblx0XHRcdFx0Zm9yICh2YXIgb3BhY2l0eSA9IDE7IG9wYWNpdHkgPD0gMTAwOyBvcGFjaXR5KyspIHtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KG1ha2VGYWRlSW5GdW5jdGlvbihvcGFjaXR5KSwgb3BhY2l0eSAqIDgpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XG5cdFx0XHR2YXIgaW5zZXJ0Q29udGVudEhlcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm91dGRhdGVkXCIpXG5cdFx0XHRpZiAoZnVsbHNjcmVlbikge1xuXHRcdFx0XHRpbnNlcnRDb250ZW50SGVyZS5jbGFzc0xpc3QuYWRkKFwiZnVsbHNjcmVlblwiKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGN1c3RvbUNTU0NsYXNzZXMud3JhcHBlckNsYXNzKSB7XG5cdFx0XHRcdGluc2VydENvbnRlbnRIZXJlLmNsYXNzTGlzdC5hZGQoY3VzdG9tQ1NTQ2xhc3Nlcy53cmFwcGVyQ2xhc3MpO1xuXHRcdFx0fVxuXHRcdFx0aW5zZXJ0Q29udGVudEhlcmUuaW5uZXJIVE1MID0gZ2V0TWVzc2FnZShsYW5ndWFnZSwgbGFuZ3VhZ2VzLCBjdXN0b21DU1NDbGFzc2VzKTtcblx0XHRcdHN0YXJ0U3R5bGVzQW5kRXZlbnRzKClcblx0XHR9XG5cdH1cblxuXHQvLyBMb2FkIG1haW4gd2hlbiBET00gcmVhZHkuXG5cdGlmIChvbmxvYWQpIHtcblx0XHR2YXIgb2xkT25sb2FkID0gd2luZG93Lm9ubG9hZDtcblx0XHRpZiAodHlwZW9mIHdpbmRvdy5vbmxvYWQgIT09ICdmdW5jdGlvbicpIHtcblx0XHQgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7IG1haW4odXNlclByb3ZpZGVkT3B0aW9ucykgfTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0ICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKG9sZE9ubG9hZCkge1xuXHRcdFx0ICBvbGRPbmxvYWQoKTtcblx0XHRcdH1cblx0XHRcdG1haW4odXNlclByb3ZpZGVkT3B0aW9ucyxvbmxvYWQpO1xuXHRcdCAgfTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0bWFpbih1c2VyUHJvdmlkZWRPcHRpb25zLCBvbmxvYWQpO1xuXHR9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwia29cIjoge1xuICAgIFwib3V0T2ZEYXRlXCI6IFwi7LWc7IugIOu4jOudvOyasOyggOqwgCDslYTri5nri4jri6QhXCIsXG4gICAgXCJ1cGRhdGVcIjoge1xuICAgICAgXCJ3ZWJcIjogXCLsm7nsgqzsnbTtirjrpbwg7KCc64yA66GcIOuztOugpOuptCDruIzrnbzsmrDsoIDrpbwg7JeF642w7J207Yq47ZWY7IS47JqULlwiLFxuICAgICAgXCJnb29nbGVQbGF5XCI6IFwiR29vZ2xlIFBsYXnsl5DshJwgQ2hyb21l7J2EIOyEpOy5mO2VmOyEuOyalFwiLFxuICAgICAgXCJhcHBTdG9yZVwiOiBcIuyEpOyglSDslbHsl5DshJwgaU9T66W8IOyXheuNsOydtO2KuO2VmOyEuOyalFwiXG4gICAgfSxcbiAgICBcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcbiAgICBcImNhbGxUb0FjdGlvblwiOiBcIuyngOq4iCDruIzrnbzsmrDsoIAg7JeF642w7J207Yq47ZWY6riwXCIsXG4gICAgXCJjbG9zZVwiOiBcIuuLq+q4sFwiXG4gIH0sXG4gIFwiamFcIjoge1xuICAgIFwib3V0T2ZEYXRlXCI6IFwi5Y+k44GE44OW44Op44Km44K244KS44GK5L2/44GE44Gu44KI44GG44Gn44GZ44CCXCIsXG4gICAgXCJ1cGRhdGVcIjoge1xuICAgICAgXCJ3ZWJcIjogXCLjgqbjgqfjg5bjgrXjgqTjg4jjgpLmraPjgZfjgY/ooajnpLrjgafjgY3jgovjgojjgYbjgavjgIHjg5bjg6njgqbjgrbjgpLjgqLjg4Pjg5fjg4fjg7zjg4jjgZfjgabjgY/jgaDjgZXjgYTjgIJcIixcbiAgICAgIFwiZ29vZ2xlUGxheVwiOiBcIkdvb2dsZSBQbGF544GL44KJQ2hyb21l44KS44Kk44Oz44K544OI44O844Or44GX44Gm44GP44Gg44GV44GEXCIsXG4gICAgICBcImFwcFN0b3JlXCI6IFwi6Kit5a6a44GL44KJaU9T44KS44Ki44OD44OX44OH44O844OI44GX44Gm44GP44Gg44GV44GEXCJcbiAgICB9LFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuICAgIFwiY2FsbFRvQWN0aW9uXCI6IFwi5LuK44GZ44GQ44OW44Op44Km44K244KS44Ki44OD44OX44OH44O844OI44GZ44KLXCIsXG4gICAgXCJjbG9zZVwiOiBcIumWieOBmOOCi1wiXG4gIH0sIFxuXHRcImJyXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIk8gc2V1IG5hdmVnYWRvciBlc3QmYWFjdXRlOyBkZXNhdHVhbGl6YWRvIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiQXR1YWxpemUgbyBzZXUgbmF2ZWdhZG9yIHBhcmEgdGVyIHVtYSBtZWxob3IgZXhwZXJpJmVjaXJjO25jaWEgZSB2aXN1YWxpemEmY2NlZGlsOyZhdGlsZGU7byBkZXN0ZSBzaXRlLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiQXR1YWxpemUgbyBzZXUgbmF2ZWdhZG9yIGFnb3JhXCIsXG5cdFx0XCJjbG9zZVwiOiBcIkZlY2hhclwiXG5cdH0sXG5cdFwiY2FcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiRWwgdm9zdHJlIG5hdmVnYWRvciBubyBlc3TDoCBhY3R1YWxpdHphdCFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkFjdHVhbGl0emV1IGVsIHZvc3RyZSBuYXZlZ2Fkb3IgcGVyIHZldXJlIGNvcnJlY3RhbWVudCBhcXVlc3QgbGxvYyB3ZWIuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiSW5zdGFswrdsZXUgQ2hyb21lIGRlcyBkZSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIkFjdHVhbGl0emV1IGlPUyBkZXMgZGUgbCdhcGxpY2FjacOzIENvbmZpZ3VyYWNpw7NcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJBY3R1YWxpdHphciBlbCBtZXUgbmF2ZWdhZG9yIGFyYVwiLFxuXHRcdFwiY2xvc2VcIjogXCJUYW5jYXJcIlxuXHR9LFxuXHRcInpoXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIuaCqOeahOa1j+iniOWZqOW3sui/h+aXtlwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwi6KaB5q2j5bi45rWP6KeI5pys572R56uZ6K+35Y2H57qn5oKo55qE5rWP6KeI5Zmo44CCXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIueOsOWcqOWNh+e6p1wiLFxuXHRcdFwiY2xvc2VcIjogXCLlhbPpl61cIlxuXHR9LFxuXHRcImN6XCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIlbDocWhIHByb2hsw63FvmXEjSBqZSB6YXN0YXJhbMO9IVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiUHJvIHNwcsOhdm7DqSB6b2JyYXplbsOtIHTEm2NodG8gc3Ryw6FuZWsgYWt0dWFsaXp1anRlIHN2xa9qIHByb2hsw63FvmXEjS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJOYWluc3RhbHVqdGUgc2kgQ2hyb21lIHogR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJBa3R1YWxpenVqdGUgc2kgc3lzdMOpbSBpT1NcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJBa3R1YWxpem92YXQgbnluw60gc3bFr2ogcHJvaGzDrcW+ZcSNXCIsXG5cdFx0XCJjbG9zZVwiOiBcIlphdsWZw610XCJcblx0fSxcblx0XCJkYVwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJEaW4gYnJvd3NlciBlciBmb3LDpmxkZXQhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJPcGRhdMOpciBkaW4gYnJvd3NlciBmb3IgYXQgZsOlIHZpc3QgZGVubmUgaGplbW1lc2lkZSBrb3JyZWt0LiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIkluc3RhbGzDqXIgdmVubGlnc3QgQ2hyb21lIGZyYSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIk9wZGF0w6lyIHZlbmxpZ3N0IGlPU1wiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIk9wZGF0w6lyIGRpbiBicm93c2VyIG51XCIsXG5cdFx0XCJjbG9zZVwiOiBcIkx1a1wiXG5cdH0sXG5cdFwiZGVcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiSWhyIEJyb3dzZXIgaXN0IHZlcmFsdGV0IVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiQml0dGUgYWt0dWFsaXNpZXJlbiBTaWUgSWhyZW4gQnJvd3NlciwgdW0gZGllc2UgV2Vic2l0ZSBrb3JyZWt0IGRhcnp1c3RlbGxlbi4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIkRlbiBCcm93c2VyIGpldHp0IGFrdHVhbGlzaWVyZW4gXCIsXG5cdFx0XCJjbG9zZVwiOiBcIlNjaGxpZcOfZW5cIlxuXHR9LFxuXHRcImVlXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIlNpbnUgdmVlYmlsZWhpdHNlamEgb24gdmFuYW5lbnVkIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiUGFsdW4gdXVlbmRhIG9tYSB2ZWViaWxlaGl0c2VqYXQsIGV0IG7DpGhhIGxlaGVrw7xsZ2Uga29ycmVrdHNlbHQuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJVdWVuZGEgb21hIHZlZWJpbGVoaXRzZWphdCBrb2hlXCIsXG5cdFx0XCJjbG9zZVwiOiBcIlN1bGdlXCJcblx0fSxcblx0XCJlblwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJZb3VyIGJyb3dzZXIgaXMgb3V0LW9mLWRhdGUhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJVcGRhdGUgeW91ciBicm93c2VyIHRvIHZpZXcgdGhpcyB3ZWJzaXRlIGNvcnJlY3RseS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIlVwZGF0ZSBteSBicm93c2VyIG5vd1wiLFxuXHRcdFwiY2xvc2VcIjogXCJDbG9zZVwiXG5cdH0sXG5cdFwiZXNcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiwqFUdSBuYXZlZ2Fkb3IgZXN0w6EgYW50aWN1YWRvIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiQWN0dWFsaXphIHR1IG5hdmVnYWRvciBwYXJhIHZlciBlc3RhIHDDoWdpbmEgY29ycmVjdGFtZW50ZS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIkFjdHVhbGl6YXIgbWkgbmF2ZWdhZG9yIGFob3JhXCIsXG5cdFx0XCJjbG9zZVwiOiBcIkNlcnJhclwiXG5cdH0sXG5cdFwiZmFcIjoge1xuXHRcdFwicmlnaHRUb0xlZnRcIjogdHJ1ZSxcblx0XHRcIm91dE9mRGF0ZVwiOiBcItmF2LHZiNix2q/YsSDYtNmF2Kcg2YXZhtiz2YjYriDYtNiv2Ycg2KfYs9iqIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwi2KzZh9iqINmF2LTYp9mH2K/ZhyDYtdit24zYrSDYp9uM2YYg2YjYqNiz2KfbjNiq2Iwg2YXYsdmI2LHar9ix2KrYp9mGINix2Kcg2KjYsdmI2LIg2LHYs9in2YbbjCDZhtmF2KfbjNuM2K8uIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCLZh9mF24zZhiDYrdin2YTYpyDZhdix2YjYsdqv2LHZhSDYsdinINio2LHZiNiyINqp2YZcIixcblx0XHRcImNsb3NlXCI6IFwiQ2xvc2VcIlxuXHR9LFxuXHRcImZpXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIlNlbGFpbWVzaSBvbiB2YW5oZW50dW51dCFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkxhdGFhIGFqYW50YXNhaW5lbiBzZWxhaW4gbiZhdW1sO2hkJmF1bWw7a3Nlc2kgdCZhdW1sO20mYXVtbDtuIHNpdnVuIG9pa2Vpbi4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJBc2VubmEgdXVzaW4gQ2hyb21lIEdvb2dsZSBQbGF5IC1rYXVwYXN0YVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlDDpGl2aXTDpCBpT1MgcHVoZWxpbWVzaSBhc2V0dWtzaXN0YVwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIlAmYXVtbDtpdml0JmF1bWw7IHNlbGFpbWVuaSBueXQgXCIsXG5cdFx0XCJjbG9zZVwiOiBcIlN1bGplXCJcblx0fSxcblx0XCJmclwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJWb3RyZSBuYXZpZ2F0ZXVyIG4nZXN0IHBsdXMgY29tcGF0aWJsZSAhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJNZXR0ZXogw6Agam91ciB2b3RyZSBuYXZpZ2F0ZXVyIHBvdXIgYWZmaWNoZXIgY29ycmVjdGVtZW50IGNlIHNpdGUgV2ViLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIk1lcmNpIGQnaW5zdGFsbGVyIENocm9tZSBkZXB1aXMgbGUgR29vZ2xlIFBsYXkgU3RvcmVcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJNZXJjaSBkZSBtZXR0cmUgw6Agam91ciBpT1MgZGVwdWlzIGwnYXBwbGljYXRpb24gUsOpZ2xhZ2VzXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiTWV0dHJlIMOgIGpvdXIgbWFpbnRlbmFudCBcIixcblx0XHRcImNsb3NlXCI6IFwiRmVybWVyXCJcblx0fSxcblx0XCJodVwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJBIGLDtm5nw6lzesWRamUgZWxhdnVsdCFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkZpcnNzw610c2UgdmFneSBjc2Vyw6lsamUgbGUgYSBiw7ZuZ8Opc3rFkWrDqXQuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJBIGLDtm5nw6lzesWRbSBmcmlzc8OtdMOpc2UgXCIsXG5cdFx0XCJjbG9zZVwiOiBcIkNsb3NlXCJcblx0fSxcblx0XCJpZFwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJCcm93c2VyIHlhbmcgQW5kYSBndW5ha2FuIHN1ZGFoIGtldGluZ2dhbGFuIHphbWFuIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiUGVyYmFoYXJ1aWxhaCBicm93c2VyIEFuZGEgYWdhciBiaXNhIG1lbmplbGFqYWhpIHdlYnNpdGUgaW5pIGRlbmdhbiBueWFtYW4uIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJQZXJiYWhhcnVpIGJyb3dzZXIgc2VrYXJhbmcgXCIsXG5cdFx0XCJjbG9zZVwiOiBcIkNsb3NlXCJcblx0fSxcblx0XCJpdFwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJJbCB0dW8gYnJvd3NlciBub24gJmVncmF2ZTsgYWdnaW9ybmF0byFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkFnZ2lvcm5hbG8gcGVyIHZlZGVyZSBxdWVzdG8gc2l0byBjb3JyZXR0YW1lbnRlLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiQWdnaW9ybmEgb3JhXCIsXG5cdFx0XCJjbG9zZVwiOiBcIkNoaXVkaVwiXG5cdH0sXG5cdFwibHRcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwiSsWrc8WzIG5hcsWheWtsxJdzIHZlcnNpamEgeXJhIHBhc2VudXNpIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiQXRuYXVqaW5raXRlIHNhdm8gbmFyxaF5a2zEmSwga2FkIGdhbMSXdHVtxJd0ZSBwZXLFvmnFq3LEl3RpIMWhacSFIHN2ZXRhaW7EmSB0aW5rYW1haS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIkF0bmF1amludGkgbmFyxaF5a2zEmSBcIixcblx0XHRcImNsb3NlXCI6IFwiQ2xvc2VcIlxuXHR9LFxuXHRcIm5sXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIkplIGdlYnJ1aWt0IGVlbiBvdWRlIGJyb3dzZXIhXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJVcGRhdGUgamUgYnJvd3NlciBvbSBkZXplIHdlYnNpdGUgY29ycmVjdCB0ZSBiZWtpamtlbi4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIlVwZGF0ZSBtaWpuIGJyb3dzZXIgbnUgXCIsXG5cdFx0XCJjbG9zZVwiOiBcIlNsdWl0ZW5cIlxuXHR9LFxuXHRcInBsXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIlR3b2phIHByemVnbMSFZGFya2EgamVzdCBwcnplc3RhcnphxYJhIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiWmFrdHVhbGl6dWogc3dvasSFIHByemVnbMSFZGFya8SZLCBhYnkgcG9wcmF3bmllIHd5xZt3aWV0bGnEhyB0xJkgc3Ryb27EmS4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQcm9zesSZIHphaW5zdGFsb3dhxIcgcHJ6ZWdsxIVkYXJrxJkgQ2hyb21lIHplIHNrbGVwdSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlByb3N6xJkgemFrdHVhbGl6b3dhxIcgaU9TIHogVXN0YXdpZcWEXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiWmFrdHVhbGl6dWogcHJ6ZWdsxIVkYXJrxJkganXFvCB0ZXJhelwiLFxuXHRcdFwiY2xvc2VcIjogXCJaYW1rbmlqXCJcblx0fSxcblx0XCJwdFwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJPIHNldSBicm93c2VyIGVzdCZhYWN1dGU7IGRlc2F0dWFsaXphZG8hXCIsXG5cdFx0XCJ1cGRhdGVcIjoge1xuXHRcdFx0XCJ3ZWJcIjogXCJBdHVhbGl6ZSBvIHNldSBicm93c2VyIHBhcmEgdGVyIHVtYSBtZWxob3IgZXhwZXJpJmVjaXJjO25jaWEgZSB2aXN1YWxpemEmY2NlZGlsOyZhdGlsZGU7byBkZXN0ZSBzaXRlLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiQXR1YWxpemUgbyBzZXUgYnJvd3NlciBhZ29yYVwiLFxuXHRcdFwiY2xvc2VcIjogXCJGZWNoYXJcIlxuXHR9LFxuXHRcInJvXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIkJyb3dzZXJ1bCBlc3RlIMOubnZlY2hpdCFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcIkFjdHVhbGl6YcibaSBicm93c2VydWwgcGVudHJ1IGEgdml6dWFsaXphIGNvcmVjdCBhY2VzdCBzaXRlLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwiQWN0dWFsaXphyJtpIGJyb3dzZXJ1bCBhY3VtIVwiLFxuXHRcdFwiY2xvc2VcIjogXCJDbG9zZVwiXG5cdH0sXG5cdFwicnVcIjoge1xuXHRcdFwib3V0T2ZEYXRlXCI6IFwi0JLQsNGIINCx0YDQsNGD0LfQtdGAINGD0YHRgtCw0YDQtdC7IVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwi0J7QsdC90L7QstC40YLQtSDQstCw0Ygg0LHRgNCw0YPQt9C10YAg0LTQu9GPINC/0YDQsNCy0LjQu9GM0L3QvtCz0L4g0L7RgtC+0LHRgNCw0LbQtdC90LjRjyDRjdGC0L7Qs9C+INGB0LDQudGC0LAuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCLQntCx0L3QvtCy0LjRgtGMINC80L7QuSDQsdGA0LDRg9C30LXRgCBcIixcblx0XHRcImNsb3NlXCI6IFwi0JfQsNC60YDRi9GC0YxcIlxuXHR9LFxuXHRcInNpXCI6IHtcblx0XHRcIm91dE9mRGF0ZVwiOiBcIlZhxaEgYnJza2FsbmlrIGplIHphc3RhcmVsIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiWmEgcHJhdmlsZW4gcHJpa2F6IHNwbGV0bmUgc3RyYW5pIHBvc29kb2JpdGUgdmHFoSBicnNrYWxuaWsuIFwiLFxuXHRcdFx0XCJnb29nbGVQbGF5XCI6IFwiUGxlYXNlIGluc3RhbGwgQ2hyb21lIGZyb20gR29vZ2xlIFBsYXlcIixcblx0XHRcdFwiYXBwU3RvcmVcIjogXCJQbGVhc2UgdXBkYXRlIGlPUyBmcm9tIHRoZSBTZXR0aW5ncyBBcHBcIlxuXHRcdH0sXG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2Jyb3dzZXItdXBkYXRlLm9yZy91cGRhdGUtYnJvd3Nlci5odG1sXCIsXG5cdFx0XCJjYWxsVG9BY3Rpb25cIjogXCJQb3NvZG9iaSBicnNrYWxuaWsgXCIsXG5cdFx0XCJjbG9zZVwiOiBcIlphcHJpXCJcblx0fSxcblx0XCJzdlwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCJEaW4gd2ViYmzDpHNhcmUgc3TDtmRqcyBlaiBsw6RuZ3JlIVwiLFxuXHRcdFwidXBkYXRlXCI6IHtcblx0XHRcdFwid2ViXCI6IFwiVXBwZGF0ZXJhIGRpbiB3ZWJibMOkc2FyZSBmw7ZyIGF0dCB3ZWJicGxhdHNlbiBza2EgdmlzYXMga29ycmVrdC4gXCIsXG5cdFx0XHRcImdvb2dsZVBsYXlcIjogXCJQbGVhc2UgaW5zdGFsbCBDaHJvbWUgZnJvbSBHb29nbGUgUGxheVwiLFxuXHRcdFx0XCJhcHBTdG9yZVwiOiBcIlBsZWFzZSB1cGRhdGUgaU9TIGZyb20gdGhlIFNldHRpbmdzIEFwcFwiXG5cdFx0fSxcblx0XHRcInVybFwiOiBcImh0dHBzOi8vYnJvd3Nlci11cGRhdGUub3JnL3VwZGF0ZS1icm93c2VyLmh0bWxcIixcblx0XHRcImNhbGxUb0FjdGlvblwiOiBcIlVwcGRhdGVyYSBtaW4gd2ViYmzDpHNhcmUgbnVcIixcblx0XHRcImNsb3NlXCI6IFwiU3TDpG5nXCJcblx0fSxcblx0XCJ1YVwiOiB7XG5cdFx0XCJvdXRPZkRhdGVcIjogXCLQktCw0Ygg0LHRgNCw0YPQt9C10YAg0LfQsNGB0YLQsNGA0ZbQsiFcIixcblx0XHRcInVwZGF0ZVwiOiB7XG5cdFx0XHRcIndlYlwiOiBcItCe0L3QvtCy0ZbRgtGMINCy0LDRiCDQsdGA0LDRg9C30LXRgCDQtNC70Y8g0L/RgNCw0LLQuNC70YzQvdC+0LPQviDQstGW0LTQvtCx0YDQsNC20LXQvdC90Y8g0YbRjNC+0LPQviDRgdCw0LnRgtCwLiBcIixcblx0XHRcdFwiZ29vZ2xlUGxheVwiOiBcIlBsZWFzZSBpbnN0YWxsIENocm9tZSBmcm9tIEdvb2dsZSBQbGF5XCIsXG5cdFx0XHRcImFwcFN0b3JlXCI6IFwiUGxlYXNlIHVwZGF0ZSBpT1MgZnJvbSB0aGUgU2V0dGluZ3MgQXBwXCJcblx0XHR9LFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9icm93c2VyLXVwZGF0ZS5vcmcvdXBkYXRlLWJyb3dzZXIuaHRtbFwiLFxuXHRcdFwiY2FsbFRvQWN0aW9uXCI6IFwi0J7QvdC+0LLQuNGC0Lgg0LzRltC5INCx0YDQsNGD0LfQtdGAIFwiLFxuXHRcdFwiY2xvc2VcIjogXCLQl9Cw0LrRgNC40YLQuFwiXG5cdH1cbn1cbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLyogVUFQYXJzZXIuanMgdjAuNy4zMVxuICAgQ29weXJpZ2h0IMKpIDIwMTItMjAyMSBGYWlzYWwgU2FsbWFuIDxmQGZhaXNhbG1hbi5jb20+XG4gICBNSVQgTGljZW5zZSAqLy8qXG4gICBEZXRlY3QgQnJvd3NlciwgRW5naW5lLCBPUywgQ1BVLCBhbmQgRGV2aWNlIHR5cGUvbW9kZWwgZnJvbSBVc2VyLUFnZW50IGRhdGEuXG4gICBTdXBwb3J0cyBicm93c2VyICYgbm9kZS5qcyBlbnZpcm9ubWVudC4gXG4gICBEZW1vICAgOiBodHRwczovL2ZhaXNhbG1hbi5naXRodWIuaW8vdWEtcGFyc2VyLWpzXG4gICBTb3VyY2UgOiBodHRwczovL2dpdGh1Yi5jb20vZmFpc2FsbWFuL3VhLXBhcnNlci1qcyAqL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbihmdW5jdGlvbiAod2luZG93LCB1bmRlZmluZWQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ29uc3RhbnRzXG4gICAgLy8vLy8vLy8vLy8vL1xuXG5cbiAgICB2YXIgTElCVkVSU0lPTiAgPSAnMC43LjMxJyxcbiAgICAgICAgRU1QVFkgICAgICAgPSAnJyxcbiAgICAgICAgVU5LTk9XTiAgICAgPSAnPycsXG4gICAgICAgIEZVTkNfVFlQRSAgID0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgVU5ERUZfVFlQRSAgPSAndW5kZWZpbmVkJyxcbiAgICAgICAgT0JKX1RZUEUgICAgPSAnb2JqZWN0JyxcbiAgICAgICAgU1RSX1RZUEUgICAgPSAnc3RyaW5nJyxcbiAgICAgICAgTUFKT1IgICAgICAgPSAnbWFqb3InLFxuICAgICAgICBNT0RFTCAgICAgICA9ICdtb2RlbCcsXG4gICAgICAgIE5BTUUgICAgICAgID0gJ25hbWUnLFxuICAgICAgICBUWVBFICAgICAgICA9ICd0eXBlJyxcbiAgICAgICAgVkVORE9SICAgICAgPSAndmVuZG9yJyxcbiAgICAgICAgVkVSU0lPTiAgICAgPSAndmVyc2lvbicsXG4gICAgICAgIEFSQ0hJVEVDVFVSRT0gJ2FyY2hpdGVjdHVyZScsXG4gICAgICAgIENPTlNPTEUgICAgID0gJ2NvbnNvbGUnLFxuICAgICAgICBNT0JJTEUgICAgICA9ICdtb2JpbGUnLFxuICAgICAgICBUQUJMRVQgICAgICA9ICd0YWJsZXQnLFxuICAgICAgICBTTUFSVFRWICAgICA9ICdzbWFydHR2JyxcbiAgICAgICAgV0VBUkFCTEUgICAgPSAnd2VhcmFibGUnLFxuICAgICAgICBFTUJFRERFRCAgICA9ICdlbWJlZGRlZCcsXG4gICAgICAgIFVBX01BWF9MRU5HVEggPSAyNTU7XG5cbiAgICB2YXIgQU1BWk9OICA9ICdBbWF6b24nLFxuICAgICAgICBBUFBMRSAgID0gJ0FwcGxlJyxcbiAgICAgICAgQVNVUyAgICA9ICdBU1VTJyxcbiAgICAgICAgQkxBQ0tCRVJSWSA9ICdCbGFja0JlcnJ5JyxcbiAgICAgICAgQlJPV1NFUiA9ICdCcm93c2VyJyxcbiAgICAgICAgQ0hST01FICA9ICdDaHJvbWUnLFxuICAgICAgICBFREdFICAgID0gJ0VkZ2UnLFxuICAgICAgICBGSVJFRk9YID0gJ0ZpcmVmb3gnLFxuICAgICAgICBHT09HTEUgID0gJ0dvb2dsZScsXG4gICAgICAgIEhVQVdFSSAgPSAnSHVhd2VpJyxcbiAgICAgICAgTEcgICAgICA9ICdMRycsXG4gICAgICAgIE1JQ1JPU09GVCA9ICdNaWNyb3NvZnQnLFxuICAgICAgICBNT1RPUk9MQSAgPSAnTW90b3JvbGEnLFxuICAgICAgICBPUEVSQSAgID0gJ09wZXJhJyxcbiAgICAgICAgU0FNU1VORyA9ICdTYW1zdW5nJyxcbiAgICAgICAgU09OWSAgICA9ICdTb255JyxcbiAgICAgICAgWElBT01JICA9ICdYaWFvbWknLFxuICAgICAgICBaRUJSQSAgID0gJ1plYnJhJyxcbiAgICAgICAgRkFDRUJPT0sgICA9ICdGYWNlYm9vayc7XG5cbiAgICAvLy8vLy8vLy8vL1xuICAgIC8vIEhlbHBlclxuICAgIC8vLy8vLy8vLy9cblxuICAgIHZhciBleHRlbmQgPSBmdW5jdGlvbiAocmVnZXhlcywgZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgdmFyIG1lcmdlZFJlZ2V4ZXMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gcmVnZXhlcykge1xuICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zW2ldICYmIGV4dGVuc2lvbnNbaV0ubGVuZ3RoICUgMiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRSZWdleGVzW2ldID0gZXh0ZW5zaW9uc1tpXS5jb25jYXQocmVnZXhlc1tpXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkUmVnZXhlc1tpXSA9IHJlZ2V4ZXNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZFJlZ2V4ZXM7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcml6ZSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgICAgIHZhciBlbnVtcyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVudW1zW2FycltpXS50b1VwcGVyQ2FzZSgpXSA9IGFycltpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbnVtcztcbiAgICAgICAgfSxcbiAgICAgICAgaGFzID0gZnVuY3Rpb24gKHN0cjEsIHN0cjIpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3RyMSA9PT0gU1RSX1RZUEUgPyBsb3dlcml6ZShzdHIyKS5pbmRleE9mKGxvd2VyaXplKHN0cjEpKSAhPT0gLTEgOiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgbG93ZXJpemUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIG1ham9yaXplID0gZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YodmVyc2lvbikgPT09IFNUUl9UWVBFID8gdmVyc2lvbi5yZXBsYWNlKC9bXlxcZFxcLl0vZywgRU1QVFkpLnNwbGl0KCcuJylbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHRyaW0gPSBmdW5jdGlvbiAoc3RyLCBsZW4pIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yoc3RyKSA9PT0gU1RSX1RZUEUpIHtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXlxcc1xccyovLCBFTVBUWSkucmVwbGFjZSgvXFxzXFxzKiQvLCBFTVBUWSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZihsZW4pID09PSBVTkRFRl9UWVBFID8gc3RyIDogc3RyLnN1YnN0cmluZygwLCBVQV9NQVhfTEVOR1RIKTtcbiAgICAgICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gTWFwIGhlbHBlclxuICAgIC8vLy8vLy8vLy8vLy8vXG5cbiAgICB2YXIgcmd4TWFwcGVyID0gZnVuY3Rpb24gKHVhLCBhcnJheXMpIHtcblxuICAgICAgICAgICAgdmFyIGkgPSAwLCBqLCBrLCBwLCBxLCBtYXRjaGVzLCBtYXRjaDtcblxuICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGFsbCByZWdleGVzIG1hcHNcbiAgICAgICAgICAgIHdoaWxlIChpIDwgYXJyYXlzLmxlbmd0aCAmJiAhbWF0Y2hlcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlZ2V4ID0gYXJyYXlzW2ldLCAgICAgICAvLyBldmVuIHNlcXVlbmNlICgwLDIsNCwuLilcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMgPSBhcnJheXNbaSArIDFdOyAgIC8vIG9kZCBzZXF1ZW5jZSAoMSwzLDUsLi4pXG4gICAgICAgICAgICAgICAgaiA9IGsgPSAwO1xuXG4gICAgICAgICAgICAgICAgLy8gdHJ5IG1hdGNoaW5nIHVhc3RyaW5nIHdpdGggcmVnZXhlc1xuICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgcmVnZXgubGVuZ3RoICYmICFtYXRjaGVzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcyA9IHJlZ2V4W2orK10uZXhlYyh1YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhbWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChwID0gMDsgcCA8IHByb3BzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBtYXRjaGVzWysra107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcSA9IHByb3BzW3BdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGdpdmVuIHByb3BlcnR5IGlzIGFjdHVhbGx5IGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBxID09PSBPQkpfVFlQRSAmJiBxLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHEubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHFbMV0gPT0gRlVOQ19UWVBFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIG1vZGlmaWVkIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IHFbMV0uY2FsbCh0aGlzLCBtYXRjaCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBnaXZlbiB2YWx1ZSwgaWdub3JlIHJlZ2V4IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IHFbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocS5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHdoZXRoZXIgZnVuY3Rpb24gb3IgcmVnZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcVsxXSA9PT0gRlVOQ19UWVBFICYmICEocVsxXS5leGVjICYmIHFbMV0udGVzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsIGZ1bmN0aW9uICh1c3VhbGx5IHN0cmluZyBtYXBwZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IG1hdGNoID8gcVsxXS5jYWxsKHRoaXMsIG1hdGNoLCBxWzJdKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FuaXRpemUgbWF0Y2ggdXNpbmcgZ2l2ZW4gcmVnZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3FbMF1dID0gbWF0Y2ggPyBtYXRjaC5yZXBsYWNlKHFbMV0sIHFbMl0pIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHEubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IG1hdGNoID8gcVszXS5jYWxsKHRoaXMsIG1hdGNoLnJlcGxhY2UocVsxXSwgcVsyXSkpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txXSA9IG1hdGNoID8gbWF0Y2ggOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdHJNYXBwZXIgPSBmdW5jdGlvbiAoc3RyLCBtYXApIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBtYXApIHtcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBjdXJyZW50IHZhbHVlIGlzIGFycmF5XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXBbaV0gPT09IE9CSl9UWVBFICYmIG1hcFtpXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFwW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzKG1hcFtpXVtqXSwgc3RyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoaSA9PT0gVU5LTk9XTikgPyB1bmRlZmluZWQgOiBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChoYXMobWFwW2ldLCBzdHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoaSA9PT0gVU5LTk9XTikgPyB1bmRlZmluZWQgOiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgfTtcblxuICAgIC8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIFN0cmluZyBtYXBcbiAgICAvLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gU2FmYXJpIDwgMy4wXG4gICAgdmFyIG9sZFNhZmFyaU1hcCA9IHtcbiAgICAgICAgICAgICcxLjAnICAgOiAnLzgnLFxuICAgICAgICAgICAgJzEuMicgICA6ICcvMScsXG4gICAgICAgICAgICAnMS4zJyAgIDogJy8zJyxcbiAgICAgICAgICAgICcyLjAnICAgOiAnLzQxMicsXG4gICAgICAgICAgICAnMi4wLjInIDogJy80MTYnLFxuICAgICAgICAgICAgJzIuMC4zJyA6ICcvNDE3JyxcbiAgICAgICAgICAgICcyLjAuNCcgOiAnLzQxOScsXG4gICAgICAgICAgICAnPycgICAgIDogJy8nXG4gICAgICAgIH0sXG4gICAgICAgIHdpbmRvd3NWZXJzaW9uTWFwID0ge1xuICAgICAgICAgICAgJ01FJyAgICAgICAgOiAnNC45MCcsXG4gICAgICAgICAgICAnTlQgMy4xMScgICA6ICdOVDMuNTEnLFxuICAgICAgICAgICAgJ05UIDQuMCcgICAgOiAnTlQ0LjAnLFxuICAgICAgICAgICAgJzIwMDAnICAgICAgOiAnTlQgNS4wJyxcbiAgICAgICAgICAgICdYUCcgICAgICAgIDogWydOVCA1LjEnLCAnTlQgNS4yJ10sXG4gICAgICAgICAgICAnVmlzdGEnICAgICA6ICdOVCA2LjAnLFxuICAgICAgICAgICAgJzcnICAgICAgICAgOiAnTlQgNi4xJyxcbiAgICAgICAgICAgICc4JyAgICAgICAgIDogJ05UIDYuMicsXG4gICAgICAgICAgICAnOC4xJyAgICAgICA6ICdOVCA2LjMnLFxuICAgICAgICAgICAgJzEwJyAgICAgICAgOiBbJ05UIDYuNCcsICdOVCAxMC4wJ10sXG4gICAgICAgICAgICAnUlQnICAgICAgICA6ICdBUk0nXG4gICAgfTtcblxuICAgIC8vLy8vLy8vLy8vLy8vXG4gICAgLy8gUmVnZXggbWFwXG4gICAgLy8vLy8vLy8vLy8vL1xuXG4gICAgdmFyIHJlZ2V4ZXMgPSB7XG5cbiAgICAgICAgYnJvd3NlciA6IFtbXG5cbiAgICAgICAgICAgIC9cXGIoPzpjcm1vfGNyaW9zKVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZSBmb3IgQW5kcm9pZC9pT1NcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0Nocm9tZSddXSwgW1xuICAgICAgICAgICAgL2VkZyg/OmV8aW9zfGEpP1xcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgRWRnZVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnRWRnZSddXSwgW1xuXG4gICAgICAgICAgICAvLyBQcmVzdG8gYmFzZWRcbiAgICAgICAgICAgIC8ob3BlcmEgbWluaSlcXC8oWy1cXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgTWluaVxuICAgICAgICAgICAgLyhvcGVyYSBbbW9iaWxldGFiXXszLDZ9KVxcYi4rdmVyc2lvblxcLyhbLVxcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgLy8gT3BlcmEgTW9iaS9UYWJsZXRcbiAgICAgICAgICAgIC8ob3BlcmEpKD86Lit2ZXJzaW9uXFwvfFtcXC8gXSspKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9vcGlvc1tcXC8gXSsoW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgbWluaSBvbiBpcGhvbmUgPj0gOC4wXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIE9QRVJBKycgTWluaSddXSwgW1xuICAgICAgICAgICAgL1xcYm9wclxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgV2Via2l0XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIE9QRVJBXV0sIFtcblxuICAgICAgICAgICAgLy8gTWl4ZWRcbiAgICAgICAgICAgIC8oa2luZGxlKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlXG4gICAgICAgICAgICAvKGx1bmFzY2FwZXxtYXh0aG9ufG5ldGZyb250fGphc21pbmV8YmxhemVyKVtcXC8gXT8oW1xcd1xcLl0qKS9pLCAgICAgIC8vIEx1bmFzY2FwZS9NYXh0aG9uL05ldGZyb250L0phc21pbmUvQmxhemVyXG4gICAgICAgICAgICAvLyBUcmlkZW50IGJhc2VkXG4gICAgICAgICAgICAvKGF2YW50IHxpZW1vYmlsZXxzbGltKSg/OmJyb3dzZXIpP1tcXC8gXT8oW1xcd1xcLl0qKS9pLCAgICAgICAgICAgICAgIC8vIEF2YW50L0lFTW9iaWxlL1NsaW1Ccm93c2VyXG4gICAgICAgICAgICAvKGJhP2lkdWJyb3dzZXIpW1xcLyBdPyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJhaWR1IEJyb3dzZXJcbiAgICAgICAgICAgIC8oPzptc3xcXCgpKGllKSAoW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJuZXQgRXhwbG9yZXJcblxuICAgICAgICAgICAgLy8gV2Via2l0L0tIVE1MIGJhc2VkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9jay9Sb2NrTWVsdC9NaWRvcmkvRXBpcGhhbnkvU2lsay9Ta3lmaXJlL0JvbHQvSXJvbi9JcmlkaXVtL1BoYW50b21KUy9Cb3dzZXIvUXVwWmlsbGEvRmFsa29uXG4gICAgICAgICAgICAvKGZsb2NrfHJvY2ttZWx0fG1pZG9yaXxlcGlwaGFueXxzaWxrfHNreWZpcmV8b3ZpYnJvd3Nlcnxib2x0fGlyb258dml2YWxkaXxpcmlkaXVtfHBoYW50b21qc3xib3dzZXJ8cXVhcmt8cXVwemlsbGF8ZmFsa29ufHJla29ucXxwdWZmaW58YnJhdmV8d2hhbGV8cXFicm93c2VybGl0ZXxxcSlcXC8oWy1cXHdcXC5dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVrb25xL1B1ZmZpbi9CcmF2ZS9XaGFsZS9RUUJyb3dzZXJMaXRlL1FRLCBha2EgU2hvdVFcbiAgICAgICAgICAgIC8od2VpYm8pX18oW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZWlib1xuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKD86XFxidWM/ID9icm93c2VyfCg/Omp1Yy4rKXVjd2ViKVtcXC8gXT8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAvLyBVQ0Jyb3dzZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ1VDJytCUk9XU0VSXV0sIFtcbiAgICAgICAgICAgIC9cXGJxYmNvcmVcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlQ2hhdCBEZXNrdG9wIGZvciBXaW5kb3dzIEJ1aWx0LWluIEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ1dlQ2hhdChXaW4pIERlc2t0b3AnXV0sIFtcbiAgICAgICAgICAgIC9taWNyb21lc3NlbmdlclxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2VDaGF0XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdXZUNoYXQnXV0sIFtcbiAgICAgICAgICAgIC9rb25xdWVyb3JcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS29ucXVlcm9yXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdLb25xdWVyb3InXV0sIFtcbiAgICAgICAgICAgIC90cmlkZW50Litydls6IF0oW1xcd1xcLl17MSw5fSlcXGIuK2xpa2UgZ2Vja28vaSAgICAgICAgICAgICAgICAgICAgICAgLy8gSUUxMVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnSUUnXV0sIFtcbiAgICAgICAgICAgIC95YWJyb3dzZXJcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWWFuZGV4XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdZYW5kZXgnXV0sIFtcbiAgICAgICAgICAgIC8oYXZhc3R8YXZnKVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXZhc3QvQVZHIFNlY3VyZSBCcm93c2VyXG4gICAgICAgICAgICBdLCBbW05BTUUsIC8oLispLywgJyQxIFNlY3VyZSAnK0JST1dTRVJdLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL1xcYmZvY3VzXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCBGb2N1c1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBGSVJFRk9YKycgRm9jdXMnXV0sIFtcbiAgICAgICAgICAgIC9cXGJvcHRcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIFRvdWNoXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIE9QRVJBKycgVG91Y2gnXV0sIFtcbiAgICAgICAgICAgIC9jb2NfY29jXFx3K1xcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvYyBDb2MgQnJvd3NlclxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnQ29jIENvYyddXSwgW1xuICAgICAgICAgICAgL2RvbGZpblxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEb2xwaGluXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdEb2xwaGluJ11dLCBbXG4gICAgICAgICAgICAvY29hc3RcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIENvYXN0XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIE9QRVJBKycgQ29hc3QnXV0sIFtcbiAgICAgICAgICAgIC9taXVpYnJvd3NlclxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTUlVSSBCcm93c2VyXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdNSVVJICcrQlJPV1NFUl1dLCBbXG4gICAgICAgICAgICAvZnhpb3NcXC8oWy1cXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggZm9yIGlPU1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBGSVJFRk9YXV0sIFtcbiAgICAgICAgICAgIC9cXGJxaWh1fChxaT9obz9vP3wzNjApYnJvd3Nlci9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDM2MFxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnMzYwICcrQlJPV1NFUl1dLCBbXG4gICAgICAgICAgICAvKG9jdWx1c3xzYW1zdW5nfHNhaWxmaXNoKWJyb3dzZXJcXC8oW1xcd1xcLl0rKS9pXG4gICAgICAgICAgICBdLCBbW05BTUUsIC8oLispLywgJyQxICcrQlJPV1NFUl0sIFZFUlNJT05dLCBbICAgICAgICAgICAgICAgICAgICAgIC8vIE9jdWx1cy9TYW1zdW5nL1NhaWxmaXNoIEJyb3dzZXJcbiAgICAgICAgICAgIC8oY29tb2RvX2RyYWdvbilcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tb2RvIERyYWdvblxuICAgICAgICAgICAgXSwgW1tOQU1FLCAvXy9nLCAnICddLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLyhlbGVjdHJvbilcXC8oW1xcd1xcLl0rKSBzYWZhcmkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbGVjdHJvbi1iYXNlZCBBcHBcbiAgICAgICAgICAgIC8odGVzbGEpKD86IHF0Y2FyYnJvd3NlcnxcXC8oMjBcXGRcXGRcXC5bLVxcd1xcLl0rKSkvaSwgICAgICAgICAgICAgICAgICAgLy8gVGVzbGFcbiAgICAgICAgICAgIC9tPyhxcWJyb3dzZXJ8YmFpZHVib3hhcHB8MjM0NUV4cGxvcmVyKVtcXC8gXT8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgLy8gUVFCcm93c2VyL0JhaWR1IEFwcC8yMzQ1IEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLyhtZXRhc3IpW1xcLyBdPyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb3VHb3VCcm93c2VyXG4gICAgICAgICAgICAvKGxiYnJvd3NlcikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpZUJhbyBCcm93c2VyXG4gICAgICAgICAgICBdLCBbTkFNRV0sIFtcblxuICAgICAgICAgICAgLy8gV2ViVmlld1xuICAgICAgICAgICAgLygoPzpmYmFuXFwvZmJpb3N8ZmJfaWFiXFwvZmI0YSkoPyEuK2ZiYXYpfDtmYmF2XFwvKFtcXHdcXC5dKyk7KS9pICAgICAgIC8vIEZhY2Vib29rIEFwcCBmb3IgaU9TICYgQW5kcm9pZFxuICAgICAgICAgICAgXSwgW1tOQU1FLCBGQUNFQk9PS10sIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvc2FmYXJpIChsaW5lKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbmUgQXBwIGZvciBpT1NcbiAgICAgICAgICAgIC9cXGIobGluZSlcXC8oW1xcd1xcLl0rKVxcL2lhYi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMaW5lIEFwcCBmb3IgQW5kcm9pZFxuICAgICAgICAgICAgLyhjaHJvbWl1bXxpbnN0YWdyYW0pW1xcLyBdKFstXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWl1bS9JbnN0YWdyYW1cbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL1xcYmdzYVxcLyhbXFx3XFwuXSspIC4qc2FmYXJpXFwvL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBTZWFyY2ggQXBwbGlhbmNlIG9uIGlPU1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnR1NBJ11dLCBbXG5cbiAgICAgICAgICAgIC9oZWFkbGVzc2Nocm9tZSg/OlxcLyhbXFx3XFwuXSspfCApL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIEhlYWRsZXNzXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIENIUk9NRSsnIEhlYWRsZXNzJ11dLCBbXG5cbiAgICAgICAgICAgIC8gd3ZcXCkuKyhjaHJvbWUpXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZSBXZWJWaWV3XG4gICAgICAgICAgICBdLCBbW05BTUUsIENIUk9NRSsnIFdlYlZpZXcnXSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgL2Ryb2lkLisgdmVyc2lvblxcLyhbXFx3XFwuXSspXFxiLisoPzptb2JpbGUgc2FmYXJpfHNhZmFyaSkvaSAgICAgICAgICAgLy8gQW5kcm9pZCBCcm93c2VyXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdBbmRyb2lkICcrQlJPV1NFUl1dLCBbXG5cbiAgICAgICAgICAgIC8oY2hyb21lfG9tbml3ZWJ8YXJvcmF8W3RpemVub2thXXs1fSA/YnJvd3NlcilcXC92PyhbXFx3XFwuXSspL2kgICAgICAgLy8gQ2hyb21lL09tbmlXZWIvQXJvcmEvVGl6ZW4vTm9raWFcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvdmVyc2lvblxcLyhbXFx3XFwuXSspIC4qbW9iaWxlXFwvXFx3KyAoc2FmYXJpKS9pICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW9iaWxlIFNhZmFyaVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnTW9iaWxlIFNhZmFyaSddXSwgW1xuICAgICAgICAgICAgL3ZlcnNpb25cXC8oW1xcd1xcLl0rKSAuKihtb2JpbGUgP3NhZmFyaXxzYWZhcmkpL2kgICAgICAgICAgICAgICAgICAgICAvLyBTYWZhcmkgJiBTYWZhcmkgTW9iaWxlXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgTkFNRV0sIFtcbiAgICAgICAgICAgIC93ZWJraXQuKz8obW9iaWxlID9zYWZhcml8c2FmYXJpKShcXC9bXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIDwgMy4wXG4gICAgICAgICAgICBdLCBbTkFNRSwgW1ZFUlNJT04sIHN0ck1hcHBlciwgb2xkU2FmYXJpTWFwXV0sIFtcblxuICAgICAgICAgICAgLyh3ZWJraXR8a2h0bWwpXFwvKFtcXHdcXC5dKykvaVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8vIEdlY2tvIGJhc2VkXG4gICAgICAgICAgICAvKG5hdmlnYXRvcnxuZXRzY2FwZVxcZD8pXFwvKFstXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXRzY2FwZVxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnTmV0c2NhcGUnXSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9tb2JpbGUgdnI7IHJ2OihbXFx3XFwuXSspXFwpLitmaXJlZm94L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCBSZWFsaXR5XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIEZJUkVGT1grJyBSZWFsaXR5J11dLCBbXG4gICAgICAgICAgICAvZWtpb2hmLisoZmxvdylcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb3dcbiAgICAgICAgICAgIC8oc3dpZnRmb3gpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3dpZnRmb3hcbiAgICAgICAgICAgIC8oaWNlZHJhZ29ufGljZXdlYXNlbHxjYW1pbm98Y2hpbWVyYXxmZW5uZWN8bWFlbW8gYnJvd3NlcnxtaW5pbW98Y29ua2Vyb3J8a2xhcilbXFwvIF0/KFtcXHdcXC5cXCtdKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWNlRHJhZ29uL0ljZXdlYXNlbC9DYW1pbm8vQ2hpbWVyYS9GZW5uZWMvTWFlbW8vTWluaW1vL0Nvbmtlcm9yL0tsYXJcbiAgICAgICAgICAgIC8oc2VhbW9ua2V5fGstbWVsZW9ufGljZWNhdHxpY2VhcGV8ZmlyZWJpcmR8cGhvZW5peHxwYWxlbW9vbnxiYXNpbGlza3x3YXRlcmZveClcXC8oWy1cXHdcXC5dKykkL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3gvU2VhTW9ua2V5L0stTWVsZW9uL0ljZUNhdC9JY2VBcGUvRmlyZWJpcmQvUGhvZW5peFxuICAgICAgICAgICAgLyhmaXJlZm94KVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBGaXJlZm94LWJhc2VkXG4gICAgICAgICAgICAvKG1vemlsbGEpXFwvKFtcXHdcXC5dKykgLitydlxcOi4rZ2Vja29cXC9cXGQrL2ksICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1vemlsbGFcblxuICAgICAgICAgICAgLy8gT3RoZXJcbiAgICAgICAgICAgIC8ocG9sYXJpc3xseW54fGRpbGxvfGljYWJ8ZG9yaXN8YW1heWF8dzNtfG5ldHN1cmZ8c2xlaXBuaXJ8b2JpZ298bW9zYWljfCg/OmdvfGljZXx1cClbXFwuIF0/YnJvd3NlcilbLVxcLyBdP3Y/KFtcXHdcXC5dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUG9sYXJpcy9MeW54L0RpbGxvL2lDYWIvRG9yaXMvQW1heWEvdzNtL05ldFN1cmYvU2xlaXBuaXIvT2JpZ28vTW9zYWljL0dvL0lDRS9VUC5Ccm93c2VyXG4gICAgICAgICAgICAvKGxpbmtzKSBcXCgoW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbmtzXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl1cbiAgICAgICAgXSxcblxuICAgICAgICBjcHUgOiBbW1xuXG4gICAgICAgICAgICAvKD86KGFtZHx4KD86KD86ODZ8NjQpWy1fXSk/fHdvd3x3aW4pNjQpWztcXCldL2kgICAgICAgICAgICAgICAgICAgICAvLyBBTUQ2NCAoeDY0KVxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdhbWQ2NCddXSwgW1xuXG4gICAgICAgICAgICAvKGlhMzIoPz07KSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBMzIgKHF1aWNrdGltZSlcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCBsb3dlcml6ZV1dLCBbXG5cbiAgICAgICAgICAgIC8oKD86aVszNDZdfHgpODYpWztcXCldL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBMzIgKHg4NilcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnaWEzMiddXSwgW1xuXG4gICAgICAgICAgICAvXFxiKGFhcmNoNjR8YXJtKHY/OGU/bD98Xz82NCkpXFxiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBUk02NFxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdhcm02NCddXSwgW1xuXG4gICAgICAgICAgICAvXFxiKGFybSg/OnZbNjddKT9odD9uP1tmbF1wPylcXGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQVJNSEZcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnYXJtaGYnXV0sIFtcblxuICAgICAgICAgICAgLy8gUG9ja2V0UEMgbWlzdGFrZW5seSBpZGVudGlmaWVkIGFzIFBvd2VyUENcbiAgICAgICAgICAgIC93aW5kb3dzIChjZXxtb2JpbGUpOyBwcGM7L2lcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnYXJtJ11dLCBbXG5cbiAgICAgICAgICAgIC8oKD86cHBjfHBvd2VycGMpKD86NjQpPykoPzogbWFjfDt8XFwpKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBvd2VyUENcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAvb3dlci8sIEVNUFRZLCBsb3dlcml6ZV1dLCBbXG5cbiAgICAgICAgICAgIC8oc3VuNFxcdylbO1xcKV0vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTUEFSQ1xuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdzcGFyYyddXSwgW1xuXG4gICAgICAgICAgICAvKCg/OmF2cjMyfGlhNjQoPz07KSl8NjhrKD89XFwpKXxcXGJhcm0oPz12KD86WzEtN118WzUtN10xKWw/fDt8ZWFiaSl8KD89YXRtZWwgKWF2cnwoPzppcml4fG1pcHN8c3BhcmMpKD86NjQpP1xcYnxwYS1yaXNjKS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBNjQsIDY4SywgQVJNLzY0LCBBVlIvMzIsIElSSVgvNjQsIE1JUFMvNjQsIFNQQVJDLzY0LCBQQS1SSVNDXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgbG93ZXJpemVdXVxuICAgICAgICBdLFxuXG4gICAgICAgIGRldmljZSA6IFtbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBNT0JJTEVTICYgVEFCTEVUU1xuICAgICAgICAgICAgLy8gT3JkZXJlZCBieSBwb3B1bGFyaXR5XG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgICAgIC8vIFNhbXN1bmdcbiAgICAgICAgICAgIC9cXGIoc2NoLWlbODldMFxcZHxzaHctbTM4MHN8c20tW3B0XVxcd3syLDR9fGd0LVtwbl1cXGR7Miw0fXxzZ2gtdDhbNTZdOXxuZXh1cyAxMCkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBTQU1TVU5HXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKCg/OnNbY2dwXWh8Z3R8c20pLVxcdyt8Z2FsYXh5IG5leHVzKS9pLFxuICAgICAgICAgICAgL3NhbXN1bmdbLSBdKFstXFx3XSspL2ksXG4gICAgICAgICAgICAvc2VjLShzZ2hcXHcrKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFNBTVNVTkddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gQXBwbGVcbiAgICAgICAgICAgIC9cXCgoaXAoPzpob25lfG9kKVtcXHcgXSopOy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpUG9kL2lQaG9uZVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBBUFBMRV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcKChpcGFkKTtbLVxcd1xcKSw7IF0rYXBwbGUvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpUGFkXG4gICAgICAgICAgICAvYXBwbGVjb3JlbWVkaWFcXC9bXFx3XFwuXSsgXFwoKGlwYWQpL2ksXG4gICAgICAgICAgICAvXFxiKGlwYWQpXFxkXFxkPyxcXGRcXGQ/WztcXF1dLitpb3MvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBBUFBMRV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBIdWF3ZWlcbiAgICAgICAgICAgIC9cXGIoKD86YWdbcnNdWzIzXT98YmFoMj98c2h0P3xidHYpLWE/W2x3XVxcZHsyfSlcXGIoPyEuK2RcXC9zKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEhVQVdFSV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyg/Omh1YXdlaXxob25vcikoWy1cXHcgXSspWztcXCldL2ksXG4gICAgICAgICAgICAvXFxiKG5leHVzIDZwfFxcd3syLDR9LVthdHVdP1tsbl1bMDEyNTl4XVswMTIzNTldW2FuXT8pXFxiKD8hLitkXFwvcykvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBIVUFXRUldLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gWGlhb21pXG4gICAgICAgICAgICAvXFxiKHBvY29bXFx3IF0rKSg/OiBidWl8XFwpKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFhpYW9taSBQT0NPXG4gICAgICAgICAgICAvXFxiOyAoXFx3KykgYnVpbGRcXC9obVxcMS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBYaWFvbWkgSG9uZ21pICdudW1lcmljJyBtb2RlbHNcbiAgICAgICAgICAgIC9cXGIoaG1bLV8gXT9ub3RlP1tfIF0/KD86XFxkXFx3KT8pIGJ1aS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWGlhb21pIEhvbmdtaVxuICAgICAgICAgICAgL1xcYihyZWRtaVtcXC1fIF0/KD86bm90ZXxrKT9bXFx3XyBdKykoPzogYnVpfFxcKSkvaSwgICAgICAgICAgICAgICAgICAgLy8gWGlhb21pIFJlZG1pXG4gICAgICAgICAgICAvXFxiKG1pWy1fIF0/KD86YVxcZHxvbmV8b25lW18gXXBsdXN8bm90ZSBsdGV8bWF4KT9bXyBdPyg/OlxcZD9cXHc/KVtfIF0/KD86cGx1c3xzZXxsaXRlKT8pKD86IGJ1aXxcXCkpL2kgLy8gWGlhb21pIE1pXG4gICAgICAgICAgICBdLCBbW01PREVMLCAvXy9nLCAnICddLCBbVkVORE9SLCBYSUFPTUldLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIobWlbLV8gXT8oPzpwYWQpKD86W1xcd18gXSspKSg/OiBidWl8XFwpKS9pICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWkgUGFkIHRhYmxldHNcbiAgICAgICAgICAgIF0sW1tNT0RFTCwgL18vZywgJyAnXSwgW1ZFTkRPUiwgWElBT01JXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8vIE9QUE9cbiAgICAgICAgICAgIC87IChcXHcrKSBidWkuKyBvcHBvL2ksXG4gICAgICAgICAgICAvXFxiKGNwaFsxMl1cXGR7M318cCg/OmFmfGNbYWxdfGRcXHd8ZVthcl0pW210XVxcZDB8eDkwMDd8YTEwMW9wKVxcYi9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdPUFBPJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBWaXZvXG4gICAgICAgICAgICAvdml2byAoXFx3KykoPzogYnVpfFxcKSkvaSxcbiAgICAgICAgICAgIC9cXGIodlsxMl1cXGR7M31cXHc/W2F0XSkoPzogYnVpfDspL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1Zpdm8nXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIFJlYWxtZVxuICAgICAgICAgICAgL1xcYihybXhbMTJdXFxkezN9KSg/OiBidWl8O3xcXCkpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1JlYWxtZSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gTW90b3JvbGFcbiAgICAgICAgICAgIC9cXGIobWlsZXN0b25lfGRyb2lkKD86WzItNHhdfCAoPzpiaW9uaWN8eDJ8cHJvfHJhenIpKT86PyggNGcpPylcXGJbXFx3IF0rYnVpbGRcXC8vaSxcbiAgICAgICAgICAgIC9cXGJtb3QoPzpvcm9sYSk/Wy0gXShcXHcqKS9pLFxuICAgICAgICAgICAgLygoPzptb3RvW1xcd1xcKFxcKSBdK3x4dFxcZHszLDR9fG5leHVzIDYpKD89IGJ1aXxcXCkpKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIE1PVE9ST0xBXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKG16NjBcXGR8eG9vbVsyIF17MCwyfSkgYnVpbGRcXC8vaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBNT1RPUk9MQV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBMR1xuICAgICAgICAgICAgLygoPz1sZyk/W3ZsXWtcXC0/XFxkezN9KSBidWl8IDNcXC5bLVxcdzsgXXsxMH1sZz8tKFswNmN2OV17Myw0fSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBMR10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhsbSg/Oi0/ZjEwMFtudl0/fC1bXFx3XFwuXSspKD89IGJ1aXxcXCkpfG5leHVzIFs0NV0pL2ksXG4gICAgICAgICAgICAvXFxibGdbLWU7XFwvIF0rKCg/IWJyb3dzZXJ8bmV0Y2FzdHxhbmRyb2lkIHR2KVxcdyspL2ksXG4gICAgICAgICAgICAvXFxibGctPyhbXFxkXFx3XSspIGJ1aS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIExHXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIExlbm92b1xuICAgICAgICAgICAgLyhpZGVhdGFiWy1cXHcgXSspL2ksXG4gICAgICAgICAgICAvbGVub3ZvID8oc1s1Nl0wMDBbLVxcd10rfHRhYig/OltcXHcgXSspfHl0Wy1cXGRcXHddezZ9fHRiWy1cXGRcXHddezZ9KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdMZW5vdm8nXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8vIE5va2lhXG4gICAgICAgICAgICAvKD86bWFlbW98bm9raWEpLioobjkwMHxsdW1pYSBcXGQrKS9pLFxuICAgICAgICAgICAgL25va2lhWy1fIF0/KFstXFx3XFwuXSopL2lcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsIC9fL2csICcgJ10sIFtWRU5ET1IsICdOb2tpYSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gR29vZ2xlXG4gICAgICAgICAgICAvKHBpeGVsIGMpXFxiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgUGl4ZWwgQ1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBHT09HTEVdLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rOyAocGl4ZWxbXFxkYXhsIF17MCw2fSkoPzogYnVpfFxcKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgUGl4ZWxcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIFNvbnlcbiAgICAgICAgICAgIC9kcm9pZC4rIChbYy1nXVxcZHs0fXxzb1stZ2xdXFx3K3x4cS1hXFx3WzQtN11bMTJdKSg/PSBidWl8XFwpLitjaHJvbWVcXC8oPyFbMS02XXswLDF9XFxkXFwuKSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBTT05ZXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvc29ueSB0YWJsZXQgW3BzXS9pLFxuICAgICAgICAgICAgL1xcYig/OnNvbnkpP3NncFxcdysoPzogYnVpfFxcKSkvaVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgJ1hwZXJpYSBUYWJsZXQnXSwgW1ZFTkRPUiwgU09OWV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBPbmVQbHVzXG4gICAgICAgICAgICAvIChrYjIwMDV8aW4yMFsxMl01fGJlMjBbMTJdWzU5XSlcXGIvaSxcbiAgICAgICAgICAgIC8oPzpvbmUpPyg/OnBsdXMpPyAoYVxcZDBcXGRcXGQpKD86IGJ8XFwpKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdPbmVQbHVzJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBBbWF6b25cbiAgICAgICAgICAgIC8oYWxleGEpd2VibS9pLFxuICAgICAgICAgICAgLyhrZlthLXpdezJ9d2kpKCBidWl8XFwpKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlIEZpcmUgd2l0aG91dCBTaWxrXG4gICAgICAgICAgICAvKGtmW2Etel0rKSggYnVpfFxcKSkuK3NpbGtcXC8vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlIEZpcmUgSERcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQU1BWk9OXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKCg/OnNkfGtmKVswMzQ5aGlqb3JzdHV3XSspKCBidWl8XFwpKS4rc2lsa1xcLy9pICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZSBQaG9uZVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgLyguKykvZywgJ0ZpcmUgUGhvbmUgJDEnXSwgW1ZFTkRPUiwgQU1BWk9OXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEJsYWNrQmVycnlcbiAgICAgICAgICAgIC8ocGxheWJvb2spO1stXFx3XFwpLDsgXSsocmltKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja0JlcnJ5IFBsYXlCb29rXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFZFTkRPUiwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKCg/OmJiW2EtZl18c3RbaHZdKTEwMC1cXGQpL2ksXG4gICAgICAgICAgICAvXFwoYmIxMDsgKFxcdyspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxhY2tCZXJyeSAxMFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBCTEFDS0JFUlJZXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEFzdXNcbiAgICAgICAgICAgIC8oPzpcXGJ8YXN1c18pKHRyYW5zZm9bcHJpbWUgXXs0LDEwfSBcXHcrfGVlZXBjfHNsaWRlciBcXHcrfG5leHVzIDd8cGFkZm9uZXxwMDBbY2pdKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEFTVVNdLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8gKHpbYmVzXTZbMDI3XVswMTJdW2ttXVtsc118emVuZm9uZSBcXGRcXHc/KVxcYi9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEFTVVNdLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gSFRDXG4gICAgICAgICAgICAvKG5leHVzIDkpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhUQyBOZXh1cyA5XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdIVEMnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKGh0YylbLTtfIF17MSwyfShbXFx3IF0rKD89XFwpfCBidWkpfFxcdyspL2ksICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhUQ1xuXG4gICAgICAgICAgICAvLyBaVEVcbiAgICAgICAgICAgIC8oenRlKVstIF0oW1xcdyBdKz8pKD86IGJ1aXxcXC98XFwpKS9pLFxuICAgICAgICAgICAgLyhhbGNhdGVsfGdlZWtzcGhvbmV8bmV4aWFufHBhbmFzb25pY3xzb255KVstXyBdPyhbLVxcd10qKS9pICAgICAgICAgLy8gQWxjYXRlbC9HZWVrc1Bob25lL05leGlhbi9QYW5hc29uaWMvU29ueVxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgW01PREVMLCAvXy9nLCAnICddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gQWNlclxuICAgICAgICAgICAgL2Ryb2lkLis7IChbYWJdWzEtN10tP1swMTc4YV1cXGRcXGQ/KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBY2VyJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBNZWl6dVxuICAgICAgICAgICAgL2Ryb2lkLis7IChtWzEtNV0gbm90ZSkgYnVpL2ksXG4gICAgICAgICAgICAvXFxibXotKFstXFx3XXsyLH0pL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ01laXp1J10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBTaGFycFxuICAgICAgICAgICAgL1xcYihzaC0/W2FsdHZ6XT9cXGRcXGRbYS1la21dPykvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU2hhcnAnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIE1JWEVEXG4gICAgICAgICAgICAvKGJsYWNrYmVycnl8YmVucXxwYWxtKD89XFwtKXxzb255ZXJpY3Nzb258YWNlcnxhc3VzfGRlbGx8bWVpenV8bW90b3JvbGF8cG9seXRyb24pWy1fIF0/KFstXFx3XSopL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrQmVycnkvQmVuUS9QYWxtL1NvbnktRXJpY3Nzb24vQWNlci9Bc3VzL0RlbGwvTWVpenUvTW90b3JvbGEvUG9seXRyb25cbiAgICAgICAgICAgIC8oaHApIChbXFx3IF0rXFx3KS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIUCBpUEFRXG4gICAgICAgICAgICAvKGFzdXMpLT8oXFx3KykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBc3VzXG4gICAgICAgICAgICAvKG1pY3Jvc29mdCk7IChsdW1pYVtcXHcgXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgTHVtaWFcbiAgICAgICAgICAgIC8obGVub3ZvKVstXyBdPyhbLVxcd10rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExlbm92b1xuICAgICAgICAgICAgLyhqb2xsYSkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKb2xsYVxuICAgICAgICAgICAgLyhvcHBvKSA/KFtcXHcgXSspIGJ1aS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT1BQT1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvKGFyY2hvcykgKGdhbWVwYWQyPykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFyY2hvc1xuICAgICAgICAgICAgLyhocCkuKyh0b3VjaHBhZCg/IS4rdGFibGV0KXx0YWJsZXQpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIUCBUb3VjaFBhZFxuICAgICAgICAgICAgLyhraW5kbGUpXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLaW5kbGVcbiAgICAgICAgICAgIC8obm9vaylbXFx3IF0rYnVpbGRcXC8oXFx3KykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm9va1xuICAgICAgICAgICAgLyhkZWxsKSAoc3RyZWFba3ByXFxkIF0qW1xcZGtvXSkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERlbGwgU3RyZWFrXG4gICAgICAgICAgICAvKGxlWy0gXStwYW4pWy0gXSsoXFx3ezEsOX0pIGJ1aS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMZSBQYW4gVGFibGV0c1xuICAgICAgICAgICAgLyh0cmluaXR5KVstIF0qKHRcXGR7M30pIGJ1aS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpbml0eSBUYWJsZXRzXG4gICAgICAgICAgICAvKGdpZ2FzZXQpWy0gXSsocVxcd3sxLDl9KSBidWkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHaWdhc2V0IFRhYmxldHNcbiAgICAgICAgICAgIC8odm9kYWZvbmUpIChbXFx3IF0rKSg/OlxcKXwgYnVpKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBWb2RhZm9uZVxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvKHN1cmZhY2UgZHVvKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1cmZhY2UgRHVvXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIE1JQ1JPU09GVF0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkIFtcXGRcXC5dKzsgKGZwXFxkdT8pKD86IGJ8XFwpKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFpcnBob25lXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdGYWlycGhvbmUnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvKHUzMDRhYSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFUJlRcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0FUJlQnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxic2llLShcXHcqKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2llbWVuc1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU2llbWVucyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIocmN0XFx3KykgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSQ0EgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnUkNBJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYih2ZW51ZVtcXGQgXXsyLDd9KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERlbGwgVmVudWUgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnRGVsbCddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIocSg/Om12fHRhKVxcdyspIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBWZXJpem9uIFRhYmxldFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnVmVyaXpvbiddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoPzpiYXJuZXNbJiBdK25vYmxlIHxibltydF0pKFtcXHdcXCsgXSopIGIvaSAgICAgICAgICAgICAgICAgICAgICAgLy8gQmFybmVzICYgTm9ibGUgVGFibGV0XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdCYXJuZXMgJiBOb2JsZSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIodG1cXGR7M31cXHcrKSBiL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ051VmlzaW9uJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYihrODgpIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWlRFIEsgU2VyaWVzIFRhYmxldFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnWlRFJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYihueFxcZHszfWopIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFpURSBOdWJpYVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnWlRFJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYihnZW5cXGR7M30pIGIuKzQ5aC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN3aXNzIEdFTiBNb2JpbGVcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1N3aXNzJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYih6dXJcXGR7M30pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN3aXNzIFpVUiBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1N3aXNzJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYigoemVraSk/dGIuKlxcYikgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFpla2kgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnWmVraSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoW3lyXVxcZHsyfSkgYi9pLFxuICAgICAgICAgICAgL1xcYihkcmFnb25bLSBdK3RvdWNoIHxkdCkoXFx3ezV9KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERyYWdvbiBUb3VjaCBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCAnRHJhZ29uIFRvdWNoJ10sIE1PREVMLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIobnMtP1xcd3swLDl9KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNpZ25pYSBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdJbnNpZ25pYSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoKG54YXxuZXh0KS0/XFx3ezAsOX0pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXh0Qm9vayBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdOZXh0Qm9vayddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoeHRyZW1lXFxfKT8odigxWzA0NV18MlswMTVdfFszNDY5XTB8N1swNV0pKSBiL2kgICAgICAgICAgICAgICAgICAvLyBWb2ljZSBYdHJlbWUgUGhvbmVzXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgJ1ZvaWNlJ10sIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIobHZ0ZWxcXC0pPyh2MVsxMl0pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMdlRlbCBQaG9uZXNcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCAnTHZUZWwnXSwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYihwaC0xKSAvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXNzZW50aWFsIFBILTFcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0Vzc2VudGlhbCddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIodigxMDBtZHw3MDBuYXw3MDExfDkxN2cpLipcXGIpIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbnZpemVuIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0Vudml6ZW4nXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKHRyaW9bLVxcd1xcLiBdKykgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hY2hTcGVlZCBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdNYWNoU3BlZWQnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxidHVfKDE0OTEpIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSb3RvciBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdSb3RvciddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oc2hpZWxkW1xcdyBdKykgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE52aWRpYSBTaGllbGQgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTnZpZGlhJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhzcHJpbnQpIChcXHcrKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3ByaW50IFBob25lc1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhraW5cXC5bb25ldHddezN9KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWljcm9zb2Z0IEtpblxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgL1xcLi9nLCAnICddLCBbVkVORE9SLCBNSUNST1NPRlRdLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rOyAoY2M2NjY2P3xldDVbMTZdfG1jWzIzOV1bMjNdeD98dmM4WzAzXXg/KVxcKS9pICAgICAgICAgICAgIC8vIFplYnJhXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFpFQlJBXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKGVjMzB8cHMyMHx0Y1syLThdXFxkW2t4XSlcXCkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBaRUJSQV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBDT05TT0xFU1xuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvKG91eWEpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE91eWFcbiAgICAgICAgICAgIC8obmludGVuZG8pIChbd2lkczN1dGNoXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmludGVuZG9cbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgQ09OU09MRV1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKHNoaWVsZCkgYnVpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE52aWRpYVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTnZpZGlhJ10sIFtUWVBFLCBDT05TT0xFXV0sIFtcbiAgICAgICAgICAgIC8ocGxheXN0YXRpb24gWzM0NXBvcnRhYmxldmldKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGxheXN0YXRpb25cbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgU09OWV0sIFtUWVBFLCBDT05TT0xFXV0sIFtcbiAgICAgICAgICAgIC9cXGIoeGJveCg/OiBvbmUpPyg/ITsgeGJveCkpW1xcKTsgXS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgWGJveFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBNSUNST1NPRlRdLCBbVFlQRSwgQ09OU09MRV1dLCBbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIFNNQVJUVFZTXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgICAgIC9zbWFydC10di4rKHNhbXN1bmcpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2Ftc3VuZ1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL2hiYnR2LittYXBsZTsoXFxkKykvaVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgL14vLCAnU21hcnRUViddLCBbVkVORE9SLCBTQU1TVU5HXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgLyhudXg7IG5ldGNhc3QuK3NtYXJ0dHZ8bGcgKG5ldGNhc3RcXC50di0yMDFcXGR8YW5kcm9pZCB0dikpL2kgICAgICAgIC8vIExHIFNtYXJ0VFZcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCBMR10sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC8oYXBwbGUpID90di9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXBwbGUgVFZcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIFtNT0RFTCwgQVBQTEUrJyBUViddLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvY3JrZXkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBDaHJvbWVjYXN0XG4gICAgICAgICAgICBdLCBbW01PREVMLCBDSFJPTUUrJ2Nhc3QnXSwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLithZnQoXFx3KSggYnVpfFxcKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmUgVFZcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQU1BWk9OXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL1xcKGR0dltcXCk7XS4rKGFxdW9zKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNoYXJwXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdTaGFycCddLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvXFxiKHJva3UpW1xcZHhdKltcXClcXC9dKCg/OmR2cC0pP1tcXGRcXC5dKikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJva3VcbiAgICAgICAgICAgIC9oYmJ0dlxcL1xcZCtcXC5cXGQrXFwuXFxkKyArXFwoW1xcdyBdKjsgKihcXHdbXjtdKik7KFteO10qKS9pICAgICAgICAgICAgICAgLy8gSGJiVFYgZGV2aWNlc1xuICAgICAgICAgICAgXSwgW1tWRU5ET1IsIHRyaW1dLCBbTU9ERUwsIHRyaW1dLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvXFxiKGFuZHJvaWQgdHZ8c21hcnRbLSBdP3R2fG9wZXJhIHR2fHR2OyBydjopXFxiL2kgICAgICAgICAgICAgICAgICAgLy8gU21hcnRUViBmcm9tIFVuaWRlbnRpZmllZCBWZW5kb3JzXG4gICAgICAgICAgICBdLCBbW1RZUEUsIFNNQVJUVFZdXSwgW1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBXRUFSQUJMRVNcbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgLygocGViYmxlKSlhcHAvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQZWJibGVcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgV0VBUkFCTEVdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLis7IChnbGFzcykgXFxkL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIEdsYXNzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEdPT0dMRV0sIFtUWVBFLCBXRUFSQUJMRV1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKHd0NjM/MHsyLDN9KVxcKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFpFQlJBXSwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcbiAgICAgICAgICAgIC8ocXVlc3QoIDIpPykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT2N1bHVzIFF1ZXN0XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEZBQ0VCT09LXSwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcblxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICAgICAgLy8gRU1CRURERURcbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgLyh0ZXNsYSkoPzogcXRjYXJicm93c2VyfFxcL1stXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXNsYVxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgW1RZUEUsIEVNQkVEREVEXV0sIFtcblxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIE1JWEVEIChHRU5FUklDKVxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvZHJvaWQgLis/OyAoW147XSs/KSg/OiBidWl8XFwpIGFwcGxldykuKz8gbW9iaWxlIHNhZmFyaS9pICAgICAgICAgICAvLyBBbmRyb2lkIFBob25lcyBmcm9tIFVuaWRlbnRpZmllZCBWZW5kb3JzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkIC4rPzsgKFteO10rPykoPzogYnVpfFxcKSBhcHBsZXcpLis/KD8hIG1vYmlsZSkgc2FmYXJpL2kgICAgICAgLy8gQW5kcm9pZCBUYWJsZXRzIGZyb20gVW5pZGVudGlmaWVkIFZlbmRvcnNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKCh0YWJsZXR8dGFiKVs7XFwvXXxmb2N1c1xcL1xcZCg/IS4rbW9iaWxlKSkvaSAgICAgICAgICAgICAgICAgICAgICAvLyBVbmlkZW50aWZpYWJsZSBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8ocGhvbmV8bW9iaWxlKD86WztcXC9dfCBzYWZhcmkpfHBkYSg/PS4rd2luZG93cyBjZSkpL2kgICAgICAgICAgICAgIC8vIFVuaWRlbnRpZmlhYmxlIE1vYmlsZVxuICAgICAgICAgICAgXSwgW1tUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhhbmRyb2lkWy1cXHdcXC4gXXswLDl9KTsuK2J1aWwvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyaWMgQW5kcm9pZCBEZXZpY2VcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0dlbmVyaWMnXV1cbiAgICAgICAgXSxcblxuICAgICAgICBlbmdpbmUgOiBbW1xuXG4gICAgICAgICAgICAvd2luZG93cy4rIGVkZ2VcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRWRnZUhUTUxcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgRURHRSsnSFRNTCddXSwgW1xuXG4gICAgICAgICAgICAvd2Via2l0XFwvNTM3XFwuMzYuK2Nocm9tZVxcLyg/ITI3KShbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxpbmtcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0JsaW5rJ11dLCBbXG5cbiAgICAgICAgICAgIC8ocHJlc3RvKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJlc3RvXG4gICAgICAgICAgICAvKHdlYmtpdHx0cmlkZW50fG5ldGZyb250fG5ldHN1cmZ8YW1heWF8bHlueHx3M218Z29hbm5hKVxcLyhbXFx3XFwuXSspL2ksIC8vIFdlYktpdC9UcmlkZW50L05ldEZyb250L05ldFN1cmYvQW1heWEvTHlueC93M20vR29hbm5hXG4gICAgICAgICAgICAvZWtpb2goZmxvdylcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb3dcbiAgICAgICAgICAgIC8oa2h0bWx8dGFzbWFufGxpbmtzKVtcXC8gXVxcKD8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtIVE1ML1Rhc21hbi9MaW5rc1xuICAgICAgICAgICAgLyhpY2FiKVtcXC8gXShbMjNdXFwuW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaUNhYlxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC9ydlxcOihbXFx3XFwuXXsxLDl9KVxcYi4rKGdlY2tvKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdlY2tvXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgTkFNRV1cbiAgICAgICAgXSxcblxuICAgICAgICBvcyA6IFtbXG5cbiAgICAgICAgICAgIC8vIFdpbmRvd3NcbiAgICAgICAgICAgIC9taWNyb3NvZnQgKHdpbmRvd3MpICh2aXN0YXx4cCkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2luZG93cyAoaVR1bmVzKVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKHdpbmRvd3MpIG50IDZcXC4yOyAoYXJtKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaW5kb3dzIFJUXG4gICAgICAgICAgICAvKHdpbmRvd3MgKD86cGhvbmUoPzogb3MpP3xtb2JpbGUpKVtcXC8gXT8oW1xcZFxcLlxcdyBdKikvaSwgICAgICAgICAgICAvLyBXaW5kb3dzIFBob25lXG4gICAgICAgICAgICAvKHdpbmRvd3MpW1xcLyBdPyhbbnRjZVxcZFxcLiBdK1xcdykoPyEuK3hib3gpL2lcbiAgICAgICAgICAgIF0sIFtOQU1FLCBbVkVSU0lPTiwgc3RyTWFwcGVyLCB3aW5kb3dzVmVyc2lvbk1hcF1dLCBbXG4gICAgICAgICAgICAvKHdpbig/PTN8OXxuKXx3aW4gOXggKShbbnRcXGRcXC5dKykvaVxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnV2luZG93cyddLCBbVkVSU0lPTiwgc3RyTWFwcGVyLCB3aW5kb3dzVmVyc2lvbk1hcF1dLCBbXG5cbiAgICAgICAgICAgIC8vIGlPUy9tYWNPU1xuICAgICAgICAgICAgL2lwW2hvbmVhZF17Miw0fVxcYig/Oi4qb3MgKFtcXHddKykgbGlrZSBtYWN8OyBvcGVyYSkvaSwgICAgICAgICAgICAgIC8vIGlPU1xuICAgICAgICAgICAgL2NmbmV0d29ya1xcLy4rZGFyd2luL2lcbiAgICAgICAgICAgIF0sIFtbVkVSU0lPTiwgL18vZywgJy4nXSwgW05BTUUsICdpT1MnXV0sIFtcbiAgICAgICAgICAgIC8obWFjIG9zIHgpID8oW1xcd1xcLiBdKikvaSxcbiAgICAgICAgICAgIC8obWFjaW50b3NofG1hY19wb3dlcnBjXFxiKSg/IS4raGFpa3UpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hYyBPU1xuICAgICAgICAgICAgXSwgW1tOQU1FLCAnTWFjIE9TJ10sIFtWRVJTSU9OLCAvXy9nLCAnLiddXSwgW1xuXG4gICAgICAgICAgICAvLyBNb2JpbGUgT1Nlc1xuICAgICAgICAgICAgL2Ryb2lkIChbXFx3XFwuXSspXFxiLisoYW5kcm9pZFstIF14ODYpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbmRyb2lkLXg4NlxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIE5BTUVdLCBbICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbmRyb2lkL1dlYk9TL1FOWC9CYWRhL1JJTS9NYWVtby9NZWVHby9TYWlsZmlzaCBPU1xuICAgICAgICAgICAgLyhhbmRyb2lkfHdlYm9zfHFueHxiYWRhfHJpbSB0YWJsZXQgb3N8bWFlbW98bWVlZ298c2FpbGZpc2gpWy1cXC8gXT8oW1xcd1xcLl0qKS9pLFxuICAgICAgICAgICAgLyhibGFja2JlcnJ5KVxcdypcXC8oW1xcd1xcLl0qKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxhY2tiZXJyeVxuICAgICAgICAgICAgLyh0aXplbnxrYWlvcylbXFwvIF0oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaXplbi9LYWlPU1xuICAgICAgICAgICAgL1xcKChzZXJpZXM0MCk7L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VyaWVzIDQwXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9cXChiYigxMCk7L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrQmVycnkgMTBcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgQkxBQ0tCRVJSWV1dLCBbXG4gICAgICAgICAgICAvKD86c3ltYmlhbiA/b3N8c3ltYm9zfHM2MCg/PTspfHNlcmllczYwKVstXFwvIF0/KFtcXHdcXC5dKikvaSAgICAgICAgIC8vIFN5bWJpYW5cbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ1N5bWJpYW4nXV0sIFtcbiAgICAgICAgICAgIC9tb3ppbGxhXFwvW1xcZFxcLl0rIFxcKCg/Om1vYmlsZXx0YWJsZXR8dHZ8bW9iaWxlOyBbXFx3IF0rKTsgcnY6LisgZ2Vja29cXC8oW1xcd1xcLl0rKS9pIC8vIEZpcmVmb3ggT1NcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgRklSRUZPWCsnIE9TJ11dLCBbXG4gICAgICAgICAgICAvd2ViMHM7LitydCh0dikvaSxcbiAgICAgICAgICAgIC9cXGIoPzpocCk/d29zKD86YnJvd3Nlcik/XFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlYk9TXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICd3ZWJPUyddXSwgW1xuXG4gICAgICAgICAgICAvLyBHb29nbGUgQ2hyb21lY2FzdFxuICAgICAgICAgICAgL2Nya2V5XFwvKFtcXGRcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgQ2hyb21lY2FzdFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBDSFJPTUUrJ2Nhc3QnXV0sIFtcbiAgICAgICAgICAgIC8oY3JvcykgW1xcd10rIChbXFx3XFwuXStcXHcpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9taXVtIE9TXG4gICAgICAgICAgICBdLCBbW05BTUUsICdDaHJvbWl1bSBPUyddLCBWRVJTSU9OXSxbXG5cbiAgICAgICAgICAgIC8vIENvbnNvbGVcbiAgICAgICAgICAgIC8obmludGVuZG98cGxheXN0YXRpb24pIChbd2lkczM0NXBvcnRhYmxldnVjaF0rKS9pLCAgICAgICAgICAgICAgICAgLy8gTmludGVuZG8vUGxheXN0YXRpb25cbiAgICAgICAgICAgIC8oeGJveCk7ICt4Ym94IChbXlxcKTtdKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pY3Jvc29mdCBYYm94ICgzNjAsIE9uZSwgWCwgUywgU2VyaWVzIFgsIFNlcmllcyBTKVxuXG4gICAgICAgICAgICAvLyBPdGhlclxuICAgICAgICAgICAgL1xcYihqb2xpfHBhbG0pXFxiID8oPzpvcyk/XFwvPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEpvbGkvUGFsbVxuICAgICAgICAgICAgLyhtaW50KVtcXC9cXChcXCkgXT8oXFx3KikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWludFxuICAgICAgICAgICAgLyhtYWdlaWF8dmVjdG9ybGludXgpWzsgXS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWdlaWEvVmVjdG9yTGludXhcbiAgICAgICAgICAgIC8oW2t4bG5dP3VidW50dXxkZWJpYW58c3VzZXxvcGVuc3VzZXxnZW50b298YXJjaCg/PSBsaW51eCl8c2xhY2t3YXJlfGZlZG9yYXxtYW5kcml2YXxjZW50b3N8cGNsaW51eG9zfHJlZCA/aGF0fHplbndhbGt8bGlucHVzfHJhc3BiaWFufHBsYW4gOXxtaW5peHxyaXNjIG9zfGNvbnRpa2l8ZGVlcGlufG1hbmphcm98ZWxlbWVudGFyeSBvc3xzYWJheW9ufGxpbnNwaXJlKSg/OiBnbnVcXC9saW51eCk/KD86IGVudGVycHJpc2UpPyg/OlstIF1saW51eCk/KD86LWdudSk/Wy1cXC8gXT8oPyFjaHJvbXxwYWNrYWdlKShbLVxcd1xcLl0qKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVYnVudHUvRGViaWFuL1NVU0UvR2VudG9vL0FyY2gvU2xhY2t3YXJlL0ZlZG9yYS9NYW5kcml2YS9DZW50T1MvUENMaW51eE9TL1JlZEhhdC9aZW53YWxrL0xpbnB1cy9SYXNwYmlhbi9QbGFuOS9NaW5peC9SSVNDT1MvQ29udGlraS9EZWVwaW4vTWFuamFyby9lbGVtZW50YXJ5L1NhYmF5b24vTGluc3BpcmVcbiAgICAgICAgICAgIC8oaHVyZHxsaW51eCkgPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIdXJkL0xpbnV4XG4gICAgICAgICAgICAvKGdudSkgPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR05VXG4gICAgICAgICAgICAvXFxiKFstZnJlbnRvcGNnaHNdezAsNX1ic2R8ZHJhZ29uZmx5KVtcXC8gXT8oPyFhbWR8W2l4MzQ2XXsxLDJ9ODYpKFtcXHdcXC5dKikvaSwgLy8gRnJlZUJTRC9OZXRCU0QvT3BlbkJTRC9QQy1CU0QvR2hvc3RCU0QvRHJhZ29uRmx5XG4gICAgICAgICAgICAvKGhhaWt1KSAoXFx3KykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIYWlrdVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKHN1bm9zKSA/KFtcXHdcXC5cXGRdKikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbGFyaXNcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ1NvbGFyaXMnXSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8oKD86b3Blbik/c29sYXJpcylbLVxcLyBdPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29sYXJpc1xuICAgICAgICAgICAgLyhhaXgpICgoXFxkKSg/PVxcLnxcXCl8IClbXFx3XFwuXSkqL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFJWFxuICAgICAgICAgICAgL1xcYihiZW9zfG9zXFwvMnxhbWlnYW9zfG1vcnBob3N8b3BlbnZtc3xmdWNoc2lhfGhwLXV4KS9pLCAgICAgICAgICAgIC8vIEJlT1MvT1MyL0FtaWdhT1MvTW9ycGhPUy9PcGVuVk1TL0Z1Y2hzaWEvSFAtVVhcbiAgICAgICAgICAgIC8odW5peCkgPyhbXFx3XFwuXSopL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVTklYXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENvbnN0cnVjdG9yXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgdmFyIFVBUGFyc2VyID0gZnVuY3Rpb24gKHVhLCBleHRlbnNpb25zKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB1YSA9PT0gT0JKX1RZUEUpIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnMgPSB1YTtcbiAgICAgICAgICAgIHVhID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFVBUGFyc2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBVQVBhcnNlcih1YSwgZXh0ZW5zaW9ucykuZ2V0UmVzdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3VhID0gdWEgfHwgKCh0eXBlb2Ygd2luZG93ICE9PSBVTkRFRl9UWVBFICYmIHdpbmRvdy5uYXZpZ2F0b3IgJiYgd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpID8gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgOiBFTVBUWSk7XG4gICAgICAgIHZhciBfcmd4bWFwID0gZXh0ZW5zaW9ucyA/IGV4dGVuZChyZWdleGVzLCBleHRlbnNpb25zKSA6IHJlZ2V4ZXM7XG5cbiAgICAgICAgdGhpcy5nZXRCcm93c2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9icm93c2VyID0ge307XG4gICAgICAgICAgICBfYnJvd3NlcltOQU1FXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIF9icm93c2VyW1ZFUlNJT05dID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmd4TWFwcGVyLmNhbGwoX2Jyb3dzZXIsIF91YSwgX3JneG1hcC5icm93c2VyKTtcbiAgICAgICAgICAgIF9icm93c2VyLm1ham9yID0gbWFqb3JpemUoX2Jyb3dzZXIudmVyc2lvbik7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXI7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0Q1BVID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9jcHUgPSB7fTtcbiAgICAgICAgICAgIF9jcHVbQVJDSElURUNUVVJFXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJneE1hcHBlci5jYWxsKF9jcHUsIF91YSwgX3JneG1hcC5jcHUpO1xuICAgICAgICAgICAgcmV0dXJuIF9jcHU7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0RGV2aWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9kZXZpY2UgPSB7fTtcbiAgICAgICAgICAgIF9kZXZpY2VbVkVORE9SXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIF9kZXZpY2VbTU9ERUxdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgX2RldmljZVtUWVBFXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJneE1hcHBlci5jYWxsKF9kZXZpY2UsIF91YSwgX3JneG1hcC5kZXZpY2UpO1xuICAgICAgICAgICAgcmV0dXJuIF9kZXZpY2U7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0RW5naW5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9lbmdpbmUgPSB7fTtcbiAgICAgICAgICAgIF9lbmdpbmVbTkFNRV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBfZW5naW5lW1ZFUlNJT05dID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmd4TWFwcGVyLmNhbGwoX2VuZ2luZSwgX3VhLCBfcmd4bWFwLmVuZ2luZSk7XG4gICAgICAgICAgICByZXR1cm4gX2VuZ2luZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRPUyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfb3MgPSB7fTtcbiAgICAgICAgICAgIF9vc1tOQU1FXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIF9vc1tWRVJTSU9OXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJneE1hcHBlci5jYWxsKF9vcywgX3VhLCBfcmd4bWFwLm9zKTtcbiAgICAgICAgICAgIHJldHVybiBfb3M7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0UmVzdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1YSAgICAgIDogdGhpcy5nZXRVQSgpLFxuICAgICAgICAgICAgICAgIGJyb3dzZXIgOiB0aGlzLmdldEJyb3dzZXIoKSxcbiAgICAgICAgICAgICAgICBlbmdpbmUgIDogdGhpcy5nZXRFbmdpbmUoKSxcbiAgICAgICAgICAgICAgICBvcyAgICAgIDogdGhpcy5nZXRPUygpLFxuICAgICAgICAgICAgICAgIGRldmljZSAgOiB0aGlzLmdldERldmljZSgpLFxuICAgICAgICAgICAgICAgIGNwdSAgICAgOiB0aGlzLmdldENQVSgpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldFVBID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF91YTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRVQSA9IGZ1bmN0aW9uICh1YSkge1xuICAgICAgICAgICAgX3VhID0gKHR5cGVvZiB1YSA9PT0gU1RSX1RZUEUgJiYgdWEubGVuZ3RoID4gVUFfTUFYX0xFTkdUSCkgPyB0cmltKHVhLCBVQV9NQVhfTEVOR1RIKSA6IHVhO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0VUEoX3VhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIFVBUGFyc2VyLlZFUlNJT04gPSBMSUJWRVJTSU9OO1xuICAgIFVBUGFyc2VyLkJST1dTRVIgPSAgZW51bWVyaXplKFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0pO1xuICAgIFVBUGFyc2VyLkNQVSA9IGVudW1lcml6ZShbQVJDSElURUNUVVJFXSk7XG4gICAgVUFQYXJzZXIuREVWSUNFID0gZW51bWVyaXplKFtNT0RFTCwgVkVORE9SLCBUWVBFLCBDT05TT0xFLCBNT0JJTEUsIFNNQVJUVFYsIFRBQkxFVCwgV0VBUkFCTEUsIEVNQkVEREVEXSk7XG4gICAgVUFQYXJzZXIuRU5HSU5FID0gVUFQYXJzZXIuT1MgPSBlbnVtZXJpemUoW05BTUUsIFZFUlNJT05dKTtcblxuICAgIC8vLy8vLy8vLy8vXG4gICAgLy8gRXhwb3J0XG4gICAgLy8vLy8vLy8vL1xuXG4gICAgLy8gY2hlY2sganMgZW52aXJvbm1lbnRcbiAgICBpZiAodHlwZW9mKGV4cG9ydHMpICE9PSBVTkRFRl9UWVBFKSB7XG4gICAgICAgIC8vIG5vZGVqcyBlbnZcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFVOREVGX1RZUEUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFVBUGFyc2VyO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydHMuVUFQYXJzZXIgPSBVQVBhcnNlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXF1aXJlanMgZW52IChvcHRpb25hbClcbiAgICAgICAgaWYgKHR5cGVvZihkZWZpbmUpID09PSBGVU5DX1RZUEUgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVUFQYXJzZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSBVTkRFRl9UWVBFKSB7XG4gICAgICAgICAgICAvLyBicm93c2VyIGVudlxuICAgICAgICAgICAgd2luZG93LlVBUGFyc2VyID0gVUFQYXJzZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBqUXVlcnkvWmVwdG8gc3BlY2lmaWMgKG9wdGlvbmFsKVxuICAgIC8vIE5vdGU6XG4gICAgLy8gICBJbiBBTUQgZW52IHRoZSBnbG9iYWwgc2NvcGUgc2hvdWxkIGJlIGtlcHQgY2xlYW4sIGJ1dCBqUXVlcnkgaXMgYW4gZXhjZXB0aW9uLlxuICAgIC8vICAgalF1ZXJ5IGFsd2F5cyBleHBvcnRzIHRvIGdsb2JhbCBzY29wZSwgdW5sZXNzIGpRdWVyeS5ub0NvbmZsaWN0KHRydWUpIGlzIHVzZWQsXG4gICAgLy8gICBhbmQgd2Ugc2hvdWxkIGNhdGNoIHRoYXQuXG4gICAgdmFyICQgPSB0eXBlb2Ygd2luZG93ICE9PSBVTkRFRl9UWVBFICYmICh3aW5kb3cualF1ZXJ5IHx8IHdpbmRvdy5aZXB0byk7XG4gICAgaWYgKCQgJiYgISQudWEpIHtcbiAgICAgICAgdmFyIHBhcnNlciA9IG5ldyBVQVBhcnNlcigpO1xuICAgICAgICAkLnVhID0gcGFyc2VyLmdldFJlc3VsdCgpO1xuICAgICAgICAkLnVhLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZXIuZ2V0VUEoKTtcbiAgICAgICAgfTtcbiAgICAgICAgJC51YS5zZXQgPSBmdW5jdGlvbiAodWEpIHtcbiAgICAgICAgICAgIHBhcnNlci5zZXRVQSh1YSk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gcGFyc2VyLmdldFJlc3VsdCgpO1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAkLnVhW3Byb3BdID0gcmVzdWx0W3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxufSkodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgPyB3aW5kb3cgOiB0aGlzKTtcbiJdfQ==
