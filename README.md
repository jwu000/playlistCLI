# playlistCLI

A command line interface tool to interact with a playlist sql database. Can create playlists, modify playlists(add songs, delete songs), view playlists, delete playlists, search up songs, get song recommendations.

Created by Peter Benoit, Rayna Levinson, Javis Wu

Step1: install node.js
Download the appropriate installer at https://nodejs.org/en/download/

Step2: Use the datebase dump and move the javascript files(index.js, config.js, and package.json) to a seperate folder

Step3: Modify the config.js file to have your DBMS host name, username, and password. Leave the database alone.

Step4: As a precaution run 
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
In mySQLworkbench with password being the password you would like. We run this as a precaution because the package used by nodejs to connect with  SQL has not been updated to use mySQL 8.0’s new authentication protocol.

Step5: In a terminal navigate to the folder with the javascript files and type npm install

Step6: Type node index.js into the terminal and the program should start

![alt text](https://raw.githubusercontent.com/jwu000/playlistCLI/master/uml%20diagram.png)
