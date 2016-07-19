# poolApp

##Goals:  

Create a web app that tracks pool games and users.

**Requirements:**

- Use a framework that is mobile-responsive.  Semantic UI is chosen for its clean interface and class names.
 
- Use a database storage system that can be used locally, but is capable of pushing changes upstream.  PouchDB is used for this.

- Create a basic web framework.  Node with express is used for this, though the server can run through php, Apache, Nginx as well.  There isn't 
technically a need for a server, except that I don't think pouchDB will work with the file:// extension and requires a valid 
http:// extension, even if it's just for localhost.

- Faker is used to create fake data to add to the database and DOM for demonstration purposes.
 
- Demonstrate modern practices with Gulp, Bower, and other tools to automate and update without having to do manual changes.

#To Start

If you're using npm, `npm start` will fire up the app.  If you've installed Gulp and the dependencies, `gulp serve` will start up the app and use nodemon to monitor it in the background.  

If you use this approach, make sure you run `bower install` as well, because it will attempt to inject the latest dependencies from bower into the index.html file.

If you're not using node, any server will work to test out the app, just make sure that it's serving from the `public/` directory, or it will not work.

#Todos:

Like any demo app, there's a lot that can be done with validation, speeding up the DOM, etc.  This is a HTML5 "Modern" app, so if older browser support is needed, then several polyfills and extra compilation steps would be needed to make sure it is compatible.  