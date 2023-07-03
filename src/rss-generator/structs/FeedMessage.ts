import { Feed } from "./Feed";

export class FeedMessage {
    constructor(
        readonly channelName: string,
        readonly id: string,
        readonly url: string,
        readonly content: string,
        readonly createdAt: Date,
        readonly edited: boolean
    ) {}

    addItem(feed: Feed): void {
        feed.addItem({
            title: "",
            id: this.id,
            link: this.url,
            date: this.createdAt,
            description: this.content,
            author: [
                {
                    name: this.edited
                        ? `<span data-localized="#${this.channelName}">IN_CHANNEL</span> &#183; <span data-localized>EDITED</span>`
                        : `<span data-localized="#${this.channelName}">IN_CHANNEL</span>`,
                },
            ],
        });
    }
}
