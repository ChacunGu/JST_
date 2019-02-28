/**
 * class User
 * a user for JST_
 */
class User {
    constructor(name, group) {
        this.name = name;
        this.groups = [];
        this.addToGroup(group);
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