# poolApp

##Goals:  

Create a web app that tracks pool games and users.

Requirements:

- Use a framework that is mobile-responsive.  Semantic UI is chosen for its clean interface and class names.
 
- Use a database storage system that can be used locally, but is capable of pushing changes upstream.  PouchDB is used for this.

- Create a basic web framework.  Node with express is used for this, though the server can run through php, Apache, Nginx as well.  There isn't 
technically a need for a server, except that I don't think pouchDB will work with the file:// extension and requires a valid 
http:// extension, even if it's just for localhost.

- Faker is used to create fake data to add to the database and DOM for demonstration purposes.
 
- Demonstrate modern practices with Gulp, Bower, and other tools to automate and update without having to do manual changes.
