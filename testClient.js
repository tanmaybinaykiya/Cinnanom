var http = require('http');
var async = require('async');

var hostname = "localhost";
var port = 8080;

http.globalAgent.maxSockets = Infinity;

function getCall(path, cb) {
    var options = {
        host: hostname,
        port: port,
        path: '/api' + path,
        method: 'GET'
    };
    var req = http.request(options, function(res) {
        res.on('data', function(data) {
            if (res.statusCode > 300) {
                if (data) {
                    cb(res.statusCode + '' + data);
                    return;
                }
                cb(res.statusCode);
                return;
            }
            console.log("data:");
            if (data) {
                cb(null, JSON.parse(data));
            } else {
                cb(null);
            }
        });
    });
    req.end();
    req.on('error', function(e) {
        console.error("err:", e);
        cb(e);
    });
}

function postCall(path, obj, cb) {
    var options = {
        host: hostname,
        port: port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        path: '/api' + path
    }
    var req = http.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        if (res.statusCode > 300) {
            cb(res.statusCode);
            req.end();
            return;
        }
        res.on('data', function(d) {
            req.end();
            cb(null, JSON.parse(d));
            return;
        });
    });
    if (obj) {
        req.write(JSON.stringify(obj));
    }
    req.end();
    req.on('error', function(e) {
        console.error(e);
        cb(e);
    });
}

function putCall(path, obj, cb) {
    var options = {
        host: hostname,
        port: port,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        path: '/api' + path
    }
    var req = http.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        if (res.statusCode > 300) {
            cb(res.statusCode);
            req.end();
            return;
        }
        res.on('data', function(d) {
            req.end();
            cb(null, JSON.parse(d));
            return;
        });
    });
    req.write(JSON.stringify(obj));
    req.end();
    req.on('error', function(e) {
        console.error('putCall err:', e);
        cb(e);
    });
}

function getAdminToken(next) {
    console.log("get Admin token");
    var adminObj = {
        username: 'tanmay',
        password: 'password',
        email: 'someEmail'
    }
    postCall('/token', adminObj, function(err, res) {
        if (err) {
            console.log(err)
        } else {
            adminToken = res.token;
            console.log("adminToken: " + adminToken);
            next();
        }
    });
}

function registerOwner(next) {
    console.log("registerOwner");
    var reqObj = {
        username: 'owner',
        password: 'ownerPassword',
        email: 'ownerEmail'
    }
    putCall('/owner/register?access_token=' + adminToken, reqObj, function(err, obj) {
        if (err) {
            console.log("err:", err);
        } else {
            owner = obj;
            console.log("Owner: " + JSON.stringify(owner));
            next();
        }
    });
}

function getOwnerToken(next) {
    console.log("get owner token");
    postCall('/token', owner, function(err, res) {
        if (err) {
            console.log("err:" + err)
        } else {
            ownerToken = res.token;
            console.log("ownerToken: " + ownerToken);
            next();
        }
    });
}

function registerPub(next) {
    console.log("registerPub");
    var reqObj = {
        name: 'Pub',
        address: 'PubAddress',
        genre: 'genre',
        loc: [12, 13]
    }
    putCall('/pub/register?access_token=' + ownerToken, reqObj, function(err, obj) {
        if (err) {
            console.log(err)
        } else {
            pub = obj;
            console.log("Pub: " + JSON.stringify(obj));
            next();
        }
    });
}

function getPubDetails(next) {
    console.log("getPubDetails");
    var reqObj = {
        name: 'Pub',
        address: 'PubAddress',
        genre: 'genre',
        loc: [12, 13]
    }
    getCall('/pub/' + pub._id + '?access_token=' + ownerToken, function(err, obj) {
        if (err) {
            console.log(err)
        } else {
            console.log("Pub Details: " + JSON.stringify(obj));
            next();
        }
    });
}

function registerDJ(next) {
    console.log("registerDJ");
    var reqObj = {
        username: 'djName',
        password: 'djPassword',
        email: 'djEmail'
    };
    putCall('/pub/' + pub._id + '/dj?access_token=' + ownerToken, reqObj, function(err, obj) {
        if (err) {
            console.log(err)
        } else {
            dj = obj;
            console.log("DJ: " + JSON.stringify(obj));
            next();
        }
    });
}

