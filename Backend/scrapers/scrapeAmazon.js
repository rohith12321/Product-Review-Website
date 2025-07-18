// const axios = require("axios");
// const cheerio = require("cheerio");

// async function scrapeAmazon(query) {
//   const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
//   const headers = {
//     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
//   };

//   try {
//     console.log("🔍 Searching Amazon for:", query);
//     const { data: searchHtml } = await axios.get(searchUrl, { headers });
//     const $ = cheerio.load(searchHtml);

//     const firstLink = $("a.a-link-normal.s-no-outline").first().attr("href");

//     if (!firstLink) {
//       console.log("❌ No product link found on search page");
//       return null;
//     }

//     const productUrl = `https://www.amazon.in${firstLink}`;
//     console.log("✅ Navigating to Amazon product page:", productUrl);

//     const { data: detailHtml } = await axios.get(productUrl, { headers });
//     const $$ = cheerio.load(detailHtml);

//     const price =
//       $$("span.a-price-whole").first().text().trim() ||
//       $$("span.a-offscreen").first().text().trim();

//     const image = $$("img#landingImage").attr("src");

//     const reviews = [];
//     $$("div[data-hook='review']").each((_, el) => {
//       const star = $$(el).find("i[data-hook='review-star-rating'] span").text().trim().charAt(0);
//       const text = $$(el).find("span[data-hook='review-body']").text().trim();
//       if (star && text) {
//         reviews.push("★".repeat(Number(star)) + ` "${text}"`);
//       }
//     });

//     console.log("📦 Amazon Price:", price);
//     console.log("🖼️ Amazon Image:", image);
//     console.log("📝 Amazon Reviews Count:", reviews.length);

//     return {
//       price: price || "Not available",
//       image,
//       buyLink: productUrl,
//       reviews
//     };
//   } catch (err) {
//     console.error("❌ Amazon scraping failed:", err.message);
//     return null;
//   }
// }

// module.exports = scrapeAmazon;


const axios = require("axios");
const cheerio = require("cheerio");

async function getAmazonProductDetails(query) {
  try {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "en-US,en;q=0.9"
    };

    // Step 1: Get product link from search page
    const searchRes = await axios.get(searchUrl, { headers });
    const $search = cheerio.load(searchRes.data);

    let productLink = null;
    $search("a.a-link-normal.s-no-outline").each((_, el) => {
      const href = $search(el).attr("href");
      if (href && href.includes("/dp/")) {
        productLink = "https://www.amazon.in" + href;
        return false; // break loop
      }
    });

    if (!productLink) throw new Error("No product link found on Amazon.");

    // Step 2: Scrape product details from product page
    const productRes = await axios.get(productLink, { headers });
    const $ = cheerio.load(productRes.data);

    const name = $("#productTitle").text().trim();
    const image = $("#imgTagWrapperId img").attr("src") || $("img[data-old-hires]").attr("src");
    const reviews = [];

    $("div[data-hook='review']").each((_, el) => {
      const ratingText = $(el).find("i[data-hook='review-star-rating'] span").text().trim();
      const rating = parseFloat(ratingText);
      const body = $(el).find("span[data-hook='review-body'] span").text().trim();
      if (!isNaN(rating) && body) {
        reviews.push("★".repeat(Math.round(rating)) + ` "${body}"`);
      }
    });

    return {
      name,
      image,
      buyLink: productLink,
      reviews
    };
  } catch (err) {
    console.error("Amazon error:", err.message);
    return { error: "Amazon scraping failed." };
  }
}

module.exports = getAmazonProductDetails;
