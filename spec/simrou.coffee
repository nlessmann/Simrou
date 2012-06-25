describe 'Simrou', ->
    it 'is present', ->
        expect(typeof Simrou).toBe('function')
    
    it 'is attached to the jQuery namespace', ->
        expect(jQuery.Simrou).toEqual(Simrou)
    
    it 'is a constructor', ->
        router = new Simrou()
        expect(typeof router).toBe('object')
        expect(router instanceof Simrou).toBeTruthy()
    
    it 'reports correctly that the testing environment supports the onHashChange event', ->
        router = new Simrou()
        expect(router.eventSupported).toBeTruthy()