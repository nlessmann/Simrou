describe 'The JavaScript engine', ->
    it 'names the global object "window"', ->
        expect(typeof window).toBe('object')
    
    it 'provides the "location" object', ->
        expect(typeof location).toBe('object')
        expect(typeof location.hash).toBe('string')
    
    it 'allows changing location.hash', ->
        location.hash = ''
        expect(location.hash).not.toBe('#foo')
        location.hash = 'foo'
        expect(location.hash).toBe('#foo')
        
    it 'ignores leading hash symbols when writing to location.hash', ->
        location.hash = '#bar'
        expect(location.hash).toBe('#bar')
    
    it 'provides the "onHashChange" event', ->
        expect('onhashchange' of window).toBeTruthy()


describe 'jQuery', ->
    it 'is present', ->
        expect(jQuery).toBeDefined()
        expect($).toEqual(jQuery)
    
    it 'has the expected version number', ->
        expect($.fn.jquery).toBe('1.7.2')