/**
 * @preserve Simrou - Simple javascript routing framework
 * Copyright (c) 2012 büro für ideen, www.buero-fuer-ideen.de
 */

;(function($, window, undefined) {

    // Make a local copy of the location object
    var loc = window.location;

    // Declare classes
    var Simrou, Route;
        
    // @include core.js 
    // @include route.js 
    
    // Export version as a static property
    Simrou.version = '1.2.0';
    
    // Attach Simrou to the global object
    window.Simrou = Simrou;
    
})(jQuery, this);
