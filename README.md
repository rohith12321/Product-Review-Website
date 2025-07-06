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


Created a MONGODB database which stores information about the products, users and the reviews under each project. 
For now we use a dummy user and dummy product to test if we are able to add reviews and actually view all the user reviews. Made the pathways for the major functionalities using Express.

