const wbApp = {};

// global variables established at initialization

//base url for the api call
wbApp.baseUrl = 'http://api.worldbank.org/v2/country';

//variable for the lastet year to get data from - currently hardcoded for 2020
wbApp.currentYear = "2020";

//array for storing the list of countries grabbed from the api
wbApp.countries = [];

//array for the country codes for the user selected countries
wbApp.selectedCountries = ["", ""];
// array for the country names
wbApp.selectedCountryNames = ["", ""];

//default indicators array - grab data for these 5 stats by default
wbApp.defaultIndicators = [
    "SP.POP.TOTL",  //total population
    "SP.DYN.LE00.IN", //life expectancy
    "NY.GDP.PCAP.CD", //gdp per capita
    "SE.ADT.LITR.ZS", //adult literacy rate
    "EN.ATM.CO2E.PC" //co2 emissions per capita
];

wbApp.countryList = function() {
    // On initialization make a call to wb to populate selector option elements 
    fetch('https://api.worldbank.org/v2/country/all/?format=json&per_page=300')
        
        .then(function(response) {           
         return response.json();
        })
        .then(function(jsonResult) { 
            // create a global variable
            // wbApp.countries = jsonResult[1];

            wbApp.countries = jsonResult[1].filter((countryObject) => {
                return countryObject.region.value != "Aggregates";
            });

            // populate selectors with names of countries
            const selector = document.querySelectorAll('select'); 
            for (let i=0;i < wbApp.countries.length; i++) {
                wbApp.createSelectOption(selector[0], i);
                wbApp.createSelectOption(selector[1], i);
            }
            // access user's selector values and retrieve country codes for api call
            selector[0].addEventListener('change', function() {
                // create global variable with user's chosen countries
                wbApp.selectedCountryNames[0] = selector[0].value 
                for (let i=0;i < wbApp.countries.length; i++) {    
                    if (wbApp.countries[i].name === selector[0].value) {
                        // create global variable with user's chosen country codes
                        wbApp.selectedCountries[0] = wbApp.countries[i].id;
                        // console.log(wbApp.selectedCountries);
                        // console.log(wbApp.selectedCountryNames)              
                    }
                }   
            });
            selector[1].addEventListener('change', function() {
                wbApp.selectedCountryNames[1] = selector[1].value 
                for (let i=0;i < jsonResult[1].length; i++) {
                    if (jsonResult[1][i].name === selector[1].value) {
                        wbApp.selectedCountries[1] = jsonResult[1][i].id; 
                        // console.log(wbApp.selectedCountries); 
                        // console.log(wbApp.selectedCountryNames)   
                    }                     
                }   
            });
              
            // grab button
            const compare = document.querySelector('button');
              
            compare.addEventListener('click', function() {
              
                
                if(wbApp.selectedCountries[0] == "" || wbApp.selectedCountries[1] == "") {
                    alert("Please select two countries to compare");
                } else {
                    wbApp.callWorldBankApi(wbApp.selectedCountries, wbApp.defaultIndicators);
                }
            });
        });
};

// function to populate selector elements with country names
wbApp.createSelectOption = function(dropdownList, countryIndex)  {   
    const option = document.createElement('option')
    option.textContent = wbApp.countries[countryIndex].name
    dropdownList.appendChild(option);
};



