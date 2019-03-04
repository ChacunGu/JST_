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
        console.log(this);
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
}