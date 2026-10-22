//& Single Responsibilty 

//? api url for products
const API_URL = "http://localhost:2000/products";

//? Dom Elements //////////////////////////////////////
const prds = document.getElementById("ProductsContainer");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const sortBy = document.getElementById("sortBy");
const sortOrder = document.getElementById("sortOrder");

//? variables ///////////////////////////////////////////
let products = [];
let filteredProducts = [];
//? XMLHttpRequest Helper Fun
/**
 * CRUD
 * c -> create "post"
 * r -> Read "get"
 * u -> update "put | patch"
 * d -> delete "delete"
 *
 */
function sendRequest(method, url, data, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        callback(null, response);
      } else {
        callback("Request status failed" + xhr.status, null);
      }
    }
  };
  xhr.onerror = function () {
    callback("Network error", null);
  };
  if (data) {
    xhr.send(JSON.stringify(data));
  } else {
    xhr.send();
  }
}

//^ Single Responsibility --> every fun make only one job

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

//? get req
function getProducts() {
  showLoading();
  hideError();
  sendRequest("GET", API_URL, null, function (error, data) {
    hideLoading();
    if (error) {
      showError(error);
      return;
    }
    products = data;
    filteredProducts = products.slice();
    createCategories();
    renderProducts();
  });
}

window.onload = function () {
  getProducts();
};

//? display prds
function renderProducts() {
  prds.innerText = "";

  if (filteredProducts.length === 0) {
    prds.innerHTML = `
        <div class="col-12">
        <h2 class="alert alert-warning text-center">
        No Products Found
        </h2>
        </div>
        `;
    return;
  }

  for (let i = 0; i < filteredProducts.length; i++) {
    const products = filteredProducts;
    prds.innerHTML += `
         <div class="col-12 col-md-4 col-lg-3">
         <div class="card product-card" >
        <img src="${products[i].thumbnail}" class="card-img-top product-image" alt="...">
        <div class="card-body">
            <h5 class="card-title">${products[i].title}</h5>
            <span class="badge bg-secondary mb-2">${products[i].category}</span>
            <p class="card-text description">${products[i].description}</p>
            <div class="mb-2 fw-bold">${products[i].price}</div>
            <div class="mb-2">
               <span class="rating">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
                </svg>
               ${products[i].rating}
               </span>
            </div>
            <div class="mb-2">
              <button class=" btn btn-danger btn-sm" onclick="deleteProduct(${products[i].id})">Del</button>
               <button class=" btn btn-success btn-sm" onclick="showDetails(${products[i].id})">See More</button>
               <button class="btn btn-warning btn-sm" onclick="openEditModel(${products[i].id})">Edit</button>
            </div>
        </div>
        </div>
         </div>
        `;
  }
}

//? createCategories
function createCategories() {
  categoryFilter.innerHTML = `
  <option value="all">All Categories </span>
  `;
  const categories = [];
  for (let i = 0; i < products.length; i++) {
    const category = products[i].category;
    if (!categories.includes(category)) {
      categories.push(category);
    }
  }
  categories.sort();
  for (let i = 0; i < categories.length; i++) {
    categoryFilter.innerHTML += `
    <option value = "${categories[i]}" >${categories[i]}</option>
    `;
  }
}

//? search filter sort
function applyFilters() {
  const searchValue = searchInput.value.toLowerCase().trim();
  const categoryValue = categoryFilter.value;
  const min = Number(minPrice.value) || 0;
  const max = Number(maxPrice.value) || Infinity;
  // filter
  filteredProducts = products.filter(function (product) {
    // search
    const matchedSearch = product.title.toLowerCase().includes(searchValue);
    // category
    const matchedCategory =
      categoryValue === "all" || product.category === categoryValue;
    // price
    const matchedPrice = product.price >= min && product.price <= max;

    return matchedSearch && matchedCategory && matchedPrice;
  });
  // Sort
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

      if (valueA < valueB) {
        return order === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  }
  renderProducts();
}

searchInput.addEventListener("input", applyFilters);
minPrice.addEventListener("input", applyFilters);
maxPrice.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
sortBy.addEventListener("change", applyFilters);
sortOrder.addEventListener("change", applyFilters);

//? reset form
function resetFilter() {
  searchInput.value = "";
  categoryFilter.value = "all";
  minPrice.value = "";
  maxPrice.value = "";
  sortBy.value = "default";
  sortBy.value = "asc";
  renderProducts();
  applyFilters();
}

//? delete by id
function deleteProduct(id) {
  const conf = confirm("Are you sure you really want to delete this product?");
  if (!conf) {
    return;
  }
  sendRequest("DELETE", `${API_URL}/${id}`, null, function (error, deletedPrd) {
    if (error) {
      showError(error);
      return;
    }
    products = products.filter((p) => p.id !== id);
    // getProducts()
    createCategories();
    applyFilters();
    alert("Product deleted successfully");
  });
}


//? show product details
function showDetails(id) {
  sendRequest("GET", `${API_URL}/${id}`, null, function (error, product) {
    if (error) {
      showError(error);
      return;
    }
    // console.log(product);
    document.getElementById("detailsTitle").innerText = product.title;
    document.getElementById("detailsBody").innerHTML = `
      <div class="row">
         <div class="col-md-5">
          <img src="${product.thumbnail}" class="img-fluid" alt="${product.id}"/>
         </div>
         <div class="col-md-7">
           <h3>${product.title}</h3>
         </div>
      </div>
    `;
    const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
    modal.show();
  });
}


//? open from bootstrap
function openModel() {
  const modal = new bootstrap.Modal(document.getElementById("productModal"));
  modal.show();
}
//? open add model
function openAddModal() {
  document.getElementById("productForm").reset();
  document.getElementById("modelTitle").innerText = "Add Product";
  openModel()
 
}
//? open edit modal
function openEditModel(id){
 const product = products.find(p=>p.id === id);
 if(!product){
  return;
 }
 document.getElementById("productId").value=product.id;
 document.getElementById("title").value=product.title;
 document.getElementById("price").value=product.price;
  //  const modal = new bootstrap.Modal(document.getElementById("productModal"));
  // modal.show();
  openModel()
}
//? close product modal
function closeProductModal(){
  const modalElement = document.getElementById("productModal")
  const modal = bootstrap.Modal.getInstance(modalElement)
  if(modal){
    modal.hide()
  }
}

//? Save Product 
function saveProduct(){
  const id = document.getElementById("productId").value
  const productData={
    title:document.getElementById("title").value,
    price:Number( document.getElementById("price").value)
  }
  if(id){
    updateProduct(id,productData)
  }else{
    createProduct(productData)
  }
  
}
//? Create New Product
function createProduct(data){
  sendRequest("POST",API_URL,data,function(error,newProduct){
    if(error){
      showError(error)
      return;
    }
    products.unshift(newProduct)
    createCategories()
    applyFilters()
    closeProductModal()
    alert("New Product is Added")
  })
}
//? Edit Product
function updateProduct(id,data){
  sendRequest("PUT",`${API_URL}/${id}`,data,function(error,updatedProduct){
    if(error){
      showError(error);
      return;
    }
    const index = products.findIndex(p=>p.id===id)
    if(index !== -1){
      products.splice(index,1,updateProduct)

    }
    createCategories();
    applyFilters();
    closeProductModal();
    alert("Product Updated Successfully")
  })
}