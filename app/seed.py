from app import app
from db import db
from models import Article
from datetime import datetime, timezone

def seed_articles():
    db.drop_all()
    db.create_all()

    now_utc = datetime.now(timezone.utc)

    articles = [
        Article(
            slug="panhandle-wind-farm-expansion",
            title="Major Wind Farm Expansion Announced in Oklahoma Panhandle",
            body="""
                Local officials have approved a major expansion of wind energy development
                across the Oklahoma Panhandle. The new project is expected to bring over
                200 construction jobs and increase renewable energy output by 35% over the next five years.

                Farmers leasing land for turbines say the added revenue provides much-needed
                stability in uncertain agricultural markets.
                """,
            author="Panhandle Press",
            published_at=now_utc,
            s3_key="articles/feb/panhandle-wind-farm-expansion/image.jpg",
            s3_thumbnail_key="articles/feb/panhandle-wind-farm-expansion/thumbnail.jpg"
        ),
        Article(
            slug="guymon-downtown-revitalization",
            title="Downtown Guymon Sees Revitalization Efforts",
            body="""
                Small businesses in Guymon are seeing renewed interest as city officials
                launch a downtown revitalization initiative. New grants aim to improve
                storefronts and attract tourism to the historic district.

                Residents hope the changes will bring renewed economic activity to the region.
                """,
            author="High Plains Reporter",
            published_at=now_utc,
            s3_key="articles/feb/guymon-downtown-revitalization/image.jpg",
            s3_thumbnail_key="articles/feb/guymon-downtown-revitalization/thumbnail.jpg"
        ),
        Article(
            slug="panhandle-drought-conditions",
            title="Drought Conditions Persist Across the Panhandle",
            body="""
                Meteorologists report that drought conditions continue to affect much of the
                Oklahoma Panhandle. Ranchers are adjusting herd sizes as water reserves
                remain below seasonal averages.

                State officials are monitoring conditions and may issue additional
                agricultural relief funding later this year.
                """,
            author="Weather Desk",
            published_at=now_utc,
            s3_key="articles/feb/panhandle-drought-conditions/image.jpg",
            s3_thumbnail_key="articles/feb/panhandle-drought-conditions/thumbnail.jpg"
        ),
        Article(
            slug="boise-city-tech-initiative",
            title="Boise City Launches Rural Tech Initiative",
            body="""
                Boise City leaders announced a new rural technology initiative aimed at
                attracting remote workers and small startups to the Oklahoma Panhandle.

                The program includes tax incentives, co-working spaces, and high-speed
                internet infrastructure upgrades.
                """,
            author="Economic Affairs Correspondent",
            published_at=now_utc,
            s3_key="articles/feb/boise-city-tech-initiative/image.jpg",
            s3_thumbnail_key="articles/feb/boise-city-tech-initiative/thumbnail.jpg"
        ),
        Article(
            slug="panhandle-high-school-football",
            title="Panhandle High School Football Season Kicks Off",
            body="""
                Friday night lights return to the Oklahoma Panhandle as high school football
                teams prepare for the new season. Coaches report strong turnout and renewed
                community excitement.

                Local businesses expect increased weekend traffic as families gather
                to support their teams.
                """,
            author="Sports Desk",
            published_at=now_utc,
            s3_key="articles/feb/panhandle-high-school-football/image.jpg",
            s3_thumbnail_key="articles/feb/panhandle-high-school-football/thumbnail.jpg"
        ),
    ]

    db.session.bulk_save_objects(articles)
    db.session.commit()

if __name__ == "__main__":
    with app.app_context():
        seed_articles()
