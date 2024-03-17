import axios from "axios";
import BugCard from "../components/BugCard";
import React, { useEffect } from "react";

export default function Home() {
  const [login, setLogin] = React.useState(true);
  const [data, setData] = React.useState([]);

  const submitCreds = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        ` ${process.env.NEXT_PUBLIC_HOSTNAME}/token`,
        e.target
      );
      localStorage.setItem("access_token", res.data.access_token);
      setLogin(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    axios
      .get(` ${process.env.NEXT_PUBLIC_HOSTNAME}/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setLogin(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setLogin(true);
        }
        console.log(err);
      });
    axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/questions`).then((res) => {
      console.log(res.data);
      setData(res.data);
    }
    );

  }, []);

  return (
    <div className="bg-black/80 min-h-screen flex flex-col gap-10 justify-center items-center">
      <h1 className="text-pink-700 text-[2.5rem] md:text-[5rem] uppercase">
        Fix The Bug
      </h1>
      <div
        className={
          !login
            ? "grid grid-cols-4 gap-5"
            : "flex flex-col gap-2 items-center justify-center"
        }
      >
        {login ? (
          <>
            <form
              onSubmit={submitCreds}
              className="flex flex-col gap-4 items-center justify-center w-[90vw] md:w-[20rem]"
            >
              <input
                type="text"
                name="username"
                className="p-3 rounded-md w-full"
                placeholder="Username"
              />
              <input
                type="password"
                name="password"
                className="p-3 rounded-md w-full"
                placeholder="Password"
              />
              <button
                type="submit"
                className="text-pink-700 cool_shadow mt-5 text-xl w-[10rem] p-2 rounded-md"
              >
                Login
              </button>
            </form>
          </>
        ) : (
          <>
            {data?.map((challenge, index) => {
              return (
                <BugCard
                  key={index}
                  title={challenge.title}
                  index={index}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
