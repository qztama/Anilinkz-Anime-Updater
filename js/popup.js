var web_link = 'http://anilinkz.io/';
var animeArr = [];
var callback_var = 1;
var callback_var2 = 1;

function display(response){
  var animu = [];
  var trendingDiv = $('#trending')[0];
  var trendingList = $(response).find("#trendinglist li");
  
  trendingList.each(function(){
    var oldEpRef = $(this).find('.ep')[0];
    var newEpRef = document.createElement('a');
	  newEpRef.href = 'http://anilinkz.io/' 
	    + oldEpRef.href.split("chrome-extension://hflhlbkfednfoamlgicicdjibpbgilce/")[1];
	  newEpRef.innerHTML = oldEpRef.title + '\n';
	  //console.log(newEpRef);
	  trendingDiv.appendChild(newEpRef);
	  trendingDiv.appendChild(document.createElement('br'));
  });
  /*for(i = 0; i < trendingList.length; i++) {
    console.log(trendingList[i]);
  }*/
}

function fetch_feed(urlStr, callback) {
  chrome.extension.sendRequest({'action' : 'fetch_feed', 'url' : urlStr}, function(response) {
    callback(response)
  });
}

function check_updates() {
  chrome.extension.sendRequest({'action' : 'check_updates'},
    function(response) {
	   
	});
}

function createEntry(Obj) {
  var div;

  //changes color of div depending on whether user is up to date
  if(Obj.new_ep == Obj.cur_ep)
    div = $('<div>',{id: Obj.ref_title, class: 'entryUpToDate'})[0];
  else
    div = $('<div>',{id: Obj.ref_title, class: 'entryNotUpToDate'})[0];

  var innerDiv = $('<div>', {class: 'col-xm-4'});

  //creating the image element
  var img = $('<img>');
  img.attr('src', Obj.img_link);
  img.attr('class', 'img-circle');

  //creating and assigning the span elements for the anime description
  var title = $('<span>', {class: 'titleLine'});
  var ep = $('<span>', {class: 'epLine'});
  var sub = $('<span>', {class: 'subLine'});
  var cur_ep = $('<span>', {class: 'curEp'});
  var watch_now = $('<button>', {class: 'watch_now glyphicon glyphicon-play'});
  var delete_but = $('<button>', {class: 'delete_but glyphicon glyphicon-remove-circle confirm'});

  title[0].innerHTML = Obj.titleStr;
  ep[0].innerHTML = 'Latest Episode: ' + Obj.new_ep;
  sub[0].innerHTML = 'Sub Status: ' + Obj.sub_stat;
  cur_ep[0].innerHTML = 'Last Watched: ' + Obj.cur_ep;

  //watch_now[0].href = web_link + 'series/' + Obj.ref_title;
  watch_now[0].addEventListener('click', function(){
    go_Series(this.parentElement.id);
  });

  delete_but[0].addEventListener('click', function(){
    remove_Anime(this.parentElement.id);
  });

  //building the div dom architecture
  img.appendTo(div);
  title.appendTo(div);
  ep.appendTo(div);
  sub.appendTo(div);
  cur_ep.appendTo(div);
  watch_now.appendTo(div);
  delete_but.appendTo(div);

  return div;
}

function go_Series(anime_title){
  chrome.tabs.create({url: web_link + 'series/' + anime_title});
}

function remove_Anime(anime_title){
  //alert('inside remove anime');
  $('<div></div>').appendTo('body')
  .html('<div><h6>Remove this anime?</h6></div>')
  .dialog({
      modal: true, title: 'AL Extension', zIndex: 10000, autoOpen: true,
      width: 'auto', resizable: false,
      buttons: {
          Yes: function () {
              chrome.extension.sendRequest({'action' : 'remove_Anime', 'anime_title' : anime_title});
    
              console.log($('#' + anime_title)[0]);
              $('#' + anime_title).remove();
              $(this).dialog("close");
          },
          No: function () {
              $(this).dialog("close");
          }
      },
      close: function (event, ui) {
          $(this).remove();
      }
  })
  .prev(".ui-dialog-titlebar").css("color","black");;
}

function init_popup() {
	chrome.storage.local.get("anime", function(response){
    console.log(response);
    if(response != null){
      console.log("from init_popup");

      animeArr = response.anime.split(" ");
      console.log(animeArr);

      for(i = 1; i < animeArr.length; i++){
        var animu = animeArr[i];
        console.log('animu: ' + animu);

        chrome.storage.local.get(animu, function(response){
          console.log('inside callback');
          var animeObj = {};
          var temp = response[animeArr[callback_var]];
          console.log('callbackvar: ' + callback_var);
          console.log(animeArr[callback_var]);
          info = response[animeArr[callback_var]].split("`");
          animeObj.titleStr = info[0];
          animeObj.new_ep = info[1];
          animeObj.sub_stat = info[2];
          animeObj.img_link = info[3];
          animeObj.ref_title = info[4];
          animeObj.cur_ep = info[5];
          animeArr[callback_var] = animeObj;
          console.log(animeObj);

          $('.container')[0].appendChild(createEntry(animeObj));

          callback_var = callback_var + 1;
        });
      }
    }
  });
}

$(document).ready(function() {
  //fetch_feed(web_link, display);
  init_popup();
})