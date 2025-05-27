"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = isUser;
const mongoose_1 = require("mongoose");
function isUser(user) {
    return (typeof user === 'object' &&
        user !== null &&
        '_id' in user &&
        mongoose_1.Types.ObjectId.isValid(user._id));
}
