import React, { useCallback, useEffect, useState } from 'react';
import { FilterType, getFilterType } from '../../utils';
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
            <div className={`${styles.suggestionTextValuesPanel} ${styles.filterListPanel}`}>
                 { filterList.map((filter, index) => {
                      return <FilterListElement key={index} filterName={filter} 
                                setShowFilters={setShowFilters} 
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
            <FilterSuggestions  filterKey={selectedFilter} 
                                filterValues={filterSuggestions} 
                                setNewFilterValue={newFilterCallback} 
                                setShowSuggestions={setShowSuggestions}
                                isIVolunteer={isIVolunteer}></FilterSuggestions>
        )
    }

    return(
        <>
            {
                !showFilters && !showSuggestions && filterList.length > 0
                ?   <div className={`${styles.filterElement} ${styles.addFilterBtn} ${isIVolunteer ? styles.filterElementIVol : styles.filterElementDt}`} 
                            onClick={() => displayFilters(true, setShowFilters)}>
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

const FilterListElement = ( { filterName, setShowFilters, setSelectedFilter, setShowSuggestions } ) => {
    return (
        <>
            <div className={styles.suggestionValueElement} onClick={() => selectFilterName(filterName, setShowFilters, setSelectedFilter, setShowSuggestions)}>
                {filterName}
            </div>
        </>
    );
} 

const FilterSuggestions = ( { filterKey, filterValues, setNewFilterValue, setShowSuggestions, isIVolunteer} ) => {
    const keys = Object.keys(filterValues);
    const filterType = getFilterType(filterKey);

    const dtDefaultFrom = 0.5;
    const dtDefaultTo = 1.0;
    const dtMin = 0.05;
    const dtMax = 1;
    const dtStep = 0.05;

    const iVolDefaultFrom = '2022-07-01';
    const iVolDefaultTo = '2022-08-31';
    const iVolStep = 1;

    return (
        <>
                {
                    filterType === FilterType.TEXT
                    ?   <div className={styles.suggestionsTextPanel} onClick={() => hideSuggestionPanel(setShowSuggestions)}>
                            <div className={styles.suggestionFiltername}>{filterKey}:</div>  
                            <div className={styles.suggestionTextValuesPanel}>
                                {
                                    keys.map((valueKey: string) => (
                                        <div key={valueKey} className={styles.suggestionValueElement} onClick={() => selectFilterValue(setNewFilterValue, filterKey, filterValues[valueKey], setShowSuggestions)}>{filterValues[valueKey]}</div>
                                    ))
                                }
                            </div>
                        </div>
                    :   <div className={styles.suggestionsRangePanel}>
                            <div className={styles.suggestionFiltername}>{filterKey}:</div> 
                            <div className={`${styles.suggestionRangeValuesPanel} ${isIVolunteer ? styles.suggestionRangeValuesPanelIVol : styles.suggestionRangeValuesPanelDt}`}>
                                <div className={styles.suggestionRangeFilterLine}>
                                    <div className={styles.suggestionRangeValueLabel}>From:</div>
                                    <input className={isIVolunteer ? styles.suggestionRangeValueInputIVol : styles.suggestionRangeValueInputDt} 
                                            type={isIVolunteer ? 'date' : 'number'} id='rangeFrom' 
                                            min={isIVolunteer ? iVolDefaultFrom : dtMin} 
                                            max={isIVolunteer ? iVolDefaultTo : dtMax} 
                                            step={isIVolunteer ? iVolStep : dtStep} 
                                            defaultValue={isIVolunteer ? iVolDefaultFrom : dtDefaultFrom}
                                            onChange={() => onChangeRange()}>
                                    </input>
                                </div>
                                <div className={styles.suggestionRangeFilterLine}>
                                    <div className={styles.suggestionRangeValueLabel}>To:</div>
                                    <input className={isIVolunteer ? styles.suggestionRangeValueInputIVol : styles.suggestionRangeValueInputDt} 
                                            type={isIVolunteer ? 'date' : 'number'} id='rangeTo' 
                                            min={isIVolunteer ? iVolDefaultFrom : dtMin} 
                                            max={isIVolunteer ? iVolDefaultTo : dtMax} 
                                            step={isIVolunteer ? iVolStep : dtStep} 
                                            defaultValue={isIVolunteer ? iVolDefaultTo : dtDefaultTo}
                                            onChange={() => onChangeRange()}>
                                    </input>
                                </div>
                                <button className={styles.suggestionRangeBtn} id='rangeFilterConfirm' onClick={() => confirmRangeFilter(setNewFilterValue, filterKey, setShowSuggestions)}>Confirm</button>
                            </div>
                        </div>
                }
        </>
    );  
}

const displayFilters = (showFilters, setShowFilters: any) => {
    setShowFilters(showFilters);
}

const selectFilterName = (filterName, setShowFilters, setSelectedFilter, setShowFilterSuggestions) => {
    setShowFilters(false);
    setSelectedFilter(filterName);
    setShowFilterSuggestions(true);
}

const selectFilterValue = (setNewFilterValue, filterKey, filterValue, setShowSuggestions) => {
    setNewFilterValue({
        "key": filterKey,
        "value": filterValue
    });

    setShowSuggestions(false);
}

const hideSuggestionPanel = (setShowFilterSuggestions) => {
    setShowFilterSuggestions(false);
}

/**
 * get all FilterValues. 
 * Also, handle multi-levelled hierarchies in filter values (e.g. regions/cities)
 * 
 * @param isIVolunteer 
 */
const getFilterSuggestions = (isIVolunteer: boolean, suggestions: any, filterKey: string) => {
    const filterType = getFilterType(filterKey);
    
    let values = {};
    if (isIVolunteer) {
        if (filterType === FilterType.TEXT) {
            values = suggestions[filterKey].properties;
        }
    } else {
        if (filterType === FilterType.TEXT) {
            if (filterKey === 'country') {
                let tempValues = {};
                for (let continentKey in suggestions[filterKey].properties) {
                    for (let countryKey in suggestions[filterKey].properties[continentKey]) {
                        tempValues[countryKey] = suggestions[filterKey].properties[continentKey][countryKey]; 
                    }
                }
                values = tempValues;
            } else if (filterKey === 'region') {
                let tempValues = {};
                for (let continentKey in suggestions[filterKey].properties) {
                    for (let countryKey in suggestions[filterKey].properties[continentKey]) {
                        for (let regionKey in suggestions[filterKey].properties[continentKey][countryKey]) {
                            tempValues[regionKey] = suggestions[filterKey].properties[continentKey][countryKey][regionKey]; 
                        }
                    }
                }
                values = tempValues;
            } else if (filterKey === 'city') {
                let tempValues = {};
                for (let continentKey in suggestions[filterKey].properties) {
                    for (let countryKey in suggestions[filterKey].properties[continentKey]) {
                        for (let regionKey in suggestions[filterKey].properties[continentKey][countryKey]) {
                            for (let cityIndex = 0; cityIndex < suggestions[filterKey].properties[continentKey][countryKey][regionKey].length; cityIndex++) {
                                tempValues[regionKey + "/" + cityIndex] = suggestions[filterKey].properties[continentKey][countryKey][regionKey][cityIndex].name; 
                            }
                        }
                    }
                }
                values = tempValues;
            } else {
                values = suggestions[filterKey].properties;
            }
        }
    }

    return values;
}

const onChangeRange = () => {
    $('#rangeFilterConfirm').prop('disabled', true);

    let from = $('#rangeFrom').val();
    let to = $('#rangeTo').val();

    // enable button when both fields are filled and from < to
    if (from !== '' && to !== '') {
        if (from < to || from === to) {
            $('#rangeFilterConfirm').prop('disabled', false);
        }
    }
}

const confirmRangeFilter = (setNewFilterValue: any, filterKey: string, setShowSuggestions: any) => {
    let from = $('#rangeFrom').val();
    let to = $('#rangeTo').val();

    // confirm only works when both fields are filled and from < to
    if (from !== '' && to !== '') {
        if (from < to || from === to) {
            setNewFilterValue({
                "key": filterKey,
                "value": [from, to]
            });
            setShowSuggestions(false);
        }
    }
}

export default FilterSuggestionPanel;