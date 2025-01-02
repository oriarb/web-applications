import Joi from "joi";

export const postSchema = Joi.object({
  message: Joi.string().required().label("Message"),
  sender: Joi.string().required().label("Sender"),
});

export const validatePost = (data: any) => {
  const { error } = postSchema.validate(data);
  if (error) {
    const cleanMessage: string = error.details[0].message.replace(/"/g, "");
    throw new Error(cleanMessage);
  }
};
