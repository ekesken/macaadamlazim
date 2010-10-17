$(window).load(function() {
    var fieldWidth = 780;
    var fieldHeight = 496;
    var sketchpad = Raphael.sketchpad("soccerfield", {
        width: fieldWidth,
        height: fieldHeight
      });
    sketchpad.pen().color("#FFFF00");
    $("player").each(function(index, player) {
        var playerid = $(player).attr("id");
        var name = $(player).attr("name");
        var left = $(player).attr("left");
        var top = $(player).attr("top");
        var color = $(player).attr("color");
        sketchpad.paper().addPlayer(playerid, name, left, top, color, sketchpad);
        // it wasn't possible to add function to sketchpad itself, so
        // we have to pass it as a parameter
    });
    $("#soccerfield").width(fieldWidth).height(fieldHeight);
    $("#loading").hide();
    $("#maindiv").show().center();

});

// raphael addons
Raphael.fn.addPlayer = function (playerid, name, x, y, color, sketchpad) {
  var image = this.image("/static/images/" + color + "shirt.png", x, y, 25, 20);
  var text = $("<div/>").appendTo($("body")).addClass("playername").html(name);
  var textPosition = function(icon) {
    return {
      x: $(icon).offset().left - (($(text).width() - 25) / 2),
      y: $(icon).offset().top + 25
    };
  };
  $(text).editInPlace({
      saving_animation_color: "#ECF2F8",
      callback: function(idOfEditor, enteredText, orinalHTMLContent, settingsParams, animationCallbacks) {
        var newTextPosition = textPosition(image.node);
        $(text).offset({"left": newTextPosition.x, "top": newTextPosition.y});
        animationCallbacks.didStartSaving();
        setTimeout(animationCallbacks.didEndSaving, 2000);
        $.post("/players", {
            "playerid": playerid,
            "newname": enteredText,
            "newleft": image.attr("x"),
            "newtop": image.attr("y")
        });
        return enteredText;
      }
    });
  setTimeout(function() {
      var initialTextPosition = textPosition(image.node);
      // console.log("initialTextPosition: %o", initialTextPosition);
      $(text).offset({"left": initialTextPosition.x, "top": initialTextPosition.y});
    }, 100);
  var start = function () {
    sketchpad.editing(false);
    // storing original coordinates
    this.ox = this.attr("x");
    this.oy = this.attr("y");
    var newTextPosition = textPosition(this.node);
    // console.log("newTextPosition: %o", newTextPosition);
    this.otx = newTextPosition.x;
    this.oty = newTextPosition.y;
    this.attr({opacity: .5});
  };
  var move = function (dx, dy) {
    $(text).offset( { "left": (this.otx + dx), "top": (this.oty + dy) } );
    this.attr({x: parseInt(this.ox) + dx, y:  parseInt(this.oy) + dy});
    // console.log("dx:%o, dy:%o, ox: %o, oy: %o, new ox: %o, new oy: %o", dx, dy, this.ox, this.oy, this.attr("x"), this.attr(y));
  };
  var up = function () {
    // restoring state
    this.attr({opacity: 1});
    sketchpad.editing(true);
    $.post("/players", {
        "playerid": playerid,
        "newname": $(text).html(),
        "newleft": image.attr("x"),
        "newtop": image.attr("y")
    });
  };
  image.drag(move, start, up);
};

// jquery addons
(function($){
  $.fn.extend({
      center: function (options) {
        var options =  $.extend({ // Default values
            inside:window, // element, center into window
            transition: 0, // millisecond, transition time
            minX:0, // pixel, minimum left element value
            minY:0, // pixel, minimum top element value
            withScrolling:true, // booleen, take care of the scrollbar (scrollTop)
            vertical:true, // booleen, center vertical
            horizontal:true // booleen, center horizontal
          }, options);
        return this.each(function() {
            var props = {position:'absolute'};
            if (options.vertical) {
              var top = ($(options.inside).height() - $(this).outerHeight()) / 2;
              if (options.withScrolling) top += $(options.inside).scrollTop() || 0;
              top = (top > options.minY ? top : options.minY);
              $.extend(props, {top: top+'px'});
            }
            if (options.horizontal) {
              var left = ($(options.inside).width() - $(this).outerWidth()) / 2;
              if (options.withScrolling) left += $(options.inside).scrollLeft() || 0;
              left = (left > options.minX ? left : options.minX);
              $.extend(props, {left: left+'px'});
            }
            if (options.transition > 0) $(this).animate(props, options.transition);
            else $(this).css(props);
            return $(this);
          });
      }
    });
})(jQuery);
