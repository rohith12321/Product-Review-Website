# Product Review Website

## Overview

This project is a product review/ratings website. It will allow users to view and submit reviews and star ratings, as well as pull ratings data from external sources (Amazon, Flipkart, etc).

## Progress so far

- Initialized GitHub repository and linked it locally.  
- Set up project folder structure:
- `Backend/`
- `Frontend/`

Backend setup:
- Initialized Node.js project in `Backend` -> npm init -y
- Installed Express -> npm install Express
- Created basic server (`index.js`) that listens on port 5000 -> node index.js

Frontend setup:
- Used Vite to start React project in `Frontend` ->  npm create vite@latest
- Installed dependencies -> cd product-review-frontend
- npm install
- Verified that `npm run dev` runs the frontend on localhost

Created a MONGODB containing the users and product, implemented scrapers to scrape from Flipkart and Amazon using research articles and some blogs.
Ismein products add karne h, go to amazon and flipkart and type in any product. Apne DB mein maine ek empty waala product rakha h, usko clone karte jao. Aur fir usmein name, description, product links, type karke dena h. Product link ka format aisa hoga. 
Amazon : https://www.amazon.in/Apple-iPhone-15-Pro-TB/dp/B0CHWWVSLF
Jab tum product ko click karoge toh uske purchase page pe jaega na, waha ke url ka thoda portion lena h, matlab before ref= waala part.

Flipkart:
https://www.flipkart.com/apple-iphone-16-pro-max-white-titanium-512-gb/p/itm9f8d4b52f9a97
again same hi, ? mark se pehle jo bhi tha bas woh lena h ismein
Ab product id copy kar database se apne cloned product jiske liye tune links paste kiye the, aur usko postman se POST request daal.

http://localhost:5000/api/products/687d5af7847c4ee9bdc36af0/fullDetails
Ye 687d5... dikh rha h na uspe apne naye product ka id daal, aur fir request maar, sab update hojaega, prices, reviews.
Aise hi, 30-40 products daal dena including many things, water bottles, tv, cricket bat, ek do aur phones, wagera. Matlab khaali khaali sa na lagna chahiye website.

Fir kya karna h, ye website ko tum run karna apne system se, toh poora load ho jaega. Saare features ek baar dekh lena, thodi styling better karwaana bhai. 

Features I think saare hi covered h, toh frontend, backend code change karne se pehle ek baar bata dena.
Baaki ye ho hi jaega 2-3 ghanto mein i think, maine bhot time spend karli ispe ab man nhi kar rha :(

Khatm kar dena bhai
