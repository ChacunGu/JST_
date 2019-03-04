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
     * getName
     * returns the name of the group
     */
    getName() {
        return this.name;
    }
}