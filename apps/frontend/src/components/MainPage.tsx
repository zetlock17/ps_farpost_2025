import { useEffect } from "react"
import BlackoutsStats from "./BlackoutsStats"
import Footer from "./Footer"
import Header from "./Header"
import MapComponent from "./MapComponent"
import { useBlackoutsStore } from "../store/blackoutsStore"

const MainPage = () => {
  const fetchBlackouts = useBlackoutsStore((state) => state.fetchBlackouts);

  useEffect(() => {
    fetchBlackouts();
  }, [fetchBlackouts]);

  return (
    <>
      <Header />
      <MapComponent />
      <BlackoutsStats />
      <Footer />
    </>
  )
}

export default MainPage