import {DOMWindow, JSDOM} from "jsdom";

export class HTMLHelper {

	public static createDom(html: string): {
		dom: JSDOM,
		doc: Document,
		win: DOMWindow,
		query: (query: string) => HTMLElement[]
	} {
		const dom = new JSDOM(html, {
			url: "http://localhost/"
		});

		return {
			dom,
			doc: dom.window.document,
			win: dom.window,
			query: HTMLHelper.query.bind(undefined, dom.window.document),
		};
	}

	public static isTextNode(node: Node): boolean {

		return node.nodeType === 3;
	}

	/**
	 * Check whether an HTML element has direct text contents
	 * @param element
	 */
	public static hasTextContents(element: HTMLElement): boolean {

		for (const node of element.childNodes) {

			// text node
			if (HTMLHelper.isTextNode(node)) {
				if (node.textContent.trim().length) {
					return true;
				}
			}
		}

		return false;
	}

	public static query(doc: Document, query: string): HTMLElement[] {

		return [...doc.querySelectorAll(query)] as HTMLElement[];
	}

	public static getElementIndex(node: Node): number {
		let index = 1;
		while (true) {
			node = node.previousSibling;
			if (!node) {
				break;
			}

			if (node.nodeType !== 3) {
				index++;
			}
		}
		return index;
	}

	public static getCssSelector(el: HTMLElement): string {

		const path = [];
		while (el.nodeType === 1) {

			let selector = `${el.nodeName.toLowerCase()}`;
			el.classList.forEach((className) => {
				selector += `.${className}`;
			});
			selector += `:nth-child(${HTMLHelper.getElementIndex(el)})`;

			path.unshift(selector);
			el = el.parentNode as HTMLElement;
		}
		return path.join(" > ");
	}
}