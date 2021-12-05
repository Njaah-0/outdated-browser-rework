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
