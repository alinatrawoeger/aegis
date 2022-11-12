import React, { useCallback, useEffect, useState } from "react";
import dtFilters from '../../data/dt_filters';
import iVolFilters from '../../data/ivol_filters';
import styles from "./Filterbar.module.css";
import FilterElement from "./FilterElement";
import FilterSuggestionPanel from "./FilterSuggestions";

type FilterbarProps = {
    isIVolunteer: boolean;
    filters: any[];
    onSelectedFilters: (value) => void;
}

const Filterbar: React.FC<FilterbarProps> = ( { isIVolunteer, filters, onSelectedFilters} ) => {
    const [selectedFilters, setSelectedFilters] = useState(filters);
    const filterSuggestions = useFilterSuggestions(isIVolunteer, selectedFilters, setSelectedFilters);

    if (selectedFilters !== undefined && filters !== selectedFilters) {
        setSelectedFilters(filters);
    }

    const updateSelectedFilters = useCallback(
        (value) => {
            if (value[1]) { // add filter
                onSelectedFilters([...selectedFilters, value[0]]);
                setSelectedFilters([...selectedFilters, value[0]])
            } else { // remove filter
                let newFilterList = selectedFilters.filter(el => el.key !== value[0]);
                onSelectedFilters(newFilterList);
                setSelectedFilters(newFilterList);
            }
        },
        [selectedFilters, setSelectedFilters],
    );

    let filterList = (
        <>
            {
                selectedFilters.map((element: any) => (
                    <FilterElement key={element.key} filterKey={element.key} filterValue={element.value} removeFilter={updateSelectedFilters} isIVolunteer={isIVolunteer}></FilterElement>
                ))
            }
        </>
    );

    
    return (
      <>
        <div className={`${styles.filterbar} ${isIVolunteer? styles.filterbarIVol : styles.filterbarDt}`}>
            <div className={styles.filterStaticText}>{isIVolunteer ? 'Filter' : 'Filters'}:</div>
                {filterList}
                <FilterSuggestionPanel suggestions={filterSuggestions} isIVolunteer={isIVolunteer} onSetNewFilterValue={updateSelectedFilters}></FilterSuggestionPanel>
            </div>
        </>
    );
};

const getFilterSuggestions = (isIVolunteer: boolean) => {
    if (isIVolunteer) {
        return Object.assign({}, iVolFilters[0]);
    } else {
        return Object.assign({}, dtFilters[0]);
    }
}

const useFilterSuggestions = (isIVolunteer: boolean, selectedFilters: any[], setSelectedFilters: any) => {
    let fullList = getFilterSuggestions(isIVolunteer);
    const [filterSuggestions, setFilterSuggestions] = useState(fullList);

    useEffect(() => {
            // check if selectedFilters contains a filter from filterSuggestions and remove it from filterSuggestions
            let newFilterList;
            if (isIVolunteer) {
                newFilterList = adjustAvailableFiltersIVol(selectedFilters, fullList);
            } else {
                newFilterList = adjustAvailableFiltersDt(selectedFilters, fullList);
            }

            setFilterSuggestions(newFilterList);
        }, [selectedFilters, setSelectedFilters]
    );

    return filterSuggestions;
}

const adjustAvailableFiltersIVol = (selectedFilters: any[], fullList) => {
    let filterList = Object.assign({}, fullList);

    for (let i = 0; i < selectedFilters.length; i++) {
        let selectedFilterKey = selectedFilters[i].key;
        for (let fullListKey in fullList) {
            if (fullListKey === selectedFilterKey) {
                delete filterList[fullListKey];
            }
        }
    }

    return filterList;
}

const adjustAvailableFiltersDt = (selectedFilters: any[], fullList) => {
    let filterList = Object.assign({}, fullList);
    
    // remove filterKey if this filter has been set already
    // also, check for hierarchical filters
    let isCitySet, isRegionSet, isCountrySet = false;
    for (let i = 0; i < selectedFilters.length; i++) {
        let selectedFilterKey = selectedFilters[i].key;
        for (let fullListKey in fullList) {
            if (fullListKey === selectedFilterKey) {
                delete filterList[fullListKey];
            }
        }

        isCitySet = selectedFilterKey === 'city' ? true : isCitySet;
        isRegionSet = selectedFilterKey === 'region' ? true : isRegionSet;
        isCountrySet = selectedFilterKey === 'country' ? true : isCountrySet;
    }

    // if set, remove hierarchical filters if a more specific filter has been set already (e.g. continent/country/region/city)
    if (isCitySet) {
        delete filterList['region'];
        delete filterList['country'];
        delete filterList['continent'];
    }
    if (isRegionSet) {
        delete filterList['country'];
        delete filterList['continent'];
    }
    if (isCountrySet) {
        delete filterList['continent'];
    }

    // remove suggestions that aren't possible (e.g. Country = "Austria", City = "Berlin")
    filterList = adjustSuggestionsDt(selectedFilters, filterList);

    return filterList;
}


// TODO something doesn't work in here. Scenario:
// When choosing Continent = EU, Region = Upper Austria --> city loads suggestions correctly
// when then deleting all filters and choosing Continent = NA, Region = any --> city is empty (probably right, NA doesn't have cities except New York)
// when then choosing the first scenario again, city is also empty.
// Loading data directly from the file dt_filters.ts comes in wrongly already wth
const adjustSuggestionsDt = (selectedFilters, filterList) => {
    for (let i = 0; i < selectedFilters.length; i++) {
        let selectedFilterKey = selectedFilters[i].key;
        let selectedFilterValue = selectedFilters[i].value;
        for (let filterListKey in filterList) {
            if (selectedFilterKey === 'continent') {
                // if (filterListKey === 'country' || filterListKey === 'region' || filterListKey === 'city') {
                //     for (let continentKey in newFilterList[filterListKey].properties) {
                //         if (continentKey !== selectedFilterValue) {
                //             delete newFilterList[filterListKey].properties[continentKey];
                //         }
                //     }
                // }
            } else if (selectedFilterKey === 'country') {
                // if (filterListKey === 'region' || filterListKey === 'city') {
                //     for (let continentKey in newFilterList[filterListKey].properties) {
                //         for (let countryKey in newFilterList[filterListKey].properties[continentKey]) {
                //             if (countryKey !== selectedFilterValue) {
                //                 delete newFilterList[filterListKey].properties[continentKey][countryKey];
                //             }
                //         }
                //     }
                // }
            } else if (selectedFilterKey === 'region') {
                // if (filterListKey === 'city') {
                //     for (let continentKey in filterList[filterListKey].properties) {
                //         for (let countryKey in filterList[filterListKey].properties[continentKey]) {
                //             for (let regionKey in filterList[filterListKey].properties[continentKey][countryKey]) {
                //                 if (regionKey !== selectedFilterValue) {
                //                     delete filterList[filterListKey].properties[continentKey][countryKey][regionKey];
                //                 }
                //             }
                //         }
                //     }
                // }
            }

        }
    }

    return filterList;
}

export default Filterbar;