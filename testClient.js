var http = require('http')
var async = require('async')

var hostname = "localhost"
var port = 8080

http.globalAgent.maxSockets = Infinity

var token = {}

var Role = {
    ADMIN: 'admin',
    OWNER: 'owner',
    APP: 'app',
    DJ: 'dj',
}

function getTokenForRole(role) {
    return token[role]
}

function logRequest(options, role, obj) {
    console.log("API Path: " + options.path)
    console.log("METHOD: " + options.method)
    if (role) {
        console.log("ROLE: " + role)
    } else {
        console.log("PUBLIC API")
    }
    if (obj) {
        console.log("REQUEST OBJ: " + JSON.stringify(obj, null, 4))
    }
}

function logResponse(statusCode, response) {
    if (response) {
        console.log("RESPONSE: " + JSON.stringify(response, null, 4))
    } else if (statusCode) {
        console.log("STATUS CODE: " + statusCode)
    }
}

function logMethod(methodName) {
    console.log("******************************************************")
    console.log("METHOD: " + methodName)
}

function APICall(path, obj, role, methodType, cb) {
    var options = {
        host: hostname,
        port: port,
        method: methodType,
        headers: {
            'Content-Type': 'application/json'
        },
        path: '/api' + path
    }
    if (role) {
        var token = getTokenForRole(role)
        options.headers = {
            'Authorization': token
        }
    }
    logRequest(options, role, obj);
    var req = http.request(options, function(res) {
        logResponse(res.statusCode)
        if (res.statusCode == 204 || res.statusCode == 304) {
            cb(res.statusCode);
            return;
        }
        res.on('data', function(d) {
            d = JSON.parse(d);
            if (res.statusCode >= 500) {
                cb(d);
                return;
            } else {
                cb(null, d);
                return;
            }


        });
    });

    if (obj && methodType != 'GET') {
        req.write(JSON.stringify(obj));
    }

    req.on('error', function(e) {
        console.log(e);
        cb(e);
    });

    req.end();
}

function getCall(path, role, cb) {
    var options = {
        host: hostname,
        port: port,
        path: '/api' + path,
        method: 'GET'
    }

    if (role) {
        var token = getTokenForRole(role)
        options.headers = {
            'Authorization': token
        }
    }
    logRequest(options, role, null);
    var req = http.request(options, function(res) {
        logResponse(res.statusCode)
        if (res.statusCode == 204 || res.statusCode == 304) {
            cb(res.statusCode);
            return;
        }
        res.on('data', function(d) {
            d = JSON.parse(d);
            if (res.statusCode >= 500) {
                cb(d);
                return;
            } else {
                cb(null, d);
                return;
            }
        });
    });
    req.end();
    req.on('error', function(e) {
        console.log("err:", e);
        cb(e);
    });
}

