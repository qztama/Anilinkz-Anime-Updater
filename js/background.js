function fetch_feed(url, callback) {
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function(data) {
	  if (xhr.readyState == 4) {
	    if (xhr.status == 200) {
		  var data = xhr.responseText;
		  callback(data);
		}
		else {
		  callback(null);
		}
	  }
	}
	
	xhr.open('GET', url, true);
	xhr.send();
}

function check_update() {
  console.log('check_update');
  var not_uptodate = 0;

  //create the dictionary for up-to-date anime
  anime_hashmap = {};
  
  //get list of animes to check
  chrome.storage.local.get("anime", function(result) {
  	console.log(result);
    var anime_list = result.anime.split(" ");

    check_up_callback = 1;
	
	for(i = 1; i < anime_list.length; i++)
	{
	  setTimeout(function(anime_name){
	  	var cur_url = 'http://anilinkz.tv/series/' + anime_name;

	  	fetch_feed(cur_url, function(data) {

		var valid_ep = false;
		var jquery_i = 1;
		var jquery_str = '#serieslist li:nth-child(';
		  
		//getting the latest episode number
		var ep_arr;
		var temp_li;
		var temp_ep_sub = '';
		  
		while(!valid_ep) {
		  	temp_li = $(data).find(jquery_str + jquery_i + ')');
		  	ep_arr = temp_li.find('.epser a')[0].innerText.split(' '); 
		
		  	//valid number and not .5 videos and not info
		  	if(!isNaN(ep_arr[ep_arr.length - 1]) && ep_arr[ep_arr.length - 1] % 1 == 0 && temp_li.find('.Info')[0] == null) {
				valid_ep = true;
				jquery_str = jquery_str + jquery_i + ')';
			
				temp_ep_sub = temp_ep_sub + ep_arr[ep_arr.length - 1] + '`';
		  	}
			
		  	jquery_i = jquery_i + 1;
		}
		
		//console.log($(data).find(jquery_str)[0]);

		//getting status of subs
		if($(data).find(jquery_str).find('.Raw')[0] == null) {
			//Series complete
			temp_ep_sub += 'Sub';
		}
		else {
			//Raw sub on latest ep
			temp_ep_sub += 'Raw';
		}

		//create a entry for ith anime and store the ep and sub status into dictonary

		anime_hashmap[anime_name] = temp_ep_sub;
		
		//compare each anime in storage with the site's data
		chrome.storage.local.get(anime_name, function (result) {
		  	parseArr = result[anime_name].split('`');
		  	curArr = anime_hashmap[anime_name].split('`');

		  	/*console.log(cur_url);
		  	console.log(parseArr[4] + ' vs ' + anime_name);
		  	console.log(parseArr[1] + ' vs ' + curArr[0]);
		  	console.log(parseArr[2] + ' vs ' + curArr[1]);*/

		  	if(parseArr[1] == curArr[0] && parseArr[2] == curArr[1]) {
		  		//nothing new
		    	console.log("nothing new");

		    	//setup for badge number
		    	if(parseArr[5] != parseArr[1])
		    		not_uptodate++;
		  	}
		  	else {
		  		//something new
		    	console.log("something new");
		    	parseArr[1] = curArr[0];
		    	parseArr[2] = curArr[1];
		    	var temp_stor_obj = {};
		    	temp_stor_obj[parseArr[4]] = parseArr.join('`');

		    	chrome.storage.local.set(temp_stor_obj, function(){
		    		if(chrome.runtime.error) {
		    			console.log("Ran out of space in item for temp_stor_obj.");
		  			}
		    	});

		    	//something new just updated so this anime is not up to date
		    	not_uptodate++;
		  	}
		  
		  	check_up_callback = check_up_callback + 1;

		  	//make sure the badge is only changed at the end
		  	if(check_up_callback == anime_list.length) {
		  		//reorganize the anime
		  		reorganize();

		  		//change the badge number
		  		console.log('setBadgeText');
		  		if(not_uptodate <= 999) {
		  			//color of the badge background
		  			if(not_uptodate == 0)
		  				chrome.browserAction.setBadgeBackgroundColor({color: '#8AC007'});
		  			else
		  				chrome.browserAction.setBadgeBackgroundColor({color: '#33CCCC'});

					chrome.browserAction.setBadgeText({text: ' ' + not_uptodate});
			}
			else
				chrome.browserAction.setBadgeText({text: '999+'});
		  	}
		});
	  });
	}, 1, anime_list[i]);
	}
  });
}

