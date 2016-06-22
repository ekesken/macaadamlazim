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
        players = []
        if save:
            team_count = len(save.split("%7C")) / 2
            logging.info("team count: %s, save: %s", team_count, save)
            for i, player in enumerate(save.split("%7C"), 1): #|
                if player == "":
                    continue
                name, position = self.unserialize_player(player)
                left = int(float(position[0])) # on iphone position may come as float number
                top = int(float(position[1]))
                color = "red" if i <= team_count else "blue"
                players.append({"name": name, "left": left, "top": top, "color": color})
        else:
            players = [
               {"name": "player1", "left": 100, "top": 150, "color": "red"},
               {"name": "player2", "left": 100, "top": 300, "color": "red"},
               {"name": "player3", "left": 200, "top": 50, "color": "red"},
               {"name": "player4", "left": 200, "top": 220, "color": "red"},
               {"name": "player5", "left": 200, "top": 400, "color": "red"},
               {"name": "player6", "left": 325, "top": 125, "color": "red"},
               {"name": "player7", "left": 325, "top": 325, "color": "red"},
               {"name": "player8", "left": 650, "top": 150, "color": "blue"},
               {"name": "player9", "left": 650, "top": 300, "color": "blue"},
               {"name": "player10", "left": 550, "top": 50, "color": "blue"},
               {"name": "player11", "left": 550, "top": 220, "color": "blue"},
               {"name": "player12", "left": 550, "top": 400, "color": "blue"},
               {"name": "player13", "left": 425, "top": 125, "color": "blue"},
               {"name": "player14", "left": 425, "top": 325, "color": "blue"}
            ]
        values = {
            'players': [Player(**p) for p in players],
        }
        self.response.out.write(str(template.render(path, values).encode('utf-8')))
        return

    @staticmethod
    def unserialize_player(player):
        parts = player.split("%3A") #:
        if len(parts) != 2:
            parts = player.split(":")
            if len(parts) != 2:
               logging.info("could not unserialize player %s" % (player))
               parts = ["-", "5,20"]
        name = parts[0]
        if name == '-1':
            name = 'player'
        position = parts[1].split("%2C") #,
        if len(position) != 2:
            position = parts[1].split(",")
            if len(position) != 2:
                logging.info("could not uneserialize player position %s" % (player))
                position = [5, 20]
        return name, position


def main():
    application = webapp.WSGIApplication([('.*', MainIndex),
                                          ], debug=True)
    wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
    main()
