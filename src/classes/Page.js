export default class Page {
    name;
    icon;
    content;
    constructor(name,icon,content) {
        this.name = name;
        this.icon = icon;
        this.content = content;
    }
}

export const Pages = [
    new Page("Feed", "appstore-o","Feed"),
    new Page("Members", "team","Members"),
    new Page("Timeline", "calendar","Timeline"),
    new Page("Discussion", "message","Discussion"),
    new Page("Files", "file-text","Files")
];

export const UserPage = [
    new Page("User Profile","file","User Page")
];