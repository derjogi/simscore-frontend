import Link from "next/link"

export default function NavLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <div className="relative flex place-items-center">
          <div className="text-2xl font-semibold relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert">
            <Link href={"/"}><h1>SimScore</h1></Link>
          </div>
        </div>
      </nav>
      <div className="flex justify-center items-center m-8 min-h-screen">
        {children}
      </div>
    </>
  )
}