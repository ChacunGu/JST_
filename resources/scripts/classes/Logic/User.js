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
     * getName
     * returns the user's name
     */
    getName() {
        return this.name;
    }

    /**
     * getGroups
     * returns the user's list of groups
     */
    getGroups() {
        return this.groups;
    }

    /**
     * getGroupName
     * returns the user's main group name
     */
    getGroupName() {
        return this.groups[0].getName();
    }

    
    /**
     * canRead
     * tests if the user can read the file
     * @param {AbstractFile} user 
     */
    canRead(file) {
        if (this === file.getOwner() && file.permission.ownerRights.read) {
            return true
        }
        // TODO handle group
        return file.permission.allRights.read;
    }

    /**
     * canWrite
     * tests if the user can write in the file
     * @param {AbstractFile} user 
     */
    canWrite(file) {
        if (this === file.getOwner() && file.permission.ownerRights.write) {
            return true
        }
        // TODO handle group
        return file.permission.allRights.write;
    }

    /**
     * canExecute
     * tests if the user can execute the file
     * @param {AbstractFile} user 
     */
    canExecute(file) {
        if (this === file.getOwner() && file.permission.ownerRights.execute) {
            return true
        }
        // TODO handle group
        return file.permission.allRights.execute;
    }
}