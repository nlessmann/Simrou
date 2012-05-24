/**
 * @preserve Simrou - Simple javascript routing framework
 * Copyright (c) 2012 büro für ideen, www.buero-fuer-ideen.de
 */

;(function($, window, undefined) {

    // Store a local reference to the location object
    var loc = window.location;
    
    // Check whether the hashchange event is supported
    var docMode = window.document.documentMode,
        eventSupported = 'onhashchange' in window && (docMode === undefined || docMode > 7);

    // Declare classes
    var Simrou, Route;
     
    // @include core.js 
    // @include route.js 
    
    // Export version as a static property
    Simrou.version = '1.2.1';
    
    // Attach Simrou to the global object
    window.Simrou = Simrou;
    
})(jQuery, this);
