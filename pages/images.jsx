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
