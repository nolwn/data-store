const { appendToFile, generateId, getLines } = require("./tools");

exports.create = function (value) {
    const key = generateId();
    addEntry({ key, value });

    return key;
};

exports.get = function (key) {
    return getEntry(key);
};

exports.update = function (key, value) {
    const previousEntry = getEntry(key);

    if (previousEntry) {
        addEntry({ key, value });
    }

    return previousEntry;
};

exports.delete = function (key) {
    const deleteEntry = getEntry(key);

    if (deleteEntry) {
        appendToFile(`${key}\t\n`);
    }

    return deleteEntry;
};

function addEntry({ key, value }) {
    appendToFile(`${key}\t${value}\n`);
}

function getEntry(key) {
    const lines = getLines();
    let finalValue = null;

    for (const line of lines) {
        const [lineKey, lineValue] = line.split("\t");

        if (key === lineKey) {
            finalValue = { key: lineKey, value: lineValue };
        }

        if (finalValue?.value === "") {
            return null;
        }
    }

    return finalValue;
}
