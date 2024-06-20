import React, { Suspense, lazy } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NavbarMain from './components/NavbarMain'
import Footer from './components/Footer'

import ScrollToTop from './components/ScrollToTop'
import Preloader from './components/Preloader'
import HydronomicZonesPage from './pages/HydronomicZonesPage'

const EvapotranspirationPage = lazy(() => import('./pages/EvapotranspirationPage'));
const PrecipitationPage = lazy(() => import('./pages/PrecipitationPage'));
const BiomassPage = lazy(() => import('./pages/BiomassPage'));
const LandClassificationPage = lazy(() => import('./pages/LandClassificationPage'));
const WaterFootprintPage = lazy(() => import('./pages/WaterFootprintPage'));
const OtherDataPage = lazy(() => import('./pages/OtherDataPage'));
// const ClimateChangePage = lazy(() => import('./pages/ClimateChangePage'));
// const DataManualPage = lazy(() => import('./pages/DataManualPage'));
// const WaterProductivity = lazy(() => import('./pages/WaterProductivity'));
// const DroughtConditions = lazy(() => import('./pages/DroughtConditions'));
// const VirtualWaterPage = lazy(() => import('./pages/VirtualWaterPage'));
// const BenchmarkPage = lazy(() => import('./pages/BenchmarkPage'));
// const DataDownloadPage = lazy(() => import('./pages/DataDownloadPage'));




const App = () => {
  
  return (
    <>
      <Router>
        <NavbarMain/>
        <Suspense fallback={<Preloader />}>
        <Routes>
          <Route path='/' element={<HomePage/>} />
          <Route path='/et' element={<EvapotranspirationPage/>} />
          <Route path='/pcp' element={<PrecipitationPage/>} />
          <Route path='/bp' element={<BiomassPage/>} />
          {/* <Route path='/benchmark' element={<BenchmarkPage/>} /> */}
          {/* <Route path='/climate' element={<ClimateChangePage/>} /> */}
          <Route path='/lcc' element={<LandClassificationPage/>} />
          <Route path='/wf' element={<WaterFootprintPage/>} />
          <Route path='/hz' element={<HydronomicZonesPage/>} />
          {/* <Route path='/wp' element={<WaterProductivity/>} /> */}
          {/* <Route path='/dc' element={<DroughtConditions/>} /> */}
          {/* <Route path='/data-manual' element={<DataManualPage/>} /> */}
          <Route path='/other-data' element={<OtherDataPage/>} />
          {/* <Route path='/vw' element={<VirtualWaterPage/>} /> */}
          {/* <Route path='/download' element={<DataDownloadPage/>} /> */}
        </Routes>
        </Suspense>
        <ScrollToTop/>
        <Footer/>
      </Router>

    </>

  )
}

export default App