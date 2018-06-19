export class IDGen {
    static UIDlength = 28;
    static UIDChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    static generateUID() {
        let uid = "";
        for (var i = 0; i < this.UIDlength; i++)
            uid += this.UIDChars.charAt(Math.floor(Math.random() * this.UIDChars.length));
        return uid;
    }
}