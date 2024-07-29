import React, { useEffect } from 'react';
import { GeoJSON, Pane, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { mapCenter, setDragging, setInitialMapZoom } from '../helpers/mapFunction';

import { useSelectedFeatureContext } from '../contexts/SelectedFeatureContext';
import Kenya_boundary from '../assets/data/shapefiles/Kenya_boundary.json';
import Kenya_counties from '../assets/data/shapefiles/Kenya_counties.json';
import Kenya_water_basin from '../assets/data/shapefiles/Kenya_water_basin.json';


const FiltererdJsonFeature = () => {
    const { selectedView, selectedFeatureName } = useSelectedFeatureContext();
    const map = useMap();
    const intialZoom = setInitialMapZoom()


    const selectedFeatureData = () => {
        switch (selectedView) {
            case 'BASIN':
                return Kenya_water_basin.features.find(feature => feature.properties.NAME === selectedFeatureName);
            case 'COUNTY':
                return Kenya_counties.features.find(feature => feature.properties.NAME === selectedFeatureName);
            case 'COUNTRY':
                return Kenya_boundary.features.find(feature => feature.properties.NAME === selectedFeatureName);
            default:
                return null;
        }
    };




    let filteredData;

    if (selectedFeatureData() === undefined) {
        filteredData = Kenya_boundary.features[0];
    } else {
        filteredData = selectedFeatureData();
    }



    useEffect(() => {
        if (filteredData) {
            const bounds = L.geoJSON(filteredData.geometry).getBounds();
            // map.flyToBounds(bounds);
            map.setView(bounds.getCenter(), intialZoom);
        }
        else {
            // map.flyTo(mapCenter, intialZoom);
            map.setView(mapCenter, intialZoom);
        }
    }, [filteredData, map, intialZoom]);


    return (
        // <Pane name="selected_features" style={{ zIndex: 1000 }}>
        <Pane name="selected_features">
            <GeoJSON
                key={`${selectedFeatureName + selectedView}`}
                style={{ fillColor: 'none', weight: 4, color: 'yellow', fillOpacity: "0.4" }}
                data={filteredData}
            />
        </Pane>
    );
};

export default FiltererdJsonFeature;
