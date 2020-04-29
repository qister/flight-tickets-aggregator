const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = document.querySelector('.input__cities-from'),
    dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
    inputDateDepart = document.querySelector('.input__date-depart'),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets'),
    cheapestTicketSky = document.getElementById('cheapest-ticket-sky');


const citiesApi = 'database/cities.json',
    citiesApiFull = 'https://api.travelpayouts.com/data/ru/cities.json'
    myProxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = 'adaf6ec8a9a81280f60cff61273b90c6',
    calendar = 'https://min-prices.aviasales.ru/calendar_preload',
    MAX_COUNT = 10;

let city = [];

//skyscanner

let cityFromId;
let cityFromName = [];
let cityFromNameRu = [];
let cityToId;
let cityToName = [];
let cityToNameRu = [];
let minPrice;
let skyFetchDate;
let dateSkyFrom;
let cheapestCarrierName;
let direct;


//
// const getSkyFlights = (callback) => {
// 	const request = new XMLHttpRequest();
// 	request.withCredentials = true;

// 	request.addEventListener('readystatechange', () => {
// 			if (request.readyState !== 4) return;

// 			if (request.status === 200) {
// 				callback(request.response)
// 			} else {
// 				console.log(request.status);
// 			}

// 		});

// 	request.open("GET", "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/RU/RUB/en-US/MOSC-sky/JFK-sky/2020-09-01");
// 	request.setRequestHeader("x-rapidapi-host", "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com");
// 	request.setRequestHeader("x-rapidapi-key", "be4393eccamsh39d62f04ce5e4f8p1492acjsnfbbd8746a9b8");



// 	request.send(data);
// }

//Aviasales

const getData = (url, callback, reject = console.error) => {
    const request = new XMLHttpRequest();

    request.open('GET', url);

    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return;

        if (request.status === 200) {
            callback(request.response)
        } else {
            reject(request.status);
        }

    });

    request.send();

};

const showCity = (input, list) => {
    list.textContent = ''; 

    if (input.value !== '') {      

        const filterCity = city.filter((item) => {
            
                const fixItem = item.name.toLowerCase();
                return fixItem.startsWith(input.value.toLowerCase());

            });

            filterCity.forEach((item) => {
                const li = document.createElement('li');
                li.classList.add('dropdown__city');
                li.textContent = item.name;
                list.append(li);
            });
    }
};

const selectCity = (event, input, list) => {

    const target = event.target;

    if (target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;
        list.textContent = '';
    }
};

const getNameCity = (code) => {
    const objCity = city.find((item) => item.code === code);
    return objCity.name;
    
};

const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
    } else {
        return 'Без пересадок'
    }
};

const getLinkAviasales = (data) => {
    let link = 'https://www.aviasales.ru/search/'
    link += data.origin
    const date = new Date(data.depart_date);
    const day = date.getDay();
    const month = date.getMonth() + 1;
    link += day < 10 ? '0' + day : day;
    link += month < 10 ? '0' + month : month;
    link += data.destination;
    link += '1';
    return link;
};

