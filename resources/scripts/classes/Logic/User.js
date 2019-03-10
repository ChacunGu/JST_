/**
 * class User
 * a user for JST_
 */
class User {
    constructor(name, group) {
        this.name = name;
        this.password = Kernel.SHA256("");
        this.groups = [];
        this.addToGroup(group);
    }

    /**
     * changePassword
     * changes the poassword of the user
     * needs the old password to do so!
     * @param {String} oldPassword 
     * @param {String} newPassword 
     */
    changePassword(oldPassword, newPassword) {
        if(Kernel.SHA256(oldPassword) == this.password) {
            this.password = Kernel.SHA256(newPassword);
        }
    }

    /**
     * addToGroup
     * adds the User to a Group
     * @param {Group} group 
     */
    addToGroup(group) {
        group.addUser(this);
        this.groups.push(group)
    }

    /**
     * isInSameGroup
     * test if the user has a group in common with otherUser
     * @param {User} otherUser 
     */
    isInSameGroup(otherUser) {
        if (otherUser instanceof User) {
            for (let i = 0 ; i < this.groups.length ; i++) {
                for (let j = 0 ; j < otherUser.groups.length ; j++) {
                    if (this.groups[i] === otherUser.groups[j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * getName
     * returns the user's name
     */
    getName() {
        return this.name;
    }

    /**
     * getPassword
     * returns the user's password (Hashed by sha256)
     */
    getPassword() {
        return this.password;
    }

    /**
     * getGroups
     * returns the user's list of groups
     */
    getGroups() {
        return this.groups;
    }

    /**
     * getMainGroup
     * returns the user's main group
     */
    getMainGroup() {
        return this.groups[0];
    }

    /**
     * getGroupName
     * returns the user's main group name
     */
    getGroupName() {
        return this.getMainGroup().getName();
    }

    isRoot() {
        return this === Kernel.ROOT_USER;
    }

    /**
     * canRead
     * tests if the user can read the file
     * @param {AbstractFile} user 
     */
    canRead(file) {
        if (this.isRoot()) {
            return true;
        }
        if (this === file.getOwner() && 
            file.permission.ownerRights.read) {
            return true;
        }
        if (this.isInSameGroup(file.getOwner()) &&
            file.permission.groupRights.read) {
            return true;
        }
        return file.permission.allRights.read;
    }

    /**
     * canWrite
     * tests if the user can write in the file
     * @param {AbstractFile} user 
     */
    canWrite(file) {
        if (this.isRoot()) {
            return true;
        }
        if (this === file.getOwner() && file.permission.ownerRights.write) {
            return true
        }
        if (this.isInSameGroup(file.getOwner()) &&
            file.permission.groupRights.write) {
            return true;
        }
        return file.permission.allRights.write;
    }

    /**
     * canExecute
     * tests if the user can execute the file
     * @param {AbstractFile} user 
     */
    canExecute(file) {
        if (this.isRoot()) {
            return true;
        }
        if (this === file.getOwner() && file.permission.ownerRights.execute) {
            return true
        }
        if (this.isInSameGroup(file.getOwner()) &&
            file.permission.groupRights.execute) {
            return true;
        }
        return file.permission.allRights.execute;
    }

    /**
     * isInList
     * test if the user is in the list of users
     * @param {Users[]} users
     */
    isInList(users) {
        for (let i = 0 ; i < users.length ; i++) {
            if (users[i] === this) {
                return true;
            }
        }
        return false;
    }
}