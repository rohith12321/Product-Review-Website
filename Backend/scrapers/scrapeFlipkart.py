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
        print(f"Error fetching URL: {e}", file=sys.stderr)
        return None

def get_soup(url):
    html = get_html(url)
    if html:
        return BeautifulSoup(html, 'html.parser')
    return None

def scrape_flipkart_details(url):
    soup = get_soup(url)
    if not soup:
        return [], None, None

    names, reviews, ratings = [], [], []

    for tag in soup.find_all("p", class_="_2NsDsF AwS1CA"):
        text = tag.get_text(strip=True)
        if text: names.append(text)

    for tag in soup.find_all("div", class_="ZmyHeo"):
        text = tag.get_text(strip=True)
        if text:
            clean_text = text.replace("READ MORE", "").strip()
            if clean_text:
                reviews.append(clean_text)



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
    price_tag = soup.find("div", class_="Nx9bqj CxhGGd")
    if price_tag:
        try:
            price_text = price_tag.get_text(strip=True).replace("₹", "").replace(",", "")
            flipkart_price = int(price_text)
        except:
            pass

    n = min(len(names), len(reviews), len(ratings))
    scraped_reviews = []
    for i in range(n):
        scraped_reviews.append({
            "username": names[i],
            "review": reviews[i],
            "rating": ratings[i]
        })

    return scraped_reviews, avg_rating, flipkart_price


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"success": False, "message": "Usage: python script.py <product_id> <flipkart_url>"}))
        sys.exit(1)

    product_id, url = sys.argv[1], sys.argv[2]
    soup = get_soup(url)
    if not soup:
        print(json.dumps({"success": False, "message": "Failed to load page"}))
        sys.exit(1)

    reviews, avg_rating, price = scrape_flipkart_details(url)

    if not reviews:
        print(json.dumps({
            "success": False,
            "message": "No reviews scraped"
        }))
        sys.exit(0)

    try:
        client = MongoClient("mongodb+srv://vishal10992021:FJTBWV98N1Gk05dG@cluster0.nchvnmv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client["test"]
        collection = db["products"]

        update_data = {
            "$push": {"reviews.flipkart": {"$each": reviews}},
            "$set": {}
        }

        if avg_rating is not None:
            update_data["$set"]["flipkartAvgRating"] = avg_rating
        if price is not None:
            update_data["$set"]["prices.flipkart"] = price 

        result = collection.update_one({"_id": ObjectId(product_id)}, update_data)

        print(f"Inserted {len(reviews)} reviews, avg rating {avg_rating}, and price ₹{price} into product {product_id}.")
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
