import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";
export default function ID() {
  const data = {
    flutter: {
      github: "https://github.com",
      readme: "",
      bugNumbers: 4,
    },
    react: {
      github: "",
      readme: "",
      bugNumbers: 4,
    },
    vue: {
      github: "",
      readme: "",
      bugNumbers: 4,
    },
    angular: {
      github: "",
      readme: "",
      bugNumbers: 4,
    },
  };

  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState(id);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setTitle(id);
  }, [id]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/backend/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          window.location.href = "/";
        }
        console.log(err);
      });
  }, []);

  const handleInputChange = (index, event) => {
    const file = event.target.files[0];
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
  };

  const handleUpload = (index) => {
    const file = files[index];
    const formData = new FormData();
    formData.append("patch", file);
    axios
      .post(`${process.env.DEV_HOSTNAME}/questions/${index + 1}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    title && (
      <div className="bg-black/80 min-h-screen flex flex-col lg:flex-row gap-10 lg:gap-20 justify-center items-center">
        <div>
          <h1 className="text-pink-600 cool_shadow p-1 rounded-lg text-[2.5rem] md:text-[5rem] uppercase">
            Fix The Bug
          </h1>
          <p className="text-white text-2xl mt-[3rem]">
            Please click below to find the source code and instructions
          </p>
          <div className="flex flex-row gap-10 justify-center items-center mt-10">
            <a
              className="p-3 cool_shadow text-white hover:-translate-y-1 transition-all w-[10rem] text-center text-xl"
              href={data[title]?.github}
            >
              GitHub
            </a>
            <a
              className="p-3 cool_shadow text-white hover:-translate-y-1 transition-all w-[10rem] text-center text-xl"
              href={data[title]?.github}
            >
              Instructions
            </a>
          </div>
        </div>

        <div>
          {Array.from({ length: data[title].bugNumbers }, (_, index) => (
            <div key={index}>
              <p className="text-white text-3xl mt-8 -ml-8">
                {" "}
                {`BUG ${index + 1}`}
              </p>
              <input
                type="file"
                onChange={(event) => handleInputChange(index, event)}
                className="text-white"
                placeholder={`Input ${index + 1}`}
              />
              <button
                onClick={() => handleUpload(index)}
                className="text-white text-xl p-2 rounded-md bg-blue-500 hover:bg-blue-700 transition-all"
              >
                Upload
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  );
}