function getDJToken(next) {
    console.log("get dj token");
    postCall('/token', dj, function(err, res) {
        if (err) {
            console.log("err:" + err)
        } else {
            djToken = res.token;
            console.log("djToken: " + djToken);
            next();
        }
    });
}

function createPlaylist(next) {
    console.log("createPlaylist");
    var reqObj = {
        name: 'Playlist1',
        genre: 'someGenre',
        state: 'INACTIVE',
        songs: [{
            details: {
                song_name: 'Stringsssssssssssssss',
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
    putCall('/pub/' + pub._id + '/playlist?access_token=' + djToken, reqObj, function(err, obj) {
        if (err) {
            console.log(err);
        } else {
            pub = obj;
            console.log("Saving pub: ", pub);
            next();
        }
    });
}

function getPlayList(next) {
    console.log("get playlist");
    getCall('/pub/' + pub._id + '/playlist/' + pub.playlists[0].details + '/?access_token=' + djToken, function(err, obj) {
        if (err) {
            console.log(err);
        } else {
            console.log("playlist:", JSON.stringify(obj));
            if (obj.songs.length == 2 && obj.songs[0].details._id) {
                console.log("population SUCCESS");
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
    console.log('setPlaylistActive');
    postCall('/pub/' + pub._id + '/playlist/' + playlist._id + '?state=ACTIVE&access_token=' + djToken, '', function(err, obj) {
        if (err) {
            console.log("err:" + err);
        } else {
            console.log("playlist ACTIVE");
            next();
        }
    });
}

function registerUser(next) {
    console.log('registerUser');
    var reqObj = {
        username: 'appName',
        password: 'appPassword',
        email: 'appEmail'
    };
    putCall('/user/register', reqObj, function(err, obj) {
        if (err) {
            console.log(err);
        } else {
            userObj = obj;
            next();
        }
    });
}

function getUserToken(next) {
    console.log("getUserToken");
    postCall('/token', userObj, function(err, res) {
        if (err) {
            console.log("err:" + err)
        } else {
            userToken = res.token;
            console.log("userToken: " + djToken);
            next();
        }
    });
}

function getCurrentPlaylist(next) {
    console.log("getCurrentPlaylist");
    getCall('/pub/' + pub._id + '/playlist?access_token=' + userToken, function(err, obj) {
        if (err) {
            console.log(err);
        } else if (obj) {
            console.log("playlist:", JSON.stringify(obj));
            userPlaylist = obj;
            song = obj.songs[0].details;
            next();
        } else {
            console.log("no playlist:");
        }
    });
}

function upvoteSong(next) {
    console.log("upvoteSong");
    postCall('/pub/' + pub._id + '/playlist/' + playlist._id + '/song/' + song._id + '/upvote&access_token=' + userToken, null, function(err, obj) {
        if (err) {
            console.log("err:" + err);
            next(err);
        } else {
            console.log("song Updated: " + obj);
            next();
        }
    });
}

function updateSong(updateState, updateType, next) {

    var path = '/pub/' + pub._id + '/playlist/' + playlist._id + '/song/' + song._id;
    if (updateState) {
        path = path + '?state=' + updateState;
    } else if (updateType) {
        path = path + '?type=' + updateType;
    } else {
        console.log("update without params")
        next();
    }
    postCall(path + '&access_token=' + userToken, null, function(err, obj) {
        if (err) {
            console.log("err:" + err)
        } else {
            console.log("song Updated: " + obj);
            next();
        }
    });
}

function updateSongType(next) {
    console.log('updateSongType');
    updateSong(null, 'FROZEN', next);
}

function updateSongState(next) {
    console.log('updateSongState');
    updateSong('PLAYING', null, next);
}

function getPubListByGeoTag(next) {}

function testCall(next) {
    console.log("test");
    getCall('/test', function(err, obj) {
        console.log("ret");
        if (err) {
            console.log(err)
        } else {
            console.log("SUCCESS");
            next();
        }
    });
}

// testCall();
async.waterfall([
    // testCall,
    getAdminToken,
    registerOwner,
    getOwnerToken,
    registerPub,
    getPubDetails,
    registerDJ,
    getDJToken,
    createPlaylist,
    getPlayList,
    setPlaylistActive,
    registerUser,
    getUserToken,
    getCurrentPlaylist,
    upvoteSong,
    updateSongType,
    updateSongState
], function(e, result) {
    if (e) {
        console.error(e);
    }
    console.log("DONE");
});