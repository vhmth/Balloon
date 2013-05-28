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

// Function.prototype.bind polyfill found on
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
// for compatibility with IE versions <= 8
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		'use strict';
		if (typeof this !== 'function') {
			throw new TypeError(
				'Function.prototype.bind - what is trying to be bound is not callable'
			);
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			FuncNOP = function () {},
			fBound = function () {
				return fToBind.apply(
					(this instanceof FuncNOP && oThis) ?
							this : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments))
				);
			};

		FuncNOP.prototype = this.prototype;
		fBound.prototype = new FuncNOP();

		return fBound;
	};
}

// Array.prototype.indexOf polyfill found on
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// for compatibility with IE versions <= 8
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		'use strict';

		if (this == null) {
			throw new TypeError();
		}

		var t = Object(this),
			len = t.length >>> 0,
			n,
			k;

		if (len === 0) {
			return -1;
		}

		n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n != n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n != 0 && n != Infinity && n != -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}

		if (n >= len) {
			return -1;
		}

		k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

(function (doc) {
	'use strict';

	var
		VER = '0.1',
		root = this,
		INFLATION_CLASS_NAME = 'balloon-inflated',
		FLOATING_CLASS_NAME  = 'balloon-floating',

		balloon,
		jeeves;

	// Personal assistant, providing useful helper functions.
	jeeves = {
		isArray: function (o) {
			var toStrResult = Object.prototype.toString.call(o);
			return toStrResult === '[object Array]' ||
				toStrResult === '[object NodeList]';
		},

		each: function (list, iterator, context) {
			var iterFunc =
				(context !== undefined) ? iterator.bind(context) : iterator,
				i,
				prop;

			if (this.isArray(list)) {
				if (Array.forEach !== undefined) {
					list.forEach(iterFunc);
				} else {
					for (i = 0; i < list.length; i += 1) {
						iterFunc(list[i], i, list);
					}
				}
			} else {
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
			};
		},

		toggleClassName: function (o, name) {
			if (this.hasClass(o, name)) {
				var classes = o.className.split(' '),
					classIndex = classes.indexOf(name);
				classes.splice(classIndex, 1);
				o.className = classes.join(' ');
			} else {
				if (o.className.length > 0) {
					o.className += ' ' + name;
				} else {
					o.className += name;
				}
			}
		},

		getWindowScrollPos: function () {
			return (root.pageYOffset !== undefined) ? root.pageYOffset :
						(doc.documentElement ||
						doc.body.parentNode ||
						doc.body).scrollTop;
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
		}
	};

	function unstickHeaders(balloonInst, endIndex) {
		var toIndex = endIndex;
		if (endIndex === undefined) {
			toIndex = 0;
		}

		jeeves.each(balloonInst.headerStack.slice(toIndex), function (o, index) {
			if (jeeves.hasClass(o, INFLATION_CLASS_NAME)) {
				jeeves.toggleClassName(o, INFLATION_CLASS_NAME);
				o.parentNode.style.height = '';
				o.parentNode.style.width = '';
				if (balloonInst.stackHeaders && index > 0) {
					o.style.top = '';
				}
			}

			if (!jeeves.hasClass(o, FLOATING_CLASS_NAME)) {
				jeeves.toggleClassName(o, FLOATING_CLASS_NAME);
			}
		});
	}

	function stickHeaders(balloonInst, endIndex) {
		jeeves.each(balloonInst.headerStack.slice(0, endIndex), function (o, index) {
			if (!jeeves.hasClass(o, INFLATION_CLASS_NAME)) {
				jeeves.toggleClassName(o, INFLATION_CLASS_NAME);
				o.parentNode.style.height = o.offsetHeight + 'px';
				o.parentNode.style.width = o.offsetWidth + 'px';
			}

			if (balloonInst.currentHeader > 0 && balloonInst.stackHeaders) {
				var offsetTop = 0, i;
				for (i = 0; i < index; i += 1) {
					offsetTop += balloonInst.headerStack[i].offsetHeight;
				}
				o.style.top = offsetTop + 'px';
			}

			if (jeeves.hasClass(o, FLOATING_CLASS_NAME)) {
				jeeves.toggleClassName(o, FLOATING_CLASS_NAME);
			}
		});
	}

	function inflateUpToCurrent(balloonInst, yPosScrollView) {
		unstickHeaders(balloonInst);

		var i,
			j,
			currentHeader = 0,
			offsetTop = 0;
		for (i = balloonInst.headerStack.length - 1; i >= 0; i -= 1) {
			offsetTop = 0;
			if (balloonInst.stackHeaders) {
				for (j = 0; j < i; j += 1) {
					offsetTop += balloonInst.headerStack[j].offsetHeight;
				}
			}
			if ((yPosScrollView + offsetTop) >= balloonInst.headerStack[i].offsetTop) {
				currentHeader = i;
				break;
			} else if (i === 0) {
				// we are above the first header in the header stack
				currentHeader = -1;
			}
		}

		if (currentHeader !== -1) {
			balloonInst.currentHeader = currentHeader;
			if (balloonInst.stackHeaders) {
				balloonInst.offsetTop =
					offsetTop + balloonInst.headerStack[currentHeader].offsetHeight;
			}
			stickHeaders(balloonInst, currentHeader + 1);
			unstickHeaders(balloonInst, currentHeader + 1);
		}
	}

	function pump(balloonInst, scrollView) {
		var yPosScrollView = (scrollView === root) ?
				jeeves.getWindowScrollPos() : jeeves.getOffset(scrollView).top;
		inflateUpToCurrent(balloonInst, yPosScrollView);
	}

	function sortStack(stack) {
		stack.sort(function (h1, h2) {
			return jeeves.getOffset(h1).top - jeeves.getOffset(h2).top;
		});

		jeeves.each(stack.slice(1), function (header) {
			if (!jeeves.hasClass(header, FLOATING_CLASS_NAME)) {
				jeeves.toggleClassName(header, FLOATING_CLASS_NAME);
			}
		});
	}

	balloon = function (options) {
		this.idMap = {};
		this.headerStack = [];
		this.currentHeader = 0;

		if (options !== undefined) {
			jeeves.setOption(this, options, 'scrollView', root);
			jeeves.setOption(this, options, 'stackHeaders', false);
		} else {
			this.scrollView = root;
			this.stackHeaders = false;
		}
	};

	balloon.prototype = {

		// Makes the object(s) associated with the id(s)
		// passed in sticky headers.
		inflate: function (o) {
			var that = this;

			function addIndividual(id) {
				if (that.idMap[id] !== undefined) {
					that.deflate(id);
				}

				if (id.charAt(0) === '.') {
					that.idMap[id] = doc.getElementsByClassName(id.slice(1));
					jeeves.each(that.idMap[id], function (elem) {
						that.headerStack.push(elem);
					});
				} else {
					that.idMap[id] = doc.getElementById(id);
					that.headerStack.push(that.idMap[id]);
				}
			}

			if (typeof o === 'object') {
				if (jeeves.isArray(o)) {
					jeeves.each(o, function (id) {
						that.inflate(id);
					});
				} else {
					jeeves.each(o, function (value, id) {
						that.inflate(id);
					});
				}
			} else {
				addIndividual(o);
			}

			sortStack(this.headerStack);
			this.scrollView.onscroll = function () {
				pump(that, that.scrollView);
			};
		},

		// Unsticks the object(s) associated with the id(s)
		// passed in.
		deflate: function (o) {
			var that = this;

			function removeIndividualHeader(h) {
				if (h !== undefined) {
					if (jeeves.hasClass(h, FLOATING_CLASS_NAME)) {
						jeeves.toggleClassName(h, FLOATING_CLASS_NAME);
					}
					if (jeeves.hasClass(h, INFLATION_CLASS_NAME)) {
						jeeves.toggleClassName(h, INFLATION_CLASS_NAME);
					}

					if (that.headerStack.indexOf(h) <= that.currentHeader &&
							that.currentHeader > 0) {
						that.currentHeader -= 1;
					}

					that.headerStack.splice(
						that.headerStack.indexOf(h),
						1
					);
					if (that.headerStack.length === 0 && that.scrollView.onScroll !== null) {
						that.scrollView.onscroll = null;
					}
				}
			}

			function removeEntry(id) {
				if (that.idMap[id] !== undefined) {
					if (jeeves.isArray(that.idMap[id])) {
						jeeves.each(that.idMap[id], function (header) {
							removeIndividualHeader(header);
						});
					} else {
						removeIndividualHeader(that.idMap[id]);
					}

					delete that.idMap[id];
				}
			}

			if (typeof o === 'object') {
				if (jeeves.isArray(o)) {
					jeeves.each(o, function (id) {
						that.deflate(id);
					});
				} else {
					jeeves.each(o, function (value, id) {
						that.deflate(id);
					});
				}
			} else {
				removeEntry(o);
			}
		},

		// Removes the stickiness to all headers in this
		// Balloon instance.
		destroy: function () {
			var that = this;
			jeeves.each(this.idMap, function (header, id) {
				that.deflate(id);
			});
		},

		version: function () {
			return VER;
		}
	};

	root.Balloon = balloon;

	root.Balloon.destroy = function () {
		delete root.Balloon;
	};

}.bind(this)(this.document));
