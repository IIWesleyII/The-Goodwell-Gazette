import os
import sys
from dotenv import load_dotenv
from eth_account import Account

from x402 import x402ClientSync
from x402.http import x402HTTPClientSync
from x402.http.clients import x402_requests
from x402.mechanisms.evm import EthAccountSigner
from x402.mechanisms.evm.exact.register import register_exact_evm_client


load_dotenv()


ARTICLE_URL = "http://localhost:5000/api/articles/guymon-downtown-revitalization"

def main():
    private_key = os.getenv("BUYER_PRIVATE_KEY")

    if not private_key:
        raise RuntimeError("Missing EVM_PRIVATE_KEY env var")

    account = Account.from_key(private_key)

    print("Mock agent wallet:", account.address)
    print("Requesting paid article:", ARTICLE_URL)

    client = x402ClientSync()
    signer = EthAccountSigner(account)

    register_exact_evm_client(client, signer)

    http_client = x402HTTPClientSync(client)

    with x402_requests(client) as session:
        response = session.get(ARTICLE_URL)

        print("Final status:", response.status_code)

        if response.status_code == 402:
            print("Still got 402. Payment was not completed.")
            print(response.text)
            sys.exit(1)

        if not response.ok:
            print("Request failed:")
            print(response.text)
            sys.exit(1)

        article = response.json()

        print("\nPaid article received:")
        print("Title:", article.get("title"))
        print("Author:", article.get("author"))
        print("Published:", article.get("published_at"))
        print("\nBody:")
        print(article.get("body"))

        settle_response = http_client.get_payment_settle_response(
            lambda name: response.headers.get(name)
        )

        if settle_response:
            print("\nPayment settled:")
            print(settle_response)
        else:
            print("\nNo payment settlement header found.")


if __name__ == "__main__":
    main()

