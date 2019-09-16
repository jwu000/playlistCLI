const commander = require('commander');
const inquirer = require('inquirer');
const mysql = require('mysql');
const config = require('./config.js');
var names = [];
var playlistNames = [];
var songNames = [];
var albumNames = [];
var artistNames = [];


const con = mysql.createConnection(config);

con.connect(function(err) {
	if (err) throw err;
	setupValidation();
	
});

function setupValidation() {
	con.query('call playlistNames()', function (err,result,field) {
		if (err) throw err;
		for (var counter = 0; counter < result[0].length;  counter++){
			playlistNames.push(result[0][counter].playlistName.toUpperCase());
		};

	});
	con.query('call songNames()', function (err,result,field) {
		if (err) throw err;
		for (var counter = 0; counter < result[0].length;  counter++){
			songNames.push(result[0][counter].title.toUpperCase());
		};
	});
	con.query('call albumNames()', function (err,result,field) {
		if (err) throw err;
		for (var counter = 0; counter < result[0].length;  counter++){
			albumNames.push(result[0][counter].title.toUpperCase());
		};
	});
	con.query('call artistNames()', function (err,result,field) {
		if (err) throw err;
		for (var counter = 0; counter < result[0].length;  counter++){
			artistNames.push(result[0][counter].name.toUpperCase());
		};
	});
	menu();
};

