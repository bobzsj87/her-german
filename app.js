var globalLang = "en-US";
var ttsExtension = "fnolakpojfhnmkkmmofbicmehjodjekf";
var recognized = [];
var flow;
var currentFlow = 0;
var recordable = false;
var suite = "test1";

function makePath(p){
  if (typeof p == "string"){
    return [suite, p].join("/");
  }
  return p.splice(0,0, suite).join("/");
}

function showMessage(msg){
  $(".container").append("<div class=\"message\">"+msg+"</div>");
  scrollAnimate();
}

function showResponse(msg, isLast){
  if (isLast){
    $(".response").last().html(msg)
  }
  else {
    $(".container").append("<div class=\"response\">"+msg+"</div>");
    scrollAnimate();
  }
}

function scrollAnimate(){
  $("html, body").animate({ scrollTop: $(document).height() }, 1000);
}


function setRecording(status){
  recordable = status;
  if (status){
    showResponse("...")
  }
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
    setRecording(true);
  }
  else if (f.type == "image"){
    $(".container").append("<div class=\"image\"><img src=\""+makePath(f.content) + "\"></div>");
    triggerNext();
  }
}

function triggerNext(){
  triggerFlow(++currentFlow);
}

$(document).ready(function(){
  $.getJSON(makePath("manifest.json"), function(data){
    flow = data.flow;
    if (data.lang) globalLang = data.lang;

    // setup recognition
    recognition.lang = globalLang;
    recognition.continuous = true;

    recognition.onerror = function(event) {
      console.error(event.error);
    };

    recognition.onend = function() {
      
    };

    recognition.onresult = function(event) {
      if (recordable){
        var last = event.results.length - 1;
        recognized.push(event.results[last][0].transcript);
        showResponse(recognized[recognized.length-1], true);
        setRecording(false);
        triggerNext();   
      }
    };

    recognition.start();

    triggerFlow(currentFlow);

  }).fail(function() {
    console.log("error");
  })
  //

});
