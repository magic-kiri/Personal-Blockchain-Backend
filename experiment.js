
const unordered = {
    'b': 7,
    'c': 8,
    'a': 9
};

console.log(JSON.stringify(unordered));
// → '{"b":"foo","c":"bar","a":"baz"}'

const ordered = Object.keys(unordered).sort().reduce((obj, key) => {
    obj[key] = unordered[key]; return obj;
}, {});

console.log(JSON.stringify(ordered));