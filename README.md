# Sitemap Generation Task

## Problem intro

For example a website has a list of products that each have a product title and 
a price. See an example [here](https://webscraper.io/test-sites/e-commerce/static/phones/touch).

To scrape data from this website you would first create a CSS selector that 
finds wrapper elements of each product listing. Then while looping through 
wrapper elements you would extract the title and the price.

Example pseudo code:
```javascript
const results = [];
const wrapperElements = $("div.product-wrapper");
for(const wrapperElement of wrapperElements) {
	const title = $("h1.title", wrapperElement).text();
	const price = $("div.price", wrapperElement).text();

	results.push({title, price});
}
console.log(results);
```

A Web Scraper sitemap encodes this data extractor into something like this:

```json
{
    "id": "wrapper",
    "selector": "div.product-wrapper",
    "children": [
        {
            "id": "title",
            "selector": "h1.title"
        },
        {
            "id": "price",
            "selector": "div.price"
        }
    ]
}
```

## The Task

Create an algorithm that would traverse an HTML document and discover similar 
data element groups that are wrapped by common wrapper elements. The algorithm 
will receive a JSDOM Document object. As a result it must return a list of 
wrapper element lists and similar element lists that are wrapped by respective
wrapper elements.

Implement the solution in `SitemapGenerator.ts`. Create additional files if 
needed. Don't change tests but feel free to add more tests if needed for 
development.

Example result from a webpage that would have a list of products and a list of 
user comments:
```javascript
[
	{
		wrapperElements: [<div class="product-wrapper">, <div class="product-wrapper">],
		elementGroups: [
			[<h1 class="title">, <h1 class="title">],
			[<div class="price">, <div class="price">],
		]
	},
	{
		wrapperElements: [<div class="user-comment">, <div class="user-comment">],
		elementGroups: [
			[<span class="name">, <h1 class="name">],
			[<p class="comment">, <p class="comment">],
		]
	}
]
```
See unit tests for more concrete examples.

Limitations that should simplify the task:
* Only return HTML Element objects. No need to generate CSS selectors.
* Only work with elements that have text `HTMLHelper.hasTextContents`
* Two elements are only similar if their tags and all parent element tags match:
```
  Similar:
  html> body> div > div
  html> body> div > div

  Not similar:
  html> body> div > span
  html> body> div > div

  Not similar:
  html> body> span > div
  html> body> div > div

  Not similar:
  html> body> div > div > div
  html> body> div > div
  ```
* Make sure the code isn't spaghetti. Split the code in smaller logical chunks

## Local Setup
* Tested on NodeJS 18
* `npm install`
* `npm run test`
