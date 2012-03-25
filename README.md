Simrou 1.0
==========

**A very tiny hash-based JavaScript routing system**

Simrou is a small javascript framework, that allows to bind action handlers to the value of <code>window.location.hash</code>.
This is in particular useful for the development of single-page web applications.

In contrary to other frameworks with similar features, Simrou is intended to be very simple to setup and use. It does not provide any other features beside the routing and is therefore very lightweight.

Sample usage
------------

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

Requirements &amp; License
--------------------------

Simrou requires jQuery 1.7 or newer and is released under the MIT license.

Internally, Simrou binds itself to the <code>onHashChange</code> event. If you want to include a fallback for older browser or the IE, Simrou works out of the box with Ben Alman's [HashChange Plugin for jQuery](http://benalman.com/projects/jquery-hashchange-plugin/).