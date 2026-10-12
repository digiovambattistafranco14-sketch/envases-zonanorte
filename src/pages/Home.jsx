import Benefits from '../components/Benefits.jsx'
import Catalog from '../components/Catalog.jsx'
import Coverage from '../components/Coverage.jsx'
import Hero from '../components/Hero.jsx'
import HowToOrder from '../components/HowToOrder.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Catalog />
      <Benefits />
      <HowToOrder />
      <Coverage />
    </>
  )
}
