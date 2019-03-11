/**
 * class Group
 * represents a group of users
 */
class Group {
    constructor(name) {
        this.name = name;

        this.users = [];
    }
    
    /**
     * addUser
     * adds a user to the group
     * @param {User} user 
     */
    addUser(user) {
        this.users.push(user);
    }

    /**
     * getUsers
     * returns the list of users in the group
     */
    getUsers() {
        return this.users;
    }

    /**
     * isInList
     * test if the group is in the list of groups
     * @param {Group[]} groups
     */
    isInList(groups) {
        for (let i = 0 ; i < groups.length ; i++) {
            if (groups[i] === this) {
                return true;
            }
        }
        return false;
    }

    /**
     * getName
     * returns the name of the group
     */
    getName() {
        return this.name;
    }
}