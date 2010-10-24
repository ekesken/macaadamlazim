#! /usr/bin/env python
import wsgiref.handlers
import urlparse
import StringIO
import logging
import base64
import zlib
import gzip
import re
import traceback
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import urlfetch
from google.appengine.api import memcache
from google.appengine.ext.webapp import template
import os
from player import Player

class MainIndex(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        save = self.request.path[1:]
        savedplayers = []
        logging.debug("count: %d, save: %s" % (len(save.split("%7C")), save))
        if save:
            for savedplayer in save.split("%7C"): #|
                parts = savedplayer.split("%3A") #:
                if len(parts) != 2:
                    logging.debug("break for %s" % (savedplayer))
                    break
                name = parts[0]
                position = parts[1].split("%2C") #,
                if len(position) != 2:
                    logging.debug("break for %s" % (savedplayer))
                    break
                left = position[0]
                top = position[1]
                logging.debug("name: " + name + ", left:" + left + ", top:" + top)
                savedplayers.append({"name": name, "left": left, "top": top})
        # players = [
        #    {"name": "player1", "left": 5, "top": 20, "color": "red"},
        #    {"name": "player2", "left": 5, "top": 70, "color": "red"},
        #    {"name": "player3", "left": 5, "top": 120, "color": "red"},
        #    {"name": "player4", "left": 5, "top": 170, "color": "red"},
        #    {"name": "player5", "left": 5, "top": 220, "color": "red"},
        #    {"name": "player6", "left": 5, "top": 270, "color": "red"},
        #    {"name": "player7", "left": 5, "top": 320, "color": "red"},
        #    {"name": "player1", "left": 750, "top": 20, "color": "blue"},
        #    {"name": "player2", "left": 750, "top": 70, "color": "blue"},
        #    {"name": "player3", "left": 750, "top": 120, "color": "blue"},
        #    {"name": "player4", "left": 750, "top": 170, "color": "blue"},
        #    {"name": "player5", "left": 750, "top": 220, "color": "blue"},
        #    {"name": "player6", "left": 750, "top": 270, "color": "blue"},
        #    {"name": "player7", "left": 750, "top": 320, "color": "blue"}
        # ]
        # for player in players:
        #     newplayer = Player()
        #     newplayer.name = player["name"]
        #     newplayer.left = player["left"]
        #     newplayer.top = player["top"]
        #     newplayer.color = player["color"]
        #     newplayer.put();
        dbplayers = db.GqlQuery("SELECT * FROM Player");
        resttop = 5;
        # TODO: optimize here!
        jsplayers = []
        if len(savedplayers) > 0:
            for player in dbplayers:
                try:
                    savedplayer = savedplayers.pop()
                    newname = savedplayer["name"]
                    if newname != "-1":
                        player.name = newname
                    player.left = int(savedplayer["left"])
                    player.top = int(savedplayer["top"])
                except IndexError:
                    player.left = 750
                    player.top = resttop
                    # print "resting name:%s, left:%d, top:%d" % (player.name, player.left, player.top)
                    resttop += 50;
                jsplayers.append(player)
        else:
            jsplayers = dbplayers
        for player in jsplayers:
            logging.debug("player name:%s, left:%d, top:%d" % (player.name, player.left, player.top))
        values = {
            'players': jsplayers,
        }
        self.response.out.write(template.render(path, values))
        return

def main():
    application = webapp.WSGIApplication([('.*', MainIndex),
                                          ], debug=True)
    wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
    main()
