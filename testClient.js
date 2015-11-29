var http = require('http');
var async = require('async');

var hostname = "localhost";
var port = 8080;

http.globalAgent.maxSockets = 1;

function logRequest(options, statusCode, obj, response) {
    console.log("APIDOC Path: " + options.path);
    console.log("APIDOC METHOD: " + options.method);
    console.log("APIDOC Role: ");
    if (obj) {
        console.log("APIDOC Request Obj: " + JSON.stringify(obj, null, 4));
    }
    console.log("APIDOC StatusCode: " + statusCode);
    console.log("APIDOC Response: " + JSON.stringify(response, null, 4));
    console.log("***************************************************************************");
}

function getCall(path, token, cb) {
    var options = {
        host: hostname,
        port: port,
        path: '/api' + path,
        method: 'GET'
    };

    if (token) {
        options.headers = {
            'Authorization': token
        };
    }
    var req = http.request(options, function(res) {
        res.on('data', function(data) {
            logRequest(options, res.statusCode, null, JSON.parse(data));
            if (res.statusCode > 300) {
                if (data) {
                    cb(res.statusCode + '' + data);
                    return;
                }
                cb(res.statusCode);
                return;
            }
            if (data) {
                cb(null, JSON.parse(data));
            } else {
                cb(null);
            }
        });
    });
    req.end();
    req.on('error', function(e) {
        console.log("err:", e);
        cb(e);
    });
}

function postCall(path, obj, token, cb) {
    var options = {
        host: hostname,
        port: port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        path: '/api' + path
    }

    if (token) {
        options.headers.Authorization = token;
    }
    var req = http.request(options, function(res) {
        if (res.statusCode > 300 || res.statusCode == 204) {
            cb(res.statusCode);
            return;
        }
        res.on('data', function(d) {
            logRequest(options, res.statusCode, obj, JSON.parse(d));
            cb(null, JSON.parse(d));
            return;
        });
    });
    if (obj) {
        req.write(JSON.stringify(obj));
    }
    req.on('error', function(e) {
        console.log(e);
        cb(e);
    });
    req.end();
}

function putCall(path, obj, token, cb) {
    var options = {
        host: hostname,
        port: port,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        path: '/api' + path
    }

    if (token) {
        options.headers.Authorization = token;
    }
    var req = http.request(options, function(res) {
        if (res.statusCode > 300) {
            cb(res.statusCode);
            req.end();
            return;
        }
        res.on('data', function(d) {
            logRequest(options, res.statusCode, obj, JSON.parse(d));
            req.end();
            cb(null, JSON.parse(d));
            return;
        });
    });
    req.write(JSON.stringify(obj));
    req.end();
    req.on('error', function(e) {
        console.log('putCall err:', e);
        cb(e);
    });
}

function getAdminToken(next) {
    console.log("APIDOC Method: Get Admin Token");
    var adminObj = {
        username: 'tanmay',
        password: 'password',
        email: 'someEmail'
    }
    postCall('/token', adminObj, null, function(err, res) {
        if (err) {
            console.log(err)
        } else {
            adminToken = res.token;
            // console.log("adminToken: " + adminToken);
            next();
        }
    });
}

function registerOwner(next) {
    console.log("APIDOC Method: Register Owner");
    var reqObj = {
        username: 'owner',
        password: 'ownerPassword',
        email: 'ownerEmail'
    }
    putCall('/owner/register', reqObj, adminToken, function(err, obj) {
        if (err) {
            console.error("err:", err);
        } else {
            owner = obj;
            // console.log("Owner: " + JSON.stringify(owner, null, 4));
            next();
        }
    });
}

function getOwnerToken(next) {
    console.log("APIDOC Method: Get Owner Token");
    postCall('/token', owner, null, function(err, res) {
        if (err) {
            console.log("err:" + err)
        } else {
            ownerToken = res.token;
            // console.log("ownerToken: " + ownerToken);
            next();
        }
    });
}

function registerPub(next) {
    console.log("APIDOC Method: Register Pub");
    
    var reqObj = {
        name: 'Pub',
        address: 'PubAddress',
        genre: 'genre',
        loc: [12, 13]
    }
    putCall('/pub/register', reqObj, ownerToken, function(err, obj) {
        if (err) {
            console.log(err)
        } else {
            pub = obj;
            // console.log("Pub: " + JSON.stringify(obj, null, 4));
            next();
        }
    });
}

function getPubDetails(next) {
    console.log("APIDOC Method: Get Pub Details");
    var reqObj = {
        name: 'Pub',
        address: 'PubAddress',
        genre: 'genre',
        loc: [12, 13]
    }
    getCall('/pub/' + pub._id, ownerToken, function(err, obj) {
        if (err) {
            console.log(err)
        } else {
            // console.log("Pub Details: " + JSON.stringify(obj, null, 4));
            next();
        }
    });
}

function registerDJ(next) {
    console.log("APIDOC Method: Register DJ");
    var reqObj = {
        username: 'djName',
        password: 'djPassword',
        email: 'djEmail'
    };
    putCall('/pub/' + pub._id + '/dj', reqObj, ownerToken, function(err, obj) {
        if (err) {
            console.log(err)
        } else {
            dj = obj;
            // console.log("DJ: " + JSON.stringify(obj, null, 4));
            next();
        }
    });
}

function getDJToken(next) {
    console.log("APIDOC Method: Get DJ Token");
    postCall('/token', dj, null, function(err, res) {
        if (err) {
            console.log("err:" + err)
        } else {
            djToken = res.token;
            // console.log("djToken: " + djToken);
            next();
        }
    });
}


