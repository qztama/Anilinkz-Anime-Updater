url_arr = window.location.href.split('?')[0].split('-episode-');
//url_arr = url_arr[0].split('-episode-');
anime_title = url_arr[0].split('http://anilinkz.tv/')[1];
current_ep = url_arr[1];

chrome.extension.sendRequest({'action' : 'update_cur_ep', 'anime_title' : anime_title, 'my_ep' : current_ep});

/*chrome.storage.local.get(anime_title, function(response){
	if(response != null){
		parseArr = response.split('`');
		parseArr[5] = current_ep;

		var temp_stor_obj = {};
	    temp_stor_obj[parseArr[4]] = parseArr.join('`');

	    chrome.storage.local.set(temp_stor_obj, function(){
	    	chrome.extension.sendRequest({'action' : 'check_update'});

	    	if(chrome.runtime.error) {
	    		console.log("Ran out of space in item for temp_stor_obj.");
	  		}
	    });
	}
});*/