function menu() {
	inquirer
	.prompt([
	{
		type:'list',
		name: 'toDo',
		message: 'What would you like to?',
		choices: ['View Playlist','Create Playlist','Delete Playlist', 'Modify Playlist',
		'Lookup Song Info','Lookup Album Info', 'Lookup Artist Info', 'Get Recommendation','QUIT'],
		pageSize: 10

	},
	{
		type:'input',
		name: 'playlistToLookup',
		message: 'Please enter the existing playlist name: ',
		when: function(answers) {
			return answers.toDo == 'View Playlist';
		},
		filter: function(val) {
        	return val.toUpperCase();
      	},
      	validate: function(val) {
      		if (playlistNames.includes(val)) {
      			return true;
      		}
      		else return 'Playlist does not exist. Try again. Here are the playlists created: ' 
      			+ playlistNames;
      	}
	},
	{
		type:'input',
		name: 'newPlaylistName',
		message: 'Please enter the name of the new playlist: ',
		when: function(answers) {
			return answers.toDo == 'Create Playlist';
		},
		filter: function(val) {
        	return val.toUpperCase();
      	},
      	validate: function(val) {
      		if (playlistNames.includes(val)) {
      			return 'Playlist with this name already exists. Please enter another name.'
      		}
      		else 
      			return true;
      	}
	},
	{
		type:'input',
		name: 'playlistNameToDelete',
		message: 'Please enter the name of the playlist to delete: ',
		when: function(answers) {
			return answers.toDo == 'Delete Playlist';
		},
		filter: function(val) {
        	return val.toUpperCase();
      	},
      	validate: function(val) {
      		if (playlistNames.includes(val)) {
      			return true;
      		}
      		else 
      			return val + ' does not exists so cannot delete. Please enter a existing playlist: '
      		+ playlistNames;
      	}
	},
	{
		type:'input',
		name: 'playlistToModify',
		message: 'Please enter the name of the playlist to modify: ',
		when: function(answers) {
			return answers.toDo == 'Modify Playlist';
		},
		filter: function(val) {
        	return val.toUpperCase();
      	},
      	validate: function(val) {
      		if (playlistNames.includes(val)) {
      			return true;
      		}
      		else
      			return val + ' does not exists. Please enter an existing playlist to modify: '
      		+ playlistNames;
      	}
	},
	{
		type: 'list',
		name: 'whatToDoPlaylist',
		choices: ['Add Song','Delete Song'],
		message: function(answers) {
				return 'What do you want to do to the playlist ' + answers.playlistToModify
			},
		when: function(answers) {
			return answers.playlistToModify;
		},
	},
	{
		type: 'input',
		name: 'songToDelete',
		message: 'Enter name of song to delete: ',
		when: function(answers) {
			return false;
			//return answers.whatToDoPlaylist == 'Delete Song';
		},
		filter: function(val) {
        	return val.toUpperCase();
      	},
		validate: async function(val, answers) {
			function theQuery() {
				return new Promise(function(resolve) {
					con.query("call view_playlist( '"+ answers.playlistToModify+"')", function (err, result, field) {
						if (err) throw err;
						else {
							const playlistSongs =[];
							for (var counter = 0; counter < result[0].length;  counter++){
								const song = result[0][counter];
								playlistSongs.push(song.title.toUpperCase());
							};
							console.log(playlistSongs);
							if (result[0].length == 0) {
								resolve('no song')
								//return 'NO SONGS IN ' + answers.playlistToModify + '. Please press enter';
							}
							if (playlistSongs.includes(val)) {
								resolve(true);
								//return true;
							}
							else {
								resolve('nowork');
								//return "no work";
								//return "Selected song not in " + answers.playlistToModify 
								//+ ". Please enter these songs: " + playlistSongs;
							}
						}
					});
				});
			}
			await theQuery().then(function(result) {
				return result;
			});
		}
	},
	{
		type: 'input',
		name: 'songToAddOrDeleteOrLookupOrMakeRec',
		message: 'Enter the name of the song: ',
		when: function(answers) {
			return answers.whatToDoPlaylist /*== "Add Song" */|| answers.toDo == 'Lookup Song Info' 
			|| answers.toDo == 'Get Recommendation';
		},
		filter: function(val) {
        	return val.toUpperCase();
      	},
      	validate: function(val) {
      		if (songNames.includes(val)) {
      			return true;
      		}
      		else 
      			return val + ' is not a song. Please enter a existing song such as: ' + songNames;
      	}
	},
	{
		type: 'input',
		name: 'albumToLookup',
		message: 'Enter the name of album to lookup: ',
		when: function(answers) {
			return answers.toDo == 'Lookup Album Info';
		},
		filter: function(val) {
        	return val.toUpperCase();
      	},
      	validate: function(val) {
      		if (albumNames.includes(val)) {
      			return true;
      		}
      		else
      			return val + ' is not an album. Please enter an existing album such as: ' + albumNames;
      	}
	},
	{
		type: 'input',
		name: 'artistToLookup',
		message: 'Enter the name of artist to lookup: ',
		when: function(answers) {
			return answers.toDo == 'Lookup Artist Info';
		},
		filter: function(val) {
        	return val.toUpperCase();
      	},
      	validate: function(val) {
      		if (artistNames.includes(val)) {
      			return true;
      		}
      		else
      			return val + ' is not an artist. Please enter an existing artist such as: ' + artistNames;
      	}
	}
	])
	.then(answers => {
		if (answers.toDo == 'QUIT') {
			process.exit();
		}
		else if (answers.toDo == 'View Playlist') {
			viewPlaylist(answers.playlistToLookup);
		}
		else if (answers.toDo == 'Create Playlist') {
			createPlaylist(answers.newPlaylistName);
		}
		else if (answers.toDo == 'Delete Playlist') {
			deletePlaylist(answers.playlistNameToDelete);
		}
		else if (answers.toDo == 'Modify Playlist' && answers.whatToDoPlaylist == 'Add Song'){
			addSongToPlaylist(answers.playlistToModify, answers.songToAddOrDeleteOrLookupOrMakeRec);
		}
		else if (answers.toDo == 'Modify Playlist' && answers.whatToDoPlaylist == 'Delete Song') {
			removeSongFromPlaylist(answers.playlistToModify, answers.songToAddOrDeleteOrLookupOrMakeRec);
		}
		else if (answers.toDo == 'Lookup Song Info') {
			songNameLookup(answers.songToAddOrDeleteOrLookupOrMakeRec);
		}
		else if (answers.toDo == 'Lookup Album Info') {
			albumLookup(answers.albumToLookup);
		}
		else if (answers.toDo == 'Lookup Artist Info') {
			artistLookup(answers.artistToLookup);
		}
		else if (answers.toDo == 'Get Recommendation') {
			recommendSong(answers.songToAddOrDeleteOrLookupOrMakeRec);
		}
		//menu();
	});
}

