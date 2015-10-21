/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/jquery.cookie/jquery.cookie.d.ts" />
var CookieConsent = (function () {
    function CookieConsent() {
        var _this = this;
        this.init = function (settings, service) {
            var self = _this;
            if (!settings.appId) {
                alert("Wrong configuration: missing 'appId' information");
                return;
            }
            if (typeof service != "undefined" && service != "" && service != null) {
                CookieConsent.serviceUrl += "-" + service;
                CookieConsent.serviceLongUrl = CookieConsent.serviceUrl + "/long";
                CookieConsent.serviceShortUrl = CookieConsent.serviceUrl + "/short";
            }
            if (!settings.language) {
                // TODO: decommentare queste righe per attivare sempre l'inglese
                //settings.language = "en";
                alert("Wrong configuration: missing 'language' information");
                return;
            }
            self.settings = new CookieConsentSettings(settings.appId, settings.language.toLowerCase(), settings.domain, settings.expires);
            if (_this.cookieExists())
                return;
            self.getShortText()
                .done(function (response) {
                self.displayShortText(response);
                var shortCookieConsentContainer = $('#dada-cookie-short');
                if (!shortCookieConsentContainer || shortCookieConsentContainer.length == 0) {
                    alert("Wrong configuration: short cookie consent container ('#dada-cookie-short') not found");
                    return;
                }
                var closeButton = shortCookieConsentContainer.find('.dada-cookie-close');
                if (!closeButton || closeButton.length == 0) {
                    alert("Wrong configuration: close button ('.dada-cookie-close') in short cookie consent container ('#dada-cookie-short') not found");
                    return;
                }
                closeButton.click(function () {
                    $(this).trigger("consentCookie");
                });
                closeButton.on("consentCookie", function () {
                    self.consentCookie();
                });
                var learnMoreButton = shortCookieConsentContainer.find('.dada-cookie-learn-more');
                if (!learnMoreButton || learnMoreButton.length == 0) {
                    alert("Wrong configuration: learn more button ('.dada-cookie-learn-more') in short cookie consent container ('#dada-cookie-short') not found");
                    return;
                }
                learnMoreButton.click(function () {
                    self.learnMore();
                });
            })
                .fail(self.manageXhrResponse);
            $(window);
        };
        this.isCookiePresent = function () {
            if (_this.cookieExists()) {
                return true;
            }
            else {
                return false;
            }
        };
        this.consentCookie = function () {
            var self = _this;
            self.setCookie(self.settings.getCookieName(), "" + new Date() + "", self.settings.domain, self.settings.expires);
            $('.dada-cookie-container').remove();
        };
        this.learnMore = function () {
            var self = _this;
            self.getLongText()
                .done(function (response) {
                self.displayLongText(response);
                var longCookieConsentContainer = $('#dada-cookie-long');
                if (!longCookieConsentContainer || longCookieConsentContainer.length == 0) {
                    alert("Wrong configuration: long cookie consent container ('#dada-cookie-long') not found");
                    return;
                }
                var closeButton = longCookieConsentContainer.find('.dada-cookie-close');
                if (!closeButton || closeButton.length == 0) {
                    alert("Wrong configuration: close button ('.dada-cookie-close') in long cookie consent container ('#dada-cookie-long') not found");
                    return;
                }
                closeButton.click(function () {
                    $(this).trigger("consentCookie");
                });
                var closeModalButton = longCookieConsentContainer.find('#dada-modal-close');
                if (closeModalButton || closeModalButton.length > 0) {
                    closeModalButton.click(function () {
                        $(longCookieConsentContainer).remove();
                        $('.dada-modal-overlay').remove();
                    });
                }
                closeButton.on("consentCookie", function () {
                    self.consentCookie();
                });
            })
                .fail(self.manageXhrResponse);
        };
        this.setCookie = function (name, value, domain, expires, path) {
            if (expires === void 0) { expires = 365; }
            if (path === void 0) { path = "/"; }
            var cookie = new Cookie(name, value, domain, expires, path);
            cookie.write();
        };
        this.cookieExists = function () {
            var result = false;
            var storedCookie = $.cookie(_this.settings.getCookieName());
            if (typeof storedCookie != "undefined" && storedCookie != null)
                result = true;
            return result;
        };
        this.displayShortText = function (response) {
            var shortText = '<div id="dada-cookie-short" class="dada-cookie-container dada-cookie-short-text-container dada-clear"><div class="dada-cookie-short-text">' + response.text;
            if (response.closeButtonVisible && response.closeButtonVisible != null && typeof response.closeButtonVisible != "undefined") {
                if (response.closeButtonText == null || response.closeButtonText == "undefined")
                    response.closeButtonText = "Close";
                shortText += '<button id="dada-cookie-short-text-close" class="dada-cookie-close dada-cookie-button">' + response.closeButtonText + '</button>';
            }
            if (response.learnMoreButtonVisible && response.learnMoreButtonVisible != null && typeof response.learnMoreButtonVisible != "undefined") {
                if (response.learnMoreButtonText == null || response.learnMoreButtonText == "undefined")
                    response.learnMoreButtonText = "Learn More";
                shortText += '<button id="dada-cookie-short-text-learn-more" class="dada-cookie-learn-more dada-cookie-button">' + response.learnMoreButtonText + '</button>';
            }
            shortText += '</div></div>';
            $('body').append(shortText);
        };
        this.displayLongText = function (response) {
            var longText = '<div class="dada-modal-overlay dada-cookie-container"></div>' +
                '<div id="dada-cookie-long" class="dada-cookie-container dada-modal dada-clear" role="dialog">' +
                '<button id="dada-modal-close">&#9747;</button>' +
                response.text;
            if (response.closeButtonVisible && response.closeButtonVisible != null && typeof response.closeButtonVisible != "undefined") {
                if (response.closeButtonText == null || response.closeButtonText == "undefined")
                    response.closeButtonText = "Close";
                longText += '<button id="dada-cookie-long-text-close" class="dada-cookie-close dada-cookie-button">' + response.closeButtonText + '</button>';
            }
            longText += '</div>';
            $('body').append(longText);
        };
        this.getShortText = function () {
            var self = _this;
            return $.ajax({
                url: CookieConsent.serviceShortUrl + "/" + self.settings.language + "/" + self.settings.appId,
                type: "GET",
                contentType: "application/json",
                crossDomain: true
            });
        };
        this.getLongText = function () {
            var self = _this;
            return $.ajax({
                url: CookieConsent.serviceLongUrl + "/" + self.settings.language + "/" + self.settings.appId,
                type: "GET",
                contentType: "application/json",
                crossDomain: true
            });
        };
    }
    CookieConsent.prototype.manageXhrResponse = function (xhr, status, error) {
        switch (xhr.status) {
            case 0:
                break;
            //case 401: // Not authorized
            //    window.location.href = app._conf.loginUrl;
            //    break;
            default:
                var response;
                try {
                    response = jQuery.parseJSON(xhr.responseText);
                }
                catch (error) { }
                var innerException = null;
                var message = null;
                if (response) {
                    if (response.ExceptionMessage) {
                        message = response.ExceptionMessage;
                    }
                    else if (response.message)
                        message = response.message;
                    else if (response.message)
                        message = response.message;
                    else
                        message = response;
                    if (response.InnerException) {
                        innerException = response.InnerException;
                    }
                }
                else {
                    message = "An unknown error has occurred. Please refresh the page and retry again.";
                }
                alert(message);
                break;
        }
    };
    CookieConsent.cookiePrefix = "dada_cookie_";
    //private static serviceUrl: string = "http://cookie.danielzotti.it/api";
    CookieConsent.serviceUrl = "http://cookie.localhost/api";
    CookieConsent.serviceShortUrl = CookieConsent.serviceUrl + "/short";
    CookieConsent.serviceLongUrl = CookieConsent.serviceUrl + "/long";
    return CookieConsent;
})();
var CookieConsentSettings = (function () {
    function CookieConsentSettings(appId, language, domain, expires) {
        var _this = this;
        this.getCookieName = function () {
            return CookieConsent.cookiePrefix + _this.appId;
        };
        this.appId = appId;
        this.language = language ? language : 'en';
        this.domain = domain ? domain : undefined;
        this.expires = expires ? expires : 365;
    }
    return CookieConsentSettings;
})();
var Cookie = (function () {
    function Cookie(name, value, domain, expires, path) {
        var _this = this;
        if (path === void 0) { path = "/"; }
        this.write = function () {
            $.cookie(_this.name, _this.value, _this.options);
        };
        this.name = name;
        this.value = value;
        this.options = {
            path: path,
            expires: expires
        };
        if (domain)
            this.options.domain = domain;
    }
    return Cookie;
})();
var cookieConsent = new CookieConsent();
