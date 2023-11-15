import { IElementGroup } from "./IElementGroup";

export class SitemapGenerator {
    constructor(private doc: Document) {}

    public getGroups(): IElementGroup[] {
        return [];
    }
}
