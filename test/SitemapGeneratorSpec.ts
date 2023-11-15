import {expect} from "chai";
import {HTMLHelper} from "../src/HTMLHelper";
import {IElementGroup} from "../src/IElementGroup";
import * as fs from "fs";
import {SitemapGenerator} from "../src/SitemapGenerator";

const serializeHTMLElementList = (elements: HTMLElement[]): string[] => {
	return elements.map(HTMLHelper.getCssSelector).sort()
}

const serializeHTMLElementListJSON = (elements: HTMLElement[]): string => {
	return JSON.stringify(serializeHTMLElementList(elements));
}

const elementGroupsToSelectorGroups = (elementGroups: IElementGroup[]): object => {

	return elementGroups.map((elementGroup) => {

		const wrapperElements = serializeHTMLElementList(elementGroup.wrapperElements);
		const elementGroups = elementGroup.elementGroups.map(elementList => serializeHTMLElementList(elementList)).sort((a, b) => {
			return JSON.stringify(a).localeCompare(JSON.stringify(b));
		});

		return {
			wrapperElements,
			elementGroups,
		}
	});
}

const randomStr = (): string => {
	return Math.random().toString(36).substring(7);
}

describe("Sitemap Generator", () => {

	it("should find groups", () => {

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				<div class="group">
					<span class="title">AAA</span>
					<span class="price">1</span>
				</div>
				<div class="group">
					<span class="title">BBB</span>
					<span class="price">2</span>
				</div>
				<div class="group">
					<span class="title">CCC</span>
					<span class="price">3</span>
				</div>
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query("div.group"),
				elementGroups: [
					query("span.title"),
					query("span.price"),
				]
			}
		]));
	});

	it("should find groups in rows", () => {

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				<div class="row">
					<div class="group">
						<span class="title">AAA</span>
						<span class="price">1</span>
					</div>
					<div class="group">
						<span class="title">BBB</span>
						<span class="price">2</span>
					</div>			
				</div>
				<div class="row">
					<div class="group">
						<span class="title">CCC</span>
						<span class="price">3</span>
					</div>
					<div class="group">
						<span class="title">DDD</span>
						<span class="price">4</span>
					</div>			
				</div>
				<div class="row">
					<div class="group">
						<span class="title">CCC</span>
						<span class="price">3</span>
					</div>
					<div class="group">
						<span class="title">DDD</span>
						<span class="price">4</span>
					</div>			
				</div>
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query("div.group"),
				elementGroups: [
					query("span.title"),
					query("span.price"),
				]
			}
		]));
	});

	it("should find groups when group inside is split up with extra classes", () => {

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				<div class="group a">
					<div class="row b">
						<span class="title c">AAA</span>
					</div>
					<div class="row d">
						<span class="price e">1</span>
					</div>
				</div>
				<div class="group f">
					<div class="row g">
						<span class="title h a">BBB</span>
					</div>
					<div class="row i">
						<span class="price j">2</span>
					</div>
				</div>
				<div class="group k">
					<div class="row l">
						<span class="title m b">CCC</span>
					</div>
					<div class="row n">
						<span class="price o">3</span>
					</div>
				</div>
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query("div.group"),
				elementGroups: [
					query("span.title"),
					query("span.price"),
				]
			}
		]));
	});

	it("should find groups in group that have additional group (X-zibit)", () => {

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				<div class="group">
					<div class="group">
						<div class="group">
							<span class="title">AAA</span>
						</div>
						<div class="group">
							<span class="price">1</span>
						</div>
					</div>
					<div class="group">
						<div class="group">
							<span class="title">BBB</span>
						</div>
						<div class="group">
							<span class="price">2</span>
						</div>
					</div>
				</div>
				<div class="group">
					<div class="group">
						<div class="group">
							<span class="title">CCC</span>
						</div>
						<div class="group">
							<span class="price">3</span>
						</div>
					</div>
					<div class="group">
						<div class="group">
							<span class="title">DDD</span>
						</div>
						<div class="group">
							<span class="price">4</span>
						</div>
					</div>
				</div>
				<div class="group">
					<div class="group">
						<div class="group">
							<span class="title">CCC</span>
						</div>
						<div class="group">
							<span class="price">3</span>
						</div>
					</div>
					<div class="group">
						<div class="group">
							<span class="title">DDD</span>
						</div>
						<div class="group">
							<span class="price">4</span>
						</div>
					</div>
				</div>
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query("body > div.group > div.group"),
				elementGroups: [
					query("span.title"),
					query("span.price"),
				]
			}
		]));
	});

	it("should find groups when additional wrapper elements exist", () => {

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				<div id="main">
					<div class="icon"></div>
					<div class="group">
						<div class="product">
							<div class="icon"></div>
							<span class="title">AAA</span>
							<div class="price"><span>1</span><span class="usd"></span></div>
							<span class="rating"></span>
						</div>
					</div>
					<div class="icon"></div>
					<div class="group">
						<div class="product">
							<div class="icon"></div>
							<span class="title">AAA</span>
							<div class="price"><span>1</span><span class="usd"></span></div>
							<span class="rating"></span>
						</div>
					</div>
					<div class="icon"></div>
					<div class="group">
						<div class="product">
							<div class="icon"></div>
							<span class="title">AAA</span>
							<div class="price"><span>1</span><span class="usd"></span></div>
							<span class="rating"></span>
						</div>
					</div>
				</div>
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query("div.group"),
				elementGroups: [
					query("span.title"),
					query(".price span:nth-child(1)"),
				]
			}
		]));
	});

	it("should find groups when an element is missing", () => {

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				<div class="group">
					<span class="title">AAA</span>
					<span class="price">1</span>
				</div>
				<div class="group">
					<span class="title">BBB</span>
					<span class="price">2</span>
				</div>
				<div class="group">
					<span class="title">CCC</span>
					<!-- price has been replaced by discount price. We only care for price since it is more common -->
					<span class="discount-price">3</span>
					<span class="icon">3</span>
				</div>
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query("div.group"),
				elementGroups: [
					query("span.title"),
					query("span.price"),
				]
			}
		]));
	});

	it("should not find anything common here", () => {

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				<div class="row">
					<span class="title">page-title</span>
				</div>
				<div class="row">
					<div class="group">
						<span class="title">CCC</span>
						<span class="discount-price">3</span>
						<span class="icon">3</span>
					</div>
				</div>
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([]));
	});


	it("should find multiple groups", () => {

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				
				<div class="product">
					<span class="title">AAA</span>
					<span class="price">1</span>
				</div>
				<div class="product">
					<span class="title">BBB</span>
					<span class="price">2</span>
				</div>
				<div class="product">
					<span class="title">CCC</span>
					<span class="price">3</span>
				</div>
				
				<!-- start of a new group - People also bought-->
				<div class="also-bought">
					<span class="title">AAA</span>
					<span class="price">3</span>		
				</div>
				<div class="also-bought">
					<span class="title">BBB</span>
					<span class="price">3</span>		
				</div>
				<div class="also-bought">
					<span class="title">CCC</span>
					<span class="price">3</span>		
				</div>
			
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query("div.product"),
				elementGroups: [
					query("div.product span.title"),
					query("div.product span.price"),
				]
			},
			{
				wrapperElements: query("div.also-bought"),
				elementGroups: [
					query("div.also-bought span.title"),
					query("div.also-bought span.price"),
				]
			}
		]));
	});

	it("should generate groups from a real world HTML", () => {

		const html = fs.readFileSync(__dirname+"/webscraper.io-test-site.html").toString();
		const {doc, query} = HTMLHelper.createDom(html)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		// only checking whether the main element group is found
		const searchWrapperGroup = query("div.col-sm-4");

		let group: IElementGroup;
		for(const foundGroup of groups) {
			if(serializeHTMLElementListJSON(foundGroup.wrapperElements) === serializeHTMLElementListJSON(searchWrapperGroup)) {
				group = foundGroup;

			}
		}

		expect(elementGroupsToSelectorGroups([group!])).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query("div.col-sm-4"),
				elementGroups: [
					query("div.col-sm-4 a.title"),
					query("div.col-sm-4 h4.price"),
					query("div.col-sm-4 p.description"),
					query("div.col-sm-4 div.ratings p.pull-right"),
				]
			},
		]));
	});

	it("should find groups with any classname", () => {

		const groupClassName = `g${randomStr()}`
		const titleClassName = `t${randomStr()}`
		const priceClassName = `p${randomStr()}`

		const {doc, query} = HTMLHelper.createDom(`<html>
			<body>
				<div class="${groupClassName}">
					<span class="${titleClassName}">AAA</span>
					<span class="${priceClassName}">1</span>
				</div>
				<div class="${groupClassName}">
					<span class="${titleClassName}">BBB</span>
					<span class="${priceClassName}">2</span>
				</div>
				<div class="${groupClassName}">
					<span class="${titleClassName}">CCC</span>
					<span class="${priceClassName}">3</span>
				</div>
			</body>
		</html>`)

		const sitemapGenerator = new SitemapGenerator(doc);
		const groups = sitemapGenerator.getGroups();

		expect(elementGroupsToSelectorGroups(groups)).to.deep.equal(elementGroupsToSelectorGroups([
			{
				wrapperElements: query(`div.${groupClassName}`),
				elementGroups: [
					query(`span.${titleClassName}`),
					query(`span.${priceClassName}`),
				]
			}
		]));
	});
});
