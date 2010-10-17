from google.appengine.ext import db

class Player(db.Model):
  name = db.StringProperty()
  left = db.IntegerProperty()
  top = db.IntegerProperty()
  color = db.StringProperty()
