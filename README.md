Balloon
=======

Sticky header with no jQuery dependency. Pull from the repo and load example.html
into your browser to see Balloon in action.


Inflating
=========

Making your headers sticky is as easy as 3 steps!

1.) Include the balloon.js and balloon.css files in your template.
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
  pass them in as either an object or array:

    balloonInst.inflate(['header1', 'header2']);

  OR

    balloonInst.inflate({'header1', 'header2'});

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

To destroy a specific balloon instance (and therefore unstick all
the headers it owns), call destroy:

    balloonInst.destroy();

This will not actually destroy the instance. It will simply unsticky
all headers it owns.

If you wish to unstick one or more headers a balloon instance owns
(but keep the balloon instance alive), call deflate with the id(s)
of the header(s) you wish to unstick:

    balloonInst.deflate('header');

            OR

    balloonInst.deflate(['header1', 'header2']);

            OR

    balloonInst.deflate({'header1', 'header2'});

You will notice that Balloon is added to the global scope when the
balloon.js script is included. If you wish to destroy this object,
simply call destroy on it:

    Balloon.destroy();
