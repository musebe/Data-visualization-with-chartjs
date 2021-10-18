import { NextApiRequest, NextApiResponse } from "next";
import {
  handleCloudinaryDelete,
  handleCloudinaryUpload,
  handleGetCloudinaryUploads,
} from "../../lib/cloudinary";
import { parseForm } from "../../lib/parse-form";

// Custom config for our API route
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * The handler function for the API route. Takes in an incoming request and outgoing response.
 *
 * @param {NextApiRequest} req The incoming request object
 * @param {NextApiResponse} res The outgoing response object
 */
const ImagesRoute = async (req, res) => {
  switch (req.method) {
    case "GET": {
      try {
        const result = await handleGetRequest();

        return res.status(200).json({ message: "Success", result });
      } catch (error) {
        return res.status(400).json({ message: "Error", error });
      }
    }

    case "POST": {
      try {
        const result = await handlePostRequest(req);

        return res.status(201).json({ message: "Success", result });
      } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Error", error });
      }
    }

    default: {
      return res.status(405).json({ message: "Method not allowed" });
    }
  }
};

const handleGetRequest = async () => {
  const uploads = await handleGetCloudinaryUploads();

  return uploads;
};

/**
 * Handles the POST request to the API route.
 *
 * @param {NextApiRequest} req The incoming request object
 */
const handlePostRequest = async (req) => {
  // Get the form data using the parseForm function
  const data = await parseForm(req);

  // Get images from the parsed form data
  const images = data.files.images;

  // Cloudinary image upload results
  const imagesUploadResults = [];

  // Final Image upload result
  let finalImageUploadResult;

  // Loop over the images
  for (const image of images) {
    // Check if it's the last image
    if (imagesUploadResults.length === images.length - 1) {
      // Get the already uploaded image results
      const otherImages = imagesUploadResults.slice(0, images.length - 1);

      // Upload the last image and add the already uploaded images as layers
      const imageUploadResult = await handleCloudinaryUpload({
        path: image.path,
        folder: true,
        transformation: [
          ...otherImages.map((image, index, arr) => {
            const itemsBeforeCurrent = arr.slice(0, index);

            const rowsBeforeCurrent = itemsBeforeCurrent.reduce(
              (accumulator, currentValue, currentIndex, array) => {
                if (currentIndex % 2 === 0) {
                  const row = [{}, ...array].slice(
                    currentIndex,
                    currentIndex + 2
                  );

                  if (row.length == 2) accumulator.push(row);
                }

                return accumulator;
              },
              []
            );

            return {
              overlay: image.public_id.replace(/\//g, ":"),
              width: 400,
              height: 400,
              crop: "scale",
              gravity: "north_west",
              x: index % 2 === 0 ? 400 : 0,
              y: rowsBeforeCurrent.length * 400,
            };
          }),
        ],
      });

      finalImageUploadResult = imageUploadResult;
    } else {
      // Upload the image to cloudinary
      const imageUploadResult = await handleCloudinaryUpload({
        path: image.path,
        folder: false,
      });

      imagesUploadResults.push(imageUploadResult);
    }
  }

  // Delete the uploaded images that we no longer need
  await handleCloudinaryDelete(
    imagesUploadResults.map((result) => result.public_id)
  );

  return finalImageUploadResult;
};

export default ImagesRoute;
