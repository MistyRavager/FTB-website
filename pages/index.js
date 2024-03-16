import axios from "axios";
import BugCard from "../components/BugCard";
import React, { useEffect } from "react";


export default function Home() {
  const data = {
    flutter: {
      github: "",
      readme: ""
    },
    react: {
      github: "",
      readme: ""
    },
    vue: {
      github: "",
      readme: ""
    },
    angular: {
      github: "",
      readme: ""
    },
  }

  const [login, setLogin] = React.useState(false)

  const submitCreds = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:8000/token', e.target)
      localStorage.setItem('access_token', res.data.access_token)
      setLogin(false)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    axios.get('http://localhost:8000/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    }).then((res) => {
      console.log(res.data)
    }).catch((err) => {
      if (err.response.status === 401) {
        setLogin(true)
      }
      console.log(err)
    })
  }, [])

  return (
    <div className="bg-black/80 min-h-screen flex flex-col gap-10 justify-center items-center">
      <h1 className="text-pink-700 text-[5rem] uppercase">Fix The Bug</h1>
      <div className='grid grid-cols-4 gap-5 '>
        {login ?
          <>
            <form onSubmit={submitCreds} className='flex flex-col gap-2 items-center justify-center'>
              <input type="text" name="username" placeholder="Username" />
              <input type="password" name="password" placeholder="Password" />
              <button type="submit" className='text-white text-xl p-2 rounded-md'>Login</button>
            </form>
          </>
          :
          <>
            {Object.keys(data).map((key) => {
              return <BugCard key={key} title={key} github={data[key].github} readme={data[key].readme} />
            })}
          </>
        }

      </div>
    </div>
  )
}
