import httplib, urllib, re, os.path

def main():
    # Read the main javascript file
    inputFile = open('src/simrou.js', 'r');
    code = inputFile.read()
    inputFile.close()
    
    # Search for @include commands
    pattern = re.compile('// @include (.*?)\s', re.UNICODE)
    matches = pattern.findall(code)
    
    # Process all @include commands
    for scriptName in matches:
        filename = 'src/%s' % scriptName
        if not os.path.isfile(filename):
            continue
        
        inputFile = open(filename, 'r')
        externalCode = inputFile.read()
        inputFile.close()
        
        code = pattern.sub(externalCode, code, 1)
    
    # Get the parameters ready
    params = urllib.urlencode([
        ('js_code', code),
        ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
        ('output_info', 'compiled_code'),
        ('output_format', 'text'),
      ])
    
    headers = { 'Content-type': 'application/x-www-form-urlencoded' }
    
    # Send the request to the Closure Compiler API
    conn = httplib.HTTPConnection('closure-compiler.appspot.com')
    conn.request('POST', '/compile', params, headers)
    
    # Store the response in a variable
    response = conn.getresponse()
    compiledCode = response.read()
    conn.close()
    
    # Did an error occur?
    if not compiledCode.strip():
        print "Error"
        
        # Save the uncompiled code instead
        compiledCode = code
    
    # Write the compiled data to the disc
    outputFile = open('build/simrou.min.js', 'w')
    outputFile.write(compiledCode)
    outputFile.close()
    
if __name__ == '__main__':
    main()