const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if (data) {
        deep = `
        <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href="${getLinkAviasales(data)}" target="blank" class="button button__buy">Купить
                    за ${data.value}₽</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)}</div>
                </div>

                <div class="block-right">
                    <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    } else {
        deep = '<h3>Извините, на эту дату билетов нет</h3>'
    }


    ticket.insertAdjacentHTML('afterbegin', deep)

    return ticket;
};

const renderCheapDay = (cheapTicket) => {

    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет от Aviasales</h2>';

    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);
    
    
};

const renderCheapYear = (cheapTickets) => {

    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

    cheapTickets.sort((a, b) => {
        if (a.value > b.value) {
          return 1;
        }
        if (a.value < b.value) {
          return -1;
        }
        // a должно быть равным b
        return 0;
      });

      for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
          const ticket = createCard(cheapTickets[i]);
          otherCheapTickets.append(ticket);
      }
 
};

const renderCheap = (data, date) => {

    const cheapTicketYear = JSON.parse(data).best_prices;
    const cheapTicketDay = cheapTicketYear.filter((item) => {
        return item.depart_date === date;
    });  

    renderCheapDay(cheapTicketDay);
    // renderCheapYear(cheapTicketYear);


}

//skyScanner

const getSkyCityIdByName = async (query) => {
    
    let result = [];

	await fetch(`${myProxy}https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${query}`, {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
		"x-rapidapi-key": "be4393eccamsh39d62f04ce5e4f8p1492acjsnfbbd8746a9b8"
	}
	})
	.then((response) => {	
		return response.json();
	})
	.then(function(data){
        result.push(data.Places[0].CityId);
	})
	.catch(err => {
		console.log(err);
	});

	return result;
}

const getSkyMinPrice = async (fromId, toId) => {
	

	await fetch(`${myProxy}https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/RUB/en-US/${fromId}/${toId}/${skyFetchDate}?`, {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
		"x-rapidapi-key": "be4393eccamsh39d62f04ce5e4f8p1492acjsnfbbd8746a9b8"
	}
	})
	.then(response => {
		return response.json();
	})
	.then(function(data){
        
        const temporary = sortPrices(data);
		minPrice = temporary[0].MinPrice;
        dateSkyFrom = temporary[0].OutboundLeg.DepartureDate;  

        //direct or not
        direct = temporary[0].Direct;
        
        //carrier name search
        const cheapestCarrierId = temporary[0].OutboundLeg.CarrierIds[0];
        const cheapestCarrier = data.Carriers.find(item => item.CarrierId === cheapestCarrierId);
        cheapestCarrierName = cheapestCarrier.Name;
        
	})
	.catch(err => {
		console.log(err);
	});
};

const sortPrices = (data) => {
	let prices = data.Quotes;
	prices.sort(function (a, b) {
        if (a.MinPrice > b.MinPrice) {
          return 1;
        }
        if (a.MinPrice < b.MinPrice) {
          return -1;
        }
        // a должно быть равным b
        return 0;
	  });
	return prices;

}

const renderSkyCheapDay = () => {

    cheapestTicketSky.style.display = 'block';
    cheapestTicketSky.innerHTML = '<h2>Самый дешевый билет от SkyScanner</h2>';

    const ticket = createSkyCard();
    cheapestTicketSky.append(ticket);
    
    
};

const createSkyCard = () => {
	const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if (minPrice !== undefined) {
        deep = `
        <h3 class="agent">${cheapestCarrierName}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href="${getSkyLink(cityFromId, cityToId, dateSkyFrom)}" target="blank" class="button button__buy">Купить
                    за ${minPrice}₽</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${cityFromNameRu[0]}</span>
                    </div>
                    <div class="date">${getDate(dateSkyFrom)}</div>
                </div>

                <div class="block-right">
                    <div class="changes">${direct === true ? 'Без пересадок': 'С пересадками, количество неизвестно'}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${cityToNameRu[0]}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    } else {
        deep = '<h3>Извините, на эту дату билетов нет</h3>'
    }


    ticket.insertAdjacentHTML('afterbegin', deep)

    return ticket;
}

const selectSkyCity = (event, input, list, writeToEnName, writeToRuName) => {

    const target = event.target;

    if (target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;


        const skyCity = city.find((item) =>{
            return input.value === item.name;
        })
        list.textContent = '';

        writeToRuName[0] = skyCity.name;
        writeToEnName[0] = skyCity.name_translations.en;    
    }
};

const getSkyLink = (fromId, toId, dateFrom) => {
	//   mosc/jfk/200901/
    let link = 'https://www.skyscanner.ru/transport/flights/'
	link += cityFromId.slice(0, -4) + '/';
	link += cityToId.slice(0, -4) + '/';
	const date = new Date(dateSkyFrom);
	const year = date.getFullYear();
	const day = date.getDay();
	const month = date.getMonth() + 1;
	link += String(year).slice(0, -2);
	link += month < 10 ? '0' + month : month;
	link += day < 10 ? '0' + day : day;
	link += '/';

	return link;
	
}
//Обработчики

//aviasales
inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', (event) => {
    selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', (event) => {
    selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener('submit', (event) => {
    event.preventDefault();

    
    

    const cityFrom = city.find((item) => inputCitiesFrom.value === item.name);
    const cityTo = city.find((item) => inputCitiesTo.value === item.name);

    const formData = {
        from: cityFrom,
        to: cityTo,
        when: inputDateDepart.value,
    };

    skyFetchDate = formData.when;


    
    if (formData.to && formData.from){
        const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true&token=${API_KEY}`;
        getData(calendar + requestData, (response) => {
            renderCheap(response, formData.when);
            common();
        }, error => {
            alert('В этом направлении нет рейсов');
            console.log('Ошибка', error);
            
        });
    } else {
        alert('Введите название города верно');
    };
});


//skyscanner
dropdownCitiesFrom.addEventListener('click', (event) => {
    selectSkyCity(event, inputCitiesFrom, dropdownCitiesFrom, cityFromName, cityFromNameRu);
});

dropdownCitiesTo.addEventListener('click', (event) => {
    selectSkyCity(event, inputCitiesTo, dropdownCitiesTo, cityToName, cityToNameRu);
});

// вызовы функций

getData(myProxy + citiesApiFull, (data) => {
        city = JSON.parse(data).filter(item =>  item.name);
    
        city.sort(function (a, b) {
            if (a.name > b.name) {
              return 1;
            }
            if (a.name < b.name) {
              return -1;
            }
            // a должно быть равным b
            return 0;
          });
    });

const common = () => {

    getSkyCityIdByName(cityFromName)
        .then(result => {
            cityFromId = result[0];
        })
        .then(() => getSkyCityIdByName(cityToName))
        .then(result => {
            cityToId = result[0];
        })
        .then(() => getSkyMinPrice(cityFromId, cityToId))
        .then(() => renderSkyCheapDay())
    };
    