wbApp.displayData = function(dataArray) {
    // console.log(dataArray);
    // console.log(wbApp.selectedCountryNames)

    // get div containing the class .countryName
    const resultsACountryName = document.querySelector('.resultsA .countryName');
    // get div containing the class .indicatorData
    const resultsA = document.querySelector('.resultsA .indicatorData');

    // get first country name from global variable
    const country1Name = wbApp.selectedCountryNames[0];
    // get first nested array from api call
    const country1Results = dataArray[0];
   
    // create a <p> to display country name in
    const ResultAParagraphEl = document.createElement('p')
    // add first country to <p>
    ResultAParagraphEl.textContent = `${country1Name}`;
    // append <p> to the element with a class of .resultsA
    resultsACountryName.appendChild(ResultAParagraphEl)

    // loop through data array result and display all property keys and values 
    country1Results.forEach(function(result) { 
        // create a <p> to display country name in   
        const listEl = document.createElement('li');
        // use a template literal to display property names and values separated by a colon
        listEl.textContent = `${result.name}: ${result.value}`
        // append content to the <ul> with a class of .indicatorData as a <li> item
        resultsA.appendChild(listEl);
    });

    // How can I eliminate the redundancy ?????????????????????

    const resultsBCountryName = document.querySelector('.resultsB .countryName');
    // get div containing the class .indicatorData
    const resultsB = document.querySelector('.resultsB .indicatorData');

    const country2Name = wbApp.selectedCountryNames[1];
    const country2Results = dataArray[1];
    
    const ResultBParagraphEl = document.createElement('p')
    ResultBParagraphEl.textContent = `${country2Name}`;
    resultsBCountryName.appendChild(ResultBParagraphEl)

    country2Results.forEach(function(result) {    
        const listEl = document.createElement('li');
        listEl.textContent = `${result.name}: ${result.value}`
        resultsB.appendChild(listEl);
    });
}

//call the world bank api to get data for a selected country and indicator
wbApp.callWorldBankApi = function(countries, indicators) {
    //construct the api url
    const url = wbApp.setApiUrl(countries, indicators);
    //make the api call
    fetch(url)
        .then( function(response) {
            return response.json();
        })
        .then( function(jsonResponse) {
            //create an object that holds the values we want as properties and return it
            const processedData = wbApp.getIndicatorValues(jsonResponse, countries, wbApp.currentYear);
            console.log(processedData);
            //display the processed data using a function
            wbApp.displayData(processedData);
        });
};

//create the api url based on the selected indicator(s)
wbApp.setApiUrl = function(countryIds, indicatorIds) {
    //create a string of country IDs separated by ;
    const countryString = countryIds.join(';');
    //create a string of indicator IDs separated by ;
    const indicatorString = indicatorIds.join(';');
    //construct the api url - get the indicator values for the past 5 years, filling in any null values with the most recent value from the past five years
    const queryUrl = `${wbApp.baseUrl}/${countryString}/indicator/${indicatorString}?source=2&mrv=5&gapfill=Y&per_page=300&format=json`;
    return queryUrl;
};

//get the indicator values from the array returned by the api
//countryIsoCodes is the array of country IDs used in the api call
wbApp.getIndicatorValues = function(dataArray, countryIsoCodes, year) {
    // console.log(dataArray);
    //put the values inside an array of two arrays, one for each country
    const indicatorValues = [[], []];
    //get the latest indicator data from the api response
    const indicatorArray = dataArray[1].filter( (indicatorItem)=> {
        return indicatorItem.date == year;
    });
    // console.log(indicatorArray)
    indicatorArray.forEach( (item) => {
        const indicatorObject = {};
        indicatorObject.country = item.country.value; //This is the name of the country
        indicatorObject.countryCode = item.countryiso3code; //This is the iso code for the country - the api uses this to search for countries
        indicatorObject.name = item.indicator.value; //This is the name of the indicator in plain terms. e.g. "Population, Total"
        //check if there is a value for the indicator - set the value to n/a in the output array if the value given by the api is null
        if(item.value == null) {
            indicatorObject.value = "N/A";
        } else {
            indicatorObject.value = item.value;
        }
        
        //push the indicator data into the corresponding country array
        if (indicatorObject.countryCode == countryIsoCodes[0]) {
            indicatorValues[0].push(indicatorObject);
        } else if (indicatorObject.countryCode == countryIsoCodes[1]){
            indicatorValues[1].push(indicatorObject);
        }
    });
    return indicatorValues;
};

// setInterval (() => {

//     const randomDegree = Math.floor(Math.random() * 360 + 1) + "deg";
//     const colorArray = [ "blue","orange","purple","red","green","yellow"]
//     const randomColor1 = Math.floor(Math.random() * colorArray.length);
//     console.log(randColor1)    
//     const randomColor2 = Math.floor(Math.random() * colorArray.length);
             
//     document.querySelector('body').style.background = `linear-gradient(${randDeg}, ${colorArray[randColor1]}, ${colorArray[randColor2]})`; 
   
// }, 5000);   

// **************************************************************************


wbApp.init = function() {
    wbApp.countryList();

};

wbApp.init();
