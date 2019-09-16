use music;


-- test create playlist
call createPlaylist('demo');
select * from playlist;


-- test addsong
call addSong('demo',13);
select * from songplaylist where playlistName = 'demo';


-- test removesong
call removeSong('demo',13);
select * from songplaylist where playlistName = 'demo';


-- test songnamelookup
call songNameLookup('Calabria');


-- test songIDlookup
call songIDLookup(1);


-- test albumnamelookup
call albumNameLookup('Welcome to the masquerade (fan edition)');


-- test albumIDlookup
call albumIDLookup(3);


-- test artistnamelookup
call artistNameLookup('Elle King');


-- test artistIDlookup
call artistIDLookup(5);


-- test songNames
call songNames();


-- test artistNames
call artistNames();


-- test albumNames
call albumNames();


-- test getAlbum
call getAlbum(2);


-- test delete playlist
call delete_playlist('demo');


-- test view playlist
call view_playlist('playlist1');


-- test recommend
call removesong('playlist1', 4);
call recommend(3);
-- should output 4
call addsong('playlist1', 4);
call recommend(3);

-- test playlist_runtime
call playlist_runtime('playlist1');
select runtime from playlist;
