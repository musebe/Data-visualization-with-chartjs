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
