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

		pumpHelper: function (o, yPosScrollView) {
			var preCalculationToggle = false;
			if (this.hasClass(o, INFLATION_CLASS_NAME)) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);
				preCalculationToggle = true;
			}

			var yPosObj = this.getOffset(o).top;

			if (preCalculationToggle) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);
			}

			if ((yPosScrollView - yPosObj) >= 0) {
				if (!this.hasClass(o, INFLATION_CLASS_NAME)) {
					this.toggleClassName(o, INFLATION_CLASS_NAME);
					o.parentNode.style.height = o.offsetHeight + 'px';
					o.parentNode.style.width = o.offsetWidth + 'px';

					o.style.position = '';
					o.style.zIndex = '';
				}
			} else if (this.hasClass(o, INFLATION_CLASS_NAME)) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);

				o.style.position = 'relative';
				o.style.zIndex = 1;
			}
		}
	};

	function determineCurrentHeader(balloonInst, yPosScrollView) {
		if (yPosScrollView >=
			jeeves.getOffset(
				balloonInst.headerStack[balloonInst.currentHeader + 1]
			).top) {

			if (balloonInst.currentHeader < balloonInst.headerStack.length - 1) {
				++balloonInst.currentHeader;
			}
		} else if (yPosScrollView <=
			jeeves.getOffset(
				balloonInst.headerStack[balloonInst.currentHeader - 1]
			).top) {

			if (balloonInst.currentHeader > 0) {
				--balloonInst.currentHeader;
			}
		}
	}

	function pump (balloonInst, scrollView) {
		var yPosScrollView = (scrollView === window) ?
		scrollView.scrollY : jeeves.getOffset(scrollView);
		jeeves.pumpHelper(
			balloonInst.headerStack[balloonInst.currentHeader],
			yPosScrollView
		);

		scrollView.onscroll = function () {
			var yPosScrollView = (scrollView === window) ?
			scrollView.scrollY : jeeves.getOffset(scrollView);
			determineCurrentHeader(balloonInst, yPosScrollView);

			jeeves.pumpHelper(
				balloonInst.headerStack[balloonInst.currentHeader],
				yPosScrollView
			);
		}
	}

	function sortStack (stack) {
		stack.sort(function (h1, h2) {
			return jeeves.getOffset(h1).top - jeeves.getOffset(h2).top;
		});

		jeeves.each(stack.slice(1), function (header) {
			header.style.position = 'relative';
			header.style.zIndex = 1;
		});
	}

	// options is an optional object with the follow
	balloon = function (options) {
		this.idMap = {};
		this.headerStack = [];
		this.currentHeader = 0;

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
				that.headerStack.push(that.idMap[id]);
			}

			if (typeof o === 'object') {
				jeeves.each(o, function (id) {
					addIndividual(id)
				});
			} else {
				addIndividual(o);
			}
			sortStack(this.headerStack);
			pump(this, this.scrollView);
		},

		// Unsticks the object(s) associated with the id(s)
		// passed in.
		deflate: function (o) {
			var that = this;
			function removeIndividual (id) {
				if (that.idMap[id] !== undefined) {
					that.idMap[id].style.position = '';
					that.idMap[id].style.zIndex = '';
					if (jeeves.hasClass(that.idMap[id], INFLATION_CLASS_NAME)) {
						jeeves.toggleClassName(that.idMap[id], INFLATION_CLASS_NAME);
					}

					if (that.headerStack.indexOf(that.idMap[id]) <= that.currentHeader &&
					that.currentHeader > 0) {
						--that.currentHeader;
					}

					that.headerStack.splice(
						that.headerStack.indexOf(that.idMap[id]),
						1
					);
					if (that.headerStack.length === 0 && that.scrollView.onScroll !== null) {
						that.scrollView.onscroll = null;
					}
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
		}
	};

	root.Balloon = balloon;

	root.Balloon.destroy = function () {
		delete root.Balloon;
	};

}).call(this);
