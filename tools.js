const { v4: uuidv4 } = require("uuid");
const { appendFileSync, readSync, openSync } = require("fs");

const BUFFER_SIZE = 126;
const READ_OFFSET = 0;
const READ_LENGTH = BUFFER_SIZE;

/**
 * @type {string} - the default file path for the db file
 */
const FILE_PATH = "./data.db";

/**
 * @function appendToFile - appends given data to the file
 * @param {string} data - a line of data
 */
exports.appendToFile = function (data) {
    appendFileSync(FILE_PATH, `${data}`);
};

/**
 * @function generateId - generate a new "universally unique identifier"
 * @returns {string} - the new ID
 */
exports.generateId = function () {
    return uuidv4();
};

/**
 * @generator
 * @function getLines - returns the next line of the file until all lines have been returned
 * @yields {string} - The next entry read by the generator
 */
exports.getLines = function* () {
    const readBuffer = Buffer.alloc(126);
    const fd = openSync(FILE_PATH, "r");
    let reading = true;
    let overflow = "";

    while (reading) {
        const breakIdx = overflow.indexOf("\n");

        if (breakIdx >= 0) {
            const line = overflow.slice(0, breakIdx);
            overflow = overflow.slice(breakIdx + 1);

            yield line;
        } else {
            const bytesRead = readSync(
                fd,
                readBuffer,
                READ_OFFSET,
                READ_LENGTH
            );
            if (!bytesRead) {
                reading = false;
            } else {
                overflow += readBuffer.toString("utf-8", 0, bytesRead);
            }
        }
    }
};

exports.FILE_PATH = FILE_PATH;
