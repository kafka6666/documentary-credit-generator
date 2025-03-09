import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/logo.png" width={32} height={32} alt="Logo"/>
      <h1 className="text-xl font-bold hover:text-blue-500 transition-colors">
        Autogen AI
      </h1>
    </Link>
  )
}

export default Logo