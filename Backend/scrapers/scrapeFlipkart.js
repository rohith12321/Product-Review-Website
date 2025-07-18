// const axios = require("axios");
// const cheerio = require("cheerio");

// async function scrapeFlipkart(query) {
//   const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
//   const headers = {
//     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
//   };

//   try {
//     console.log("🔍 Searching Flipkart for:", query);
//     const { data: searchHtml } = await axios.get(searchUrl, { headers });
//     const $ = cheerio.load(searchHtml);

//     const firstProductLink = $("a").filter((i, el) => {
//       const href = $(el).attr("href");
//       return href && href.includes("/p/") && !href.includes("ad/");
//     }).first().attr("href");

//     if (!firstProductLink) {
//       console.log("❌ No product link found on search page");
//       return null;
//     }

//     const productUrl = `https://www.flipkart.com${firstProductLink}`;
//     console.log("✅ Navigating to Flipkart product page:", productUrl);

//     const { data: detailHtml } = await axios.get(productUrl, { headers });
//     const $$ = cheerio.load(detailHtml);

//     const price = $$("._30jeq3").first().text().trim();
//     const image = $$("img._396cs4, img._2r_T1I").first().attr("src");

//     const reviews = [];
//     $$("div._27M-vq").each((_, el) => {
//       const star = $$(el).find("div._3LWZlK").text().trim();
//       const text = $$(el).find("div.t-ZTKy div").text().trim();
//       if (star && text) {
//         reviews.push("★".repeat(Number(star)) + ` "${text}"`);
//       }
//     });

//     console.log("📦 Flipkart Price:", price);
//     console.log("🖼️ Flipkart Image:", image);
//     console.log("📝 Flipkart Reviews Count:", reviews.length);

//     return {
//       price: price || "Not available",
//       image: image?.startsWith("http") ? image : `https:${image}`,
//       buyLink: productUrl,
//       reviews
//     };
//   } catch (err) {
//     console.error("❌ Flipkart scraping failed:", err.message);
//     return null;
//   }
// }

// module.exports = scrapeFlipkart;


const axios = require("axios");
const cheerio = require("cheerio");

async function getFlipkartProductDetails(query) {
  try {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    };

    const searchRes = await axios.get(searchUrl, { headers });
    const $search = cheerio.load(searchRes.data);
    const relativeLink = $search("a._1fQZEK, a.IRpwTa").first().attr("href");

    if (!relativeLink) throw new Error("No product link found on Flipkart.");

    const productUrl = `https://www.flipkart.com${relativeLink}`;

    const productRes = await axios.get(productUrl, { headers });
    const $ = cheerio.load(productRes.data);

    const name = $("span.B_NuCI").first().text().trim();
    const image = $("img._396cs4").first().attr("src");
    const reviews = [];

    $("div._27M-vq").each((_, el) => {
      const rating = $(el).find("div._3LWZlK").first().text().trim();
      const body = $(el).find("div.t-ZTKy div").first().text().trim();
      if (rating && body) {
        reviews.push("★".repeat(Math.round(parseFloat(rating))) + ` "${body}"`);
      }
    });

    return {
      name,
      image,
      buyLink: productUrl,
      reviews
    };
  } catch (err) {
    console.error("Flipkart error:", err.message);
    return { error: "Flipkart scraping failed." };
  }
}

module.exports = getFlipkartProductDetails;
