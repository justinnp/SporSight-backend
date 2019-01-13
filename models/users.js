var Connection = require("tedious").Connection;
var Request = require("tedious").Request;

var http = require("http");
var fs = require("fs");
var request = require("request");
//
// var dbObj = [];
//
// create connection to database
var sqlConfig = {
  userName: "sporsight@sporsightserver",
  password: "Blueteam!",
  server: "sporsightserver.database.windows.net",
  options: {
    database: "sporsightdb",
    encrypt: true
  }
};

var connection = new Connection(sqlConfig);

module.exports.createCoachTables = function(
  coachID,
  coachFirst,
  coachLast,
  coachEmail,
  schoolID,
  teamID
) {
  console.log("Checking if user is saved in the database..\n");
  var schoolName = null;
  var schoolLocation = null;
  var teamName = null;

  if (schoolID == 1) {
    schoolName = "University of Central Florida";
    schoolLocation = "Orlando, Florida";
  } else {
    console.log("invalid school");
  }

  if (teamID == 1) {
    teamName = "UCF Mens Soccer";
  } else if (teamID == 2) {
    teamName = "UCF Womens Soccer";
  }

  request = new Request(
    "IF NOT EXISTS (SELECT schoolID FROM School WHERE schoolID = '" +
      schoolID +
      "') \
      insert into School (schoolID, schoolName, schoolLocation)\
        values ('" +
      schoolID +
      "', '" +
      schoolName +
      "', '" +
      schoolLocation +
      "')",
    function(err, rowCount, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log("School saved");
        request = new Request(
          "IF NOT EXISTS (SELECT teamID FROM Team WHERE teamID = '" +
            teamID +
            "') \
                insert into Team (coachID, schoolID, schoolName, teamID, teamName)\
                  values ('" +
            coachID +
            "', '" +
            schoolID +
            "', '" +
            schoolName +
            "', '" +
            teamID +
            "', '" +
            teamName +
            "')",
          function(err, rowCount, rows) {
            if (err) {
              console.log(err);
            } else {
              console.log("Team saved");
              request = new Request(
                "IF NOT EXISTS (SELECT coachID FROM Coach WHERE coachID = '" +
                  coachID +
                  "') \
                          insert into Coach (coachID, coachFirst, coachLast, coachEmail, coachIsPaid, schoolID, teamID)\
                            values ('" +
                  coachID +
                  "', '" +
                  coachFirst +
                  "', '" +
                  coachLast +
                  "', '" +
                  coachEmail +
                  "', '" +
                  0 +
                  "', '" +
                  schoolID +
                  "', '" +
                  teamID +
                  "')",
                function(err, rowCount, rows) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("Coach saved");
                  }
                }
              );
              connection.execSql(request);
            }
          }
        );
        connection.execSql(request);
      }
    }
  );
  connection.execSql(request);
};
/*
module.exports.createPlayer = function(
  playerID,
  playerFirst,
  playerLast,
  playerEmail,
  playerPosition,
  teamID
) {
  console.log("Checking if user is saved in the database..\n");
  var teamName = null;

  request = new Request(
    "IF NOT EXISTS (SELECT playerID FROM Player WHERE playerID = '" +
      playerID +
      "') \
      insert into Player (playerID, playerFirst, playerLast, playerEmail, playerPosition, teamID)\
        values ('" +
      playerID +
      "', '" +
      playeFirst +
      "', '" +
      playeLast +
      "', '" +
      playerEmail +
      "', '" +
      playerPosition +
      "', '" +
      teamID +
      "')",
    function(err, rowCount, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log("Player saved");
      }
    }
  );
  connection.execSql(request);
};
*/

module.exports.updateCoachIsPaid = function(oid) {
  console.log("Updating the coach to paid membership\n");

  request = new Request(
    "UPDATE Coach SET coachIsPaid = '" +
      1 +
      "'\
    WHERE coachID = '" +
      oid +
      "'",
    function(err, rowCount, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log("Updated Coach subscription\n");
      }
    }
  );
  connection.execSql(request);
};

