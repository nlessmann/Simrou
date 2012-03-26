Simrou 1.1
==========

**A very tiny hash-based JavaScript routing system**

Simrou is a small javascript framework, that allows to bind action handlers to <code>window.location.hash</code>.
This is in particular useful for the development of single-page web applications. See the demo code below to get
an idea of this works.

In contrary to other frameworks with similar features, Simrou is intended to be very simple to setup and use. 
It does not provide any other features beside the routing and is therefore very lightweight.

Demo code
------------

<pre><code>$(function() {
    // Setup an instance of Simrou
    var router = new Simrou();
    
    // Register a route that matches all edit requests to your articles
    var editRoute = router.registerRoute('/article/:id/edit');
    
    // Bind an action handler to that route
    editRoute.get(function(eventObject, method, id) {
	    showEditForm(id);
    });
    
    // HTML Forms are getting watched, so we can bind an action handler
    // to POST requests to that same route
    editRoute.post(function(eventObject, method, id) {
	    saveChanges(id);
    });
    
    // Get the router running...
    router.start();
    
    // Navigate somewhere:
    router.navigate('/article/42/edit');
});
</code></pre>

Links work just as expected if you prepend them with a hash symbol:

<code><a href="#/article/182/edit">Edit article 182</a></code>

A typical url within your application would actually look like this:

<code>http://your-domain.tld/some/path.ext#/article/182/edit</code>

Advanced usage
--------------

You can as well add more than one route or action handler at a time:

<pre><code>$(function() {
    var router = new Simrou({
        '/article/:id/edit': {
            get: actionHandler1,
            post: actionHandler2,
            put: actionHandler3
        },
        '/downloads/*': {
            get: actionHandler4
        },
        '/homepage': actionHandler5
    });
    
    router.start('/homepage');   // Handing over a default route to navigate to
});
</code></pre>

In your routes, you can use two different types of wildcards: **Parameters** and **Splats** (this is just the 
same as in Backbone.js).

* Parameters are introduced by a colon and end at the next slash, e.g. "/test/:name" matches "/test/mike aswell" 
as "/test/joe" but not "/test/joe/something".
* Splats start with an asterix and may optionally be followed by a name, e.g. "/test/*sp" matches "/test/joe" 
(extracting "joe") aswell as "/test/joe/something/and/even/more" (extracting "joe/something/and/even/more").

Parameters and splats can be mixed:

<code>var articleRoute = router.registerRoute('/articles/:edit/*action');</code>

Any action handler attached to this route will be called with the following arguments:

<code>function actionHandler(event, method, edit, action)</code>

* event is a [jQuery event object](http://api.jquery.com/category/events/event-object/).
* method is a string such as 'get' or 'post', specifing the desired HTTP method.
* edit and action are the values extracted from the route.

Action handlers can be attached via jQuery events instead of using Simrou's <code>attachAction()</code> method:

<pre><code>var route = router.registerRoute('some/route');

// This..
$(route).on('simrou:get', eventHandler);

// ..equals:
route.attachAction('get', eventHandler);
</code></pre>

Requirements &amp; License
--------------------------

Simrou requires jQuery 1.7 or newer and is released under the MIT license.

Internally, Simrou binds itself to the <code>onHashChange</code> event. If you want to include a fallback for older 
browser or the IE, Simrou works out of the box with Ben Alman's [HashChange Plugin for jQuery](http://benalman.com/projects/jquery-hashchange-plugin/).