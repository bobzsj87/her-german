var globalLang = "en-US";
var ttsExtension = "fnolakpojfhnmkkmmofbicmehjodjekf";
var recognized = [];
var flow;
var currentFlow;
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


//cross extension
function ttsSay(toSay, lang, cb){
  showMessage(toSay);
  chrome.runtime.sendMessage(ttsExtension, {toSay:toSay, lang:lang},
    function(response) {
      cb(response);
    });
}



var recognition = new webkitSpeechRecognition();


function triggerFlow(id){
  currentFlow = id;
  var f = flow[currentFlow];

  if (id == "end" || !f){
    showMessage("Ende");
    return;
  }

  if (f.type == "say"){
    ttsSay(f.content, globalLang, function(response){
      triggerNext();
    });
  }
  else if (f.type == "response"){
    recognition.start();
    showResponse("...");
  }
  else if (f.type == "image"){
    $(".container").append("<div class=\"image\"><img src=\""+makePath(f.content) + "\"></div>");
    triggerNext();
  }
  else if (f.type == "display"){
    showMessage(marked(f.content));
    triggerNext();
  }
  else if (f.type == "video"){
    $(".container").append("<div class=\"video\"><video width=\"500\" autoplay controls><source src=\""+makePath(f.content) + "\" type=\"video/mp4\"></video></div>");
    $("video").last().one('ended', function(event){
      triggerNext();
    });
  }
  else if (f.type == "link"){
    window.open(f.content, '_blank');
    triggerNext();
  }
}

function triggerNext(){
  flow[currentFlow] && triggerFlow(flow[currentFlow].next);
}

$(document).ready(function(){
  $.getJSON(makePath("manifest.json"), function(data){
    flow = data.flow;
    currentFlow = data.entry;

    if (data.lang) globalLang = data.lang;

    // setup recognition
    recognition.lang = globalLang;

    recognition.onerror = function(event) {
      console.error(event.error);
    };

    recognition.onend = function() {
      console.log("recog ended");
      var last = recognized[recognized.length-1];
      showResponse(last, true);
        
      //judge acceptance
      var f = flow[currentFlow];
      var triggered = false;

      if (f.accept){
        for(var i=0; i<f.accept.length;i++){
          var re = new RegExp(f.accept[i][0], 'i');
          var next = f.accept[i][1];
          if (re.test(last)){
            triggered = true;
            triggerFlow(next);
            console.log("accepted: " + next);
            break;
          }
        }
      }

      if (!triggered){
        console.log("default next triggered");
        triggerNext();
      } 
    };

    recognition.onresult = function(event) {
      // save the recognized sentence
      var last = event.results[event.results.length-1][0].transcript;
      recognized.push(last);

    };

    // now start the first flow
    triggerFlow(currentFlow);

  }).fail(function() {
    console.log("error");
  })
  //

});
