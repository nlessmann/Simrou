Simrou 1.2
==========

**A very tiny hash-based JavaScript routing system**

Simrou is a small javascript framework, that allows to bind action handlers to <code>window.location.hash</code>.
This is in particular useful for the development of single-page web applications. See the demo code below to get
an idea of this works.

In contrary to other frameworks with similar features, Simrou is intended to be very simple to setup and use. 
It does not provide any other features beside the routing - therefore it is very lightweight and flexible.

Demo
----

```javascript
$(function() {
    // Setup an instance of Simrou
    var router = new Simrou();
    
    // Register a route that matches all edit requests to your articles
    var editRoute = router.addRoute('/article/:id/edit');
    
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
```

Links work just as expected if you prepend them with a hash symbol:

```html
<a href="#/article/182/edit">Edit article 182</a>
```

A typical url within your application will look like this:

```
http://your-domain.tld/some/path.html#/article/182/edit
```

Advanced usage
--------------

You can as well add more than one route or action handler at a time:

```javascript
$(function() {
    var router = new Simrou({
        '/article/:id/edit': {
            get: [ actionHandler11, actionHandler12 ],
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
```

You can use two different types of wildcards in your routes: **Parameters** and **Splats** (this is just the 
same as in [Backbone.js](http://documentcloud.github.com/backbone/)).

* Parameters are introduced by a colon and end at the next slash.  
  e.g. "/test/:name" matches "/test/mike" and "/test/joe", but not "/test/joe/something".

* Splats start with an asterix and may optionally be followed by a name.  
  e.g. "/test/*sp" matches "/test/joe" (extracting "joe") and "/test/joe/something/more" (extracting "joe/something/more").

Parameters and splats can be mixed:

```javascript
var articleRoute = router.addRoute('/articles/:edit/*action');
```

Any action handler attached to this route will be called with the following arguments:

```javascript
function actionHandler(event, method, edit, action)
```

* event is a [jQuery event object](http://api.jquery.com/category/events/event-object/).
* method is a string such as 'get' or 'post', specifing the desired HTTP method.
* edit and action are the values extracted from the route.

The route object provides a nifty helper method to get a concrete url:

```javascript
var article = router.addRoute('/articles/:id/*action');
article.assemble(17, 'edit'); // returns: /articles/17/edit
```

Action handlers can be attached via jQuery events instead of using Simrou's <code>attachAction()</code> method:

```javascript
var route = router.addRoute('some/route');

// This..
$(route).on('simrou:get', eventHandler);

// ..equals:
route.attachAction('get', eventHandler);
```

Requirements &amp; License
--------------------------

Simrou requires jQuery 1.7 or newer and is released under the MIT license.

Internally, Simrou binds itself to the <code>onHashChange</code> event. If you want to include a fallback for older 
browser or the IE, Simrou works out of the box with Ben Alman's [HashChange Plugin for jQuery](http://benalman.com/projects/jquery-hashchange-plugin/).