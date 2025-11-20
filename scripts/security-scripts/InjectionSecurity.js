import { execFile } from "child_process"; 
import { promisify } from "util";

const execFileAsync = promisify(execFile);

//Validate string against safe regex pattern
export function validateInput(value, pattern = /^[a-zA-Z0-9_.-]{1,16}$/) {
    return typeof value === "string" && pattern.test(value);
}

//XSS mitigation
//sanitizes input to avoid characters used in HTML or JS code
export function sanitize(text) {
    if (typeof text !== "string") return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

//safe database filter from user input
//copies fields only from the allowed list
//ignores objects and arrays 
export function createSafeFilter(input, allowedFields) {
    const filter = {};
    if (!input || typeof input !== "object") return filter;
    
    for (const field of allowedFields) {
        if (!Object.prototype.hasOwnProperty.call(input, field)) continue;
        const value = input[field];
        if (isPlainValue(value)) {
            filter[field] = value;
        } else {
            continue;
        }
    }

    return filter;
}

//safe update object for database
export function buildSafeUpdate(input, allowedFields) {
    const update = {};
    const set = {};

    if (!input || typeof input != "object") return update;
    for (const field of allowedFields) {
        if (!Object.prototype.hasOwnProperty.call(input, field)) continue;
        const value = input[field];
        if (isPlainValue(value)) {
            set[field] = value;
        } else {
            continue;
        }
    }

    if (Object.keys(set).length > 0) {
        update.$set = set;
    }
    return update;
}

//block potential nested arrays
//only accept simple values
function isPlainValue(v) {
    const t = typeof v;
    return v === null || t === "string" || t === "number" || t === "boolean";
}
