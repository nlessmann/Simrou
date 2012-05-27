import os.path
import httplib
import urllib
import subprocess

def main():
    # Get the dirname of the Simrou trunk
    filename = os.path.realpath(__file__)
    dirname = os.path.dirname(filename)
    
    # Compile coffeescript to javascript
    subprocess.call('coffee --output "%s/build" --compile "%s/src/simrou.coffee"' % (dirname, dirname), shell=True)

    # Read the main javascript file
    inputFile = open('%s/build/simrou.js' % dirname, 'r');
    code = inputFile.read()
    inputFile.close()
    
    # Get the parameters ready
    params = urllib.urlencode([
        ('js_code', code),
        ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
        ('output_info', 'compiled_code'),
        ('output_format', 'text'),
      ])
    
    headers = { 'Content-type': 'application/x-www-form-urlencoded' }
    
    # Send request to the Closure Compiler API
    conn = httplib.HTTPConnection('closure-compiler.appspot.com')
    conn.request('POST', '/compile', params, headers)
    
    # Store the response in a variable
    response = conn.getresponse()
    compiledCode = response.read()
    conn.close()
    
    # Did an error occur? (= empty string got returned)
    if not compiledCode.strip():
        print 'Error'
        
        # Save the uncompiled code instead
        compiledCode = code
    
    # Write the compiled data to the disc
    outputFile = open('%s/build/simrou.min.js' % dirname, 'w')
    outputFile.write(compiledCode)
    outputFile.close()
    
if __name__ == '__main__':
    main()