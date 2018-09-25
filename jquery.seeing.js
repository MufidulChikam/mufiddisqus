/*!
 * jQuery Seeing Plugin v0.5.0
 * Author: Muhammad Syifa
 */
(function($) {

	$.ObjectViewer = function(object, container, whenSeen, whenNotSeen) {
		
		this.object = object;
		this.container = container;
		this.whenSeen = whenSeen;
		this.whenNotSeen = whenNotSeen;
		this.minimumSeen = "100%";
		this.isSeen = false;

		this.getContainerScrollTop = function() {
			return $(this.container).scrollTop();
		}

		this.getContainerHeight = function() {
 			return $(this.container).outerHeight();
 		}

		this.getObjectHeight = function() {
			return $(this.object).outerHeight();
		}

		this.getObjectOffset = function() {
			return $(this.object).offset().top;
		}

		this.getContainerOffset = function() {
			var offset = $(this.container).offset();
			return offset == undefined? 0 : offset.top;
		}

		this.getContainerArea = function() {
			var Coff = this.getContainerScrollTop();
			var Ch = this.getContainerHeight();

			return {min: Coff, max: Coff+Ch};
		}

		this.getObjectArea = function() {
			var Oh = this.getObjectHeight();
			var Coff = this.getContainerOffset();
			var Ooff = this.getObjectOffset();
			var Cs = this.getContainerScrollTop();
			
			if(this.container == window || this.container == document) {
				var Roff = Ooff - Coff;
			} else {
				var Roff = Ooff - (Coff - Cs);
			}
			

			return {min: Roff, max: Roff+Oh};
 		}

		this.getCalculateMinimumSeen = function() {
			var minimumSeen = this.minimumSeen;
			var objectHeight = this.getObjectHeight();
			var calculatedMinimumSeen = objectHeight;

			// kalo satuan minimumSeennya %, itung dulu berapa px dari X%
			if(typeof minimumSeen == "string" && minimumSeen.match(/\%$/)) {
				var percent = parseInt(minimumSeen);
				if(isNaN(percent)) {
					percent = 100;
				}

				calculatedMinimumSeen = (percent/100)*objectHeight;
			} 
			// kalo satuan minimumSeennya px, apus aja pxnya
			else if(typeof minimumSeen == "string" && minimumSeen.match(/px$/)) 
			{
				var parsedMinimumSeen = parseInt(minimumSeen);
				if(!isNaN(parsedMinimumSeen)) {
					calculatedMinimumSeen = parsedMinimumSeen;
				}
			}

			return calculatedMinimumSeen;
		};

		this.wasSeen = function() {
			var containerArea = this.getContainerArea();
			var objectArea = this.getObjectArea();

			var minimumSeen = this.getCalculateMinimumSeen();
			var seenSize = 0;

			if(objectArea.max > containerArea.min && objectArea.max < containerArea.max) {
				seenSize = objectArea.max - containerArea.min;
			} else if(objectArea.min > containerArea.min && objectArea.min < containerArea.max) {
				seenSize = containerArea.max - objectArea.min;
			} else if(objectArea.min >= containerArea.min && objectArea.max <= containerArea.max) {
				seenSize = objectHeight;
			}

			return seenSize >= minimumSeen;
		};

	};

	$.fn.seeing = function(selector, whenSeen, whenNotSeen) {

		var $containers = this;

		if(typeof whenSeen === "function") {

			function checkViewedObjects(container) {
				$.each(container.viewedObjects, function(i, objectViewer) {

					var wasSeen = objectViewer.wasSeen();
					var isSeen = objectViewer.isSeen;

					if(wasSeen && !isSeen) {
						if(typeof objectViewer.whenSeen == "function") objectViewer.whenSeen(objectViewer.object);
						objectViewer.isSeen = true;
					} else if(!wasSeen && isSeen) {
						if(typeof objectViewer.whenNotSeen == "function") objectViewer.whenNotSeen(objectViewer.object);
						objectViewer.isSeen = false;
					}

				});
			}
		
			return $containers.each(function() {

				var realContainer = this;

				if(this == window || this == document) {
					var container = $("body").get(0);				
				} else {
					var container = this;
				}

				if(typeof selector != "object" && typeof selector != "string") {
					$.error("object must be string selector or jquery object(s)");
				} else {
					var $objects = $(container).find(selector);
				}

				if(container.viewedObjects == undefined) {
					container.viewedObjects = new Array();
				}

				$objects.each(function() {
					this.objectViewer = new $.ObjectViewer(this, realContainer, whenSeen, whenNotSeen);

					if($(this).data("minimumSeen") != undefined) {
						this.objectViewer.minimumSeen = $(this).data("minimumSeen");
					}

					container.viewedObjects.push(this.objectViewer);
				});

				checkViewedObjects(container);

				$(this).scroll(function() {
					checkViewedObjects(container);
				});

			});
		}

	};

})(jQuery)
