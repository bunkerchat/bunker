bunker
======

A node socket.io angular chat application.

Install [mongodb](http://www.mongodb.org/downloads)

```npm install```

```node app.js```

```node node_modules/gulp/bin/gulp.js watch```

======

Troubleshooting:

- If you see the following error on ```npm install```:
    ```
    > node node_modules/gulp/bin/gulp.js sass && node node_modules/webpack/bin/webpack.js --mode development
     
      gulp[19821]: ../src/node_contextify.cc:635 yada yada yada
    ```
    Nuke your ```package.lock``` file and try again.