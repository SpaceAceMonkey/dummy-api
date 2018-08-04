dummy-api
----

**Purpose**

This package provides a generic, flexible API for developers to code against. Examples of when this is useful to have:

- You have been tasked with coding against an API that does not yet exist. Another member of your team, or another team, altogether, is still in the proces of designing and building the API your code will eventually use. This can create bottlenecks in the development process while you wait for pieces of the API to be completed, reviewed, tagged, and released.

- You are coding against an API which exists, but exists in an environment or on a network which you do not have acces to, or which is under-resourced and slow on the development servers.

This dummy API requires almost no resources. There are no databases, no high-overhead libraries, no intense calculations, and no unusual server requirements. You can have this code up and running within seconds of cloning the repository.

----

**Installation**

Clone this repository, then, inside the repository path, execute

```
npm install
```

----

**Configuration**

Inside the repository path, you will find a directory called **config**. Inside the config directory, you will see one or more yaml files named [environment].yml. For example,

```dev.yml```

These files contain the API configuration for various environments. If no environment is specified (see usage section, below), dummy-api defaults to "dev."

The core configuration options are found under the "app" key, and are as follows:

>debugging

The debugging section has several sub-keys controlling which debug information is output to the console.

- enabled: true | false
  - When set to true, debug output is enabled. Otherwise, all debug output is suppressed.
- show_only: [array of strings]
  - When this array is not empty, only messages from channels specified in the array will be output to the console.
- ignore: [array of strings]
  - Any message whose channel matches an element from this array will be suppressed.

  For more information on the debugging options, see the flexi-log Github page at https://github.com/SpaceAceMonkey/flexi-log

>port

Specifies which port the dummy API should listen on for incoming connections.

----

**Usage**

Start the dummy API with

```npm run api```

Barring any errors, your dummy API server is now up and running, and you can begin making requests. By default, the API environment defaults to "dev." If you would like to specify a different environment, invoke the API daemon with the DUMMY_API_ENV environment variable set to the desired value.

```DUMMY_API_ENV=prod npm run api```

This invokes the API damon with the environment set to "prod." The API will expect to find a file named prod.yml in the config directory.

>Endpoints
- /false
  - Returns false
- /mirror
  - Returns the same post body or query string that was sent to it
- /responsecode/[code]
  - Returns an empty body with an http response code of [code]
  - Example: ```http://localhost:4248/responsecode/302```
- /true
  - Returns true
- /truefalse
  - Randomizes between returning true, and returning false

>HTTP verbs

Dummy-api understands the following HTTP verbs for all routes:

- GET
- HEAD
  - HEAD requests will return an empty body when using /mirror
- DELETE
- PATCH
- POST
- PUT


>Accepted content-types

Content-types such as application/json, text/plain, and application/x-www-form-urlencoded will work as you'd expect them to when calling /mirror. Form-data is not processed, and will be returned as a string with crlf and additional formatting as provided by the client.

For the /false, /true, and /truefalse endpoints, all of the HTTP verbs listed in the "HTTP verbs" section will work with all valid content-types.

>Overriding the returned content-type

Under normal usage, dummy-api will automatically set the content-type header before returning data. By adding a "content-type-override" header to your request, you can force dummy-api to use the MIME type specified in that header for the returned data.

For example, adding

```content-type-override: text/plain```

to your request will force dummy-api to return a response using the text/plain MIME type, even if it would otherwise have been, say, application/json.

----

**Documentation**

To build the JSDoc documentation, run 

```npm run doc -- /var/www/html/jsdoc/dummy-api```

This will build the documentation, and output it to /var/www/html/jsdoc/dummy-api. 

There's not much documentation to see, but it does exist.
