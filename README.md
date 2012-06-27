Simrou 1.5
==========

**A very tiny hash-based JavaScript routing system**

Simrou is a small JavaScript framework that allows to bind event handlers that listen to changes of
<code>window.location.hash</code>. This is in particular useful when developing single-page web applications,
because this technique helps to write maintainable code and enables deep-linking. See the demo code below to get
an idea of how this works.

In contrary to other frameworks with similar features, Simrou is intended to be extremly simple to setup and use. 
It does not provide any other features beside the routing, hence it is very lightweight and flexible.


Demo
----

```javascript
// Setup an instance of Simrou
var router = new Simrou();

// Register a route that matches edit requests to any article
var editRoute = router.addRoute('/article/:id/edit');

// Bind an action handler to that route
editRoute.get(function(event, params) {
    showEditForm(params.id);
});

// HTML Forms are getting watched, so you can even bind an
// action handler to POST/PUT/DELETE requests.
editRoute.post(saveChanges);

// Start the engine!
router.start();

// Navigate somewhere (updates location.hash and resolves the URL)
router.navigate('/article/42/edit');

// ..or resolve without touching location.hash
router.resolve('/article/18/edit', 'POST');
```

Links work just as expected if you prepend them with a hash symbol:

```html
<a href="#/article/182/edit">Edit article 182</a>
```

A typical url within your application will look like this:

```
http://your-domain.tld/#/article/182/edit
```


Advanced usage
--------------

### Bulk adding of routes

You can add more than one route or action handler at a time:

```javascript
var router = new Simrou({
    '/article/:id/edit': {
        get: [ actionHandler11, actionHandler12 ],
        post: actionHandler2,
        put: actionHandler3
    },
    '/downloads/*': { get: actionHandler4 },
    '/homepage': actionHandler5
});

router.start('/homepage');   // Handing over a default route to navigate to
```


### Wildcards

You can use two different types of wildcards in your routes: **Parameters** and **Splats** (this is just the 
same as in [Backbone.js](http://documentcloud.github.com/backbone/)).

* Parameters are introduced by a colon and end at the next slash.  
  e.g. "/test/:name" matches "/test/mike" and "/test/joe", but not "/test/joe/something".

* Splats work the same way, but start with an asterix instead of a colon and are not limited by slashes. They are an optional part of the route.  
  e.g. "/test/*sp" matches "/test" (extracting ""), "/test/joe" (extracting "joe") and "/test/joe/something/more" (extracting "joe/something/more").

Parameters and splats can be mixed:

```javascript
var articleRoute = router.addRoute('/articles/:edit/*action');
```

Any action handler attached to this route will be called with the following arguments:

```javascript
function actionHandler(event, parameters, method)
```

* <code>event</code> is a [jQuery event object](http://api.jquery.com/category/events/event-object/).
* <code>parameters</code> is a plain object <code>{}</code> that contains the values extracted from the route (parameters and splats).  
  With the route from above example, parameter has two properties, "edit" and "action".
* <code>method</code> is a string such as 'get' or 'post', specifing the desired HTTP method.


### Case-insensitive routes

By default, all routes are case-sensitive. For a situation where you need to create a case-insensitive route,
<code>addRoute()</code> accepts a second parameter:

```javascript
var route = router.addRoute('/foo', false); // <-- route is now case-insensitive, e.g. '/FOO' is a match.
```


### Assembling routes

The route object provides a nifty helper method to get a concrete url:

```javascript
var article = router.addRoute('/articles/:id/*action');
var url = article.assemble(17, 'edit'); // returns: /articles/17/edit

// Equivalent syntax:
url = article.assemble({ id: 17, action: 'edit' });
```


### Attaching event handlers via jQuery events

Action handlers can be attached via jQuery events instead of using Simrou's <code>attachAction()</code> method or the shortcuts <code>get(), post(), put(), delete() and any()</code>:

```javascript
var route = router.addRoute('some/route');

// This..
$(route).on('simrou:get', eventHandler);

// ..equals:
route.get(eventHandler);
```


### Event handlers for "any" HTTP method

If you want to catch a route regardless which HTTP method was intended, you can do that as well:

```javascript
route.any(function() {
    // ..do stuff..
});
```

Note that it is possible to bind multiple event handlers to a route, e.g.:

```javascript
var route = router.addRoute('some/route');

route.get(eventHandler1);
route.get(eventHandler2);
route.any(eventHandler3);

router.resolve('some/route', 'get'); // all three event handlers get notified!
```


Requirements &amp; License
--------------------------

Simrou requires jQuery 1.7 or newer and is released under the MIT license.

Internally, Simrou binds itself to the <code>onHashChange</code> event. If you want to include a fallback for older 
browser or the IE 7, Simrou works out of the box with Ben Alman's excellent
[HashChange Plugin for jQuery](http://benalman.com/projects/jquery-hashchange-plugin/). No setup required.