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
#         players = [
#            {"name": "player1", "left": 5, "top": 20, "color": "red"},
#            {"name": "player2", "left": 5, "top": 70, "color": "red"},
#            {"name": "player3", "left": 5, "top": 120, "color": "red"},
#            {"name": "player4", "left": 5, "top": 170, "color": "red"},
#            {"name": "player5", "left": 5, "top": 220, "color": "red"},
#            {"name": "player6", "left": 5, "top": 270, "color": "red"},
#            {"name": "player7", "left": 5, "top": 320, "color": "red"},
#            {"name": "player1", "left": 750, "top": 20, "color": "blue"},
#            {"name": "player2", "left": 750, "top": 70, "color": "blue"},
#            {"name": "player3", "left": 750, "top": 120, "color": "blue"},
#            {"name": "player4", "left": 750, "top": 170, "color": "blue"},
#            {"name": "player5", "left": 750, "top": 220, "color": "blue"},
#            {"name": "player6", "left": 750, "top": 270, "color": "blue"},
#            {"name": "player7", "left": 750, "top": 320, "color": "blue"}
#         ]
        players = db.GqlQuery("SELECT * FROM Player");
        values = {
            'players': players,
        }
        self.response.out.write(template.render(path, values))
        return

def main():
    application = webapp.WSGIApplication([('.*', MainIndex),
                                          ], debug=True)
    wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
    main()
