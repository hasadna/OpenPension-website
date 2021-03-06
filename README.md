OpenPension-website
==================

OpenPension Website is the Web interface for the OpenPension Project  
aimed at revealing the secrets behind the pension market.


Our stack
=========
[NodeJS] [1]  
[ExpressJS] [2]  
[Marionette] [3]  
[Handlebars] [4]  
[Squel] [5]  
[PostgreSQL] [6]  
[Memcached] [7]   
[Elastic]  [11]   

Also used
===============  
[Tabletop] [8]

Getting Started
===============
1.  Clone the repo

        >git clone ...
        >git checkout marionette
2.  Update submodules               
        
        >git submodule init 
        >git submodule update
3.  Install [NodeJS] [1]
4.  Install packages
        
        >npm install
        >npm install bower -g
        >bower install
        >npm install grunt -g
        >grunt
5.  Update db connection string in server/config.json (ask somebody if you dont have it) 

6.  Run the server (default port is 3000)

        >node server/app.js 

7.  To run the server in dev mode:

	Install node-dev (globally)

        >npm install node-dev -g
    Run the server

        >node-dev server/app.js

  [1]: http://nodejs.org/        "NodeJS"
  [2]: http://expressjs.com/  "ExpressJS"
  [3]: http://marionettejs.com/    "Marionette"
  [4]: http://handlebarsjs.com/ "Handlebars"
  [5]: https://hiddentao.github.io/squel/ "Squel"
  [6]: http://www.postgresql.org/download/ "PostgreSQL"
  [7]: http://memcached.org/ "Memcached"
  [8]: https://github.com/jsoma/tabletop "Tabletop"
  [11]: https://www.elastic.co/products/elasticsearch "Elastic"

Additional Requirements
===========

For compiling the packages on windows  
you might need to install Microsoft Visual Studio  
You can get the Express version which is free to download [here] [9]


  [9]: http://www.microsoft.com/visualstudio/eng/downloads#d-cpp-2010-express "VS Express"

Online version
===========
Visit: [http://www.openpension.org.il] [10]

  [10]: http://www.openpension.org.il
