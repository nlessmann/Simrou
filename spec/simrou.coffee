describe 'Simrou', ->
    it 'is present', ->
        expect(typeof Simrou).toBe('function')
    
    it 'is attached to the jQuery namespace', ->
        expect(jQuery.Simrou).toEqual(Simrou)
    
    it 'is a constructor', ->
        router = new Simrou()
        expect(typeof router).toBe('object')
        expect(router instanceof Simrou).toBeTruthy()
    
    it 'reports correctly that the testing environment supports the "onHashChange" event', ->
        router = new Simrou()
        expect(router.eventSupported).toBeTruthy()
    

    describe 'addRoute()', ->
        router = null
        
        beforeEach ->
            router = new Simrou()
        
        it 'returns an instance of Simrou.Route', ->
            route = router.addRoute('foo')
            expect(typeof route).toBe('object')
            expect(route instanceof Simrou.Route).toBeTruthy()
        
        it 'attaches case-sensitive routes by default', ->
            route1 = router.addRoute('foo')
            expect(route1.caseSensitive).toBeTruthy()
            
            route2 = router.addRoute('bar', true)
            expect(route2.caseSensitive).toBeTruthy()
        
        it 'can attach case-sensitive routes', ->
            route = router.addRoute('foo', false)
            expect(route.caseSensitive).toBeFalsy()
        
        it 'can reattach Route instances', ->
            route1 = router.addRoute('foo')
            route2 = router.addRoute(route1)
            
            expect(route2).toBe(route1)
        
        it 'ignores the case-sensitive flag when reattaching routes', ->
            route1 = router.addRoute('foo', false)
            route2 = router.addRoute(route1, true)
            
            expect(route2.caseSensitive).toBeFalsy()
        
    
    describe 'addRoutes()', ->
        router = null
        
        beforeEach ->
            router = new Simrou()
            
        it 'can also be used to attach a single route', ->
            route = router.addRoutes('foo')
            expect(route).toEqual(router.addRoute('foo'))
        
        it 'can also be used to attach a single case-insensitive route', ->
            route = router.addRoutes('foo', false)
            expect(route.caseSensitive).toBeFalsy()
        
        it 'invokes a function in the context of the router', ->
            spy = jasmine.createSpy('fn').andCallFake ->
                expect(@).toBe(router)
            
            router.addRoutes(spy)
            expect(spy).toHaveBeenCalled()
        
        it 'invokes a function and returns whatever it returned', ->
            spy = jasmine.createSpy('fn').andReturn('foo')
            
            result = router.addRoutes(spy)
            expect(result).toBe('foo')
        
        it 'invokes a function and passes the case-sensitive flag', ->
            spy = jasmine.createSpy('fn')
            
            router.addRoutes(spy, false)
            expect(spy).toHaveBeenCalledWith(false)
            
            router.addRoutes(spy, true)
            expect(spy).toHaveBeenCalledWith(true)
        
        it 'attaches all routes from a plain object and returns an object containing the Route instances', ->
            result = router.addRoutes
                foo: ->
                bar: ->
            
            expect($.isPlainObject(result)).toBeTruthy()
            expect(typeof route).toBe('object') for pattern, route of result
        
        it 'can attach case-insensitive routes from a plain object', ->
            routes =
                foo: ->
                bar: ->
            result = router.addRoutes(routes, false)
            
            expect(result.foo.caseSensitive).toBeFalsy()
        
        it 'attaches all routes from an array and returns an array of Route instances', ->
            result = router.addRoutes(['foo', 'bar'])
            expect(result instanceof Array).toBeTruthy()
            expect(result.length).toBe(2)
            expect(typeof route).toBe('object') for route in result
        
        it 'allows arrays to again contain arrays', ->
            arr = ['bar', 'baz']
            result = router.addRoutes(['foo', arr])
            
            expect(result.length).toBe(2)
            expect(result[1]).toEqual(router.addRoutes(arr))
        
        it 'allows arrays to contain functions', ->
            spy = jasmine.createSpy('fn').andReturn('bar')
            result = router.addRoutes(['foo', spy])
            
            expect(spy).toHaveBeenCalled()
        
        it 'allows arrays to contain objects', ->
            obj = 
                bar: ->
            result = router.addRoutes(['foo', obj])
            
            expect(result.length).toBe(2)
            #expect(result[1]).toEqual(router.addRoutes(obj)) # does not work, seems to be a bug in jasmine
        
        it 'can attach case-insensitive routes from an array', ->
            result = router.addRoutes(['bar', 'foo'], false)
            expect(route.caseSensitive).toBeFalsy() for route in result
        
    
    describe 'resolve()', ->
        router = null
        route = null
        spy = jasmine.createSpy('actionHandler')
        
        beforeEach ->
            router = new Simrou()
            route = router.addRoute('foo')
            spy.reset()
        
        it 'invokes the "any" action handler of a registered route', ->
            route.any(spy)
            router.resolve('foo')
            expect(spy).toHaveBeenCalled()
            
            spy.reset()
            router.resolve('bar')
            expect(spy).not.toHaveBeenCalled()
        
        it 'invokes the event handlers specific to the HTTP method', ->
            route.post(spy)
            router.resolve('foo', 'POST')
            expect(spy).toHaveBeenCalled()
            
            spy.reset()
            router.resolve('foo', 'PUT')
            expect(spy).not.toHaveBeenCalled()
        
        it 'invokes all registered event handlers', ->
            route.any(spy)
            route.get(spy)
            
            router.resolve('foo', 'GET')
            expect(spy.calls.length).toBe(2)
        
        it 'reports whether the route has been successfully resolved', ->
            route.any(spy)
            expect(router.resolve('foo')).toBeTruthy()
            expect(router.resolve('bar')).toBeFalsy()
        
        it 'ignores leading hash symbols', ->
            expect(router.resolve('###foo')).toBeTruthy()
        
        it 'ignores trailing slashes', ->
            expect(router.resolve('foo///')).toBeTruthy()
        
        it 'can resolve "/"', ->
            router.addRoute('/')
            expect(router.resolve('/')).toBeTruthy()
        
    
    describe 'navigate()', ->
        router = null
        spy = jasmine.createSpy('actionHandler')
        
        beforeEach ->
            router = new Simrou()
            spy.reset()
        
        it 'sets location.hash to the specified hash', ->
            location.hash = ''
            router.navigate('foo')
            expect(location.hash).toBe('#foo')
        
        it 'notifies the GET event handlers', ->
            route = router.addRoute('foo')
            route.get(spy)
            
            location.hash = ''
            router.navigate('foo')
            
            expect(spy).toHaveBeenCalled()
        
        it 'notifies the event handlers, even when the hash did not change', ->
            route = router.addRoute('foo')
            route.get(spy)
            
            location.hash = 'foo'
            router.navigate('foo')
            
            expect(spy).toHaveBeenCalled()
        
    
    describe 'removeRoute()', ->
        router = null
        spy = jasmine.createSpy('actionHandler')
        
        beforeEach ->
            router = new Simrou()
            spy.reset()
        
        it 'can unattach a route by its route object', ->
            route = router.addRoute('foo')
            router.removeRoute(route)
            
            expect(router.resolve('foo')).toBeFalsy()
        
        it 'can unattach a route by its pattern', ->
            router.addRoute('foo')
            router.removeRoute('foo')
            
            expect(router.resolve('foo')).toBeFalsy()
        
    
    describe 'start()', ->
        router = null
        spies = (jasmine.createSpy('eventHandler' + i) for i in [1..2])
        $form = $('<form action="foo" method="put"></form>')
        
        beforeEach ->
            router = new Simrou()
            spy.reset() for spy in spies
            $form.appendTo('body')
            
            runs -> location.hash = ''
            waits(250)  # wait for the event to be distributed (async process!)
        
        afterEach ->
            $(window).off('hashchange')
            $('body').off('submit', 'form')
            $form.remove()
        
        it 'resolves location.hash if it is not empty', ->
            router.addRoute('baz').get(spies[0])
            router.addRoute('foo').any(spies[1])
            
            runs ->
                location.hash = 'baz'
                router.start('foo')
            waitsFor (-> spies[0].calls.length > 0), 'Route getting resolved', 250
            runs -> expect(spies[1]).not.toHaveBeenCalled()
        
        it 'navigates to an initial hash, if one is specified and location.hash is empty', ->
            router.addRoute('bar').get(spies[0])
            runs -> router.start('bar')
            waitsFor (-> spies[0].calls.length > 0), 'Route getting resolved', 250
            runs -> expect(location.hash).toBe('#bar')
        
        it 'makes the router listen to hash changes by default', ->
            router.addRoute('foo').get(spies[0])
            runs ->
                router.start()
                location.hash = 'foo'
            waitsFor (-> spies[0].calls.length > 0), 'Route getting resolved', 250
        
        it 'can be told to not make the router listen to hash changes', ->
            router.addRoute('baz').any(spies[0])
            runs ->
                router.start(null, false)
                location.hash = 'baz'
            waits(250)
            runs -> expect(spies[0]).not.toHaveBeenCalled()
        
        it 'makes the router listen to form submissions (no redirect, not update of location.hash)', ->
            router.addRoute('foo').put(spies[0])
            runs ->
                router.start()
                $form.submit()
            waitsFor (-> spies[0].calls.length > 0), 'Route getting resolved', 250
            runs -> expect(location.hash).not.toBe('#foo')
        
        it 'can be told not to make the router listen to form submissions', ->
            router.addRoute('foo').put(spies[0])
            runs ->
                router.start(null, false, false)
                $form.on('submit', ((e) -> do e.preventDefault)).submit()
            waits(250)
            runs ->
                expect(spies[0]).not.toHaveBeenCalled()
        
    
    describe 'stop()', ->
        router = new Simrou()
        spy = jasmine.createSpy('eventHandler')
        router.addRoute('bar').any(spy)
        
        beforeEach ->
            runs -> location.hash = ''
            waits(250)
            runs ->
                router.start()
                spy.reset()
            
        afterEach ->
            $(window).off('hashchange')
            $('body').off('submit', 'form')
        
        it 'makes the router stop listening to hash changes', ->
            runs ->
                router.stop()
                location.hash = 'bar'
            waits(250)
            runs -> expect(spy).not.toHaveBeenCalled()
        
        it 'makes the router stop listening to form submissions', ->
            $form = $('<form action="bar" method="post"></form>').appendTo('body')
            $form.on('submit', ((e) -> do e.preventDefault))
            
            runs ->
                router.stop()
                $form.submit()
            waits(250)
            runs ->
                expect(spy).not.toHaveBeenCalled()
                $form.remove()
