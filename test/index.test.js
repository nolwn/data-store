const fs = require("fs");
const { expect } = require("chai");

const { FILE_PATH } = require("../tools");
const database = require("..");
const { generateId } = require("../tools");

if (fs.existsSync(FILE_PATH)) fs.unlinkSync(FILE_PATH);

let savedKey;
const keyValues = {};

describe("create", () => {
    it("should return a uuid", () => {
        const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
        const value = "This some data.";
        savedKey = database.create(value);
        keyValues[savedKey] = value;

        expect(savedKey, "create does not return a uuid").to.exist;
        expect(savedKey, "key is not a valid uuid key").match(uuidPattern);
    });

    it("the file contains the id and value seperated by a value", () => {
        const data = fs.readFileSync(FILE_PATH);
        const [key, value] = String(data).split("\t");

        expect(String(key), "entry doesn't have correct key").to.equal(
            savedKey
        );
        expect(
            String(value[value.length - 1]),
            "entry doesn't end in a newline"
        ).to.equal("\n");
    });
});

describe("get", () => {
    it("should get value based on key", () => {
        let value = "I also added this.";
        let key = database.create(value);
        keyValues[key] = value;

        value = "This is kind of filler.";
        key = database.create(value);
        keyValues[key] = value;

        value = "But people do need filler someitmes.";
        key = database.create(value);
        keyValues[key] = value;

        value = "Let's throw on one more for good measure.";
        key = database.create(value);
        keyValues[key] = value;

        for (const key in keyValues) {
            expect(
                database.get(key),
                "get did not retrieve the expected value"
            ).to.deep.equal({ key, value: keyValues[key] });
        }
    });

    it("should return null when key doesn't exist", () => {
        const fakeKey = generateId();
        const value = database.get(fakeKey);

        expect(value).to.be.null;
    });
});

describe("update", () => {
    it("should update a value that exists", () => {
        const firstValue = "This should be updated.";
        const key = database.create(firstValue);

        const secondValue = "This is the update!";
        const firstReturnedEntry = database.update(key, secondValue);
        const firstUpdatedEntry = database.get(key);

        const thirdValue = "This is another update!!";
        const secondReturnedEntry = database.update(key, thirdValue);
        const secondUpdatedEntry = database.get(key);

        expect(firstUpdatedEntry.value).to.equal(secondValue);
        expect(firstReturnedEntry.value).to.equal(firstValue);
        expect(firstUpdatedEntry.key).to.equal(key);

        expect(secondUpdatedEntry.value).to.equal(thirdValue);
        expect(secondReturnedEntry.value).to.equal(secondValue);
        expect(secondUpdatedEntry.key).to.equal(key);
    });

    it("should return null and not add anything when the key doesn't exist", () => {
        const fakeKey = generateId();
        const updateValue = "Update value.";
        const returnedValue = database.update(fakeKey, updateValue);
        const updatedValue = database.get(fakeKey);

        expect(returnedValue).to.be.null;
        expect(updatedValue).to.be.null;
    });
});

describe("delete", () => {
    it("should delete an item if it exists", () => {
        const valueToDelete = "I should disappear.";
        const key = database.create(valueToDelete);
        const removedItem = database.delete(key);
        const returnedValue = database.get(key);

        expect(removedItem.value).to.equal(valueToDelete);
        expect(returnedValue).to.be.null;
    });

    it("should not be resurrectable", () => {
        const valueToDelete = "I should disappear.";
        const key = database.create(valueToDelete);
        const removedItem = database.delete(key);
        const returnedUpdateValue = database.update(
            key,
            "I should not reappear"
        );
        const returnedValue = database.get(key);

        expect(removedItem.value).to.equal(valueToDelete);
        expect(returnedUpdateValue).to.be.null;
        expect(returnedValue).to.be.null;
    });

    it("should return null when the item does not exist", () => {
        const key = generateId();
        const removedItem = database.delete(key);

        expect(removedItem).to.be.null;
    });

    it("should add a tombstone to the database", () => {
        const valueToDelete = "I should get a tombstone.";
        const key = database.create(valueToDelete);
        database.delete(key);

        const lines = String(fs.readFileSync(FILE_PATH)).split("\n");
        const lastEntry = lines[lines.length - 2];
        const lastLine = lines[lines.length - 1];

        expect(lastEntry).to.equal(`${key}\t`);
        expect(lastLine).to.equal("");
    });

    it("should be able to add items after tombstone", () => {
        const valueToDelete = "I should get a tombstone.";
        const valueToAdd = "I should come after a tombstone.";
        const deleteKey = database.create(valueToDelete);
        database.delete(deleteKey);

        const addKey = database.create(valueToAdd);
        const addedEntry = database.get(addKey);

        expect(addedEntry.value).to.equal(valueToAdd);
    });
});
