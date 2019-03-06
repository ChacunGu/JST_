/**
 * Class Permission
 * represents the permissions of a user on a file
 */
class Permission {
    constructor() {
        this.ownerRights = {
            read : true,
            write : true,
            execute : true
        }
        this.groupRights = {
            read : true,
            write : false,
            execute : false
        }
        this.allRights = {
            read : true,
            write : false,
            execute : false
        }
    }

    /**
     * setRights
     * sets the rights of the file
     * @param {String} octal : 3 octal chars (ex: 777, 342, etc...) 
     */
    setRights(octal) {
        if (octal.length == 3) {
            let or = zfill(parseInt(octal[0]).toString(2), 3); // owner's rights
            let gr = zfill(parseInt(octal[1]).toString(2), 3); // group's rights
            let ar = zfill(parseInt(octal[2]).toString(2), 3); // all user's rights
            this.ownerRights = {
                read : or[0]==1,
                write : or[1]==1,
                execute : or[2]==1
            }
            this.groupRights = {
                read : gr[0]==1,
                write : gr[1]==1,
                execute : gr[2]==1
            }
            this.allRights = {
                read : ar[0]==1,
                write : ar[1]==1,
                execute : ar[2]==1
            }
        } else {
            throw new Error("octal param must be 3 characters long.");
        }
    }

    /**
     * toString
     * display the permissions as a readable string
     * style : rwxr--r--
     */
    toString() {
        return  (this.ownerRights.read ? "r" : "-") +
                (this.ownerRights.write ? "w" : "-") +
                (this.ownerRights.execute ? "x" : "-") +
                (this.groupRights.read ? "r" : "-") +
                (this.groupRights.write ? "w" : "-") +
                (this.groupRights.execute ? "x" : "-") +
                (this.allRights.read ? "r" : "-") +
                (this.allRights.write ? "w" : "-") +
                (this.allRights.execute ? "x" : "-")
    }

}
/**
 * zfill
 * fill with zeros at left
 * @param {Number} num 
 * @param {Integer} size 
 */
function zfill(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}