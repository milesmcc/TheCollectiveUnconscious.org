window.onload = start();


var thisSession = 0;
var g_sessions = 0;
var g_totaltime = 0;
var g_personaltime = 0;
var g_id = getIdFromCookie();

window.setInterval(function(){
  loop();
}, 5000);

window.setInterval(function(){
  g_totaltime += g_sessions;
  g_personaltime += 1;
  thisSession += 1;
  totalParsed = parseTime(g_totaltime);
  personalParsed = parseTime(g_personaltime);
  sessionParsed = parseTime(thisSession);
  updatePage(totalParsed, personalParsed, "undefined", sessionParsed, "undefined");
}, 1000);

function start(){
  if(!document.cookie.includes("id=")){
    setTimeout(
    function() {
      $("#why").modal();
      $("#welcome").show();
    }, 3000);
    console.log("new")
  }else{
    console.log("not new")
  }
  onLoading();
}

function nextMilestone(time){
  if(time < 60){
    return "1 minute";
  }
  if(time < 3600){
    return "1 hour";
  }
  if(time < 86400){
    return "1 day";
  }
  if(time < 604800){
    return "1 week";
  }
  if(time < 2419200){
    return "1 month";
  }
  if(time < 29030400){
    return "1 year";
  }
  if(time < 87091200){
    return "3 years";
  }
  return "to infinity and beyond";
}

function pingServer(id, time){
  console.log("Pinging servers with id " + id + " and time " + time);
  $.ajax({

    url: 'http://teamtock.com:12024/id=' + id + ';time=' + time,
    type: "GET",
    dataType: "text",
    async:true,
    success: function (msg) {
      console.log("Successfully got response from servers: " + msg);
      processResponseFromServers(msg);
    },
    error: function(xhr, status, error) {
      console.log("Error'd: " + error);
      alert("An error occured while trying to contact the Collective Unconscious servers. \n\n " + error)
    }
  });
}

function processResponseFromServers(response){
  split = response.split(";");
  var id = "unknownId";
  var online = "unknownOnline";
  var totalTime = "unknownTotal";
  var personalTime = "unknownPersonal";
  var error = "unknownError";
  for (var i = 0; i < split.length; i++) {
    parts = split[i].split("=");
    if(parts[0] == "id"){
      id = parts[1];
    }
    if(parts[0] == "sessions"){
      online = parseInt(parts[1]);
    }
    if(parts[0] == "total"){
      totalTime = parseInt(parts[1]);
    }
    if(parts[0] == "personal"){
      personalTime = parseInt(parts[1]);
    }
    if(parts[0] == "error"){
      error = parts[1];
    }
  }
  g_sessions = online;
  g_totaltime = totalTime;
  g_personaltime = personalTime;
  if(g_id === id){
    console.log("g_id (" + g_id+") is id (" + id + ")");
  }else{
    console.log("Got new id " + id + ", pushing to cookie...")
    g_id = id;
    pushIdToCookie(id);
  }
  if(error != "OK"){
    alert("Error: " + error);
  }else{
    updatePage(parseTime(totalTime), parseTime(personalTime), online, parseTime(thisSession), nextMilestone(totalTime));
  }
}

//Not the most efficient way to do this, but oh well.
function parseTime(time){
  var days = 0;
  var hours = 0;
  var minutes = 0;
  var seconds = 0;
  while(time > 86400){
    days += 1;
    time -= 86400;
  }
  while(time > 3600){
    hours += 1;
    time -= 3600;
  }
  while(time > 60){
    minutes += 1;
    time -= 60;
  }
  seconds = time;
  var out = "";
  var push = false;
  if(days > 0){
    out += days + ":"
    push = true;
  }
  out += hours + ":"
  out += minutes + ":"
  out += seconds + ""
  return out;
}

function loop(){
  pingServer(g_id, 5); // because AJAX is async, this will call processResponseFromServers when server responds
}

function onLoading(){
  pingServer(g_id, 0); // because AJAX is async, this will call processResponseFromServers when server responds
}


function pushIdToCookie(id){
  Cookies.set('id', id, { expires: 7300 });
}

function getIdFromCookie(){
  if (document.cookie.includes('id=')){
    return Cookies.get('id');
  } else {
    return "none";
  }
}

function updatePage(totalTime, personalTime, online, thisSession, nextMilestone){
  console.log(totalTime + ";" + personalTime + ";" + online + ";" + thisSession + ";" + nextMilestone)
  if(totalTime !== "undefined"){
    jQuery("#total-value").html(totalTime);
  }
  if(personalTime !== "undefined"){
    jQuery("#personal-value").html(personalTime);
  }
  if(thisSession !== "undefined"){
    jQuery("#thisSession").html(thisSession);
  }
  if(online !== "undefined"){
    if($("#sessions").text() != online + ""){
      $("#sessions").fadeOut();
      $("#sessions").text(online);
      $("#sessions").fadeIn();
    }
  }
  if(nextMilestone !== "undefined"){
    if($("#nextMilestone").text() != nextMilestone){
      $("#nextMilestone").fadeOut();
      $("#nextMilestone").text(nextMilestone);
      $("#nextMilestone").fadeIn();
    }
  }
  console.log("Updated page.");
}
