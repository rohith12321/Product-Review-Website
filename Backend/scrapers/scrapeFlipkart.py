import sys
import json
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from bson import ObjectId

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/90.0.4430.212 Safari/537.36'
    ),
    'Accept-Language': 'en-US,en;q=0.5'
}

def get_html(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"[Flipkart] Error fetching URL: {e}", file=sys.stderr)
        return None

def get_soup(url):
    html = get_html(url)
    return BeautifulSoup(html, 'html.parser') if html else None

def scrape_flipkart_details(url):
    soup = get_soup(url)
    if not soup:
        return [], None, None

    names, reviews, ratings = [], [], []

    for tag in soup.find_all("p", class_="_2NsDsF AwS1CA"):
        text = tag.get_text(strip=True)
        if text:
            names.append(text)

    for tag in soup.find_all("div", class_="ZmyHeo"):
        text = tag.get_text(strip=True).replace("READ MORE", "").strip()
        if text:
            reviews.append(text)

    rating_tags = soup.find_all("div", class_="XQDdHH Ga3i8K") or soup.find_all("div", class_="Rza2QY")
    for tag in rating_tags:
        try:
            ratings.append(float(tag.get_text(strip=True)))
        except:
            continue

    avg_rating = None
    avg_tag = soup.find("div", class_="ipqd2A")
    if avg_tag:
        try:
            avg_rating = float(avg_tag.get_text(strip=True))
        except:
            pass

    flipkart_price = None
    price_tag = soup.select_one("div.Nx9bqj.CxhGGd")
    if price_tag:
        try:
            price_text = price_tag.get_text(strip=True).replace("₹", "").replace(",", "")
            flipkart_price = int(float(price_text))
        except Exception as e:
            print(f"[Flipkart] Failed to parse price: {e}", file=sys.stderr)

    n = min(len(names), len(reviews), len(ratings))
    scraped_reviews = []
    for i in range(n):
        scraped_reviews.append({
            "username": names[i],
            "review": reviews[i],
            "rating": ratings[i],
            "source": "flipkart"
        })

    return scraped_reviews, avg_rating, flipkart_price


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "message": "Usage: python script.py <product_id> <flipkart_url>"
        }))
        sys.exit(1)

    product_id, url = sys.argv[1], sys.argv[2]
    reviews, avg_rating, price = scrape_flipkart_details(url)

    try:
        client = MongoClient("mongodb+srv://vishal10992021:FJTBWV98N1Gk05dG@cluster0.nchvnmv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client["test"]
        collection = db["products"]

        update_query = {
            "$set": {},
        }

        if price is not None:
            update_query["$set"]["prices.flipkart"] = price
        if avg_rating is not None:
            update_query["$set"]["flipkartAvgRating"] = avg_rating
        if reviews:
            update_query["$push"] = {
                "reviews.flipkart": {
                    "$each": [
                        {
                            "username": r["username"],
                            "comment": r["review"],
                            "rating": r["rating"]
                        } for r in reviews
                    ]
                }
            }

        collection.update_one({ "_id": ObjectId(product_id) }, update_query)

        print(json.dumps({
            "success": True,
            "price": price,
            "avg_rating": avg_rating,
            "review_count": len(reviews)
        }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": f"MongoDB update failed: {str(e)}"
        }))
        sys.exit(1)
    finally:
        client.close()
