//grab the name of the series and convert it to text for url
var title_c = window.location.href.split('http://anilinkz.tv/series/')[1];
var added = false;

var style_str = "background-image: url('chrome-extension://hflhlbkfednfoamlgicicdjibpbgilce/images/BA_icon.png');border-radius: 50%;"

var span = $('<span style="margin-left: 10px;">');
var add_but = $('<button/>', 
	{	
	id: 'AL_add_but',
	style: style_str,
	width: 28,
	height: 28,
	click: function(){add_but_click();}
});

chrome.storage.local.get(title_c, function(result){
	if(result[title_c] == null)
	{
		//add the button to the page
		add_but.appendTo(span[0]);
		span.appendTo($('main h2')[0]);
	}
});

function add_but_click(){
	//chrome.storage.local.get(title_c, function(result) {
		//if(result[title_c] == null) {
			var valid_ep = false;
			var jquery_i = 1;
			var jquery_str = '#serieslist li:nth-child(';

			//getting the latest episode number
			var ep_arr;
			var latest_ep;
		  
			while(!valid_ep) {
				ep_arr = $(jquery_str + jquery_i + ')').find('.epser a')[0].innerText.split(' ');
				latest_ep = ep_arr[ep_arr.length - 1];

			  	if(!isNaN(latest_ep) && latest_ep % 1 == 0) {
			  		valid_ep = true;
			  		jquery_str = jquery_str + jquery_i + ')';
				}

				jquery_i = jquery_i + 1;
			}	

			//getting status of subs
			var sub_stat = '';
			  
			if($(jquery_str).find('.Info')[0] == null) {
			  	if($(jquery_str).find('.Raw')[0] == null) {
					//Series complete
					sub_stat = 'Sub';
				}
				else {
				  //Raw sub on latest ep
				  sub_stat = 'Raw';
				}
			}
			else {
				//Ongoing series
				latest_ep = latest_ep - 1;
				sub_stat = 'Sub';
			}

			//getting the image link
			var img_link = $('.imgseries img')[0].src;

			//getting presentable title
			disp_title = $('main h2')[0].innerText.split(' Episodes')[0];

			chrome.runtime.sendMessage({
			  		anime_series : title_c, 
			  		anime_title : disp_title,
			  		episode: latest_ep,
			  		sub_status: sub_stat,
			  		img_link: img_link
				},
				function(response) {
				  	//alert(response.msg);
				  	chrome.storage.local.get(title_c, function (result) {
				  		console.log(result[title_c]);
				  	});
				}
			);

			$('#AL_add_but').remove();
		/*}
		else{
			alert('This anime has already been added.')
		}*/
	//});
}