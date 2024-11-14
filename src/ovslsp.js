let Parent = {
    name: 'parent',
    echoName() { console.log(this.name); }
}

let Child = {
    __proto__: Parent,
    name: 'child',
    echoName() {
        console.log(this.name);
    }
};

Parent.echoName() //parent
Child.echoName() //child

console.log(Child instanceof Parent)
