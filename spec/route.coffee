describe 'Simrou.Route', ->
    router = null
    spy = jasmine.createSpy('eventHandler')
    
    beforeEach ->
        router = new Simrou()
        spy.reset()
    
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
            
        
    describe 'attachAction()', -> # ...
    describe 'attachActions()', -> # ...
    describe 'match()', -> # ... parameters and splats
    describe 'detachAction()', -> # ...
    
    
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