function remove_Anime(anime_title){
  console.log('inside remove anime');
  
  //remove the anime from the anime string
  chrome.storage.local.get('anime', function(response){
    anime_arr = response.anime.split(' ');
    new_anime_str = '';

    for(i = 0; i < anime_arr.length; i++){
      if(anime_arr[i] != anime_title)
        new_anime_str = new_anime_str + anime_arr[i] + ' ';
    }

    //chop off the last space
    new_anime_str = new_anime_str.substring(0, new_anime_str.length - 1);

    if(anime_arr.length > 2) {
	    chrome.storage.local.set({'anime' : new_anime_str}, function () {
			  if(chrome.runtime.error) {
			    console.log("Problem with set in remove_Anime.");
			  }
			});
	}
	else {
		//no more animes in anime string, remove anime string storage
		chrome.storage.local.remove('anime', function(){
	  			//check update after anime removal
	  			chrome.browserAction.setBadgeText({text: ''});
  			});
	}
  });

  //remove the anime from chrome storage
  chrome.storage.local.remove(anime_title, function(){
  	//check update after anime removal
  	check_update();
  });
 
}

function reorganize(){
  console.log('reorganize');
  uptodate_anime = [];
  not_uptodate_anime = [];

  chrome.storage.local.get('anime', function(response){
    if(response != null){
      animeArr = response.anime.split(" ");
      var callback_var2 = 1;
      for(i = 1; i < animeArr.length; i++){
        reorganize_scope(animeArr[i], function(animu){
        	chrome.storage.local.get(animu, function(response){
          	var animeObj = {};
          	var temp = response[animu];

          	info = response[animu].split("`");

          	if(info[1] == info[5])
            	uptodate_anime.push(info[4]);
          	else
            	not_uptodate_anime.push(info[4]);

          	callback_var2 = callback_var2 + 1;

          	if(callback_var2 == animeArr.length){
          		uptodate_anime.sort();
          		not_uptodate_anime.sort();
            	//console.log(not_uptodate_anime.concat(uptodate_anime));
            	chrome.storage.local.set({anime: ' ' + not_uptodate_anime.concat(uptodate_anime).join(' ')});
          	}
        	});	
        });
      }
    }
  });
}

function reorganize_scope(animu, reorg_func){
	reorg_func(animu);
}

function update_cur_ep(anime_title, my_ep) {
	console.log(anime_title);
	console.log(my_ep);
	var callback_k = 0;

	title_parse = anime_title.split('-');

	//need anime_title to be array for callback function
	anime_title = [];

	for(i = 0; i < title_parse.length; i++) {
		//try out different combinations of the passed in title,
		//title may contain something like "second season"
		if(i == 0)
			anime_title.push(title_parse[0]);
		else
			anime_title.push(anime_title[i-1] + '-' + title_parse[i]);

		chrome.storage.local.get(anime_title[i], function(response){
			//anime_title array used here
			if(response[anime_title[callback_k]] != null){
				parseArr = response[anime_title[callback_k]].split('`');
				parseArr[5] = my_ep;

				//change the current ep as long as its not the info ep
				if(my_ep != Number(parseArr[1]) + 1) {
					var temp_stor_obj = {};
				    temp_stor_obj[parseArr[4]] = parseArr.join('`');

				    chrome.storage.local.set(temp_stor_obj, function(){
				    	check_update();

				    	if(chrome.runtime.error) {
				    		console.log("Ran out of space in item for temp_stor_obj.");
				  		}
				    });
				}
			}

			callback_k = callback_k + 1;
		});
	}
}

function onRequest(request, sender, callback) {
  if (request.action == "fetch_feed") {
    fetch_feed(request.url, callback);
  }
  if (request.action == "check_update") {
    check_update();
  }
  if (request.action == 'remove_Anime') {
  	remove_Anime(request.anime_title);
  }
  if(request.action == 'update_cur_ep') {
  	console.log('inside update current ep');
  	update_cur_ep(request.anime_title, request.my_ep);
  }

}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	//save new anime name into the list
	chrome.storage.local.get("anime", function(result) {
	  if(result.anime == null) {
	  	console.log('result anime is null');
	    chrome.storage.local.set({anime: ' ' + request.anime_series});
	  }
	  else {
	  	console.log('result anime is not null');
	    var newAnimeStr = result.anime + ' ' + request.anime_series;
	    chrome.storage.local.set({anime: newAnimeStr}, function () {
		  if(chrome.runtime.error) {
		    console.log("Ran out of space in item.");
		  }
		});
	  }
	});
  
	var storage_obj = {};
	//console.log(request);
	storage_obj[request.anime_series] = request.anime_title + '`' + request.episode + '`' + request.sub_status + '`' + request.img_link + '`' + request.anime_series + '`' + '1';
	//console.log(storage_obj);
	
	chrome.storage.local.set(storage_obj, function() {
		//check update after new anime added
		check_update();

		if (chrome.runtime.error) {
			console.log("Runtime error.");
		}
	});
	
	sendResponse({
	  msg: "We good!"
	  //chrome.storage.local.clear();
	  });
  });

//Beginning of what is ran
check_update();

//check update every 30 minutes
setInterval(function(){ 
		console.log('Timeout');
		check_update(); 
	}, 1800000);

//Wire up the listener
chrome.extension.onRequest.addListener(onRequest);