function postCall(path, obj, role, cb) {
    var options = {
        host: hostname,
        port: port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        path: '/api' + path
    }
    if (role) {
        var token = getTokenForRole(role)
        options.headers = {
            'Authorization': token
        }
    }
    logRequest(options, role, obj);
    var req = http.request(options, function(res) {
        logResponse(res.statusCode)
        if (res.statusCode == 204 || res.statusCode == 304) {
            cb(res.statusCode);
            return;
        }
        res.on('data', function(d) {
            d = JSON.parse(d);
            if (res.statusCode >= 500) {
                cb(d);
                return;
            } else {
                cb(null, d);
                return;
            }


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

function putCall(path, obj, role, cb) {
    var options = {
        host: hostname,
        port: port,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        path: '/api' + path
    }
    if (role) {
        var token = getTokenForRole(role)
        options.headers.Authorization = token
    }
    logRequest(options, role, obj);
    var req = http.request(options, function(res) {
        logResponse(res.statusCode)
        if (res.statusCode == 204  || res.statusCode == 304 ) {
            cb(res.statusCode);
            return;
        }
        res.on('data', function(d) {
            d=JSON.parse(d);
            if(res.statusCode >=500){
                cb(d);
                return;
            } else{
                cb(null, d);
                return;
            }
        });
    });
    req.write(JSON.stringify(obj));
    req.end();
    req.on('error', function(e) {
        console.log('putCall err:', e);
        cb(e);
    });
}


/*****************************************************************/
/**********************APIs Start Here****************************/
/*****************************************************************/

function getAdminToken(next) {
    logMethod("Get Admin Token")
    var adminObj = {
        username: 'tanmay',
        password: 'password',
        email: 'someEmail'
    }
    postCall('/token', adminObj, null, function(err, res) {
        if (err) {
            console.log(err)
        } else {
            token[Role.ADMIN] = res.token
                // console.log("adminToken: " + adminToken)
            next()
        }
    })
}

function registerOwner(next) {
    logMethod("Register Owner")
    var reqObj = {
        username: 'owner',
        password: 'ownerPassword',
        email: 'ownerEmail'
    }
    putCall('/owner/register', reqObj, Role.ADMIN, function(err, obj) {
        if (err && err == 304) {
            owner = reqObj;
            next()
        } else if (err) {
            console.error("err:", err)
            next(err)
        } else {
            owner = reqObj
                // console.log("Owner: " + JSON.stringify(owner, null, 4))
            next()
        }
    })
}

function getOwnerToken(next) {
    logMethod("Get Owner Token")
    postCall('/token', owner, null, function(err, res) {
        if (err) {
            console.log("err:" + err)
            next(err)
        } else {
            console.log("token obtained: " + res.token);
            token[Role.OWNER] = res.token
                // console.log("ownerToken: " + ownerToken)
            next()
        }
    })
}

function registerPub(next) {
    logMethod("Register Pub")

    var reqObj = {
        name: 'Pub',
        address: 'PubAddress',
        genre: 'genre',
        loc: [15, 12]
    }
    putCall('/pub/register', reqObj, Role.OWNER, function(err, obj) {
        if (err) {
            console.log(err)
            next(err)
        } else {
            pub = obj
                // console.log("Pub: " + JSON.stringify(obj, null, 4))
            next()
        }
    })
}

function getPubDetails(next) {
    logMethod("Get Pub Details")
    var reqObj = {
        name: 'Pub',
        address: 'PubAddress',
        genre: 'genre',
        loc: [14, 12]
    }
    getCall('/pub/' + pub._id, Role.OWNER, function(err, obj) {
        if (err) {
            console.log(err)
            next(err)
        } else {
            // console.log("Pub Details: " + JSON.stringify(obj, null, 4))
            next()
        }
    })
}

function registerDJ(next) {
    logMethod("Register DJ")
    var reqObj = {
        username: 'djName',
        password: 'djPassword',
        email: 'djEmail'
    }
    dj = reqObj
    putCall('/pub/' + pub._id + '/dj', reqObj, Role.OWNER, function(err, obj) {
        if (err) {
            if (err == 304) {
                next()
            } else {
                console.log(err)
                next(err)
            }
        } else {
            // console.log("DJ: " + JSON.stringify(obj, null, 4))
            next()
        }
    })
}

function getDJToken(next) {
    logMethod("Get DJ Token")
    postCall('/token', dj, null, function(err, res) {
        if (err) {
            console.log("err:" + err)
            next(err)
        } else {
            token[Role.DJ] = res.token
                // console.log("djToken: " + djToken)
            next()
        }
    })
}


function createPlaylist(count, next) {
    return function(next) {
        logMethod("Create Playlist")
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
        }
        putCall('/pub/' + pub._id + '/playlist', reqObj, Role.DJ, function(err, obj) {
            if (err) {
                console.log(err)
                next(err)
            } else {
                pub = obj
                    // console.log("Saving pub: ", pub)
                next()
            }
        })
    }
}

function getPlayList(next) {
    logMethod("Get Playlist")
    getCall('/pub/' + pub._id + '/playlist/' + pub.playlists[0].details, Role.DJ, function(err, obj) {
        if (err) {
            console.log(err)
            next(err)
        } else {
            // console.log("playlist:", JSON.stringify(obj, null, 4))
            if (obj.songs.length == 2 && obj.songs[0].details._id) {
                // console.log("population SUCCESS")
                playlist = obj
                next()
            } else {
                console.log("population failed")
                next("population failed")
            }
        }
    })
}

function setPlaylistActive(next) {
    logMethod("Set Playlist Active")
    postCall('/pub/' + pub._id + '/playlist/' + playlist._id + '?state=ACTIVE', null, Role.DJ, function(err, obj) {
        if (err) {
            console.log("err:" + err)
            next(err)
        } else {
            // console.log("playlist ACTIVE")
            next()
        }
    })
}

function registerUser(next) {
    logMethod("Register User")
    var reqObj = {
        username: 'appName',
        password: 'appPassword',
        email: 'appEmail',
        geoLocation: [12, 13]
    }
    userObj=reqObj
    putCall('/user/register', reqObj, null, function(err, obj) {
        if (err && err!=304) {
            console.log(err)
            next(err)
        } else {
            next()
        }
    })
}

function getUserToken(next) {
    logMethod("Get User Token")
    postCall('/token', userObj, null, function(err, res) {
        if (err) {
            console.log("err:" + err)
            next(err)
        } else {
            token[Role.APP] = res.token
                // console.log("userToken: " + djToken)
            next()
        }
    })
}

function getCurrentPlaylist(next) {
    logMethod("Get Current Playlist")
    getCall('/pub/' + pub._id + '/playlist', Role.APP, function(err, obj) {
        if (err) {
            console.log(err)
            next(err)
        } else if (obj) {
            console.log("playlist:", JSON.stringify(obj, null, 4))
            if (obj.songs.length === 2 && obj.songs[0].details._id) {
                // console.log("population SUCCESS")
                userPlaylist = obj
                song = obj.songs[0].details
                next()
            } else if (obj.songs.length === 2 && obj.songs[0].details) {
                next("population failed")
                    // userPlaylist = obj
                    // song = {
                    //     _id: obj.songs[0].details
                    // }
                    // next()
            } else {
                next("population failed")
            }

        } else {
            console.log("no playlist:")
        }
    })
}

function upvoteSong(next) {
    logMethod("Upvote Song")
    postCall('/pub/' + pub._id + '/playlist/' + playlist._id + '/song/' + song._id + '/upvote', null, Role.APP, function(err) {
        if (err) {
            console.log("err:" + err)
            next(err)
        } else {
            next()
        }
    })
}

function updateSong(updateState, updateType, next) {

    var path = '/pub/' + pub._id + '/playlist/' + playlist._id + '/song/' + song._id
    if (updateState) {
        path = path + '?state=' + updateState
    } else if (updateType) {
        path = path + '?kind=' + updateType
    } else {
        console.log("err: update without params")
        next()
    }
    postCall(path, null, Role.DJ, function(err, obj) {
        if (err) {
            console.log("err:" + err)
            next(err)
        } else {
            // console.log("song Updated: " + obj)
            next()
        }
    })
}

function updateSongType(next) {
    logMethod("Update Song Type")
    updateSong(null, 'FROZEN', next)
}

function updateSongState(next) {
    logMethod("Update Song State")
    updateSong('PLAYING', null, next)
}

function getPubListByGeoTag(next) {
    logMethod("Get PubList By Geo Tag")
    var longitude = 12.0001,
        latitude = 13.0001
    getCall('/pub?long=' + longitude + '&lat=' + latitude, Role.APP, function(err, obj) {
        if (err) {
            console.log("err:" + err)
            next(err)
        } else {
            // console.log("getPubListByGeoTag: " + obj)
            next()
        }
    })
}

function testCall(next) {
    logMethod("test")
    getCall('/test', function(err, obj) {
        if (err) {
            console.log(err)
            next(err)
        } else {
            // console.log("SUCCESS")
            next()
        }
    })
}

// testCall()
async.waterfall([
    // testCall,
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
        console.log("Waterfall completed with error: ", e)
        process.exit();
    } else {
        console.log("DONE")
    }
})