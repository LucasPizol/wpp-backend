import { Types } from "mongoose";

export const notViewedMessagesServices = {
  create: async (_user: Types.ObjectId, _customer: Types.ObjectId) => {
    try {
      const data = await NotViewedMessages.create({ _customer, _user });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
  set: async (
    _user: Types.ObjectId,
    _customer: Types.ObjectId,
    quantity: number
  ) => {
    try {
      await NotViewedMessages.updateOne({ _customer, _user }, { quantity });
      return { data: "Success", error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getNotViewedMessagesQuantity: async () => {
    try {
      const data = await NotViewedMessages.find();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
