(function(window, document, undef) {
	/*
	   Constant variable
	*/
	var SEL_ROOT = "#container";
	var SEL_STORY = ".story";
	var SEL_STORY_TITLE = ".story h3";
	var SEL_STORY_BODY = ".story p";
	var SEL_RESULT = ".result";
	var SEL_RESULT_HEADER = ".result .header";
	var SEL_RESULT_BODY = ".result .body";
	var SEL_BITER = ".biter";
	var SEL_BITEE = ".bitee";
	var SEL_DROPDOWN = ".dropdown";
	var SEL_DROPDOWN_MENU = ".dropdown-menu";

	var CLS_FOUND = "found";
	var CLS_NOT_FOUND = "not-found";
	var CLS_OPEN = "open";

	var BITER = "biter";
	var BITEE = "bitee";

	/*
	  Application engine
	*/
	var app = {
		// Application entrance: 1> get data 2> render dom
		start: function() {
			var serviceURL = "mock/seed-data.json";
			var me = this;

			me.biters = [];
			me.bitees = [];

			$.getJSON(serviceURL)
			.done(function(data) {
				var $el = $(SEL_ROOT);
				me.$st = $el.find(SEL_STORY_TITLE);
				me.$sbd = $el.find(SEL_STORY_BODY);
				me.$rh = $el.find(SEL_RESULT_HEADER);
				me.$rb = $el.find(SEL_RESULT_BODY);
				me.$biter = $el.find(SEL_BITER);
				me.$bitee = $el.find(SEL_BITEE);
				me.$dropdown = $el.find(SEL_DROPDOWN);
				me.$story = $el.find(SEL_STORY);
				me.$result = $el.find(SEL_RESULT);

				me.render(data).cache(data);
			})
			.fail(function() {
				throw "Sorry, service invalid!!"
			});
		},
		//Cache data from server to save requests
		cache: function(data) {
			this._data = this._data || data
			return this._data; 
		},
		//Render basic structure of "dropdown list", include: 1> filter data 2> bind events
		render: function(data) {
			var me = this;
			var biterListItemHTML = "";
			var biteeListItemHTML = "";

			$.each(data, function(index, item) {
				if(!~me.biters.indexOf(item.biter)) {
					me.biters.push(item.biter);
					biterListItemHTML += "<li data-type='biter' data-value='"+ item.biter +"'>" +  item.biter + "</li>";	
				}
				
				if(!~me.bitees.indexOf(item.bitee)) {
					me.bitees.push(item.bitee);
					biteeListItemHTML += "<li data-type='bitee' data-value='"+ item.bitee +"'>" +  item.bitee + "</li>";
				}
			});

			me.$biter
				.text(data[0].biter)
				.siblings(SEL_DROPDOWN_MENU).html(biterListItemHTML);

			me.$bitee
				.text(data[0].bitee)
				.siblings(SEL_DROPDOWN_MENU).html(biteeListItemHTML);

			me.initEvent();

			return this;
		},
		// Init dom events after rendered
		initEvent: function() {
			var me = this;

			$("[data-action='show-dropdown']").click(function() {
				me.$dropdown.removeClass(CLS_OPEN);
				$(this).parent().toggleClass(CLS_OPEN);
			});

			me.$story.delegate("li", "click", null, function(event) {
				var data = $(event.currentTarget).data();
				$(this).parents(SEL_DROPDOWN).removeClass(CLS_OPEN);
				me.ctrl(data);
			});
		},
		//Main Controller for user interactive
		ctrl: function(data) {
			var me = this;
			var allData = me.cache();
			var currBiter;
			var currBitee;

			if(data.type === BITER) {
				me.$biter.text(currBiter = data.value);
				currBitee = me.$bitee.first().text();
			} else {
				me.$bitee.text(currBitee = data.value);
				currBiter = me.$biter.first().text();
			}

			var result = Util.filter(allData, function(value, index) {
				if(value[BITER] === currBiter && value[BITEE] === currBitee) {
					return value;
				}
			}, this)[0];

			this.show(result);
		},
		//Update dom and show the resule to user
		show: function(result) {
			var me = this;

			me.$result.removeClass([CLS_FOUND, CLS_NOT_FOUND].join(" "));

			if(result) {
				me.$rb
					.text(result.headline)
					.attr("href", result.link);
				me.$result.addClass(CLS_FOUND);
			} else {
				me.$result.addClass(CLS_NOT_FOUND);
			}
		}
	};

	/*
		Utility method
	*/
	var Util = {
		uniq: function(data) {
			if(!data) return ;
			var len = (data || []).length;
			var result = len ? [data[0]] : [];

			for(var i=1; i < len ; i++) if(data.hasOwnProperty(i) && !~result.indexOf(data[i])) {
				result.push(data[i]);
			}

			return result;
		}, 
		filter: function (data, callback, context){
			if(!data) return;
			var len = data.length;
			var results = [];
			var item;

			for(var i = 0; i < len; i++) {
				item = callback.call(context, data[i], i, data);
				item && results.push(item);
			}

			return results;
		} 
	};

	//Startup application when document loaded
	$(document).ready(function(){
		app.start();
	});
})(this, this.document, undefined);