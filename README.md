Simrou 1.0
==========

**A very tiny hash-based JavaScript routing system**

Simrou is a lightweight javascript framework, that allows to bind action handlers to the value of <code>window.location.hash</code>.
This is in particular useful for the development of single-page web applications.

<pre><code>$(function() {
    // Setup an instance of Simrou
    var router = new Simrou();
    
    // Register a route that matches all edit requests to your articles
    var editRoute = router.registerRoute('/article/:id/edit');
    
    // Bind an action handler to that route
    editRoute.get(function() {
	    showEditForm();
    });
    
    // HTML Forms are getting watched, so we can bind an action handler
    // to POST requests to that same route
    editRoute.post(function() {
	    saveChanges();
    }); 
    
    // Get the router running...
    router.start();
    
    // Navigate somewhere:
    router.navigate('/article/42/edit');
});
</code></pre>

In contrary to other frameworks that provide similar features, Simrou is intended to be very simple to setup and use. Simrou does not provide any other features and therefore is very lightweight.

Simrou requires jQuery 1.7 or newer.