// module.exports.createSchool = function(schoolID) {
//   var schoolName = null;
//   var schoolLocation = null;
//
//   if(schoolID == 1) {
//     schoolName = "University of Central Florida";
//     schoolLocation = "Orlando, Florida"
//   } else {
//     console.log("invalid school");
//   }
//
//   request = new Request(
//     "IF NOT EXISTS (SELECT schoolID FROM School WHERE schoolID = '"+schoolID+"') \
//       insert into School (schoolID, schoolName, schoolLocation)\
//         values ('"+schoolID+"', '"+schoolName+"', '"+schoolLocation+"')",
//         function(err, rowCount, rows) {
//           if (err) {
//             console.log(err)
//           } else {
//             console.log('School Saved')
//           }
//         }
//       )
//       connection.execSql(request);
// }

// module.exports.createCoach = function(coachID, coachFirst, coachLast, coachEmail, schoolID, teamID) {
//   request = new Request(
//     "IF NOT EXISTS (SELECT coachID FROM Coach WHERE coachID = '"+coachID+"') \
//       insert into Coach (coachID, coachFirst, coachLast, coachEmail, coachIsPaid, schoolID, teamID)\
//         values ('"+coachID+"', '"+coachFirst+"', '"+coachLast+"', '"+coachEmail+"', '"+0+"', '"+schoolID+"', '"+teamID+"')",
//         function(err, rowCount, rows) {
//           if (err) {
//             console.log(err)
//           } else {
//             console.log('Coach Saved')
//           }
//         }
//       )
//       connection.execSql(request);
// }
//
// module.exports.createTeam = function(teamID, coachID, schoolID) {
//   request = new Request(
//     "IF NOT EXISTS (SELECT teamID FROM Team WHERE teamID = '"+teamID+"') \
//       insert into Team (teamID, teamName, schoolName, coachID, schoolID)\
//         values ('"+teamID+"', '"+teamName+"', '"+schoolName+"', '"+coachID+"', '"+schoolID+"')",
//         function(err, rowCount, rows) {
//           if (err) {
//             console.log(err)
//           } else {
//             console.log('Team Saved')
//           }
//         }
//       )
//       connection.execSql(request);
// }

// module.exports.createCoachFromService = function(coachID, coachFirst, coachLast, coachEmail, schoolID, teamID) {
//   var userData = {
//     'coachID': coachID,
//     'coachFirst': coachFirst,
//     'coachLast': coachLast,
//     'coachEmail': coachEmail,
//     'coachIsPaid': true,
//     'schoolID': schoolID,
//     'teamID': teamID
//   }
//
//   request({
//       url: "http://sporsight-mobile.azurewebsites.net/Coaches/Create",
//       method: "POST",
//       json: true,
//       body: userData
//   }, function (error, response, body){
//       console.log(response);
//   });
//
//   module.exports.updateCoachIsPaid = function(coachID, coachIsPaid) {
//     request = new Request (
//       "UPDATE Coach SET coachIsPaid = '"+coachIsPaid+"' \
//       WHERE coachID = '"+oid+"'",
//       function(err, rowCount, rows) {
//         if (err) {
//           console.log(err)
//         } else {
//           console.log('updated coach payment');
//         }
//       }
//     )
//   }

// var userData = JSON.stringify(data);
//
// var options = {
//   host: 'http://sporsight-mobile.azurewebsites.net/',
//   port: '80',
//   path: 'Coaches/Create',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json; charset=utf-8',
//     'Content-Length': userData.length
//   }
// }
//
// var req = http.request(options, function(res) {
//   var msg = '';
//
//   res.setEncoding('utf8');
//   res.on('data', function(chunk) {
//     msg += chunk;
//   });
//   res.on('end', function() {
//     console.log(JSON.parse(msg));
//   });
// });
//
// req.write(userData);
// req.end();
// }

// module.exports.savePlayer = function(oid, givenName, familyName, email, schoolName) {
//   console.log('Checking if user is saved in the database..\n\n');
//   request = new Request(
//     "IF NOT EXISTS (SELECT playerID FROM Player WHERE playerID = '"+oid+"') \
//       insert into Player (playerID, playerFirst, playerLast, playerEmail, schoolName)\
//         values ('"+oid+"', '"+givenName+"', '"+familyName+"', '"+email+"', '"+schoolName+"')",
//         function(err, rowCount, rows) {
//           if (err) {
//             console.log(err)
//           } else {
//             console.log('Player Saved\n\n')
//           }
//         }
//       )
//       connection.execSql(request);
// }
//
//