function createPlaylist(count, next) {
    return function(next) {
        console.log("APIDOC Method: Create Playlist");
        var reqObj = {
            name: 'Playlist' + count,
            genre: 'someGenre',
            state: 'INACTIVE',
            songs: [{
                details: {
                    song_name: 'Strings',
                    song_genre: 'String',
                    song_artist: 'String',
                    song_album: 'String',
                    song_year: 2010,
                    song_composer: 'String',
                    song_lyrics: 'String'
                }
            }, {
                details: {
                    song_name: 'String2ssssssssssssssss',
                    song_genre: 'String2',
                    song_artist: 'String2',
                    song_album: 'String2',
                    song_year: 2010,
                    song_composer: 'String2',
                    song_lyrics: 'String2'
                }
            }]
        };
        putCall('/pub/' + pub._id + '/playlist', reqObj, djToken, function(err, obj) {
            if (err) {
                console.log(err);
            } else {
                pub = obj;
                // console.log("Saving pub: ", pub);
                next();
            }
        });
    }
}

function getPlayList(next) {
    console.log("APIDOC Method: Get Playlist");
    getCall('/pub/' + pub._id + '/playlist/' + pub.playlists[0].details, djToken, function(err, obj) {
        if (err) {
            console.log(err);
        } else {
            // console.log("playlist:", JSON.stringify(obj, null, 4));
            if (obj.songs.length == 2 && obj.songs[0].details._id) {
                // console.log("population SUCCESS");
                playlist = obj;
                next();
            } else {
                console.log("population failed");
                next("population failed");
            }
        }
    });
}

function setPlaylistActive(next) {
    console.log('APIDOC Method: Set Playlist Active');
    postCall('/pub/' + pub._id + '/playlist/' + playlist._id + '?state=ACTIVE', null, djToken, function(err, obj) {
        if (err) {
            console.log("err:" + err);
        } else {
            // console.log("playlist ACTIVE");
            next();
        }
    });
}

function registerUser(next) {
    console.log('APIDOC Method: Register User');
    var reqObj = {
        username: 'appName',
        password: 'appPassword',
        email: 'appEmail',
        geoLocation: [12, 13]
    };
    putCall('/user/register', reqObj, null, function(err, obj) {
        if (err) {
            console.log(err);
        } else {
            userObj = obj;
            next();
        }
    });
}

function getUserToken(next) {
    console.log("APIDOC Method: Get User Token");
    postCall('/token', userObj, null, function(err, res) {
        if (err) {
            console.log("err:" + err)
        } else {
            userToken = res.token;
            // console.log("userToken: " + djToken);
            next();
        }
    });
}

function getCurrentPlaylist(next) {
    console.log("APIDOC Method: Get Current Playlist");
    getCall('/pub/' + pub._id + '/playlist', userToken, function(err, obj) {
        if (err) {
            console.log(err);
        } else if (obj) {
            // console.log("playlist:", JSON.stringify(obj, null, 4));
            if (obj.songs.length === 2 && obj.songs[0].details._id) {
                // console.log("population SUCCESS");
                userPlaylist = obj;
                song = obj.songs[0].details;
                next();
            } else if (obj.songs.length === 2 && obj.songs[0].details) {
                console.log("population failed");
                userPlaylist = obj;
                song = {
                    _id: obj.songs[0].details
                };
                next();
            } else {
                next("population failed");
            }

        } else {
            console.log("no playlist:");
        }
    });
}

function upvoteSong(next) {
    console.log("APIDOC Method: Upvote Song");
    postCall('/pub/' + pub._id + '/playlist/' + playlist._id + '/song/' + song._id + '/upvote', null, userToken, function(err) {
        if (err) {
            console.log("err:" + err);
            next(err);
        } else {
            next();
        }
    });
}

function updateSong(updateState, updateType, next) {

    var path = '/pub/' + pub._id + '/playlist/' + playlist._id + '/song/' + song._id;
    if (updateState) {
        path = path + '?state=' + updateState;
    } else if (updateType) {
        path = path + '?kind=' + updateType;
    } else {
        console.log("err: update without params")
        next();
    }
    postCall(path, null, djToken, function(err, obj) {
        if (err) {
            console.log("err:" + err)
        } else {
            // console.log("song Updated: " + obj);
            next();
        }
    });
}

function updateSongType(next) {
    console.log('APIDOC Method: Update Song Type');
    updateSong(null, 'FROZEN', next);
}

function updateSongState(next) {
    console.log('APIDOC Method: Update Song State');
    updateSong('PLAYING', null, next);
}

function getPubListByGeoTag(next) {
    console.log('APIDOC Method: Get PubList By Geo Tag');
    var longitude = 12.0001,
        latitude = 13.0001;
    getCall('/pub?long=' + longitude + '&lat=' + latitude, userToken, function(err, obj) {
        if (err) {
            console.log("err:" + err);
        } else {
            // console.log("getPubListByGeoTag: " + obj);
            next();
        }
    });
}

function testCall(next) {
    console.log("APIDOC Method: test");
    getCall('/test', function(err, obj) {
        if (err) {
            console.log(err)
        } else {
            // console.log("SUCCESS");
            next();
        }
    });
}

// testCall();
async.waterfall([
    getAdminToken,
    registerOwner,
    getOwnerToken,
    registerPub,
    getPubDetails,
    registerDJ,
    getDJToken,
    createPlaylist(1),
    createPlaylist(3),
    createPlaylist(2),
    getPlayList,
    setPlaylistActive,
    registerUser,
    getUserToken,
    getCurrentPlaylist,
    upvoteSong,
    updateSongType,
    updateSongState,
    getPubListByGeoTag
], function(e, result) {
    if (e) {
        console.log(e);
    } else {}
    console.log("DONE");
});