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
from google.appengine.ext.db import Key
import os
import array
from player import Player

class MainPlayers(webapp.RequestHandler):
    def get(self):
        self.post()
        # self.response.out.write("get method is not supported!")

    def post(self):
        try:
            playerid = self.request.get('playerid')
            newname = self.request.get('newname')
            newleft = int(self.request.get('newleft'))
            newtop = int(self.request.get('newtop'))
            if playerid is None or newname is None or len(newname) == 0:
                raise
            players = db.GqlQuery("SELECT * FROM Player WHERE __key__=:id", id=Key(playerid));
            playerToModify = players[0];
            # self.response.out.write("got player =>" + playerToModify.name)
            playerToModify.name = newname[0:15]
            playerToModify.left = newleft
            playerToModify.top = newtop
            playerToModify.put()
            self.response.out.write("ok")
        except:
            self.response.out.write("nok")
        return

def main():
    application = webapp.WSGIApplication([('.*', MainPlayers),
                                          ], debug=True)
    wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
    main()
