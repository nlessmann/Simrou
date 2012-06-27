describe 'Simrou.Route', ->
    router = null
    spy = jasmine.createSpy('eventHandler')
    
    beforeEach ->
        router = new Simrou()
        spy.reset()
    
    it 'is present', ->
        expect(typeof Simrou.Route).toBe('function')
    
    it 'is a constructor', ->
        route = new Simrou.Route('foo')
        expect(typeof route).toBe('object')
        expect(route instanceof Simrou.Route).toBeTruthy()
    
    it 'provides shortcuts for attaching event handlers to common HTTP methods', ->
        route = router.addRoute('foo')
        shortcuts = ['any', 'get', 'post', 'put', 'delete']
        
        expect(typeof route[name]).toBe('function') for name in shortcuts
    
    it 'is case-sensitive by default', ->
        route = router.addRoute('foo')
        route.any(spy)
        expect(route.caseSensitive).toBe(true)
        
        router.resolve('FOO')
        expect(spy).not.toHaveBeenCalled()
    
    it 'can be case-insensitive', ->
        route = router.addRoute('foo', false)
        route.any(spy)
        
        router.resolve('FOO')
        expect(spy).toHaveBeenCalled()
    
    
    describe 'toString()', ->
        it 'returns a string', ->
            router = new Simrou()
            str = router.addRoute('foo').toString()
            
            expect(typeof str).toBe('string')
            
        
    describe 'attachAction()', ->
        it 'allows to attach event handlers to custom "HTTP methods"', ->
            router = new Simrou()
            spy = jasmine.createSpy('eventHandler')
            router.addRoute('foo').attachAction(spy, 'baz')
            
            router.resolve('foo', 'baz')
            expect(spy).toHaveBeenCalled()
        
        # proper functioning in general has already been covered by Simrou.resolve()
        
    
    describe 'attachActions()', ->
        router = null
        route = null
        spies = (jasmine.createSpy('eventHandler' + i) for i in [1..3])
        
        beforeEach ->
            router = new Simrou()
            route = router.addRoute('foo')
            spy.reset() for spy in spies
            
        it 'can also attach a single event handler', ->
            route.attachActions(spies[0], 'get')
            router.resolve('foo', 'get')
            expect(spies[0]).toHaveBeenCalled()
        
        it 'can attach multiple event handlers from an array', ->
            route.attachActions(spies, 'post')
            router.resolve('foo', 'post')
            expect(spy).toHaveBeenCalled() for spy in spies
        
        it 'can attach multiple event handlers from a plain object', ->
            obj = 
                get: spies[0]
                post: spies[1]
                any: spies[2]
            
            route.attachActions(obj)
            router.resolve('foo', 'get')
            
            expect(spies[0]).toHaveBeenCalled()
            expect(spies[1]).not.toHaveBeenCalled()
            expect(spies[2]).toHaveBeenCalled()
        
        it 'ignores the specified method for plain objects', ->
            obj = 
                get: spies[0]
            
            route.attachActions(obj, 'post')
            router.resolve('foo', 'get')
            expect(spies[0]).toHaveBeenCalled()
        
    
    describe 'detachAction()', ->
        router = null
        route = null
        spies = (jasmine.createSpy('eventHandler' + i) for i in [1..3])
        
        beforeEach ->
            router = new Simrou()
            route = router.addRoute('foo')
            
            spy.reset() for spy in spies
            route.attachActions(spies, 'get')
            
        it 'removes the specified event handler from the chain', ->
            route.detachAction(spies[0], 'get')
            router.resolve('foo')
            expect(spies[0]).not.toHaveBeenCalled()
        
        it 'does not detach other event handlers', ->
            route.detachAction(spies[0], 'get')
            router.resolve('foo', 'get')
            expect(spy).toHaveBeenCalled() for spy in spies when spy isnt spies[0]
        
        it 'can be used to remove all event handlers for a single HTTP method', ->
            route.detachAction('get')
            router.resolve('foo', 'get')
            expect(spy).not.toHaveBeenCalled() for spy in spies
        
    
    describe 'match()', ->
        router = null
        
        beforeEach ->
            router = new Simrou()
        
        it 'returns an empty array for a match with a regular route', ->
            route = router.addRoute('foo')
            expect(route.match('foo')).toEqual([])
        
        it 'returns "false", if the route is not a match', ->
            route = router.addRoute('foo')
            expect(route.match('bar')).toBe(false)
        
        it 'extracts parameters and splats', ->
            expected = 
                bar: 'bang'
                foo: 'foo/bar'
            
            route = router.addRoute('foo/:bar/baz/*foo')
            result = route.match('foo/bang/baz/foo/bar')
            
            expect(result).toEqual(expected)
        
    
    describe 'assemble()', ->
        router = new Simrou()
        route = router.addRoute(':foo/bang/:baz/*bar')
        
        it 'works with a list of arguments', ->
            result = route.assemble('foo', 'baz', 'bar')
            expect(result).toBe('foo/bang/baz/bar')
        
        it 'works with a plain object', ->
            obj = 
                baz: 'foo'
                bar: 'baz'
                foo: 'bar'
            
            result = route.assemble(obj)
            expect(result).toBe('bar/bang/foo/baz')
