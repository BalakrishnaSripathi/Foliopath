import api from "./axios";

export const contactUsApi = {
  createContactUs: async (payload) => {
    const { data } = await api.post("/api/contact-us", payload);
    return data;
  },

  getAllContactUs: () => {
    return api.get("/api/contact-us");
  },
};