function viewPlaylist(playlistName) {
	con.query("call getPlaylistRuntime( '"+ playlistName+"')", function(err,result,field) {
		if (err) throw err;
		else {
			console.log("SONGS IN " + playlistName + " RUNTIME: " + result[0][0].runtime);
		}
	});
	con.query("call view_playlist( '"+ playlistName+"')", function (err, result, field) {
		if (err) throw err;
		else {
			for (var counter = 0; counter < result[0].length;  counter++){
				const song = result[0][counter];
				console.log(song.title + ' by ' + song.artist + ' ' + song.runtime);
			};
			if (result[0].length == 0) {
				console.log('NO SONGS IN ' + playlistName);
			}
		}
		menu();
	});
};

function createPlaylist(newPlaylistName) {
	con.query("call createPlaylist( '"+ newPlaylistName + "')", function (err, result, field) {
		if (err) throw err;
		else {
			playlistNames.push(newPlaylistName);
			console.log('Playlist named ' + newPlaylistName + ' created.');
			menu();
		}
	});
};

function deletePlaylist(playlistToDelete) {
	con.query("call delete_playlist( '" + playlistToDelete + "')", function (err, result, field) {
		if (err) throw err;
		else {
			playlistNames = [];
			con.query('call playlistNames()', function (err,result,field) {
				if (err) throw err;
				for (var counter = 0; counter < result[0].length;  counter++){
					playlistNames.push(result[0][counter].playlistName.toUpperCase());
				};

			});
			console.log('Playlist named ' + playlistToDelete + ' deleted.');
			menu();
		}
	});
};

function addSongToPlaylist(playlist, songName) {
	con.query("call songNameLookup('" + songName + "')", function (err, result, field) {
		if (err) throw err;
		else {
			if (result[0].length == 1) {
				addSongHelper(playlist, result[0][0].songID, songName);
			}
			else {
				//console.log(result);
				const multipleSongs = {};
				for (var counter = 0; counter < result[0].length;  counter++){
					const song = result[0][counter];
					multipleSongs[song.title+ "(" + song.genre + ")" + " released " + song.dateReleased] = song.songID;
				};
				//console.log(multipleSongs);
				//console.log(Object.keys(multipleSongs));
				inquirer.prompt([
				{
					type: 'list',
					name: 'songChoice',
					message: 'There are multiple songs with this name. Please select one.',
					choices: Object.keys(multipleSongs),
					pageSize: 10
				}
				])
				.then(answers => {
					addSongHelper(playlist, multipleSongs[answers.songChoice], songName);
				});
			}
		}
	});
}

function addSongHelper(playlist, songId, songName){
	con.query("call addSong('" + playlist + "'," + songId + ")", function (err, result, field) {
		if (err) throw err;
		else {
			console.log('Added ' + songName + ' to ' + playlist);
			menu();
		}
	});
}

