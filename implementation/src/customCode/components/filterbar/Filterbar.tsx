import React, { useCallback, useEffect, useState } from "react";
import dtFilters from '../../data/dt_filters';
import iVolFilters from '../../data/ivol_filters.json';
import dataDt from '../../data/dt_database';
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
            let newFilterList = adjustAvailableFilters(selectedFilters, fullList);

            setFilterSuggestions(newFilterList);
        }, [selectedFilters, setSelectedFilters]
    );

    return filterSuggestions;
}

const adjustAvailableFilters = (selectedFilters: any[], fullList: any[]) => {
    let filterList = Object.assign({}, fullList);
    for (let i = 0; i < selectedFilters.length; i++) {
        for (let key in fullList) {
            // remove filterkey if this filter has already been set
            if (key === selectedFilters[i].key) {
                delete filterList[key];
            }
        }
    }

    return filterList;
}

export default Filterbar;