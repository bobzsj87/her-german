var globalLang = "en-US";
var ttsExtension = "fnolakpojfhnmkkmmofbicmehjodjekf";
var recognized = [];
var flow;
var currentFlow = 0;

function showMessage(msg){
  $(".message").html(msg);
}

function showResponse(msg){
  $(".response").html(msg);
}



//cross extension
function ttsSay(toSay, lang, cb){
  showMessage(toSay);
  chrome.runtime.sendMessage(ttsExtension, {toSay:toSay, lang:lang},
    function(response) {
      cb(response);
    });
  
}



var recognition = new webkitSpeechRecognition();
recognition.lang = globalLang;
//recognition.continuous = true;

recognition.onstart = function() {
  console.log("start recognition");
};

recognition.onerror = function(event) {
  console.error(event.error);
};

recognition.onend = function() {
  showResponse(recognized[recognized.length-1]);
  triggerNext();
};

recognition.onresult = function(event) {
  var last = event.results.length - 1;
  recognized.push(event.results[last][0].transcript);
};


function triggerFlow(currentFlow){
  if (currentFlow >= flow.length) {
    //alert("end of the story");
    return;
  }
  var f = flow[currentFlow];

  if (f.type == "say"){
    ttsSay(f.content, globalLang, function(response){
      triggerNext();
    });
  }
  else if (f.type == "response"){
    recognition.start();
  }
}

function triggerNext(){
  triggerFlow(++currentFlow);
}

$(document).ready(function(){
  $.getJSON("test1.json", function(data){
    flow = data.flow;
    if (data.lang) globalLang = data.lang;

    
    triggerFlow(currentFlow);

  }).fail(function() {
    console.log("error");
  })
  //

});
