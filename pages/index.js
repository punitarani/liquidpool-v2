import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  const paragraphStyle = 'my-4 text-center max-w-2xl'
  return (
    <div>
      <Head>
        <title>Liquid Pool</title>
        <meta name="description" content="Pool your NFTs and sell half of Pool Token (ERC-20)" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        
        <div className='flex flex-col items-center'>
          
          <div className="flex items-center m-5">
            <Link className='mx-2 right-0 top-0 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-black focus:outline-none' href='/existingpools'> Swap NFT Now</Link>
            <Link className='mx-2 right-0 top-0 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-black focus:outline-none' href='/contracts'> Check Contracts</Link>
          </div>
        </div>
        
      </main>

      <footer className='text-center'>

      </footer>
      
    </div>
  )
}
