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
        
        it 'attaches all routes from an array and returns an array of Route instances', ->
            result = router.addRoutes(['foo', 'bar'])
            expect(result instanceof Array).toBeTruthy()
            expect(result.length).toBe(2)
            expect(typeof route).toBe('object') for route in result
            
        it 'can attaches case-insensitive routes from an array', ->
            result = router.addRoutes(['bar', 'foo'], false)
            expect(route.caseSensitive).toBeFalsy() for route in result
        
        
        # Array
        # Object
        # String