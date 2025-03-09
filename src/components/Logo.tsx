import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/">
      <h1 className="text-xl font-bold hover:text-blue-500 transition-colors">
        Autogen AI
      </h1>
    </Link>
  )
}

export default Logo