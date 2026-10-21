import CategoryGrid from '../components/CategoryGrid.jsx'
import ContactForm from '../components/ContactForm.jsx'
import Hero from '../components/Hero.jsx'

// Inicio simple: carrusel, rubros (con sus productos) y consultas.
export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <ContactForm />
    </>
  )
}
