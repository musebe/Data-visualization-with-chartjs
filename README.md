# Data visualization using Chart.js, Next.js and Cloudinary

## Introduction

[Chart.js](https://www.chartjs.org/) is an amazing JS library that helps with visualization of data through different types of charts and graphs. In this tutorial, we're going to be generating images of the charts/graphs from the [Chart.js JS library](https://github.com/chartjs/Chart.js) and combining them into one image using [Next.js](https://nextjs.org/) and [Cloudinary](https://cloudinary.com/?ap=em).

##  Codesandbox 

The final project can be viewed on [Codesandbox](https://codesandbox.io/s/data-visualization-uz02t).

<CodeSandbox
title="Data visualization"
id="data-visualization-uz02t"
/>

You can find the full source code on my [Github]https://github.com/musebe/Data-visualization-with-chartjs.git) repository.

## Getting Started

I should mention that working knowledge of Javascript is required. Knowledge of React, Node.js, and Next.js is recommended but not required. I, however, recommend going through the [Next.js docs](https://nextjs.org/docs/) to get a grip on some of it's features that we'll be using e.g. API Routes

### Create a new project

Let's start off by creating a new [Next.js](https://nextjs.org/) project. Run the following command in your terminal to create a basic Next project.

```bash
npx create-next-app data-visualization-with-chartjs
```

If you'd like to use features such as Typescript and more, have a look at the [docs](https://nextjs.org/docs/basic-features/typescript). Change directory to your new project.

```bash
cd data-visualization-with-chartjs
```

Open your project in your favorite code editor. [Visual Studio Code](https://code.visualstudio.com/) is a great option, because of it's amazing support for js and jsx. Let's proceed and install dependencies.

### Installing dependencies and setting up

Run the following command to install [Chart.js](https://www.npmjs.com/package/chart.js), [Cloudinary](https://www.npmjs.com/package/cloudinary) and [Formidable](https://www.npmjs.com/package/formidable).

```bash
npm install chart.js cloudinary formidable
```

Formidable helps us to parse form data easily, cloudinary enables us to communicate with the Cloudinary APIs.

To communicate with cloudinary APIs, we'll need some credentials and API key. Let's get those. If you're not familiar, [cloudinary](https://cloudinary.com/?ap=em) provides APIs to developers that allow for upload and storage of images and videos. On top of that, you can also transform and optimize media. You can get started with a free developer account immediately and upgrade to a paid plan when your needs grow. Head over to [cloudinary](https://cloudinary.com/?ap=em) and create an account if you do not have one. Proceed to log in and navigate to your [dashboard](https://cloudinary.com/console?ap=em). Here you'll find the `Cloud name`, `API Key` and `API Secret`.


![Cloudinary Dashboard](https://res.cloudinary.com/hackit-africa/image/upload/v1623006780/cloudinary-dashboard.png "Cloudinary Dashboard")

In your code editor with your project open, create a new file named `.env.local` at the root of your project and paste the following code inside.

```env
CLOUD_NAME=YOUR_CLOUD_NAME
API_KEY=YOUR_API_KEY
API_SECRET=YOUR_API_SECRET
```

Replace `YOUR_CLOUD_NAME` `YOUR_API_KEY` and `YOUR_API_SECRET` with the `Cloud name`, `API Key` and `API Secret` values that we just got.

Here we're making use of environment variables to store our API keys securely. Read about Next.js support for environment variables [here](https://nextjs.org/docs/basic-features/environment-variables)

We're now ready to start our project/application. Let's work on the front-end first.

### The front-end

We're going to have two pages: the home page, where we'll display the individual charts, and the images page where we'll display the combined images.
We can begin by setting up a few styles for buttons and links. Add the following to `styles/globals.css`

```css

a:hover {
  text-decoration: underline;
}

button {
  padding: 20px 30px;
  border: none;
  font-weight: bold;
  background-color: #0044ff;
  color: #ffffff;
}

button:disabled {
  background-color: #cfcfcf;
}

button:hover:not([disabled]) {
  background-color: #0036ca;
}
```

Next, create a folder called `components` at the root of your project. Inside this folder, create a new file called `Layout.js` and paste the following code inside.

```jsx
// components/Layout.js

import Head from "next/head";
import Link from "next/link";

const LayoutComponent = (props) => {
  const { children } = props;

  return (
    <div>
      <Head>
        <title>Data Visualization With Chartjs and Cloudinary</title>
        <meta
          name="description"
          content="Data Visualization With Chartjs and Cloudinary"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav>
        <Link href="/">
          <a>Home</a>
        </Link>
        <Link href="/images">
          <a>Images</a>
        </Link>
      </nav>
      <main>{children}</main>
      <style jsx>{`
        nav {
          min-height: 100px;
          background-color: #0044ff;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        nav a {
          color: white;
          margin: 0 10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default LayoutComponent;

```

This is a component that we can reuse to wrap our pages so we have a consistent layout and we don't have to write the same code multiple times.

We also need a component to display our graphs/charts from Chart.js. Create a file named `ChartOnCanvas.js` under `components/` folder and paste the following code. 

```jsx
import { Chart, ChartConfiguration } from "chart.js";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

/**
 *
 * @param {{ config: ChartConfiguration; width:number;height:number;}} props
 * @returns
 */
const ChartOnCanvas = forwardRef(function ChartOnCanvas(props, ref) {
  const { config, width = 400, height = 400 } = props;

  // Variable to store our chart reference
  let chart = useRef(null);

  // Use the `useImperativeHandle` hook to bind our ref to the parent component's ref and expose a method called `toBase64Image`
  useImperativeHandle(
    ref,
    () => ({
      toBase64Image() {
        return chart?.current?.toBase64Image();
      },
    }),
    []
  );

  // Ref to the canvas element
  const canvasRef = useRef(null);

  const createChart = useCallback(() => {
    chart.current = new Chart(canvasRef.current, {
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        {
          id: "custom_canvas_background_color",
          beforeDraw: (chart) => {
            const ctx = chart.canvas.getContext("2d");
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          },
        },
      ],
    });

    return () => {
      chart?.current?.destroy();
    };
  }, []);

  useEffect(() => {
    createChart();
  }, [createChart]);

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
      }}
    >
      <canvas ref={canvasRef} width={width} height={width}></canvas>
    </div>
  );
});

export default ChartOnCanvas;
```

Let's go over what this all means. Chart.js displays the data on a HTML canvas. We created a custom component so that we can easily have different canvas elements that manage their own state. We also need to expose a few functions that we can call via a DOM reference. This is where `forwardRef` and `useImperativeHandle` come in. I'll try to explain both. Sometimes when we create a custom react component, we may want to pass a `ref` attribute to another component that is below in the tree. For example when we wrap a native button element with a custom component and we want to access the native button from outside of our component. To access the native button, we pass a reference down the tree using `forwardRef`. Read more about it [here](https://reactjs.org/docs/react-api.html#reactforwardref). To add to this, we may also want to expose custom instance values/methods to the parent of our custom component. This is exactly what `useImperativeHandle` does. If you have some custom fields/methods in your custom component that you would like to access outside of that custom component, you expose them using the `useImperativeHandle` hook. Read more about it [here](https://reactjs.org/docs/hooks-reference.html#useimperativehandle).

Our `ChartOnCanvas` component takes in a few props. We need a width and height for our canvas size, and also a config object that we'll pass to chart.js. The config object tells chart.js what data to display, how to display it and what type of chart to display it on. Read about it [here](https://www.chartjs.org/docs/latest/configuration/). 

`chart` stores a reference to our chart using the [useRef](https://reactjs.org/docs/hooks-reference.html#useref) hook.

Inside `useImperativeHandle` we expose a method called `toBase64Image`. This method converts a chart to a base64 image string. We'll call it from outside the component to get the base64 string on demand.

`canvasRef` stores a reference to our canvas element.

`createChart` is a memoized callback. We use a [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback) hook to store a memoized callback function. The function creates a new chart, passes it the config object we get from the props and then assigns the chart to the`chart` variable. Notice how we use the `plugins` field to paint the background of the canvas white. Read about this [here](https://www.chartjs.org/docs/latest/configuration/canvas-background.html)

The `useEffect` effect hook just calls `createChart` when the component is rendered. Read about [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect).

For the HTML we just have a canvas element with a ref `canvasRef`.

Let's move on to the home page. Replace the contents in `pages/index.js` with the following code.

```jsx
// pages/index.js

import Head from "next/head";
import { Chart, registerables } from "chart.js";

Chart.register(...(registerables ?? []));

import ChartOnCanvas from "../components/ChartOnCanvas";
import { useState, useRef } from "react";
import { useRouter } from "next/dist/client/router";
import LayoutComponent from "../components/Layout";

const HomePage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const chart1Ref = useRef();
  const chart2Ref = useRef();
  const chart3Ref = useRef();
  const chart4Ref = useRef();

  const generateImage = async () => {
    try {
      // Set loading to true
      setLoading(true);

      const base64Urls = [
        chart1Ref.current.toBase64Image(),
        chart2Ref.current.toBase64Image(),
        chart3Ref.current.toBase64Image(),
        chart4Ref.current.toBase64Image(),
      ];

      const results = await Promise.all(base64Urls.map((url) => fetch(url)));

      const images = await Promise.all(results.map((res) => res.blob()));

      const formData = new FormData();

      for (const imageBlob of images) {
        formData.append("images", imageBlob);
      }

      // Make a POST request to the `api/images/` endpoint
      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      // Navigate to the images page
      router.push("/images");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutComponent>
      <div className="actions">
        <button
          onClick={() => {
            generateImage();
          }}
          disabled={loading}
        >
          Generate Image
        </button>
      </div>
      <div className="wrapper">
        <ChartOnCanvas
          ref={chart1Ref}
          config={{
            type: "bar",
            data: {
              labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
              datasets: [
                {
                  label: "# of Votes",
                  data: [12, 19, 3, 5, 2, 3],
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                  ],
                  borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "Chart.js Bar Chart",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          }}
        ></ChartOnCanvas>
        <ChartOnCanvas
          ref={chart2Ref}
          config={{
            type: "line",
            data: {
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
              datasets: [
                {
                  label: "My First Dataset",
                  data: [65, 59, 80, 81, 56, 55, 40],
                  fill: false,
                  borderColor: "rgb(75, 192, 192)",
                  tension: 0.1,
                },
              ],
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "Chart.js Line Chart",
                },
              },
            },
          }}
        ></ChartOnCanvas>
        <ChartOnCanvas
          ref={chart3Ref}
          config={{
            type: "doughnut",
            data: {
              labels: ["Red", "Blue", "Yellow"],
              datasets: [
                {
                  label: "My First Dataset",
                  data: [300, 50, 100],
                  backgroundColor: [
                    "rgb(255, 99, 132)",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)",
                  ],
                  hoverOffset: 4,
                },
              ],
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "Chart.js Doughnut Chart",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          }}
        ></ChartOnCanvas>
        <ChartOnCanvas
          ref={chart4Ref}
          config={{
            type: "polarArea",
            data: {
              labels: ["Red", "Green", "Yellow", "Grey", "Blue"],
              datasets: [
                {
                  label: "My First Dataset",
                  data: [11, 16, 7, 3, 14],
                  backgroundColor: [
                    "rgb(255, 99, 132)",
                    "rgb(75, 192, 192)",
                    "rgb(255, 205, 86)",
                    "rgb(201, 203, 207)",
                    "rgb(54, 162, 235)",
                  ],
                },
              ],
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "Chart.js Polar Area Chart",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          }}
        ></ChartOnCanvas>
      </div>
      <style jsx>{`
        div.actions {
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px 0;
        }

        div.wrapper {
          min-height: 100vh;
          width: 100vw;
          padding: 20px;
          display: flex;
          flex-flow: row wrap;
          gap: 1rem;
          align-content: flex-start;
          justify-content: center;
        }

        div.wrapper > * {
          flex: 0 0 400px;
          border: 1px solid black;
        }
      `}</style>
    </LayoutComponent>
  );
};

export default HomePage;

```

At the top we import the Chart library and also register all registerables so that we can be able to use them. Registerables are just all the chart components that we plan on using in our project. Read about this [here](https://www.chartjs.org/docs/latest/getting-started/integration.html#bundlers-webpack-rollup-etc)

For our HomePage component, we have the [router from Next.js](https://nextjs.org/docs/api-reference/next/router) and a loading state. We also have a `useRef` hook for each of the charts that we want to display. We'll pass these refs to our `ChartOnCanvas` components. `generateImage` calls the `toBase64Image()` method on our charts references, converts these base64 strings to blobs then appends the blobs to formdata so that we can be able to upload them as multipart/form-data. If you're wondering about the `Promise.all()` see [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). We then post the form data to the `/api/images` endpoint which we'll be creating later. When the post request to `/api/images` completes successfully, it navigates to the `/images` page, we'll create that next. For the HTML, we just wrap the whole page in the Layout component that we created earlier. We then have a few ChartOnCanvas components. We pass some chart configuration to each of the ChartOnCanvas components and also pass a ref. The config objects that I have used in this tutorial are all from the [chart.js examples](https://www.chartjs.org/docs/latest/charts/line.html). The button at the top triggers the `generateImage` function.

Let's create the images page. Create a new file under `pages/` called `images.js` and paste the following code inside. 

```jsx
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LayoutComponent from "../components/Layout";

const ImagesPage = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const getImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/images", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      setImages(data.result.resources);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getImages();
  }, [getImages]);

  return (
    <LayoutComponent>
      <div className="wrapper">
        {loading ? (
          <div className="loading">
            <p>Loading...</p>
          </div>
        ) : (
          <div>
            {images.length > 0 ? (
              <div className="images">
                {images.map((image, index) => (
                  <div key={`image-${index}`} className="image-wrapper">
                    <div className="image">
                      <Image
                        src={image.secure_url}
                        alt={image.public_id}
                        width={image.width}
                        height={image.height}
                        layout="intrinsic"
                      ></Image>
                    </div>
                    <div className="actions">
                      <Link href={image.secure_url} passHref>
                        <a target="_blank" rel="noreferrer">
                          {image.public_id}
                        </a>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-images">
                <p>No Images Yet</p>
                <Link href="/" passHref>
                  <button>Generate Some Images</button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        div.loading {
          width: 100%;
          height: calc(100vh - 100px);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2rem;
          font-weight: bold;
        }

        div.no-images {
          width: 100%;
          height: calc(100vh - 100px);
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
        }

        div.no-images p {
          font-size: 2rem;
          font-weight: bold;
        }

        div.images {
          width: 100%;
          min-height: calc(100vh - 100px);
          padding: 20px;
          display: flex;
          gap: 40px;
          flex-flow: column nowrap;
          justify-content: center;
          align-items: center;
        }

        div.images div.image-wrapper {
          display: flex;
          flex-flow: column nowrap;
          background-color: #f5f5f5;
          -webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          -moz-box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        div.images div.image-wrapper div.image {
          flex: 1 0 auto;
          background-color: #ffffff;
        }

        div.images div.image-wrapper div.actions {
          min-height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 0;
        }
      `}</style>
    </LayoutComponent>
  );
};

export default ImagesPage;
```

This is just a simple react component. We have a loading state and an images state to store all uploaded images. `getImages` makes a GET request to the `/api/images/` route and gets all images that have been uploaded then updates the `images` state. For the HTML we just display the images in a flex layout contianer. 

That's about it for the frontend. Moving on to the backend.

### The back-end

Create a new folder at the root of your project and name it `lib`. Inside this folder, create a new file called `cloudinary.js` and paste the following code inside. 

```jsx
// Import the v2 api and rename it to cloudinary
import { v2 as cloudinary, TransformationOptions } from "cloudinary";

const CLOUDINARY_FOLDER_NAME = "visualization-with-chartjs/";

// Initialize the sdk with cloud_name, api_key and api_secret
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/**
 * Gets a resource from cloudinary using it's public id
 *
 * @param {string} publicId The public id of the image
 */
export const handleGetCloudinaryResource = (publicId) => {
  return cloudinary.api.resource(publicId, {
    resource_type: "image",
    type: "upload",
  });
};

/**
 * Get cloudinary uploads
 * @returns {Promise}
 */
export const handleGetCloudinaryUploads = () => {
  return cloudinary.api.resources({
    type: "upload",
    prefix: CLOUDINARY_FOLDER_NAME,
    resource_type: "image",
  });
};

/**
 * Uploads an image to cloudinary and returns the upload result
 *
 * @param {{path: string; transformation?:TransformationOptions;publicId?: string; folder?: boolean; }} resource
 */
export const handleCloudinaryUpload = (resource) => {
  return cloudinary.uploader.upload(resource.path, {
    // Folder to store image in
    folder: resource.folder ? CLOUDINARY_FOLDER_NAME : null,
    // Public id of image.
    public_id: resource.publicId,
    // Type of resource
    resource_type: "auto",
    // Transformation to apply to the video
    transformation: resource.transformation,
  });
};

/**
 * Deletes resources from cloudinary. Takes in an array of public ids
 * @param {string[]} ids
 */
export const handleCloudinaryDelete = (ids) => {
  return cloudinary.api.delete_resources(ids, {
    resource_type: "image",
  });
};

```

At the top we import the cloudinary v2 api and rename it to `cloudinary`. This is just for readability and you can leave it as is. We then define a folder name where we'll store all our images, and proceed to initialize the cloudinary sdk by calling the `config` method. We pass the environment variables that we defined earlier.

`handleGetCloudinaryResource` calls the `api.resource` method on the sdk. It gets a specific resource from cloudinary using it's public id. Read about this [here](https://cloudinary.com/documentation/admin_api#get_the_details_of_a_single_resource)

`handleGetCloudinaryUploads` calls the `api.resources` method to get all uploaded resources(images/videos) in the specified folder. Read more about this [here](https://cloudinary.com/documentation/admin_api#get_resources)

`handleCloudinaryUpload` uploads an resource to cloudinary by calling the `uploader.upload` method. We pass to it the path to the file we want to upload and also a few options. Read about the options that you can pass here [here](https://cloudinary.com/documentation/image_upload_api_reference#upload_method).

`handleCloudinaryDelete` takes in an array of public IDs and passes them to the `api.delete_resources` method. This method deletes the resources with the given public IDs from cloudinary.

Create another file inside `lib/` folder and name it `parse-form.js`. Paste the following code inside.

```js
// lib/parse-form.js

import { IncomingForm } from "formidable";

/**
 * Parses the incoming form data.
 *
 * @param {NextApiRequest} req The incoming request object
 */
export const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true, multiples: true });

    form.parse(req, (error, fields, files) => {
      if (error) {
        return reject(error);
      }

      return resolve({ fields, files });
    });
  });
};
```

`parseForm` takes in a request object and uses [Formidable](https://www.npmjs.com/package/formidable) to parse the formdata from the request. Read the formidable docs to learn more about all the options. 

And now for the final piece of the puzzle, we need an API route. Let's create an API route to handle the endpoint `/api/images` endpoint.

Create a new file called `images.js` under `pages/api` and paste the following code inside.

```js
// pages/api/images.js

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

```


Read about Next.js API routes [here](https://nextjs.org/docs/api-routes/introduction)

At the top we export a [custom config](https://nextjs.org/docs/api-routes/api-middlewares#custom-config) object. This custom config tells Next.js not to use the default body parser middleware since we want to handle the form data ourselves. 

`ImagesRoute` is the handler/controller for our route. It takes in a request object and a respone object. We then export it as a default export.

We use a switch statement to only handle GET and POST requests. `handleGetRequest` gets all uploads by calling the `handleGetCloudinaryUploads` function that we created earlier. 

`handlePostRequest` gets the incoming form data using the `parseForm` function that we defined. At this point, it's important we understand the next steps. Here's what we're doing. When the front-end makes a POST request to the `/api/images` enpoint, we receive an array of images. We'll loop over the images and upload all images except the last one in the array. The last image will serve as the base for the combined image that we want to achieve. For our use case, we want an image with two columns and an infinite number of rows. The last image that I mentioned will be placed at the top-left, then we'll map the already uploaded images as layers relative to this last image. Refer to the following table.

| Column 1 | Column 2 |
| -------- | -------- |
| 0        | 1        |
| 2        | 3        |
| 4        | 5        |

Here's how we achieve this. When uploading the last image, we pass a `transformation` option. Read more about this [here](https://cloudinary.com/documentation/image_upload_api_reference#:~:text=transformations%20is%20completed.-,transformation,-String). In the transformation object we pass an object which will serve as an overlay to the image we're uploading. Read about how to add overlays to images [here](https://cloudinary.com/documentation/layers). The object has the following schema

```ts
{
    overlay: string;
    width: number;
    height: number;
    crop: string;
    gravity: string;
    x: number;
    y: number;
}
```

The most important option here is the gravity option which we set to `north_west`. This tells cloudinary to use the top left of the image as the origin(0,0). That means that the x and y coordinates start at 0 at the top left. The other important options are the x and y options. Since we set our images to be 400x400, we know their sizes. So we know how to place the images. See below

| Column 1   | Column 2     |
| ---------- | ------------ |
| x,y(0,0)   | x,y(400,0)   |
| x,y(0,400) | x,y(400,400) |
| x,y(0,800) | x,y(400,800) |

It's easy to determine the x co-ordinate since we only have two columns. We just need to check the index of the image to see if it's even or odd. For the y co-ordinate, however, it's a bit tricky. There's a number of ways you could do this. For this tutorial let's try something that's a bit unorthodox. 

```js
// ...
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
// ...
```

Don't paste this anywhere, we've already written it. In the piece of code above, we take an array of all images and place them in groups of two, each group representing a row. We then count the number of rows and then multiply that with 400, our image height.

And that's it for our application.

## Running the application

One more thing before we run our application. We need to add the cloudinary domain name to our `next.config.js`. This is because we're using the Image component from Next.js to show images. As part of the optimization measures, we need to add the domain names for any external images that we show. Read about this [here](https://nextjs.org/docs/api-reference/next/image#configuration-options). Create a file called `next.config.js` at the root of your project if it doesn't exist and add the following

```js
module.exports = {
  // ... other options
  images: {
    domains: ["res.cloudinary.com"],
  },
};
```

You can now run your project using 

```bash
npm run dev
```

That's it. You can find the full code on my [Github](https://github.com/musebe/Data-visualization-with-chartjs.git)