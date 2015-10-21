/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/jquery.cookie/jquery.cookie.d.ts" />

class CookieConsent {
    public static cookiePrefix: string = "dada_cookie_";
    //private static serviceUrl: string = "http://cookie.danielzotti.it/api";
    private static serviceUrl: string = "http://cookie.localhost/api";
    private static serviceShortUrl: string = CookieConsent.serviceUrl + "/short";
    private static serviceLongUrl: string = CookieConsent.serviceUrl + "/long";
    private settings: ICookieConsentSettings;

    public init = (settings: ICookieConsentSettings, service?: string): void => {
        var self: CookieConsent = this;
        if (!settings.appId) { 
            alert("Wrong configuration: missing 'appId' information");
            return;
            // TODO: decommentare queste righe per scegliere un ID di default
            //settings.appId="1";
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

        if (this.cookieExists())
            return;

        self.getShortText()
            .done(function (response: ICookieConsentServiceResponse) {

                self.displayShortText(response);
                
                var shortCookieConsentContainer: JQuery = $('#dada-cookie-short');
                if (!shortCookieConsentContainer || shortCookieConsentContainer.length == 0) {
                    alert("Wrong configuration: short cookie consent container ('#dada-cookie-short') not found");
                    return;
                }
                
                var closeButton: JQuery = shortCookieConsentContainer.find('.dada-cookie-close');
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

                var learnMoreButton: JQuery = shortCookieConsentContainer.find('.dada-cookie-learn-more');
                if (!learnMoreButton || learnMoreButton.length == 0) {
                    alert("Wrong configuration: learn more button ('.dada-cookie-learn-more') in short cookie consent container ('#dada-cookie-short') not found");
                    return;
                }

                learnMoreButton.click(function () {
                    self.learnMore();
                });
            })
            .fail(self.manageXhrResponse);

        $(window)
    }

    public isCookiePresent = (): Boolean => {
        if (this.cookieExists()) {
            return true;
        } else {
            return false;
        }
    }

    private consentCookie = (): void => {
        var self: CookieConsent = this;
        self.setCookie(self.settings.getCookieName(), "" + new Date() + "", self.settings.domain, self.settings.expires);
        $('.dada-cookie-container').remove();
    };

    private learnMore = (): void => {
        var self: CookieConsent = this;
        self.getLongText()
            .done(function (response: ICookieConsentServiceResponse) {

                self.displayLongText(response);

                var longCookieConsentContainer: JQuery = $('#dada-cookie-long');
                if (!longCookieConsentContainer || longCookieConsentContainer.length == 0) {
                    alert("Wrong configuration: long cookie consent container ('#dada-cookie-long') not found");
                    return;
                }
                
                var closeButton: JQuery = longCookieConsentContainer.find('.dada-cookie-close');
                if (!closeButton || closeButton.length == 0) {
                    alert("Wrong configuration: close button ('.dada-cookie-close') in long cookie consent container ('#dada-cookie-long') not found");
                    return;
                }

                closeButton.click(function () {
                    $(this).trigger("consentCookie");
                });

                var closeModalButton: JQuery = longCookieConsentContainer.find('#dada-modal-close');
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
    }

    private setCookie = (name: string, value: string, domain?: string, expires: number = 365, path: string = "/") => {
        var cookie: Cookie = new Cookie(name, value, domain, expires, path);
        cookie.write();
    };

    private cookieExists = (): boolean => {
        var result: boolean = false;
        var storedCookie: string = $.cookie(this.settings.getCookieName());

        if (typeof storedCookie != "undefined" && storedCookie != null)
            result = true;

        return result;
    };


    private displayShortText = (response: ICookieConsentServiceResponse): void => {
        var shortText: string = '<div id="dada-cookie-short" class="dada-cookie-container dada-cookie-short-text-container dada-clear"><div class="dada-cookie-short-text">' + response.text;

        if (response.closeButtonVisible && response.closeButtonVisible != null && typeof response.closeButtonVisible != "undefined") {
            if (response.closeButtonText == null || response.closeButtonText == "undefined") response.closeButtonText = "Close"
            shortText += '<button id="dada-cookie-short-text-close" class="dada-cookie-close dada-cookie-button">' + response.closeButtonText + '</button>';
        }

        if (response.learnMoreButtonVisible && response.learnMoreButtonVisible != null && typeof response.learnMoreButtonVisible != "undefined") { 
            if (response.learnMoreButtonText == null || response.learnMoreButtonText == "undefined") response.learnMoreButtonText = "Learn More"
            shortText += '<button id="dada-cookie-short-text-learn-more" class="dada-cookie-learn-more dada-cookie-button">' + response.learnMoreButtonText + '</button>';
        }
        shortText += '</div></div>';

        $('body').append(shortText);
    };

    private displayLongText = (response: ICookieConsentServiceResponse): void => {
        var longText: string =
            '<div class="dada-modal-overlay dada-cookie-container"></div>' +
            '<div id="dada-cookie-long" class="dada-cookie-container dada-modal dada-clear" role="dialog">' +
            '<button id="dada-modal-close">&#9747;</button>' +
            response.text;

        if (response.closeButtonVisible && response.closeButtonVisible != null && typeof response.closeButtonVisible != "undefined") {
            if (response.closeButtonText == null || response.closeButtonText == "undefined") response.closeButtonText = "Close"
            longText += '<button id="dada-cookie-long-text-close" class="dada-cookie-close dada-cookie-button">' + response.closeButtonText + '</button>';
        }

        longText += '</div>';

        $('body').append(longText);
    };

    private getShortText = (): JQueryXHR => {
        var self: CookieConsent = this;
        return $.ajax({
            url: CookieConsent.serviceShortUrl + "/" + self.settings.language + "/" + self.settings.appId,
            type: "GET",
            contentType: "application/json",
            crossDomain: true
        })
    };

    private getLongText = (): JQueryXHR => {
        var self: CookieConsent = this;
        return $.ajax({
            url: CookieConsent.serviceLongUrl + "/" + self.settings.language + "/" + self.settings.appId,
            type: "GET",
            contentType: "application/json",
            crossDomain: true
        })
    };
    
    private manageXhrResponse(xhr: JQueryXHR, status, error): void {
        switch (xhr.status) {
            case 0: // Undefined error
                break;
            //case 401: // Not authorized
            //    window.location.href = app._conf.loginUrl;
            //    break;
            default: // Bad request, Internal Server Error, ecc...
                var response: any;

                try { response = jQuery.parseJSON(xhr.responseText); }
                catch (error) { }

                var innerException: any = null;

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
    }
}

class CookieConsentSettings implements ICookieConsentSettings {
    public appId: string;
    public language: string;
    public domain: string;
    public expires: number;
    
    constructor(appId: string, language: string, domain: string, expires: number) {
        this.appId = appId;
        this.language = language ? language : 'en';
        this.domain = domain ? domain : undefined;
        this.expires = expires ? expires : 365;
    }

    public getCookieName = (): string => {
        return CookieConsent.cookiePrefix + this.appId;
    };
}

class Cookie {
    public name: string;
    public value: string;
    public options: JQueryCookieOptions;

    public write = () => {
        $.cookie(this.name, this.value, this.options);
    }

    constructor(name: string, value: string, domain?: string, expires?: number, path: string = "/") {
        this.name = name;
        this.value = value;

        this.options = {
            path: path,
            expires: expires
        };
        if (domain) this.options.domain = domain;
    }
}

var cookieConsent: CookieConsent = new CookieConsent();

interface ICookieConsentSettings{
    appId: string;
    language: string;
    domain: string;
    expires: number;
    getCookieName: () => string;
}

interface ICookieConsentServiceResponse {
    text: string;
    closeButtonText: string;
    closeButtonVisible: boolean;
    learnMoreButtonText: string;
    learnMoreButtonVisible: boolean;
}