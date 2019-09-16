drop database if exists music;
create database music;
use music;


-- each song and album belongs to one genre

drop table if exists genre;
create table genre (
	genreName		varchar(45)		primary key

);


-- central table to the project - the song

drop table if exists song;
create table song (
	title			varchar(100)		not null,
    songID			int					primary key auto_increment,
    genre			varchar(45),
    dateReleased	date,
    runtime			time,
    constraint song_fk_genre
		foreign key (genre)
        references genre (genreName)
        on delete set null
);


-- playlist to group songs

drop table if exists playlist;
create table playlist (
	playlistName		varchar(100)	primary key,
    runtime				time			default '00:00:00'
);


-- Many-to-many songs:playlist

drop table if exists songplaylist;
create table songplaylist (
	songID 			int	,
    playlistName	varchar(100),
    constraint song_fk_playlist
		foreign key (songID)
		references song (songID)
        on delete cascade,
	constraint playlist_fk
		foreign key (playlistName)
		references playlist (playlistName)
        on delete cascade,
	primary key (songID, playlistName)
);


-- Artists produce albums with songs

drop table if exists artist;
create table artist (
	artistID		int				primary key auto_increment,
    name			varchar(45)		not null,
    genre			varchar(45),
    yearBegan		int	,
    mostRecent		int	,
    constraint artist_fk_genre
		foreign key (genre)
        references genre (genreName)
        on delete set null
);


-- Albums are made by artists, and have songs

drop table if exists album;
create table album (
	albumID			int				primary key auto_increment,
    title			varchar(100)	not null,
    dateReleased	date,
    genre			varchar(45),
    runtime			time,
    constraint album_fk_genre
		foreign key (genre)
        references genre (genreName)
        on delete set null
);


-- Many-to-many-to-many artist:song:album

drop table if exists artistsongalbum;
create table artistsongalbum (
	artistID		int,
    songID			int,
    albumID			int,
    constraint artist_fk
		foreign key (artistID)
		references artist (artistID)
        on delete cascade,
    constraint song_fk
		foreign key (songID)
		references song (songID)
        on delete cascade,
    constraint album_fk
		foreign key (albumID)
		references album (albumID)
        on delete cascade,
	primary key (artistID, songID, albumID)
);


insert into genre values
('hard rock'),
('pop'),
('electronic'),
('alt rock'),
('hip hop');

insert into song values
('Anthem Of The Lonely',1,'hard rock', '2012-02-14', '00:04:22'),
('I Get Wicked',2,'hard rock','2012-04-17','00:03:33'),
('Welcome To The Masquerade',3,'hard rock','2009-10-08','00:03:42'),
('E For Extinction',4,'hard rock','2009-10-08','00:03:52'),
('Havana',5,'pop','2018-01-12','00:03:37'),
('Turf War 2.0 (5,000 Subscribers Special)',6,'electronic','2016-06-05','00:02:41'),
('Exes & Ohs',7,'pop','2015-02-13','00:03:22'),
('Whatever It Takes',8,'alt rock','2017-06-23','00:03:21'),
('Believer',9,'alt rock','2017-06-24','00:03:24'),
('Calabria',10,'electronic','2014-01-01','00:03:41'),
('Calabria',11,'electronic','2008-09-09','00:03:51'),
('Disowned',12,'electronic','2017-08-21','00:04:39'),
('In Da Club',13,'hip hop','2003-02-06','00:03:31');

insert into artist values
(1,'Nine Lashes', 'hard rock', 2009, 2018),
(2,'Thousand Foot Krutch', 'hard rock', 2003, 2017),
(3,'Camila Cabello', 'pop', 2017, 2018),
(4,'Goblins from Mars', 'electronic', 2016, 2018),
(5,'Elle King', 'pop', 2012, 2018),
(6,'Imagine Dragons', 'alt rock', 2012, 2018),
(7,'Rune RK', 'electronic', 2016, 2018),
(8,'Enur', 'electronic', 2008, 2008),
(9,'Inova', 'electronic', 2016, 2018),
(10, '50 Cent', 'hip hop', 2003, 2014),
(11, 'Young Thug', 'hip hop', 10, 10),
(12, 'Natasja', 'electronic', 10, 10);


insert into album (title,dateReleased, genre,runtime) values
('World we view','2016-12-22 ','hard rock','00:51:51'),
('The end is where we begin','1921-11-11','hard rock','01:12:11'),
('Welcome to the masquerade (fan edition)', '2001-01-01','hard rock','00:31:18'),
('Camila','1902-10-01', 'pop','00:41:55'),
('Vol. 1 (Originals)','2001-04-23', 'electronic','00:55:22'),
('Love stuff', '2004-09-14', 'pop','00:24:55'),
('Evolve','2012-06-06', 'alt rock','00:14:11'),
('Calabria (Firebeatz Remix)','2010-08-29', 'electronic','00:31:23'),
('Raggatronic', '2003-05-05','electronic','01:24:41'),
('Disowned', '2009-10-11','electronic','00:28:32'),
("Get Rich Or Die Tryin'",'1999-03-04', 'hip hop', '00:32:21');

insert into artistsongalbum values
(1,1,1),
(2,2,2),
(2,3,3),
(2,4,3),
(3,5,4),
(11,5,4),
(4,6,5),
(5,7,6),
(6,8,7),
(6,9,7),
(7,10,8),
(8,11,9),
(12,11,9),
(9,12,10),
(10,13,11);

insert into playlist values
('playlist1','00:00:00'),
('playlist2','00:00:00');


insert into songplaylist values
(1, 'playlist1'),
(3, 'playlist1'),
(10, 'playlist1'),
(6, 'playlist1');
