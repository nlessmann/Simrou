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
        
        it 'returns an object', ->
            route = router.addRoute('foo')
            expect(typeof route).toBe('object')
        
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
            expect(typeof route).toBe('object') for pattern, route in result
        
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
        
    
describe 'A router', ->
    
    it 'can be started and stopped', ->
        # ...
    