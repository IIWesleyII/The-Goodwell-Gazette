from db import db
from datetime import datetime

class Article(db.Model):
    __tablename__ = "articles"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=True)
    published_at = db.Column(db.DateTime, default=datetime.utcnow)
    s3_key = db.Column(db.String(512), nullable=False)
    s3_thumbnail_key = db.Column(db.String(512), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "body": self.body,
            "author": self.author,
            "published_at": self.published_at.isoformat(),
            "s3_key": self.s3_key,
            "s3_thumbnail_key": self.s3_thumbnail_key
        }