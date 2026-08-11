import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from db import db
from routes.article_routes import articles_bp

from x402.http import FacilitatorConfig, HTTPFacilitatorClientSync, PaymentOption
from x402.http.middleware.flask import payment_middleware
from x402.http.types import RouteConfig
from x402.mechanisms.evm.exact import ExactEvmServerScheme
from x402.schemas import Network
from x402.server import x402ResourceServerSync

load_dotenv()


def create_app():
    app = Flask(__name__)

    CORS(
        app,
        origins=[
            "http://localhost:5173",
            "http://goodwellgazette.test:5173",
        ],
    )

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///articles.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    evm_address = os.getenv("X402_RECEIVE_ADDRESS")
    if not evm_address:
        raise RuntimeError("Missing X402_RECEIVE_ADDRESS env var")

    EVM_NETWORK: Network = "eip155:84532"

    facilitator = HTTPFacilitatorClientSync(
        FacilitatorConfig(url="https://x402.org/facilitator")
    )

    server = x402ResourceServerSync(facilitator)
    server.register(EVM_NETWORK, ExactEvmServerScheme())

    routes: dict[str, RouteConfig] = {
        "GET /api/articles/:slug/unlock": RouteConfig(
            accepts=[
                PaymentOption(
                    scheme="exact",
                    pay_to=evm_address,
                    price="$0.01",
                    network=EVM_NETWORK,
                )
            ],
            mime_type="application/json",
            description="Unlock paid article for 24 hours",
        )
    }

    payment_middleware(app, routes=routes, server=server)

    app.register_blueprint(articles_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
