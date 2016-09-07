// A ValueConverter for iterating an Object's values inside of a repeat.for in Aurelia
export class ObjectValuesValueConverter {
    toView(obj: Object) {
        // Create a temporary array to populate with object values
        let temp = [];
        
        if (!obj) return temp;
        
        // A basic for..in loop to get values
        // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of
        for (let val in obj) {
            temp.push(val);
        }
        
        return temp;
    }
}

/**
 * Usage
 * Shows how to use the custom ValueConverter to iterate an objects values
 * 
 * <require from="./ObjectValuesValueConverter"></require>
 * <li repeat.for="val of myVmObject | objectValues">${val}</li>
 */