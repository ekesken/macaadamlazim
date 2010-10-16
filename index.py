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


class MainIndex(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        redplayers = range(1, 7)
        blueplayers = range(1, 7)
        values = {
            'redplayers': redplayers,
            'blueplayers': blueplayers
        }
        self.response.out.write(template.render(path, values))
        return

def main():
    application = webapp.WSGIApplication([('.*', MainIndex),
                                          ], debug=True)
    wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
    main()
