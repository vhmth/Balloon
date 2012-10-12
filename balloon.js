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
	FLOATING_CLASS_NAME  = 'floating',

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

		setOption: function (balloonInst, options, oName, fallback) {
			if (options[oName] !== undefined) {
				balloonInst[oName] = options[oName];
			} else {
				balloonInst[oName] = fallback;
			}
		},

		pumpHelper: function (o, balloonInst, yPosScrollView) {
			var preCalculationToggle = false;
			if (this.hasClass(o, INFLATION_CLASS_NAME)) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);
				preCalculationToggle = true;
			}

			var yPosObj = o.offsetTop;

			if (preCalculationToggle) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);
			}

			var diff = yPosScrollView - yPosObj,
			currentHeader = balloonInst.currentHeader;
			if (balloonInst.stackHeaders) {
				diff += balloonInst.offsetTop;
			}

			if (diff >= 0) {
				if (!this.hasClass(o, INFLATION_CLASS_NAME)) {
					this.toggleClassName(o, INFLATION_CLASS_NAME);
					o.parentNode.style.height = o.offsetHeight + 'px';
					o.parentNode.style.width = o.offsetWidth + 'px';

					if (currentHeader > 0 && balloonInst.stackHeaders) {
						o.style.top = balloonInst.offsetTop + 'px';
					}

					if (this.hasClass(o, FLOATING_CLASS_NAME)) {
						this.toggleClassName(o, FLOATING_CLASS_NAME);
					}
				}
			} else if (this.hasClass(o, INFLATION_CLASS_NAME)) {
				this.toggleClassName(o, INFLATION_CLASS_NAME);
				this.toggleClassName(o, FLOATING_CLASS_NAME);

				if (currentHeader > 0 && balloonInst.stackHeaders) {
					o.style.top = '';
					if (currentHeader > 1) {
						balloonInst.offsetTop -= balloonInst.headerStack[currentHeader].offsetHeight;
						o.style.top = '';
					}
				}
			}
		}
	};

	function determineCurrentTopOffset(balloonInst) {
		var currentHeader = balloonInst.currentHeader,
		i;
		for (i = currentHeader; i < currentHeader.length - 1; ++i) {
			balloonInst.offsetTop += balloonInst.headerStack[i].offsetHeight;
		}
	}

	function determineCurrentHeader (balloonInst, yPosScrollView) {
		var currentHeader = balloonInst.currentHeader,
		headerStack = balloonInst.headerStack,
		headerTopOffset = balloonInst.offsetTop;

		if (currentHeader < (headerStack.length - 1) &&
			(yPosScrollView + headerTopOffset)  >=
			headerStack[currentHeader + 1].offsetTop) {
			++balloonInst.currentHeader;
		} else if (currentHeader > 0) {
			if (jeeves.hasClass(headerStack[currentHeader - 1],
				INFLATION_CLASS_NAME)) {
				jeeves.toggleClassName(
					headerStack[currentHeader - 1],
					INFLATION_CLASS_NAME
				);
				if (yPosScrollView <=
					headerStack[currentHeader - 1].offsetTop) {
					--balloonInst.currentHeader;
				}
				jeeves.toggleClassName(
					headerStack[currentHeader - 1],
					INFLATION_CLASS_NAME
				);
			}
		}

		if (balloonInst.stackHeaders &&
			currentHeader !== balloonInst.currentHeader) {
			determineCurrentTopOffset(balloonInst);
		}
	}

	function pump (balloonInst, scrollView) {
		var yPosScrollView = (scrollView === window) ?
		scrollView.scrollY : jeeves.getOffset(scrollView).top;
		jeeves.pumpHelper(
			balloonInst.headerStack[balloonInst.currentHeader],
			balloonInst,
			yPosScrollView
		);

		scrollView.onscroll = function () {
			var yPosScrollView = (scrollView === window) ?
			scrollView.scrollY : jeeves.getOffset(scrollView).top;
			determineCurrentHeader(balloonInst, yPosScrollView);

			jeeves.pumpHelper(
				balloonInst.headerStack[balloonInst.currentHeader],
				balloonInst,
				yPosScrollView
			);
		}
	}

	function sortStack (stack) {
		stack.sort(function (h1, h2) {
			return jeeves.getOffset(h1).top - jeeves.getOffset(h2).top;
		});

		jeeves.each(stack.slice(1), function (header) {
			if (!jeeves.hasClass(header, FLOATING_CLASS_NAME)) {
				jeeves.toggleClassName(header, FLOATING_CLASS_NAME);
			}
		});
	}

	// options is an optional object with the follow
	balloon = function (options) {
		this.idMap = {};
		this.headerStack = [];
		this.currentHeader = 0;
		this.offsetTop = 0;

		if (options !== undefined) {
			jeeves.setOption(this, options, 'scrollView', window);
			jeeves.setOption(this, options, 'stackHeaders', false);
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
			if (this.stackHeaders) {
				this.offsetTop = this.headerStack[0].offsetHeight;
			}
			pump(this, this.scrollView);
		},

		// Unsticks the object(s) associated with the id(s)
		// passed in.
		deflate: function (o) {
			var that = this;
			function removeIndividual (id) {
				if (that.idMap[id] !== undefined) {
					if (jeeves.hasClass(that.idMap[id], FLOATING_CLASS_NAME)) {
						jeeves.toggleClassName(that.idMap[id], FLOATING_CLASS_NAME);
					}
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
