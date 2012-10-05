/* Balloon: Sticky Headers powered by pure Javascript
 *
 * Author: Vinay Hiremath
 *         vhiremath4@gmail.com
 *         www.vhmath.com
 *
 * Terms: I have no legitimate license associated with
 *        Balloon. All I ask is that you don't try to
 *        sell Balloon to others on its own. If you're
 *        simply using it as a tool (even for a profitable
 *        website), that's cool with me. Other than that,
 *        feel free to do whatever you want with Balloon.
 *        If you wish, you may also remove this header.
 *        Code on broski.
 */

(function () {
	'use strict';

	var
	VER = '0.1',
	root = this,

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
			if (o.className.indexOf(name) !== -1) {
				var regExp = new RegExp('(?:^|\s)' + name + '(?!\S)', 'g');
				o.className = o.className.replace(regExp, '');
			} else {
				o.className += name;
			}
		},

		pumpHelper: function (o, scrollView) {
			var yPosScrollView = (scrollView === window) ?
			scrollView.scrollY : this.getOffset(o).top,

			yPosObj = this.getOffset(o).top;

			if ((yPosScrollView - yPosObj) === 0) {
				this.toggleClassName(o, 'inflated');
				o.parentNode.style.height = o.offsetHeight + 'px';
				o.parentNode.style.width = o.offsetWidth + 'px';
			}
		}
	};

	function pump (o, scrollView) {
		jeeves.pumpHelper(o, scrollView);

		scrollView.onscroll = function () {
			jeeves.pumpHelper(o, scrollView);
		}
	}

	balloon = function (options) {
		this.idMap = {};

		this.scrollView = (options !== undefined &&
			options.scrollView !== undefined) ?
		options.scrollView : window;
		// TODO: allow options to have the following:
		//       cascade: true/false = stack headers
		//       replace: true/false = replace headers
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

			if (typeof o === Object) {
				jeeves.each(o, addIndividual(id));
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

			if (typeof o === Object) {
				jeeves.each(o, removeIndividual(id));
			} else {
				removeIndividual(o);
			}
		},

		// Removes the stickiness to all headers and destroys
		// the balloon global variable.
		destroy: function () {
			jeeves.each(this.idMap, this.deflate(id));
			delete root.balloon;
		}
	};

	root.Balloon = balloon;

}).call(this);
