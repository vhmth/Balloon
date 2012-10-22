Balloon
=======

Sticky header with no jQuery dependency.

Balloon in action: http://vhiremath4.github.com/Balloon


Inflating
=========

Making your headers sticky is as easy as 3 steps!

1.) Include the balloon.js (or balloon.min.js) and balloon.css files in your template.
    Each header element you wish to make sticky must be encased by
    a div element. For instance:

    <div>
        <div id="header1">This is a header!</div>
    </div>

    <div>
        <a id="header2">This is another thing I want to make sticky!</a>
    </div>

2.) At any point after the window has loaded, instantiate a new instance
    of Balloon:

    var balloonInst = new Balloon();

  When instantiating a Balloon instance, you may optionally pass in
  an object literal with the following format:

    {
        stackHeaders: true/false (defaults to false),

        scrollView:   the scroll view element that owns
                      the sticky header(s) (defaults to window)
    }

  So, if I wanted to stack my headers as I scrolled down in a scrolling
  div of id 'scrollDiv', then I would do the following:

    var balloonInst = new Balloon({
        stackHeaders: true,
        scrollView: document.getElementById('scrollDiv')
    });

  Note that this means each scrolling view/element must have its own
  Balloon instance.

3.) Once you have your Balloon created, make sure you inflate it so
  it sticks to the top. To do this, simply pass in one or more strings
  that represent the id(s) of the header(s) you wish to make sticky.
  Remember to make sure that these elements are all within the same
  scrolling view/element. If you're passing in multiple ids, you may
  pass them in as either an object or array (the values in an object
  literal do not matter, just that the keys are strings that represent
  the id(s) of the header(s) you wish to stick):

    balloonInst.inflate(['header1', 'header2']);

  OR

    balloonInst.inflate({'header1': SOME_VALUE, 'header2': SOME_VALUE});

  OR

    balloonInst.inflate('header1');

So, to recap:

1.) Template:

    <div>
        <div id="header">Header</div>
    </div>

2.) Instantiate:

    var balloonInst = new Balloon();

3.) Inflate:

    balloonInst.inflate('header');


Deflating
=========

To destroy a specific balloon instance (unstick all the headers it
owns), call destroy on it:

    balloonInst.destroy();

This will not actually destroy the instance. It will simply unstick
all headers it owns.

If you wish to unstick one or more headers a balloon instance owns,
call deflate, passing in the id(s) of the header(s) you wish to
unstick:

    balloonInst.deflate('header');

  OR

    balloonInst.deflate(['header1', 'header2']);

  OR

    balloonInst.deflate({'header1': SOME_VALUE, 'header2': SOME_VALUE});

You will notice that Balloon is added to the global scope when the
balloon.js script is included. If you wish to destroy this object,
simply call destroy on it:

    Balloon.destroy();


Known Issues
============

Currently the only known issue with Balloon is its issues on iOS due to
its use of the 'position: fixed' CSS property. The most noticable issue
is that, when a user scrolls down the page, the scroll position is not
updated until the scrolling has ended. This causes a less responsive
experience, and I will be working on either an entirely separate mobile
balloon version or will build on top of Balloon to check if the user agent
is on iOS and then perform some trickery. Until then, I suggest only using
Balloon if you intend for your website to be accessed from a desktop and
do not care if the headers stick immediately on iOS.


Balloon Version
===============

The current version of Balloon is 0.1. However, Balloon may be upgraded
every now and then. To check which version of Balloon you have, call the
version function from the global Balloon object:

    Balloon.version();
