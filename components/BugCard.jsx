import { useRouter } from "next/router"


export default function BugCard({ title, index }) {
  const router = useRouter()

  return (
    <div className='cool_shadow  w-[20rem] h-[10rem] hover:-translate-y-1 transition-all'>
      <div className=' flex flex-col gap-2 items-center justify-center'>
        <h2 className='text-4xl text-white  p-2'>{title}</h2>
        <button className='text-white text-xl p-2 rounded-md' onClick={() => {
          router.push(`/challenge/${index}`)
        }}>Start Challenge!</button>
      </div>
    </div>
  )
}
