export type Item = {
    title: string;
    id?: string;
    link: string;
    date: Date;

    description?: string;
    content?: string;
    category?: Category[];

    guid?: string;

    image?: string | Enclosure;
    audio?: string | Enclosure;
    video?: string | Enclosure;
    enclosure?: Enclosure;

    author?: Author[];
    contributor?: Author[];

    published?: Date;
    copyright?: string;

    extensions?: Extension[];
};

export type Enclosure = {
    url: string;
    type?: string;
    length?: number;
    title?: string;
    duration?: number;
};

export type Author = {
    name?: string;
    email?: string;
    link?: string;
};

export type Category = {
    name?: string;
    domain?: string;
    scheme?: string;
    term?: string;
};

export type FeedOptions = {
    id: string;
    title: string;
    updated?: Date;
    generator?: string;
    language?: string;
    ttl?: number;

    feed?: string;
    feedLinks?: any;
    hub?: string;
    docs?: string;

    author?: Author;
    link?: string;
    description?: string;
    image?: string;
    favicon?: string;
    copyright: string;
};

export type Extension = {
    name: string;
    objects: any;
};
