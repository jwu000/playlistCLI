use music; 

DROP PROCEDURE IF EXISTS getPlaylistRuntime;
DELIMITER //
CREATE PROCEDURE getPlaylistRuntime(IN plName varchar(100))
BEGIN
SELECT runtime FROM playlist WHERE playlistName = plName;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS createPlaylist;
DELIMITER //
CREATE PROCEDURE createPlaylist(IN plName varchar(100))
BEGIN
INSERT INTO playlist VALUES(plName, '00:00:00');
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS addSong;
DELIMITER //
CREATE PROCEDURE addSong(IN plName varchar(100), songID int)
BEGIN 
INSERT INTO songplaylist VALUES (songID, plName);
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS removeSong;
DELIMITER //
CREATE procedure removeSong(IN plName varchar(100), songID int)
BEGIN
DELETE FROM songplaylist WHERE songplaylist.songID = songID AND songplaylist.playlistName = plName;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS songNameLookup;
DELIMITER //
CREATE procedure songNameLookup(IN songNm varchar(100))
BEGIN
SELECT * from song WHERE title = songNm;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS songIDLookup;
DELIMITER //
CREATE procedure songIDLookup (IN songID INT)
BEGIN 
SELECT * from song WHERE song.songID = songID;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS albumNameLookup;
DELIMITER //
CREATE procedure albumNameLookup (IN albumNm varchar(100))
BEGIN
SELECT * from album WHERE title = albumNm;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS  albumIDLookup;
DELIMITER //
CREATE procedure albumIDLookup (IN albumID INT)
BEGIN
SELECT * from album WHERE album.albumID = albumID;
END//
DELIMITER ;


DROP PROCEDURE IF EXISTS artistNameLookup;
DELIMITER //
CREATE procedure artistNameLookup (IN artistNm varchar(100))
BEGIN
SELECT * from artist WHERE name = artistNm;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS  artistIDLookup;
DELIMITER //
CREATE procedure artistIDLookup (IN artistID INT)
BEGIN
SELECT * from artist WHERE artist.artistID = artistID;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS songNames;
DELIMITER //
CREATE procedure songNames()
BEGIN
SELECT title from song;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS playlistNames;
DELIMITER //
CREATE procedure playlistNames()
BEGIN
SELECT playlistName from playlist;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS artistNames;
DELIMITER //
CREATE procedure artistNames()
BEGIN
SELECT `name` FROM artist;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS albumNames;
DELIMITER //
CREATE procedure albumNames()
BEGIN
SELECT title FROM album;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS getAlbum;
DELIMITER //
CREATE procedure getAlbum (IN songID INT)
BEGIN
SELECT title, dateReleased, genre, runtime 
FROM album
JOIN ArtistSongAlbum as asa
WHERE songID = asa.songID and album.albumID = asa.albumID;
END//
DELIMITER ;

-- deletes a playlist

drop procedure if exists delete_playlist;
delimiter $$

create procedure delete_playlist(in plname varchar(100))
begin
delete from playlist where playlistName = plname;
end$$
delimiter ;


-- lists info about the songs on a playlist

drop procedure if exists view_playlist;
delimiter $$

create procedure view_playlist(in plname varchar(100))
begin
declare rnf tinyint default false;
declare art int;
declare albm int;
declare sng int;
declare ids cursor for
	select sp.songID, artistID, albumID from songplaylist as sp join artistsongalbum as asa
		where sp.playlistName = plname && sp.songID = asa.songID;
declare continue handler for not found
	begin
	set rnf = true;     
    end;
drop table if exists result;
create table result (
	title			varchar(100)		not null,
    artist			varchar(45),
    album			varchar(100),
    genre			varchar(45),
    dateReleased	date,
    runtime			time
);

open ids;

id_loop: LOOP
	fetch ids into sng, art, albm;
    IF rnf = true THEN
		CLOSE ids;
        LEAVE id_loop;
	END IF;
	insert into result (select song.title , artist.name, album.title, song.genre, song.dateReleased, song.runtime
		from song, artist, album
		where song.songID = sng && artist.artistID = art && album.albumID = albm);
end LOOP;
select * from result;
end$$
delimiter ;


-- recommends a dong based on amount in common with inputted song

drop procedure if exists recommend;
delimiter $$

create procedure recommend(in songID int)
begin
declare common int;
declare rnf tinyint default false;
declare art int;
declare albm int;
declare sng int;
declare asa cursor for
	select * from artistsongalbum;
declare continue handler for not found
	set rnf = true;
    
set @genre = (select genre from song where song.songID = songID);
set @artist = (select artistID from artistsongalbum as r where r.songID = songID);
set @album = (select albumID from artistsongalbum as l where l.songID = songID);

drop table if exists counts;
create table counts (
	songID		int		primary key,
    count		int		not null default 0
);


insert into counts (songID, count) select distinct artistsongalbum.songID, 0 from artistsongalbum
	where artistsongalbum.songID not in(select songplaylist.songID from songplaylist);



open asa;
while rnf = false do
	fetch asa into art, sng, albm;
    set @g = (select genre from song where song.songID = sng);
	if @g = @genre then
		update counts set count = count +1
        where counts.songID = sng;
	end if;
	if art = @artist then
		update counts set count = count +1
        where counts.songID = sng;
	end if;
	if albm = @album then
		update counts set count = count +1
        where counts.songID = sng;
	end if;
end while;
close asa;

set @result = (select counts.songID from counts
	group by counts.songID, count having count = (select max(count) from counts));


select * from song where song.songID = @result limit 1;

end$$
delimiter ;


-- sums the runtime of all songs on that playlist

drop procedure if exists playlist_runtime;
delimiter $$

create procedure playlist_runtime(in pl varchar(100))
begin
declare rnf tinyint default false;
declare run int;
declare sngs cursor for
	select time_to_sec(runtime) as secs from song join songplaylist as sp 
    where song.songID = sp.songID and sp.playlistName = pl;
declare continue handler for not found
	set rnf = true;
    
set @total = 0;
open sngs;
time_loop: LOOP
	fetch sngs into run;
    if rnf = true THEN
				CLOSE sngs;
		LEAVE time_loop;
	END IF;
    set @total = @total + run;
end LOOP;
update playlist set runtime = sec_to_time(@total) where playlist.playlistName = pl;

end $$
delimiter ;


-- updates the playlist runtime on any change to an artistsongalbum of that album

drop trigger if exists insert_playlist_runtime;
delimiter $
create trigger insert_playlist_runtime after insert
	on songplaylist for each row
    begin
    set @pl = new.playlistName;
    call playlist_runtime(@pl);
	end $$
delimiter ;

drop trigger if exists update_playlist_runtime;
delimiter $$
create trigger update_playlist_runtime after update
	on songplaylist for each row
    begin
    set @npl = new.playlistName;
    set @opl = old.playlistName;
    call playlist_runtime(@npl);
    call playlist_runtime(@opl);
    end $$
delimiter ;

drop trigger if exists delete_playlist_runtime;
delimiter $$

create trigger delete_playlist_runtime after delete
	on songplaylist for each row
    begin
    set @pl = old.playlistName;
    call playlist_runtime(@pl);
    end $$
delimiter ;






