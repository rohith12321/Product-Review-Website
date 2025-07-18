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
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.text

def get_soup(url):
    html = get_html(url)
    return BeautifulSoup(html, 'html.parser')

def scrape_amazon_details(url):
    soup = get_soup(url)
    reviews, names, ratings = [], [], []

    price_tag = soup.find("span", class_="a-price-whole")
    amazon_price = None
    if price_tag:
        try:
            amazon_price = int(float(price_tag.get_text(strip=True).replace(",", "")))
        except:
            amazon_price = None

    name_tags = soup.find_all("span", class_="a-profile-name")
    for tag in name_tags:
        names.append(tag.get_text())

    review_divs = soup.find_all("div", class_="a-expander-content reviewText review-text-content a-expander-partial-collapse-content")
    for div in review_divs:
        lines = div.get_text().split("\n")
        for line in lines:
            if line.strip():
                reviews.append(line.strip())

    rating_tags = soup.find_all("i", class_="review-rating")
    for tag in rating_tags:
        text = tag.get_text(strip=True)
        try:
            ratings.append(float(text.split()[0]))
        except:
            continue

    avg_rating = None
    avg_tag = soup.find("span", class_="a-icon-alt")
    if avg_tag:
        try:
            avg_rating = float(avg_tag.get_text(strip=True).split()[0])
        except:
            pass

    image_url = None
    img_tag = soup.find("img", id="landingImage")
    if img_tag and img_tag.get("src"):
        image_url = img_tag["src"]

    n = min(len(names), len(reviews), len(ratings))
    scraped_reviews = []
    for i in range(n):
        scraped_reviews.append({
            "username": names[i],
            "review": reviews[i],
            "rating": ratings[i],
            "source": "amazon"
        })

    return scraped_reviews, avg_rating, amazon_price, image_url

# Run the scraper and update DB
if __name__ == "__main__":
    try:
        product_id = sys.argv[1]
        url = sys.argv[2]
    except IndexError:
        print(json.dumps({
            "success": False,
            "message": "Missing product ID or URL"
        }))
        sys.exit(1)

    reviews, avg_rating, price, image_url = scrape_amazon_details(url)

    try:
        client = MongoClient("mongodb+srv://vishal10992021:FJTBWV98N1Gk05dG@cluster0.nchvnmv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client["test"]
        products = db["products"]

        update = {}
        if price is not None:
            update["prices.amazon"] = price
        if image_url:
            update["imageUrl"] = image_url
        if avg_rating:
            update["amazonAvgRating"] = avg_rating

        update_query = {"$set": update}

        if reviews:
            update_query["$push"] = {
                "reviews.amazon": {
                    "$each": [
                        {
                            "username": r["username"],
                            "comment": r["review"],
                            "rating": r["rating"],
                        }
                        for r in reviews
                    ]
                }
            }

        result = products.update_one(
            { "_id": ObjectId(product_id) },
            update_query
        )

        print(json.dumps({
            "success": True,
            "matched": result.matched_count,
            "modified": result.modified_count,
            "price": price,
            "image": image_url,
            "num_reviews": len(reviews)
        }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": f"MongoDB update failed: {str(e)}"
        }))
        sys.exit(1)
    finally:
        client.close()
