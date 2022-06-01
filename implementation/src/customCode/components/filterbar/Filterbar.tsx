import React, { useCallback, useEffect, useState } from "react";
import dtFilters from '../../data/dt_filters';
import iVolFilters from '../../data/ivol_filters.json';
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
                    <FilterElement key={element.key} filterKey={element.key} filterValue={element.value} removeFilter={updateSelectedFilters}></FilterElement>
                ))
            }
        </>
    );

    
    return (
      <>
        <div className={styles.filterbar}>
            <div className={styles.filterStaticText}>Filtered by:</div>
                {filterList}
                <FilterSuggestionPanel suggestions={filterSuggestions} isIVolunteer={isIVolunteer} onSetNewFilterValue={updateSelectedFilters}></FilterSuggestionPanel>
            </div>
        </>
    );
};

const getFilterSuggestions = (isIVolunteer: boolean) => {
    if (isIVolunteer) {
        return iVolFilters[0];
    } else {
        return dtFilters[0];
    }
}

const useFilterSuggestions = (isIVolunteer: boolean, selectedFilters: any[], setSelectedFilters: any) => {
    let fullList = getFilterSuggestions(isIVolunteer);
    const [filterSuggestions, setFilterSuggestions] = useState(fullList);

    useEffect(() => {
            // check if selectedFilters contains a filter from filterSuggestions and remove it from filterSuggestions
            let newFilterList = [];
            if (isIVolunteer) {

            } else {
                newFilterList = adjustAvailableFiltersDt(selectedFilters, fullList);
            }

            setFilterSuggestions(newFilterList);
        }, [selectedFilters, setSelectedFilters]
    );

    return filterSuggestions;
}

const adjustAvailableFiltersDt = (selectedFilters: any[], fullList: any[]) => {
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

const adjustSuggestionsDt = (selectedFilters, filterList) => {
    for (let i = 0; i < selectedFilters.length; i++) {
        let selectedFilterKey = selectedFilters[i].key;
        let selectedFilterValue = selectedFilters[i].value;
        for (let filterListKey in filterList) {
            if (selectedFilterKey === 'continent') {
                if (filterListKey === 'country') {
                    for (let continentKey in filterList[filterListKey].properties) {
                        if (continentKey !== selectedFilterValue) {
                            delete filterList[filterListKey].properties[continentKey];
                        }
                    }
                }
            } else if (selectedFilterKey === 'country') {
                if (filterListKey === 'region' || filterListKey === 'city') {
                    for (let countryKey in filterList[filterListKey].properties) {
                        if (countryKey !== selectedFilterValue) {
                            delete filterList[filterListKey].properties[countryKey];
                        }
                    }
                }
            } else if (selectedFilterKey === 'region') {
                if (filterListKey === 'city') {
                    for (let countryKey in filterList[filterListKey].properties) {
                        for (let regionKey in filterList[filterListKey].properties[countryKey]) {
                            if (regionKey !== selectedFilterValue) {
                                delete filterList[filterListKey].properties[countryKey][regionKey];
                            }
                        }
                    }
                }
            }

        }
    }

    return filterList;
}

export default Filterbar;