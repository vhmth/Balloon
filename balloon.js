/* Balloon: Sticky Headers powered by pure Javascript
 *
 * Author: Vinay Hiremath
 *         vhiremath4@gmail.com
 *         www.vhmath.com
 *
 * Terms: There is no legitimate license associated with
 *        Balloon and I don't intend there to be. All I ask
 *        is that you don't try to sell Balloon to others
 *        on its own. If you're simply using it as a tool
 *        (even for a profitable website), that's cool with
 *        me. Other than that, feel free to do whatever you
 *        want with Balloon. If you wish, you may also remove
 *        this header. Code on broski.
 */

(function () {
	'use strict';

	var
	VER = '0.1',
	root = this,
	INFLATION_CLASS_NAME = 'inflated',

	balloon,
	jeeves;

	// Personal assistant, providing useful helper functions.
	jeeves = {
		isArray: function (o) {
			return Object.prototype.toString.call(o) === '[object Array]';
		},

		each: function (list, iterator, context) {
			var iterFunc = (context !== undefined) ?
			iterator.bind(context) : iterator;

			if (this.isArray(list)) {
				if (Array.forEach !== undefined) {
					Array.forEach(iterFunc);
				} else {
					var i;
					for (i = 0; i < list.length; ++i) {
						iterFunc(list[i], i, list);
					}
				}
			} else {
				var prop;
				for (prop in list) {
					if (list.hasOwnProperty(prop)) {
						iterFunc(list[prop], prop, list);
					}
				}
			}
		},

		getOffset: function (o) {
			var x = 0,
			y = 0;
			while (o && !isNaN(o.offsetLeft) && !isNaN(o.offsetTop)) {
				x += o.offsetLeft - o.scrollLeft;
				y += o.offsetTop - o.scrollTop;
				o = o.parentNode;
			}

			return {
				left: x,
				top: y
			}
		},

		toggleClassName: function (o, name) {
			if (this.hasClass(o, name)) {
				var regExp = new RegExp('(?:^|\s)' + name + '(?!\S)', 'g');
				o.className = o.className.replace(regExp, '');
			} else {
				o.className += name;
			}
		},

		hasClass: function (o, name) {
			return o.className.indexOf(name) !== -1;
		},

		pumpHelper: function (o, scrollView) {
			var preCalculationToggle = false;
			if (this.hasClass(o, INFLATION_CLASS_NAME)) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);
				preCalculationToggle = true;
			}

			var yPosScrollView = (scrollView === window) ?
			scrollView.scrollY : this.getOffset(o).top,

			yPosObj = this.getOffset(o).top;

			if (preCalculationToggle) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);
			}

			if ((yPosScrollView - yPosObj) >= 0) {
				if (!this.hasClass(o, INFLATION_CLASS_NAME)) {
					this.toggleClassName(o, INFLATION_CLASS_NAME);
					o.parentNode.style.height = o.offsetHeight + 'px';
					o.parentNode.style.width = o.offsetWidth + 'px';
				}
			} else if (this.hasClass(o, INFLATION_CLASS_NAME)) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);
			}
		}
	};

	function pump (o, scrollView) {
		jeeves.pumpHelper(o, scrollView);

		scrollView.onscroll = function () {
			jeeves.pumpHelper(o, scrollView);
		}
	}

	// options is an optional object with the follow
	balloon = function (options) {
		this.idMap = {};

		if (options !== undefined) {
			this.scrollView = (options.scrollView !== undefined) ?
			options.scrollView : window;

			this.stackHeaders = (options.stackHeaders !== undefined) ?
			options.stackHeaders : false;
		} else {
			this.scrollView = window;
			this.stackHeaders = false;
		}
	};

	balloon.prototype = {

		// Makes the object(s) associated with the id(s)
		// passed in sticky headers.
		inflate: function (o) {
			var that = this;
			function addIndividual (id) {
				if (that.idMap[id] !== undefined) {
					that.deflate(id);
				}
				that.idMap[id] = document.getElementById(id);
				pump(that.idMap[id], that.scrollView);
			}

			if (typeof o === 'object') {
				jeeves.each(o, function (id) {
					addIndividual(id)
				});
			} else {
				addIndividual(o);
			}
		},

		// Unsticks the object(s) associated with the id(s)
		// passed in.
		deflate: function (o) {
			var that = this;
			function removeIndividual (id) {
				if (that.idMap[id] !== undefined) {
					// TODO: unbind events from elem,
					delete that.idMap[id];
				}
			}

			if (typeof o === 'object') {
				jeeves.each(o, function (id) {
					removeIndividual(id)
				});
			} else {
				removeIndividual(o);
			}
		},

		// Removes the stickiness to all headers in this
		// Balloon instance.
		destroy: function () {
			var that = this;
			jeeves.each(this.idMap, function (id) {
				that.deflate(id)
			});
			delete this;
		}
	};

	root.Balloon = balloon;

	root.Balloon.destroy = function () {
		delete root.Balloon;
	};

}).call(this);
