from google.appengine.ext import db

class Player(db.Model):
  name = db.StringProperty()
  left = db.IntegerProperty()
  top = db.IntegerProperty()
  color = db.StringProperty()

  def __init__(self, name, left, top, color):
      self.name = name
      self.left = left
      self.top = top
      self.color = color

