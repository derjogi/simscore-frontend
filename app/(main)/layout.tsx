import Link from "next/link"
import Image from "next/image"

export default function NavLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <div className="relative flex place-items-center">
          <div className="text-2xl font-semibold relative">
            <Link href={"/"}>
              <Image
                src="/SimScore_Logo_noborder.svg"
                alt="SimScore Logo"
                width={150}
                height={50}
              />
            </Link>
          </div>
        </div>
      </nav>
      <div className="flex justify-center items-center m-8 min-h-screen">
        {children}
      </div>
    </>
  )
}
