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
        sketchpad.paper().addPlayer(playerid, name, left, top, fieldWidth, fieldHeight, sketchpad);
        // it wasn't possible to add function to sketchpad itself, so
        // we have to pass it as a parameter
    });
    $("#soccerfield").width(fieldWidth).height(fieldHeight);
    $("#loading").hide();
    $("#maindiv").show().center();
    $('#sharelink').click(function (e) {
        var shareurl = "http://maca.adamlazim.com/";
        $("player").each(function(index, player) {
            var name = $(player).attr("name");
            var left = $(player).attr("left");
            var top = $(player).attr("top");
            shareurl += name + ":" + left + "," + top + "|"
        });
        $('#sharebox>input').val(shareurl)
        $('#sharebox').modal();
        return false;
    });
    $('#resetlink').click(function (e) {
        var reseturl = "/-1:110,430|-1:150,430|-1:190,430|-1:230,430|-1:270,430|-1:310,430|-1:350,430|-1:400,430|-1:440,430|-1:480,430|-1:520,430|-1:560,430|-1:600,430|-1:640,430|"
        location.href = reseturl;
        return false;
    });
});

// raphael addons
Raphael.fn.addPlayer = function (playerid, name, x, y, fieldWidth, fieldHeight, sketchpad) {
  var player = {
    "playerid": playerid,
    "name": name,
    "color": (x < (fieldWidth / 2)) ? "red" : "blue",
    "x": x,
    "y": y
  }
  var shirt = this.image("/static/images/" + player.color + "shirt.png", x, y, 25, 20);
  var shirtWidth = 25;
  var shirtHeight = 20;
  var text = $("<div/>").appendTo($("body")).addClass("playername").html(name);
  var textPosition = function(icon) {
    var x = parseInt(icon.getAttribute("x"));
    var y = parseInt(icon.getAttribute("y"));
    x = isNaN(x) ? $(icon).offset().left : x;
    y = isNaN(y) ? $(icon).offset().top : y;
    var newTextPosition = {
      x: x - (($(text).width() - shirtWidth) / 2),
      y: y + shirtHeight + 5
    };
    if (!$.browser.msie) { // if not internet explorer
      newTextPosition.x += $("#maindiv").offset().left;
      newTextPosition.y += $("#maindiv").offset().top;
    }
    return newTextPosition;
  };
  $(text).editInPlace({
      saving_animation_color: "#ECF2F8",
      callback: function(idOfEditor, enteredText, orjinalHTMLContent, settingsParams, animationCallbacks) {
        var newTextPosition = textPosition(shirt.node);
        $(text).offset({"left": newTextPosition.x, "top": newTextPosition.y});
        animationCallbacks.didStartSaving();
        setTimeout(animationCallbacks.didEndSaving, 2000);
        var newname = enteredText;
        var newleft = shirt.attr("x");
        var newtop = shirt.attr("y");
        $('player[name=' + orjinalHTMLContent + ']').attr("name", newname).attr("left", newleft).attr("top", newtop);
        // $.post("/players", {
        //     "playerid": playerid,
        //     "newname": newname,
        //     "newleft": newleft,
        //     "newtop": newtop
        // });
        return enteredText;
      }
    });
  setTimeout(function() {
      var initialTextPosition = textPosition(shirt.node);
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
    var newx = parseInt(this.ox) + dx;
    var newy = parseInt(this.oy) + dy;
    if (newx > fieldWidth) {
      newx = fieldWidth - shirtWidth;
    } else if (newx < 0) {
      newx = 0;
    }
    if (newy > fieldHeight) {
      newy = fieldHeight - (2 * shirtHeight);
    } else if (newy < 0) {
      newy = 0;
    }
    if (newx < (fieldWidth / 2)) {
      player.color = "red";
    } else {
      player.color = "blue";
    }
    shirt.attr("src", "/static/images/" + player.color + "shirt.png");
    dx = newx - this.ox;
    dy = newy - this.oy;
    this.attr({x: newx, y:  newy});
    var newTextPosition = textPosition(shirt.node);
    $(text).offset({"left": newTextPosition.x, "top": newTextPosition.y});
    // console.log("dx:%o, dy:%o, ox: %o, oy: %o, new ox: %o, new oy: %o", dx, dy, this.ox, this.oy, this.attr("x"), this.attr(y));
    var playername = $(text).html()
    $('player[name=' + playername + ']').attr("left", newTextPosition.x).attr("top", newTextPosition.y);
  };
  // var updatePlayerInDb = function() {
  //     var newname = $(text).html();
  //     var newleft = shirt.attr("x");
  //     var newtop = shirt.attr("y");
  //     $('#' + playerid).attr("name", newname).attr("color", player.color).attr("left", newleft).attr("top", newtop);
  //     $.post("/players", {
  //   "playerid": playerid,
  //   "newname": newname,
  //         "newcolor": player.color,
  //         "newleft": newleft,
  //         "newtop": newtop
  //     });
  // }
  var up = function () {
    // restoring state
    this.attr({opacity: 1});
    sketchpad.editing(true);
    // updatePlayerInDb();
  };
  // updatePlayerInDb(); // for color update
  shirt.drag(move, start, up);
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