function removeSongFromPlaylist(playlist,songName) {
	con.query("call view_playlist( '"+ playlist+"')", function (err, result, field) {
		if (err) throw err;
		else {
			const playlistSongs =[];
			const songId = {};
			for (var counter = 0; counter < result[0].length;  counter++){
				const song = result[0][counter];
				playlistSongs.push(song.title.toUpperCase());
			};
			if (result[0].length == 0) {
				console.log(playlist + ' has no songs so cannot remove any songs.');
				menu();
			}
			else if (playlistSongs.includes(songName)) {
				con.query("call songNameLookup('" + songName + "')", function (err, result, field) {
				if (err) throw err;
				else {
				if (result[0].length == 1) {
					removeSongHelper(playlist, result[0][0].songID, songName);
				}
				else {
					//console.log(result);
					const multipleSongs = {};
					for (var counter = 0; counter < result[0].length;  counter++){
						const song = result[0][counter];
						multipleSongs[song.title+ "(" + song.genre + ")" + " released " + song.dateReleased] = song.songID;
					};
					//console.log(multipleSongs);
					//console.log(Object.keys(multipleSongs));
					inquirer.prompt([
					{
						type: 'list',
						name: 'songChoice',
						message: 'There are multiple songs with this name. Please select one.',
						choices: Object.keys(multipleSongs),
						pageSize: 10
					}
					])
					.then(answers => {
						removeSongHelper(playlist, multipleSongs[answers.songChoice], songName);
						});
					}
				}
			});
			}
			else {
				console.log(songName + ' is not in ' + playlist + ' so cannot remove.');
				menu();
			}
		}
	});
}

function removeSongHelper(playlist, songId, songName){
	con.query("call removeSong('" + playlist + "'," + songId + ")", function (err, result, field) {
		if (err) throw err;
		else {
			if (result.affectedRows == 0) {
				console.log(songName + " is not in " + playlist);
			}
			else{
				console.log('Removed ' + songName + ' from ' + playlist);
			}
			menu();
		}
	});
}

function songNameLookup(songName){
	con.query("call songNameLookup('" + songName + "')", function (err, result, field) {
		if (err) throw err;
		else {
			for (var counter = 0; counter < result[0].length;  counter++){
				const song = result[0][counter];
				console.log(song.title + "(" + song.genre + ") relased on " + 
					song.dateReleased + " with runtime of " + song.runtime);
			};
			menu();
		}
	});
}

function albumLookup(albumName){
	con.query("call albumNameLookup('" + albumName + "')", function (err, result, field) {
		if (err) throw err;
		else {
			for (var counter = 0; counter < result[0].length;  counter++){
				const album = result[0][counter];
				console.log(album.title + "(" + album.genre + ") released on " + 
					album.dateReleased + " with runtime of " + album.runtime);
			};
			menu();
		}
	});
}

function artistLookup(artistName) {
	con.query("call artistNameLookup('" + artistName + "')", function (err, result, field) {
		if (err) throw err;
		else {
			for (var counter = 0; counter < result[0].length;  counter++){
				const artist = result[0][counter];
				console.log(artist.name + ' began playing ' + artist.genre + ' music in '
					+ artist.yearBegan + ' and last released music in ' + artist.mostRecent);
			};
			menu();
		}
	});
}

function recommendSong(songName) {
	con.query("call songNameLookup('" + songName + "')", function (err, result, field) {
		if (err) throw err;
		else {
			if (result[0].length == 1) {
				recommendHelper(result[0][0].songID, songName);
			}
			else {
				//console.log(result);
				const multipleSongs = {};
				for (var counter = 0; counter < result[0].length;  counter++){
					const song = result[0][counter];
					multipleSongs[song.title+ "(" + song.genre + ")" + " released " + song.dateReleased] = song.songID;
				};
				//console.log(multipleSongs);
				//console.log(Object.keys(multipleSongs));
				inquirer.prompt([
				{
					type: 'list',
					name: 'songChoice',
					message: 'There are multiple songs with this name. Please select one.',
					choices: Object.keys(multipleSongs),
					pageSize: 10
				}
				])
				.then(answers => {
					recommendHelper(multipleSongs[answers.songChoice], songName);
				});
			}
		}
	});
}

function recommendHelper(songId, songName) {
	con.query("call recommend(" + songId + ")", function (err, result, field) {
		if (err) throw err;
		else { 
			const song = result[0][0];
			console.log("SONG REC BASED ON " + songName);
			console.log(song.title);
			menu();
		}

	});
}