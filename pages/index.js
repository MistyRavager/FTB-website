import BugCard from "../components/BugCard";

export default function Home() {
  return (
   <div className='grid grid-cols-4 mx-[2rem] gap-5'>
    <BugCard />
    <BugCard />
    <BugCard />
    <BugCard />
    <BugCard />
    <BugCard />
   </div>
  )
}
