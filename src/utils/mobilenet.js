import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

export const predictFood = async (imageElement) => {
  const model = await mobilenet.load();
  const predictions = await model.classify(imageElement);
  return predictions[0]; // Most confident
};
