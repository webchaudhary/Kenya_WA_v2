export const DataManualResources=[
    {
        "Dataset":"Biomass Production",
        "Source":"WaPOR L1 V3",
        "PeriodOfAvailablity":"2018-2023",
        "SpatialResolution":"300 m",
        "DataDescription":"Biomass refers to organic matter derived from living or recently living organisms. Biomass production in agriculture refers to the harvesting of organic matter from plants, including crops, grasses, and trees, which can be used for various purposes such as food, feed, fiber and biofuels.",
        "SourceLink":"https://www.fao.org/in-action/remote-sensing-for-water-productivity/wapor-data/en",
    },
    {
        "Dataset":"Biomass Water Productivity",
        "Source":"WaPOR L1 V3",
        "PeriodOfAvailablity":"2018-2024",
        "SpatialResolution":"300 m",
        "DataDescription":"Biomass Water Productivity expresses the quantity of total biomass production in relation to the total volume of water consumed (actual evapotranspiration). ",
        "SourceLink":"https://www.fao.org/in-action/remote-sensing-for-water-productivity/wapor-data/en",
    },
    {
        "Dataset":"Blue and green ET",
        "Source":"WaPOR L1 V3",
        "PeriodOfAvailablity":"2018-2023",
        "SpatialResolution":"300 m",
        "DataDescription":"Blue ET refers to the component of evapotranspiration that is derived from blue water sources such as rivers, lakes, reservoirs and groundwater through capilary rise. While the green ET is the component of evapotranspiration that involves water sourced from the soil. Green ET is mainly contributed by the fraction of precipitation that infiltrates into the soil and is available to plants. Here WaPOR ET and CHIRPS precipitation data is used to derive Blue and Green ET components. ",
        "SourceLink":"https://www.fao.org/in-action/remote-sensing-for-water-productivity/wapor-data/en",
    },
    {
        "Dataset":"Crop Water Footprint (WFs)",
        "Source":"Mialyk et al. (2023)",
        "PeriodOfAvailablity":"1990-2019",
        "SpatialResolution":"~ 9260 m at equator (0.083°)",
        "DataDescription":"<p>Water footprint refers to the total volume of water used in the production process of goods or services, including both direct water use (e.g., irrigation, processing water) and indirect water use (e.g., water embedded in inputs like raw materials and energy). Here water footprint only refers direct water use. The data is output of the global simulation of crop water footprints (WFs) with a process-based gridded crop model ACEA (see model description in references). The model is based on FAO&rsquo;s AquaCrop and covers 175 widely-grown crops in the 1990&ndash;2019 period at a 5 arcminute resolution. The WFs is partitioned into green and blue and differentiate between rainfed and irrigated production systems. Below is description of individual WFs component.</p> <ol> <li>Irrigated Blue: The volume of surface irrigation water consumed in an irrigation production system.</li> <li>Rainfed Blue: The volume of water consumed from shallow aquifers via capillary rise in a rainfed irrigated system.</li> <li>Irrigated Green: The volume of precipitation water consumed in an irrigation production system.</li> <li>Rainfed Green: The volume of precipitation water consumed in a rainfed production system.</li> </ol>",
        "SourceLink":"https://data.4tu.nl/datasets/7b45bcc6-686b-404d-a910-13c87156716a/1",
    },
    // {
    //     "Dataset":"Evaporative Demand Drought Index (EDDI)",
    //     "Source":"",
    //     "PeriodOfAvailablity":"",
    //     "SpatialResolution":"",
    //     "DataDescription":'The Evaporative Demand Drought Index (EDDI) is an experimental tool that examines how anomalous the atmospheric evaporative demand (E0; also known as "the thirst of the atmosphere") is for a given location and across a time period of interest. EDDI maps use atmospheric evaporative demand anomalies across a timescale of interest relative to its climatology to indicate the spatial extent and severity of drought. EDDI can serve as an indicator of both rapidly evolving "flash" droughts (developing over a few weeks) and sustained droughts (developing over months but lasting up to years).',
    //     "SourceLink":"",
    // },
    {
        "Dataset":"Evapotranspiration (ET)",
        "Source":"WaPOR L1 V3",
        "PeriodOfAvailablity":"2018 - 2023",
        "SpatialResolution":"300 m",
        "DataDescription":"Evapotranspiration (ET) is the combined process of water transfer from the Earth's surface to the atmosphere, encompassing both evaporation from open water bodies and soil surfaces as well as transpiration from plant leaves. Evaporation occurs as water changes from liquid to vapor with the aid of solar energy, while transpiration involves plants absorbing water through roots, transporting it through their tissues, and releasing it into the air through leaf stomata. Water that becomes evapotranspired is no longer available for further use, hence it is commonly referred to as consumed water in the water accounting terminology. In this dashboard ET data acquired from two sources, WaPOR and Landsat.",
        "SourceLink":"https://www.fao.org/in-action/remote-sensing-for-water-productivity/wapor-data/en",
    },
    {
        "Dataset":"Irrigated and rainfed cropland",
        "Source":"Thenkabail et al. (2021)",
        "PeriodOfAvailablity":"2015",
        "SpatialResolution":"30 m",
        "DataDescription":"The Landsat-Derived Global Rainfed and Irrigated-Cropland Product (LGRIP) maps the world’s agricultural lands by dividing them into irrigated and rainfed croplands. The data is produced using Landsat 8 time-series satellite sensor data for the 2014-2017 time period to create a nominal 2015 product.",
        "SourceLink":"https://doi.org/10.3133/pp1868",
    },
    {
        "Dataset":"Land cover classification (LCC)",
        "Source":"ESA",
        "PeriodOfAvailablity":"2021",
        "SpatialResolution":"10 m",
        "DataDescription":"WorldCover provides the first global land cover products for 2020 and 2021 at 10 m resolution, developed and validated in near-real time based on Sentinel-1 and Sentinel-2 data.",
        "SourceLink":"https://esa-worldcover.org/en",
    },
    {
        "Dataset":"Precipitation",
        "Source":"Chirps",
        "PeriodOfAvailablity":"1981-2023",
        "SpatialResolution":"~ 5556 m at equator (0.05°)",
        "DataDescription":"Precipitation refers to all forms of condensation of atmospheric water vapor that falls from clouds. The main forms of precipitation include drizzling, rain, sleet, snow, ice pellets, graupel and hail. In the river basins, where there is no other inflow (e.g. through surface or subsurface flow), the total precipitation accounts for the entire total gross inflow, in the water accounting terms, in any given time",
        "SourceLink":"https://www.chc.ucsb.edu/data/chirps",
    },
    {
        "Dataset":"Reference evapotranspiration (RET)",
        "Source":"AgERA5",
        "PeriodOfAvailablity":"~ 11112 m at equator (0.10°)",
        "SpatialResolution":"2018-2023",
        "DataDescription":'Reference evapotranspiration (RET) represents the rate at which water evaporates from a standardized reference crop under specified climatic conditions. The  "reference crop" is used to represent a standardized type of vegetation that closely mimics certain characteristics, such as height, leaf area index, and canopy cover, which affect evapotranspiration. Commonly used reference crops include well-watered grass and alfalfa. This dataset has been prepared according to the FAO Penman - Monteith method as described in FAO Irrigation and Drainage Paper 56.',
        "SourceLink":"https://data.apps.fao.org/catalog/dataset/global-weather-for-agriculture-agera5",
    },
    {
        "Dataset":"Standardised Precipitation-Evapotranspiration Index (SPEI)",
        "Source":"Beguería et al. (2010) Vicente-Serrano et al. (2010)",
        "PeriodOfAvailablity":"1955-2024",
        "SpatialResolution":"~ 111120 m at equator (1.0°)",
        "DataDescription":"The SPEI is a multiscalar drought index based on climatic data. It can be used for determining the onset, duration and magnitude of drought conditions with respect to normal conditions in a variety of natural and managed systems such as crops, ecosystems, rivers, water resources, etc.",
        "SourceLink":"https://spei.csic.es/home.html",
    },
    
]
