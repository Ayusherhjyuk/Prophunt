import { IUser } from "../models/User";
import { Types } from 'mongoose';

export function isUser(user: unknown): user is IUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    '_id' in user &&
    Types.ObjectId.isValid((user as any)._id)
  );
}
