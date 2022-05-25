import React, { useEffect, useState } from "react";
import dtFilters from '../../data/dt_filters';
import iVolFilters from '../../data/ivol_filters.json';
import styles from "./Filterbar.module.css";
import FilterSuggestionPanel from "./FilterSuggestion";
import FilterElement from "./FilterElement";
import { render } from "react-dom";

type FilterbarProps = {
    isIVolunteer: boolean;
    onSelectedFilters: (value) => void;
    onFilterSuggestions: (value) => void;
}

const Filterbar: React.FC<FilterbarProps> = ( { isIVolunteer, onSelectedFilters, onFilterSuggestions} ) => {
    const [selectedFilters, setSelectedFilters] = useState([]);
    const filterSuggestions = useFilterSuggestions(isIVolunteer, selectedFilters, setSelectedFilters);

    const addSelectedFilter = (value) => {
        setSelectedFilters(selectedFilters => [...selectedFilters, value]) 
    };

    const removeSelectedFilter = (value) => {
        // remove filter from filterbar
        let newFilterList = selectedFilters.filter(el => el.key !== value);
        setSelectedFilters(newFilterList);

        // // add filter back into suggestionlist
        // setFilterSuggestions(useState(useFil))
    };

    let filterList = (
        <>
            {
                selectedFilters.map((element: any) => (
                    <FilterElement filterKey={element.key} filterValue={element.value} removeFilter={removeSelectedFilter}></FilterElement>
                ))
            }
        </>
    );

    
    return (
      <>
        <div className={styles.filterbar}>
            <div className={styles.filterStaticText}>Filtered by:</div>
                {filterList}
                <FilterSuggestionPanel suggestions={filterSuggestions} isIVolunteer={isIVolunteer} onSetNewFilterValue={addSelectedFilter}></FilterSuggestionPanel>
            </div>
        </>
    );
};

const clearAllFilterElements = (setFilterState) => {
    setFilterState([]);
}

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
            let filterKeys = Object.keys(selectedFilters);
            
            let newFilterList = Object.assign({}, fullList);
            for (let key in fullList) {
                for (let j = 0; j < selectedFilters.length; j++) {
                    if (key === selectedFilters[j].key) {
                        delete newFilterList[key];
                    }
                }
            }

            setFilterSuggestions(newFilterList);
        }, [selectedFilters, setSelectedFilters]
    );

    return filterSuggestions;
}

export default Filterbar;