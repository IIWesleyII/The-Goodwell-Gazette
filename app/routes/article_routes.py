import os
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, abort, request
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from models import Article

S3_BASE_URL = "https://goodwell-gazette.s3.us-west-1.amazonaws.com"

ARTICLE_ACCESS_TTL_SECONDS = 24 * 60 * 60
ARTICLE_ACCESS_SALT = "article-access-token"

articles_bp = Blueprint("articles", __name__, url_prefix="/api/articles")


def get_access_serializer():
    secret = os.getenv("ARTICLE_ACCESS_SECRET")

    if not secret:
        raise RuntimeError("Missing ARTICLE_ACCESS_SECRET env var")

    return URLSafeTimedSerializer(secret_key=secret)


def create_article_access_token(slug: str):
    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=ARTICLE_ACCESS_TTL_SECONDS
    )

    token = get_access_serializer().dumps(
        {
            "slug": slug,
        },
        salt=ARTICLE_ACCESS_SALT,
    )

    return token, expires_at.isoformat()


def get_bearer_token():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    return auth_header.replace("Bearer ", "", 1).strip()


def has_valid_article_access(slug: str):
    token = get_bearer_token()

    if not token:
        return False

    try:
        payload = get_access_serializer().loads(
            token,
            salt=ARTICLE_ACCESS_SALT,
            max_age=ARTICLE_ACCESS_TTL_SECONDS,
        )
    except SignatureExpired:
        return False
    except BadSignature:
        return False

    return payload.get("slug") == slug


def article_preview(body, max_length=140):
    preview = " ".join(body.split())

    if len(preview) <= max_length:
        return preview

    return f"{preview[:max_length].rsplit(' ', 1)[0]}..."


def serialize_article(article, include_body=False):
    payload = {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "preview": article_preview(article.body),
        "author": article.author,
        "published_at": article.published_at.isoformat(),
        "url": f"/api/articles/{article.slug}",
        "image_url": f"{S3_BASE_URL}/{article.s3_key}",
        "thumbnail_url": f"{S3_BASE_URL}/{article.s3_thumbnail_key}",
        "price": "$0.01",
        "payment_type": "x402",
        "payment_network": "Base Sepolia",
        "payment_token": "USDC",
    }

    if include_body:
        payload["body"] = article.body

    return payload


@articles_bp.route("", methods=["GET"])
def list_articles():
    articles = Article.query.order_by(Article.published_at.desc()).all()

    return jsonify([
        serialize_article(article, include_body=False)
        for article in articles
    ])


@articles_bp.route("/<slug>", methods=["GET"])
def get_article(slug):
    article = Article.query.filter_by(slug=slug).first()

    if article is None:
        abort(404, description="Article not found")

    if not has_valid_article_access(slug):
        return jsonify(
            {
                "error": "Article access token is missing, invalid, or expired.",
                "unlock_url": f"/api/articles/{slug}/unlock",
            }
        ), 401

    return jsonify(serialize_article(article, include_body=True))


@articles_bp.route("/<slug>/unlock", methods=["GET"])
def unlock_article(slug):
    article = Article.query.filter_by(slug=slug).first()

    if article is None:
        abort(404, description="Article not found")

    access_token, expires_at = create_article_access_token(slug)

    return jsonify(
        {
            "article": serialize_article(article, include_body=True),
            "access_token": access_token,
            "expires_at": expires_at,
        }
    )