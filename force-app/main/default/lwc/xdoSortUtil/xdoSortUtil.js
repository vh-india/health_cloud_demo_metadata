const sortData = (data, sortDirection, fieldName) => {
    // console.log('inside sort util');
    if(sortDirection === 'DESC' || sortDirection === 'DESCENDING'){
        return sortDescending(data, fieldName);
    } else {
        return sortAscending(data, fieldName); 
    }
};

const sortAscending = (data, fieldName) => {
    function compare(a, b){
        let valueA;
        let valueB;
        if(fieldName){
            valueA = a[fieldName];
            valueB = b[fieldName];
        } else {
            valueA = a;
            valueB = b;
        }

        //console.log('typeof valueA: ' + typeof valueA + ' typeof valueB: ' + typeof valueB);

        let comparison = 0;
        
        if(valueA !== null && typeof valueA !== 'undefined' && valueB !== null && typeof valueB !== 'undefined'){
            let isDate = false;
            if(typeof valueA === 'string' && valueA.includes('-')){
                isDate = true;
            }

            let isNaN = Number.isNaN(parseFloat(valueA));

            if(isNaN === false && isDate === false){
                comparison = valueA - valueB;
            }
            else{
                if(valueA > valueB){
                    comparison = 1;
                }
                else if(valueA < valueB){
                    comparison = -1;
                }
            }
        }
        else if((valueA === null || typeof valueA === 'undefined') && valueB !== null && typeof valueB !== 'undefined'){
            comparison = 1;
        }
        else if(valueA !== null && typeof valueA !== 'undefined' && (valueB === null || typeof valueB === 'undefined')){
            comparison = -1;
        }
        
        return comparison;
    }
    
    data.sort(compare);
    return data;
};

const sortDescending = (data, fieldName) => {
    function compare(a, b){
        let valueA;
        let valueB;
        if(fieldName){
            valueA = a[fieldName];
            valueB = b[fieldName];
        } else {
            valueA = a;
            valueB = b;
        }
    
        let comparison = 0;
    
        if(valueA !== null && typeof valueA !== 'undefined' && valueB !== null && typeof valueB !== 'undefined'){
            let isDate = false;
            if(typeof valueA === 'string' && valueA.includes('-')){
                isDate = true;
            }

            let isNaN = Number.isNaN(parseFloat(valueA));

            if(isNaN === false && isDate === false){
                comparison = valueB - valueA;
            }
            else{
                if(valueB > valueA){
                    comparison = 1;
                }
                else if(valueB < valueA){
                    comparison = -1;
                }
            }
        }
        else if((valueA === null || typeof valueA === 'undefined') && valueB !== null && typeof valueB !== 'undefined'){
            comparison = 1;
        }
        else if(valueA !== null && typeof valueA !== 'undefined' && (valueB === null || typeof valueB === 'undefined')){
            comparison = -1;
        }
        
        return comparison;
    }
    
    data.sort(compare);
    return data;
}

export { sortData };