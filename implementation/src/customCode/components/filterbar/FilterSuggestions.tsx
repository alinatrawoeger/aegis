import React, { useCallback, useEffect, useState } from 'react';
import styles from "./Filterbar.module.css";

const FilterSuggestionPanel = ( { suggestions, isIVolunteer, onSetNewFilterValue } ) => {  
    const [filterList, setFilterList] = useState([])
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [newFilterValue, setNewFilterValue] = useState();

    // set and update filter list
    useEffect(() => {
        setFilterList(Object.keys(suggestions))
    }, [suggestions])
    
    // add new filter and give it back outside
    const newFilterCallback = useCallback(
        (value) => {
          setNewFilterValue(value);
          onSetNewFilterValue([value, true]);
        }, [newFilterValue, onSetNewFilterValue],
    );
    
    // render list to choose filter from
    let renderedFilterlist = null;
    if (showFilters) {
        renderedFilterlist = (
            <div className={`${styles.suggestionValuesPanel} ${styles.filterListPanel}`}>
                 { filterList.map((filter, index) => {
                      return <FilterListElement key={index} filterName={filter} 
                                setShowFilters={setShowFilters} 
                                filterList={filterList} setFilterList={setFilterList}
                                setSelectedFilter={setSelectedFilter}
                                setShowSuggestions={setShowSuggestions} />
                 })}
            </div>
        )
    }

    // after choosing filter, render list of suggestions
    let renderedSuggestionList = null;
    if (showSuggestions) {
        let filterSuggestions = getFilterSuggestions(isIVolunteer, suggestions, selectedFilter);
        renderedSuggestionList = (
            <FilterSuggestions filterKey={selectedFilter} filterValues={filterSuggestions} setNewFilterValue={newFilterCallback} setShowSuggestions={setShowSuggestions}></FilterSuggestions>
        )
    }

    return(
        <>
            {
                !showFilters && !showSuggestions && filterList.length > 0
                ?   <div className={`${styles.filterElement} ${styles.addFilterBtn}`} onClick={() => displayFilters(true, setShowFilters)}>
                        <span>Add filter</span>
                    </div>
                :   ''
            }
            <div>
                {renderedFilterlist}
            </div>
            <div>
                {renderedSuggestionList}
            </div>
        </>
    );
}

const FilterListElement = ( { filterName, setShowFilters, filterList, setFilterList, setSelectedFilter, setShowSuggestions } ) => {
    return (
        <>
            <div className={styles.suggestionValueElement} onClick={() => selectFilterName(filterName, setShowFilters, filterList, setFilterList, setSelectedFilter, setShowSuggestions)}>
                {filterName}
            </div>
        </>
    );
} 

const FilterSuggestions = ( { filterKey, filterValues, setNewFilterValue, setShowSuggestions } ) => {
    const keys = Object.keys(filterValues);
    return (
        <>
            <div className={styles.suggestionsPanel}>
                <div className={styles.suggestionFiltername}>{filterKey}:</div>
                <div className={styles.suggestionValuesPanel}>
                    {
                        keys.map((valueKey: string) => (
                            <div key={valueKey} className={styles.suggestionValueElement} onClick={() => selectFilterValue(setNewFilterValue, filterKey, filterValues[valueKey], setShowSuggestions)}>{filterValues[valueKey]}</div>
                        ))
                    }
                </div>
            </div>
        </>
    );  
}

const displayFilters = (showFilters, setShowFilters: any) => {
    setShowFilters(showFilters);
}

const selectFilterName = (filterName, setShowFilters, filterList, setFilterList, setSelectedFilter, setShowFilterSuggestions) => {
    setShowFilters(false);
    setSelectedFilter(filterName);
    setShowFilterSuggestions(true);

    // remove filter from filterlist so it cannot be selected twice
    let elementIndex = filterList.indexOf(filterName);
    filterList.splice(elementIndex, 1);
    setFilterList(filterList);
}

const selectFilterValue = (setNewFilterValue, filterKey, filterValue, setShowSuggestions) => {
    setNewFilterValue({
        "key": filterKey,
        "value": filterValue
    });
    setShowSuggestions(false);
}

/**
 * get FilterKeys as a first step
 * 
 * @param suggestions
 * @returns 
 */
const getFilters = (suggestions) => {
    return Object.keys(suggestions);
}

/**
 * get all FilterValues. 
 * Also, handle multi-levelled hierarchies in filter values (e.g. regions/cities)
 * 
 * @param isIVolunteer 
 */
const getFilterSuggestions = (isIVolunteer: boolean, suggestions: any, filterKey) => {
    const keys = getFilters(suggestions);
    let values = {};
    if (isIVolunteer) {
        values = suggestions;
    } else {
        if (filterKey === 'regions') {
            let tempValues = {};
            for (let countryKey in suggestions[filterKey]) {
                for (let regionKey in suggestions[filterKey][countryKey]) {
                    tempValues[regionKey] = suggestions[filterKey][countryKey][regionKey]; 
                }
            }
            values = tempValues;
        } else if (filterKey === 'cities') {
            let tempValues = {};
            for (let countryKey in suggestions[filterKey]) {
                for (let regionKey in suggestions[filterKey][countryKey]) {
                    for (let cityIndex = 0; cityIndex < suggestions[filterKey][countryKey][regionKey].length; cityIndex++) {
                        tempValues[regionKey + "/" + cityIndex] = suggestions[filterKey][countryKey][regionKey][cityIndex].name; 
                    }
                }
            }
            values = tempValues;
        } else {
            values = suggestions[filterKey];
        }
    }

    return values;
}

export default FilterSuggestionPanel;