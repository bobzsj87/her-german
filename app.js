var globalLang = "en-US";
var ttsExtension = "fnolakpojfhnmkkmmofbicmehjodjekf";
var recognizedSentence = "";

//cross extension
function ttsSay(toSay, lang){
  chrome.runtime.sendMessage(ttsExtension, {toSay:toSay, lang:lang},
    function(response) {
      console.log(response);
    }); 
}
ttsSay("cross messaging success", globalLang);



var recognition = new webkitSpeechRecognition();
recognition.lang = globalLang;

recognition.continuous = true;

recognition.onstart = function() {
  console.log("start recognition");
};

recognition.onerror = function(event) {
  console.error(event.error);
};

recognition.onend = function() {
  console.log("end");
};

recognition.onresult = function(event) {
  var last = event.results.length - 1;
  console.log(event.results[last][0].transcript);
};

recognition.start();



var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
