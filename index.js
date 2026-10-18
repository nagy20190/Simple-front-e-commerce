//? api url for products
const API_URL = 'https://dummyjson.com/products';

//? dom elements
let loading = document.getElementById("loading");
let errorMessage = document.getElementById("errorMessage");
let prds = document.getElementById('productsContainer');
const minPrice = document.getElementById("minPrice");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const maxPrice = document.getElementById("maxPrice")
const sortBy = document.getElementById("sortBy")
const sortOrder = document.getElementById("sortOrder")


let products = [];
let filteredProducts = [];

//? XMLHttpRequest Helper fun
function sendRequest(method, url, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response =
                    xhr.responseText ? JSON.parse(xhr.responseText) : null;

                callback(null, response);
            } else {
                callback("Request status failed" + xhr.status, null);
            }
        }
    }
    xhr.onerror = function () {
        callback("Network error", null);
    }
    xhr.send(data ? JSON.stringify(data) : null);   // always send
}
//? loading functions
function showLoading() {
    loading.classList.remove("d-none");
}

function hideLoading() {
    loading.classList.add("d-none");
}

//? error functions
function showError(message) {
    errorMessage.innerText = message;
    errorMessage.classList.remove("d-none");
}

function hideError() {
    errorMessage.classList.add("d-none");
}

function getProducts() {
    //? first show loading
    showLoading();
    sendRequest("GET", API_URL, null, function (err, data) {
        //? after finish request, hide loading
        hideLoading()
        if (err) {
            //? if there is loading, show errors
            showError(err);
            return;
        }
        products = data.products;
        filteredProducts = products.slice();
        createCategory();
        renderProducts();
    })
}

getProducts();

//? Display products
function renderProducts() {
    prds.innerHTML = '';
    if (filteredProducts.length === 0) {
        prds.innerHTML = `
            <div class="col-12">
                <h2> not data found </h2>
            </div>
        `;
    } else {
        for (let i = 0; i < filteredProducts.length; i++) {
            prds.innerHTML += `
                <div class="col-12 col-md-4 col-lg-3">
                    <div class="card" style="width: 18rem;">
                    <img class="card-img-top" src="${filteredProducts[i].thumbnail}" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">${filteredProducts[i].title}</h5>
                        <p class="card-text description"> ${filteredProducts[i].description} </p>
                        <span class="rating-stars">${'★'.repeat(Math.round(filteredProducts[i].rating))}</span>
                        <p class="card-text">$${filteredProducts[i].price}</p>
                        <a href="#" class="btn btn-primary">View details</a>
                    </div>
                </div>
                </div>
            `;
        }
    }
}

//? create categories
function createCategory() {
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`
    const categories = [];
    for (let i = 0; i < products.length; i++) {
        const category = products[i].category;
        if (!categories.includes(category)) {
            categories.push(category);
        }
    }
    categories.sort();
    for (let i = 0; i < categories.length; i++) {
        categoryFilter.innerHTML += `<option value="${categories[i]}">${categories[i]}</option>`
    }
}

//! search and filter
function applyFilters() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value;
    const min = Number(minPrice.value) || 0;
    const max = Number(maxPrice.value) || Infinity;
    //! filter
    filteredProducts = products.filter(function (product) {
        //? search
        const matchSearch = product.title.toLowerCase().includes(searchValue);
        // category
        const matchedCategory = categoryValue === "all" ||
            product.category == categoryValue;
        // price
        const matchedPrice = product.price >= min && product.price <= max;

        return matchSearch && matchedCategory && matchedPrice;
    });
    // sort
    const sortValue = sortBy.value;
    const order = sortOrder.value;
    if (sortValue !== "default") {
        filteredProducts.sort(function (a, b) {
            let valueA = a[sortValue];
            let valueB = b[sortValue];

            if (typeof valueA === "string") {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            if (valueA > valueB) {
                return order === 'asc' ? 1 : -1; //? callback function sort method
            }
            if (valueA < valueB) {
                return order === 'asc' ? -1 : 1;
            }
            return 0;
        });
    }
    renderProducts();
}

searchInput.addEventListener('input', applyFilters)
minPrice.addEventListener('input', applyFilters)
maxPrice.addEventListener('input', applyFilters)
categoryFilter.addEventListener('change', applyFilters)
sortBy.addEventListener('change', applyFilters)
sortOrder.addEventListener('change', applyFilters)


//? reset form
function resetFilter() {
    searchInput.value = "";
    categoryFilter.value = "all";
    minPrice.value = ""
    maxPrice.value = ""
    sortBy.value = "default"
    sortOrder.value = "asc"
    filteredProducts = products.slice();
    renderProducts()
}